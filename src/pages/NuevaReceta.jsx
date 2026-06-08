import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormularioTexto from '../components/FormularioTexto';
import FormularioAudio from '../components/FormularioAudio';
import RevisarReceta from '../components/RevisarReceta';

export default function NuevaReceta({ onProcesar, onGuardar }) {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [personas, setPersonas] = useState(2);
  const [titulo, setTitulo] = useState('');
  const [metodo, setMetodo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [datosProcesados, setDatosProcesados] = useState(null);

  const handleTexto = async (texto) => {
    setLoading(true);
    const datos = await onProcesar({ texto, personas, fuente: 'texto', titulo });
    setDatosProcesados(datos);
    setLoading(false);
    setPaso(3);
  };

  const handleAudio = async (texto) => {
    setLoading(true);
    const datos = await onProcesar({ texto, personas, fuente: 'audio', titulo });
    setDatosProcesados(datos);
    setLoading(false);
    setPaso(3);
  };

  const handleGuardar = (datosEditados) => {
    onGuardar(datosEditados, personas);
    navigate('/');
  };

  const handleAtras = () => {
    if (paso === 3) setPaso(2);
    else if (paso === 2) setPaso(1);
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#1A1817]">
      <header className="bg-[#252322] shadow-md border-b border-[#3A3633]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={handleAtras} className="text-[#8B7D6B] text-xl">←</button>
          <h1 className="text-lg font-bold text-[#E8E0D5]">Nueva receta</h1>
          <span className="text-sm text-[#5A5553] ml-auto">Paso {paso}/3</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {paso === 1 && (
          <div className="bg-[#252322] rounded-xl p-6 border border-[#3A3633] space-y-4">
            <h2 className="text-lg font-semibold text-[#E8E0D5]">¿Para cuántas personas?</h2>
            <div className="grid grid-cols-4 gap-3">
              {[1,2,3,4,5,6,8,10,12,15,20].map(n => (
                <button
                  key={n}
                  onClick={() => setPersonas(n)}
                  className={`py-3 rounded-xl text-lg font-bold transition-colors ${
                    personas === n
                      ? 'bg-[#C8965A] text-[#1A1817]'
                      : 'bg-[#2F2C2A] text-[#8B7D6B] hover:bg-[#3A3633]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button onClick={() => setPaso(2)} className="w-full bg-[#C8965A] text-[#1A1817] py-3 rounded-xl font-medium hover:bg-[#D4A56A]">
              Siguiente
            </button>
          </div>
        )}

        {paso === 2 && !metodo && (
          <div className="bg-[#252322] rounded-xl p-6 border border-[#3A3633] space-y-4">
            <h2 className="text-lg font-semibold text-[#E8E0D5]">¿Cómo se llama tu plato?</h2>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Arroz con huevo" className="w-full p-3 bg-[#1A1817] border border-[#3A3633] rounded-xl text-[#E8E0D5] text-lg focus:border-[#C8965A] outline-none" />
            <h2 className="text-lg font-semibold text-[#E8E0D5] pt-4">¿Cómo compartes tu receta?</h2>
            <button onClick={() => setMetodo('texto')} className="w-full bg-[#2F2C2A] border-2 border-[#C8965A] text-[#C8965A] py-4 rounded-xl font-medium hover:bg-[#C8965A] hover:text-[#1A1817] text-lg transition-colors">✍️ Escribir</button>
            <button onClick={() => setMetodo('audio')} className="w-full bg-[#2F2C2A] border-2 border-[#C8965A] text-[#C8965A] py-4 rounded-xl font-medium hover:bg-[#C8965A] hover:text-[#1A1817] text-lg transition-colors">🎤 Dictar <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full ml-2">Beta</span></button>
            <p className="text-xs text-[#5A5553] text-center">Habla con naturalidad. Chefcito prioriza tus instrucciones.</p>
          </div>
        )}

        {paso === 2 && metodo === 'texto' && (
          <div className="bg-[#252322] rounded-xl p-6 border border-[#3A3633]">
            <div className="mb-4">
              <p className="text-sm font-medium text-[#8B7D6B]">Plato: <span className="text-[#C8965A]">{titulo || 'Sin título'}</span></p>
              <p className="text-sm text-[#5A5553]">{personas} personas</p>
            </div>
            <FormularioTexto onSubmit={handleTexto} />
          </div>
        )}

        {paso === 2 && metodo === 'audio' && (
          <div className="bg-[#252322] rounded-xl p-6 border border-[#3A3633]">
            <div className="mb-4">
              <p className="text-sm font-medium text-[#8B7D6B]">Plato: <span className="text-[#C8965A]">{titulo || 'Sin título'}</span></p>
              <p className="text-sm text-[#5A5553]">{personas} personas</p>
            </div>
            <FormularioAudio onSubmit={handleAudio} />
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin text-4xl">🍳</div>
            <p className="text-[#8B7D6B] mt-2">Chefcito está cocinando tu receta...</p>
          </div>
        )}

        {paso === 3 && datosProcesados && (
          <RevisarReceta
            datosIniciales={{
              titulo: datosProcesados.titulo,
              autor: datosProcesados.autor || 'Anónimo',
              ingredientes: datosProcesados.ingredientes,
              preparacion: datosProcesados.preparacion,
              tiempoTotal: datosProcesados.tiempoTotal,
              puntosImportantes: datosProcesados.puntosImportantes,
              sugerencia: datosProcesados.sugerencia
            }}
            onGuardar={handleGuardar}
            onCancelar={() => setPaso(2)}
          />
        )}
      </main>
    </div>
  );
}
