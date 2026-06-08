import { useState, useEffect } from 'react';
import supabase from '../lib/supabase';

export default function useComentarios(recetaId) {
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recetaId) {
      cargarComentarios();
    } else {
      setComentarios([]);
    }
  }, [recetaId]);

  async function cargarComentarios() {
    if (!recetaId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('comentarios')
      .select('*, perfiles(nombre, color)')
      .eq('receta_id', recetaId)
      .order('fecha', { ascending: true });
    if (!error && data) setComentarios(data);
    setLoading(false);
  }

  async function agregarComentario(perfilId, contenido, tipo) {
    if (!recetaId) return;
    const { error } = await supabase.from('comentarios').insert([{
      receta_id: recetaId,
      perfil_id: perfilId,
      contenido,
      tipo
    }]);
    if (!error) cargarComentarios();
  }

  function hayCorrecciones() {
    return comentarios.some(c => c.tipo === 'correccion');
  }

  return { comentarios, loading, agregarComentario, hayCorrecciones, cargarComentarios };
}
