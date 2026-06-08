import { useState, useRef } from 'react';

export default function FormularioAudio({ onSubmit }) {
  const [grabando, setGrabando] = useState(false);
  const [textoTranscrito, setTextoTranscrito] = useState('');
  const [textoConfirmado, setTextoConfirmado] = useState('');
  const recognitionRef = useRef(null);
  const textoAcumuladoRef = useRef('');
  const grabandoRef = useRef(false);

  const tieneSoporte = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  if (!tieneSoporte) {
    return (
      <div className="text-center text-[#8B7D6B] py-8">
        Tu navegador no soporta reconocimiento de voz.
      </div>
    );
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

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
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      setGrabando(false);
      grabandoRef.current = false;
    };

    recognition.onend = () => {
      if (grabandoRef.current) {
        setTimeout(() => {
          if (grabandoRef.current) {
            crearRecognition().start();
          }
        }, 100);
      }
    };

    return recognition;
  };

  const iniciarGrabacion = () => {
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
      {(textoTranscrito || textoConfirmado) && (
        <textarea
          value={textoConfirmado || textoTranscrito}
          onChange={(e) => setTextoConfirmado(e.target.value)}
          className="w-full p-3 bg-[#1A1817] rounded-lg text-[#C4B8A7] text-sm resize-none"
          rows="6"
          placeholder="Texto transcrito (puedes editarlo)..."
        />
      )}
      <div className="flex gap-2">
        {!grabando ? (
          <button onClick={iniciarGrabacion} className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600">
            🎤 Grabar
          </button>
        ) : (
          <button onClick={detenerGrabacion} className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium animate-pulse">
            ⏹️ Detener
          </button>
        )}
      </div>
      {(textoTranscrito || textoConfirmado) && (
        <button onClick={handleEnviar} className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600">
          ✨ Procesar con Chefcito
        </button>
      )}
      <p className="text-xs text-[#5A5553] text-center">
        Habla con naturalidad. Puedes editar el texto antes de enviar.
      </p>
    </div>
  );
}
