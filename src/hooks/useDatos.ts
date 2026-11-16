import { useEffect, useState } from 'react'
import { obtenerFeriados } from '../data/feriados'
import { escucharTareas } from '../data/tareas'
import { asegurarUsuario } from '../firebase'
import type { Tarea } from '../tipos'

/** Entra como anónimo y escucha las tareas del usuario en tiempo real. */
export function useTareas() {
  const [uid, setUid] = useState<string | null>(null)
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let cortar: (() => void) | undefined
    let vigente = true
    let reintentos = 0

    // Un usuario anónimo recién creado puede tardar un instante en tener
    // permiso en Firestore. Si la primera lectura rebota, reintentamos solos.
    const escuchar = (uidActual: string) => {
      cortar = escucharTareas(
        uidActual,
        (lista) => {
          setTareas(lista)
          setError(null)
          setCargando(false)
        },
        (e) => {
          if (!vigente) return
          const code = (e as { code?: string }).code
          if (code === 'permission-denied' && reintentos < 4) {
            reintentos++
            cortar?.()
            window.setTimeout(() => vigente && escuchar(uidActual), 400 * reintentos)
            return
          }
          console.error('Firestore:', e)
          setError('No pudimos leer tus tareas. Revisá tu conexión.')
          setCargando(false)
        },
      )
    }

    asegurarUsuario()
      .then(async (u) => {
        await u.getIdToken()
        if (!vigente) return
        setUid(u.uid)
        escuchar(u.uid)
      })
      .catch((e) => {
        console.error('Auth:', e)
        if (!vigente) return
        setError('No pudimos conectarnos con la base de datos.')
        setCargando(false)
      })
    return () => {
      vigente = false
      cortar?.()
    }
  }, [intento])

  const reintentar = () => {
    setCargando(true)
    setError(null)
    setIntento((n) => n + 1)
  }

  return { uid, tareas, cargando, error, reintentar }
}

/** Trae los feriados del año actual y el siguiente desde la API. */
export function useFeriados() {
  const [feriados, setFeriados] = useState<Map<string, string>>(new Map())
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'error'>('cargando')
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vigente = true
    const anio = new Date().getFullYear()
    obtenerFeriados([anio, anio + 1])
      .then((m) => {
        if (!vigente) return
        setFeriados(m)
        setEstado('listo')
      })
      .catch(() => vigente && setEstado('error'))
    return () => {
      vigente = false
    }
  }, [intento])

  const reintentar = () => {
    setEstado('cargando')
    setIntento((n) => n + 1)
  }

  return { feriados, estado, reintentar }
}
