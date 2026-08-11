# Sesión y login

## Piezas

| Archivo                                                                        | Rol                                                                                                  |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| [auth/auth.service.ts](../refuerzo-apiv2/src/auth/auth.service.ts)             | Valida el correo y la contraseña, firma el JWT y guarda la sesión en `Tokens`.                       |
| [auth/auth.guard.ts](../refuerzo-apiv2/src/auth/auth.guard.ts)                 | Revisa el token en cada petición.                                                                    |
| [lib/auth.ts](../refuerzo-web/lib/auth.ts)                                      | La configuración de NextAuth v5 con el proveedor de credenciales.                                    |
| [lib/api.ts](../refuerzo-web/lib/api.ts)                                        | La instancia de axios contra la API.                                                                 |
| [services/auth.service.ts](../refuerzo-web/services/auth.service.ts)            | Registra el interceptor que le pega el token a cada petición.                                        |
| [lib/axios-interceptor.ts](../refuerzo-web/lib/axios-interceptor.ts)            | Otro interceptor que hace prácticamente lo mismo. Ver el riesgo del final.                           |
| [app/dashboard/layout.tsx](../refuerzo-web/app/dashboard/layout.tsx)            | El guard del panel: manda al login si no hay sesión, y al formulario de activación si la cuenta está inactiva. |
| [components/Auth/UpdateRequiredForm.tsx](../refuerzo-web/components/Auth/UpdateRequiredForm.tsx) | El formulario obligatorio de activación.                                          |

## Los pasos del login

1. La persona escribe correo y contraseña en la pantalla de inicio.
2. NextAuth llama a `authorize()`, que hace `POST /auth/login` contra la API.
3. La API busca el usuario por correo y compara la contraseña con `bcrypt`.
4. Si todo cuadra, arma un payload con `id`, `email`, `role`, `name`, `image` e
   `idDependingRole`, y lo firma como JWT con vencimiento de **2 horas**.
5. Después le saca un hash de bcrypt a ese JWT y guarda **los dos** en la
   colección `Tokens`: el JWT en el campo `token` y el hash en el campo `hash`.
6. Le devuelve a la web **el hash**, junto con los datos básicos del usuario
   (nombre, correo, nombre del rol, imagen y si está activo).
7. NextAuth guarda ese hash en su propia sesión, también de 2 horas, y crea la
   cookie del navegador.
8. De ahí en adelante, un interceptor de axios le pega ese hash como
   `Authorization: Bearer ...` a cada petición.

## El token que viaja no es el JWT

Este es el detalle más raro de toda la autenticación, y conviene entenderlo
antes de tocar cualquier cosa de sesión.

Lo que el navegador guarda y manda **no es un JWT**. Es el hash de bcrypt de un
JWT. Es decir, es una cadena tipo `$2a$10$...` que por sí sola no significa
absolutamente nada y no se puede decodificar.

El JWT de verdad nunca sale del servidor: se queda en el campo `token` del
documento de `Tokens`.

Entonces, cuando llega una petición, el guard hace esto:

1. Agarra el valor del header `Authorization`.
2. Busca en `Tokens` el documento cuyo campo `hash` sea exactamente ese valor.
3. Del documento encontrado saca el campo `token`, que ahí sí es el JWT real.
4. Verifica ese JWT contra el secreto `JWT` y saca el payload.

En otras palabras, el token del cliente funciona más que todo como una **llave
de búsqueda** en la base de datos, no como una credencial que se pueda validar
por sí sola.

Eso tiene dos consecuencias prácticas que hay que tener presentes:

- **Cada petición pega a Mongo.** No hay forma de validar la sesión sin ir a
  buscar el documento. Es decir, no es una autenticación sin estado.
- **No se puede leer el token para depurar.** Pegarlo en jwt.io no sirve de
  nada. Si hay que ver qué trae la sesión, toca buscar el documento en `Tokens`
  y decodificar el campo `token`.

## Qué pasa con una cuenta recién creada

Todas las cuentas nacen con `isActive` en `false`. Eso incluye a los alumnos que
vienen de una postulación, y a los tutores, profesores y recomendadores que crea
el admin.

Entonces, la primera vez que esa persona entra:

1. El login funciona normal y la sesión se crea sin problema.
2. `app/dashboard/layout.tsx` revisa `user.isActive`. Como está en `false`, en
   lugar del panel renderiza `UpdateRequiredForm`.
3. Ese formulario obliga a hacer tres cosas: subir o tomarse una foto de perfil,
   poner un teléfono de 8 dígitos y definir una contraseña nueva.
