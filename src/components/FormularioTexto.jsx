import { useState } from 'react';

export default function FormularioTexto({ onSubmit }) {
  const [texto, setTexto] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    onSubmit(texto.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escribe tu receta aquí con naturalidad... Ej: 'Para hacer arroz con huevo necesitas arroz, huevos, aceite...'"
        className="w-full h-40 p-3 border border-[#3A3633] rounded-lg resize-none text-base"
      />
      <button
        type="submit"
        disabled={!texto.trim()}
        className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
      >
        ✨ Procesar con Chefcito
      </button>
    </form>
  );
}
