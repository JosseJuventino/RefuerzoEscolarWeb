# Postulación

Este es el flujo más largo del sistema y el que toca más colecciones. Va desde
que un recomendador llena el formulario hasta que el estudiante aparece en la
lista de asistencia de su sección.

## Piezas

| Archivo                                                                                                | Rol                                                                                        |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| [app/formulario/page.tsx](../refuerzo-web/app/formulario/page.tsx)                                     | El formulario que llena el recomendador.                                                     |
| [postulante/service/postulante.service.ts](../refuerzo-apiv2/src/postulante/service/postulante.service.ts) | Crea el postulante y dispara la creación del usuario.                                   |
| [users/users.service.ts](../refuerzo-apiv2/src/users/users.service.ts)                                 | `createAlumno()` crea la cuenta, y `updateProfile()` la activa.                              |
| [alumno/service/alumno.service.ts](../refuerzo-apiv2/src/alumno/service/alumno.service.ts)             | Crea el registro de alumno y lo mete a las secciones.                                        |
| [app/dashboard/applicants/page.tsx](../refuerzo-web/app/dashboard/applicants/page.tsx)                 | La pantalla donde el admin ve todas las postulaciones.                                       |

## Los pasos completos

### 1. El recomendador llena el formulario

Entra a `/formulario` y llena nombre, correo, dirección, teléfono, teléfono del
encargado, grado y programa.

Hay que tener presente que **este formulario no es público**. La página revisa la
sesión de NextAuth y, si no hay, manda a la pantalla de inicio. Y del lado de la
API, `POST /postulantes` pide el recurso `postulantes` con scope `edit`.

Es decir, el enlace que se comparte por WhatsApp no lo llena el estudiante: lo
llena un recomendador que ya tiene cuenta. El botón de compartir que está en la
pantalla de postulaciones apunta a ese mismo formulario.

### 2. Se crea el `Postulante`

La API guarda el documento en `Postulantes` con todo lo que se llenó, más el
`_id` del recomendador, que lo saca del token y no del body.

Antes de guardar revisa que no exista otro postulante **con el mismo nombre**. Si
existe, tira `409`.

### 3. Se crea el `User` con rol `alumno`

Inmediatamente después, y dentro de la misma llamada, el servicio invoca
`usersService.createAlumno()`. Ese método:

- Busca el rol llamado `alumno`. Si no existe, revienta.
- Revisa que el correo no esté ya usado por otro usuario.
- Genera una contraseña temporal de 16 caracteres al azar y la hashea.
- Crea el usuario con `isActive: false` y con `idDependingRole` apuntando al
  `_id` del postulante que se acaba de crear.

### 4. Las credenciales se devuelven en la respuesta

La respuesta del `POST /postulantes` trae adentro el correo y la **contraseña
temporal en texto plano**.

El punto importante es que **al alumno no se le manda ningún correo**. A
diferencia de los recomendadores, tutores y profesores, acá no hay envío por SES.

Entonces las credenciales viajan en la respuesta HTTP y alguien tiene que
pasárselas al estudiante por fuera del sistema. Hoy la pantalla del formulario ni
siquiera las muestra: redirige directo a `/formulario/sucess`.

En la práctica esas credenciales se sacan del script
[generate_user.py](../refuerzo-apiv2/generate_user.py), que hace carga masiva y
escribe un `alumnos_credenciales.xlsx`.

### 5. El estudiante entra por primera vez y activa la cuenta

Con esas credenciales entra a la plataforma. Como la cuenta está inactiva, el
panel no se le muestra: le sale el formulario de activación obligatorio.

Ahí sube su foto, pone su teléfono y define su contraseña. Todo eso está
explicado en [Sesión y login](sesion-y-login.md).

### 6. Se crea el `Alumno` y entra a su sección

Cuando `PATCH /profile/me` termina de guardar el perfil, revisa el rol. Si es
`alumno`, entonces llama a `postulanteService.createNewAlumno()`, que hace dos
cosas:

- Pone `isUser: true` en el postulante. Es decir, marca la solicitud como ya
  convertida.
- Crea el documento en `Alumnos` con el `userId`, el `gradoId` que traía el
  postulante, el nombre, el correo, la imagen y el teléfono del encargado.

Y al crear el alumno, `alumnoService.create()` llama a
`seccionService.addAlumnoToSeccionesByGradoId()`, que busca **todas** las
secciones que tengan ese `gradoId` y le empuja el `_id` del alumno al arreglo
`alumnos`.

Recién ahí el estudiante aparece en la sección, en la pestaña de personas y en la
lista de asistencia.