4. Al terminar, la web sube la imagen a `POST /images` y después llama a
   `PATCH /profile/me`.
5. La API guarda la imagen, el teléfono y la contraseña, y de paso pone
   `isActive` en `true`.
6. Si el rol es `alumno`, además arranca la creación del registro de alumno. Eso
   está explicado en [Postulación](postulacion.md).
7. La web cierra la sesión a propósito y le pide a la persona que vuelva a
   entrar.

El paso 7 es importante: se cierra sesión porque la sesión vieja todavía lleva
`isActive: false` adentro y no se refresca sola. Sin ese `signOut`, la persona
se quedaría dando vueltas en el formulario de activación aunque su cuenta ya
esté activa.

Hay que tener presente que `updateProfile` pone `isActive = true`
**incondicionalmente**, sin revisar nada. Es decir, cualquier llamada exitosa a
`PATCH /profile/me` activa la cuenta, aunque venga con el cuerpo vacío.

## Auditoría de accesos

Cada login exitoso deja un registro en `LoginAudit` con el usuario, el correo, el
tipo de dispositivo, el navegador y el país. El país sale de la IP y el
dispositivo del user-agent.

Solo se guardan **los últimos 3** por usuario: después de insertar, el servicio
busca el cuarto registro más viejo y borra de ahí para atrás.

Esto corre en segundo plano y con su propio `try/catch`, así que si la auditoría
falla el login igual funciona. Eso es a propósito.

## Riesgo conocido: no hay cierre de sesión del lado de la API

Cuando alguien cierra sesión en la web, lo que pasa es que NextAuth borra su
cookie. Nada más.

El documento de `Tokens` sigue existiendo en Mongo tal cual, y el JWT que tiene
adentro sigue siendo válido hasta que se venza por tiempo. Es decir, si alguien
copió ese hash antes de cerrar sesión, lo puede seguir usando durante lo que
quede de las 2 horas.

Además, como nunca se borra nada, **la colección `Tokens` crece para siempre**.
Un documento nuevo por cada login, de cada usuario, desde que el sistema existe.
Hoy no molesta porque el volumen es bajo, pero cada petición autenticada hace una
búsqueda contra esa colección, así que a la larga sí importa.

### Posible solución

Lo mínimo sería un endpoint de logout que borre el documento de `Tokens`, y que
la web lo llame antes del `signOut`.

Aparte de eso, convendría un índice TTL sobre `createdAt` que limpie solo los
documentos de más de 2 horas, ya que de todas formas el JWT que guardan ya no
sirve. Con eso la colección se mantendría sola.

## Riesgo conocido: hay dos interceptores de axios

Hoy existen dos archivos que le pegan el token a la misma instancia de axios:

- [services/auth.service.ts](../refuerzo-web/services/auth.service.ts) registra
  uno al importarse el módulo. Es decir, se registra solo, como efecto de lado.
- [lib/axios-interceptor.ts](../refuerzo-web/lib/axios-interceptor.ts) expone un
  `setupAxiosInterceptor()` que hace prácticamente lo mismo, pero con una
  bandera para no registrarse dos veces.

Los dos hacen `getSession()` y escriben el mismo header, así que el resultado
final es el mismo y por eso no se nota. El problema es que si los dos llegan a
estar activos, cada petición termina pidiendo la sesión dos veces sin necesidad.

Y lo más incómodo es el que se registra al importar el módulo: eso significa que
el comportamiento depende de si alguien importó `auth.service.ts` en algún lado,
lo cual no se ve leyendo el código de la pantalla.

### Posible solución

Dejar uno solo. Lo más limpio sería quedarse con `setupAxiosInterceptor()`,
llamarlo explícitamente una vez en el layout raíz, y quitarle a
`auth.service.ts` el bloque que se registra solo.

## Riesgo conocido: el login parece roto sin reCAPTCHA

En [LoginForm.tsx](../refuerzo-web/components/Login/LoginForm.tsx), el submit
primero hace `signIn()` y **después** revisa `executeRecaptcha`.

Si el script de Google no cargó, sea porque la site key está vacía o porque el
dominio no está autorizado, entonces `executeRecaptcha` queda `undefined`, se
lanza el error, sale un toast rojo y nunca se ejecuta el `router.push`.

Lo confuso es que la sesión **sí quedó creada**. Es decir, la persona ve un
error pero realmente ya está adentro, y si recarga la página entra sin problema.

Para desarrollo local, hay que registrar `localhost` como dominio permitido en la
consola de reCAPTCHA v3.
