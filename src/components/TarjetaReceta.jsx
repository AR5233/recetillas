import { Link } from 'react-router-dom';

export default function TarjetaReceta({ receta, esFavorito, onToggleFavorito, perfilActivo }) {
  return (
    <Link to={`/receta/${receta.id}`} className="block">
      <div className="bg-[#252322] border border-[#3A3633] rounded-2xl overflow-hidden hover:border-[#C8965A] transition-all relative">
        <div className="flex">
          <div className="w-24 h-24 flex-shrink-0 bg-[#2F2C2A] flex items-center justify-center">
            {receta.imagen_url ? (
              <img src={receta.imagen_url} alt={receta.titulo} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">🍽️</span>
            )}
          </div>
          <div className="flex-1 p-4 pr-12 min-w-0">
            <h3 className="font-semibold text-[#E8E0D5] text-base leading-tight truncate">{receta.titulo}</h3>
            <p className="text-xs text-[#8B7D6B] mt-1">{receta.autor || 'Anónimo'}{receta.editado_por && <span className="italic"> · {receta.editado_por}</span>}</p>
            <div className="flex gap-3 mt-1.5 text-xs text-[#6B6358] font-medium">
              <span>👥 {receta.personas}</span>
              <span>⏱️ {receta.tiempo_total}</span>
            </div>
          </div>
        </div>
        <div className="absolute top-3 right-3">
          {perfilActivo && (
            <button onClick={(e) => { e.preventDefault(); onToggleFavorito(receta.id); }} className={`text-lg ${esFavorito ? 'text-red-400' : 'text-[#3A3633] hover:text-red-400'}`}>
              {esFavorito ? '❤️' : '🤍'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
