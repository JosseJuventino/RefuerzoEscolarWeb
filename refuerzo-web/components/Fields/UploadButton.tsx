import { UploadCloud, Camera } from "lucide-react";

interface UploadButtonProps {
    isMobile: boolean;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    startCamera: () => void;
}

export const UploadButton = ({isMobile, fileInputRef, handleFileChange, startCamera}: UploadButtonProps) => (
    <div className="space-y-4">
        <label className="group flex flex-col items-center cursor-pointer">
            <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-50 transition-colors">
                <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <span className="mt-4 text-sm text-gray-500 group-hover:text-blue-500 transition-colors">
                {isMobile ? "Tomar o subir foto" : "Subir imagen"}
            </span>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
            />
        </label>

        <button
            onClick={startCamera}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
        >
            <Camera className="w-5 h-5" />
            Activar Cámara
        </button>
    </div>
);