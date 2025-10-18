import RectanguloLayout from '@/Components/AppNative/RectanguloLayout';
import LogoConVideo from '@/Components/AppNative/LogoConVideo';
import { Head } from '@inertiajs/react';

export default function AppNative() 
{
return (
    <>
     <Head title='Transfer-Cash APP'/>
 
            <RectanguloLayout background="#ffffff">
                <LogoConVideo
                    logoSrc="https://res.cloudinary.com/dnbklbswg/image/upload/v1756305635/logo_n6nqqr.jpg"
                    videoSrc="https://res.cloudinary.com/dqemzxnqj/video/upload/v1760799045/Video_de_WhatsApp_2025-10-18_a_las_10.50.10_24e89e79_dsnmkj.mp4"
                >
                   
                    <p className="text-2xl text-black font-extrabold sm:text-xl md:text-5xl font-montserrat  leading-snug sm:leading-tight max-w-[600px] mx-auto">
                        Descarga Nuestra App <br />
                        De manera Gratuita<br />
                    </p>

                </LogoConVideo>
            </RectanguloLayout>  
    
    </>
          
);


}