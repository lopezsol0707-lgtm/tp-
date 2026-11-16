/** Paleta de materias: cada una recibe un color distinto. */
// Orden validado para daltonismo (los colores vecinos se distinguen entre sí).
const COLORES = [
  { fondo: '#fde3d7', tinta: '#8f3510', fuerte: '#eb6834' },
  { fondo: '#dbe9fa', tinta: '#184f95', fuerte: '#2a78d6' },
  { fondo: '#d3f3e7', tinta: '#0c6646', fuerte: '#1baf7a' },
  { fondo: '#fff0c4', tinta: '#6b4800', fuerte: '#eda100' },
  { fondo: '#fbe0ea', tinta: '#8c2350', fuerte: '#e87ba4' },
  { fondo: '#d6efd6', tinta: '#0b5a0b', fuerte: '#008300' },
]

const asignados = new Map()
const clave = (m) => m.trim().toLowerCase()

/**
 * Asigna los colores en el orden en que se cargó cada materia, así no se
 * repiten mientras haya menos de seis.
 */
export function asignarColores(tareas) {
  asignados.clear()
  ;[...tareas]
    .sort((a, b) => a.creadaEn - b.creadaEn)
    .forEach((t) => {
      const k = clave(t.materia)
      if (!asignados.has(k)) asignados.set(k, asignados.size % COLORES.length)
    })
}

function indice(materia) {
  const k = clave(materia)
  const fijo = asignados.get(k)
  if (fijo !== undefined) return fijo
  // Materia nueva que todavía no se guardó: toma el próximo color libre.
  return asignados.size % COLORES.length
}

export function colorMateria(materia) {
  return COLORES[indice(materia)]
}

export function estiloBloque(materia) {
  const c = colorMateria(materia)
  return { background: c.fondo, color: c.tinta, borderColor: c.fuerte }
}
