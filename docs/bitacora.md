# Bitácora de Entregá

Registro del proceso, desde la idea hasta cada versión publicada. Herramienta de IA usada en todo el proceso: **Claude Code** (modelo Claude Opus 5.5), en la app de escritorio de Claude. Se usó para proponer ideas, escribir el código, configurar Firebase y Vercel, probar la app en el navegador y diagnosticar errores.

- App publicada: https://entrega-tp2-nine.vercel.app
- Repositorio: https://github.com/lopezsol0707-lgtm/tp-

---

## Iteración 0: búsqueda de la idea (15/11 y 16/11)

**Primer intento: Tránsito.** Se le pidió a la IA "tres ideas para la app", y después "ideas relacionadas con animales y fútbol". Se eligió *Tránsito*, un gestor de fichas para rescatistas de perros y gatos, y se llegó a construir una primera versión local (fichas con foto, estados en tránsito, en adopción y adoptado, y tres estilos visuales para comparar).

**Cambio de rumbo.** Al revisarla, la idea no terminó de convencer: se quería algo más cercano a una herramienta de productividad tipo **Motion**, la app que arma la agenda sola a partir de las tareas. Además, la cátedra valora el uso de una **API** externa.

**Pedido a la IA:** una app "como Motion" pensada para estudiantes, que use una API.

**Propuesta elegida:** *Entregá*. Cargás tus entregas con cuánto tiempo te llevan y para qué día son, y la app las reparte sola en tus horarios libres, empezando por la más urgente. Como API se usa la de **feriados nacionales** (ArgentinaDatos), para que la agenda no ponga trabajo esos días. Tránsito quedó descartada.

---

## Versión 1: agenda automática con Firebase (16/11)

### La idea

- **Necesidad:** los estudiantes de diseño tienen varias entregas a la vez y les cuesta calcular si llegan con todo. Anotar las fechas no alcanza: hay que repartir las horas de trabajo.
- **Público:** estudiantes universitarios, en especial de carreras con muchas entregas prácticas.
- **Información que se guarda en Firebase (por tarea):** título, materia, duración estimada en minutos, día de entrega, prioridad, si está hecha y las fechas de creación y finalización.

### Qué se hizo

- **Planificador** (`src/planificador.ts`): ordena las tareas pendientes por día de entrega y prioridad, y las ubica de lunes a viernes de 9 a 18, en el primer hueco libre a partir de este momento. Si una tarea no entra en un día, la parte y sigue al día siguiente. Deja 15 minutos de respiro entre tareas y marca **en rojo** las que terminarían después de su entrega.
- **API de feriados**: se consultan los feriados del año actual y el siguiente. La agenda no pone trabajo esos días, los muestra rayados con su nombre, el calendario del formulario los marca con un punto y el resumen avisa cuál es el próximo. Justo el lunes 23/11 es feriado (Día de la Soberanía Nacional) y se ve en la demo.
- **Firebase**:
  - Authentication con acceso **anónimo**: cada navegador tiene su propia agenda sin registrarse.
  - **Cloud Firestore**: las tareas se guardan en `usuarios/{uid}/tareas`. La lista se **consulta en tiempo real**, así que cualquier cambio se ve al instante.
  - **Reglas** (`firestore.rules`): cada usuario solo puede leer y escribir sus propias tareas, y se valida cada campo (largo del título, duración entre 15 minutos y 20 horas, formato de la fecha, prioridad válida).
- **Pantallas:**
  - Resumen con las horas de trabajo de la semana, lo próximo que tenés que hacer, cuántas entregas no llegan y el próximo feriado.
  - Agenda semanal en la computadora, con bloques de color por materia, una línea que marca la hora actual y navegación entre semanas. En el celular se ve un día por vez, con selector de días.
  - Lista de pendientes con un estado para cada tarea ("Queda lista mañana" o "No llega: terminaría el jue 19"), y las hechas en una sección desplegable.
  - Formulario de alta y edición con calendario propio (sin el selector de fecha del navegador), atajos de duración (30 min a 4 h, y ajuste de a 15 minutos), sugerencias de materias ya usadas y validaciones debajo de cada campo.
  - Confirmación antes de borrar y mensajes de éxito o error después de cada operación.
  - Botón "Probar con un ejemplo" que carga 6 tareas de muestra en Firestore.
