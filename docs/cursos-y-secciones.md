# Cursos y secciones

En la base de datos se llaman **secciones**, y en la interfaz se llaman
**cursos**. Es la misma cosa.

## Piezas

| Archivo                                                                                       | Rol                                                                     |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [seccion/service/seccion.service.ts](../refuerzo-apiv2/src/seccion/service/seccion.service.ts) | Toda la lógica de secciones: slug, encargados, alumnos y borrado en cascada. |
| [publicacion/service/publicacion.service.ts](../refuerzo-apiv2/src/publicacion/service/publicacion.service.ts) | El tablón: anuncios y material de apoyo.                |
| [app/dashboard/courses/page.tsx](../refuerzo-web/app/dashboard/courses/page.tsx)               | La pantalla del admin, donde se crean y editan las secciones.            |
| [app/dashboard/my-courses/[slug]/layout.tsx](../refuerzo-web/app/dashboard/my-courses/[slug]/layout.tsx) | Carga la sección una sola vez y la comparte a las pestañas.   |
| [app/dashboard/advanced-options/page.tsx](../refuerzo-web/app/dashboard/advanced-options/page.tsx) | Donde se administran los grados y los programas.                    |

## Primero los grados

Un **grado** es "Primer grado", "Segundo grado", etc. Se administran desde
Opciones avanzadas, que solo ve el admin.

El grado es más importante de lo que parece, porque es lo que conecta a los
alumnos con las secciones. Es decir, un alumno no se asigna a una sección a mano:
se le asigna un grado, y por ese grado cae automáticamente en la sección
correspondiente.

Los **programas** también se administran ahí, pero hoy solo se usan como opción
del formulario de postulación. Está explicado al final de
[Postulación](postulacion.md).

## Crear una sección, paso a paso

1. El admin entra a Cursos y llena nombre, grado e imagen de fondo.
2. La API revisa que no exista otra sección con ese **nombre**.
3. Revisa que no exista otra sección con ese **grado**. Es decir, hay como máximo
   una sección por grado.
4. Revisa que el grado exista de verdad.
5. Genera el `slug` a partir del nombre: lo pasa a minúsculas, le quita los
   acentos y cambia todo lo que no sea letra o número por guiones. Entonces
   "Matemáticas 1" queda como `matematicas-1`.
6. Guarda la sección.
7. **Crea de una vez el documento de asistencia de esa sección**, vacío.

El paso 7 es importante para entender la asistencia: no se crea cuando alguien
pasa lista por primera vez, se crea junto con la sección. Si ese documento no
existe, todos los endpoints de asistencia de esa sección dan error. Está
explicado en [Asistencia](asistencia.md).

## Un grado, una sección

El paso 3 es una regla dura del sistema y conviene tenerla presente: **no se
pueden tener dos secciones del mismo grado**.

Eso simplifica mucho las cosas, porque significa que "el grado de un alumno"
determina sin ambigüedad en qué sección va. Pero también significa que no se
puede partir un grado en dos grupos, por ejemplo si son demasiados estudiantes.

