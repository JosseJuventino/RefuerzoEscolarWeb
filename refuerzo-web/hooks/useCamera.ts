import { useCallback, useRef } from "react";

export const useCamera = (isMobile: boolean) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isMobile ? "environment" : "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = null; // Limpia el srcObject
        videoRef.current.srcObject = stream; // Asigna el nuevo stream
        await videoRef.current.play();
      }
      return true;
    } catch (error) {
      console.error("Error al iniciar cámara:", error);
      return false;
    }
  }, [isMobile]);
    
  const stopCamera = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, []);

  return { videoRef, startCamera, stopCamera };
};
