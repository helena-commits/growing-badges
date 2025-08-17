import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { loadImage, drawTextFit } from '@/lib/canvas-utils';
import { TemplateBack } from '@/lib/supabase-back';

interface BadgeBackPreviewProps {
  template: TemplateBack | null;
  name: string;
  onRender?: () => void;
}

export interface BadgeBackPreviewRef {
  renderBadge: () => Promise<void>;
  toPNG: () => string | null;
  downloadPNG: (filename?: string) => void;
}

export const BadgeBackPreview = forwardRef<BadgeBackPreviewRef, BadgeBackPreviewProps>(
  ({ template, name, onRender }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isRendering, setIsRendering] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const renderBadge = async () => {
      if (!canvasRef.current || !template) return;

      setIsRendering(true);
      setError(null);

      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas dimensions
        canvas.width = template.width;
        canvas.height = template.height;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Load and draw template background
        const templateImg = await loadImage(template.file_url);
        ctx.drawImage(templateImg, 0, 0, template.width, template.height);

        // Draw name text if provided
        if (name && name.trim()) {
          const nameBox = {
            x: template.name_x,
            y: template.name_y,
            w: template.name_w,
            h: template.name_h
          };

          drawTextFit(
            ctx,
            name.trim(),
            nameBox,
            template.name_max_size,
            24,
            template.name_weight,
            template.name_color
          );
        }

        // Draw document number (fixed text)
        const docNumBox = {
          x: template.doc_num_x,
          y: template.doc_num_y,
          w: template.doc_num_w,
          h: template.doc_num_h
        };

        drawTextFit(
          ctx,
          '***.***.123-45',
          docNumBox,
          template.doc_num_max_size,
          12,
          template.doc_num_weight,
          template.doc_num_color
        );

        // Draw admission date (current date)
        const dateStr = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const admissionBox = {
          x: template.admission_x,
          y: template.admission_y,
          w: template.admission_w,
          h: template.admission_h
        };

        drawTextFit(
          ctx,
          dateStr,
          admissionBox,
          template.admission_max_size,
          12,
          template.admission_weight,
          template.admission_color
        );

        onRender?.();
      } catch (err) {
        console.error('Error rendering back badge:', err);
        setError('Erro ao renderizar o verso do crachá');
      } finally {
        setIsRendering(false);
      }
    };

    const toPNG = () => {
      if (!canvasRef.current) return null;
      return canvasRef.current.toDataURL('image/png');
    };

    const downloadPNG = (filename = 'cracha-verso.png') => {
      const dataUrl = toPNG();
      if (!dataUrl) return;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    useImperativeHandle(ref, () => ({
      renderBadge,
      toPNG,
      downloadPNG
    }));

    // Auto-render when template or name changes
    useEffect(() => {
      if (template && name) {
        renderBadge();
      }
    }, [template, name]);

    return (
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto border border-gray-200 rounded-lg shadow-lg"
          style={{ aspectRatio: '1024/1536' }}
        />
        
        {isRendering && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Renderizando verso...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-red-50 bg-opacity-90 flex items-center justify-center rounded-lg">
            <p className="text-red-600 text-sm text-center px-4">{error}</p>
          </div>
        )}
      </div>
    );
  }
);

BadgeBackPreview.displayName = 'BadgeBackPreview';