import { useState, useRef } from 'react';

export default function FormularioAudio({ onSubmit }) {
  const [grabando, setGrabando] = useState(false);
  const [textoTranscrito, setTextoTranscrito] = useState('');
  const [textoConfirmado, setTextoConfirmado] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const textoAcumuladoRef = useRef('');
  const grabandoRef = useRef(false);

  const tieneSoporte = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  if (!tieneSoporte) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-[#8B7D6B]">Tu navegador no soporta reconocimiento de voz.</p>
        <p className="text-sm text-[#5A5553] mt-2">Usa la opción de escribir o el transcriptor de tu móvil.</p>
      </div>
    );
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const pedirPermiso = async () => {
    try { await navigator.mediaDevices.getUserMedia({ audio: true }); return true; }
    catch { setError('Necesitas permitir el acceso al micrófono. Revisa la configuración de tu navegador.'); return false; }
  };

  const crearRecognition = () => {
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) textoAcumuladoRef.current += ' ' + event.results[i][0].transcript;
      }
      setTextoTranscrito(textoAcumuladoRef.current.trim());
    };
    recognition.onerror = (e) => {
      if (e.error === 'not-allowed') setError('Permiso de micrófono denegado.');
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      setGrabando(false); grabandoRef.current = false;
    };
    recognition.onend = () => { if (grabandoRef.current) setTimeout(() => { if (grabandoRef.current) crearRecognition().start(); }, 100); };
    return recognition;
  };

  const iniciarGrabacion = async () => {
    setError(null);
    const permiso = await pedirPermiso();
    if (!permiso) return;
    textoAcumuladoRef.current = textoConfirmado;
    grabandoRef.current = true; setGrabando(true);
    const rec = crearRecognition(); recognitionRef.current = rec; rec.start();
  };

  const detenerGrabacion = () => {
    grabandoRef.current = false; setGrabando(false);
    recognitionRef.current?.stop();
    setTextoConfirmado(textoAcumuladoRef.current.trim());
  };

  const handleEnviar = () => {
    const textoFinal = textoConfirmado || textoTranscrito.trim();
    if (!textoFinal) return;
    onSubmit(textoFinal);
  };

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">{error}</div>}

      <div className="bg-[#1F1D1C] rounded-xl p-3 text-xs text-[#8B7D6B] space-y-1">
        <p className="font-medium text-[#C8965A]">📋 Cómo dictar tu receta:</p>
        <p>1. Di primero los <strong>ingredientes</strong> con sus cantidades</p>
        <p>2. Luego explica la <strong>preparación</strong> paso a paso</p>
        <p>3. Si olvidaste algo, dilo al final sin problema</p>
        <p>4. Chefcito organiza todo aunque te saltes el orden</p>
      </div>

      <textarea
        value={textoConfirmado || textoTranscrito}
        onChange={(e) => setTextoConfirmado(e.target.value)}
        className="w-full p-3 bg-[#1A1817] border border-[#3A3633] rounded-xl text-[#E8E0D5] text-sm resize-none focus:border-[#C8965A] outline-none"
        rows="6"
        placeholder="El texto transcrito aparecerá aquí. Puedes editarlo."
      />

      <div className="flex justify-center">
        {!grabando ? (
          <button onClick={iniciarGrabacion} className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-400 transition-all active:scale-95">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
          </button>
        ) : (
          <button onClick={detenerGrabacion} className="w-20 h-20 bg-[#3A3633] rounded-full flex items-center justify-center shadow-lg border-4 border-red-500 animate-pulse">
            <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
          </button>
        )}
      </div>
      <p className="text-xs text-[#5A5553] text-center">{grabando ? 'Grabando... pulsa para detener' : 'Pulsa para grabar'}</p>

      {(textoTranscrito || textoConfirmado) && (
        <button onClick={handleEnviar} className="w-full bg-[#C8965A] text-[#1A1817] py-3 rounded-xl font-medium hover:bg-[#D4A56A]">✨ Procesar con Chefcito</button>
      )}
    </div>
  );
}
