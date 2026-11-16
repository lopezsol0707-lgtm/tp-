/**
 * Feriados nacionales de Argentina, desde la API pública ArgentinaDatos:
 * https://api.argentinadatos.com/v1/feriados/{año}
 * El planificador los usa para no poner trabajo esos días.
 */

const URL_API = 'https://api.argentinadatos.com/v1/feriados'

export async function obtenerFeriados(anios) {
  const respuestas = await Promise.all(
    anios.map(async (anio) => {
      const r = await fetch(`${URL_API}/${anio}`)
      if (!r.ok) throw new Error(`La API de feriados respondió ${r.status}`)
      return await r.json()
    }),
  )
  return new Map(respuestas.flat().map((f) => [f.fecha, f.nombre]))
}
