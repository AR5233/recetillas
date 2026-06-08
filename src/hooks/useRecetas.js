import { useState, useEffect } from 'react';
import supabase from '../lib/supabase';

export default function useRecetas() {
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(true);

  async function cargarRecetas() {
    const { data, error } = await supabase.from('recetas').select('*').order('fecha_creacion', { ascending: false });
    if (error) console.error(error);
    else setRecetas(data);
    setLoading(false);
  }

  async function crearReceta(receta) {
    const { data, error } = await supabase.from('recetas').insert([receta]).select();
    if (error) console.error(error);
    else cargarRecetas();
    return data?.[0] || null;
  }

  async function actualizarReceta(id, datos) {
    datos.fecha_modificacion = new Date().toISOString();
    const { error } = await supabase.from('recetas').update(datos).eq('id', id);
    if (error) console.error(error);
    else cargarRecetas();
  }

  async function eliminarReceta(id) {
    const { error } = await supabase.from('recetas').delete().eq('id', id);
    if (error) console.error(error);
    else cargarRecetas();
  }

  async function buscarRecetas(termino) {
    const { data, error } = await supabase.from('recetas').select('*').ilike('titulo', '%' + termino + '%').order('fecha_creacion', { ascending: false });
    if (error) console.error(error);
    else setRecetas(data);
  }

  async function cargarReceta(id) {
    const { data, error } = await supabase.from('recetas').select('*').eq('id', id).single();
    if (error) console.error(error);
    return data;
  }

  useEffect(() => { cargarRecetas(); }, []);

  return { recetas, loading, cargarRecetas, crearReceta, actualizarReceta, eliminarReceta, buscarRecetas, cargarReceta };
}