## Por qué el alumno no aparece hasta que activa

Esto es lo que más se pregunta, así que vale la pena decirlo aparte.

Entre el paso 3 y el paso 6 pueden pasar días. Durante todo ese tiempo, el
estudiante ya tiene cuenta y ya puede entrar, pero **no existe como `Alumno`**, y
por lo tanto no está en ninguna sección.

Es decir, si alguien pregunta "¿por qué este estudiante no me sale en la lista si
ya lo registré?", casi siempre la respuesta es que todavía no ha activado su
cuenta. Eso se puede confirmar mirando el campo `isUser` del postulante en la
pantalla de postulaciones: si está en `false`, no ha entrado.

## Lo que ve el admin y lo que ve el recomendador

Son dos endpoints distintos aunque la pantalla se vea parecida:

| Endpoint               | Quién lo usa   | Qué devuelve                                     |
| ---------------------- | -------------- | ------------------------------------------------ |
| `GET /postulantes`     | El admin       | Todas las postulaciones.                         |
| `GET /postulantes/me`  | El recomendador | Solamente las que él mismo recomendó.            |

El filtro del segundo sale del `id` del token, así que no se puede falsear desde
el cliente.

Los dos enriquecen cada postulante con el nombre del grado y con los datos del
recomendador. Cuando algo de eso no se encuentra, en lugar de fallar ponen el
texto `'No grado'` o `'No recomendador'`.

## Riesgo conocido: el postulante es único por nombre

`create()` revisa duplicados con `findByNameOrId(nombre)`. Es decir, la llave de
unicidad real es el **nombre**, no el correo.

Eso tiene dos efectos que no se ven a simple vista:

- Dos estudiantes que realmente se llamen igual no se pueden registrar. El
  segundo va a chocar contra el primero.
- El mensaje que muestra la web cuando llega el `409` dice *"Ya existe un
  postulante con este correo"*, y eso está mal: el conflicto fue por el nombre.
  Entonces la persona va a corregir el correo, va a reintentar y le va a volver a
  fallar, sin entender por qué.

Hay que tener presente que el correo **sí** se valida, pero más adelante y en
otro lugar: en el paso 3, cuando se crea el `User`. Ese también tira `409`, así
que desde afuera los dos errores se ven idénticos.

### Posible solución

Lo mínimo es corregir el mensaje de la web para que hable de nombre duplicado. Lo
correcto sería revisar el duplicado por correo en el postulante, que es lo que
realmente identifica a una persona, y dejar el nombre libre.

## Riesgo conocido: si falla la creación del usuario, el postulante queda huérfano

Los pasos 2 y 3 son dos escrituras seguidas, sin transacción de por medio.

El postulante se guarda primero. Si después `createAlumno()` falla, por ejemplo
porque el correo ya estaba usado o porque no existe el rol `alumno`, la petición
devuelve error pero **el postulante ya quedó guardado**.

Y como quedó guardado, el nombre ya está tomado. Entonces reintentar el mismo
formulario da `409` por nombre duplicado, aunque desde afuera parezca que la
primera vez no se guardó nada.

Cuando pase eso, hay que borrar el postulante desde la pantalla de postulaciones
antes de reintentar.

## Riesgo conocido: la imagen del postulante está quemada

En [app/formulario/page.tsx](../refuerzo-web/app/formulario/page.tsx) el campo
`imagen` se manda siempre con la misma URL fija, apuntando a una imagen concreta
del servidor de producción.

Es decir, el formulario no pide foto y todos los postulantes quedan con la misma.
Eso realmente no molesta, porque la foto de verdad se sube después, en la
activación, y ahí sí se reemplaza.

El problema es que la URL apunta a `refuerzo-mendoza.me`. En local, esa imagen
solo carga si el dominio está permitido en
[next.config.ts](../refuerzo-web/next.config.ts), y si algún día se borra ese
archivo del servidor, todos los postulantes que no hayan activado su cuenta se
quedan sin imagen.

## Riesgo conocido: `programa` se pide pero casi no se usa

El formulario obliga a escoger un programa y el DTO lo exige, así que se guarda
en el documento del postulante.

Pero de ahí no pasa a ningún lado: no se copia al `User`, no se copia al
`Alumno`, y en el listado de postulaciones ni siquiera se devuelve. Solo aparece
al pedir un postulante puntual con `GET /postulantes/:id`.

Es decir, hoy el programa es un dato que se captura y se archiva, nada más. No
está roto, pero conviene saberlo antes de asumir que el sistema hace algo con esa
información.
