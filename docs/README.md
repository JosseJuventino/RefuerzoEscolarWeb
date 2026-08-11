# Documentación de RefuerzoEscolarWeb

Acá está explicado **cómo funciona la plataforma**, no cómo instalarla. Para lo
de instalar, levantar y desplegar, eso está en el [README de la raíz](../README.md).

Esta carpeta vive en la raíz del monorepo a propósito. Casi ningún flujo pasa
solamente por la API o solamente por la web: la postulación empieza en un
formulario de Next y termina creando tres documentos en Mongo, la asistencia se
calcula en el navegador y se normaliza en Nest, y los permisos se deciden en la
API pero el menú se pinta en la web. Documentar cada lado por separado
básicamente obligaría a leer las dos mitades para entender una sola cosa.

## Los documentos

| Documento                                        | De qué trata                                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| [Visión general](vision-general.md)              | Qué es cada pieza del monorepo y cómo se guardan los datos. **Empezá por acá.**                          |
| [Roles y permisos](roles-y-permisos.md)          | Los cinco roles, cómo se decide quién puede hacer qué, y por qué el menú de la web no es una protección. |
| [Sesión y login](sesion-y-login.md)              | Cómo se entra, qué es realmente el token que viaja, y por qué una cuenta nueva no puede usar nada.       |
| [Postulación](postulacion.md)                    | El camino completo desde el formulario hasta que el alumno aparece en su sección.                        |
| [Cuentas y usuarios](cuentas-y-usuarios.md)      | Los tres caminos para crear una cuenta, las contraseñas temporales y la recuperación de contraseña.      |
| [Cursos y secciones](cursos-y-secciones.md)      | Grados, programas, secciones, quién entra a cada una y el tablón de publicaciones.                       |
| [Asistencia](asistencia.md)                      | Cómo se registra, por qué una asistencia es un día y no una hora, y cómo funciona el historial.          |
| [Archivos e imágenes](archivos.md)               | Qué pasa cuando alguien sube una foto o un PDF, y dónde terminan guardados.                              |

## Cómo leer esto

Cada documento arranca con una tabla de **piezas** (qué archivo hace qué) y
después explica el flujo **en pasos**. Al final, casi todos tienen una sección
de **riesgos conocidos**: cosas que hoy funcionan pero que se pueden romper, o
que ya están medio rotas y conviene tener presentes antes de tocarlas.

No hay diagramas a propósito. La idea es que se pueda leer de corrido.
