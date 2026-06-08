import { useState, useRef } from 'react';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_WHISPER_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

export default function FormularioAudio({ onSubmit }) {
  const [grabando, setGrabando] = useState(false);
  const [textoTranscrito, setTextoTranscrito] = useState('');
  const [error, setError] = useState(null);
  const [transcribiendo, setTranscribiendo] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const pedirPermiso = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch {
      setError('Necesitas permitir el acceso al micrófono en la configuración de tu navegador.');
      return false;
    }
  };

  const iniciarGrabacion = async () => {
    setError(null);
    setTextoTranscrito('');
    const permiso = await pedirPermiso();
    if (!permiso) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        await transcribirAudio(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setGrabando(true);
    } catch (e) {
      setError('No se pudo acceder al micrófono. Verifica los permisos.');
    }
  };

  const detenerGrabacion = () => {
    setGrabando(false);
    mediaRecorderRef.current?.stop();
  };

  const transcribirAudio = async (blob) => {
    setTranscribiendo(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, 'audio.webm');
      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'es');
      formData.append('response_format', 'text');

      const response = await fetch(GROQ_WHISPER_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: formData
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const texto = await response.text();
      setTextoTranscrito(texto.trim());
    } catch (e) {
      setError('Error al transcribir. Prueba de nuevo.');
      console.error(e);
    }
    setTranscribiendo(false);
  };

  const handleEnviar = () => {
    if (!textoTranscrito.trim()) return;
    onSubmit(textoTranscrito.trim());
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

      {transcribiendo && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin text-3xl">🎧</div>
          <p className="text-sm text-[#8B7D6B] mt-2">Transcribiendo audio...</p>
        </div>
      )}

      {textoTranscrito && (
        <textarea
          value={textoTranscrito}
          onChange={(e) => setTextoTranscrito(e.target.value)}
          className="w-full p-3 bg-[#1A1817] border border-[#3A3633] rounded-xl text-[#E8E0D5] text-sm resize-none focus:border-[#C8965A] outline-none"
          rows="6"
          placeholder="El texto transcrito aparecerá aquí. Puedes editarlo."
        />
      )}

      <div className="flex justify-center">
        {!grabando && !transcribiendo && (
          <button onClick={iniciarGrabacion} className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-400 transition-all active:scale-95">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
          </button>
        )}
        {grabando && (
          <button onClick={detenerGrabacion} className="w-20 h-20 bg-[#3A3633] rounded-full flex items-center justify-center shadow-lg border-4 border-red-500 animate-pulse">
            <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
          </button>
        )}
      </div>
      <p className="text-xs text-[#5A5553] text-center">
        {grabando ? 'Grabando... pulsa para detener' : transcribiendo ? 'Procesando...' : 'Pulsa para grabar'}
      </p>

      {textoTranscrito && (
        <button onClick={handleEnviar} className="w-full bg-[#C8965A] text-[#1A1817] py-3 rounded-xl font-medium hover:bg-[#D4A56A]">
          ✨ Procesar con Chefcito
        </button>
      )}
    </div>
  );
}
