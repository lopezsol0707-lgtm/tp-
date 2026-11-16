/** Utilidades de fechas en hora local, con días en formato AAAA-MM-DD. */

export function aClave(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${dia}`
}

export function desdeClave(clave) {
  const [a, m, d] = clave.split('-').map(Number)
  return new Date(a, m - 1, d)
}

export function sumarDias(clave, n) {
  const d = desdeClave(clave)
  d.setDate(d.getDate() + n)
  return aClave(d)
}

export function hoy() {
  return aClave(new Date())
}

/** Lunes de la semana de esa fecha. */
export function lunesDe(clave) {
  const d = desdeClave(clave)
  const dif = (d.getDay() + 6) % 7
  return sumarDias(clave, -dif)
}

export function diasEntre(desde, hasta) {
  return Math.round((desdeClave(hasta).getTime() - desdeClave(desde).getTime()) / 86_400_000)
}

const fmtDiaCorto = new Intl.DateTimeFormat('es-AR', { weekday: 'short' })
const fmtDiaLargo = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
const fmtMes = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' })
const fmtFechaCorta = new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })

const mayus = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const sinPunto = (s) => s.replace(/\./g, '')

export const diaCorto = (clave) => mayus(sinPunto(fmtDiaCorto.format(desdeClave(clave))))
export const diaLargo = (clave) => mayus(fmtDiaLargo.format(desdeClave(clave)))
export const mesLargo = (clave) => mayus(fmtMes.format(desdeClave(clave)))
export const fechaCorta = (clave) => sinPunto(fmtFechaCorta.format(desdeClave(clave)))

/** "hoy", "mañana", "el jue 19". */
export function fechaRelativa(clave) {
  const d = diasEntre(hoy(), clave)
  if (d === 0) return 'hoy'
  if (d === 1) return 'mañana'
  if (d === -1) return 'ayer'
  return `el ${fechaCorta(clave)}`
}

export function hora(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

export function duracion(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (!h) return `${m} min`
  if (!m) return `${h} h`
  return `${h} h ${m} min`
}
