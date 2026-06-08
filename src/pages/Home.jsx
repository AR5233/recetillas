import { useState } from 'react';
import { Link } from 'react-router-dom';
import SelectorPerfil from '../components/SelectorPerfil';
import TarjetaReceta from '../components/TarjetaReceta';

const CATEGORIAS = ['todas', 'res', 'pollo', 'cerdo', 'pescado', 'marisco', 'verdura', 'legumbre', 'pasta', 'arroz', 'postre', 'otro'];

export default function Home({
  perfiles, perfilActivo, loadingPerfiles,
  onCrearPerfil, onSeleccionarPerfil, onBorrarPerfil, onCerrarSesion,
  recetas, favoritos, onToggleFavorito, onEliminarReceta
}) {
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [menuAbierto, setMenuAbierto] = useState(false);

  let recetasFiltradas = recetas;
  if (filtro === 'misRecetas' && perfilActivo) {
    recetasFiltradas = recetas.filter(r => r.autor === perfilActivo.nombre);
  } else if (filtro === 'favoritos') {
    recetasFiltradas = recetas.filter(r => favoritos.includes(r.id));
  } else if (CATEGORIAS.includes(filtro) && filtro !== 'todas') {
    recetasFiltradas = recetas.filter(r => (r.categoria || 'otro') === filtro);
  }
  if (busqueda) {
    recetasFiltradas = recetasFiltradas.filter(r => r.titulo.toLowerCase().includes(busqueda.toLowerCase()));
  }

  return (
    <div className="min-h-screen bg-[#1A1817]">
      <header className="bg-[#252322] shadow-md sticky top-0 z-20 border-b border-[#3A3633]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMenuAbierto(!menuAbierto)} className="text-[#8B7D6B] text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2F2C2A]">
            {menuAbierto ? '✕' : '☰'}
          </button>
          <h1 className="text-xl font-bold text-[#C8965A] tracking-tight">Recetillas</h1>
          <p className="text-sm text-[#8B7D6B] italic ml-auto">¿Qué se cuece hoy?</p>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ${menuAbierto ? 'max-h-96' : 'max-h-0'}`}>
          <div className="max-w-2xl mx-auto px-4 pb-4 space-y-3">
            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar recetas..." className="w-full p-3 bg-[#1A1817] border border-[#3A3633] rounded-xl text-sm text-[#E8E0D5] placeholder-[#5A5553] focus:border-[#C8965A] outline-none" />
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setFiltro('todas')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filtro === 'todas' ? 'bg-[#C8965A] text-[#1A1817]' : 'bg-[#2F2C2A] text-[#8B7D6B] hover:bg-[#3A3633]'}`}>Todas</button>
              {perfilActivo && <button onClick={() => setFiltro('misRecetas')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filtro === 'misRecetas' ? 'bg-[#C8965A] text-[#1A1817]' : 'bg-[#2F2C2A] text-[#8B7D6B] hover:bg-[#3A3633]'}`}>Mis recetas</button>}
              {perfilActivo && <button onClick={() => setFiltro('favoritos')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filtro === 'favoritos' ? 'bg-[#C8965A] text-[#1A1817]' : 'bg-[#2F2C2A] text-[#8B7D6B] hover:bg-[#3A3633]'}`}>Favoritos</button>}
            </div>
            <SelectorPerfil perfiles={perfiles} perfilActivo={perfilActivo} onSeleccionar={onSeleccionarPerfil} onCrear={onCrearPerfil} onBorrar={onBorrarPerfil} onCerrarSesion={onCerrarSesion} />
            <details className="text-[#8B7D6B] text-xs">
              <summary className="cursor-pointer hover:text-[#C8965A]">Categorías</summary>
              <div className="flex gap-2 flex-wrap mt-2">
                {CATEGORIAS.filter(c => c !== 'todas').map(c => (
                  <button key={c} onClick={() => setFiltro(filtro === c ? 'todas' : c)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filtro === c ? 'bg-[#C8965A] text-[#1A1817]' : 'bg-[#2F2C2A] text-[#8B7D6B] hover:bg-[#3A3633]'}`}>{c}</button>
                ))}
              </div>
            </details>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-3 pb-20">
        {recetasFiltradas.length === 0 ? (
          <div className="text-center py-12"><p className="text-4xl mb-3">🍽️</p><p className="text-[#8B7D6B]">No se encontraron recetas.</p></div>
        ) : recetasFiltradas.map(receta => (
          <TarjetaReceta key={receta.id} receta={receta} esFavorito={favoritos.includes(receta.id)} onToggleFavorito={onToggleFavorito} perfilActivo={perfilActivo} />
        ))}
      </main>

      <Link to="/nueva" className="fixed bottom-6 right-6 w-14 h-14 bg-[#C8965A] text-[#1A1817] rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-[#D4A56A] transition-colors z-20">＋</Link>
    </div>
  );
}
