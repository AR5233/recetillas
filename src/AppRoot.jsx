import React from 'react';
import App from './App.jsx';
import supabase from './lib/supabase';
import usePerfiles from './hooks/usePerfiles';
import useRecetas from './hooks/useRecetas';
import useFavoritos from './hooks/useFavoritos';
import useComentarios from './hooks/useComentarios';
import useCerebras from './hooks/useCerebras';

export default function AppRoot() {
  const { perfiles, perfilActivo, loading: loadingPerfiles, crearPerfil, seleccionarPerfil, borrarPerfil, cerrarSesion } = usePerfiles();
  const { recetas, crearReceta, actualizarReceta, eliminarReceta } = useRecetas();
  const { favoritos, toggleFavorito } = useFavoritos(perfilActivo);
  const { estructurar, reescalar, limpiarTexto } = useCerebras();
  const [recetaActivaId, setRecetaActivaId] = React.useState(null);
  const { comentarios, agregarComentario, hayCorrecciones } = useComentarios(recetaActivaId);
  const [toast, setToast] = React.useState(null);

  const mostrarToast = (mensaje, tipo) => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), tipo === 'error' ? 6000 : 2500);
  };

  const subirImagen = async (blob, recetaId) => {
    if (!blob) return null;
    const fileName = `${recetaId || 'temp'}_${Date.now()}.jpg`;
    const { data, error } = await supabase.storage.from('recetas').upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });
    if (error) { mostrarToast(`Error al guardar imagen. Código: ${error.status || 'desconocido'}`, 'error'); return null; }
    const { data: urlData } = supabase.storage.from('recetas').getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const onProcesarReceta = async ({ texto, personas, fuente, titulo }) => {
    try {
      const textoConTitulo = titulo ? `TÍTULO: ${titulo}\n\n${texto}` : texto;
      const datos = await estructurar(textoConTitulo, personas);
      return { ...datos, autor: perfilActivo?.nombre || 'Anónimo' };
    } catch (e) {
      mostrarToast(e.message || 'Chefcito no responde.', 'error');
      throw e;
    }
  };

  const onLimpiarTexto = async (texto) => {
    try {
      return await limpiarTexto(texto);
    } catch (e) {
      mostrarToast(e.message || 'Error al limpiar.', 'error');
      throw e;
    }
  };

  const onGuardarReceta = async (datosEditados, personas) => {
    const recetaTemp = {
      titulo: datosEditados.titulo,
      autor: datosEditados.autor || perfilActivo?.nombre || 'Anónimo',
      personas,
      ingredientes: datosEditados.ingredientes,
      preparacion: datosEditados.preparacion,
      tiempo_total: datosEditados.tiempoTotal,
      puntos_importantes: (datosEditados.puntosImportantes || []).filter(p => p.trim() !== ''),
      sugerencia_opcional: (datosEditados.sugerencia || '').trim(),
      categoria: datosEditados.categoria || 'otro'
    };
    const recetaCreada = await crearReceta(recetaTemp);
    if (datosEditados.imagen && recetaCreada?.id) {
      const url = await subirImagen(datosEditados.imagen, recetaCreada.id);
      if (url) await actualizarReceta(recetaCreada.id, { imagen_url: url });
    }
    mostrarToast('✅ ¡Receta añadida!', 'success');
  };

  const onReescalarReceta = async (receta, nuevasPersonas) => {
    try {
      return await reescalar(receta.ingredientes, receta.personas, nuevasPersonas);
    } catch (e) {
      mostrarToast(e.message || 'Error al reescalar.', 'error');
      return receta.ingredientes;
    }
  };

  const onActualizarReceta = async (id, datos, editor) => {
    const updateData = {
      titulo: datos.titulo, ingredientes: datos.ingredientes, preparacion: datos.preparacion,
      tiempo_total: datos.tiempoTotal,
      puntos_importantes: (datos.puntosImportantes || []).filter(p => p.trim() !== ''),
      sugerencia_opcional: (datos.sugerencia || '').trim(),
      editado_por: editor
    };
    if (datos.categoria) updateData.categoria = datos.categoria;
    if (datos.imagen && datos.imagen instanceof Blob) updateData.imagen_url = await subirImagen(datos.imagen, id);
    await actualizarReceta(id, updateData);
    mostrarToast('✅ Receta actualizada', 'success');
  };

  return (
    <>
      {toast && (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl shadow-2xl text-base font-medium text-center max-w-[90vw] ${
          toast.tipo === 'error' ? 'bg-red-500 text-white' :
          toast.tipo === 'warning' ? 'bg-yellow-500 text-black' :
          'bg-green-500 text-white'
        }`}>
          {toast.mensaje}
        </div>
      )}
      <App
        perfiles={perfiles} perfilActivo={perfilActivo} loadingPerfiles={loadingPerfiles}
        onCrearPerfil={crearPerfil} onSeleccionarPerfil={seleccionarPerfil}
        onBorrarPerfil={borrarPerfil} onCerrarSesion={cerrarSesion}
        recetas={recetas} favoritos={favoritos} onToggleFavorito={toggleFavorito}
        onProcesarReceta={onProcesarReceta} onGuardarReceta={onGuardarReceta} onLimpiarTexto={onLimpiarTexto}
        onEliminarReceta={eliminarReceta} onReescalarReceta={onReescalarReceta}
        onActualizarReceta={onActualizarReceta}
        onVerReceta={setRecetaActivaId} recetaActivaId={recetaActivaId}
        comentarios={comentarios} onAgregarComentario={agregarComentario}
        hayCorrecciones={hayCorrecciones}
      />
    </>
  );
}
