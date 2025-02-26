"use client"
import { FileText, ClipboardList, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { useState } from 'react';
import { FaRegFilePdf } from "react-icons/fa6";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Course, Image, Publicacion } from '@/types/types';
import { formatRelativeTime } from '@/utils/formatRelativeTime';
import { updateCourse } from '@/services/courses.service';

import { CourseConfigModal } from '@/components/Popups/CourseConfigModal';
import { uploadImage } from '@/services/images.service';
import { useContext } from 'react';
import { CourseContext } from '@/app/contexts/course-context';
import { AddPublicationModal } from '@/components/Popups/AddPublicationModal';

export default function Tablon() {
  const [openId, setOpenId] = useState<number | null>(null);
  const course = useContext(CourseContext);

  const [modalState, setModalState] = useState<{
    type: 'add' | 'edit' | 'delete' | null;
    selected: Course | null;
  }>({ type: null, selected: null });

  const [modalStatePublication, setModalStatePublication] = useState<{
    type: 'add' | 'edit' | 'delete' | null;
    selected: Publicacion | null;
  }>({ type: null, selected: null });

  const queryClient = useQueryClient();

  const updateCourseMutation = useMutation({
    mutationFn: updateCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course', course?.slug],
      });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['image'] });
    },
  });


  const handleToggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const getIconByMessage = (message: string) => {
    if (message.includes('anuncio')) {
      return <ClipboardList className="text-beige_secondary w-6 h-6" />;
    }
    if (message.includes('guía')) {
      return <FileText className="text-blue_principal w-6 h-6" />;
    }
    return null;
  };

  const closeModal = () => {
    setModalState({ type: null, selected: null })
    setModalStatePublication({ type: null, selected: null })
  };


  const handleEdit = async (updated: Course, image: File | string | null) => {
    const updateData: Partial<Course> = { _id: updated._id };

    if (image instanceof File) {

      if (!image.type.startsWith("image/")) {
        throw new Error("Invalid file type. Only images are allowed.");
      }

      if (image.size > 5 * 1024 * 1024) {
        throw new Error("Image is too large. Maximum size allowed is 5MB.");
      }

      const imagen: Image = {
        originalFilename: image.name,
        category: "section_images",
        file: image
      };

      const response = await uploadImageMutation.mutateAsync(imagen);
      updateData.backgroundImage = response.data.url;

    } else if (typeof image === 'string') {
      updateData.backgroundImage = image
    }

    updateData.nombre = updated.nombre;

    await updateCourseMutation.mutateAsync(updateData);

    closeModal();
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative group h-72 rounded-2xl bg-center shadow-2xl overflow-hidden mb-10 transition-all duration-300">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${course?.backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
            <button
              onClick={() => setModalState({ type: 'edit', selected: course || null })}
              className="absolute top-4 right-4 outline-none flex items-center gap-2 bg-white text-blue_principal  px-4 py-2 rounded-lg "
            >
              <Settings className="w-5 h-5" />
            </button>

            <div className="absolute bottom-8 left-8">
              <h1 className="text-5xl font-bold text-white mb-2">{course?.nombre}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-10">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-blue_principal flex flex-col gap-1 relative">
            <span className="relative z-10">Últimas publicaciones</span>
            <span className="text-gray-500 text-sm">{course?.publicaciones?.length} publicaciones</span>
          </h2>

          <button onClick={() => setModalStatePublication({ type: 'add', selected: null })} className="text-blue_principal bg-white font-medium px-4 py-2 rounded-lg shadow transition-transform hover:scale-105">
            Agregar publicación
          </button>

        </div>

        <div className="space-y-8">
          {course?.publicaciones?.map((novedad) => (
            <div
              key={novedad.seccionId}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100/50"
            >
              <div
                className="p-6 flex items-start gap-5 cursor-pointer"
                onClick={() => handleToggle(novedad.id)}
              >
                <div className="p-3.5 rounded-xl bg-blue_principal/10 shadow-inner">
                  {getIconByMessage(novedad.categoria)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{novedad.titulo}</h3>
                    <span className="text-sm text-gray-400 font-medium">
                      {formatRelativeTime(course.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-2 text-opacity-90">
                    {novedad.descripcion || "Sin descripción disponible."}
                  </p>
                </div>

                <div className="text-gray-400 pt-1.5">
                  {openId === novedad.id ? (
                    <ChevronUp className="w-7 h-7" />
                  ) : (
                    <ChevronDown className="w-7 h-7" />
                  )}
                </div>
              </div>

              {openId === novedad.id && (
                <div className="px-8 pb-6 pt-3 border-t border-gray-100/50">
                  <div className="pl-16">
                    {novedad.files.length > 0 ? (
                      <div className="flex flex-wrap gap-4 mt-5">
                        {novedad.files.map((file, index) => (
                          <a
                            key={index}
                            href={`${file.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-5 py-3 bg-blue_principal/5 hover:bg-blue_principal/10 transition-colors rounded-xl border border-blue_principal/20 group"
                          >
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <FaRegFilePdf className="w-6 h-6 text-blue_principal" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 truncate max-w-xs group-hover:text-blue_principal transition-colors">
                              {file.originalFileName}
                            </span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm mt-4">No hay archivos adjuntos</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <CourseConfigModal
        isOpen={modalState.type === 'edit'}
        title="Editar curso"
        initialData={modalState.selected!}
        onClose={closeModal}
        onSubmit={handleEdit}
      />

      <AddPublicationModal
        isOpen={modalStatePublication.type === 'add'}
        title="Agregar publicación"
        initialData={modalStatePublication.selected!}
        onClose={closeModal}
      />


    </div>
  );
}