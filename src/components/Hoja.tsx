import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'
import { BotonIcono } from './ui'

/**
 * Ventana que sube desde abajo en el celular y aparece centrada en la compu.
 * Se cierra con Escape, con la X o tocando afuera.
 */
export function Hoja({
  abierta,
  onCerrar,
  titulo,
  children,
  pie,
  ancho = 'sm:max-w-xl',
}: {
  abierta: boolean
  onCerrar: () => void
  titulo: string
  children: ReactNode
  pie?: ReactNode
  ancho?: string
}) {
  const idTitulo = useId()

  useEffect(() => {
    if (!abierta) return
    const alTeclear = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    const overflowPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', alTeclear)
    return () => {
      document.body.style.overflow = overflowPrevio
      window.removeEventListener('keydown', alTeclear)
    }
  }, [abierta, onCerrar])

  return (
    <AnimatePresence>
      {abierta && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCerrar}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={idTitulo}
            className={`relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[var(--radius)] bg-surface sm:rounded-[var(--radius)] ${ancho}`}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0, transition: { duration: 0.16 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
          >
            <header className="flex items-center justify-between gap-3 border-b border-line py-2 pl-5 pr-2 sm:pl-6">
              <h2 id={idTitulo} className="titulo truncate text-[22px]">
                {titulo}
              </h2>
              <BotonIcono icono={X} etiqueta="Cerrar" onClick={onCerrar} />
            </header>
            <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
            {pie && <footer className="border-t border-line bg-surface px-5 py-3 sm:px-6">{pie}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
