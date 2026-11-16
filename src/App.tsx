import { CalendarDays, ListTodo, Plus, RotateCcw, RotateCw, Sparkles, Zap } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Agenda } from './components/Agenda'
import { Avisos, type Aviso } from './components/Avisos'
import { DialogoBorrar } from './components/DialogoBorrar'
import { FormularioTarea } from './components/FormularioTarea'
import { Hoja } from './components/Hoja'
import { ListaTareas } from './components/ListaTareas'
import { Resumen } from './components/Resumen'
import { Boton, Segmentado } from './components/ui'
import { Confirmar } from './components/Confirmar'
import { Estadisticas } from './components/Estadisticas'
import { actualizarTarea, cargarEjemplo, crearTarea, eliminarTarea, reiniciarEjemplo } from './data/tareas'
import { aClave, hoy, lunesDe, sumarDias } from './fechas'
import { useFeriados, useTareas } from './hooks/useDatos'
import { asignarColores } from './materias'
import { planificar } from './planificador'
import type { DatosTarea, Horario, Tarea } from './tipos'

const HORARIO: Horario = { dias: [1, 2, 3, 4, 5], inicio: 9 * 60, fin: 18 * 60 }

type Formulario = { modo: 'nueva' } | { modo: 'editar'; tarea: Tarea } | null

function useAhora() {
  const [ahora, setAhora] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setAhora(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])
  return ahora
}

