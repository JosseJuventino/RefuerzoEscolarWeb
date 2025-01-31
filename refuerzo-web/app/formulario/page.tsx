import Image from "next/image"

export default function Formulario() {
    return (
        <main className="w-full h-full bg-gray-50">
            <div className="max-w-[600px] mx-auto p-8 md:p-4">
                <div className="text-center mb-4">
                    <Image 
                        src="/LogoColorido.svg" 
                        alt="Logo" 
                        className="w-24 mx-auto mb-2"
                        width={96}
                        height={96}
                    />
                    <h1 className="text-[28px] font-semibold text-[#003C71] mb-2">
                        Formulario de Inscripción 
                    </h1>
                    <p className="text-base text-gray-600">
                        Por favor, complete el formulario a continuación para aplicar a nuestro programa académico.
                    </p>
                </div>

                <div className="p-8 md:p-4 ">
                    <form className="space-y-4">
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-semibold text-[#003C71]">Nombre Completo</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                className="p-2 border border-gray-300 rounded-lg focus:border-[#003C71] focus:ring-2 focus:ring-[#00509E]/20 outline-none"
                                placeholder="Ingrese su nombre completo"
                                required
                            />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-semibold text-[#003C71]">Correo Electrónico</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="p-2 border border-gray-300 rounded-lg focus:border-[#003C71] focus:ring-2 focus:ring-[#00509E]/20 outline-none"
                                placeholder="Ingrese su correo electrónico"
                                required
                            />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-semibold text-[#003C71]">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                id="dob"
                                name="dob"
                                className="p-2 border border-gray-300 rounded-lg focus:border-[#003C71] focus:ring-2 focus:ring-[#00509E]/20 outline-none"
                                placeholder="dd/mm/aaaa"
                                required
                            />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-semibold text-[#003C71]">Escuela Actual</label>
                            <input
                                type="text"
                                id="currentSchool"
                                name="currentSchool"
                                className="p-2 border border-gray-300 rounded-lg focus:border-[#003C71] focus:ring-2 focus:ring-[#00509E]/20 outline-none"
                                placeholder="Ingrese el nombre de su escuela actual"
                                required
                            />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-semibold text-[#003C71]">Grado</label>
                            <select
                                id="desiredProgram"
                                name="desiredProgram"
                                className="p-2 border border-gray-300 rounded-lg focus:border-[#003C71] focus:ring-2 focus:ring-[#00509E]/20 outline-none appearance-none"
                                required
                                defaultValue={"default"}
                            >
                                <option value="default" disabled >Seleccione un grado</option>
                                <option value="1">7º grado</option>
                                <option value="2">8º grado</option>
                                <option value="3">9º grado</option>
                                <option value="4">Primer año bachillerato</option>
                                <option value="5">Segundo año bachillerato</option>
                                <option value="6">Tercer año bachillerato</option>
                            </select>
                        </div>

                        <div className="flex justify-center pt-4">
                            <button
                                type="submit"
                                className="bg-[#003C71] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#00509E] transition-colors duration-300"
                            >
                                Enviar Aplicación
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    )
}