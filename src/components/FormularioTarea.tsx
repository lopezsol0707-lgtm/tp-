import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, CircleAlert, Minus, Plus } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { aClave, desdeClave, diaLargo, duracion, hoy, mesLargo, sumarDias } from '../fechas'
import { colorMateria } from '../materias'
import type { DatosTarea, Prioridad, Tarea } from '../tipos'
import { Boton, BotonIcono, Segmentado } from './ui'

const CAMPO =
  'h-12 w-full rounded-2xl border-2 border-line bg-bg px-4 text-[16px] font-medium text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-primary'

const DURACIONES = [30, 60, 120, 180, 240]

type Errores = Partial<Record<'titulo' | 'materia' | 'fechaLimite', string>>

function validar(d: DatosTarea): Errores {
  const e: Errores = {}
  const titulo = d.titulo.trim()
  if (titulo.length < 2) e.titulo = 'Poné un nombre de al menos 2 letras.'
  else if (titulo.length > 60) e.titulo = 'Usá un nombre más corto (hasta 60 letras).'
  if (!d.materia.trim()) e.materia = 'Elegí o escribí una materia.'
  else if (d.materia.trim().length > 30) e.materia = 'Hasta 30 letras.'
  if (!d.fechaLimite) e.fechaLimite = 'Elegí el día de entrega.'
  else if (d.fechaLimite < hoy()) e.fechaLimite = 'La entrega no puede ser en el pasado.'
  return e
}

export function FormularioTarea({
  inicial,
  materias,
  feriados,
  onGuardar,
  onCancelar,
}: {
  inicial?: Tarea
  materias: string[]
  feriados: Map<string, string>
  onGuardar: (d: DatosTarea) => Promise<void>
  onCancelar: () => void
}) {
  const base = useId()
  const [d, setD] = useState<DatosTarea>(() =>
    inicial
      ? {
          titulo: inicial.titulo,
          materia: inicial.materia,
          duracionMin: inicial.duracionMin,
          fechaLimite: inicial.fechaLimite,
          prioridad: inicial.prioridad,
        }
      : { titulo: '', materia: '', duracionMin: 120, fechaLimite: '', prioridad: 'media' },
  )
  const [intentado, setIntentado] = useState(false)
  const [tocados, setTocados] = useState<Record<string, boolean>>({})
  const [guardando, setGuardando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const errores = validar(d)
  const ver = (k: keyof Errores) => (intentado || tocados[k] ? errores[k] : undefined)
  const set = <K extends keyof DatosTarea>(k: K, v: DatosTarea[K]) => setD((p) => ({ ...p, [k]: v }))

  async function enviar(ev: React.FormEvent) {
    ev.preventDefault()
    setIntentado(true)
    setErrorGeneral(null)
    const claves = Object.keys(errores) as (keyof Errores)[]
    if (claves.length) {
      document.getElementById(`${base}-${claves[0]}`)?.focus()
      return
    }
    setGuardando(true)
    try {
      await onGuardar({ ...d, titulo: d.titulo.trim(), materia: d.materia.trim() })
    } catch {
      setErrorGeneral('No pudimos guardar la tarea. Revisá tu conexión y probá de nuevo.')
      setGuardando(false)
    }
  }

  const sugeridas = materias.filter((m) => m.toLowerCase() !== d.materia.trim().toLowerCase()).slice(0, 6)

  return (
    <form onSubmit={enviar} noValidate className="flex h-full flex-col">
      <div className="space-y-5 p-5 sm:p-6">
        <Campo id={`${base}-titulo`} etiqueta="Qué tenés que hacer" error={ver('titulo')}>
          <input
            id={`${base}-titulo`}
            className={CAMPO}
            value={d.titulo}
            onChange={(e) => set('titulo', e.target.value)}
            onBlur={() => setTocados((t) => ({ ...t, titulo: true }))}
            placeholder="Por ejemplo, maqueta final"
            maxLength={70}
            autoComplete="off"
            aria-invalid={!!ver('titulo')}
          />
        </Campo>

        <Campo id={`${base}-materia`} etiqueta="Materia o proyecto" error={ver('materia')}>
          <div className="flex items-center gap-3">
            <span
              className="size-4 shrink-0 rounded-full transition-colors"
              style={{ background: d.materia.trim() ? colorMateria(d.materia).fuerte : 'var(--line)' }}
              aria-hidden
            />
            <input
              id={`${base}-materia`}
              className={CAMPO}
              value={d.materia}
              onChange={(e) => set('materia', e.target.value)}
              onBlur={() => setTocados((t) => ({ ...t, materia: true }))}
              placeholder="Por ejemplo, Diseño 3"
              maxLength={40}
              autoComplete="off"
              aria-invalid={!!ver('materia')}
            />
          </div>
          {sugeridas.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {sugeridas.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set('materia', m)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border-2 border-line px-3 text-[13px] font-semibold hover:border-muted/40"
                >
                  <span className="size-2.5 rounded-full" style={{ background: colorMateria(m).fuerte }} />
                  {m}
                </button>
              ))}
            </div>
          )}
        </Campo>

        <Campo etiqueta="Cuánto tiempo te lleva">
          <div className="flex items-center gap-2">
            <BotonIcono
              icono={Minus}
              etiqueta="Quitar 15 minutos"
              onClick={() => set('duracionMin', Math.max(15, d.duracionMin - 15))}
              className="bg-chip"
            />
            <p className="titulo flex-1 text-center text-[26px] tabular-nums" aria-live="polite">
              {duracion(d.duracionMin)}
            </p>
            <BotonIcono
              icono={Plus}
              etiqueta="Sumar 15 minutos"
              onClick={() => set('duracionMin', Math.min(1200, d.duracionMin + 15))}
              className="bg-chip"
            />
          </div>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {DURACIONES.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={d.duracionMin === m}
                onClick={() => set('duracionMin', m)}
                className={`min-h-10 rounded-full border-2 text-[13px] font-bold transition-colors ${
                  d.duracionMin === m ? 'border-primary bg-primary text-primary-ink' : 'border-line hover:border-muted/40'
                }`}
              >
                {m < 60 ? `${m} min` : `${m / 60} h`}
              </button>
            ))}
          </div>
        </Campo>

        <Campo id={`${base}-fechaLimite`} etiqueta="Día de entrega" error={ver('fechaLimite')}>
          <Calendario
            id={`${base}-fechaLimite`}
            valor={d.fechaLimite}
            feriados={feriados}
            onElegir={(f) => {
              set('fechaLimite', f)
              setTocados((t) => ({ ...t, fechaLimite: true }))
            }}
          />
        </Campo>

        <Campo etiqueta="Prioridad">
          <Segmentado<Prioridad>
            id={`${base}-prioridad`}
            etiqueta="Prioridad"
            valor={d.prioridad}
            onChange={(v) => set('prioridad', v)}
            opciones={[
              { valor: 'alta', etiqueta: 'Alta' },
              { valor: 'media', etiqueta: 'Media' },
              { valor: 'baja', etiqueta: 'Baja' },
            ]}
          />
          <p className="mt-1.5 text-[13px] text-muted">Si dos tareas vencen el mismo día, va primero la de mayor prioridad.</p>
        </Campo>

        <AnimatePresence>
          {errorGeneral && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 rounded-2xl bg-danger/10 px-4 py-3 text-[15px] font-semibold text-danger"
            >
              <CircleAlert size={18} className="mt-0.5 shrink-0" aria-hidden />
              {errorGeneral}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="sticky bottom-0 mt-auto flex gap-2 border-t border-line bg-surface px-5 py-3 sm:justify-end sm:px-6">
        <Boton type="button" variante="secundario" onClick={onCancelar} className="flex-1 sm:flex-none">
          Cancelar
        </Boton>
        <Boton type="submit" cargando={guardando} className="flex-[2] sm:flex-none">
          {guardando ? 'Guardando' : inicial ? 'Guardar cambios' : 'Agregar a la agenda'}
        </Boton>
      </div>
    </form>
  )
}

