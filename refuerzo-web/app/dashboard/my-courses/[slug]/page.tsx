"use client";
import {
  FileText,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Settings,
  Edit2Icon,
  Trash2,
  ImageIcon,
  File as FileIcon,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Course, Image as ImageFile, Publicacion } from "@/types/types";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { updateCourse } from "@/services/courses.service";
import { CourseConfigModal } from "@/components/Popups/CourseConfigModal";
import { uploadImage } from "@/services/images.service";
import { useContext } from "react";
import { CourseContext } from "@/app/contexts/course-context";
import { AddPublicationModal } from "@/components/Popups/AddPublicationModal";
import { deletePublication } from "@/services/publish.service";
import { DeleteModal } from "@/components/Popups/DeleteModal";
import { RoleGuard } from "@/components/RoleGuard";
import { ROLES } from "@/app/constants/roles";
import { toast } from "@pheralb/toast";
import Image from 'next/image';

export default function Tablon() {
  const [openId, setOpenId] = useState<string | null>(null);
  const course = useContext(CourseContext);

  const [modalState, setModalState] = useState<{
    type: "add" | "edit" | "delete" | null;
    selected: Course | null;
  }>({ type: null, selected: null });

  const [modalStatePublication, setModalStatePublication] = useState<{
    type: "add" | "edit" | "delete" | null;
    selected: Publicacion | null;
  }>({ type: null, selected: null });

  const queryClient = useQueryClient();

  const updateCourseMutation = useMutation({
    mutationFn: updateCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["course", course?.slug],
      });
    },
  });

  const deletePublicationMutation = useMutation({
    mutationFn: deletePublication,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["course", course?.slug],
      });
    },
  });

  const handleDelete = async () => {
    if (!modalStatePublication.selected) return;
    await deletePublicationMutation.mutateAsync(
      modalStatePublication.selected._id
    );
    closeModal();
  };

  const uploadImageMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["image"] });
    },
  });

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const getIconByMessage = (message: string) => {
    if (message.includes("anuncio")) {
      return <ClipboardList className="text-beige_secondary w-6 h-6" />;
    }
    if (message.includes("material de apoyo")) {
      return <FileText className="text-blue_principal w-6 h-6" />;
    }
    return null;
  };

  const closeModal = () => {
    setModalState({ type: null, selected: null });
    setModalStatePublication({ type: null, selected: null });
  };

  const handleEdit = async (updated: Course, image: File | string | null) => {
    const updateData: Partial<Course> = { _id: updated._id };

    try {
      let imageUploadPromise: Promise<void> = Promise.resolve();

      if (image instanceof File) {
        if (!image.type.startsWith("image/")) {
          throw new Error("Solo se permiten imágenes");
        }

        if (image.size > 5 * 1024 * 1024) {
          throw new Error("Tamaño máximo de imagen: 5MB");
        }

        const imagen: ImageFile = {
          originalFilename: image.name,
          category: "section_images",
          file: image,
        };

        imageUploadPromise = uploadImageMutation
          .mutateAsync(imagen)
          .then((response) => {
            updateData.backgroundImage = response.data.url;
          });
      } else if (typeof image === "string") {
        updateData.backgroundImage = image;
      }

      const finalPromise = imageUploadPromise.then(async () => {
        updateData.nombre = updated.nombre;
        updateData.encargados = updated.encargados;
        console.log("updateData", updateData);
        const response = updateCourseMutation.mutateAsync(updateData);
        console.log("response", response);
        return response;
      });

      console.log("finalPromise", finalPromise);

      toast.loading({
        text: "Actualizando curso...",
        options: {
          promise: finalPromise,
          success: "Curso actualizado exitosamente 🎉",
          error: "Error al actualizar el curso",
          autoDismiss: true,
          onSuccess: () => {
            closeModal();
            queryClient.invalidateQueries({ queryKey: ["cursos"] });
          },
          onError: (error) => {
            console.error("Detalles del error:", error);
          },
        },
      });
    } catch (error) {
      console.log(error);
      toast.error({
        text: "Error de validación",
        description: "Ha ocurrido un error al ingresar el curso",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden rounded-b-2xl">
        <div className="absolute inset-0">
          <Image
            src={course?.backgroundImage || "/placeholder-course.jpg"}
            alt={course?.nombre || "Course image"}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <RoleGuard
            allowedRoles={[ROLES.ADMIN, ROLES.PROFESOR, ROLES.TUTOR]}
          >
            <button
              onClick={() =>
                setModalState({ type: "edit", selected: course || null })
              }
              className="absolute top-2 sm:top-4 right-2 sm:right-4 outline-none flex items-center gap-2 bg-white text-blue_principal px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Editar</span>
            </button>
          </RoleGuard>

          <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8">
            <h1 className="text-xl sm:text-3xl md:text-5xl font-bold text-white mb-2 line-clamp-2">
              {course?.nombre}
            </h1>
          </div>
        </div>
      </div>

      <div className="md:pb-10 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center px-4 sm:px-6 lg:px-8 justify-between mb-4 sm:mb-8 md:mb-10 space-y-4 sm:space-y-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-blue_principal">
              Últimas publicaciones
            </h2>
            <span className="text-sm sm:text-base text-gray-500">
              {course?.publicaciones?.length} publicaciones
            </span>
          </div>

          <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.PROFESOR, ROLES.TUTOR]}>
            <button
              onClick={() => setModalStatePublication({ type: "add", selected: null })}
              className="inline-flex items-center gap-2 bg-blue_principal text-white px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Nueva publicación
            </button>
          </RoleGuard>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 space-y-4">
          {course &&
            course.publicaciones
              ?.slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((novedad) => (
                <div
                  key={novedad._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100/50"
                >
                  <div className="p-6 flex flex-wrap md:flex-nowrap items-start gap-5 cursor-pointer relative"
                    onClick={() => handleToggle(novedad._id)}>
                    <div className="sm:p-3.5 p-1 rounded-xl bg-blue_principal/10 shadow-inner flex-shrink-0">
                      {getIconByMessage(novedad.categoria)}
                    </div>
                    <div className="flex-1 min-w-[60%]">
                      <div className="flex flex-col md:flex-row gap-0 md:gap-3 mb-2">
                        <h3 className="md:text-xl text-sm font-semibold text-gray-900">
                          {novedad.titulo}
                        </h3>
                        <span className="text-sm text-gray-400 font-medium">
                          {formatRelativeTime(novedad.createdAt)}
                        </span>
                      </div>
                      <p
                        className={`text-gray-600 ${openId === novedad._id ? "" : "line-clamp-2"
                          } text-opacity-90 break-words pr-4`}
                      >
                        {novedad.descripcion || "Sin descripción disponible."}
                      </p>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-row gap-3 md:gap-5 items-center md:absolute md:right-6 md:top-6 ml-auto flex-shrink-0">
                      <RoleGuard
                        allowedRoles={[ROLES.ADMIN, ROLES.PROFESOR, ROLES.TUTOR]}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalStatePublication({
                              type: "edit",
                              selected: novedad || null,
                            });
                          }}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <Edit2Icon size={20} />
                        </button>
                      </RoleGuard>

                      <RoleGuard
                        allowedRoles={[ROLES.ADMIN, ROLES.PROFESOR, ROLES.TUTOR]}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalStatePublication({
                              type: "delete",
                              selected: novedad || null,
                            });
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </RoleGuard>

                      <div className="text-gray-400">
                        {openId === novedad._id ? (
                          <ChevronUp className="w-7 h-7" />
                        ) : (
                          <ChevronDown className="w-7 h-7" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sección de archivos (mantener igual) */}
                  {openId === novedad._id && (
                    <div className="px-8 pb-6 border-t border-gray-100/50">
                      <div className="sm:pl-16 pl-10 sm:pr-8 pr-10">
                        {novedad.files.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:mt-5">
                            {novedad.files.map((file, index) => (
                              <a
                                key={index}
                                href={`${file.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-4 md:px-5 py-1 md:py-3 bg-blue_principal/5 hover:bg-blue_principal/10 transition-colors rounded-xl border border-blue_principal/20 group w-full"
                              >
                                <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                                  {file.tipo === "documento" ? (
                                    <FileIcon className="w-5 h-5 md:w-6 md:h-6 text-blue_principal" />
                                  ) : (
                                    <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-blue_principal" />
                                  )}
                                </div>
                                <span className="text-sm font-medium text-gray-700 truncate break-all max-w-[180px] md:max-w-[240px] group-hover:text-blue_principal transition-colors">
                                  {file.originalFileName}
                                </span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm mt-4">
                            No hay archivos adjuntos
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
        </div>
      </div>
      <RoleGuard
        allowedRoles={[ROLES.ADMIN, ROLES.PROFESOR, ROLES.TUTOR]}
      >
        <CourseConfigModal
          isOpen={modalState.type === "edit"}
          title="Editar curso"
          initialData={modalState.selected!}
          onClose={closeModal}
          onSubmit={handleEdit}
        />
      </RoleGuard>

      <RoleGuard
        allowedRoles={[ROLES.ADMIN, ROLES.PROFESOR, ROLES.TUTOR]}
      >
        <AddPublicationModal
          isOpen={modalStatePublication.type === "add"}
          title="Agregar publicación"
          initialData={modalStatePublication.selected!}
          onClose={closeModal}
          courseId={course?._id}
          courseSlug={course?.slug}
        />
      </RoleGuard>

      <RoleGuard
        allowedRoles={[ROLES.ADMIN, ROLES.PROFESOR, ROLES.TUTOR]}
      >
        <AddPublicationModal
          isOpen={modalStatePublication.type === "edit"}
          title="Editar publicación"
          initialData={modalStatePublication.selected!}
          onClose={closeModal}
          courseId={course?._id}
          courseSlug={course?.slug}
        />
      </RoleGuard>

      <RoleGuard
        allowedRoles={[ROLES.ADMIN, ROLES.PROFESOR, ROLES.TUTOR]}
      >
        <DeleteModal<Publicacion>
          isOpen={modalStatePublication.type === "delete"}
          title="Eliminar publicación"
          item={modalStatePublication.selected!}
          onClose={closeModal}
          onConfirm={handleDelete}
          description={() => (
            <p>
              ¿Estás seguro de eliminar la publicación?
              <br />
              <span className="text-sm text-gray-500">
                Esta acción no se puede deshacer
              </span>
            </p>
          )}
        />
      </RoleGuard>
    </div>
  );
}