export default function App() {
  const { uid, tareas, cargando, error, reintentar } = useTareas()
  const { feriados, estado: estadoFeriados, reintentar: reintentarFeriados } = useFeriados()
  const ahora = useAhora()
  const hoyClave = aClave(ahora)

  const [lunes, setLunes] = useState(() => lunesDe(hoy()))
  const [vista, setVista] = useState<'agenda' | 'tareas'>('agenda')
  const [form, setForm] = useState<Formulario>(null)
  const [aBorrar, setABorrar] = useState<Tarea | null>(null)
  const [cargandoEjemplo, setCargandoEjemplo] = useState(false)
  const [pedirReinicio, setReiniciar] = useState(false)
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const proximoAviso = useRef(1)

  const plan = useMemo(() => planificar(tareas, ahora, HORARIO, feriados), [tareas, ahora, feriados])
  const porId = useMemo(() => Object.fromEntries(tareas.map((t) => [t.id, t])), [tareas])
  const materias = useMemo(() => {
    asignarColores(tareas)
    return [...new Set(tareas.map((t) => t.materia))]
  }, [tareas])

  const avisar = useCallback((tipo: Aviso['tipo'], texto: string) => {
    const id = proximoAviso.current++
    setAvisos((l) => [...l.slice(-2), { id, tipo, texto }])
    window.setTimeout(() => setAvisos((l) => l.filter((a) => a.id !== id)), 4500)
  }, [])

  async function guardar(datos: DatosTarea) {
    if (!uid) throw new Error('Sin usuario')
    if (form?.modo === 'editar') {
      await actualizarTarea(uid, form.tarea.id, datos)
      avisar('ok', `Guardamos los cambios de "${datos.titulo}".`)
    } else {
      await crearTarea(uid, datos)
      avisar('ok', `Listo, "${datos.titulo}" ya está en tu agenda.`)
    }
    setForm(null)
  }

  async function alternar(t: Tarea) {
    if (!uid) return
    try {
      await actualizarTarea(uid, t.id, { hecha: !t.hecha, hechaEn: t.hecha ? null : Date.now() })
      avisar('ok', t.hecha ? `"${t.titulo}" volvió a pendientes.` : `Bien ahí, terminaste "${t.titulo}".`)
    } catch {
      avisar('error', 'No pudimos guardar el cambio. Probá de nuevo.')
    }
  }

  async function borrar(t: Tarea) {
    if (!uid) return
    try {
      await eliminarTarea(uid, t.id)
      setABorrar(null)
      avisar('ok', `Borramos "${t.titulo}".`)
    } catch (e) {
      avisar('error', `No pudimos borrar "${t.titulo}". Probá de nuevo.`)
      throw e
    }
  }

  async function ejemplo() {
    if (!uid) return
    setCargandoEjemplo(true)
    try {
      await cargarEjemplo(uid)
      avisar('ok', 'Cargamos el ejemplo.')
    } catch {
      avisar('error', 'No pudimos cargar el ejemplo. Probá de nuevo.')
    } finally {
      setCargandoEjemplo(false)
    }
  }

  // La primera vez que alguien entra, le cargamos el ejemplo automáticamente.
  // Después, lo que cambie (o borre) queda guardado en Firestore.
  const sembrando = useRef(false)
  useEffect(() => {
    if (!uid || cargando || error || tareas.length > 0 || sembrando.current) return
    const clave = `entrega.ejemplo.${uid}`
    let yaSembrado = false
    try {
      yaSembrado = localStorage.getItem(clave) === '1'
      localStorage.setItem(clave, '1')
    } catch {
      /* sin almacenamiento local: sembramos igual una sola vez por sesión */
    }
    if (yaSembrado) return
    sembrando.current = true
    cargarEjemplo(uid).catch(() => avisar('error', 'No pudimos cargar el ejemplo inicial.'))
  }, [uid, cargando, error, tareas.length, avisar])

  async function reiniciar() {
    if (!uid) return
    try {
      await reiniciarEjemplo(uid, tareas)
      setReiniciar(false)
      setLunes(lunesDe(hoy()))
      avisar('ok', 'Listo, volvió todo como al principio.')
    } catch {
      avisar('error', 'No pudimos reiniciar. Probá de nuevo.')
    }
  }

  const abrir = (t: Tarea) => setForm({ modo: 'editar', tarea: t })
  const cerrarForm = useCallback(() => setForm(null), [])
  const cancelarBorrar = useCallback(() => setABorrar(null), [])
  const cerrarReinicio = useCallback(() => setReiniciar(false), [])
  const nueva = () => setForm({ modo: 'nueva' })

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <header className="flex items-center justify-between gap-3 py-4 sm:py-6">
        <a href="./" className="flex items-center gap-2.5" aria-label="Entregá, inicio">
          <span className="grid size-11 place-items-center rounded-[14px] bg-primary text-primary-ink sombra">
            <Zap size={22} strokeWidth={2.4} aria-hidden />
          </span>
          <span className="titulo text-[26px]">Entregá</span>
        </a>
        <Boton icono={Plus} onClick={nueva} disabled={!uid}>
          Nueva tarea
        </Boton>
      </header>

      <main className="space-y-5 sm:space-y-6">
        {error ? (
          <Vacio
            titulo="Algo falló"
            texto={error}
            accion={
              <Boton icono={RotateCw} onClick={reintentar}>
                Reintentar
              </Boton>
            }
          />
        ) : cargando ? (
          <div className="space-y-5" aria-busy="true" aria-label="Cargando tu agenda">
            <div className="brillo h-64 rounded-[var(--radius)]" />
            <div className="brillo h-96 rounded-[var(--radius)]" />
          </div>
        ) : (
          <>
            <Resumen
              plan={plan}
              tareas={tareas}
              feriados={feriados}
              estadoFeriados={estadoFeriados}
              onReintentarFeriados={reintentarFeriados}
              lunes={lunes}
            />

            {tareas.length === 0 ? (
              <Vacio
                titulo="Tu agenda está vacía"
                texto="Cargá tus entregas con cuánto te llevan y para cuándo son. Entregá las reparte sola en tus horarios libres."
                accion={
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Boton icono={Plus} onClick={nueva}>
                      Cargar mi primera tarea
                    </Boton>
                    <Boton variante="secundario" icono={Sparkles} cargando={cargandoEjemplo} onClick={ejemplo}>
                      Probar con un ejemplo
                    </Boton>
                  </div>
                }
              />
            ) : (
              <>
                <div className="lg:hidden">
                  <Segmentado<'agenda' | 'tareas'>
                    id="vista"
                    etiqueta="Vista"
                    valor={vista}
                    onChange={setVista}
                    opciones={[
                      { valor: 'agenda', etiqueta: 'Agenda', icono: CalendarDays },
                      { valor: 'tareas', etiqueta: `Tareas (${tareas.filter((t) => !t.hecha).length})`, icono: ListTodo },
                    ]}
                  />
                </div>
                <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
                  <div className={vista === 'agenda' ? '' : 'hidden lg:block'}>
                    <Agenda
                      lunes={lunes}
                      onCambiarSemana={(n) => setLunes((l) => sumarDias(l, n * 7))}
                      onHoy={() => setLunes(lunesDe(hoy()))}
                      bloques={plan.bloques}
                      tareas={porId}
                      feriados={feriados}
                      horario={HORARIO}
                      hoyClave={hoyClave}
                      ahoraMin={ahora.getHours() * 60 + ahora.getMinutes()}
                      onAbrir={abrir}
                    />
                  </div>
                  <div className={vista === 'tareas' ? '' : 'hidden lg:block'}>
                    <ListaTareas
                      tareas={tareas}
                      estados={plan.estados}
                      onAlternar={alternar}
                      onEditar={abrir}
                      onBorrar={setABorrar}
                    />
                  </div>
                </div>

                <Estadisticas tareas={tareas} plan={plan} feriados={feriados} horario={HORARIO} hoyClave={hoyClave} />
              </>
            )}
          </>
        )}
      </main>

      <footer className="mt-12 flex flex-col items-center gap-2 text-center text-[13px] font-semibold text-muted">
        <p>Feriados nacionales: API de ArgentinaDatos. Tus tareas se guardan en Firebase.</p>
        {uid && !cargando && (
          <button
            type="button"
            onClick={() => setReiniciar(true)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 underline-offset-4 hover:bg-chip hover:text-ink hover:underline"
          >
            <RotateCcw size={14} aria-hidden />
            Volver al ejemplo inicial
          </button>
        )}
      </footer>
      <Confirmar abierto={pedirReinicio} onConfirmar={reiniciar} onCancelar={cerrarReinicio} />

      <Hoja
        abierta={!!form}
        onCerrar={cerrarForm}
        titulo={form?.modo === 'editar' ? 'Editar tarea' : 'Nueva tarea'}
        ancho="sm:max-w-lg"
      >
        {form && (
          <FormularioTarea
            key={form.modo === 'editar' ? form.tarea.id : 'nueva'}
            inicial={form.modo === 'editar' ? form.tarea : undefined}
            materias={materias}
            feriados={feriados}
            onGuardar={guardar}
            onCancelar={cerrarForm}
          />
        )}
      </Hoja>

      <DialogoBorrar tarea={aBorrar} onConfirmar={borrar} onCancelar={cancelarBorrar} />
      <Avisos avisos={avisos} onCerrar={(id) => setAvisos((l) => l.filter((a) => a.id !== id))} />
    </div>
  )
}

function Vacio({ titulo, texto, accion }: { titulo: string; texto: string; accion: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius)] border-2 border-dashed border-line px-6 py-12 text-center">
      <span className="mb-4 grid size-16 place-items-center rounded-full bg-chip text-primary">
        <CalendarDays size={28} aria-hidden />
      </span>
      <h2 className="titulo text-[26px]">{titulo}</h2>
      <p className="mt-2 max-w-md text-[16px] text-muted">{texto}</p>
      <div className="mt-6">{accion}</div>
    </div>
  )
}
