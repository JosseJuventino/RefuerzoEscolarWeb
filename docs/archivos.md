# Archivos e imágenes

## Piezas

| Archivo                                                                          | Rol                                                                    |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [images/images.service.ts](../refuerzo-apiv2/src/images/images.service.ts)       | Recibe la imagen, la convierte a WebP y la guarda en disco.            |
| [document/document.service.ts](../refuerzo-apiv2/src/document/document.service.ts) | Lo mismo pero para PDF, sin conversión.                             |
| [app.module.ts](../refuerzo-apiv2/src/app.module.ts)                             | El `ServeStaticModule` que expone la carpeta `uploads/` por HTTP.      |
| [next.config.ts](../refuerzo-web/next.config.ts)                                 | Los dominios desde los que `next/image` acepta cargar imágenes.        |
| [services/images.service.ts](../refuerzo-web/services/images.service.ts)          | El `FormData` que arma la web para subir.                              |

## Cómo funciona, en general

Los archivos **no se guardan en Mongo**. Se guardan en el disco del servidor,
dentro de `refuerzo-apiv2/uploads/`, y en Mongo solo queda un registro con el
nombre original, el nombre con el que se guardó y la URL pública.

Después, `ServeStaticModule` expone esa carpeta completa en la ruta `/uploads`.
Es decir, cualquiera que tenga la URL puede abrir el archivo, sin token.

Entonces el orden siempre es: primero se sube el archivo y se recibe una URL, y
después esa URL se guarda en el documento que la va a usar (el usuario, la
sección o la publicación). Nunca se manda el archivo junto con el resto de los
datos.

## Subir una imagen, paso a paso

1. La web arma un `FormData` con tres campos: `file`, `originalFilename` y
   `category`.
2. Lo manda a `POST /images`.
3. La API revisa que el archivo no pase de **5 MB**.
4. Revisa que el tipo sea uno de estos: JPEG, PNG, WebP, GIF o TIFF.
5. Crea la carpeta `uploads/images/<category>/` si no existe.
6. Genera un nombre único con UUID y extensión `.webp`.
7. **Convierte la imagen a WebP con calidad 30** usando `sharp`, y la escribe en
   disco.
8. Arma la URL pegando `NEXT_PUBLIC_API_URLV2` con la ruta del archivo.
9. Guarda el registro en la colección `Image` y devuelve la URL.

El paso 7 conviene tenerlo presente: **todo se convierte a WebP y con calidad
30**, que es bastante agresivo. Es decir, no se guarda el archivo original en
ningún lado. Si alguien sube una foto de 4 MB, lo que queda en disco pesa unos
pocos kilobytes y ya no se puede recuperar la calidad original.

Para fotos de perfil y fondos de sección eso está bien y es justamente lo que se
quiere. Para un material de apoyo que sea una imagen con texto, puede quedar
demasiado comprimido.

## Las categorías

La `category` no es libre en la práctica, aunque la API acepta cualquier texto.
Es lo que define en qué subcarpeta cae el archivo. Hoy se usan estas:

| Categoría                 | Para qué                                        |
| ------------------------- | ------------------------------------------------- |
| `profile_images`          | La foto de perfil, al activar la cuenta.          |
| `section_images`          | La imagen de fondo de una sección.                |
| `files_images_section`    | Las imágenes adjuntas a una publicación.          |
| `files_documents_section` | Los PDF adjuntos a una publicación.               |

Hay que tener presente que la API **no valida** que la categoría sea una de
esas. Es decir, si alguien manda una categoría con un nombre nuevo, se crea la
carpeta y funciona igual. Eso es cómodo pero también significa que un error de
escritura crea una carpeta huérfana sin que nadie se entere.

## Subir un documento

Es prácticamente lo mismo, con dos diferencias:

- Solo acepta `application/pdf`. Cualquier otra cosa da `400`.
- No hay conversión: el archivo se escribe tal cual llegó.

Si el nombre original no termina en `.pdf`, la API se lo agrega.

