import React, { useState } from 'react';
import { FileImage } from 'lucide-react';
import Dropzone from './components/Dropzone';
import ImageEditor from './components/ImageEditor';
import Button from './components/Button';
import { generatePDF } from './utils/pdfUtils';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageDrop = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setEditedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveImage = (editedImg: string) => {
    setEditedImage(editedImg);
  };

  const handleGeneratePDF = async () => {
    if (editedImage) {
      try {
        setIsGenerating(true);
        await generatePDF(editedImage);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <FileImage className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Image to PDF Converter</h1>
          </div>

          {!image ? (
            <Dropzone onImageDrop={handleImageDrop} />
          ) : (
            <div className="space-y-6">
              <ImageEditor image={image} onSave={handleSaveImage} />
              
              {editedImage && (
                <div className="flex justify-center">
                  <Button 
                    variant="primary"
                    onClick={handleGeneratePDF}
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating PDF...' : 'Generate PDF'}
                  </Button>
                </div>
              )}

              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    setImage(null);
                    setEditedImage(null);
                  }}
                  disabled={isGenerating}
                >
                  Upload New Image
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;