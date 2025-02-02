export const base64ToFile = (base64: string, filename: string): File => {
    const mimeType = base64.split(';')[0].split(':')[1];
    
    const extension = mimeType.split('/')[1];
    
    const finalFilename = `${filename.split('.')[0]}.${extension}`;

    const byteCharacters = atob(base64.split(',')[1]);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: mimeType });
    return new File([blob], finalFilename, { type: mimeType });
};