# Entregá

TP2 de Desarrollo Frontend II (UADE, FADI, martes mañana). Joaquín lo arma para un amigo (estudia diseño digital). Agenda automática tipo Motion para estudiantes: cargás entregas con duración y fecha, y las reparte en tus horarios (lunes a viernes, 9 a 18), salteando feriados (API ArgentinaDatos).

**Entrega: martes 17/11/2026 a las 7:45.** Pide 3 versiones publicadas (v1, v2, v3) con capturas, informe y bitácora. Consigna: `C:\Users\joaqu\Downloads\TP2-Desarrollo-Frontend-II-Martes-TM.docx`.

## Links

- Producción: https://entrega-tp2-nine.vercel.app (Vercel de Joaquín, proyecto `entrega-tp2`). `entrega-tp2.vercel.app` es de otra persona.
- Repo: https://github.com/lopezsol0707-lgtm/tp- (cuenta del amigo; Joaquín puede pushear).
- Firebase: proyecto `entrega-tp2-dc672` en la cuenta Google de Orik Studio, plan Spark. Auth anónima, Firestore en `southamerica-east1`.

## Cómo se corre y se publica

- `npm run dev` (en la sesión: `preview_start` → `entrega-dev`, puerto 5189, en `atlas-motors/.claude/launch.json`).
- `npm run lint` y `npm run build`.
- **Vercel NO está conectado al repo** (es de otra cuenta). Publicar con `vercel deploy --prod --yes` desde la carpeta.
- Variables `VITE_FIREBASE_*`: cargarlas en Vercel desde **bash** con `printf '%s' "$v" | vercel env add`. Desde PowerShell se cuela un BOM y rompe Firebase (`auth/network-request-failed`).
- Reglas: `firestore.rules`; se publican a mano en la consola de Firebase (pestaña Reglas). Tardan hasta un minuto en aplicarse.

## Estructura

- `src/planificador.js`: algoritmo (orden por entrega + prioridad, parte tareas entre días, 15 min de respiro, marca riesgo).
- `src/data/tareas.js`: CRUD Firestore (`usuarios/{uid}/tareas`) + `cargarEjemplo`.
- `src/data/feriados.js`: API de feriados.
- `src/firebase.js`: init y acceso anónimo.
- `src/materias.js`: color por materia, asignado por orden de creación.
- `src/components/`: Resumen, Agenda (semana en desktop, día en móvil), ListaTareas, FormularioTarea (calendario propio), DialogoBorrar, Hoja, Avisos, ui.
- `docs/bitacora.md` + `docs/capturas/`: bitácora REAL. Solo pedidos, problemas y capturas que pasaron de verdad.

## Decisiones

- Un solo estilo visual (Joaquín estaba apurado, no hubo variantes): naranja cálido, Bricolage Grotesque + Figtree.
- Tránsito (`C:\Users\joaqu\transito`) fue el primer intento, descartado. Queda en la bitácora como iteración 0.

## Le gustó / no tocar

- (nada aprobado explícitamente todavía)

## Versiones publicadas

- v1: agenda + Firestore + auth anónima + API feriados.
- v2: ejemplo realista que se siembra solo la primera vez (flag `entrega.ejemplo.{uid}` en localStorage), botón "Volver al ejemplo inicial" (`reiniciarEjemplo`), gráficos (Estadisticas.jsx), hero animado. Fix: `asegurarUsuario` cachea la promesa (StrictMode creaba 2 anónimos) + reintento ante permission-denied.
- v3: títulos de bloques con line-clamp, favicon propio, README.

## Textos de entrega (fuera del repo, a propósito)

- `C:\Users\joaqu\entrega-textos\`: "Entregá - Informe y bitácora" y "Entregá - Machete para la exposición" (.docx y .pdf). Generados con un script docx-js en el scratchpad de la sesión. El machete NO va al repo (es para la prima que expone).
- Prompts del informe: reformulados de los pedidos reales de Joaquín, sin inventar pasos.

## Pendientes / ideas

- Horario configurable (días y horas) guardado en Firestore.
- Bundle de 500 KB+ (Firebase): se podría dividir.
