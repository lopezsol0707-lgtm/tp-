export type Prioridad = 'alta' | 'media' | 'baja'

export interface Tarea {
  id: string
  titulo: string
  materia: string
  /** Minutos de trabajo estimados. */
  duracionMin: number
  /** Día de entrega, en formato AAAA-MM-DD. */
  fechaLimite: string
  prioridad: Prioridad
  hecha: boolean
  creadaEn: number
  hechaEn: number | null
}

/** Lo que carga el usuario. */
export type DatosTarea = Pick<Tarea, 'titulo' | 'materia' | 'duracionMin' | 'fechaLimite' | 'prioridad'>

export interface Horario {
  /** Días en los que se trabaja: 0 domingo ... 6 sábado. */
  dias: number[]
  /** Minuto del día en que arranca y termina la jornada. */
  inicio: number
  fin: number
}

/** Un pedazo de tarea ubicado en la agenda. */
export interface Bloque {
  tareaId: string
  fecha: string
  inicio: number
  fin: number
  parte: number
  partes: number
}

export interface EstadoTarea {
  /** Día en que la agenda termina la tarea (null si no entra). */
  termina: string | null
  enRiesgo: boolean
  vencida: boolean
}