Para lograr eso hoy habría que crear un grado nuevo ("Primer grado A", "Primer
grado B") y mover a los alumnos de grado.

## Quién entra a una sección

Hay dos arreglos distintos dentro del documento de la sección, y guardan cosas
distintas:

| Campo        | Qué guarda                        | Cómo entra alguien ahí                                            |
| ------------ | --------------------------------- | ------------------------------------------------------------------ |
| `encargados` | `_id` de documentos de `Users`    | El admin los asigna a mano desde la pantalla de Cursos.            |
| `alumnos`    | `_id` de documentos de `Alumnos`  | Automático, por el `gradoId`, cuando el alumno activa su cuenta.   |

Hay que tener presente que **no guardan el mismo tipo de cosa**. Los encargados
son usuarios y los alumnos son alumnos. Es un detalle que se pasa por alto
fácilmente al leer el código, porque los dos son arreglos de strings.

Los encargados son tutores y profesores. La pantalla de Cursos los lista con un
indicador `isEncargado` para saber cuáles ya están asignados a alguna sección y
cuáles están libres; los libres salen de primero.

## El slug

Cada sección tiene un `slug` único y es lo que va en la URL:
`/dashboard/my-courses/matematicas-1`.

Cuando se le cambia el nombre a una sección, el slug **se regenera**. La API
revisa que el nuevo no choque con otro y entonces lo guarda.

Eso significa que renombrar una sección le cambia la URL. Los enlaces viejos
dejan de funcionar. No es grave porque el menú se arma solo, pero si alguien
guardó el enlace en favoritos se le va a romper.

## "Mis cursos" no es lo mismo para todos

`GET /seccion/me` devuelve las secciones de quien pregunta, pero filtra distinto
según el rol:

- Si el rol es `alumno`, primero busca el documento de `Alumnos` que tenga ese
  `userId`, y después filtra las secciones que tengan ese `_id` en su arreglo
  `alumnos`.
- Para cualquier otro rol, filtra por el `_id` del usuario dentro de
  `encargados`.

O sea que el admin, que normalmente no es encargado de nada, no ve ningún curso
en "Mis cursos". Eso es correcto: el admin ve todo desde la pantalla de Cursos,
que es otra.

Hay que tener presente que si el rol es `alumno` y no existe su documento de
`Alumnos`, esa búsqueda falla. Es decir, un usuario con rol alumno que nunca
activó su cuenta puede reventar ese endpoint. Está explicado en
[Postulación](postulacion.md).

## Las pestañas de una sección

Cuando se entra a una sección, el layout carga la sección completa una sola vez
con `GET /seccion/slug/:slug` y la mete en un contexto de React.

La idea es bastante sencilla: así las pestañas de adentro (Tablón, Personas,
Asistencia, Historial) leen del contexto y no vuelven a pedir lo mismo a la API
cada vez que uno cambia de pestaña.

Ese endpoint ya devuelve la sección con todo poblado: sus publicaciones, sus
encargados con nombre e imagen, y sus alumnos con nombre e imagen.

Las pestañas de asistencia solo se agregan si el rol es `admin`, `profesor` o
`tutor`. El alumno ve nada más Tablón y Personas.

## El tablón

Una publicación tiene título, descripción, categoría, archivos y la sección a la
que pertenece.

Las reglas al crearla son:

1. La categoría tiene que ser `anuncio` o `material de apoyo`. Cualquier otra
   cosa da `400`.
2. Cada archivo tiene que ser de tipo `imagen` o `documento`.
3. No puede haber archivos repetidos, ni por id ni por URL.
4. Máximo **5 archivos** por publicación.

El título no lo escribe el usuario: lo arma la API con el nombre de quien
publica, quedando como *"Fulano publicó un nuevo anuncio"* o *"Fulano publicó un
nuevo material de apoyo"*.

Los archivos se suben antes, por su lado, y la publicación solo guarda las
referencias. Eso está en [Archivos e imágenes](archivos.md).

## Borrar cosas: qué se lleva por delante

Acá sí hay borrado en cascada, y conviene tenerlo claro antes de borrar algo.

**Borrar una sección** (`DELETE /seccion/:id`) borra:

1. Todas sus publicaciones, junto con los archivos de esas publicaciones.
2. Su documento de asistencia, es decir **todo el historial de asistencia de esa
   sección**.
3. La sección.

**Borrar un grado** borra todas las secciones de ese grado, y con cada una lo de
arriba.

Todo eso es borrado real, no lógico. No hay papelera ni forma de recuperarlo
desde la aplicación.

Entonces, borrar un grado por equivocación en Opciones avanzadas se lleva
secciones, publicaciones, archivos e historial de asistencia de una sola vez. Es
la operación más destructiva del sistema y hoy no pide más confirmación que
cualquier otra.

## Riesgo conocido: los alumnos no se sincronizan al cambiar de grado

Cuando un alumno entra al sistema, se le agrega a las secciones de su grado. Eso
funciona bien.

El problema es lo que pasa después. Si a ese alumno le cambian el `gradoId`, no
hay nada que lo saque de la sección vieja ni que lo meta en la nueva. El servicio
tiene un `deleteAlumnoFromSeccionesByGradoId`, pero no se llama desde la
actualización del alumno.

Es decir, hoy el alumno se queda en la sección donde cayó la primera vez.

Lo mismo pasa al revés: si se crea una sección nueva para un grado que ya tenía
alumnos, esa sección nace **vacía**, porque el enganche solo ocurre al crear el
alumno, no al crear la sección. Hay que meter a esos alumnos a mano.

### Posible solución

Al actualizar un alumno, comparar el grado anterior con el nuevo y, si cambió,
sacarlo de las secciones del grado viejo y meterlo a las del nuevo. Y al crear
una sección, buscar los alumnos que ya tengan ese `gradoId` y agregarlos de una
vez.

## Riesgo conocido: casi todo el DTO de sección es opcional

En `CreateSeccionDto`, **todos** los campos están marcados con `@IsOptional()`,
incluyendo el nombre y el grado.

Entonces se puede crear una sección mandando un body vacío. Ahí lo que pasa es
que la validación del nombre duplicado no encuentra nada, la del grado tampoco, y
el `generateSlug` recibe `undefined`.

En la práctica no ocurre porque la pantalla siempre manda los campos, pero la API
por sí sola no lo impide. El `@IsOptional()` está ahí más que todo porque el
mismo DTO se reusa para el `PATCH`, donde sí tiene sentido que todo sea opcional.

### Posible solución

Separar los dos DTO: uno de creación con `nombre` y `gradoId` obligatorios, y
dejar el `PartialType` solamente para la actualización.
