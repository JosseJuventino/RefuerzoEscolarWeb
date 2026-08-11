# Cuentas y usuarios

## Piezas

| Archivo                                                                     | Rol                                                                              |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [users/users.service.ts](../refuerzo-apiv2/src/users/users.service.ts)      | Toda la creación de cuentas, la actualización y la recuperación de contraseña.    |
| [users/users.controller.ts](../refuerzo-apiv2/src/users/users.controller.ts) | Las rutas de usuarios y recomendadores.                                          |
| [users/tutor.controller.ts](../refuerzo-apiv2/src/users/tutor.controller.ts) | Las rutas de tutores, bajo `/tutores`.                                           |
| [users/profesor.controller.ts](../refuerzo-apiv2/src/users/profesor.controller.ts) | Las rutas de profesores, bajo `/profesor`.                                 |
| [users/profile.controller.ts](../refuerzo-apiv2/src/users/profile.controller.ts) | El `PATCH /profile/me` que usa cada quien para su propio perfil.            |
| [email/service/email.service.ts](../refuerzo-apiv2/src/email/service/email.service.ts) | El envío de correos por AWS SES.                                      |

## Los tres caminos para crear una cuenta

No hay un solo endpoint de "crear usuario". Realmente hay tres caminos y cada
uno se comporta distinto.

| Camino                     | Endpoint                       | Rol que asigna                  | ¿Manda correo? |
| -------------------------- | ------------------------------ | ------------------------------- | -------------- |
| Genérico                   | `POST /users`                  | El que se mande en el body      | No             |
| Por tipo                   | `POST /users/recomendador`, `POST /tutores`, `POST /profesor` | El fijo de cada endpoint | Sí |
| Por postulación            | `POST /postulantes`            | Siempre `alumno`                | No             |

El tercero es el de [Postulación](postulacion.md). Los otros dos van acá.

### El camino genérico

`POST /users` recibe nombre, correo, teléfono, imagen y el nombre o el `_id` del
rol. Es el que se usa para crear el primer admin cuando la base está vacía.

Tiene dos particularidades:

- **Es público.** Está explicado en [Roles y permisos](roles-y-permisos.md#riesgo-conocido-post-users-es-público).
- **No acepta `isActive`.** El DTO no lo declara y el `ValidationPipe` corre con
  `whitelist: true`, así que si se manda, se borra del body sin avisar. Entonces
  la cuenta queda inactiva sí o sí, y hay que activarla a mano en Mongo o pasando
  por el formulario de activación.

### El camino por tipo

Los tres endpoints hacen prácticamente lo mismo, solo cambia el nombre del rol
que buscan y el asunto del correo:

1. Buscan el rol por nombre (`recomendador`, `tutor` o `profesor`). Si no existe,
   tiran `400`.
2. Revisan que el correo no esté usado.
3. Generan la contraseña temporal y la hashean.
4. Crean el usuario con `isActive: false`.
5. Mandan el correo por SES con la contraseña temporal adentro.

El paso 5 va dentro de un `try/catch` que solamente hace `console.error`. Es
decir, **si el correo no sale, la cuenta igual queda creada y el endpoint
responde `201`**.

Eso a veces es lo que uno quiere y a veces no. En local, donde normalmente no hay
credenciales de AWS configuradas, el correo nunca sale y la cuenta queda creada
con una contraseña temporal que nadie sabe cuál es. En ese caso toca borrar el
usuario y volver a empezar, o cambiarle el hash directo en Mongo.

## La contraseña que se manda siempre se ignora

Esto aplica a **todos** los caminos, y es de las cosas que más confunden.

El servicio nunca usa la contraseña que viene en el body. Lo que hace es:

```ts
const temporaryPassword = crypto.randomBytes(8).toString('hex');
```

Es decir, se genera una contraseña de 16 caracteres hexadecimales al azar, esa es
la que se hashea y esa es la que se guarda.

Entonces, si alguien crea un usuario mandando `"password": "hola123"`, esa
contraseña no sirve para nada. La buena es la que viene en la respuesta o en el
correo.

## Editar un usuario

`PATCH /users/:id` actualiza lo que se le mande. Si viene una contraseña, la
hashea antes de guardar.

Lo que hay que tener presente es que **si el usuario tiene rol `alumno`, además
sincroniza el registro de `Alumnos`**. Es decir, copia el nombre, la imagen y el
correo también al documento del alumno.

Eso está bien y es necesario, porque las secciones muestran los datos del
`Alumno`, no los del `User`. Pero significa que editar a un alumno escribe en dos
colecciones, y si algo falla a mitad de camino quedan desincronizadas.

Hay que tener presente también que el método busca el rol con
`findByNameOrId(updateUserDto.role)` **sin revisar antes si `role` venía o no**, y
esa búsqueda ocurre *después* de haber guardado el usuario.

Entonces, si se manda un `PATCH` sin el campo `role`, se está buscando un rol con
la llave vacía. El resultado exacto depende de cómo TypeORM traduzca esa consulta
—puede no encontrar nada y tirar error, o puede devolver un rol cualquiera— pero
en los dos casos es un comportamiento que nadie quiso.

La pantalla de usuarios siempre manda el rol, así que hoy no se dispara. Aun así,
lo correcto sería que ese bloque solo corra si `updateUserDto.role` realmente
viene.

## Borrar un usuario

`DELETE /users/:id` hace tres cosas, en este orden:

1. Revisa cuántos usuarios hay en total. Si solo queda uno, tira `409`: la idea
   es no dejar el sistema sin nadie que pueda entrar.
2. Lo saca del arreglo `encargados` de todas las secciones donde estuviera.
3. Borra el documento de `Users` de verdad, no es borrado lógico.

El punto que conviene tener presente es lo que **no** hace: no borra el `Alumno`
asociado ni lo saca de las secciones, no borra el `Postulante`, y no toca los
registros de asistencia.

Entonces, borrar un usuario con rol `alumno` deja el `Alumno` colgando en su
sección, apuntando a un `userId` que ya no existe. La sección lo sigue mostrando
normal, porque los datos que muestra son los del `Alumno`.

## Recuperación de contraseña

El flujo está pensado así:

1. La persona pone su correo en `/reset-password`.
2. La web resuelve un reCAPTCHA v3 y llama a `POST /users/request-password-reset`
   con el correo y el token del captcha.
3. La API verifica el captcha contra Google. Si no pasa, corta ahí.
4. Borra los tokens de recuperación anteriores de esa persona que no se hayan
   usado.
5. Crea un token nuevo al azar con vencimiento de **1 hora**.
6. Le manda por correo un enlace con ese token.
7. La persona abre el enlace, escribe la contraseña nueva y la web llama a
   `POST /users/reset-password`.
8. La API busca el token, revisa que no esté usado ni vencido, guarda la
   contraseña nueva y marca el token como usado.

Esa ruta además está limitada a **3 intentos por minuto** con `@Throttle`.

### El paso 6 hoy no ocurre

El bloque que arma y manda el correo está **comentado** en
[users.service.ts](../refuerzo-apiv2/src/users/users.service.ts). Es decir, el
token se crea correctamente y se guarda en `PasswordResetToken`, pero nunca sale
de la base de datos.

Y la respuesta que recibe la persona igual dice *"Si el email está registrado, se
ha enviado un enlace de recuperación"*, así que desde afuera parece que sí
funcionó.

Entonces, hoy la recuperación de contraseña realmente está a medias: sirve para
generar el token, pero alguien tiene que sacarlo de Mongo y armar el enlace a
mano. En la práctica lo que se hace es cambiar la contraseña por la pantalla de
usuarios.

Cuando se quiera reactivar, hay que descomentar ese bloque y revisar que el
enlace del correo apunte al dominio correcto, porque está quemado como
`https://refuerzo-mendoza.me/reset-password`.

### Ese endpoint necesita replica set

`requestPasswordReset` usa una transacción de TypeORM, y las transacciones de
MongoDB exigen un replica set.

Con un `mongod` suelto en local, ese endpoint falla y todo lo demás funciona
igual. Cómo levantar Mongo con replica set está en el
[README de la raíz](../README.md#sobre-las-transacciones).

## Riesgo conocido: `PATCH /profile/me` activa la cuenta siempre

El método `updateProfile` hace `updates.isActive = true` sin condición alguna,
antes de guardar.

Es decir, cualquier llamada exitosa a ese endpoint deja la cuenta activa, incluso
si el cuerpo viene vacío o solo trae el teléfono. No hay ninguna validación de
que realmente se haya subido la foto ni definido una contraseña nueva.

Hoy no se explota porque la única pantalla que llama a ese endpoint es el
formulario de activación, y ese sí valida del lado del cliente. Pero la
validación vive únicamente en el navegador.

### Posible solución

Separar las dos cosas: que `PATCH /profile/me` solo actualice el perfil, y que la
activación sea explícita, revisando en el servidor que la imagen, el teléfono y
la contraseña realmente vinieron y son válidos.

## Riesgo conocido: `updateProfile` pisa la imagen aunque no venga

Dentro del método hay esto:

```ts
if (updateProfileDto.image) {
  updates.image = updateProfileDto.image;
}

updates.image = updateProfileDto.image;
```

La segunda línea anula la primera. Entonces, si alguien llama al endpoint sin
mandar imagen, el campo `image` del usuario se sobrescribe con `undefined` y la
foto de perfil se pierde.

Se ve como una línea que quedó de una prueba y no se borró. Arreglarlo es
simplemente quitar la segunda línea.
