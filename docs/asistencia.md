# Asistencia

## Piezas

| Archivo                                                                                                             | Rol                                                                        |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [asistencia/entities/asistencia.entity.ts](../refuerzo-apiv2/src/asistencia/entities/asistencia.entity.ts)          | El documento: **uno solo por sección**, con todos los registros adentro.    |
| [asistencia/service/asistencia.service.ts](../refuerzo-apiv2/src/asistencia/service/asistencia.service.ts)          | Toda la lógica: normalizar la fecha, actualizar o crear registros, agrupar. |
| [my-courses/[slug]/asistencia/page.tsx](../refuerzo-web/app/dashboard/my-courses/[slug]/asistencia/page.tsx)         | La pantalla de pasar lista.                                                |
| [my-courses/[slug]/historial/page.tsx](../refuerzo-web/app/dashboard/my-courses/[slug]/historial/page.tsx)           | La tabla del mes, por sábados.                                             |
| [utils/fecha.ts](../refuerzo-web/utils/fecha.ts)                                                                    | Las funciones del "día de asistencia". Acá vive la convención de fechas.    |
| [components/Asistencia/AsistenciaCard.tsx](../refuerzo-web/components/Asistencia/AsistenciaCard.tsx)                 | La tarjeta de cada persona con sus tres botones.                           |

## Cómo se guarda

Esto es lo primero que hay que entender, porque no es lo que uno esperaría.

**No hay un documento por asistencia.** Hay un solo documento por sección, y
adentro tiene dos arreglos con absolutamente todos los registros de todas las
fechas:

```json
{
  "seccionId": "67fa77d8...",
  "alumnos": [
    { "id": "...", "alumnoId": "...", "fecha": "2026-08-10T12:00:00.000Z", "estado": "asistió" }
  ],
  "encargados": [
    { "id": "...", "userId": "...", "fecha": "...", "estado": "asistio",
      "hora_inicio": "...", "hora_fin": "..." }
  ]
}
```

Ese documento se crea **junto con la sección**, vacío. Es decir, no aparece
cuando alguien pasa lista por primera vez: ya existe desde antes.

Entonces, si por lo que sea ese documento no está, todos los endpoints de
asistencia de esa sección van a dar error diciendo que no se encontró. Eso pasa
con las secciones que se hayan creado a mano en Mongo, sin pasar por la API.

Los alumnos y los encargados se guardan distinto a propósito: al alumno solo se
le marca el estado del día, mientras que al encargado además se le guarda hora de
entrada y hora de salida.

## Una asistencia es un día, no un momento

Este es el punto central de todo el módulo, y de él dependen la pantalla de
registro, el historial y la lógica de actualizar en vez de duplicar.

Cuando se marca que alguien asistió, lo que realmente interesa es **qué día fue**,
no a qué hora se apretó el botón. Es decir, la fecha funciona como una etiqueta
de calendario, no como un instante.

El problema es que una fecha en JavaScript sí es un instante, y al convertirla a
texto con `toISOString()` queda en UTC. Y El Salvador está en UTC-6.

Entonces, si alguien pasa lista a las 9 de la noche del 10 de agosto, el instante
real es:

```
2026-08-11T03:34:48.707Z
```

Es decir, en UTC ya es **11 de agosto**. El día que ve el usuario y el día que se
guarda no coinciden.

Eso fue exactamente lo que causaba el bug de "la asistencia no se guarda": el
registro sí se guardaba, pero la pantalla filtra los registros de hoy comparando
el día local contra el día del registro, no coincidían, y al recargar los estados
volvían a "No registrado". Se veía como si nunca se hubiera guardado.

### La convención: mediodía UTC

Para arreglarlo, la fecha de una asistencia se ancla siempre al **mediodía UTC
del día local**:

```
2026-08-10T12:00:00.000Z
```

La razón de escoger el mediodía y no la medianoche es sencilla: a las 12:00 UTC
uno está lo más lejos posible de los dos bordes del día, entonces el `YYYY-MM-DD`
en UTC sigue siendo el mismo día calendario sin importar la zona horaria. Con la
medianoche eso no se cumple.

Esa convención vive en [utils/fecha.ts](../refuerzo-web/utils/fecha.ts) del lado
de la web, y se refuerza del lado de la API en `normalizeDiaAsistencia()`. Es
decir, **aunque el cliente mande otra cosa, el servidor la vuelve a anclar**. Eso
es a propósito: así el día queda canónico aunque alguien llame al endpoint
directo.

El punto importante es que todo lo que compare fechas de asistencia tiene que
usar esa misma convención. Si en algún lado se vuelve a usar
`new Date().toISOString()` directo, el bug regresa.

## Pasar lista, paso a paso

1. La pantalla pide `GET /asistencia/seccion/:seccionId`, que devuelve el
   documento completo con los nombres e imágenes ya poblados.
2. Filtra en el navegador los registros cuyo día sea **hoy** y arma el estado
   local. Los demás días se ignoran acá.
3. Se recorren los alumnos de la sección, que salen del contexto del curso, no
   de la asistencia. Es decir, aparecen todos, hayan sido marcados o no.
4. Al tocar uno de los tres botones (asistió, faltó, permiso) se actualiza
   solamente el estado local. **Todavía no se manda nada.**
5. El botón "Guardar Asistencias" se habilita únicamente si hubo cambios respecto
   a lo que se cargó.
6. Al guardar, se manda `POST /asistencia/alumno/:seccionId` con el arreglo
   completo de lo que está en pantalla.
