export const getImageFormat = (dataUrl: string): string => {
  const match = dataUrl.match(/^data:image\/(\w+);base64,/);
  if (!match) return 'JPEG';
  
  // Normalize format names for jsPDF
  const format = match[1].toUpperCase();
  switch (format) {
    case 'JPG':
    case 'JPEG':
      return 'JPEG';
    case 'PNG':
      return 'PNG';
    default:
      return 'JPEG';
  }
};

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

export const optimizeImage = (canvas: HTMLCanvasElement): string => {
  const maxDimension = 2000; // Maximum dimension for reasonable file size
  const { width, height } = canvas;
  
  if (width > maxDimension || height > maxDimension) {
    const ratio = Math.min(maxDimension / width, maxDimension / height);
    const newWidth = Math.floor(width * ratio);
    const newHeight = Math.floor(height * ratio);
    
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = newWidth;
    resizedCanvas.height = newHeight;
    
    const ctx = resizedCanvas.getContext('2d');
    if (!ctx) return canvas.toDataURL('image/jpeg', 1.0);
    
    // Use better image scaling algorithm
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
    
    // Use maximum quality for the output
    return resizedCanvas.toDataURL('image/jpeg', 1.0);
  }
  
  // Use maximum quality for the output
  return canvas.toDataURL('image/jpeg', 1.0);
}