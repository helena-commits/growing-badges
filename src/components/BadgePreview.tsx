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

      // Define fallback values for template properties
      const canvasWidth = template.width ?? 638;
      const canvasHeight = template.height ?? 1013;

      const photoX = template.photo_x ?? 175;
      const photoY = template.photo_y ?? 120;
      const photoW = template.photo_w ?? 290;
      const photoH = template.photo_h ?? 340;
      const photoRadius = template.photo_radius ?? 20;

      const nameX = template.name_x ?? 120;
      const nameY = template.name_y ?? 480;
      const nameW = template.name_w ?? 400;
      const nameH = template.name_h ?? 80;
      const nameMaxSize = template.name_max_size ?? 48;
      const nameWeight = template.name_weight ?? '700';
      const nameColor = template.name_color ?? '#111111';

      const roleX = template.role_x ?? 170;
      const roleY = template.role_y ?? 540;
      const roleW = template.role_w ?? 300;
      const roleH = template.role_h ?? 60;
      const roleMaxSize = template.role_max_size ?? 36;
      const roleWeight = template.role_weight ?? '600';
      const roleColor = template.role_color ?? '#111111';

      // Set canvas size using fallback values
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Clear canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load and draw template background (if not default)
      if (template.file_url !== 'default-template') {
        try {
          const templateImg = await loadImage(template.file_url);
          ctx.drawImage(templateImg, 0, 0, canvasWidth, canvasHeight);
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

      // Draw photo using template coordinates with fallbacks
      drawRoundedImage(
        ctx,
        photoImg,
        photoX,
        photoY,
        photoW,
        photoH,
        photoRadius
      );

      // Draw name text using template coordinates with fallbacks
      drawTextFit(
        ctx,
        name,
        {
          x: nameX,
          y: nameY,
          w: nameW,
          h: nameH
        },
        nameMaxSize,
        24,
        nameWeight,
        nameColor
      );

      // Draw role text using template coordinates with fallbacks
      drawTextFit(
        ctx,
        role,
        {
          x: roleX,
          y: roleY,
          w: roleW,
          h: roleH
        },
        roleMaxSize,
        18,
        roleWeight,
        roleColor
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
          style={{ aspectRatio: '638/1013' }}
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