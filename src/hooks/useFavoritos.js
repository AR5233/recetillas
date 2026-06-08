import { useState, useEffect } from 'react';
import supabase from '../lib/supabase';

export default function useFavoritos(perfilActivo) {
  const [favoritos, setFavoritos] = useState([]);

  useEffect(() => {
    if (!perfilActivo) {
      setFavoritos([]);
      return;
    }
    cargarFavoritos();
  }, [perfilActivo]);

  async function cargarFavoritos() {
    const { data, error } = await supabase.from('favoritos').select('receta_id').eq('perfil_id', perfilActivo.id);
    if (!error && data) setFavoritos(data.map(f => f.receta_id));
  }

  async function toggleFavorito(recetaId) {
    if (!perfilActivo) return;
    const esFavorito = favoritos.includes(recetaId);
    if (esFavorito) {
      await supabase.from('favoritos').delete().eq('perfil_id', perfilActivo.id).eq('receta_id', recetaId);
      setFavoritos(prev => prev.filter(id => id !== recetaId));
    } else {
      await supabase.from('favoritos').insert([{ perfil_id: perfilActivo.id, receta_id: recetaId }]);
      setFavoritos(prev => [...prev, recetaId]);
    }
  }

  return { favoritos, toggleFavorito, cargarFavoritos };
}
