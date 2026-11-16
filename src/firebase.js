/**
 * Conexión con Firebase. Acá se inicializan los servicios que usa la app:
 * - Authentication (acceso anónimo): identifica a cada visitante sin pedir registro.
 * - Cloud Firestore: la base de datos donde se guardan las tareas.
 * Los datos de conexión vienen de las variables de entorno VITE_FIREBASE_*.
 */
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})

export const auth = getAuth(app)
export const db = getFirestore(app)

let pendiente = null

/**
 * Devuelve el usuario actual; si no hay, entra como anónimo.
 * Se guarda la promesa para no crear dos usuarios si se llama dos veces seguidas.
 */
export function asegurarUsuario() {
  pendiente ??= crearOObtenerUsuario().catch((e) => {
    pendiente = null
    throw e
  })
  return pendiente
}

function crearOObtenerUsuario() {
  return new Promise((resolve, reject) => {
    const cortar = onAuthStateChanged(
      auth,
      (usuario) => {
        if (usuario) {
          cortar()
          resolve(usuario)
        } else {
          signInAnonymously(auth).catch((e) => {
            cortar()
            reject(e)
          })
        }
      },
      reject,
    )
  })
}
