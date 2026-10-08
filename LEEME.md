# CalorFS v2 — Guía de instalación y publicación

Herramienta gratuita de **Fredy Safe** para SST: índice de calor (Rothfusz/NOAA), nivel de riesgo con acción inmediata y revisión de termos de agua con fotos y firma. Cada reporte se descarga en PDF al momento. **La app no guarda reportes**: solo administra las cuentas de usuario (registro con tu aprobación).

## Contenido

| Archivo | Qué es |
|---|---|
| `index.html` | La app completa |
| `sw.js` | Service worker (funciona sin conexión y avisa de actualizaciones) |
| `manifest.json` | Manifiesto PWA (nombre, colores, íconos) |
| `icons/` | Íconos con tu logo |
| `firestore.rules` | Reglas de seguridad de Firestore (solo cuentas de usuario) |

## Si ya tenías publicada la versión anterior

1. Abre el `index.html` nuevo en el Bloc de notas y vuelve a pegar tus datos en `FIREBASE_CONFIG` (son los mismos de antes). Guarda en **UTF-8**.
2. En GitHub, sube y reemplaza `index.html`, `sw.js`, `manifest.json` y `firestore.rules`.
3. En Firebase → Firestore → **Reglas**, pega el `firestore.rules` nuevo y da **Publicar**.
4. Tu cuenta de administrador y tu contraseña se mantienen.
5. Opcional: en Firestore → Datos puedes borrar las colecciones `calculos`, `termos` y `proyectos` si alguna llegó a crearse; ya no se usan.

## Instalación desde cero

1. **Firebase** (https://console.firebase.google.com): crea el proyecto; activa **Authentication → Correo electrónico/contraseña**; crea **Firestore Database** en modo producción; en **Reglas** pega `firestore.rules` y publica.
2. **Configuración del proyecto → Tus apps → Web (`</>`)**: registra la app y copia los datos de `firebaseConfig` en `FIREBASE_CONFIG` dentro de `index.html`.
3. **GitHub**: crea el repositorio `calorfs` (público), sube todo el contenido de la carpeta incluyendo `icons/`, y activa **Settings → Pages → Deploy from a branch → main / (root)**.
4. **Firebase → Authentication → Configuración → Dominios autorizados**: agrega `TU-USUARIO.github.io`.
5. Abre tu URL y regístrate con el correo del administrador principal (`SUPER_ADMIN_EMAIL`, hoy `jalfred.goga@gmail.com`). Entras directo como administrador.

## Configuración rápida (en `index.html`)

| Variable | Para qué |
|---|---|
| `FIREBASE_CONFIG` | Datos de tu proyecto Firebase |
| `SUPER_ADMIN_EMAIL` | Administrador principal. Si lo cambias, cámbialo también en `superEmail()` de `firestore.rules` |
| `BRAND` | Tu marca (“Fredy Safe”): aparece en la app y en el encabezado y pie de cada PDF |
| `SOCIAL` | Tus redes: enlace (`url`) y texto para el PDF (`usuario`). Para agregar otra red, copia una línea y cambia los datos |
| `SUN_ADD_C` | °C que se suman bajo sol directo (8) |

## Cómo funciona

- **Registro y acceso:** cada persona se registra y queda *pendiente*. En **Admin** la autorizas o rechazas y puedes avisarle por Gmail. También puedes suspender, reactivar y **designar otros administradores**. Nadie puede quitarle permisos al administrador principal.
- **Cambiar contraseña:** en **Perfil → Cambiar contraseña** (pide la contraseña actual). Si la olvidas, usa “¿Olvidaste tu contraseña?” en la pantalla de inicio.
- **Reportes:** “Descargar reporte PDF” en Calcular y en Termos. En el celular abre el menú de compartir (WhatsApp, correo, Drive); en computadora se descarga.
- **Marca personal:** tus redes aparecen en la pantalla de inicio, en Calcular y en Perfil, y en el pie de cada PDF. El botón **Compartir CalorFS** manda el enlace de la app con un texto de invitación.
- **Sin conexión:** después de entrar una vez con internet, se puede calcular y generar PDF sin señal.

## APK para Android (opcional)

Entra a https://www.pwabuilder.com, pega tu URL de GitHub Pages y elige **Package for stores → Android**. Sube el `assetlinks.json` que te da a `.well-known/assetlinks.json` en tu repositorio. El APK carga tu sitio, así que lo que actualices en GitHub les llega a todos.

## Publicar actualizaciones

Sube los archivos modificados y cambia `VERSION` en `sw.js` (y `APP_VERSION` en `index.html`). Los usuarios verán “Nueva versión disponible → Actualizar”.

## Notas técnicas

- **Fórmula:** regresión de Rothfusz (NOAA/NWS) con ajustes por humedad baja (<13 %) y alta (>85 %); por debajo de 80 °F se usa la fórmula de Steadman.
- **Niveles (NWS):** Sin riesgo < 26.7 °C · Precaución 26.7–32.2 · Precaución Extrema 32.2–39.4 · Peligro 39.4–51.7 · Peligro Extremo ≥ 51.7 °C.
- **Alcance:** herramienta de tamizaje; la evaluación formal de condiciones térmicas elevadas es por índice TGBH (NOM-015-STPS-2001).

---
Elaborado por José Alfredo González García · Fredy Safe
