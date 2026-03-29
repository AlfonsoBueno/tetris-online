# 🎮 Tetris Online

Tetris multijugador en tiempo real con WebSockets. 1 archivo de servidor, 1 HTML de cliente.

---

## 📁 Estructura del proyecto

```
tetris-online/
├── server.js          ← Servidor WebSocket (Node.js)
├── package.json       ← Dependencias
└── public/
    └── index.html     ← El juego completo
```

---

## 🚀 Despliegue en Render.com (GRATIS, sin tarjeta)

### Paso 1 — Sube el código a GitHub

1. Ve a [github.com](https://github.com) y crea una cuenta (si no tienes).
2. Haz clic en **"New repository"** → ponle nombre, por ejemplo `tetris-online`.
3. Marca **"Add a README file"** y crea el repositorio.
4. Haz clic en **"uploading an existing file"** y sube los 3 archivos:
   - `server.js`
   - `package.json`
   - `public/index.html` (crea la carpeta `public` en el uploader)

### Paso 2 — Despliega en Render

1. Ve a [render.com](https://render.com) y crea una cuenta con GitHub.
2. Haz clic en **"New +"** → **"Web Service"**.
3. Conecta tu repositorio `tetris-online`.
4. Configura así:
   - **Name**: `tetris-online` (o el que quieras)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Haz clic en **"Create Web Service"**.
6. Espera 2-3 minutos a que termine el despliegue.
7. Render te dará una URL tipo: `https://tetris-online-xxxx.onrender.com`

### Paso 3 — Jugar online

1. Abre la URL en tu navegador.
2. Haz clic en **"🌐 JUGAR ONLINE"**.
3. Haz clic en **"🏠 CREAR SALA"** → te aparece un código de 6 letras.
4. Comparte ese código (o la URL que aparece) con tu amigo.
5. Tu amigo abre la URL, hace clic en **"🌐 JUGAR ONLINE"** → **"🔗 UNIRSE A SALA"** → introduce el código.
6. ¡La partida empieza automáticamente!

> ⚠️ **Nota sobre el plan gratuito de Render**: el servidor se "duerme" tras 15 minutos sin actividad.
> La primera conexión puede tardar ~30 segundos en despertar. Es normal.

---

## 🎮 Controles

| Tecla | Acción |
|-------|--------|
| ← → | Mover |
| ↑ | Rotar |
| Z | Rotar inverso |
| ↓ | Bajar |
| Espacio | Hard Drop |
| C | Hold |
| P | Pausa (solo 1J) |

---

## ⚙️ Ejecutar en local (para probar)

```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start

# Abrir en el navegador
# http://localhost:3000
```

Para probar el modo online en local, abre dos pestañas en `http://localhost:3000`.

---

## 🔧 Arquitectura

- **server.js**: Servidor HTTP + WebSocket. Gestiona salas de 2 jugadores.
  - Cada sala tiene un ID de 6 caracteres.
  - El servidor retransmite el estado del tablero entre jugadores cada 100ms.
  - Los ataques (líneas de basura) se envían como mensajes separados.
  
- **public/index.html**: Todo el juego en un solo archivo.
  - Motor de Tetris completo (bolsa 7-bag, SRS kicks, ghost piece, hold, etc.)
  - Conexión WebSocket automática al servidor.
  - Modo 1 jugador (local) y modo online integrados.

---

## 🆓 Alternativas de hosting gratuito

| Servicio | Ventajas | Desventajas |
|----------|----------|-------------|
| **Render.com** | Sin tarjeta, fácil | Se duerme tras 15min |
| **Railway.app** | No se duerme | Requiere verificación con tarjeta |
| **Fly.io** | Muy potente, no se duerme | Configuración más técnica |
| **Glitch.com** | Edición online directa | Se duerme, más lento |
