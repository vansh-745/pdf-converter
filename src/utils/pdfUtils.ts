import { jsPDF } from 'jspdf';
import { getImageFormat } from './imageUtils';

export const generatePDF = async (imageDataUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        // Create PDF with proper orientation
        const orientation = img.width > img.height ? 'landscape' : 'portrait';
        const pdf = new jsPDF({
          orientation,
          unit: 'px',
          format: 'a4',
          compress: true
        });

        // Get page dimensions
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Calculate scaling to fit the page while maintaining aspect ratio
        const imgAspectRatio = img.width / img.height;
        const pageAspectRatio = pageWidth / pageHeight;

        let finalWidth = pageWidth;
        let finalHeight = finalWidth / imgAspectRatio;

        if (finalHeight > pageHeight) {
          finalHeight = pageHeight;
          finalWidth = finalHeight * imgAspectRatio;
        }

        // Center the image
        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;

        // Add the image with proper settings
        pdf.addImage({
          imageData: imageDataUrl,
          format: getImageFormat(imageDataUrl),
          x,
          y,
          width: finalWidth,
          height: finalHeight,
          compression: 'FAST',
          rotation: 0
        });

        // Save with a unique filename
        pdf.save('converted-image.pdf');
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageDataUrl;
  });
};