import { useRef, useState, useEffect } from "react";

export default function AnimatedSection({ children, animationType , className = "", delay = 0 }) {
  // Ref para referenciar el elemento DOM y observarlo
  const ref = useRef(null);

  // Estado para saber si el elemento ya es visible en pantalla
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Crea un IntersectionObserver para detectar cuando el elemento entra en la vista
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { // Si el elemento está al menos un 20% visible
          setVisible(true);         // Marca como visible → activa la animación
          observer.unobserve(entry.target); // Deja de observar para que no se repita la animación
        }
      },
      { threshold: 0.2 } // 20% de visibilidad para activar
    );

    // Comienza a observar el elemento si existe
    if (ref.current) {
      observer.observe(ref.current);
    }

    // Limpia el observer al desmontar el componente
    return () => observer.disconnect();
  }, []);

  // Clase base por defecto (animación desde abajo)
  let baseClass = "scroll-anim-up";

  // Cambia la clase base según el tipo de animación que se pasa como prop
  if (animationType === "right") baseClass = "scroll-anim-right";
  else if (animationType === "left") baseClass = "scroll-anim-left";
  else if (animationType === "fit") baseClass = "scroll-anim-fit";

  // Clase extra si el elemento ya es visible (esto activa la animación en CSS)
  const animateClass = visible ? "animate" : "";

  return (
    <section
      ref={ref} // Asigna la referencia para el IntersectionObserver
      className={`${baseClass} ${animateClass} ${className}`} // Combina clases base + animación + personalizadas
      style={visible ? { animationDelay: `${delay}s` } : undefined} // Aplica retraso en la animación si está visible
    >
      {children} {/* Contenido que se animará */}
    </section>
  );
}
