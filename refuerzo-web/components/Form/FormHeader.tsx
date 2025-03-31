import Image from "next/image";

export const Header = () => (
    <div className="text-center mb-4">
        <Image
            src="/Logov3.svg"
            alt="Logo"
            className="w-24 mx-auto mb-2"
            width={300}
            height={300}
            quality={100}
        />
        <h1 className="text-[28px] font-semibold text-[#003C71] mb-2">
            Formulario de Inscripción
        </h1>
        <p className="text-base text-gray-600">
            Por favor, complete el formulario a continuación para aplicar a nuestro
            programa académico.
        </p>
    </div>
);