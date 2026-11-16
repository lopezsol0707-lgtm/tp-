/**
 * El corazón de la app: reparte las tareas pendientes en los huecos libres
 * de la agenda, empezando por la entrega más cercana.
 *
 * - Solo usa los días y horas de trabajo del horario.
 * - Saltea los feriados (vienen de la API de feriados).
 * - Si una tarea no entra en un día, la parte y sigue al día siguiente.
 * - Marca "en riesgo" las tareas que terminarían después de su entrega.
 */
import { aClave, desdeClave, sumarDias } from './fechas'
import type { Bloque, EstadoTarea, Horario, Tarea } from './tipos'

const PESO: Record<Tarea['prioridad'], number> = { alta: 0, media: 1, baja: 2 }
const MINIMO_BLOQUE = 30
const RESPIRO = 15
const HORIZONTE_DIAS = 180

export interface Plan {
  bloques: Bloque[]
  estados: Record<string, EstadoTarea>
}

export function ordenarPendientes(tareas: Tarea[]): Tarea[] {
  return tareas
    .filter((t) => !t.hecha)
    .sort(
      (a, b) =>
        a.fechaLimite.localeCompare(b.fechaLimite) || PESO[a.prioridad] - PESO[b.prioridad] || a.creadaEn - b.creadaEn,
    )
}

export function planificar(tareas: Tarea[], ahora: Date, horario: Horario, feriados: Map<string, string>): Plan {
  const hoyClave = aClave(ahora)
  const minutoActual = ahora.getHours() * 60 + ahora.getMinutes()

  const esLaborable = (clave: string) => horario.dias.includes(desdeClave(clave).getDay()) && !feriados.has(clave)

  // Cursor: el primer momento libre a partir de ahora, redondeado a 15 minutos.
  let fecha = hoyClave
  let minuto = Math.max(horario.inicio, Math.ceil(minutoActual / 15) * 15)
  let diasAvanzados = 0

  const siguienteDia = () => {
    fecha = sumarDias(fecha, 1)
    minuto = horario.inicio
    diasAvanzados++
  }
  const acomodarCursor = () => {
    while (diasAvanzados < HORIZONTE_DIAS && (!esLaborable(fecha) || horario.fin - minuto < MINIMO_BLOQUE)) {
      siguienteDia()
    }
  }

  const bloques: Bloque[] = []
  const estados: Record<string, EstadoTarea> = {}

  for (const t of ordenarPendientes(tareas)) {
    let restante = t.duracionMin
    const propios: Bloque[] = []

    while (restante > 0) {
      acomodarCursor()
      if (diasAvanzados >= HORIZONTE_DIAS) break
      // Un pedazo nunca queda más corto que el mínimo, salvo que sea lo que falta.
      let pedazo = Math.min(restante, horario.fin - minuto)
      if (restante - pedazo > 0 && restante - pedazo < MINIMO_BLOQUE) pedazo = restante - MINIMO_BLOQUE
      propios.push({ tareaId: t.id, fecha, inicio: minuto, fin: minuto + pedazo, parte: 0, partes: 0 })
      minuto += pedazo
      restante -= pedazo
    }

    propios.forEach((b, i) => {
      b.parte = i + 1
      b.partes = propios.length
    })
    bloques.push(...propios)

    const termina = restante > 0 ? null : (propios.at(-1)?.fecha ?? null)
    estados[t.id] = {
      termina,
      enRiesgo: termina === null || termina > t.fechaLimite,
      vencida: t.fechaLimite < hoyClave,
    }

    // Un respiro entre tareas distintas.
    minuto += RESPIRO
  }

  for (const t of tareas.filter((x) => x.hecha)) {
    estados[t.id] = { termina: null, enRiesgo: false, vencida: false }
  }

  return { bloques, estados }
}
