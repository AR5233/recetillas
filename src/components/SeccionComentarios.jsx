import { useState } from 'react';

export default function SeccionComentarios({ comentarios, perfilActivo, onAgregarComentario, hayCorrecciones, onModificar, autorReceta }) {
  const [texto, setTexto] = useState('');
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const handleAgregar = (tipo) => { if (!texto.trim() || !perfilActivo) return; onAgregarComentario(perfilActivo.id, texto.trim(), tipo); setTexto(''); };
  const puedeModificar = () => perfilActivo && (perfilActivo.nombre === 'Admin' || perfilActivo.nombre === autorReceta);

  return (
    <div className="space-y-4 pt-4 border-t border-[#3A3633]">
      <h3 className="font-semibold text-[#E8E0D5]">Comentarios</h3>
      {comentarios.length === 0 && <p className="text-sm text-[#5A5553]">No hay comentarios aún.</p>}
      {comentarios.map(com => (
        <div key={com.id} className="bg-[#1F1D1C] rounded-xl p-3 border border-[#3A3633]">
          <div className="flex items-center gap-2 mb-1"><span className="text-xs font-medium text-[#8B7D6B]">{com.perfiles?.nombre || 'Perfil eliminado'}</span>{com.tipo === 'correccion' && <span className="text-xs bg-yellow-500/20 text-yellow-500 px-1.5 rounded-full">⚠️ Corrección</span>}</div>
          <p className="text-sm text-[#C4B8A7]">{com.contenido}</p>
        </div>
      ))}
      {perfilActivo && (
        <div className="space-y-2">
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe un comentario..." className="w-full p-3 bg-[#1A1817] border border-[#3A3633] rounded-xl text-sm text-[#E8E0D5] placeholder-[#5A5553] resize-none focus:border-[#C8965A] outline-none" rows="3" />
          <div className="flex gap-2">
            <button onClick={() => handleAgregar('comentario')} disabled={!texto.trim()} className="flex-1 bg-[#2F2C2A] text-[#E8E0D5] py-2 rounded-xl text-sm font-medium border border-[#3A3633] hover:bg-[#3A3633] disabled:opacity-30">💬 Comentar</button>
            <button onClick={() => handleAgregar('correccion')} disabled={!texto.trim()} className="flex-1 bg-[#2F2C2A] text-yellow-500 py-2 rounded-xl text-sm font-medium border border-yellow-500/30 hover:bg-yellow-500/10 disabled:opacity-30">⚠️ Avisar de corrección</button>
          </div>
        </div>
      )}
      {puedeModificar() && (
        <button onClick={() => { if (!mostrarConfirmacion) setMostrarConfirmacion(true); else { onModificar(); setMostrarConfirmacion(false); } }} className="w-full bg-[#C8965A] text-[#1A1817] py-3 rounded-xl font-medium hover:bg-[#D4A56A]">
          {mostrarConfirmacion ? '⚠️ ¿Confirmar modificación?' : '✏️ Modificar receta'}
        </button>
      )}
    </div>
  );
}
