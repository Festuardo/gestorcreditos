# Gestor de Créditos

Versión conectada a Supabase con autenticación y permisos por rol.

## Estructura

- `index.html`: portada del sistema.
- `login.html`: acceso mediante Supabase Auth.
- `gestor.html`: consulta compartida y administración de cartera.
- `css/portal.css` y `css/app.css`: estilos independientes.
- `js/config.js`: configuración pública de Supabase.
- `js/login.js`: autenticación.
- `js/gestor.js`: consulta, paginación y carga administrativa.
- `images/logo.png`: identidad visual actual.
- `plantillas/Plantilla_Cartera_Creditos.xlsx`: archivo base para cargar la cartera.

## Roles

- `administrador`: consulta y reemplaza la cartera.
- `consulta`: visualiza y busca registros, sin acceso a la carga.

La aplicación debe abrirse mediante un servidor web o GitHub Pages; no se recomienda ejecutarla con `file://`.

La interfaz es adaptable: en pantallas pequeñas los registros se presentan como fichas para facilitar la lectura desde teléfonos.

## Instalación en dispositivos

La aplicación es una PWA compatible con computadoras, tablets, teléfonos Android y iPhone.

- Android (Chrome): abre el sitio y toca **Instalar aplicación**. También puedes usar el menú de Chrome y elegir **Instalar aplicación** o **Agregar a pantalla principal**.
- iPhone (Safari): abre el sitio, toca **Compartir** y luego **Añadir a pantalla de inicio**.
- Computadora (Chrome o Edge): usa el botón **Instalar aplicación** que aparece en la barra de direcciones o dentro del sitio.

La estructura visual puede abrirse si se pierde momentáneamente la conexión. El inicio de sesión, las consultas, la carga de Excel y la información de cartera requieren internet porque trabajan directamente con Supabase.
