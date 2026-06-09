import { useState } from 'react';

export default function FormularioTexto({ onSubmit, onLimpiar }) {
  const [texto, setTexto] = useState('');
  const [limpiando, setLimpiando] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    onSubmit(texto.trim());
  };

  const handleLimpiar = async () => {
    if (!texto.trim()) return;
    setLimpiando(true);
    try {
      const textoLimpio = await onLimpiar(texto);
      setTexto(textoLimpio);
    } catch (e) {
      // error manejado por el toast
    }
    setLimpiando(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-[#1F1D1C] rounded-xl p-3 text-sm text-[#B4A99A] space-y-2 p-4">
        <p className="font-semibold text-[#C8965A] text-base mb-1">📋 Cómo escribir tu receta:</p>
        <p>1. Escribe primero los <strong>ingredientes</strong> con sus cantidades</p>
        <p>2. Luego explica la <strong>preparación</strong> paso a paso</p>
        <p>3. Si olvidaste algo, añádelo al final sin problema</p>
        <p>4. Usa <strong>"Limpiar texto"</strong> si pegaste desde WhatsApp o dictado</p>
      </div>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Arroz: 1 taza&#10;Huevos: 2 unidades&#10;&#10;1. Cocer el arroz 15 min&#10;2. Freír los huevos..."
        className="w-full h-40 p-4 bg-[#1A1817] border border-[#3A3633] rounded-xl text-[#E8E0D5] text-base resize-none focus:border-[#C8965A] outline-none placeholder-[#5A5553]"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleLimpiar}
          disabled={!texto.trim() || limpiando}
          className="flex-1 bg-[#2F2C2A] text-[#C8965A] py-3 rounded-xl font-medium border border-[#C8965A]/30 hover:bg-[#3A3633] disabled:opacity-30"
        >
          {limpiando ? 'Limpiando...' : '✨ Limpiar texto'}
        </button>
        <button
          type="submit"
          disabled={!texto.trim()}
          className="flex-1 bg-[#C8965A] text-[#1A1817] py-3 rounded-xl font-medium hover:bg-[#D4A56A] disabled:opacity-30"
        >
          Procesar con Chefcito
        </button>
      </div>
    </form>
  );
}
