import { X, Camera} from "lucide-react";


interface ImagePreviewProps {
    preview: string | null;
    setPreview: React.Dispatch<React.SetStateAction<string | null>>;
    formData: React.MutableRefObject<{ imagen: string }>;
    handleRetakePhoto: () => void;
}

export const ImagePreview = ({ preview, setPreview, formData, handleRetakePhoto }: ImagePreviewProps) => (
    <div className="relative w-32 h-32 mx-auto">
        <img
            src={preview!}
            alt="Preview"
            className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
        />
        <div className="absolute -top-1 -right-1 flex gap-1">
            <button
                onClick={handleRetakePhoto}
                className="p-1 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors shadow-sm"
            >
                <Camera className="w-4 h-4 text-white" />
            </button>
            <button
                onClick={() => {
                    setPreview(null);
                    formData.current.imagen = "";
                }}
                className="p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors shadow-sm"
            >
                <X className="w-4 h-4 text-white" />
            </button>
        </div>
    </div>
);
