import * as exifr from 'exifr';

// Load image from File or URL
export async function loadImage(src: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = reject;
    
    if (src instanceof File) {
      img.src = URL.createObjectURL(src);
    } else {
      img.src = src;
    }
  });
}

// Calculate cover fit dimensions
export function coverFit(srcW: number, srcH: number, dstW: number, dstH: number) {
  const scale = Math.max(dstW / srcW, dstH / srcH);
  const scaledW = srcW * scale;
  const scaledH = srcH * scale;
  
  return {
    scale,
    x: (dstW - scaledW) / 2,
    y: (dstH - scaledH) / 2,
    width: scaledW,
    height: scaledH,
    sourceX: 0,
    sourceY: 0,
    sourceWidth: srcW,
    sourceHeight: srcH
  };
}

// Draw rounded image with clipping
export function drawRoundedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.save();
  
  // Create rounded rectangle clipping path
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.clip();
  
  // Calculate cover fit for the image
  const fit = coverFit(img.naturalWidth, img.naturalHeight, w, h);
  
  // Draw the image to fill the clipped area
  ctx.drawImage(
    img,
    0, 0, img.naturalWidth, img.naturalHeight,
    x + fit.x, y + fit.y, fit.width, fit.height
  );
  
  ctx.restore();
}

// Draw text that fits within a box
export function drawTextFit(
  ctx: CanvasRenderingContext2D,
  text: string,
  box: { x: number; y: number; w: number; h: number },
  maxSize: number,
  minSize: number = 24,
  weight: string = '700',
  color: string = '#111111'
) {
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  
  let fontSize = maxSize;
  
  // Find the largest font size that fits within the box
  while (fontSize >= minSize) {
    ctx.font = `${weight} ${fontSize}px Arial, sans-serif`;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    
    // Use more accurate text height calculation
    const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const textHeight = actualHeight || fontSize;
    
    if (textWidth <= box.w * 0.95 && textHeight <= box.h * 0.9) {
      break;
    }
    
    fontSize -= 1;
  }
  
  ctx.font = `${weight} ${fontSize}px Arial, sans-serif`;
  
  // Calculate precise positioning for better alignment
  const centerX = box.x + box.w / 2;
  const metrics = ctx.measureText(text);
  const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  const actualTextHeight = textHeight || fontSize;
  
  // Position text in the vertical center of the box
  const baselineY = box.y + (box.h / 2) + (actualTextHeight / 2) - metrics.actualBoundingBoxDescent;
  
  ctx.fillText(text, centerX, baselineY);
}

// Correct image orientation based on EXIF data
export async function correctImageOrientation(file: File): Promise<HTMLImageElement> {
  try {
    const exifData = await exifr.parse(file);
    const orientation = exifData?.Orientation || 1;
    
    const img = await loadImage(file);
    
    // If orientation is 1 (normal), return as is
    if (orientation === 1) {
      return img;
    }
    
    // Create canvas to apply rotation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return img;
    }
    
    // Set canvas dimensions based on orientation
    if (orientation >= 5 && orientation <= 8) {
      canvas.width = img.naturalHeight;
      canvas.height = img.naturalWidth;
    } else {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }
    
    // Apply transformation based on orientation
    switch (orientation) {
      case 2:
        ctx.transform(-1, 0, 0, 1, canvas.width, 0);
        break;
      case 3:
        ctx.transform(-1, 0, 0, -1, canvas.width, canvas.height);
        break;
      case 4:
        ctx.transform(1, 0, 0, -1, 0, canvas.height);
        break;
      case 5:
        ctx.transform(0, 1, 1, 0, 0, 0);
        break;
      case 6:
        ctx.transform(0, 1, -1, 0, canvas.width, 0);
        break;
      case 7:
        ctx.transform(0, -1, -1, 0, canvas.width, canvas.height);
        break;
      case 8:
        ctx.transform(0, -1, 1, 0, 0, canvas.height);
        break;
    }
    
    ctx.drawImage(img, 0, 0);
    
    // Convert canvas back to image
    return loadImage(canvas.toDataURL('image/jpeg', 0.9));
  } catch (error) {
    console.warn('Could not read EXIF data, using image as-is:', error);
    return loadImage(file);
  }
}

// Create a slug from text
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}