7. La API recorre cada registro: normaliza la fecha al mediodía UTC y busca si ya
   existe un registro de ese alumno para ese mismo día.
   - Si ya existe, le actualiza el estado.
   - Si no existe, lo agrega con un `id` nuevo.
8. Guarda el documento completo y la web vuelve a pedir los datos.

El paso 7 es lo que hace que se pueda corregir la asistencia del mismo día sin
duplicar. Pasar lista dos veces el mismo día no crea dos registros, actualiza el
que ya estaba.

También hay una protección contra mandar el mismo alumno dos veces en la misma
petición: eso da `409`.

## Registrar un encargado

Los encargados no van con los tres botones, van con un formulario aparte, porque
además del estado hay que ponerles hora de entrada y hora de salida.

1. Se abre el modal desde la pestaña, cambiando el selector a "Encargados".
2. Se escoge el estado. Si es `falto` o `permiso`, las horas se ponen en cero y
   los campos se desactivan.
3. Se escoge la fecha, o se marca "llenar asistencia de hoy".
4. Se manda `POST /asistencia/encargado/:seccionId`.
5. La API valida que la hora de inicio sea menor que la de fin.
6. Revisa **solapamientos**: si esa persona ya tiene otro registro cuyo horario
   se cruce con el nuevo, tira `409`. Si está editando el registro de ese día, se
   excluye a sí mismo de la comparación.
7. Igual que con los alumnos, si ya había registro de ese día lo actualiza, y si
   no, lo crea.

La fecha del encargado también se ancla al mediodía UTC. Las horas de entrada y
salida no: esas sí son instantes de verdad y se guardan tal cual.

## El historial

La pestaña de historial muestra una tabla del mes, con una columna por **sábado**,
porque el refuerzo es sabatino.

1. La pantalla pide `GET /asistencia/seccion/:id/alumnos-agrupados?month=&year=`.
2. La API filtra los registros que caigan dentro de ese mes y los agrupa por día,
   quedando un objeto donde la llave es `YYYY-MM-DD`.
3. La web calcula los sábados de ese mes y, para cada alumno y cada sábado, busca
   en ese objeto usando la misma llave.

Como los registros están anclados al mediodía UTC, la llave que arma el servidor
y la que arma el navegador coinciden.

Hay que tener presente que la tabla solo muestra sábados. Es decir, si alguien
pasa lista un miércoles, ese registro se guarda bien y sale por la API, pero en
el historial **no se ve**, porque no hay columna para ese día.

## Los estados no están unificados

Este detalle vale la pena tenerlo presente porque se nota al leer los datos.

Los alumnos se guardan con `"asistió"`, con tilde, y los encargados con
`"asistio"`, sin tilde. Eso es porque cada pantalla arma su propio valor y nunca
se unificaron.

El historial lo resuelve aceptando los dos:

```ts
'asistió': <Check ... />,
'asistio': <Check ... />,
```

No está roto, pero si alguien va a contar asistencias o sacar reportes, tiene que
acordarse de contemplar las dos escrituras.

## Riesgo conocido: el documento crece sin límite

Como es un solo documento por sección y adentro va todo el historial, ese
documento crece con cada día que se pasa lista.

Cada vez que alguien guarda asistencia, la API **lee el documento completo, lo
modifica en memoria y lo vuelve a escribir completo**. Con una sección de 20
alumnos y un año de sábados son unos 900 registros por documento, y eso todavía
se maneja bien.

El problema es que MongoDB tiene un límite duro de 16 MB por documento. No se va
a llegar pronto, pero el patrón no escala y además hace que dos personas pasando
lista al mismo tiempo en la misma sección puedan pisarse: la última escritura
gana y se lleva por delante lo de la otra.

### Posible solución

Lo correcto sería una colección de registros individuales, con un documento por
alumno-fecha, en vez de un arreglo dentro de la sección. Eso resuelve el tamaño y
también las escrituras simultáneas, pero es un cambio grande porque hay que
migrar los datos que ya existen.

Mientras tanto, algo más barato es que la actualización use operadores de MongoDB
sobre el arreglo en lugar de reescribir el documento entero.

## Riesgo conocido: quedan registros viejos con la fecha corrida

Todos los registros guardados **antes** del arreglo de zona horaria tienen la
fecha con la hora exacta del click, no anclada al mediodía.

Los que se hicieron de día están bien, porque su día UTC coincide con el local.
Los que se hicieron después de las 6 de la tarde quedaron guardados con el día
siguiente.

Esos registros no se corrigen solos. Van a seguir apareciendo en el historial
bajo el día equivocado, y como la comparación de "¿ya existe registro de este
día?" se hace por día, volver a pasar lista de ese día crea un registro nuevo en
lugar de arreglar el viejo.

### Posible solución

Una migración de una sola pasada que recorra los documentos de `Asistencia` y
reescriba cada `fecha` anclada al mediodía UTC del día local. Como El Salvador es
UTC-6 fijo y no tiene horario de verano, se puede calcular restando 6 horas antes
de sacar el día.

Hay que tener cuidado con los duplicados: si al corregir dos registros terminan
cayendo en el mismo día para el mismo alumno, hay que decidir con cuál quedarse.

## Riesgo conocido: no se puede borrar un registro

Existen endpoints para crear y actualizar registros de asistencia, pero no hay
ninguno para borrar uno solo.

Es decir, si se marca a alguien por equivocación, lo único que se puede hacer es
cambiarle el estado. El registro queda ahí para siempre.

Eso normalmente no molesta, porque los tres estados cubren casi todo. Pero si
alguien pasó lista en la sección equivocada, esos registros no hay forma de
sacarlos desde la aplicación: toca ir a Mongo.
