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
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch {
      setError('Necesitas permitir el acceso al micrófono. Revisa la configuración de tu navegador.');
      return false;
    }
  };

  const crearRecognition = () => {
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          textoAcumuladoRef.current += ' ' + event.results[i][0].transcript;
        }
      }
      setTextoTranscrito(textoAcumuladoRef.current.trim());
    };

    recognition.onerror = (e) => {
      if (e.error === 'not-allowed') {
        setError('Permiso de micrófono denegado. Actívalo en la configuración de tu navegador.');
      }
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      setGrabando(false);
      grabandoRef.current = false;
    };

    recognition.onend = () => {
      if (grabandoRef.current) {
        setTimeout(() => {
          if (grabandoRef.current) crearRecognition().start();
        }, 100);
      }
    };

    return recognition;
  };

  const iniciarGrabacion = async () => {
    setError(null);
    const permiso = await pedirPermiso();
    if (!permiso) return;

    textoAcumuladoRef.current = textoConfirmado;
    grabandoRef.current = true;
    setGrabando(true);
    const rec = crearRecognition();
    recognitionRef.current = rec;
    rec.start();
  };

  const detenerGrabacion = () => {
    grabandoRef.current = false;
    setGrabando(false);
    recognitionRef.current?.stop();
    setTextoConfirmado(textoAcumuladoRef.current.trim());
  };

  const handleEnviar = () => {
    const textoFinal = textoConfirmado || textoTranscrito.trim();
    if (!textoFinal) return;
    onSubmit(textoFinal);
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {(textoTranscrito || textoConfirmado) && (
        <textarea
          value={textoConfirmado || textoTranscrito}
          onChange={(e) => setTextoConfirmado(e.target.value)}
          className="w-full p-3 bg-[#1A1817] border border-[#3A3633] rounded-xl text-[#E8E0D5] text-sm resize-none focus:border-[#C8965A] outline-none"
          rows="6"
          placeholder="Texto transcrito (puedes editarlo)..."
        />
      )}
      <div className="flex gap-2">
        {!grabando ? (
          <button onClick={iniciarGrabacion} className="flex-1 bg-red-500/80 text-white py-3 rounded-xl font-medium hover:bg-red-500">
            🎤 Grabar
          </button>
        ) : (
          <button onClick={detenerGrabacion} className="flex-1 bg-[#3A3633] text-[#E8E0D5] py-3 rounded-xl font-medium animate-pulse border border-[#5A5553]">
            ⏹️ Detener
          </button>
        )}
      </div>
      {(textoTranscrito || textoConfirmado) && (
        <button onClick={handleEnviar} className="w-full bg-[#C8965A] text-[#1A1817] py-3 rounded-xl font-medium hover:bg-[#D4A56A]">
          ✨ Procesar con Chefcito
        </button>
      )}
      <p className="text-xs text-[#5A5553] text-center">
        Habla con naturalidad. Puedes editar el texto antes de enviar.
      </p>
    </div>
  );
}
