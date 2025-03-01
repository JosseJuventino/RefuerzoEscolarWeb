"use client";

import React, { useState, useRef, useEffect } from "react";
import { FileText, X, Plus, Image as ImageIcon, File as FileIcon } from "lucide-react";
import type { FileNew } from "@/types/types";

type FileItem =
  | { type: "file"; file: File; preview: string }
  | { type: "new"; fileNew: Partial<FileNew> };

interface MultiFileSelectorProps {
  initialFiles?: Partial<FileNew>[];
  setFiles?: (files: (File | Partial<FileNew>)[]) => void;
}

const MAX_FILES = 5;

export const MultiFileSelector: React.FC<MultiFileSelectorProps> = ({
  initialFiles = [],
  setFiles,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    if (initialFiles.length > 0) {
      const initialFileItems: FileItem[] = initialFiles.map((file) => ({
        type: "new",
        fileNew: file,
      }));
      setSelectedFiles(initialFileItems);
    }
  }, [initialFiles]);

  useEffect(() => {
    if (setFiles) {
      const transformedFiles = selectedFiles.map((item) =>
        item.type === "file" ? item.file : item.fileNew
      );
      setFiles(transformedFiles);
    }
  }, [selectedFiles, setFiles]);

  const validateFileType = (file: File): boolean => {
    return (
      file.type.startsWith("image/") ||
      file.type === "application/pdf" ||
      file.type === "application/msword" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const filesList = e.target.files;
    if (!filesList) return;

    setSelectedFiles((prevFiles) => {
      const availableSlots = MAX_FILES - prevFiles.length;
      const newFileItems: FileItem[] = [];

      Array.from(filesList).forEach((file) => {
        if (newFileItems.length >= availableSlots) return;
        if (!validateFileType(file)) return;
        const preview = URL.createObjectURL(file);
        newFileItems.push({ type: "file", file, preview });
      });

      return [...prevFiles, ...newFileItems];
    });

    e.target.value = "";
  };

  const removeItem = (index: number): void => {
    setSelectedFiles((prevFiles) => {
      const fileToRemove = prevFiles[index];
      if (fileToRemove && fileToRemove.type === "file") {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prevFiles.filter((_, i) => i !== index);
    });
  };

  const isImageFile = (item: FileItem): boolean => {
    if (item.type === "file") {
      return item.file.type.startsWith("image/");
    }
    if (item.type === "new" && item.fileNew.originalFileName) {
      return /\.(png|jpe?g|gif|bmp|webp)$/i.test(item.fileNew.originalFileName);
    }
    return false;
  };

  const selectedFilesRef = useRef<FileItem[]>(selectedFiles);
  useEffect(() => {
    selectedFilesRef.current = selectedFiles;
  }, [selectedFiles]);

  useEffect(() => {
    return () => {
      selectedFilesRef.current.forEach((item) => {
        if (item.type === "file") {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []);

  return (
    <div className="space-y-3">
      {/* Botón e input para seleccionar archivos */}
      <div className="flex gap-2">
        <label className="block text-medium text-blue_principal font-medium">
          Archivos adjuntos
        </label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          multiple
          accept="image/png, image/jpg, .pdf, .doc, .docx, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
        />
      </div>

      {selectedFiles.length === 0 ? (
        <div
          className="space-y-1 cursor-pointer border border-gray-200 rounded-md p-4"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileText className="w-5 h-5 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-500 text-center">
            Seleccione un máximo de {MAX_FILES} archivos
          </p>
          <p className="text-sm text-gray-500 text-center">PDF, DOCX, JPG, PNG</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 items-center">
          {selectedFiles.map((item, index) => (
            <a
              key={index}
              onClick={(e) => e.stopPropagation()}
              href={item.type === "new" ? item.fileNew.url : item.preview}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group flex flex-col items-center justify-center gap-2 border border-gray-200 rounded-md p-2 min-h-[80px]"
            >
              {isImageFile(item) ? (
                <ImageIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <FileIcon className="w-5 h-5 text-gray-400" />
              )}
              <p className="text-xs line-clamp-1">
                {item.type === "new" ? item.fileNew.originalFileName : item.file.name}
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeItem(index);
                }}
                type="button"
                className="absolute top-1 right-1 text-gray-600 hover:text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </a>
          ))}
          {selectedFiles.length < MAX_FILES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative group flex flex-col items-center justify-center gap-2 border border-gray-200 rounded-md p-2 min-h-[80px] cursor-pointer hover:bg-gray-200"
            >
              <Plus className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiFileSelector;