function Campo({ id, etiqueta, error, children }: { id?: string; etiqueta: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[14px] font-bold">{id ? <label htmlFor={id}>{etiqueta}</label> : <span>{etiqueta}</span>}</div>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[14px] font-semibold text-danger">
          <CircleAlert size={15} aria-hidden className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

/** Calendario propio para elegir la fecha de entrega (marca feriados). */
function Calendario({
  id,
  valor,
  feriados,
  onElegir,
}: {
  id: string
  valor: string
  feriados: Map<string, string>
  onElegir: (f: string) => void
}) {
  const hoyClave = hoy()
  const [mes, setMes] = useState(() => {
    const d = desdeClave(valor || hoyClave)
    return aClave(new Date(d.getFullYear(), d.getMonth(), 1))
  })
  const primero = desdeClave(mes)
  const offset = (primero.getDay() + 6) % 7
  const diasMes = new Date(primero.getFullYear(), primero.getMonth() + 1, 0).getDate()
  const celdas = [...Array.from({ length: offset }, () => null), ...Array.from({ length: diasMes }, (_, i) => sumarDias(mes, i))]
  const cambiarMes = (n: number) => setMes(aClave(new Date(primero.getFullYear(), primero.getMonth() + n, 1)))
  const feriadoElegido = valor ? feriados.get(valor) : undefined

  return (
    <div id={id} tabIndex={-1} className="rounded-2xl border-2 border-line bg-bg p-3 outline-none focus:border-primary">
      <div className="mb-2 flex items-center justify-between">
        <BotonIcono icono={ChevronLeft} etiqueta="Mes anterior" onClick={() => cambiarMes(-1)} />
        <p className="text-[15px] font-extrabold">{mesLargo(mes)}</p>
        <BotonIcono icono={ChevronRight} etiqueta="Mes siguiente" onClick={() => cambiarMes(1)} />
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((l, i) => (
          <span key={i} className="pb-1 text-[12px] font-bold text-muted">
            {l}
          </span>
        ))}
        {celdas.map((c, i) => {
          if (!c) return <span key={`v${i}`} />
          const pasado = c < hoyClave
          const elegido = c === valor
          const feriado = feriados.get(c)
          return (
            <button
              key={c}
              type="button"
              disabled={pasado}
              aria-pressed={elegido}
              aria-label={`${diaLargo(c)}${feriado ? `, feriado: ${feriado}` : ''}`}
              title={feriado}
              onClick={() => onElegir(c)}
              className={`relative grid aspect-square min-h-9 place-items-center rounded-full text-[14px] font-bold tabular-nums transition-colors disabled:opacity-30 ${
                elegido
                  ? 'bg-primary text-primary-ink'
                  : c === hoyClave
                    ? 'bg-chip text-primary'
                    : 'hover:bg-chip'
              }`}
            >
              {desdeClave(c).getDate()}
              {feriado && (
                <span
                  className={`absolute bottom-1 size-1.5 rounded-full ${elegido ? 'bg-primary-ink' : 'bg-primary'}`}
                  aria-hidden
                />
              )}
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-[13px] font-semibold text-muted">
        {valor ? `Entrega: ${diaLargo(valor)}${feriadoElegido ? ` (feriado: ${feriadoElegido})` : ''}` : 'Los puntitos marcan feriados.'}
      </p>
    </div>
  )
}
