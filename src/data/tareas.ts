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

/** Carga tareas de ejemplo para probar la app sin escribir todo a mano. */
export async function cargarEjemplo(uid: string): Promise<void> {
  const h = hoy()
  const ejemplo: DatosTarea[] = [
    { titulo: 'Maqueta final', materia: 'Diseño 3', duracionMin: 360, fechaLimite: sumarDias(h, 6), prioridad: 'alta' },
    { titulo: 'Prototipo en Figma', materia: 'UX/UI', duracionMin: 240, fechaLimite: sumarDias(h, 3), prioridad: 'alta' },
    { titulo: 'Leer apunte de semiótica', materia: 'Comunicación', duracionMin: 90, fechaLimite: sumarDias(h, 2), prioridad: 'media' },
    { titulo: 'Bitácora del TP', materia: 'Frontend II', duracionMin: 120, fechaLimite: sumarDias(h, 1), prioridad: 'alta' },
    { titulo: 'Animación del logo', materia: 'Motion', duracionMin: 180, fechaLimite: sumarDias(h, 9), prioridad: 'media' },
    { titulo: 'Paleta y tipografías', materia: 'Diseño 3', duracionMin: 60, fechaLimite: sumarDias(h, 4), prioridad: 'baja' },
  ]
  const lote = writeBatch(db)
  ejemplo.forEach((t, i) => {
    lote.set(doc(coleccion(uid)), { ...t, hecha: false, creadaEn: Date.now() + i, hechaEn: null })
  })
  await lote.commit()
}
