import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { CalendarOff, ChevronLeft, ChevronRight, PartyPopper } from 'lucide-react'
import { useState } from 'react'
import { diaCorto, diaLargo, desdeClave, duracion, hora, mesLargo, sumarDias } from '../fechas'
import { colorMateria, estiloBloque } from '../materias'
import type { Bloque, Horario, Tarea } from '../tipos'
import { BotonIcono } from './ui'

const PX_POR_MIN = 1.1

interface Props {
  lunes: string
  onCambiarSemana: (delta: number) => void
  onHoy: () => void
  bloques: Bloque[]
  tareas: Record<string, Tarea>
  feriados: Map<string, string>
  horario: Horario
  hoyClave: string
  ahoraMin: number
  onAbrir: (t: Tarea) => void
}

export function Agenda(props: Props) {
  const { lunes, onCambiarSemana, onHoy, hoyClave } = props
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i))
  const esEstaSemana = dias.includes(hoyClave)

  return (
    <section aria-labelledby="titulo-agenda" className="rounded-[var(--radius)] bg-surface p-3 sombra sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 id="titulo-agenda" className="titulo truncate text-[24px] sm:text-[28px]">
            {mesLargo(dias[3])}
          </h2>
          <p className="text-[14px] font-semibold text-muted">
            Semana del {desdeClave(dias[0]).getDate()} al {desdeClave(dias[6]).getDate()}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!esEstaSemana && (
            <button
              type="button"
              onClick={onHoy}
              className="min-h-11 rounded-full bg-chip px-4 text-[14px] font-bold hover:brightness-95"
            >
              Hoy
            </button>
          )}
          <BotonIcono icono={ChevronLeft} etiqueta="Semana anterior" onClick={() => onCambiarSemana(-1)} />
          <BotonIcono icono={ChevronRight} etiqueta="Semana siguiente" onClick={() => onCambiarSemana(1)} />
        </div>
      </div>

      <LayoutGroup>
        <div className="hidden md:block">
          <VistaSemana {...props} dias={dias} />
        </div>
        <div className="md:hidden">
          <VistaDia {...props} dias={dias} />
        </div>
      </LayoutGroup>
    </section>
  )
}

