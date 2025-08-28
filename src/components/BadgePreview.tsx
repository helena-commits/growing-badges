import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Template } from '@/lib/supabase';
import { 
  loadImage, 
  drawRoundedImage, 
  drawTextFit, 
  correctImageOrientation,
  createSlug 
} from '@/lib/canvas-utils';

interface BadgePreviewProps {
  template: Template | null;
  photoFile: File | null;
  photoUrl?: string;
  name: string;
  role: string;
  onRender?: (rendered: boolean) => void;
}

export interface BadgePreviewRef {
  renderBadge: () => Promise<void>;
  toPNG: () => string | null;
  downloadPNG: () => void;
}

export const BadgePreview = forwardRef<BadgePreviewRef, BadgePreviewProps>(({ 
  template, 
  photoFile, 
  photoUrl, 
  name, 
  role, 
  onRender 
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (template && (photoFile || photoUrl) && name && role) {
      renderBadge();
    }
  }, [template, photoFile, photoUrl, name, role]);

  const renderBadge = async () => {
    if (!canvasRef.current || !template) return;

    setIsRendering(true);
    setError(null);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas size to template dimensions
      canvas.width = template.width;
      canvas.height = template.height;

      // Clear canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load and draw template background (if not default)
      if (template.file_url !== 'default-template') {
        try {
          const templateImg = await loadImage(template.file_url);
          ctx.drawImage(templateImg, 0, 0, template.width, template.height);
        } catch (error) {
          console.warn('Could not load template image, using white background');
        }
      }

      // Load and draw photo
      let photoImg: HTMLImageElement;
      if (photoFile) {
        photoImg = await correctImageOrientation(photoFile);
      } else if (photoUrl) {
        photoImg = await loadImage(photoUrl);
      } else {
        throw new Error('No photo provided');
      }

      // Draw photo using template coordinates
      drawRoundedImage(
        ctx,
        photoImg,
        template.photo_x,
        template.photo_y,
        template.photo_w,
        template.photo_h,
        template.photo_radius
      );

      // Draw name text using template coordinates
      drawTextFit(
        ctx,
        name,
        {
          x: template.name_x,
          y: template.name_y,
          w: template.name_w,
          h: template.name_h
        },
        template.name_max_size,
        Math.floor(template.name_max_size / 2),
        template.name_weight,
        template.name_color
      );

      // Draw role text using template coordinates
      drawTextFit(
        ctx,
        role,
        {
          x: template.role_x,
          y: template.role_y,
          w: template.role_w,
          h: template.role_h
        },
        template.role_max_size,
        Math.floor(template.role_max_size / 2),
        template.role_weight,
        template.role_color
      );

      onRender?.(true);
    } catch (error) {
      console.error('Error rendering badge:', error);
      setError(error instanceof Error ? error.message : 'Erro ao renderizar crachá');
      onRender?.(false);
    } finally {
      setIsRendering(false);
    }
  };

  const toPNG = (): string | null => {
    if (!canvasRef.current) return null;
    return canvasRef.current.toDataURL('image/png');
  };

  const downloadPNG = () => {
    const dataUrl = toPNG();
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `cracha-${createSlug(name)}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    renderBadge,
    toPNG,
    downloadPNG
  }));

  return (
    <div className="space-y-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="max-w-full border rounded-lg shadow-lg bg-background"
          style={{ aspectRatio: `${template?.width || 638}/${template?.height || 1013}` }}
        />
        
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Renderizando...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
            <div className="text-center p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

BadgePreview.displayName = 'BadgePreview';