## La URL se arma con una variable de entorno

Este es el detalle que más problemas causa al mover el proyecto de un lado a
otro.

La URL que se guarda en Mongo se arma así:

```ts
const imageUrl = `${this.configService.get('NEXT_PUBLIC_API_URLV2')}/uploads/images/...`;
```

Es decir, **la URL completa queda guardada en la base de datos**, no una ruta
relativa.

Eso tiene dos consecuencias:

- Si `NEXT_PUBLIC_API_URLV2` no está definida, las URLs quedan guardadas
  literalmente como `undefined/uploads/images/...`. Y quedan así para siempre:
  definir la variable después no arregla los registros viejos.
- Si algún día cambia el dominio, todas las URLs guardadas siguen apuntando al
  dominio viejo. Habría que actualizarlas con una migración.

En local, esa variable tiene que valer `http://localhost:3005`. En producción,
`https://refuerzo-mendoza.me/apiv2`.

## Por qué a veces `next/image` se queja

Next.js no carga imágenes de cualquier dominio. Hay que declararlos en
[next.config.ts](../refuerzo-web/next.config.ts), y si falta uno sale este error:

```
Invalid src prop (...) on `next/image`, hostname "localhost" is not configured
under images in your `next.config.js`
```

Como la URL de la imagen se arma con `NEXT_PUBLIC_API_URLV2`, trabajar en local
significa que las imágenes vienen de `localhost:3005`, y ese host tiene que estar
en la lista.

Dos cosas que conviene recordar:

- Ese archivo **no se recarga en caliente**. Después de tocarlo hay que reiniciar
  `npm run dev`.
- Si en local se ven imágenes que apuntan a `refuerzo-mendoza.me`, es porque son
  registros creados contra la base de producción. Por eso ese dominio también
  está en la lista.

## Riesgo conocido: subir imágenes es público

`POST /images` tiene `@Public()`. Es decir, cualquiera que sepa la URL puede
subir imágenes al servidor sin necesidad de tener cuenta.

Está así porque la foto de perfil se sube durante la activación, y en ese momento
la persona ya tiene sesión, así que realmente no hacía falta abrirlo.

El riesgo concreto es que alguien llene el disco del servidor subiendo imágenes
en un ciclo. El límite de 5 MB por archivo existe, pero no hay límite de cantidad
ni control de velocidad.

### Posible solución

Quitarle el `@Public()`. Habría que revisar que el interceptor de axios esté
mandando el token en esa petición, cosa que ya hace, y que el rol de alumno tenga
`pages.image` con `view` y `edit`.

## Riesgo conocido: los archivos huérfanos no se limpian

Cuando se borra una publicación, sus archivos sí se borran. Eso está resuelto.

Lo que no está resuelto es todo lo demás:

- Si alguien sube una imagen y después cancela el formulario, el archivo se queda
  en disco y el registro en Mongo.
- Al cambiarle la foto de perfil a un usuario, la foto vieja no se borra.
- Al cambiarle la imagen de fondo a una sección, pasa lo mismo.

Es decir, la carpeta `uploads/` solo crece. No molesta hoy, pero conviene saber
que ahí hay archivos que ya nadie usa.

### Posible solución

Un script de mantenimiento que compare los registros de `Image` y `Document`
contra las URLs realmente referenciadas en `Users`, `Secciones` y
`Publicaciones`, y borre lo que no aparezca en ninguna. Conviene correrlo primero
en modo de solo listar, antes de dejarlo borrar.

## Riesgo conocido: los archivos no están en el repositorio ni en el respaldo

La carpeta `uploads/` vive únicamente en el disco del servidor. No está
versionada, y como los archivos no están en Mongo, tampoco entran en un respaldo
de la base de datos.

Entonces, un respaldo de Mongo restaura todas las URLs pero **ninguna imagen**.
Todas las fotos de perfil y todos los materiales quedarían rotos.

Si se va a respaldar algo, esa carpeta hay que respaldarla aparte.
