/** Utilidades de fechas en hora local, con días en formato AAAA-MM-DD. */

export function aClave(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${dia}`
}

export function desdeClave(clave: string): Date {
  const [a, m, d] = clave.split('-').map(Number)
  return new Date(a, m - 1, d)
}

export function sumarDias(clave: string, n: number): string {
  const d = desdeClave(clave)
  d.setDate(d.getDate() + n)
  return aClave(d)
}

export function hoy(): string {
  return aClave(new Date())
}

/** Lunes de la semana de esa fecha. */
export function lunesDe(clave: string): string {
  const d = desdeClave(clave)
  const dif = (d.getDay() + 6) % 7
  return sumarDias(clave, -dif)
}

export function diasEntre(desde: string, hasta: string): number {
  return Math.round((desdeClave(hasta).getTime() - desdeClave(desde).getTime()) / 86_400_000)
}

const fmtDiaCorto = new Intl.DateTimeFormat('es-AR', { weekday: 'short' })
const fmtDiaLargo = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
const fmtMes = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' })
const fmtFechaCorta = new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })

const mayus = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const sinPunto = (s: string) => s.replace(/\./g, '')

export const diaCorto = (clave: string) => mayus(sinPunto(fmtDiaCorto.format(desdeClave(clave))))
export const diaLargo = (clave: string) => mayus(fmtDiaLargo.format(desdeClave(clave)))
export const mesLargo = (clave: string) => mayus(fmtMes.format(desdeClave(clave)))
export const fechaCorta = (clave: string) => sinPunto(fmtFechaCorta.format(desdeClave(clave)))

/** "hoy", "mañana", "el jue 19". */
export function fechaRelativa(clave: string): string {
  const d = diasEntre(hoy(), clave)
  if (d === 0) return 'hoy'
  if (d === 1) return 'mañana'
  if (d === -1) return 'ayer'
  return `el ${fechaCorta(clave)}`
}

export function hora(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

export function duracion(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (!h) return `${m} min`
  if (!m) return `${h} h`
  return `${h} h ${m} min`
}
