import RectanguloLayout from '@/Components/AppNative/RectanguloLayout';
import LogoConVideo from '@/Components/AppNative/LogoConVideo';
import { Head } from '@inertiajs/react';
import InicioLayout from '@/Layouts/Inicio/InicioLayout';

export default function AppNative() {
    return (
        <>
            <Head title='Transfer-Cash APP' />
            <RectanguloLayout background="bg-gray-900 border-b border-yellow-400">
                <LogoConVideo
                    logoSrc="https://res.cloudinary.com/dnbklbswg/image/upload/v1772202747/logo_n6nqqr__2_-removebg-preview_qngiau.png"
                    videoSrc="https://res.cloudinary.com/dnbklbswg/video/upload/v1785184234/Tranfercash_Video_Resumen_zhttc0.mp4"
                >

                    <p className="text-2xl text-white font-extrabold sm:text-xl md:text-5xl font-montserrat  leading-snug sm:leading-tight max-w-[600px] mx-auto">
                        Descarga Nuestra App <br />
                        <span className="text-yellow-400">De manera Gratuita</span><br />
                    </p>

                </LogoConVideo>
            </RectanguloLayout>
     </>


    );


}