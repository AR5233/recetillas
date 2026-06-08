import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReescalarPersonas from '../components/ReescalarPersonas';
import SeccionComentarios from '../components/SeccionComentarios';
import RevisarReceta from '../components/RevisarReceta';

export default function DetalleReceta({
  recetas, favoritos, perfilActivo,
  onToggleFavorito, onEliminar, onReescalar, onActualizar,
  onVerReceta, comentarios, onAgregarComentario, hayCorrecciones
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receta, setReceta] = useState(null);
  const [reescalando, setReescalando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [sugerenciaReescalado, setSugerenciaReescalado] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  useEffect(() => {
    onVerReceta(id);
    const encontrada = recetas.find(r => r.id === id);
    setReceta(encontrada || null);
  }, [id, recetas]);

  if (!receta) return <div className="min-h-screen flex items-center justify-center bg-[#1A1817]"><p className="text-[#8B7D6B]">Receta no encontrada</p></div>;

  if (editando) {
    return (
      <div className="min-h-screen bg-[#1A1817] text-base">
        <header className="bg-[#252322] shadow-md"><div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3"><button onClick={() => setEditando(false)} className="text-[#8B7D6B] text-xl">←</button><h1 className="text-lg font-bold text-[#E8E0D5]">Editando receta</h1></div></header>
        <main className="max-w-2xl mx-auto"><RevisarReceta datosIniciales={{titulo: receta.titulo, autor: receta.autor || 'Anónimo', ingredientes: receta.ingredientes || [], preparacion: receta.preparacion || [], tiempoTotal: receta.tiempo_total || '', puntosImportantes: receta.puntos_importantes || [], sugerencia: receta.sugerencia_opcional || ''}} onGuardar={(datos) => { onActualizar(receta.id, datos, perfilActivo?.nombre); setEditando(false); }} onCancelar={() => setEditando(false)} /></main>
      </div>
    );
  }

  const handleReescalar = async (nuevasPersonas) => {
    setReescalando(true);
    const nuevosIngredientes = await onReescalar(receta, nuevasPersonas);
    setSugerenciaReescalado({ personas: nuevasPersonas, ingredientes: nuevosIngredientes });
    setReescalando(false);
  };

  return (
    <div className="min-h-screen bg-[#1A1817] text-base">
      <header className="bg-[#252322] shadow-md sticky top-0 z-10 border-b border-[#3A3633]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3"><Link to="/" className="text-[#8B7D6B] text-xl">←</Link><h1 className="text-lg font-bold text-[#E8E0D5] flex-1 truncate">{receta.titulo}</h1>{perfilActivo && <button onClick={() => onToggleFavorito(receta.id)} className="text-xl">{favoritos.includes(receta.id) ? '❤️' : '🤍'}</button>}</div>
      </header>
      <main className="max-w-2xl mx-auto pb-8">
        {receta.imagen_url ? <img src={receta.imagen_url} alt={receta.titulo} className="w-full h-56 object-cover" /> : <div className="w-full h-40 bg-gradient-to-b from-[#2F2C2A] to-[#1A1817] flex items-center justify-center"><span className="text-5xl">🍽️</span></div>}
        <div className="px-4 pt-4 space-y-5">
          <div className="text-sm text-[#8B7D6B]"><span>{receta.autor || 'Anónimo'}</span>{receta.editado_por && <span className="italic"> · editado por {receta.editado_por}</span>}{receta.fecha_creacion && <span className="ml-2">· {new Date(receta.fecha_creacion).toLocaleDateString('es-ES')}</span>}</div>
          <ReescalarPersonas personas={receta.personas} onReescalar={handleReescalar} loading={reescalando} />
          {sugerenciaReescalado && (
            <div className="bg-[#1E2F3A] rounded-xl p-4 border border-[#2A4A5E]">
              <p className="text-sm font-medium text-[#7BC8E8] mb-2">📊 Sugerencia para {sugerenciaReescalado.personas} personas</p>
              <p className="text-xs text-[#5A9AB5] mb-2">Estimación. No modifica la receta original.</p>
              <ul className="space-y-1">{sugerenciaReescalado.ingredientes.map((ing, i) => <li key={i} className="flex justify-between text-sm text-[#A8D8EA]"><span>{ing.nombre}</span><span>{ing.cantidad}</span></li>)}</ul>
            </div>
          )}
          <div className="bg-[#252322] rounded-xl p-4 border border-[#3A3633]"><h2 className="font-semibold text-[#C8965A] mb-3">Ingredientes</h2><ul className="space-y-2">{receta.ingredientes?.map((ing, i) => <li key={i} className="flex justify-between text-sm"><span className="text-[#E8E0D5]">{ing.nombre}{ing.esSugerencia && <span className="ml-1 text-[#C8965A]">💡</span>}</span><span className="text-[#8B7D6B]">{ing.cantidad}</span></li>)}</ul></div>
          <div className="bg-[#252322] rounded-xl p-4 border border-[#3A3633]"><h2 className="font-semibold text-[#C8965A] mb-3">Preparación</h2><ol className="space-y-3">{receta.preparacion?.map((paso, i) => <li key={i} className="flex gap-3 text-sm"><span className="font-bold text-[#C8965A]">{i + 1}.</span><div><p className="text-[#E8E0D5]">{paso.instruccion}</p>{paso.tiempo && <span className="text-xs text-[#6B6358]">⏱️ {paso.tiempo}</span>}</div></li>)}</ol><p className="mt-3 text-sm text-[#8B7D6B]">⏱️ Tiempo total: {receta.tiempo_total}</p></div>
          {(receta.puntos_importantes || []).filter(p => p.trim() !== '').length > 0 && (
            <div className="bg-[#2A1F1A] rounded-xl p-4 border border-[#5A3A2A]"><h2 className="font-semibold text-[#E8A850] mb-2">⚠️ Puntos importantes</h2><ul className="space-y-1">{receta.puntos_importantes.filter(p => p.trim() !== '').map((p, i) => <li key={i} className="text-sm text-[#D4A574]">• {p}</li>)}</ul></div>
          )}
          {receta.sugerencia_opcional && receta.sugerencia_opcional.trim() !== '' && (
            <div className="bg-[#1A2A1F] rounded-xl p-4 border border-[#2A5A2A]"><h2 className="font-semibold text-[#7BC87B] mb-1">💡 Sugerencia de Chefcito</h2><p className="text-sm text-[#A8D8A8]">{receta.sugerencia_opcional}</p></div>
          )}
          <SeccionComentarios comentarios={comentarios} perfilActivo={perfilActivo} onAgregarComentario={onAgregarComentario} hayCorrecciones={hayCorrecciones} onModificar={() => setEditando(true)} autorReceta={receta.autor} />
          {perfilActivo?.nombre === 'Admin' && (
            <button onClick={() => { if (!mostrarConfirmacion) setMostrarConfirmacion(true); else { onEliminar(receta.id); navigate('/'); } }} className="w-full bg-red-500/20 text-red-400 py-3 rounded-xl font-medium border border-red-500/30 hover:bg-red-500/30">{mostrarConfirmacion ? '⚠️ Confirmar eliminación' : '🗑️ Eliminar receta (Admin)'}</button>
          )}
        </div>
      </main>
    </div>
  );
}
