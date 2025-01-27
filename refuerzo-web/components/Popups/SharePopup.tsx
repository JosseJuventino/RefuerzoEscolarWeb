import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, X } from 'lucide-react';

interface SharePopupProps {
  formUrl: string;
  onClose: () => void;
}

const SharePopup: React.FC<SharePopupProps> = ({ formUrl, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white py-10 px-8 rounded-lg shadow-md flex items-center space-x-6 max-w-2xl w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 focus:outline-none"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <div className="p-0">
          <QRCodeSVG value={formUrl} size={200} />
        </div>

        <div className="flex-grow space-y-4">
          <h2 className="text-xl font-bold">Compartir Formulario</h2>
          <p>
            Puedes compartir este formulario con el siguiente enlace o escaneando el código QR.
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={formUrl}
              readOnly
              className="flex-grow border border-gray-300 rounded-lg p-2"
            />
            <button
              onClick={handleCopyUrl}
              className="bg-blue_principal text-white p-2 rounded-lg transition"
              aria-label="Copiar URL"
            >
              <Copy size={24} />
            </button>
          </div>
          {copied ? (
            <p className="text-blue_principal font-bold text-sm" style={{ visibility: 'visible' }}>¡URL copiada!</p>
          ) : (
            <p className="text-blue_principal font-bold text-sm" style={{ visibility: 'hidden' }}>¡URL copiada!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharePopup;