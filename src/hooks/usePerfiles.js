import { useState, useEffect } from 'react';
import supabase from '../lib/supabase'

const COLOR_PALETTE = ['#FF5733', '#C70039', '#900C3F', '#581845', '#1A237E', '#0D47A1', '#01579B', '#006064', '#004D40', '#1B5E20', '#33691E', '#827717', '#F57C00', '#EF6C00', '#D84315']

export default function usePerfiles() {
  const [perfiles, setPerfiles] = useState([])
  const [loading, setLoading] = useState(true)

  // Inicializar perfilActivo desde localStorage
  const [perfilActivo, setPerfilActivo] = useState(() => {
    try {
      const stored = localStorage.getItem('perfilActivo')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  // Cargar perfiles desde Supabase
  async function cargarPerfiles() {
    setLoading(true)
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .order('fecha_creacion', { ascending: false })
    
    if (!error) {
      setPerfiles(data || [])
    }
    setLoading(false)
  }

  // Crear nuevo perfil
  async function crearPerfil(nombre) {
    const color = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]
    
    const { data, error } = await supabase
      .from('perfiles')
      .insert([{ nombre, color }])
      .select()
    
    if (!error && data) {
      setPerfiles(prev => [data[0], ...prev])
      return data[0]
    }
    return null
  }

  // Seleccionar perfil activo y guardar en localStorage
  function seleccionarPerfil(perfil) {
    try {
      localStorage.setItem('perfilActivo', JSON.stringify(perfil))
      setPerfilActivo(perfil)
    } catch {}
  }

  // Borrar perfil
  async function borrarPerfil(id) {
    const { error } = await supabase
      .from('perfiles')
      .delete()
      .eq('id', id)
    
    if (!error) {
      setPerfiles(prev => prev.filter(p => p.id !== id))
      // Si se borra el perfil activo, limpiar localStorage
      if (perfilActivo && perfilActivo.id === id) {
        try {
          localStorage.removeItem('perfilActivo')
          setPerfilActivo(null)
        } catch {}
      }
    }
  }

  // Cerrar sesión (limpiar perfil activo)
  function cerrarSesion() {
    try {
      localStorage.removeItem('perfilActivo')
      setPerfilActivo(null)
    } catch {}
  }

  useEffect(() => {
    cargarPerfiles()
  }, [])

  return {
    perfiles,
    perfilActivo,
    loading,
    crearPerfil,
    seleccionarPerfil,
    borrarPerfil,
    cerrarSesion
  }
}