# CalorFS — Guía de instalación y publicación

PWA para supervisores SST: índice de calor (Rothfusz/NOAA), nivel de riesgo con acción inmediata, revisión de termos de agua con fotos, firma y acciones correctivas, panel por proyecto, historial en la nube y notificación por Gmail. Funciona sin conexión.

## Contenido del paquete

| Archivo | Qué es |
|---|---|
| `index.html` | La app completa (HTML + CSS + JS en un solo archivo) |
| `sw.js` | Service worker (modo sin conexión y actualizaciones) |
| `manifest.json` | Manifiesto PWA (nombre, colores, íconos) |
| `icons/` | Íconos generados con tu logo (192, 512, maskable, iPhone, favicon) |
| `firestore.rules` | Reglas de seguridad de Firestore |

> Sin configurar Firebase, la app abre en **modo demostración**: todo se guarda solo en ese dispositivo y el primer usuario que se registra queda como administrador. Sirve para probarla.

---

## 1. Crear el proyecto en Firebase (gratis, plan Spark)

1. Entra a https://console.firebase.google.com → **Agregar proyecto** → nombre `calorfs` (Google Analytics es opcional).
2. **Authentication** → Comenzar → **Correo electrónico/contraseña** → Habilitar → Guardar.
3. **Firestore Database** → Crear base de datos → modo **producción** → ubicación `nam5 (us-central)` o la más cercana.
4. **Firestore → Reglas**: borra lo que hay, pega el contenido de `firestore.rules` y da **Publicar**.
5. **Configuración del proyecto (⚙️) → Tus apps → Web (`</>`)** → registra la app `CalorFS` (sin Hosting). Copia el objeto `firebaseConfig`.

> Las fotos y firmas se guardan comprimidas dentro de cada registro de Firestore, así que **no necesitas Firebase Storage** (que ya exige el plan de pago Blaze).

## 2. Pegar la configuración en la app

Abre `index.html` y busca el bloque **CONFIGURACIÓN** (al inicio del `<script>`):

```js
const FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "calorfs.firebaseapp.com",
  projectId: "calorfs",
  storageBucket: "calorfs.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
const SUPER_ADMIN_EMAIL = "ingreenglez@gmail.com";
```

`SUPER_ADMIN_EMAIL` es el **administrador principal**: queda aprobado solo al registrarse y ningún otro admin puede quitarle permisos. Si lo cambias, cámbialo también en `firestore.rules` (función `superEmail()`).

## 3. Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub, por ejemplo `calorfs` (público).
2. Sube **todos** los archivos de esta carpeta respetando la carpeta `icons/` (Add file → Upload files).
3. **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main` / `(root)` → Save.
4. En 1–2 minutos queda en `https://TU-USUARIO.github.io/calorfs/`.
5. De vuelta en Firebase: **Authentication → Configuración → Dominios autorizados → Agregar dominio** → `TU-USUARIO.github.io`.

## 4. Primer ingreso y administración

1. Abre la URL y **regístrate con el correo del administrador principal** antes que nadie.
2. En **Admin → Proyectos** crea tus proyectos (nombre, cliente, ubicación y **correos para alertas**).
3. Comparte la URL con tu equipo. Cada persona se registra y queda **pendiente**.
4. En **Admin → Solicitudes pendientes → Autorizar…** eliges su **rol** y sus **proyectos**, y opcionalmente le avisas por Gmail. La pantalla del usuario se desbloquea sola.

| Rol | Puede |
|---|---|
| **Administrador** | Todo: autorizar/rechazar/suspender usuarios, crear proyectos, asignar proyectos, designar otros administradores, ver y borrar cualquier registro |
| **Supervisor** | Capturar índices de calor y revisiones de termos en sus proyectos; ver panel e historial de sus proyectos (incluye registros de otros supervisores); cerrar acciones correctivas del proyecto |
| **Visor** | Solo consulta el panel e historial de sus proyectos (cliente, gerencia). No captura |

## 5. Instalar en el celular

- **Android (Chrome):** abre la URL → menú ⋮ → **Instalar aplicación** (o el botón *Instalar CalorFS* en Perfil).
- **iPhone (Safari):** Compartir → **Agregar a pantalla de inicio**.
- La primera vez necesita internet para iniciar sesión. Después funciona sin señal: los registros se guardan en el teléfono y se sincronizan solos al volver la conexión (verás ⟳ en los pendientes).

### APK para Android / Play Store (opcional)

1. Entra a https://www.pwabuilder.com, pega tu URL de GitHub Pages → **Package for stores → Android**.
2. Descarga el paquete: incluye el `.apk` para instalar directo y el `.aab` para Play Store, más un archivo `assetlinks.json`.
3. Sube `assetlinks.json` al repositorio en `.well-known/assetlinks.json` para que la app abra sin barra de navegador.
4. El APK carga tu sitio de GitHub Pages, así que **cada cambio que subas al repo le llega a todos sin reinstalar**.

## 6. Publicar actualizaciones

1. Edita y sube los archivos al repositorio.
2. En `sw.js` cambia `VERSION` (ej. `calorfs-v1.0.1`) y en `index.html` `APP_VERSION`.
3. Los usuarios verán el aviso **“Nueva versión disponible → Actualizar”**.

## 7. Notas técnicas

- **Fórmula:** regresión de Rothfusz (NOAA/NWS) en °F con los ajustes por humedad baja (<13 %) y alta (>85 %); por debajo de 80 °F se usa la fórmula simple de Steadman. Resultado convertido a °C.
- **Niveles (NWS):** Sin riesgo < 26.7 °C · Precaución 26.7–32.2 · Precaución Extrema 32.2–39.4 · Peligro 39.4–51.7 · Peligro Extremo ≥ 51.7 °C. Se editan en el arreglo `LEVELS` de `index.html`, junto con la acción y las medidas de cada nivel.
- **Sol directo:** suma `SUN_ADD_C = 8` °C (NOAA indica hasta 15 °F). Cuando está activo, la acción y el nivel aplicado usan el valor con sol.
- **Clima GPS:** toma temperatura y humedad de Open-Meteo como referencia. Para el registro formal usa tu termohigrómetro.
- **Gmail:** al guardar un nivel **Peligro o mayor**, o un **termo no conforme**, la app abre Gmail con el correo ya redactado para los destinatarios del proyecto. El usuario solo da *Enviar*, y sale desde su propia cuenta.
- **Alcance normativo:** el índice de calor es una herramienta de tamizaje; la evaluación formal de condiciones térmicas elevadas sigue siendo por **índice TGBH** (NOM-015-STPS-2001).
- **Límites:** máximo 4 fotos por revisión (se comprimen a ~150 KB con sello de fecha); cada registro debe pesar menos de 1 MB.

---
Elaborado por José Alfredo González García
