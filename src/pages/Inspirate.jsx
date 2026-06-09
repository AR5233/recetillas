import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RevisarReceta from '../components/RevisarReceta';

const MAX_REGEN = 5;

export default function Inspirate({ onInspirar, onGuardar, perfilActivo }) {
  const navigate = useNavigate();
  const resultadosRef = useRef(null);
  const [personas, setPersonas] = useState(2);
  const [momento, setMomento] = useState('comida');
  const [evitar, setEvitar] = useState('');
  const [estilo, setEstilo] = useState('');
  const [protagonista, setProtagonista] = useState('');
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [indice, setIndice] = useState(0);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [recetaAEditar, setRecetaAEditar] = useState(null);
  const [regeneraciones, setRegeneraciones] = useState(0);

  const opcionesActuales = historial[indice]?.opciones || [];
  const totalPaginas = historial.length;

  const handleInspirar = async (esRegeneracion = false) => {
    setLoading(true);
    try {
      const data = await onInspirar({
        personas, momento, evitar, estilo, protagonista,
        semilla: esRegeneracion ? regeneraciones + 1 : 0
      });
      const nuevoHistorial = esRegeneracion ? [...historial, data] : [data];
      setHistorial(nuevoHistorial);
      setIndice(nuevoHistorial.length - 1);
      setRegeneraciones(esRegeneracion ? regeneraciones + 1 : 1);
      setTimeout(() => resultadosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    } catch (e) { alert('Chefcito no pudo inspirar.'); }
    setLoading(false);
  };

  const handleAnadir = (opcion) => {
    setRecetaAEditar({
      titulo: opcion.titulo || '',
      autor: perfilActivo?.nombre || 'Anónimo',
      ingredientes: Array.isArray(opcion.ingredientes) ? opcion.ingredientes : [],
      preparacion: Array.isArray(opcion.preparacion) ? opcion.preparacion : [],
      tiempoTotal: opcion.tiempoTotal || opcion.tiempo || '',
      puntosImportantes: [],
      sugerencia: '',
      categoria: 'otro'
    });
    setModoEdicion(true);
  };

  const handleGuardar = (datosEditados) => {
    onGuardar(datosEditados, personas);
    navigate('/');
  };

  if (modoEdicion && recetaAEditar) {
    return (
      <div className="min-h-screen bg-[#1A1817]">
        <header className="bg-[#252322] shadow-md"><div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3"><button onClick={() => setModoEdicion(false)} className="text-[#8B7D6B] text-xl">←</button><h1 className="text-lg font-bold text-[#E8E0D5]">Revisar receta</h1></div></header>
        <RevisarReceta datosIniciales={recetaAEditar} onGuardar={handleGuardar} onCancelar={() => setModoEdicion(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1817] text-base">
      <header className="bg-[#252322] shadow-md sticky top-0 z-20 border-b border-[#3A3633]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="text-[#8B7D6B] text-xl">←</Link>
          <h1 className="text-lg font-bold text-[#C8965A]">Inspírate con Chefcito</h1>
          <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full ml-auto">Beta</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-5">
        <div className="bg-[#252322] rounded-xl p-5 border border-[#3A3633] space-y-4">
          <div><label className="block text-sm font-medium text-[#8B7D6B] mb-2">¿Para cuántas personas?</label><div className="grid grid-cols-5 gap-2">{[1,2,3,4,5,6,8,10].map(n => <button key={n} onClick={() => setPersonas(n)} className={`py-2 rounded-lg text-sm font-bold ${personas === n ? 'bg-[#C8965A] text-[#1A1817]' : 'bg-[#1A1817] text-[#8B7D6B]'}`}>{n}</button>)}</div></div>
          <div><label className="block text-sm font-medium text-[#8B7D6B] mb-2">Momento</label><div className="grid grid-cols-4 gap-2">{['desayuno','comida','cena','merienda'].map(m => <button key={m} onClick={() => setMomento(m)} className={`py-2 rounded-lg text-sm capitalize ${momento === m ? 'bg-[#C8965A] text-[#1A1817]' : 'bg-[#1A1817] text-[#8B7D6B]'}`}>{m}</button>)}</div></div>
          <div><label className="block text-sm font-medium text-[#8B7D6B] mb-1">Ingrediente estrella (opcional)</label><input type="text" value={protagonista} onChange={(e) => setProtagonista(e.target.value)} placeholder="Ej: pollo, quinoa, salmón..." className="w-full p-3 bg-[#1A1817] border border-[#3A3633] rounded-xl text-[#E8E0D5] text-sm focus:border-[#C8965A] outline-none" /></div>
          <div><label className="block text-sm font-medium text-[#8B7D6B] mb-1">Ingredientes a evitar (opcional)</label><input type="text" value={evitar} onChange={(e) => setEvitar(e.target.value)} placeholder="Ej: cerdo, marisco, gluten..." className="w-full p-3 bg-[#1A1817] border border-[#3A3633] rounded-xl text-[#E8E0D5] text-sm focus:border-[#C8965A] outline-none" /></div>
          <div><label className="block text-sm font-medium text-[#8B7D6B] mb-1">Estilo (opcional)</label><input type="text" value={estilo} onChange={(e) => setEstilo(e.target.value)} placeholder="Ej: peruano, rápido, italiano..." className="w-full p-3 bg-[#1A1817] border border-[#3A3633] rounded-xl text-[#E8E0D5] text-sm focus:border-[#C8965A] outline-none" /></div>
          <button onClick={() => handleInspirar(false)} disabled={loading} className="w-full bg-[#C8965A] text-[#1A1817] py-3 rounded-xl font-medium hover:bg-[#D4A56A] disabled:opacity-50">{loading ? '🍳 Chefcito está pensando...' : '✨ Inspírame'}</button>
        </div>

        {loading && <p className="text-center text-[#8B7D6B] py-4">Cocinando ideas...</p>}

        {opcionesActuales.length > 0 && (
          <div ref={resultadosRef} className="space-y-6">
            <div className="flex justify-between items-center bg-[#252322] rounded-xl p-3 border border-[#3A3633]">
              <h2 className="text-lg font-semibold text-[#E8E0D5]">Opciones</h2>
              <button onClick={() => handleInspirar(true)} disabled={loading || regeneraciones >= MAX_REGEN} className="text-sm text-[#C8965A] hover:underline disabled:opacity-30">
                🔄 Otras ideas ({regeneraciones}/{MAX_REGEN})
              </button>
            </div>

            {totalPaginas > 1 && (
              <div className="flex justify-center items-center gap-4 bg-[#252322] rounded-xl p-3 border border-[#3A3633]">
                <button onClick={() => setIndice(Math.max(0, indice - 1))} disabled={indice === 0} className="w-10 h-10 rounded-full bg-[#2F2C2A] text-[#E8E0D5] flex items-center justify-center text-lg hover:bg-[#3A3633] disabled:opacity-20">←</button>
                <span className="text-[#E8E0D5] font-medium text-base">{indice + 1} de {totalPaginas}</span>
                <button onClick={() => setIndice(Math.min(totalPaginas - 1, indice + 1))} disabled={indice === totalPaginas - 1} className="w-10 h-10 rounded-full bg-[#2F2C2A] text-[#E8E0D5] flex items-center justify-center text-lg hover:bg-[#3A3633] disabled:opacity-20">→</button>
              </div>
            )}

            {opcionesActuales.map((op, i) => (
              <div key={i} className="bg-[#252322] rounded-xl p-5 border border-[#3A3633] space-y-3">
                <h3 className="font-bold text-[#E8E0D5] text-lg">{op.titulo}</h3>
                <p className="text-sm text-[#8B7D6B]">{op.descripcion}</p>
                <div className="flex gap-3 text-xs text-[#6B6358]"><span>⏱️ {op.tiempoTotal || op.tiempo}</span><span className="capitalize">📊 {op.dificultad}</span><span>👥 {personas} pers.</span></div>
                <div className="bg-[#1F1D1C] rounded-lg p-3"><p className="text-[#C8965A] font-medium mb-2">Ingredientes</p><ul className="space-y-1 text-sm text-[#B4A99A]">{Array.isArray(op.ingredientes) && op.ingredientes.map((ing, j) => <li key={j}>• {ing.nombre}: {ing.cantidad} {ing.esSugerencia ? '💡' : ''}</li>)}</ul></div>
                <div className="bg-[#1F1D1C] rounded-lg p-3"><p className="text-[#C8965A] font-medium mb-2">Preparación</p><ol className="space-y-2 text-sm text-[#B4A99A]">{Array.isArray(op.preparacion) && op.preparacion.map((p, j) => <li key={j}><span className="text-[#C8965A]">{p.paso}.</span> {p.instruccion} {p.tiempo && <span className="text-[#6B6358]">({p.tiempo})</span>}</li>)}</ol></div>
                <button onClick={() => handleAnadir(op)} className="w-full bg-[#C8965A] text-[#1A1817] py-3 rounded-xl font-medium hover:bg-[#D4A56A]">🍳 Añadir a mis recetas</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
