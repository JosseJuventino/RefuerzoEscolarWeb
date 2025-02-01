
import { UploadCloud, Camera } from "lucide-react";

interface CameraPreviewProps {
    videoRef: React.RefObject<HTMLVideoElement>;
    fileInputRef: React.RefObject<HTMLInputElement>;
    isMobile: boolean;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleTakePhoto: () => void;
    stopCamera: () => void;
}


export const CameraPreview = ({ videoRef, fileInputRef, isMobile, handleFileChange, handleTakePhoto, stopCamera }: CameraPreviewProps) => (
    <div className="relative w-full max-w-md mx-auto mb-4">
        <video
            ref={videoRef}
            className="w-full h-64 rounded-xl object-cover border-4 border-white shadow-lg bg-gray-100"
            muted
            playsInline
            autoPlay
            style={{ transform: isMobile ? 'none' : 'scaleX(-1)' }}
        />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
                capture={isMobile ? "environment" : undefined}
            />
            <button
                onClick={() => {
                    stopCamera();
                    setTimeout(() => {
                        fileInputRef.current?.click();
                    }, 100);
                }}
                className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
                <UploadCloud className="w-6 h-6 text-gray-700" />
            </button>
            <button
                onClick={handleTakePhoto}
                className="p-3 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
            >
                <Camera className="w-6 h-6 text-white" />
            </button>
        </div>
    </div>
);

