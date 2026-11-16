import type { CSSProperties } from 'react'
import type { Tarea } from './tipos'

/** Paleta de materias: cada una recibe un color distinto. */
const COLORES = [
  { fondo: '#ffe2d4', tinta: '#8f2c00', fuerte: '#ff5b1f' },
  { fondo: '#d6efff', tinta: '#0b4a73', fuerte: '#1c8fd6' },
  { fondo: '#fff0c2', tinta: '#6e4d00', fuerte: '#f2a900' },
  { fondo: '#d9f4e8', tinta: '#0b5c3e', fuerte: '#13a46b' },
  { fondo: '#ffdcea', tinta: '#8c1645', fuerte: '#f0457f' },
  { fondo: '#e9f6c9', tinta: '#3d5a00', fuerte: '#7fb800' },
]

const asignados = new Map<string, number>()
const clave = (m: string) => m.trim().toLowerCase()

/**
 * Asigna los colores en el orden en que se cargó cada materia, así no se
 * repiten mientras haya menos de seis.
 */
export function asignarColores(tareas: Tarea[]) {
  asignados.clear()
  ;[...tareas]
    .sort((a, b) => a.creadaEn - b.creadaEn)
    .forEach((t) => {
      const k = clave(t.materia)
      if (!asignados.has(k)) asignados.set(k, asignados.size % COLORES.length)
    })
}

function indice(materia: string): number {
  const k = clave(materia)
  const fijo = asignados.get(k)
  if (fijo !== undefined) return fijo
  // Materia nueva que todavía no se guardó: toma el próximo color libre.
  return asignados.size % COLORES.length
}

export function colorMateria(materia: string) {
  return COLORES[indice(materia)]
}

export function estiloBloque(materia: string): CSSProperties {
  const c = colorMateria(materia)
  return { background: c.fondo, color: c.tinta, borderColor: c.fuerte }
}
