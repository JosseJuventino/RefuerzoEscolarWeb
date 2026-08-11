# Roles y permisos

## Piezas

| Archivo                                                                                        | Rol                                                                                            |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [roles/entities/role.entity.ts](../refuerzo-apiv2/src/roles/entities/role.entity.ts)           | El rol: un nombre y un objeto `pages` con los permisos.                                        |
| [auth/auth.guard.ts](../refuerzo-apiv2/src/auth/auth.guard.ts)                                 | El guard que corre en **todas** las peticiones y decide si pasa o no.                          |
| `@Resources(...)` / `@Scopes(...)`                                                              | Vienen del paquete `nest_autorization`. Marcan qué recurso y qué permisos pide cada ruta.      |
| [common/decorators/public.decorators.ts](../refuerzo-apiv2/src/common/decorators/public.decorators.ts) | El `@Public()` que deja pasar una ruta sin token.                                       |
| [app/constants/roles.ts](../refuerzo-web/app/constants/roles.ts)                                | Los nombres de rol quemados en la web.                                                         |
| [components/Dashboard/NavItem.tsx](../refuerzo-web/components/Dashboard/NavItem.tsx)            | El `ProtectedNavItem` que decide qué opciones del menú se pintan.                              |

## Los cinco roles

En la práctica el sistema usa estos nombres, y varios están **quemados en el
código** de la API porque los busca por nombre:

| Rol            | Qué hace                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------- |
| `admin`        | Ve todo: usuarios, cursos, postulaciones y opciones avanzadas.                                 |
| `recomendador` | Llena el formulario de postulación y ve solamente los postulantes que él mismo recomendó.      |
| `alumno`       | Ve sus secciones, el tablón y las personas. No registra asistencia.                            |
| `tutor`        | Encargado de sección. Ve el tablón, publica y registra asistencia.                             |
| `profesor`     | Igual que el tutor.                                                                            |

Hay que tener presente que la API busca los roles por nombre literal en varios
lugares. Por ejemplo, `createAlumno` hace `findByNameOrId('alumno')` y si ese rol
no existe en la base de datos, la creación revienta con un `400`. Lo mismo pasa
con `'recomendador'`, `'tutor'` y `'profesor'`.

Entonces esos cuatro nombres no son opcionales: **tienen que existir tal cual en
la colección `Roles`**, en minúscula.

## Cómo se guarda un permiso

Un rol se ve así:

```json
{
  "name": "tutor",
  "pages": {
    "asistencias": { "view": true, "edit": true },
    "secciones":   { "view": true, "edit": false }
  }
}
```

Es decir, `pages` es un diccionario donde la llave es el **recurso** y el valor
dice si ese rol puede ver y/o editar.

Las llaves de `pages` no son inventadas: tienen que coincidir exactamente con el
`@Resources(...)` que tiene declarado el controlador. Por ejemplo,
`AsistenciaController` declara `@Resources('asistencias')`, entonces el permiso
tiene que llamarse `asistencias`.

## Cómo se decide si pasa o no

Cada petición corre por el `AuthGuard`, que está registrado como `APP_GUARD` en
[auth.module.ts](../refuerzo-apiv2/src/auth/auth.module.ts). Los pasos son:

1. Si la ruta tiene `@Public()`, pasa de largo y no revisa nada.
2. Lee el `@Resources(...)` del controlador. Si no hay, rechaza.
3. Lee el `@Scopes(...)` del método. Si no hay, rechaza.
4. Busca el token en el header `Authorization: Bearer ...`. Si no viene, rechaza.
5. Busca ese token en la colección `Tokens`, verifica el JWT guardado y saca el
   payload.
6. Con el `id` del payload busca el usuario, y con el `role` del usuario busca el rol.
7. Revisa que `roles.pages[recurso]` exista y que **todos** los scopes pedidos
   estén en `true`.

El paso 7 es el que sorprende. La comprobación real es:

```ts
requiredScopes.every((scope) => roles.pages[resource][scope])
```

Es un `every`, no un `some`. Entonces una ruta marcada con `@Scopes('view', 'edit')`
exige que el rol tenga **las dos** en `true`. Tener solo `edit` no alcanza.

Eso significa que si alguien reporta que no puede guardar algo y todo lo demás
funciona, lo primero que hay que revisar es si a ese rol le falta el `view` del
recurso, aunque suene raro.

### Qué pasa cuando falla

Cualquier error dentro del guard, sea el que sea, termina convertido en lo mismo:

```json
{ "statusCode": 403, "message": "Unauthorized access" }
```

