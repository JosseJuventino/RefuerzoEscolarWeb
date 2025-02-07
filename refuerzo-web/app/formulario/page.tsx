"use client";

import { Header } from "@/components/Form/FormHeader";
import { ImagePreview } from "@/components/Auth/ImagePreview";
import { useRouter } from "next/navigation";
import { CameraPreview } from "@/components/Auth/CameraPreview";
import { useEffect, useState, useRef } from "react";
import { UploadButton } from "@/components/Fields/UploadButton";
import InputField from "@/components/Fields/InputFieldValidate";
import { useCamera } from "@/hooks/useCamera";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPrograms } from "@/services/programs.service";
import { getGrades } from "@/services/grades.service";
import SelectField from "@/components/Fields/SelectField";
import {useForm, SubmitHandler,} from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { AuthService } from "@/services/auth.service";
import { Loading } from "@/components/Loading";
import { Grade, Program } from "@/types/types";

interface FormValues {
    fullName: string;
    email: string;
    dob: string;
    currentSchool: string;
    phoneNumber: string;
    grade: string;
    program: string;
}


export default function RegistrationForm() {
    const router = useRouter();

    const [isChecking, setIsChecking] = useState<boolean>(true);
    const [preview, setPreview] = useState<string | null>(null);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        trigger,
    } = useForm<FormValues>({
        defaultValues: {
            fullName: "",
            email: "",
            dob: "",
            currentSchool: "",
            phoneNumber: "",
            grade: "",
            program: "",
        },
    });

    const { data: programs } = useQuery<Program[], Error>({
        queryKey: ["programas"],
        queryFn: getPrograms,
      });
      
      const { data: grades } = useQuery<Grade[], Error>({
        queryKey: ["grados"],
        queryFn: getGrades,
      });
    const formData = useRef({
        imagen: "",
    });

    const { cameraActive, startCamera, stopCamera, videoRef, canvasRef, handleTakePhoto, handleFileChange, handleRetakePhoto } = useCamera(isMobile, setPreview, formData);

    useEffect(() => {
        const checkAuth = async () => {
            const isAuthenticated = await AuthService.checkAuth();
            if (!isAuthenticated) {
                router.push("/");
            } else {
                setIsChecking(false);
            }
        };
        checkAuth();
    }, [router]);

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {
            console.log(data);
            toast.success("Formulario enviado con éxito!");
        } catch {
            toast.error("Error al enviar el formulario");
        }
    };

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            Object.values(errors).forEach((error) => {
                toast.error(error?.message || "Error de validación");
            });
        }
    }, [errors]);


    if (isChecking) {
        return <Loading />;
    }

    const gradeOptions = grades?.map((grade) => ({
        value: grade._id,
        label: grade.nombre,
    })) || [];
      
    const programOptions = programs?.map((program) => ({
        value: program._id,
        label: program.nombre,
    })) || [];

    return (
        <main className="w-full h-full bg-gray-50">
            <Toaster position="top-right" />
            <div className="max-w-[600px] mx-auto p-8 md:p-4">
                <Header />

                <div className="p-8 md:p-4">
                    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex justify-center">
                            {preview ? (
                                <ImagePreview preview={preview} setPreview={setPreview} formData={formData} handleRetakePhoto={handleRetakePhoto} />
                            ) : cameraActive ? (
                                <CameraPreview videoRef={videoRef} fileInputRef={fileInputRef} isMobile={isMobile} handleFileChange={handleFileChange} handleTakePhoto={handleTakePhoto} stopCamera={stopCamera} />
                            ) : (
                                <UploadButton fileInputRef={fileInputRef} startCamera={startCamera} isMobile={isMobile} handleFileChange={handleFileChange} />
                            )}

                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                        <InputField
                            label="Nombre Completo"
                            id="fullName"
                            placeholder="Ingrese su nombre completo"
                            register={register}
                            validation={{
                                required: "El nombre completo es requerido",
                                minLength: {
                                    value: 5,
                                    message: "Mínimo 5 caracteres",
                                },
                            }}
                            trigger={trigger}
                            error={errors.fullName?.message}
                        />



                        <InputField
                            label="Correo Electrónico"
                            id="email"
                            type="email"
                            placeholder="Ingrese su correo electrónico"
                            register={register}
                            validation={{
                                required: "El correo electrónico es requerido",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Correo electrónico inválido",
                                },
                            }}
                            trigger={trigger}
                            error={errors.email?.message}
                        />

                        <InputField
                            label="Fecha de Nacimiento"
                            id="dob"
                            type="date"
                            register={register}
                            validation={{
                                required: "Debes seleccionar un programa",
                                validate: value => value !== "" || "Selecciona una opción válida"
                            }}
                            trigger={trigger}
                            error={errors.dob?.message}
                        />

                        <InputField
                            label="Escuela Actual"
                            id="currentSchool"
                            placeholder="Ingrese el nombre de su escuela actual"
                            register={register}
                            validation={{
                                required: "La escuela actual es requerida",
                            }}
                            trigger={trigger}
                            error={errors.currentSchool?.message}
                        />

                        <InputField
                            label="Número de contacto"
                            id="phoneNumber"
                            type="tel"
                            placeholder="Ingrese su número de contacto"
                            register={register}
                            validation={{
                                required: "El número de contacto es requerido",
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: "Número inválido (10 dígitos requeridos)",
                                },
                            }}
                            trigger={trigger}
                            error={errors.phoneNumber?.message}
                        />

                        <SelectField
                            label="Grado"
                            id="grade"
                            register={register}
                            options={gradeOptions} 
                            validation={{
                                required: "Debes seleccionar un grado",
                            }}
                            error={errors.grade?.message}
                            trigger={trigger}
                        />

                        <SelectField
                            label="Programa"
                            id="program"
                            register={register}
                            options={programOptions} 
                            validation={{
                                required: "Debes seleccionar un programa",
                            }}
                            error={errors.program?.message}
                            trigger={trigger}
                        />

                        <div className="flex justify-center pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#003C71] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#00509E] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Enviando..." : "Enviar Aplicación"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}