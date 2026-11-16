import { motion } from 'motion/react'
import { CalendarHeart, Hourglass, PlayCircle, TriangleAlert } from 'lucide-react'
import { diaLargo, duracion, fechaRelativa, hora, hoy, sumarDias } from '../fechas'
import { Contador } from './ui'

export function Resumen({ plan, tareas, feriados, estadoFeriados, onReintentarFeriados, lunes }) {
  const hoyClave = hoy()
  const domingo = sumarDias(lunes, 6)
  const minutosSemana = plan.bloques
    .filter((b) => b.fecha >= lunes && b.fecha <= domingo)
    .reduce((s, b) => s + b.fin - b.inicio, 0)
  const pendientes = tareas.filter((t) => !t.hecha)
  const enRiesgo = pendientes.filter((t) => plan.estados[t.id]?.enRiesgo).length
  const proximo = plan.bloques[0]
  const tareaProxima = proximo && tareas.find((t) => t.id === proximo.tareaId)
  const proximoFeriado = [...feriados.entries()]
    .filter(([f]) => f >= hoyClave)
    .sort(([a], [b]) => a.localeCompare(b))[0]

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="hero-vivo relative overflow-hidden rounded-[calc(var(--radius)+6px)] px-5 py-7 sm:px-9 sm:py-9"
      style={{ background: 'var(--hero)', color: 'var(--hero-ink)' }}
    >
      <h1 className="titulo max-w-2xl text-[36px] sm:text-[52px]">
        {pendientes.length === 0 ? (
          'Tenés la agenda libre'
        ) : (
          <>
            <Contador valor={Math.round(minutosSemana / 60)} /> h de trabajo esta semana
          </>
        )}
      </h1>
      <p className="mt-3 max-w-xl text-[17px] font-semibold leading-snug opacity-85">
        {pendientes.length === 0
          ? 'Cargá una entrega y la acomodo sola en tus horarios libres.'
          : `${pendientes.length} ${pendientes.length === 1 ? 'tarea pendiente' : 'tareas pendientes'}, repartidas sola en tus horarios. Si agregás o terminás algo, la agenda se reacomoda.`}
      </p>

      <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
        <Dato
          icono={<PlayCircle size={20} aria-hidden />}
          titulo="Lo próximo"
          texto={
            tareaProxima
              ? `${tareaProxima.titulo}, ${fechaRelativa(proximo.fecha)} a las ${hora(proximo.inicio)}`
              : 'Nada por ahora'
          }
        />
        <Dato
          icono={enRiesgo ? <TriangleAlert size={20} aria-hidden /> : <Hourglass size={20} aria-hidden />}
          titulo={
            enRiesgo
              ? `${enRiesgo} ${enRiesgo === 1 ? 'entrega no llega' : 'entregas no llegan'}`
              : 'Todo llega a tiempo'
          }
          texto={
            enRiesgo
              ? 'Están marcadas en rojo en la lista.'
              : pendientes.length
                ? `${duracion(pendientes.reduce((s, t) => s + t.duracionMin, 0))} de trabajo en total.`
                : 'Sin entregas cargadas.'
          }
          alerta={enRiesgo > 0}
          orden={1}
        />
        <Dato
          icono={<CalendarHeart size={20} aria-hidden />}
          titulo={
            estadoFeriados === 'error'
              ? 'Sin datos de feriados'
              : estadoFeriados === 'cargando'
                ? 'Buscando feriados'
                : 'Próximo feriado'
          }
          texto={
            estadoFeriados === 'error'
              ? 'No pudimos consultar la API.'
              : proximoFeriado
                ? `${diaLargo(proximoFeriado[0])}: ${proximoFeriado[1]}. Ese día no te pongo nada.`
                : 'No hay más feriados cargados.'
          }
          accion={
            estadoFeriados === 'error' ? (
              <button
                type="button"
                onClick={onReintentarFeriados}
                className="mt-1 text-[14px] font-extrabold underline"
              >
                Reintentar
              </button>
            ) : null
          }
          orden={2}
        />
      </div>
    </motion.section>
  )
}

function Dato({ icono, titulo, texto, alerta, accion, orden }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.25 + (orden ?? 0) * 0.08 }}
      whileHover={{ y: -3 }}
      className="flex gap-3 rounded-2xl p-3.5 backdrop-blur-sm"
      style={{ background: 'var(--hero-chip)' }}
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-full ${alerta ? 'bg-danger text-white' : 'bg-surface text-primary'}`}
      >
        {icono}
      </span>
      <div className="min-w-0">
        <p className="text-[15px] font-extrabold leading-tight">{titulo}</p>
        <p className="mt-0.5 text-[14px] font-semibold leading-snug opacity-80">{texto}</p>
        {accion}
      </div>
    </motion.div>
  )
}
