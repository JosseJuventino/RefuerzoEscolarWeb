"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { FileText, Upload, X } from "lucide-react";

interface MultiFileSelectorProps {
    initialFiles?: Array<File | { url: string; originalFileName: string }>;
    onFilesChange: (files: Array<File | string>) => void;
  }
  
interface SelectedItem {
  file?: File;
  preview: string;
  name: string;
}

export const MultiFileSelector: React.FC<MultiFileSelectorProps> = ({
  initialFiles = [],
  onFilesChange,
}) => {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILES = 5;

  useEffect(() => {
    if (initialFiles.length > 0) {
      const items = initialFiles.slice(0, MAX_FILES).map((item) => {
        if (item instanceof File) {
          const blobUrl = URL.createObjectURL(item);
          return { file: item, preview: blobUrl, name: item.name };
        } else {
          return { 
            preview: item.url, 
            name: item.originalFileName 
          };
        }
      });
      setSelectedItems(items);
    }
  }, [initialFiles]);

  // Cada vez que cambia la selección se notifica al padre
  useEffect(() => {
    onFilesChange(
      selectedItems.map((item) => (item.file ? item.file : item.preview))
    );
  }, [selectedItems, onFilesChange]);

  // Validar si el archivo es de imagen o documento (pdf, doc, docx)
  const validateFileType = (file: File) => {
    return (
      file.type.startsWith("image/") ||
      file.type === "application/pdf" ||
      file.type === "application/msword" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  };

  // Agrega un archivo a la selección si no se excede el límite
  const addFileItem = (selectedFile: File) => {
    if (selectedItems.length >= MAX_FILES) return;
    if (!validateFileType(selectedFile)) return;
    const blobUrl = URL.createObjectURL(selectedFile);
    const newItem: SelectedItem = {
      file: selectedFile,
      preview: blobUrl,
      name: selectedFile.name,
    };
    setSelectedItems((prev) => [...prev, newItem]);
  };

  // Manejo del input de archivos (múltiples)
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (selectedItems.length < MAX_FILES) {
          addFileItem(file);
        }
      });
    }
  };

  // Drag & Drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files) {
        Array.from(files).forEach((file) => {
          if (selectedItems.length < MAX_FILES) {
            addFileItem(file);
          }
        });
      }
    },
    [selectedItems]
  );

  const removeItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-3">
      {/* Botón para seleccionar archivos */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 text-sm rounded-md flex items-center gap-1 bg-blue_principal text-white"
        >
          <Upload size={14} /> Archivo
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          multiple
          accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
        />
      </div>

      {/* Área de drag & drop o click para seleccionar archivos */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-blue_principal bg-blue-50"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="space-y-1">
          <FileText className="w-5 h-5 text-gray-400 mx-auto" />
          <p className="text-xs text-gray-500">
            {isDragging
              ? "Suelta el archivo"
              : "Arrastra o haz clic para seleccionar archivos"}
          </p>
        </div>
      </div>

      {/* Vista previa de los archivos seleccionados */}
      {selectedItems.length > 0 && (
        <div className="space-y-2 mt-2">
          {selectedItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <a
                href={item.preview}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {item.name}
              </a>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-600 rounded-full hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedItems.length >= MAX_FILES && (
        <p className="text-xs text-red-600">
          Se ha alcanzado el límite máximo de {MAX_FILES} archivos.
        </p>
      )}
    </div>
  );
};

export default MultiFileSelector;