- **Animaciones (Motion):** cuando agregás, terminás o borrás una tarea, los bloques de la agenda se deslizan a su nuevo lugar. También tienen animación el contador del resumen, la casilla de "hecha", las ventanas y los avisos.

### Decisiones de diseño

- **Colores cálidos y vivos** (naranja, amarillo y rosa en el encabezado) para que se sienta motivador y no una planilla. Tipografías Bricolage Grotesque para títulos y Figtree para textos.
- **Un color por materia**, usado igual en la agenda, la lista y el formulario, para reconocer de un vistazo a qué materia pertenece cada bloque.
- **El riesgo se comunica con color, ícono y texto** ("No llega"), no solo con rojo.
- **Primero el celular**: en pantallas chicas la agenda muestra un día por vez, porque siete columnas no entran.

### Problemas encontrados y cómo se resolvieron

| Problema | Cómo se detectó | Solución |
|---|---|---|
| El nombre "Ritmo" y su carpeta ya se usaban en otro proyecto. | Al crear el proyecto, la carpeta ya existía. | Se eligió otro nombre: **Entregá**. |
| La primera vez la app mostraba "No pudimos leer tus tareas". | Captura `v1-03`. Se agregó el detalle del error a la consola para investigarlo. | Las reglas de Firestore estaban recién publicadas y tardan hasta un minuto en aplicarse. Al recargar, funcionó. |
| Tres materias distintas salían del mismo azul. | Captura `v1-06`. | El color se calculaba a partir del nombre de la materia y se repetía. Ahora se asigna en el orden en que se cargó cada materia, así no se repite mientras haya menos de seis. |
| En el celular había 1 px de scroll horizontal. | Se midió el ancho de la página en 360 px. | La grilla principal tomaba el ancho mínimo de su contenido. Se le fijó una columna que puede achicarse (`grid-cols-1`). |
| Vercel no pudo conectarse al repositorio. | Error al vincular el proyecto. | El repositorio pertenece a otra cuenta de GitHub. Se publicó desde la terminal con la CLI de Vercel, y cada versión nueva se publica igual. |
| En Vercel la app daba "No pudimos conectarnos con la base de datos" (error `auth/network-request-failed`), aunque en local funcionaba. | Consola del navegador en la URL publicada. | Al cargar las variables de entorno desde PowerShell, se les agregó un carácter invisible (BOM) al principio, así que la dirección de Firebase quedaba mal armada. Se volvieron a cargar desde bash y se revisó el código publicado: los valores quedaron limpios. |
| La dirección `entrega-tp2.vercel.app` ya era de otra persona. | Se abrió y mostraba otra app. | Se usa la dirección que asignó Vercel: `entrega-tp2-nine.vercel.app`. |

### Pruebas realizadas

- **Consultar:** al abrir la app aparecen las tareas guardadas en Firestore.
- **Agregar:** "Probar con un ejemplo" crea 6 tareas, que aparecen en la base y en la agenda.
- **Modificar:** se marcó "Bitácora del TP" como hecha y la agenda se reacomodó sola ("Leer apunte" pasó a quedar lista hoy).
- **Eliminar:** se borró "Paleta y tipografías" con la confirmación. Después de recargar no volvió y quedaron las otras 4 pendientes.
- **Persistencia:** después de recargar, los datos siguen ahí, tanto en local como en Vercel.
- **Errores:** si falla la conexión o la API, la app lo dice y ofrece reintentar.
- **Pantallas:** celular de 360 px (sin scroll horizontal) y computadora de 1366 px.
- `npm run lint` sin advertencias y `npm run build` sin errores.

### Capturas

En `docs/capturas/`:

- `v1-01` y `v1-02`: acceso anónimo activado y reglas publicadas en Firebase.
- `v1-03`: error de lectura antes de que se aplicaran las reglas.
- `v1-04`: agenda vacía, con el próximo feriado traído de la API.
- `v1-05` y `v1-06`: ejemplo cargado y semana completa (con el problema de los colores repetidos).
- `v1-07` y `v1-08`: celular, con la agenda del día y una tarea marcada como hecha.
- `v1-09`: la versión publicada en Vercel.
