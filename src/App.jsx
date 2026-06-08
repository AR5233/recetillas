import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NuevaReceta from './pages/NuevaReceta';
import DetalleReceta from './pages/DetalleReceta';

export default function App({
  perfiles, perfilActivo, loadingPerfiles,
  onCrearPerfil, onSeleccionarPerfil, onBorrarPerfil, onCerrarSesion,
  recetas, favoritos, onToggleFavorito,
  onProcesarReceta, onGuardarReceta, onEliminarReceta, onReescalarReceta, onActualizarReceta,
  onVerReceta, recetaActivaId, comentarios, onAgregarComentario, hayCorrecciones
}) {
  const homeProps = {
    perfiles, perfilActivo, loadingPerfiles,
    onCrearPerfil, onSeleccionarPerfil, onBorrarPerfil, onCerrarSesion,
    recetas, favoritos, onToggleFavorito, onEliminarReceta
  };

  return (
    <Routes>
      <Route path="/" element={<Home {...homeProps} />} />
      <Route path="/nueva" element={<NuevaReceta onProcesar={onProcesarReceta} onGuardar={onGuardarReceta} />} />
      <Route path="/receta/:id" element={
        <DetalleReceta
          recetas={recetas}
          favoritos={favoritos}
          perfilActivo={perfilActivo}
          onToggleFavorito={onToggleFavorito}
          onEliminar={onEliminarReceta}
          onReescalar={onReescalarReceta}
          onActualizar={onActualizarReceta}
          onVerReceta={onVerReceta}
          comentarios={comentarios}
          onAgregarComentario={onAgregarComentario}
          hayCorrecciones={hayCorrecciones}
        />
      } />
    </Routes>
  );
}
