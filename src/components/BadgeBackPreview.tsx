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

        // Helper function to draw label + value on same line with same baseline
        const drawLabelValue = (
          label: string,
          value: string,
          x: number,
          y: number,
          maxWidth: number,
          gap: number = 12
        ) => {
          // Same font family and weight as labels
          ctx.font = '700 28px Arial';
          ctx.textBaseline = 'alphabetic';
          ctx.fillStyle = '#000';

          // Measure label width to position value
          const labelWidth = ctx.measureText(label).width;

          // Draw label
          ctx.fillText(label, x, y);

          // Draw value right after label with same baseline
          const valueX = x + labelWidth + gap;
          const availableWidth = maxWidth - labelWidth - gap;
          
          // Use drawTextFit for value with same font settings
          drawTextFit(
            ctx,
            value,
            { x: valueX, y: y - 20, w: availableWidth, h: 40 },
            28,
            18,
            '700',
            '#000000'
          );
        };

        // Load and draw template background
        const templateImg = await loadImage(template.file_url);
        ctx.drawImage(templateImg, 0, 0, 638, 1013);

        // Draw name with label on same line
        if (name && name.trim()) {
          drawLabelValue('NOME COMPLETO:', name.trim(), 70, 200, 500);
        }

        // Draw document number with label on same line
        drawLabelValue('Nº DO DOCUMENTO:', '***.***.123-45', 70, 260, 350);

        // Draw admission date with label on same line
        const dateStr = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        drawLabelValue('ADMISSÃO:', dateStr, 70, 320, 300);

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