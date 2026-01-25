# Guía de Despliegue - Finanza

Al ser una aplicación **100% estática** (se ejecuta en el navegador y usa base de datos local), puedes desplegarla **gratis** en múltiples plataformas.

Aquí están las mejores opciones ordenadas por facilidad de uso:

## Opción 1: Netlify (La más fácil - Drag & Drop)
Ideal si no quieres usar comandos ni configurar Git.

1.  Ejecuta el comando de construcción en tu terminal:
    ```bash
    npm run build
    ```
    Esto creará una carpeta `dist` en tu proyecto.
2.  Ve a [netlify.com](https://www.netlify.com) y regístrate (gratis).
3.  En tu panel de Netlify, verás una zona que dice **"Drag and drop your site output folder here"**.
4.  Arrastra la carpeta `dist` de tu explorador de archivos y suéltala ahí.
5.  ¡Listo! En segundos tendrás una URL segura (`https://tu-sitio.netlify.app`).

---

## Opción 2: Vercel (Recomendada para Git)
Ideal si tienes tu código en GitHub.

1.  Sube tu código a un repositorio de GitHub.
2.  Ve a [vercel.com](https://vercel.com) y entra con tu cuenta de GitHub.
3.  Haz clic en **"Add New..."** -> **"Project"**.
4.  Selecciona tu repositorio de `Finanza`.
5.  Vercel detectará automáticamente que es un proyecto **Vite**.
6.  Haz clic en **Deploy**.
7.  Cada vez que hagas un `git push`, Vercel actualizará tu sitio automáticamente.

---

## Opción 3: Cloudflare Pages
Muy rápida y segura.

1.  Conecta tu cuenta de GitHub en [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Pages**.
2.  Selecciona tu repositorio.
3.  En "Framework preset", elige **Vite**.
4.  Deploy.

## Notas Importantes (PWA)
Para que la aplicación funcione correctamente como una App Instalable (PWA) en estos servicios, asegúrate de que el archivo `sw.js` (Service Worker) sea accesible. La configuración actual de Vite ya lo maneja, así que no deberías tener problemas.
