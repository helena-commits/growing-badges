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

        // Set canvas dimensions to fixed print dimensions (2.125" x 3.375" at 300 DPI) - Portrait orientation
        canvas.width = 638;
        canvas.height = 1013;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Load and draw template background
        const templateImg = await loadImage(template.file_url);
        ctx.drawImage(templateImg, 0, 0, 638, 1013);

        // Draw name text if provided - Use template configuration
        if (name && name.trim()) {
          const nameBox = {
            x: template.name_x || 45,
            y: template.name_y || 56,
            w: template.name_w || 300,
            h: template.name_h || 80
          };

          drawTextFit(
            ctx,
            name.trim(),
            nameBox,
            template.name_max_size || 48,
            14,
            template.name_weight || '700',
            template.name_color || '#000000'
          );
        }

        // Draw document number (fixed text) - Use template configuration
        const docNumBox = {
          x: template.doc_num_x || 55,
          y: template.doc_num_y || 220,
          w: template.doc_num_w || 200,
          h: template.doc_num_h || 60
        };

        drawTextFit(
          ctx,
          '***.***.123-45',
          docNumBox,
          template.doc_num_max_size || 28,
          14,
          template.doc_num_weight || '600',
          template.doc_num_color || '#000000'
        );

        // Draw admission date (current date) - Use template configuration
        const dateStr = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const admissionBox = {
          x: template.admission_x || 381,
          y: template.admission_y || 220,
          w: template.admission_w || 160,
          h: template.admission_h || 60
        };

        drawTextFit(
          ctx,
          dateStr,
          admissionBox,
          template.admission_max_size || 28,
          14,
          template.admission_weight || '600',
          template.admission_color || '#000000'
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
          style={{ aspectRatio: '638/1013' }}
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