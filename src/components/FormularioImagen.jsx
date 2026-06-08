import { useState, useRef } from 'react';

export default function FormularioImagen({ onImagenLista }) {
  const [comprimiendo, setComprimiendo] = useState(false);
  const fileRef = useRef(null);

  const comprimirImagen = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxSize = 800;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.7);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCambio = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setComprimiendo(true);
    const comprimido = await comprimirImagen(file);
    setComprimiendo(false);

    const previewUrl = URL.createObjectURL(comprimido);
    onImagenLista({ blob: comprimido, preview: previewUrl });
  };

  return (
    <div>
      <button
        onClick={() => fileRef.current?.click()}
        className="w-full border-2 border-dashed border-[#3A3633] rounded-xl p-6 text-center text-[#8B7D6B] hover:border-[#C8965A] hover:text-[#C8965A] transition-colors"
      >
        {comprimiendo ? 'Comprimiendo...' : '📸 Añadir foto (opcional)'}
      </button>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleCambio} className="hidden" />
      <p className="text-xs text-[#5A5553] mt-1 text-center">Se comprime automáticamente</p>
    </div>
  );
}
