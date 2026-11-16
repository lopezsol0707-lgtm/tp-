import { AnimatePresence, motion } from 'motion/react'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Tarea } from '../tipos'
import { Boton } from './ui'

interface Props {
  tarea: Tarea | null
  onConfirmar: (t: Tarea) => Promise<void>
  onCancelar: () => void
}

/** Confirmación antes de borrar una tarea (no se puede deshacer). */
export function DialogoBorrar({ tarea, onConfirmar, onCancelar }: Props) {
  useEffect(() => {
    if (!tarea) return
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && onCancelar()
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [tarea, onCancelar])

  return (
    <AnimatePresence>
      {tarea && (
        <div className="fixed inset-0 z-[55] grid place-items-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancelar}
          />
          <Contenido key={tarea.id} tarea={tarea} onConfirmar={onConfirmar} onCancelar={onCancelar} />
        </div>
      )}
    </AnimatePresence>
  )
}

function Contenido({ tarea, onConfirmar, onCancelar }: Props & { tarea: Tarea }) {
  const [borrando, setBorrando] = useState(false)
  async function confirmar() {
    setBorrando(true)
    try {
      await onConfirmar(tarea)
    } catch {
      setBorrando(false)
    }
  }
  return (
    <motion.div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="titulo-borrar"
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.14 } }}
      transition={{ type: 'spring', stiffness: 460, damping: 32 }}
      className="relative w-full max-w-sm rounded-[var(--radius)] bg-surface p-6 text-center"
    >
      <span className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-danger/10 text-danger">
        <Trash2 size={26} aria-hidden />
      </span>
      <h2 id="titulo-borrar" className="titulo text-[24px]">
        ¿Borrar "{tarea.titulo}"?
      </h2>
      <p className="mt-2 text-[15px] text-muted">La sacamos de tu agenda y se reacomoda el resto. No se puede deshacer.</p>
      <div className="mt-6 flex flex-col gap-2">
        <Boton variante="peligro" cargando={borrando} onClick={confirmar} autoFocus>
          {borrando ? 'Borrando' : 'Sí, borrar'}
        </Boton>
        <Boton variante="secundario" onClick={onCancelar} disabled={borrando}>
          Cancelar
        </Boton>
      </div>
    </motion.div>
  )
}
