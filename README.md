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
