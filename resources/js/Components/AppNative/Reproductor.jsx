import { useRef, useState, useEffect } from "react";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand } from "react-icons/fa";

// Componente de reproductor de video personalizado
export default function VideoPlayer({ src, className = "" }) {
  // Referencias a elementos DOM
  const videoRef = useRef(null);      // Referencia al <video>
  const containerRef = useRef(null);  // Referencia al contenedor del video

  // Estados del reproductor
  const [playing, setPlaying] = useState(true);       // Si el video está reproduciéndose
  const [volume, setVolume] = useState(0);            // Volumen actual
  const [progress, setProgress] = useState(0);        // Tiempo actual del video
  const [duration, setDuration] = useState(0);        // Duración total del video
  const [hover, setHover] = useState(false);          // Detecta si el mouse está sobre el video
  const [smallMode, setSmallMode] = useState(false);  // Modo compacto si el contenedor es muy pequeño
  const [showOverlay, setShowOverlay] = useState(false); // Mostrar controles flotantes grandes

  // Efecto al montar el componente
  useEffect(() => {
    if (!videoRef.current) return;

    // Configuración inicial del video
    videoRef.current.muted = true;
    videoRef.current.playsInline = true;
    videoRef.current.play().catch(() => setPlaying(false));

    // Observador de tamaño del contenedor para activar modo compacto
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setSmallMode(entry.contentRect.width < 200); // Si ancho < 200px => modo compacto
      }
    });
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Función para alternar play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  // Función para alternar mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    if (volume > 0) {
      videoRef.current.volume = 0;
      videoRef.current.muted = true;
      setVolume(0);
    } else {
      videoRef.current.volume = 0.5;
      videoRef.current.muted = false;
      setVolume(0.5);
    }
  };

  // Cambiar progreso cuando el usuario mueve el slider
  const handleProgress = (e) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setProgress(time);
  };

  // Actualizar progreso mientras se reproduce el video
  const updateProgress = () => {
    if (!videoRef.current) return;
    setProgress(videoRef.current.currentTime);
  };

  // Obtener duración total del video al cargar metadata
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Video de fondo */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover transform-gpu"
        onTimeUpdate={updateProgress}
        onLoadedMetadata={handleLoadedMetadata}
      />

      {/* Botón Play/Pause central */}
      <button
        onClick={togglePlay}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-3xl bg-black/45 p-2 rounded-full transition-opacity duration-300 
        ${hover ? "opacity-100" : "opacity-0"}`}
      >
        {playing ? <FaPause /> : <FaPlay />}
      </button>

      {/* Controles inferiores: slider de progreso y volumen */}
      <div
        className={`absolute ${smallMode ? "top-32" : "bottom-2"} left-0 right-0 flex items-center gap-3 px-4 transition-opacity duration-300
        ${hover ? "opacity-100" : "opacity-0"}`}
      >
        {/* Slider de progreso */}
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={progress}
          onChange={handleProgress}
          className="flex-1 h-2 rounded-full accent-white"
        />

        {/* Botón volumen */}
        <button
          onClick={toggleMute}
          className="text-white p-2 rounded hover:bg-white/20 transition"
        >
          {volume > 0 ? <FaVolumeUp /> : <FaVolumeMute />}
        </button>
      </div>

      {/* Controles flotantes grandes */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="w-[600px] max-w-full relative bg-black rounded-lg overflow-hidden">
            {/* Botón cerrar */}
            <button
              onClick={() => setShowOverlay(false)}
              className="absolute top-2 right-2 text-white bg-black/60 p-2 rounded-full"
            >
              ✕
            </button>
            {/* Video grande dentro del overlay */}
            <VideoPlayer src={src} className="w-full h-auto" />
          </div>
        </div>
      )}
    </div>
  );
}
