# Guía Paso a Paso: Desplegar en Vercel

Como detecté que **Git no está instalado** o configurado en tu terminal actual, la forma más rápida de subir tu aplicación es usando la herramienta oficial de Vercel.

## Opción 1: Método Rápido (Recomendado ahora)
Este método sube tu carpeta directamente a Vercel sin necesidad de crear repositorios ni instalar Git.

### Paso 1: Instalar la herramienta de Vercel
Ejecuta este comando en la terminal para instalar el "Desplegador" de Vercel globalmente:
```powershell
npm install -g vercel
```

### Paso 2: Iniciar Sesión
Una vez instalado, ejecuta:
```powershell
vercel login
```
*   Te pedirá elegir cómo iniciar sesión (GitHub, Email, etc.).
*   Usa las flechas del teclado para seleccionar y Enter.
*   Se abrirá una ventana en tu navegador para confirmar.

### Paso 3: Desplegar
Estando en la carpeta de tu proyecto (`D:\Finanza`), escribe:
```powershell
vercel
```

Te hará unas preguntas sencillas. Responde así (presiona Enter para confirmar las opciones por defecto):

1.  **Set up and deploy "D:\Finanza"?** -> `y` (Yes)
2.  **Which scope do you want to deploy to?** -> Selecciona tu usuario.
3.  **Link to existing project?** -> `n` (No)
4.  **What’s your project’s name?** -> `finanza` (o el nombre que quieras)
5.  **In which directory is your code located?** -> `./` (Solo presiona Enter)
6.  **Want to modify these settings?** -> `n` (No)

¡Listo! Vercel subirá tus archivos, detectará que es una app **Vite** y te dará una URL de producción (ej: `https://finanza-xyz.vercel.app`) en menos de un minuto.

---

## Opción 2: Para Producción (Recomendada a futuro)
Si quieres que tu sitio se actualice automáticamente cada vez que guardes cambios, necesitarás instalar Git.

1.  Descarga e instala **Git for Windows**: [git-scm.com/download/win](https://git-scm.com/download/win)
2.  Crea una cuenta en **GitHub**.
3.  Crea un "New Repository" vacío en GitHub.
4.  En tu terminal de proyecto:
    ```powershell
    git init
    git add .
    git commit -m "Primera version"
    git branch -M main
    git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
    git push -u origin main
    ```
5.  Ve a [Vercel.com](https://vercel.com/new), importa tu repositorio de GitHub y haz clic en "Deploy".