Un token vencido, un rol que no existe, un permiso en `false` o un usuario
borrado dan todos exactamente la misma respuesta. Por eso, cuando algo da `403`,
el mensaje no ayuda: hay que ir a ver los logs de la API, que ahí sí queda el
error real.

## El menú de la web no es una protección

Del lado de la web, `ProtectedNavItem` recibe un `allowedRoles` y con eso decide
si pinta o no la opción en el menú. Por ejemplo, "Postulaciones" y "Opciones
avanzadas" solo se le muestran a `admin`.

El punto importante es que eso es **solamente cosmético**. Es decir, esconder un
botón no impide que alguien entre a la ruta escribiéndola en el navegador, ni
mucho menos que llame a la API directamente.

La protección real es siempre el guard de la API. La web decide qué mostrar; la
API decide qué se puede hacer. Cuando se agregue una pantalla nueva, hay que
acordarse de configurar **las dos cosas**, porque configurar solo la web deja el
dato expuesto y configurar solo la API deja un botón que da error al tocarlo.

Además, el `RoleGuard` de la web compara contra el **nombre** del rol, y ese
nombre viene de la sesión de NextAuth. Si alguien renombra un rol en la base de
datos, el menú deja de coincidir sin que nada avise.

## Rutas públicas

Estas son las rutas que hoy no piden token:

| Ruta                                  | Por qué                                                      |
| ------------------------------------- | ------------------------------------------------------------ |
| `POST /auth/login`                    | Obvio, es la entrada.                                        |
| `POST /users`                         | Crear usuario. Ver el riesgo de abajo.                       |
| `POST /users/request-password-reset`  | Pedir recuperación de contraseña.                            |
| `POST /users/reset-password`          | Cambiar la contraseña con el token del correo.               |
| `POST /images`                        | Subir imagen. Ver el riesgo de abajo.                        |
| `GET /images/:id`                     | Leer el registro de una imagen.                              |
| `GET /uploads/**`                     | Los archivos servidos como estáticos.                        |

## Riesgo conocido: `POST /users` es público

[users.controller.ts](../refuerzo-apiv2/src/users/users.controller.ts) tiene la
ruta marcada con `@Scopes('edit')` **y** con `@Public()` al mismo tiempo. El
`@Public()` gana, porque el guard lo revisa de primero y se sale antes de mirar
los scopes.

Eso significa que cualquiera que sepa la URL puede crear un usuario, siempre y
cuando mande un rol que exista.

Ahora, el daño está acotado: el usuario se crea con `isActive` en `false`, y
mientras no esté activo la web lo manda directo al formulario de activación. Aun
así, es un usuario metido en la base de datos sin que nadie lo autorice.

Esto está así por el problema de huevo-y-gallina del arranque, que está explicado
en el [README de la raíz](../README.md#primer-rol-y-primer-usuario-bootstrap): con
la base vacía no hay forma de crear el primer usuario si la ruta pide token.

### Posible solución

Lo razonable sería quitarle el `@Public()` y hacer el bootstrap del primer
usuario por script o directo en Mongo, igual que ya se hace con el primer rol.
Total, el primer usuario se crea una sola vez en la vida del sistema.

## Riesgo conocido: crear roles por API pierde permisos

`POST /roles` recibe un `CreateRoleDto`, y el `PagesDto` que trae adentro
solamente declara cuatro llaves: `blog`, `usuarios`, `programacion` y `role`.

El problema es que el `ValidationPipe` global corre con `whitelist: true`, y eso
hace que **cualquier propiedad no declarada se elimine del body sin avisar**. No
tira error, no advierte, simplemente la borra.

Entonces si se crea un rol por la API mandando permisos de `asistencias`,
`secciones`, `alumnos` o `postulantes`, esos permisos se pierden en el camino y
el rol queda guardado sin ellos. Después el usuario entra, todo parece bien, y
cada pantalla le da `403`.

Por eso hoy los roles se editan directo en MongoDB.

### Posible solución

Declarar en `PagesDto` todas las llaves que realmente usan los controladores, o
cambiar `pages` a un tipo libre para que el whitelist no lo toque. La lista
completa de recursos se saca leyendo los `@Resources(...)` de cada controlador.

## Riesgo conocido: las publicaciones usan el permiso `document`

`PublicacionController` está declarado con `@Resources('document')`, no con algo
como `publicaciones`.

Es decir, el permiso que controla el tablón de una sección es el mismo que
controla los archivos. A simple vista uno buscaría un permiso llamado
`publicaciones` y no existe.

No está roto, pero es fácil perder tiempo buscando por ahí. Si alguien no puede
publicar en el tablón, lo que hay que revisar es `pages.document`.
