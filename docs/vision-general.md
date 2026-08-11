# Visión general

## Qué es la plataforma

Es el sistema del refuerzo escolar de William Mendoza. Básicamente hace tres
cosas:

1. Recibe **postulaciones** de estudiantes nuevos y las convierte en cuentas.
2. Organiza a esos estudiantes en **secciones** (los "cursos"), cada una con sus
   encargados y su tablón de publicaciones.
3. Lleva la **asistencia** de cada sección, tanto de alumnos como de encargados.

Todo lo demás (roles, imágenes, correos, recuperación de contraseña) está para
sostener esas tres cosas.

## Piezas

| Carpeta                                            | Rol                                                                                                            |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [refuerzo-apiv2/](../refuerzo-apiv2/)              | La API. NestJS + TypeORM sobre MongoDB. Acá vive toda la lógica de negocio real y toda la validación que importa. |
| [refuerzo-web/](../refuerzo-web/)                  | El panel y la web pública. Next.js + NextAuth. Es la única interfaz que se usa en producción.                   |
| [formulario_postulantes/](../formulario_postulantes/) | Un prototipo estático en Astro. **No se usa.** No envía nada a la API.                                       |
| [refuerzo-api/](../refuerzo-api/)                  | La API vieja (v1). Quedó como referencia, ya no se toca.                                                        |

La web nunca habla con Mongo directamente. Todo pasa por HTTP contra la API, con
axios, desde [lib/api.ts](../refuerzo-web/lib/api.ts).

## Las colecciones

Vale la pena tener presente cómo está partida la información, porque hay cosas
que a simple vista parecerían una sola y realmente son varias.

| Colección            | Para qué                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `Roles`              | Un rol y su tabla de permisos. Ver [Roles y permisos](roles-y-permisos.md).                      |
| `Users`              | La cuenta: correo, contraseña, teléfono, imagen, rol y si está activa.                           |
| `Postulantes`        | La solicitud que llenó un recomendador. Es el papel de entrada, no la cuenta.                    |
| `Alumnos`            | El estudiante ya matriculado. Es lo que se mete a las secciones.                                 |
| `Secciones`          | El curso: nombre, grado, encargados, alumnos, slug e imagen de fondo.                            |
| `Asistencia`         | **Un solo documento por sección**, con todos los registros de todas las fechas adentro.          |
| `Grados`             | "Primer grado", "Segundo grado", etc.                                                            |
| `Programas`          | Los programas del refuerzo. Se piden en el formulario de postulación.                            |
| `Publicaciones`      | Los anuncios y materiales de apoyo del tablón de una sección.                                    |
| `Image` / `Document` | El registro de cada archivo subido. El archivo en sí vive en disco.                              |
| `Tokens`             | Las sesiones abiertas contra la API.                                                             |
| `LoginAudit`         | Los últimos accesos de cada usuario.                                                             |
| `PasswordResetToken` | Los enlaces de recuperación de contraseña.                                                       |

## Una persona puede existir tres veces

Este es el punto que más confunde al leer el código por primera vez, así que
mejor decirlo de una: **un estudiante puede tener hasta tres documentos
distintos en la base de datos**, y cada uno significa algo diferente.

| Documento    | Qué representa                       | Cuándo aparece                                                    |
| ------------ | ------------------------------------ | ----------------------------------------------------------------- |
| `Postulante` | La solicitud                         | Cuando un recomendador llena el formulario.                       |
| `User`       | La cuenta para entrar                | Inmediatamente después, junto con la solicitud.                   |
| `Alumno`     | El estudiante dentro de las secciones | Hasta que la persona **activa** su cuenta.                        |

A simple vista podría parecer redundante, pero realmente son estados distintos
del mismo proceso. Digamos que alguien postula y nunca entra a la plataforma:
ahí van a existir el `Postulante` y el `User`, pero no el `Alumno`, y por lo
tanto esa persona no va a aparecer en ninguna sección ni en ninguna lista de
asistencia. Eso es intencional.

Los tres quedan enlazados así:

- El `User` guarda `idDependingRole`, que es el `_id` del `Postulante`.
- El `Alumno` guarda `userId`, que es el `_id` del `User`.
- El `Postulante` guarda `isUser`, que se pone en `true` cuando ya se creó el
  `Alumno`.

El detalle completo está en [Postulación](postulacion.md).

Con tutores, profesores y recomendadores esto no aplica: para ellos solamente
existe el `User`.

## Cómo responde la API

Casi todos los endpoints devuelven la misma envoltura, armada con
[GeneralResponseBuilder](../refuerzo-apiv2/src/common/helper/general-response.helper.ts):

```json
{ "statusCode": 200, "message": "...", "data": { } }
```

Y los que listan cosas usan la versión paginada, que además trae `size`,
`totalPages`, `page` y `limit`.

Hay que tener presente que **no siempre es consistente**. Algunos endpoints
devuelven `data` con el objeto adentro y otros devuelven el objeto pelado, y por
eso en los servicios de la web se ve seguido este patrón:

```ts
const data = response.data.data;
return Array.isArray(data) ? data[0] : data;
```

Es decir, la web se defiende de no saber exactamente qué forma le va a llegar.
No es lo ideal, pero es el estado actual.

## Dónde está la lógica de verdad

Prácticamente toda la lógica de negocio está en los `*.service.ts` de la API.
Los controladores casi no hacen nada más que declarar la ruta, el permiso y
pasarle el DTO al servicio.

Del lado de la web, lo que hay es:

- `services/*.ts` — una función por endpoint, nada más.
- `app/dashboard/**/page.tsx` — la pantalla, con React Query para traer y
  refrescar datos.
- `components/` — lo visual.

Entonces, si algo no cuadra en una pantalla, el orden razonable para buscar es:
primero el servicio de la API, después el controlador, y de último el
componente.
