export default function RectanguloLayout({ children, background = "bg-grisClaro" }) {
    // Verifica si el valor de 'background' es un código de color (hexadecimal o rgb)
    // Esto permite usar tanto clases de Tailwind (ej. "bg-red-500") como valores directos de color ("#ff0000")
    const isColorCode = background.startsWith("#") || background.startsWith("rgb");

    return (
        <div

            className={`w-full min-h-screen flex flex-col md:flex-row items-center justify-start px-4 sm:px-8 md:px-16 py-4 md:py-10 overflow-visible ${!isColorCode ? background : ""}`}
            
            // Si el fondo ES un código de color, se aplica como estilo en línea
            style={isColorCode ? { background } : {}}
        >
                
            {children}
            
        </div>
    );
}
