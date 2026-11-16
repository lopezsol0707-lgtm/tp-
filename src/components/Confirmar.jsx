import { AnimatePresence, motion } from 'motion/react'
import { RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Boton } from './ui'

/** Confirmación para volver al ejemplo inicial. */
export function Confirmar({ abierto, onConfirmar, onCancelar }) {
  const [trabajando, setTrabajando] = useState(false)

  useEffect(() => {
    if (!abierto) return
    const tecla = (e) => e.key === 'Escape' && !trabajando && onCancelar()
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [abierto, onCancelar, trabajando])

  async function confirmar() {
    setTrabajando(true)
    try {
      await onConfirmar()
    } finally {
      setTrabajando(false)
    }
  }

  return (
    <AnimatePresence>
      {abierto && (
        <div className="fixed inset-0 z-[55] grid place-items-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !trabajando && onCancelar()}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="titulo-reiniciar"
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.14 } }}
            transition={{ type: 'spring', stiffness: 460, damping: 32 }}
            className="relative w-full max-w-sm rounded-[var(--radius)] bg-surface p-6 text-center"
          >
            <span className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-chip text-primary">
              <RotateCcw size={26} aria-hidden />
            </span>
            <h2 id="titulo-reiniciar" className="titulo text-[24px]">
              ¿Volver al ejemplo inicial?
            </h2>
            <p className="mt-2 text-[15px] text-muted">
              Se borran los cambios que hiciste y vuelven las tareas de ejemplo como estaban al principio.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Boton cargando={trabajando} onClick={confirmar} autoFocus>
                {trabajando ? 'Reiniciando' : 'Sí, volver al inicio'}
              </Boton>
              <Boton variante="secundario" onClick={onCancelar} disabled={trabajando}>
                Cancelar
              </Boton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
