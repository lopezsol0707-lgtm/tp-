/**
 * Operaciones con Cloud Firestore. Cada usuario tiene sus tareas en
 * usuarios/{uid}/tareas. Son las cuatro operaciones del TP:
 * consultar (escucharTareas), agregar, modificar y eliminar.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import { hoy, sumarDias } from '../fechas'
import type { DatosTarea, Tarea } from '../tipos'

const coleccion = (uid: string) => collection(db, 'usuarios', uid, 'tareas')

/** Consulta en tiempo real: avisa cada vez que cambian las tareas. */
export function escucharTareas(uid: string, alCambiar: (t: Tarea[]) => void, alFallar: (e: Error) => void) {
  return onSnapshot(
    query(coleccion(uid), orderBy('creadaEn', 'desc')),
    (snap) => alCambiar(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Tarea, 'id'>) }))),
    alFallar,
  )
}

export async function crearTarea(uid: string, datos: DatosTarea): Promise<void> {
  await addDoc(coleccion(uid), { ...datos, hecha: false, creadaEn: Date.now(), hechaEn: null })
}

export async function actualizarTarea(uid: string, id: string, cambios: Partial<Omit<Tarea, 'id'>>): Promise<void> {
  await updateDoc(doc(db, 'usuarios', uid, 'tareas', id), cambios)
}

export async function eliminarTarea(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'usuarios', uid, 'tareas', id))
}

/**
 * El ejemplo inicial: la semana de una estudiante de Diseño Digital a fin de
 * cuatrimestre. Las fechas se calculan desde hoy para que siempre esté vigente.
 */
function armarEjemplo(): Omit<Tarea, 'id'>[] {
  const h = hoy()
  const dia = 86_400_000
  const ahora = Date.now()
  const hechas: [string, string, number, number][] = [
    ['Entrevistas a usuarios', 'Diseño de Interfaces', 180, 9],
    ['Primera versión del TP2', 'Frontend II', 240, 8],
    ['Paleta y tipografías de la cafetería', 'Identidad Visual', 60, 6],
    ['Guion del spot de 30 segundos', 'Motion Graphics', 120, 5],
    ['Wireframes de la app', 'Diseño de Interfaces', 240, 3],
    ['Bocetos para Taller 4', 'Taller 4', 150, 2],
  ]
  const pendientes: DatosTarea[] = [
    { titulo: 'Bitácora y capturas del TP2', materia: 'Frontend II', duracionMin: 120, fechaLimite: sumarDias(h, 1), prioridad: 'alta' },
    { titulo: 'Ensayar la exposición oral', materia: 'Frontend II', duracionMin: 90, fechaLimite: sumarDias(h, 1), prioridad: 'alta' },
    { titulo: 'Láminas de presentación', materia: 'Taller 4', duracionMin: 480, fechaLimite: sumarDias(h, 1), prioridad: 'alta' },
    { titulo: 'Leer Barthes: Retórica de la imagen', materia: 'Semiótica', duracionMin: 90, fechaLimite: sumarDias(h, 2), prioridad: 'media' },
    { titulo: 'Moodboard para la cafetería', materia: 'Identidad Visual', duracionMin: 150, fechaLimite: sumarDias(h, 3), prioridad: 'media' },
    { titulo: 'Prototipo navegable en Figma', materia: 'Diseño de Interfaces', duracionMin: 360, fechaLimite: sumarDias(h, 4), prioridad: 'alta' },
    { titulo: 'Storyboard del spot', materia: 'Motion Graphics', duracionMin: 180, fechaLimite: sumarDias(h, 6), prioridad: 'media' },
    { titulo: 'Render final del spot', materia: 'Motion Graphics', duracionMin: 540, fechaLimite: sumarDias(h, 9), prioridad: 'alta' },
    { titulo: 'Manual de marca', materia: 'Identidad Visual', duracionMin: 300, fechaLimite: sumarDias(h, 11), prioridad: 'baja' },
  ]
  return [
    ...hechas.map(([titulo, materia, duracionMin, haceDias], i) => ({
      titulo,
      materia,
      duracionMin,
      fechaLimite: sumarDias(h, -haceDias + 1),
      prioridad: 'media' as const,
      hecha: true,
      creadaEn: ahora - (haceDias + 3) * dia + i,
      hechaEn: ahora - haceDias * dia,
    })),
    ...pendientes.map((t, i) => ({ ...t, hecha: false, creadaEn: ahora - 2 * dia + i * 60_000, hechaEn: null })),
  ]
}

/** Carga el ejemplo inicial en Firestore. */
export async function cargarEjemplo(uid: string): Promise<void> {
  const lote = writeBatch(db)
  armarEjemplo().forEach((t) => lote.set(doc(coleccion(uid)), t))
  await lote.commit()
}

/** Borra todas las tareas y vuelve a dejar el ejemplo inicial. */
export async function reiniciarEjemplo(uid: string, actuales: Tarea[]): Promise<void> {
  const lote = writeBatch(db)
  actuales.forEach((t) => lote.delete(doc(db, 'usuarios', uid, 'tareas', t.id)))
  armarEjemplo().forEach((t) => lote.set(doc(coleccion(uid)), t))
  await lote.commit()
}
