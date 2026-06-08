import { useState } from 'react';

export default function FormularioTexto({ onSubmit }) {
  const [texto, setTexto] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    onSubmit(texto.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-[#1F1D1C] rounded-xl p-3 text-xs text-[#8B7D6B] space-y-1">
        <p className="font-medium text-[#C8965A]">📋 Cómo escribir tu receta:</p>
        <p>1. Escribe primero los <strong>ingredientes</strong> con sus cantidades</p>
        <p>2. Luego explica la <strong>preparación</strong> paso a paso</p>
        <p>3. Si olvidaste algo, añádelo al final sin problema</p>
        <p>4. Chefcito organiza todo aunque lo escribas desordenado</p>
      </div>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Arroz: 1 taza&#10;Huevos: 2 unidades&#10;&#10;1. Cocer el arroz 15 min&#10;2. Freír los huevos..."
        className="w-full h-40 p-4 bg-[#1A1817] border border-[#3A3633] rounded-xl text-[#E8E0D5] text-base resize-none focus:border-[#C8965A] outline-none placeholder-[#5A5553]"
      />
      <button
        type="submit"
        disabled={!texto.trim()}
        className="w-full bg-[#C8965A] text-[#1A1817] py-3 rounded-xl font-medium hover:bg-[#D4A56A] disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ✨ Procesar con Chefcito
      </button>
    </form>
  );
}
