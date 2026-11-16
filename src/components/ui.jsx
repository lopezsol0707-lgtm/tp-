import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { LoaderCircle } from 'lucide-react'
import { useEffect } from 'react'

const ESTILO_BOTON = {
  primario: 'bg-primary text-primary-ink hover:brightness-105 sombra',
  secundario: 'bg-chip text-ink hover:brightness-[0.97]',
  peligro: 'bg-danger text-white hover:brightness-110',
  fantasma: 'bg-transparent text-ink hover:bg-chip',
}

export function Boton({
  variante = 'primario',
  cargando = false,
  icono: Icono,
  children,
  className = '',
  disabled,
  ...resto
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      disabled={disabled || cargando}
      className={`inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-[15px] font-bold transition-[filter,background-color] disabled:opacity-60 ${ESTILO_BOTON[variante]} ${className}`}
      {...resto}
    >
      {cargando ? (
        <LoaderCircle size={18} className="animate-spin" aria-hidden />
      ) : (
        Icono && <Icono size={18} strokeWidth={2.4} aria-hidden />
      )}
      {children}
    </motion.button>
  )
}

export function BotonIcono({ icono: Icono, etiqueta, className = '', ...resto }) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      className={`grid size-11 shrink-0 place-items-center rounded-full text-ink transition-colors hover:bg-chip ${className}`}
      {...resto}
    >
      <Icono size={19} strokeWidth={2.2} aria-hidden />
    </button>
  )
}

export function Segmentado({ id, etiqueta, opciones, valor, onChange }) {
  const indice = Math.max(
    0,
    opciones.findIndex((o) => o.valor === valor),
  )
  return (
    <div role="radiogroup" aria-label={etiqueta} id={id} className="relative flex rounded-full bg-chip p-1">
      <span
        aria-hidden
        className="absolute bottom-1 left-1 top-1 rounded-full bg-surface sombra transition-transform duration-300 ease-[cubic-bezier(.2,.9,.3,1.15)] motion-reduce:transition-none"
        style={{ width: `calc((100% - 8px) / ${opciones.length})`, transform: `translateX(${indice * 100}%)` }}
      />
      {opciones.map((o) => {
        const activo = o.valor === valor
        const Icono = o.icono
        return (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => onChange(o.valor)}
            className={`relative min-h-10 flex-1 basis-0 rounded-full px-2 text-[14px] font-bold transition-colors ${
              activo ? 'text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            <span className="relative flex items-center justify-center gap-1.5 whitespace-nowrap">
              {Icono && <Icono size={16} strokeWidth={2.3} aria-hidden />}
              {o.etiqueta}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Número que cuenta hasta su valor. */
export function Contador({ valor, formato = (v) => String(v) }) {
  const mv = useMotionValue(0)
  const texto = useTransform(mv, (v) => formato(Math.round(v)))
  useEffect(() => {
    const c = animate(mv, valor, { duration: 0.8, ease: [0.16, 1, 0.3, 1] })
    return () => c.stop()
  }, [mv, valor])
  return <motion.span className="tabular-nums">{texto}</motion.span>
}
