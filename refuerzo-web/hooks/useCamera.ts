import { useCallback, useRef } from "react";
import { useState } from "react";
import { toast } from "@pheralb/toast";

export const useCamera = (
  isMobile: boolean,
  setPreview: React.Dispatch<React.SetStateAction<string | null>>,
  formData: React.MutableRefObject<{ imagen: string }>
) => {
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }

    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (isMobile) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment";
      input.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        handleFileChange({ target } as React.ChangeEvent<HTMLInputElement>);
      };
      input.click();
    } else {
      try {
        setCameraActive(true);
        abortControllerRef.current = new AbortController();

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: isMobile ? "environment" : "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        mediaStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (error) {
        console.error("Error al iniciar cámara:", error);
        setCameraActive(false);
        stopCamera();
      }
    }
  }, [isMobile, stopCamera]);

  const handleTakePhoto = useCallback(() => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL("image/png");
        setPreview(dataUrl);
        formData.current.imagen = dataUrl;
        stopCamera();
      }
    }
  }, [stopCamera]);

  const handleRetakePhoto = useCallback(() => {
    setPreview(null);
    formData.current.imagen = "";
    startCamera();
  }, [startCamera]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error({ text: "El archivo seleccionado no es una imagen" });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        formData.current.imagen = reader.result as string;
        stopCamera();
      };
      reader.readAsDataURL(file);
    },
    [stopCamera]
  );

  return {
    cameraActive,
    startCamera,
    stopCamera,
    handleTakePhoto,
    videoRef,
    canvasRef,
    handleRetakePhoto,
    handleFileChange,
  };
};
