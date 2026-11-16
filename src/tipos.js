/**
 * Modelo de datos de Entregá (solo documentación, no se importa).
 *
 * @typedef {'alta' | 'media' | 'baja'} Prioridad
 *
 * Una tarea, tal como se guarda en Firestore en usuarios/{uid}/tareas/{id}:
 * @typedef {Object} Tarea
 * @property {string} id             Id del documento en Firestore.
 * @property {string} titulo         Qué hay que hacer.
 * @property {string} materia        Materia o proyecto.
 * @property {number} duracionMin    Minutos de trabajo estimados.
 * @property {string} fechaLimite    Día de entrega, en formato AAAA-MM-DD.
 * @property {Prioridad} prioridad
 * @property {boolean} hecha
 * @property {number} creadaEn       Fecha de alta en milisegundos.
 * @property {number | null} hechaEn Fecha en que se terminó, o null.
 *
 * El horario de trabajo que usa el planificador:
 * @typedef {Object} Horario
 * @property {number[]} dias  Días en que se trabaja: 0 domingo ... 6 sábado.
 * @property {number} inicio  Minuto del día en que arranca la jornada (9 * 60).
 * @property {number} fin     Minuto del día en que termina (18 * 60).
 *
 * Un pedazo de tarea ubicado en la agenda:
 * @typedef {Object} Bloque
 * @property {string} tareaId
 * @property {string} fecha   AAAA-MM-DD
 * @property {number} inicio  Minuto del día.
 * @property {number} fin     Minuto del día.
 * @property {number} parte   Número de parte (si la tarea se partió entre días).
 * @property {number} partes  Total de partes.
 */

export {}
