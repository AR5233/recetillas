import { useState } from 'react';

export default function ReescalarPersonas({ personas, onReescalar, loading }) {
  const [nuevasPersonas, setNuevasPersonas] = useState(personas);

  const handleReescalar = () => {
    if (nuevasPersonas === personas) return;
    onReescalar(nuevasPersonas);
  };

  return (
    <div className="flex items-center gap-2 text-sm bg-[#252322] rounded-lg p-3 shadow-md">
      <label className="text-gray-600">👥</label>
      <select
        value={nuevasPersonas}
        onChange={(e) => setNuevasPersonas(Number(e.target.value))}
        className="border border-[#3A3633] rounded px-2 py-1"
      >
        {[1,2,3,4,5,6,7,8,9,10,12,15,20].map(n => (
          <option key={n} value={n}>{n} pers.</option>
        ))}
      </select>
      {nuevasPersonas !== personas && (
        <button
          onClick={handleReescalar}
          disabled={loading}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Calculando...' : 'Mostrar sugerencia'}
        </button>
      )}
    </div>
  );
}
