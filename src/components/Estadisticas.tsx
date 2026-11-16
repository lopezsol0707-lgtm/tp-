import { motion } from 'motion/react'
import { useState } from 'react'
import { desdeClave, diaCorto, diaLargo, duracion, sumarDias } from '../fechas'
import { colorMateria } from '../materias'
import type { Plan } from '../planificador'
import type { Horario, Tarea } from '../tipos'

/** Minutos a horas con coma decimal: 450 da "7,5 h". */
const horas = (min: number) => `${(Math.round((min / 60) * 10) / 10).toLocaleString('es-AR')} h`

const ENTRADA = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
}

export function Estadisticas({
  tareas,
  plan,
  feriados,
  horario,
  hoyClave,
}: {
  tareas: Tarea[]
  plan: Plan
  feriados: Map<string, string>
  horario: Horario
  hoyClave: string
}) {
  return (
    <section aria-labelledby="titulo-stats" className="space-y-3">
      <h2 id="titulo-stats" className="titulo px-1 text-[26px] sm:text-[30px]">
        Cómo venís
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Avance tareas={tareas} />
        <PorMateria tareas={tareas} />
        <div className="md:col-span-2">
          <Carga plan={plan} tareas={tareas} feriados={feriados} horario={horario} hoyClave={hoyClave} />
        </div>
      </div>
    </section>
  )
}

function Tarjeta({ titulo, sub, children, i = 0 }: { titulo: string; sub: string; children: React.ReactNode; i?: number }) {
  return (
    <motion.div
      {...ENTRADA}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
      className="flex h-full flex-col rounded-[var(--radius)] bg-surface p-5 sombra"
    >
      <h3 className="text-[17px] font-extrabold">{titulo}</h3>
      <p className="text-[14px] font-semibold text-muted">{sub}</p>
      <div className="mt-4 flex-1">{children}</div>
    </motion.div>
  )
}

/** Anillo de avance: cuántas tareas ya están hechas. */
function Avance({ tareas }: { tareas: Tarea[] }) {
  const hechas = tareas.filter((t) => t.hecha)
  const total = tareas.length
  const frac = total ? hechas.length / total : 0
  const horas = Math.round(hechas.reduce((s, t) => s + t.duracionMin, 0) / 60)

  return (
    <Tarjeta titulo="Avance" sub={`${horas} h de trabajo ya terminadas`}>
      <div className="flex items-center gap-5">
        <div className="relative size-36 shrink-0">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--chip)" strokeWidth="14" />
            <motion.circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="14"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: frac }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <p className="titulo text-[34px] tabular-nums">{Math.round(frac * 100)}%</p>
          </div>
        </div>
        <div>
          <p className="titulo whitespace-nowrap text-[28px] tabular-nums">
            {hechas.length}
            <span className="text-muted"> de {total}</span>
          </p>
          <p className="text-[14px] font-semibold text-muted">tareas hechas</p>
        </div>
      </div>
    </Tarjeta>
  )
}

