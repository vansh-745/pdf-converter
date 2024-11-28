import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { RotateCw, ZoomIn, ZoomOut, Crop as CropIcon, Download } from 'lucide-react';
import Button from './Button';

interface ImageEditorProps {
  image: string;
  onSave: (editedImage: string) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect?: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect || mediaWidth / mediaHeight,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageEditor({ image, onSave }: ImageEditorProps) {
  const [crop, setCrop] = useState<Crop>();
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);
  const [completedCrop, setCompletedCrop] = useState<Crop>();

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, undefined));
  }, []);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.1));
  };

  const saveImage = useCallback(async () => {
    if (!imgRef.current) return;

    const image = imgRef.current;
    
    // If no crop is applied, use the entire image
    if (!completedCrop) {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Apply rotation and scale to the entire image
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      
      ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );
      
      ctx.restore();
      onSave(canvas.toDataURL('image/jpeg', 1.0));
      return;
    }

    // Handle cropped image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set proper canvas dimensions for the cropped area
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    // Enable high-quality image scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Apply transformations
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw the cropped portion
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.restore();

    // Convert to high-quality JPEG
    onSave(canvas.toDataURL('image/jpeg', 1.0));
  }, [completedCrop, rotation, scale, onSave]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative max-w-full overflow-hidden rounded-lg">
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={undefined}
          className="max-w-full"
        >
          <img
            ref={imgRef}
            src={image}
            alt="Edit"
            onLoad={onImageLoad}
            style={{
              transform: `rotate(${rotation}deg) scale(${scale})`,
              maxWidth: '100%',
              maxHeight: '70vh',
              transformOrigin: 'center center',
            }}
          />
        </ReactCrop>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        <Button onClick={handleRotate}>
          <RotateCw className="w-4 h-4 mr-2" />
          Rotate
        </Button>
        <Button onClick={handleZoomIn}>
          <ZoomIn className="w-4 h-4 mr-2" />
          Zoom In
        </Button>
        <Button onClick={handleZoomOut}>
          <ZoomOut className="w-4 h-4 mr-2" />
          Zoom Out
        </Button>
        <Button onClick={() => setCrop(undefined)}>
          <CropIcon className="w-4 h-4 mr-2" />
          Reset Crop
        </Button>
        <Button onClick={saveImage} variant="primary">
          <Download className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}