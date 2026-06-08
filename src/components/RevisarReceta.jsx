import { useState, useRef } from 'react';
import FormularioImagen from './FormularioImagen';

export default function RevisarReceta({ datosIniciales, onGuardar, onCancelar }) {
  const normalizar = (datos) => ({
    titulo: datos.titulo || '',
    autor: datos.autor || 'Anónimo',
    ingredientes: datos.ingredientes?.length > 0 ? datos.ingredientes : [{ nombre: '', cantidad: '', esSugerencia: false }],
    preparacion: datos.preparacion?.length > 0 ? datos.preparacion : [{ paso: 1, instruccion: '', tiempo: '' }],
    tiempoTotal: datos.tiempoTotal || datos.tiempo_total || '',
    puntosImportantes: datos.puntosImportantes || datos.puntos_importantes || [],
    sugerencia: datos.sugerencia || datos.sugerencia_opcional || '',
    categoria: datos.categoria || 'otro',
    imagen: datos.imagen || null,
    imagenPreview: datos.imagenPreview || null
  });

  const [receta, setReceta] = useState(normalizar(datosIniciales));
  const ingredientesEndRef = useRef(null);
  const pasosEndRef = useRef(null);

  const actualizarCampo = (campo, valor) => setReceta(prev => ({ ...prev, [campo]: valor }));
  const actualizarIngrediente = (i, campo, valor) => { const nuevos = [...receta.ingredientes]; nuevos[i] = { ...nuevos[i], [campo]: valor }; setReceta(prev => ({ ...prev, ingredientes: nuevos })); };
  const eliminarIngrediente = (i) => setReceta(prev => ({ ...prev, ingredientes: prev.ingredientes.filter((_, idx) => idx !== i) }));
  const agregarIngrediente = () => {
    setReceta(prev => ({ ...prev, ingredientes: [...prev.ingredientes, { nombre: '', cantidad: '', esSugerencia: false }] }));
    setTimeout(() => ingredientesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };
  const actualizarPaso = (i, campo, valor) => { const nuevos = [...receta.preparacion]; nuevos[i] = { ...nuevos[i], [campo]: valor }; setReceta(prev => ({ ...prev, preparacion: nuevos })); };
  const eliminarPaso = (i) => setReceta(prev => ({ ...prev, preparacion: prev.preparacion.filter((_, idx) => idx !== i) }));
  const agregarPaso = () => {
    setReceta(prev => ({ ...prev, preparacion: [...prev.preparacion, { paso: prev.preparacion.length + 1, instruccion: '', tiempo: '' }] }));
    setTimeout(() => pasosEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };
  const handleImagen = ({ blob, preview }) => setReceta(prev => ({ ...prev, imagen: blob, imagenPreview: preview }));
  const eliminarPuntoImportante = (i) => setReceta(prev => ({ ...prev, puntosImportantes: prev.puntosImportantes.filter((_, idx) => idx !== i) }));
  const agregarPuntoImportante = () => setReceta(prev => ({ ...prev, puntosImportantes: [...prev.puntosImportantes, ''] }));

  const handleGuardar = () => {
    const ingredientesLimpios = receta.ingredientes.filter(ing => ing.nombre.trim() !== '');
    const pasosLimpios = receta.preparacion.filter(p => p.instruccion.trim() !== '');
    const puntosLimpios = receta.puntosImportantes.filter(p => p.trim() !== '');
    const sugerenciaLimpia = receta.sugerencia.trim();
    onGuardar({ ...receta, ingredientes: ingredientesLimpios, preparacion: pasosLimpios, puntosImportantes: puntosLimpios, sugerencia: sugerenciaLimpia });
  };

  return (
    <div className="space-y-6 p-4 bg-[#1A1817] min-h-screen text-[#E8E0D5]">
      <h2 className="text-xl font-bold text-[#C8965A]">Revisa tu receta</h2>
      <div><label className="block text-sm font-medium text-[#8B7D6B] mb-1">Título *</label><input type="text" value={receta.titulo} onChange={(e) => actualizarCampo('titulo', e.target.value)} className="w-full p-3 bg-[#252322] border border-[#3A3633] rounded-xl text-[#E8E0D5] text-base focus:border-[#C8965A] outline-none" required /></div>
      <div><label className="block text-sm font-medium text-[#8B7D6B] mb-1">Categoría</label>
        <select value={receta.categoria} onChange={(e) => actualizarCampo('categoria', e.target.value)} className="w-full p-3 bg-[#252322] border border-[#3A3633] rounded-xl text-[#E8E0D5] text-base focus:border-[#C8965A] outline-none">
          {['res','pollo','cerdo','pescado','marisco','verdura','legumbre','pasta','arroz','postre','otro'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div><label className="block text-sm font-medium text-[#8B7D6B] mb-1">Autor</label><input type="text" value={receta.autor} onChange={(e) => actualizarCampo('autor', e.target.value)} className="w-full p-3 bg-[#252322] border border-[#3A3633] rounded-xl text-[#E8E0D5] text-base focus:border-[#C8965A] outline-none" /></div>
      <FormularioImagen onImagenLista={handleImagen} />
      {receta.imagenPreview && <img src={receta.imagenPreview} alt="Preview" className="w-full rounded-xl object-cover max-h-64" />}

      <div>
        <div className="flex justify-between items-center mb-2"><label className="text-sm font-medium text-[#8B7D6B]">Ingredientes</label><button onClick={agregarIngrediente} className="text-sm text-[#C8965A] font-medium">+ Añadir</button></div>
        {receta.ingredientes.map((ing, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <input type="text" value={ing.nombre} onChange={(e) => actualizarIngrediente(i, 'nombre', e.target.value)} placeholder="Ingrediente" className="flex-1 p-3 bg-[#252322] border border-[#3A3633] rounded-xl text-[#E8E0D5] text-base focus:border-[#C8965A] outline-none" />
            <input type="text" value={ing.cantidad} onChange={(e) => actualizarIngrediente(i, 'cantidad', e.target.value)} placeholder="Cantidad" className="w-28 p-3 bg-[#252322] border border-[#3A3633] rounded-xl text-[#E8E0D5] text-base focus:border-[#C8965A] outline-none" />
            {ing.esSugerencia && <span className="text-xs text-[#C8965A]">💡</span>}
            <button onClick={() => eliminarIngrediente(i)} className="text-[#5A5553] hover:text-red-400 text-xl">✕</button>
          </div>
        ))}
        <div ref={ingredientesEndRef} />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2"><label className="text-sm font-medium text-[#8B7D6B]">Preparación</label><button onClick={agregarPaso} className="text-sm text-[#C8965A] font-medium">+ Añadir paso</button></div>
        {receta.preparacion.map((paso, i) => (
          <div key={i} className="flex gap-2 mb-2 items-start">
            <span className="text-sm font-bold text-[#C8965A] pt-3">{i + 1}.</span>
            <textarea value={paso.instruccion} onChange={(e) => actualizarPaso(i, 'instruccion', e.target.value)} placeholder="Instrucción (obligatorio)" className="flex-1 p-3 bg-[#252322] border border-[#3A3633] rounded-xl text-[#E8E0D5] text-base resize-none focus:border-[#C8965A] outline-none" rows="2" />
            <input type="text" value={paso.tiempo} onChange={(e) => actualizarPaso(i, 'tiempo', e.target.value)} placeholder="Ej: 5 min" className="w-28 p-3 bg-[#252322] border border-[#3A3633] rounded-xl text-[#E8E0D5] text-base focus:border-[#C8965A] outline-none" />
            <button onClick={() => eliminarPaso(i)} className="text-[#5A5553] hover:text-red-400 pt-3 text-xl">✕</button>
          </div>
        ))}
        <div ref={pasosEndRef} />
      </div>

      <div><label className="block text-sm font-medium text-[#8B7D6B] mb-1">Tiempo total</label><input type="text" value={receta.tiempoTotal} onChange={(e) => actualizarCampo('tiempoTotal', e.target.value)} placeholder="Ej: 45 min + 2h marinado" className="w-full p-3 bg-[#252322] border border-[#3A3633] rounded-xl text-[#E8E0D5] text-base focus:border-[#C8965A] outline-none" /></div>

      <div>
        <div className="flex justify-between items-center mb-1"><label className="text-sm font-medium text-[#8B7D6B]">⚠️ Puntos importantes</label><button onClick={agregarPuntoImportante} className="text-sm text-[#C8965A] font-medium">+ Añadir</button></div>
        {receta.puntosImportantes.map((punto, i) => (
          <div key={i} className="flex gap-2 mb-1 items-center">
            <span className="text-yellow-500">⚠️</span>
            <input type="text" value={punto} onChange={(e) => { const nuevos = [...receta.puntosImportantes]; nuevos[i] = e.target.value; actualizarCampo('puntosImportantes', nuevos); }} className="flex-1 p-3 bg-[#252322] border border-[#3A3633] rounded-xl text-[#E8E0D5] text-base focus:border-[#C8965A] outline-none" />
            <button onClick={() => eliminarPuntoImportante(i)} className="text-[#5A5553] hover:text-red-400 text-xl">✕</button>
          </div>
        ))}
      </div>

      <div>
        <div className="flex justify-between items-center mb-1"><label className="text-sm font-medium text-[#8B7D6B] mb-1">💡 Sugerencia</label><button onClick={() => actualizarCampo('sugerencia', '')} className="text-xs text-[#5A5553] hover:text-red-400">Limpiar</button></div>
        <input type="text" value={receta.sugerencia} onChange={(e) => actualizarCampo('sugerencia', e.target.value)} className="w-full p-3 bg-[#252322] border border-[#3A3633] rounded-xl text-[#E8E0D5] text-base focus:border-[#C8965A] outline-none" />
      </div>

      <div className="flex gap-3 pt-4">
        <button onClick={onCancelar} className="flex-1 bg-[#252322] text-[#8B7D6B] py-3 rounded-xl font-medium border border-[#3A3633] hover:bg-[#2F2C2A]">Cancelar</button>
        <button onClick={handleGuardar} className="flex-1 bg-[#C8965A] text-[#1A1817] py-3 rounded-xl font-medium hover:bg-[#D4A56A]">💾 Guardar receta</button>
      </div>
    </div>
  );
}