function VistaSemana({ dias, bloques, tareas, feriados, horario, hoyClave, ahoraMin, onAbrir }: Props & { dias: string[] }) {
  const horas: number[] = []
  for (let m = horario.inicio; m < horario.fin; m += 60) horas.push(m)
  const alto = (horario.fin - horario.inicio) * PX_POR_MIN

  return (
    <div className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))] gap-x-1.5">
      <div />
      {dias.map((d) => {
        const esHoy = d === hoyClave
        return (
          <div key={d} className="pb-2 text-center">
            <p className={`text-[13px] font-bold ${esHoy ? 'text-primary' : 'text-muted'}`}>{diaCorto(d)}</p>
            <p
              className={`mx-auto mt-0.5 grid size-9 place-items-center rounded-full text-[17px] font-extrabold tabular-nums ${
                esHoy ? 'bg-primary text-primary-ink' : ''
              }`}
            >
              {desdeClave(d).getDate()}
            </p>
          </div>
        )
      })}

      <div className="relative" style={{ height: alto }}>
        {horas.map((m) => (
          <span
            key={m}
            className="absolute right-1 -translate-y-1/2 text-[12px] font-semibold tabular-nums text-muted"
            style={{ top: (m - horario.inicio) * PX_POR_MIN }}
          >
            {hora(m)}
          </span>
        ))}
      </div>

      {dias.map((d) => {
        const feriado = feriados.get(d)
        const laborable = horario.dias.includes(desdeClave(d).getDay())
        const propios = bloques.filter((b) => b.fecha === d)
        const pasado = d < hoyClave
        return (
          <div
            key={d}
            className={`relative overflow-hidden rounded-2xl border border-line ${
              feriado || !laborable ? 'rayado' : 'bg-bg'
            } ${pasado ? 'opacity-55' : ''}`}
            style={{ height: alto }}
          >
            {horas.slice(1).map((m) => (
              <div
                key={m}
                className="absolute inset-x-0 border-t border-dashed border-line"
                style={{ top: (m - horario.inicio) * PX_POR_MIN }}
              />
            ))}

            {feriado && (
              <div className="absolute inset-x-1.5 top-2 rounded-xl bg-surface/90 p-2 text-center sombra">
                <PartyPopper size={16} className="mx-auto mb-1 text-primary" aria-hidden />
                <p className="text-[12px] font-extrabold leading-tight">Feriado</p>
                <p className="mt-0.5 text-[11px] font-semibold leading-tight text-muted">{feriado}</p>
              </div>
            )}
            {!feriado && !laborable && (
              <p className="absolute inset-x-0 top-3 text-center text-[12px] font-bold text-muted">Libre</p>
            )}

            {propios.map((b) => {
              const t = tareas[b.tareaId]
              if (!t) return null
              const altoBloque = (b.fin - b.inicio) * PX_POR_MIN - 3
              return (
                <motion.button
                  key={`${b.tareaId}-${b.parte}`}
                  layoutId={`${b.tareaId}-${b.parte}`}
                  type="button"
                  onClick={() => onAbrir(t)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.03, zIndex: 5 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                  className="absolute inset-x-1 flex flex-col items-start justify-start overflow-hidden rounded-xl border-l-4 px-2 py-1 text-left hyphens-auto [overflow-wrap:anywhere]"
                  style={{ ...estiloBloque(t.materia), top: (b.inicio - horario.inicio) * PX_POR_MIN + 1.5, height: altoBloque }}
                  aria-label={`${t.titulo}, ${hora(b.inicio)} a ${hora(b.fin)}`}
                  title={`${t.titulo} (${t.materia}), ${hora(b.inicio)} a ${hora(b.fin)}`}
                >
                  <p
                    className={`w-full text-[12.5px] font-extrabold leading-tight ${
                      altoBloque > 70 ? 'line-clamp-3' : altoBloque > 48 ? 'line-clamp-2' : 'truncate'
                    }`}
                  >
                    {t.titulo}
                  </p>
                  {altoBloque > 40 && (
                    <p className="truncate text-[11.5px] font-semibold leading-tight opacity-80">
                      {hora(b.inicio)} a {hora(b.fin)}
                    </p>
                  )}
                  {altoBloque > 62 && b.partes > 1 && (
                    <p className="truncate text-[11px] font-semibold opacity-70">
                      Parte {b.parte} de {b.partes}
                    </p>
                  )}
                </motion.button>
              )
            })}

            {d === hoyClave && ahoraMin > horario.inicio && ahoraMin < horario.fin && (
              <div
                className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                style={{ top: (ahoraMin - horario.inicio) * PX_POR_MIN }}
              >
                <span className="-ml-1 size-2.5 rounded-full bg-primary" />
                <span className="h-0.5 flex-1 bg-primary" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function VistaDia({ dias, bloques, tareas, feriados, horario, hoyClave, onAbrir }: Props & { dias: string[] }) {
  const inicial = dias.includes(hoyClave) ? hoyClave : dias[0]
  const [elegido, setElegido] = useState(inicial)
  const dia = dias.includes(elegido) ? elegido : inicial
  const propios = bloques.filter((b) => b.fecha === dia)
  const feriado = feriados.get(dia)
  const laborable = horario.dias.includes(desdeClave(dia).getDay())

  return (
    <div>
      <div role="tablist" aria-label="Día" className="grid grid-cols-7 gap-1">
        {dias.map((d) => {
          const activo = d === dia
          const cantidad = bloques.filter((b) => b.fecha === d).length
          return (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={activo}
              onClick={() => setElegido(d)}
              className={`flex min-h-16 flex-col items-center justify-center rounded-2xl text-center transition-colors ${
                activo ? 'bg-primary text-primary-ink' : d === hoyClave ? 'bg-chip' : 'hover:bg-chip'
              }`}
            >
              <span className="text-[11px] font-bold opacity-80">{diaCorto(d)}</span>
              <span className="text-[17px] font-extrabold tabular-nums">{desdeClave(d).getDate()}</span>
              <span
                className={`mt-0.5 size-1.5 rounded-full ${cantidad ? (activo ? 'bg-primary-ink' : 'bg-primary') : 'bg-transparent'}`}
              />
            </button>
          )
        })}
      </div>

      <p className="titulo mb-3 mt-5 text-[19px]">{diaLargo(dia)}</p>

      <AnimatePresence mode="popLayout" initial={false}>
        {feriado ? (
          <Aviso key="feriado" icono={<PartyPopper size={20} aria-hidden />} titulo={`Feriado: ${feriado}`} texto="No te puse trabajo este día." />
        ) : !laborable ? (
          <Aviso key="libre" icono={<CalendarOff size={20} aria-hidden />} titulo="Día libre" texto="No está en tu horario de trabajo." />
        ) : propios.length === 0 ? (
          <Aviso key="vacio" icono={<CalendarOff size={20} aria-hidden />} titulo="Nada planificado" texto="Tenés este día libre." />
        ) : (
          <ul key={dia} className="space-y-2">
            {propios.map((b, i) => {
              const t = tareas[b.tareaId]
              if (!t) return null
              return (
                <motion.li
                  key={`${b.tareaId}-${b.parte}`}
                  layoutId={`m-${b.tareaId}-${b.parte}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 30, delay: i * 0.04 }}
                >
                  <button
                    type="button"
                    onClick={() => onAbrir(t)}
                    className="flex w-full items-stretch gap-3 rounded-2xl border-l-4 p-3 text-left"
                    style={estiloBloque(t.materia)}
                  >
                    <span className="w-12 shrink-0 text-[13px] font-extrabold tabular-nums">
                      {hora(b.inicio)}
                      <span className="block font-semibold opacity-70">{hora(b.fin)}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-extrabold">{t.titulo}</span>
                      <span className="block truncate text-[13px] font-semibold opacity-80">
                        {t.materia}, {duracion(b.fin - b.inicio)}
                        {b.partes > 1 && ` (parte ${b.parte} de ${b.partes})`}
                      </span>
                    </span>
                    <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ background: colorMateria(t.materia).fuerte }} />
                  </button>
                </motion.li>
              )
            })}
          </ul>
        )}
      </AnimatePresence>
    </div>
  )
}

function Aviso({ icono, titulo, texto }: { icono: React.ReactNode; titulo: string; texto: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-3 rounded-2xl bg-chip p-4"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-primary">{icono}</span>
      <span>
        <span className="block text-[15px] font-extrabold">{titulo}</span>
        <span className="block text-[14px] text-muted">{texto}</span>
      </span>
    </motion.div>
  )
}