/** Dona con las horas pendientes de cada materia. */
function PorMateria({ tareas }: { tareas: Tarea[] }) {
  const [activa, setActiva] = useState<string | null>(null)
  const mapa = new Map<string, number>()
  tareas.filter((t) => !t.hecha).forEach((t) => mapa.set(t.materia, (mapa.get(t.materia) ?? 0) + t.duracionMin))
  const datos = [...mapa.entries()].sort((a, b) => b[1] - a[1])
  const total = datos.reduce((s, [, m]) => s + m, 0)
  const elegida = datos.find(([m]) => m === activa)

  const GAP = datos.length > 1 ? 0.012 : 0
  const segmentos = datos.map(([m, min], i) => ({
    m,
    frac: min / total,
    inicio: datos.slice(0, i).reduce((s, [, x]) => s + x, 0) / total,
  }))

  return (
    <Tarjeta titulo="Lo que falta, por materia" sub={`${duracion(total)} pendientes en total`} i={1}>
      {total === 0 ? (
        <p className="text-[15px] font-semibold text-muted">No queda nada pendiente.</p>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row md:flex-col xl:flex-col">
          <div className="relative size-36 shrink-0">
            <svg viewBox="0 0 120 120" className="size-full -rotate-90" role="img" aria-label="Horas pendientes por materia">
              {segmentos.map(({ m, frac, inicio }, i) => {
                return (
                  <motion.circle
                    key={m}
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke={colorMateria(m).fuerte}
                    strokeWidth={activa === m ? 22 : 18}
                    initial={{ pathLength: 0, pathOffset: inicio }}
                    whileInView={{ pathLength: Math.max(0.001, frac - GAP), pathOffset: inicio }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.08 }}
                    onMouseEnter={() => setActiva(m)}
                    onMouseLeave={() => setActiva(null)}
                    className="cursor-pointer transition-[stroke-width] duration-200"
                  />
                )
              })}
            </svg>
            <div className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center">
              {elegida ? (
                <div>
                  <p className="text-[15px] font-extrabold tabular-nums">{duracion(elegida[1])}</p>
                  <p className="text-[11px] font-semibold leading-tight text-muted">{elegida[0]}</p>
                </div>
              ) : (
                <p className="titulo text-[24px] tabular-nums">{horas(total)}</p>
              )}
            </div>
          </div>
          <ul className="w-full min-w-0 flex-1 space-y-1.5">
            {datos.map(([m, min]) => (
              <li
                key={m}
                onMouseEnter={() => setActiva(m)}
                onMouseLeave={() => setActiva(null)}
                className={`flex items-center gap-2 rounded-lg px-1 text-[13px] font-semibold transition-colors ${
                  activa === m ? 'bg-chip' : ''
                }`}
              >
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: colorMateria(m).fuerte }} />
                <span className="min-w-0 flex-1 truncate">{m}</span>
                <span className="tabular-nums text-muted">{horas(min)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Tarjeta>
  )
}

/** Barras apiladas: horas planificadas en los próximos días, por materia. */
function Carga({
  plan,
  tareas,
  feriados,
  horario,
  hoyClave,
}: {
  plan: Plan
  tareas: Tarea[]
  feriados: Map<string, string>
  horario: Horario
  hoyClave: string
}) {
  const [activo, setActivo] = useState<string | null>(null)
  const porId = Object.fromEntries(tareas.map((t) => [t.id, t]))
  const dias = Array.from({ length: 12 }, (_, i) => sumarDias(hoyClave, i))
  const maxMin = horario.fin - horario.inicio
  const ALTO = 170

  const columnas = dias.map((d) => {
    const porMateria = new Map<string, number>()
    plan.bloques
      .filter((b) => b.fecha === d)
      .forEach((b) => {
        const m = porId[b.tareaId]?.materia ?? ''
        porMateria.set(m, (porMateria.get(m) ?? 0) + b.fin - b.inicio)
      })
    const total = [...porMateria.values()].reduce((s, v) => s + v, 0)
    const libre = !horario.dias.includes(desdeClave(d).getDay())
    return { d, porMateria: [...porMateria.entries()], total, feriado: feriados.get(d), libre }
  })
  const horasTotales = horas(columnas.reduce((s, c) => s + c.total, 0))
  const lineas = [0, 3, 6, 9].filter((h) => h * 60 <= maxMin)

  return (
    <Tarjeta titulo="Carga de los próximos 12 días" sub={`${horasTotales} planificadas, de lunes a viernes de 9 a 18`} i={2}>
      <div className="relative pl-8">
        {lineas.map((h) => (
          <div
            key={h}
            className="absolute inset-x-0 flex items-center"
            style={{ bottom: 38 + (h * 60 * ALTO) / maxMin }}
            aria-hidden
          >
            <span className="w-8 shrink-0 -translate-y-px pr-1 text-right text-[11px] font-semibold tabular-nums text-muted">
              {h} h
            </span>
            <span className={`h-px flex-1 ${h === 0 ? 'bg-line' : 'border-t border-dashed border-line'}`} />
          </div>
        ))}

        <div className="relative grid grid-cols-12 gap-1 sm:gap-2" style={{ height: ALTO + 38 }}>
          {columnas.map((c, i) => {
            const activa = activo === c.d
            return (
              <div
                key={c.d}
                className="relative flex flex-col justify-end"
                onMouseEnter={() => setActivo(c.d)}
                onMouseLeave={() => setActivo(null)}
                onClick={() => setActivo(activa ? null : c.d)}
              >
                <div className="flex flex-col-reverse gap-[2px]" style={{ height: ALTO }}>
                  {c.feriado || c.libre ? (
                    <div className="rayado h-full rounded-md opacity-70" title={c.feriado ?? 'Libre'} />
                  ) : (
                    c.porMateria.map(([m, min], j) => (
                      <motion.div
                        key={m}
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.04 + j * 0.03 }}
                        className={`origin-bottom ${j === c.porMateria.length - 1 ? 'rounded-t-[4px]' : ''} ${
                          activa ? 'brightness-110' : ''
                        }`}
                        style={{ height: (min * ALTO) / maxMin - 2, background: colorMateria(m).fuerte }}
                      />
                    ))
                  )}
                </div>
                <p
                  className={`mt-1 h-[34px] text-center text-[11px] font-bold leading-[15px] ${
                    c.d === hoyClave ? 'text-primary' : 'text-muted'
                  }`}
                >
                  <span className="block">{diaCorto(c.d).charAt(0)}</span>
                  <span className="block tabular-nums">{desdeClave(c.d).getDate()}</span>
                </p>

                {activa && (
                  <div
                    role="tooltip"
                    className={`absolute bottom-full z-20 mb-2 w-52 rounded-2xl bg-ink p-3 text-bg sombra ${
                      i > 7 ? 'right-0' : i < 3 ? 'left-0' : 'left-1/2 -translate-x-1/2'
                    }`}
                  >
                    <p className="text-[13px] font-extrabold">{diaLargo(c.d)}</p>
                    {c.feriado ? (
                      <p className="text-[12px] opacity-80">Feriado: {c.feriado}</p>
                    ) : c.libre ? (
                      <p className="text-[12px] opacity-80">Fin de semana libre</p>
                    ) : c.total === 0 ? (
                      <p className="text-[12px] opacity-80">Sin trabajo planificado</p>
                    ) : (
                      <ul className="mt-1 space-y-0.5">
                        {c.porMateria.map(([m, min]) => (
                          <li key={m} className="flex items-center gap-1.5 text-[12px]">
                            <span className="size-2 rounded-full" style={{ background: colorMateria(m).fuerte }} />
                            <span className="flex-1 truncate">{m}</span>
                            <span className="tabular-nums opacity-80">{duracion(min)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <p className="mt-3 text-[13px] font-semibold text-muted">
        Pasá el mouse o tocá una barra para ver el detalle. Lo rayado son fines de semana y feriados.
      </p>
    </Tarjeta>
  )
}
