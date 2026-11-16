# Entregá

Agenda automática para estudiantes. Cargás cada entrega con cuánto tiempo te lleva y para qué día es, y Entregá la reparte sola en tus horarios libres, empezando por lo que vence primero. Si agregás, editás o terminás algo, la agenda se reacomoda. Avisa en rojo las entregas que no llegan a tiempo y saltea los feriados nacionales.

Trabajo Práctico 2, Desarrollo Frontend II (UADE).

La primera vez que entrás, la app carga sola un **ejemplo realista** (la semana de una estudiante de Diseño Digital a fin de cuatrimestre). Todo lo que cambies queda guardado. Abajo de todo está el botón **Volver al ejemplo inicial** para dejarlo como al principio.

Además tiene una sección de **gráficos**: avance (tareas hechas), horas pendientes por materia y carga de los próximos 12 días.

## Tecnologías

- **React 19 + Vite + TypeScript**
- **Tailwind CSS v4** para los estilos y **Motion** para las animaciones
- **Firebase**: Authentication (acceso anónimo) y **Cloud Firestore** (base de datos)
- **API de feriados de ArgentinaDatos** (`https://api.argentinadatos.com/v1/feriados/{año}`): el planificador no pone trabajo los feriados y el calendario los marca.
- Publicada en **Vercel**

## Cómo correrlo

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear un archivo `.env` en la raíz (junto a `package.json`) copiando `.env.example` y completando los datos de la app web de Firebase:

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

3. Levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

## Configuración de Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/) y registrar una app web (`</>`).
2. **Authentication** → Sign-in method → habilitar **Anónimo**.
3. **Firestore Database** → crear base Standard, `(default)`, región `southamerica-east1`, en modo producción.
4. En la pestaña **Reglas**, publicar el contenido de [`firestore.rules`](firestore.rules).

### Cómo se guardan los datos

Cada visitante entra con una cuenta anónima. Sus tareas viven en `usuarios/{uid}/tareas/{id}` con estos campos:

| Campo | Tipo | Ejemplo |
|---|---|---|
| `titulo` | texto | "Maqueta final" |
| `materia` | texto | "Diseño 3" |
| `duracionMin` | número | 360 |
| `fechaLimite` | texto AAAA-MM-DD | "2026-11-22" |
| `prioridad` | "alta", "media" o "baja" | "alta" |
| `hecha` | verdadero o falso | false |
| `creadaEn`, `hechaEn` | fecha en milisegundos | 1794855000000 |

Las reglas solo dejan leer y escribir las tareas propias y validan cada campo.

## Dónde está cada cosa

- `src/firebase.ts`: conexión con Firebase y acceso anónimo.
- `src/data/tareas.ts`: las operaciones con Firestore (consultar en tiempo real, agregar, modificar, eliminar).
- `src/data/feriados.ts`: consulta a la API de feriados.
- `src/planificador.ts`: el algoritmo que arma la agenda.
- `src/components/`: interfaz (agenda semanal, lista de tareas, formulario, resumen).

## Publicar en Vercel

Importar el repositorio, framework **Vite**, build `npm run build`, salida `dist`, y cargar las cuatro variables `VITE_FIREBASE_*` en Settings → Environment Variables.
