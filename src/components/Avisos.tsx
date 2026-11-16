import { AnimatePresence, motion } from 'motion/react'
import { CircleAlert, CircleCheckBig, X } from 'lucide-react'

export interface Aviso {
  id: number
  tipo: 'ok' | 'error'
  texto: string
}

/** Mensajes de éxito o error que aparecen abajo y se van solos. */
export function Avisos({ avisos, onCerrar }: { avisos: Aviso[]; onCerrar: (id: number) => void }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4"
    >
      <AnimatePresence>
        {avisos.map((a) => (
          <motion.div
            key={a.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            role={a.tipo === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-[20px] py-2 pl-4 pr-2 text-[15px] font-semibold sombra ${
              a.tipo === 'ok' ? 'bg-ink text-bg' : 'bg-danger text-white'
            }`}
          >
            {a.tipo === 'ok' ? (
              <CircleCheckBig size={20} className="shrink-0" aria-hidden />
            ) : (
              <CircleAlert size={20} className="shrink-0" aria-hidden />
            )}
            <span className="flex-1 py-1.5">{a.texto}</span>
            <button
              type="button"
              onClick={() => onCerrar(a.id)}
              aria-label="Cerrar aviso"
              className="grid size-10 shrink-0 place-items-center rounded-full opacity-80 hover:opacity-100"
            >
              <X size={18} aria-hidden />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
