import { useState } from 'react';

export default function SelectorPerfil({ perfiles, perfilActivo, onSeleccionar, onCrear, onBorrar, onCerrarSesion }) {
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [borrandoId, setBorrandoId] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [pidiendoPassword, setPidiendoPassword] = useState(null);
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

  const handleCrear = () => { if (!nuevoNombre.trim()) return; onCrear(nuevoNombre.trim()); setNuevoNombre(''); setMostrarCrear(false); };
  const handleBorrar = (id) => { if (borrandoId === id) { onBorrar(id); setBorrandoId(null); } else setBorrandoId(id); };
  const handleSeleccionar = (perfil) => { if (perfil.nombre === 'Admin') setPidiendoPassword(perfil); else onSeleccionar(perfil); };
  const verificarPassword = () => { if (adminPassword === ADMIN_PASSWORD) { onSeleccionar(pidiendoPassword); setPidiendoPassword(null); setAdminPassword(''); } else alert('Contraseña incorrecta'); };

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2">
      {pidiendoPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#252322] rounded-xl p-6 shadow-xl max-w-sm w-full mx-4 border border-[#3A3633]">
            <h3 className="font-semibold text-[#E8E0D5] mb-3">🔐 Acceso Admin</h3>
            <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Contraseña" className="w-full p-3 bg-[#1A1817] border border-[#3A3633] rounded-xl text-[#E8E0D5] mb-3 focus:border-[#C8965A] outline-none" onKeyDown={(e) => e.key === 'Enter' && verificarPassword()} autoFocus />
            <div className="flex gap-2">
              <button onClick={() => { setPidiendoPassword(null); setAdminPassword(''); }} className="flex-1 bg-[#2F2C2A] text-[#8B7D6B] py-2 rounded-xl">Cancelar</button>
              <button onClick={verificarPassword} className="flex-1 bg-[#C8965A] text-[#1A1817] py-2 rounded-xl font-medium">Entrar</button>
            </div>
          </div>
        </div>
      )}
      <button onClick={onCerrarSesion} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!perfilActivo ? 'bg-[#C8965A] text-[#1A1817]' : 'bg-[#2F2C2A] text-[#8B7D6B] hover:bg-[#3A3633]'}`}>
        <span className="w-6 h-6 rounded-full bg-[#5A5553] flex items-center justify-center text-[#E8E0D5] text-xs">👤</span> Visitante
      </button>
      {perfiles.map(perfil => (
        <div key={perfil.id} className="relative">
          <button onClick={() => borrandoId === perfil.id ? handleBorrar(perfil.id) : handleSeleccionar(perfil)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${perfilActivo?.id === perfil.id ? (perfil.nombre === 'Admin' ? 'bg-red-600 text-white' : 'bg-[#C8965A] text-[#1A1817]') : 'bg-[#2F2C2A] text-[#8B7D6B] hover:bg-[#3A3633]'}`}>
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: perfil.color || '#C8965A' }}>{perfil.nombre === 'Admin' ? '🔒' : perfil.nombre.charAt(0).toUpperCase()}</span>
            {perfil.nombre}
          </button>
          {borrandoId === perfil.id && <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">?</span>}
        </div>
      ))}
      {mostrarCrear ? (
        <div className="flex items-center gap-1">
          <input type="text" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="Nombre" className="w-24 px-2 py-1 text-sm bg-[#1A1817] border border-[#3A3633] rounded-full text-[#E8E0D5] focus:border-[#C8965A] outline-none" onKeyDown={(e) => e.key === 'Enter' && handleCrear()} autoFocus />
          <button onClick={handleCrear} className="text-sm text-[#C8965A] font-medium">OK</button>
          <button onClick={() => { setMostrarCrear(false); setNuevoNombre(''); }} className="text-sm text-[#5A5553]">✕</button>
        </div>
      ) : (
        <button onClick={() => setMostrarCrear(true)} className="w-8 h-8 rounded-full bg-[#2F2C2A] text-[#8B7D6B] hover:bg-[#3A3633] flex items-center justify-center text-lg" title="Crear perfil">+</button>
      )}
    </div>
  );
}
