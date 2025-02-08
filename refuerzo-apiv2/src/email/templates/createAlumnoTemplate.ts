export const alumnoAccountCreatedTemplate = (
  nombre: string,
  temporaryPassword: string,
) => {
  return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cuenta de Alumno Creada</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
              .email-container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              }
              .email-header {
                  background-color: #003C71;
                  color: #ffffff;
                  text-align: center;
                  height: 50px;
                  padding: 20px;
              }
              .email-header img {
                  max-width: 150px;
                  height: auto;
              }
              .email-body {
                  padding: 20px;
                  color: #333333;
              }
              .email-body h1 {
                  font-size: 24px;
                  margin-bottom: 20px;
                  color: #003C71;
              }
              .email-body p {
                  font-size: 16px;
                  line-height: 1.5;
                  margin-bottom: 20px;
              }
              .email-body strong {
                  color: #003C71;
              }
              .email-footer {
                  background-color: #f4f4f4;
                  text-align: center;
                  padding: 10px;
                  font-size: 14px;
                  color: #666666;
              }
              .btn-container {
                  text-align: center;
                  margin: 20px 0;
              }
              .btn {
                  display: inline-block;
                  padding: 10px 20px;
                  font-size: 16px;
                  color: white;
                  background-color: #003C71;
                  border-radius: 5px;
                  text-decoration: none;
                  text-align: center;
                  border: none;
                  cursor: pointer;
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="email-header">
                   
              </div>
              <div class="email-body">
                  <h1>Cuenta de Alumno Creada</h1>
                  <p>Hola <strong>${nombre}</strong>,</p>
                  <p>Tu cuenta de alumno ha sido creada exitosamente. A continuación, encontrarás los detalles de acceso:</p>
                  <p><strong>Contraseña temporal:</strong> ${temporaryPassword}</p>
                  <p>Por favor, inicia sesión y cambia tu contraseña lo antes posible.</p>

                  <div class="btn-container">
                      <a href="https://refuerzo-mendoza.me/" class="btn">Iniciar sesión</a>
                  </div>

                  <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.</p>
              </div>
              <div class="email-footer">
                  <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                  <p>&copy; 2023 Refuerzo Escolar Mendoza. Todos los derechos reservados.</p>
              </div>
          </div>
      </body>
      </html>
    `;
};
