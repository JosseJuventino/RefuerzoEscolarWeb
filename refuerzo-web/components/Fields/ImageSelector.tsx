"use client";
import { useState, useRef, useCallback } from "react";
import { ImageIcon, Link2, Upload, X } from "lucide-react";

interface ImageSelectorProps {
    initialPreview?: string;
    onImageChange: (file: File | string | null) => void;
}

export const ImageSelector = ({ initialPreview, onImageChange }: ImageSelectorProps) => {
    const [preview, setPreview] = useState<string>(initialPreview || "");
    const [file, setFile] = useState<File | null>(null);
    const [isUrlInput, setIsUrlInput] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handlers de drag and drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.type.startsWith('image/')) {
            handleFileSelect(droppedFile);
        }
    }, []);

    // Manejo de archivos
    const handleFileSelect = (selectedFile: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            setPreview(reader.result as string);
            setFile(selectedFile);
            setImageUrl("");
            onImageChange(selectedFile);
        };
        reader.readAsDataURL(selectedFile);
        setIsUrlInput(false);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const validateImageUrl = (url: string) =>
        /^https?:\/\/.+(\.(jpg|jpeg|png|gif|webp))($|\?)/i.test(url);

    const handleUrlSubmit = () => {
        if (!validateImageUrl(imageUrl)) return; // Añadir validación adicional
        
        setPreview(imageUrl);
        setFile(null);
        onImageChange(imageUrl);
        setImageUrl(""); 
    };

    const clearSelection = () => {
        setPreview("");
        setFile(null);
        setImageUrl("");
        onImageChange(null);
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => {
                        setIsUrlInput(false);
                    }}
                    className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1 ${!isUrlInput ? 'bg-blue_principal text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                >
                    <Upload size={14} /> Archivo
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setIsUrlInput(true);
                        setFile(null)
                    }}
                    className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1 ${isUrlInput ? 'bg-blue_principal text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                >
                    <Link2 size={14} /> URL
                </button>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    accept="image/*"
                    className="hidden"
                />
            </div>

            {!isUrlInput ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${isDragging ? 'border-blue_principal bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <div className="space-y-1">
                        <ImageIcon className="w-5 h-5 text-gray-400 mx-auto" />
                        <p className="text-xs text-gray-500">
                            {isDragging ? "Suelta la imagen" : "Arrastra o haz clic"}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex gap-2">
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        className="w-full px-3 outline-none py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-blue_principal"
                    />
                    <button
                        type="button"
                        onClick={handleUrlSubmit}
                        className="px-3 py-1.5 cursor-pointer text-sm bg-blue_principal text-white rounded-md hover:bg-blue-600"
                        disabled={!validateImageUrl(imageUrl)}
                    >
                        Usar
                    </button>
                </div>
            )}

            {preview && (
                <div className="relative mt-2 flex flex-row justify-start gap-5 items-center">
                    <div className="group relative rounded-md overflow-hidden border">
                        <img
                            src={initialPreview !== "" ? initialPreview : preview}
                            alt="Vista previa"
                            className="h-10 w-10 object-cover"
                        />

                    </div>
                    <p className="text-xs text-gray-500  truncate">
                        {file ? file.name : "Imagen desde URL"}
                    </p>
                    <button
                        type="button"
                        onClick={clearSelection}
                        className=" text-red-600 rounded-full hover:text-red-700"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};