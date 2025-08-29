import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";

export default function FooterLayout() {
    return (
        <footer className="bg-green-800 text-white py-10 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-10">

                {/* Sección Términos y privacidad */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
                    <img 
                        src="https://ragnarcapital.pe/png/libro_reclamaciones.png" 
                        alt="Libro de Reclamaciones" 
                        className="w-20 md:w-24 border-2 border-white p-2 rounded-lg bg-white" 
                    />
                    <a 
                        href="/politicas" 
                        className="text-sm md:text-base font-medium hover:text-green-200 cursor-pointer transition-colors underline"
                    >
                        Términos, condiciones y privacidad
                    </a>
                </div>

                {/* Sección autorizaciones */}
                <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
                        <img src="https://ragnarcapital.pe/png/sbs.png" alt="SBS" className="w-16 md:w-20 border-2 border-white p-1 rounded-lg bg-white" />
                        <div className="text-sm md:text-base">
                            <p>Autorizado por la SBS</p>
                            <a href="#" className="underline hover:text-green-200 transition-colors">Resolución N° 01172-2024</a>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
                        <img src="https://ragnarcapital.pe/png/indecopi.png" alt="Indecopi" className="w-16 md:w-20 border-2 border-white p-1 rounded-lg bg-white" />
                        <div className="text-sm md:text-base">
                            <p>Registrado en INDECOPI</p>
                            <p>Certificado N° 00167443</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
                        <img src="https://ragnarcapital.pe/png/imgsunat.png" alt="SUNAT" className="w-16 md:w-20 border-2 border-white p-1 rounded-lg bg-white" />
                        <div className="text-sm md:text-base">
                            <p>Autorizado por SUNAT</p>
                            <p>RUC: 20601111587</p>
                        </div>
                    </div>
                </div>

                {/* Sección Redes sociales */}
                <div className="flex flex-col items-center md:items-end gap-3">
                    <p className="text-sm md:text-base font-medium">Síguenos en nuestras redes</p>
                    <div className="flex gap-4">
                        <a href="#" className="border-2 border-white p-2 rounded-full hover:bg-white hover:text-green-800 transition-colors">
                            <FaTiktok size={20} />
                        </a>
                        <a href="#" className="border-2 border-white p-2 rounded-full hover:bg-white hover:text-green-800 transition-colors">
                            <FaFacebookF size={20} />
                        </a>
                        <a href="#" className="border-2 border-white p-2 rounded-full hover:bg-white hover:text-green-800 transition-colors">
                            <FaInstagram size={20} />
                        </a>
                    </div>
                </div>
            </div>

            <hr className="my-8 border-white" />

            <div className="max-w-7xl mx-auto text-center text-sm md:text-base">
                <p>© 2025 <strong>Transfer Cash, S.A.C.</strong> - Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}
