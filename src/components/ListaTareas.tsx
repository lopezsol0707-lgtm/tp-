import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronDown, Clock, Flag, LoaderCircle, Pencil, Trash2, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { duracion, fechaRelativa } from '../fechas'
import { colorMateria } from '../materias'
import { ordenarPendientes } from '../planificador'
import type { EstadoTarea, Tarea } from '../tipos'
import { BotonIcono } from './ui'

const PRIORIDAD = { alta: 'Prioridad alta', media: 'Prioridad media', baja: 'Prioridad baja' }

interface Props {
  tareas: Tarea[]
  estados: Record<string, EstadoTarea>
  onAlternar: (t: Tarea) => Promise<void>
  onEditar: (t: Tarea) => void
  onBorrar: (t: Tarea) => void
}

export function ListaTareas({ tareas, estados, onAlternar, onEditar, onBorrar }: Props) {
  const [verHechas, setVerHechas] = useState(false)
  const pendientes = ordenarPendientes(tareas)
  const hechas = tareas.filter((t) => t.hecha).sort((a, b) => (b.hechaEn ?? 0) - (a.hechaEn ?? 0))

  return (
    <section aria-labelledby="titulo-tareas" className="rounded-[var(--radius)] bg-surface p-3 sombra sm:p-5">
      <h2 id="titulo-tareas" className="titulo mb-3 px-1 text-[24px]">
        Pendientes <span className="text-muted">{pendientes.length}</span>
      </h2>

      {pendientes.length === 0 ? (
        <p className="rounded-2xl bg-chip p-4 text-[15px] font-semibold text-muted">No tenés nada pendiente.</p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false} mode="popLayout">
            {pendientes.map((t) => (
              <Item key={t.id} t={t} estado={estados[t.id]} onAlternar={onAlternar} onEditar={onEditar} onBorrar={onBorrar} />
            ))}
          </AnimatePresence>
        </ul>
      )}

      {hechas.length > 0 && (
        <div className="mt-4 border-t border-line pt-3">
          <button
            type="button"
            aria-expanded={verHechas}
            onClick={() => setVerHechas((v) => !v)}
            className="flex min-h-11 w-full items-center justify-between rounded-2xl px-2 text-[15px] font-bold text-muted hover:bg-chip"
          >
            Hechas ({hechas.length})
            <ChevronDown size={18} className={`transition-transform ${verHechas ? 'rotate-180' : ''}`} aria-hidden />
          </button>
          <AnimatePresence initial={false}>
            {verHechas && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden pt-2"
              >
                {hechas.map((t) => (
                  <Item key={t.id} t={t} onAlternar={onAlternar} onEditar={onEditar} onBorrar={onBorrar} />
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  )
}

function Item({
  t,
  estado,
  onAlternar,
  onEditar,
  onBorrar,
}: {
  t: Tarea
  estado?: EstadoTarea
  onAlternar: (t: Tarea) => Promise<void>
  onEditar: (t: Tarea) => void
  onBorrar: (t: Tarea) => void
}) {
  const [guardando, setGuardando] = useState(false)
  const color = colorMateria(t.materia)

  async function alternar() {
    setGuardando(true)
    try {
      await onAlternar(t)
    } finally {
      setGuardando(false)
    }
  }

  let linea: { texto: string; riesgo: boolean } | null = null
  if (!t.hecha && estado) {
    if (estado.vencida) linea = { texto: `Se venció ${fechaRelativa(t.fechaLimite)}`, riesgo: true }
    else if (estado.termina === null) linea = { texto: 'No entra en tu agenda', riesgo: true }
    else if (estado.enRiesgo) linea = { texto: `No llega: terminaría ${fechaRelativa(estado.termina)}`, riesgo: true }
    else linea = { texto: `Queda lista ${fechaRelativa(estado.termina)}`, riesgo: false }
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 30, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
      className={`flex items-start gap-2 rounded-2xl border p-2.5 ${
        linea?.riesgo ? 'border-danger/40 bg-danger/5' : 'border-line bg-bg'
      }`}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={t.hecha}
        aria-label={t.hecha ? `Marcar "${t.titulo}" como pendiente` : `Marcar "${t.titulo}" como hecha`}
        onClick={alternar}
        disabled={guardando}
        className="grid size-11 shrink-0 place-items-center"
      >
        <motion.span
          animate={t.hecha ? { scale: [1, 1.25, 1] } : { scale: 1 }}
          transition={{ duration: 0.35 }}
          className="grid size-7 place-items-center rounded-full border-[2.5px] transition-colors"
          style={{ borderColor: color.fuerte, background: t.hecha ? color.fuerte : 'transparent' }}
        >
          {guardando ? (
            <LoaderCircle size={14} className="animate-spin" style={{ color: t.hecha ? '#fff' : color.fuerte }} aria-hidden />
          ) : (
            t.hecha && <Check size={16} strokeWidth={3.4} className="text-white" aria-hidden />
          )}
        </motion.span>
      </button>

      <div className="min-w-0 flex-1 py-1">
        <p className={`text-[16px] font-bold leading-snug ${t.hecha ? 'text-muted line-through' : ''}`}>{t.titulo}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-semibold text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: color.fuerte }} />
            {t.materia}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={13} aria-hidden />
            {duracion(t.duracionMin)}
          </span>
          {!t.hecha && (
            <span className="inline-flex items-center gap-1" title={PRIORIDAD[t.prioridad]}>
              <Flag size={13} aria-hidden />
              Entrega {fechaRelativa(t.fechaLimite)}
            </span>
          )}
        </div>
        {linea && (
          <p
            className={`mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-bold ${
              linea.riesgo ? 'text-danger' : 'text-[#0b7a52]'
            }`}
          >
            {linea.riesgo ? <TriangleAlert size={14} aria-hidden /> : <Check size={14} strokeWidth={3} aria-hidden />}
            {linea.texto}
          </p>
        )}
      </div>

      <div className="flex shrink-0">
        <BotonIcono icono={Pencil} etiqueta={`Editar "${t.titulo}"`} onClick={() => onEditar(t)} className="!size-10" />
        <BotonIcono
          icono={Trash2}
          etiqueta={`Borrar "${t.titulo}"`}
          onClick={() => onBorrar(t)}
          className="!size-10 hover:!bg-danger/10 hover:!text-danger"
        />
      </div>
    </motion.li>
  )
}
