export type FrameType = 'none' | 'border' | 'bottom-text' | 'top-bottom';

export interface FrameOptions {
  type: FrameType;
  text: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export const generateFramedCanvas = async (
  originalCanvas: HTMLCanvasElement,
  options: FrameOptions
): Promise<HTMLCanvasElement> => {
  if (options.type === 'none') {
    return originalCanvas;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return originalCanvas;

  const originalWidth = originalCanvas.width;
  const originalHeight = originalCanvas.height;
  
  // Base padding relative to size
  const padding = originalWidth * 0.05; // 5% padding
  const borderThickness = originalWidth * 0.025; // 2.5% border
  const fontSize = originalWidth * 0.08; // 8% font size
  const textPadding = fontSize * 1.5; // Space for text

  const newWidth = originalWidth + (padding * 2);
  let newHeight = originalHeight + (padding * 2);
  
  // Adjust dimensions based on frame type
  if (options.type === 'bottom-text') {
    newHeight += textPadding;
  } else if (options.type === 'top-bottom') {
    newHeight += textPadding * 2;
  }

  canvas.width = newWidth;
  canvas.height = newHeight;

  // Define Frame Path (Rounded Rect)
  const borderOffset = borderThickness / 2;
  const x = borderOffset;
  const y = borderOffset;
  const w = newWidth - borderThickness;
  const h = newHeight - borderThickness;
  const radius = 40;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  // Fill Background (only inside the rounded rect)
  ctx.fillStyle = options.bgColor;
  ctx.fill();

  // Draw QR Image (centered)
  const qrX = padding;
  let qrY = padding;
  
  if (options.type === 'top-bottom') {
    qrY += textPadding;
  }

  // Draw Border if needed
  if (options.type === 'border' || options.type === 'bottom-text' || options.type === 'top-bottom') {
    ctx.strokeStyle = options.color;
    ctx.lineWidth = borderThickness;
    ctx.stroke();
  }

  // Draw QR
  ctx.drawImage(originalCanvas, qrX, qrY);

  // Draw Text
  if (options.type !== 'border' && options.text) {
    ctx.fillStyle = options.textColor || '#000000';
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (options.type === 'bottom-text') {
      const textY = newHeight - (textPadding / 2) - (padding / 2);
      ctx.fillText(options.text, newWidth / 2, textY);
    } else if (options.type === 'top-bottom') {
      // Top Text
      const topTextY = (textPadding / 2) + (padding / 2);
      ctx.fillText(options.text, newWidth / 2, topTextY);
      
      // Bottom Text (repeat for now, or could use different text)
      const bottomTextY = newHeight - (textPadding / 2) - (padding / 2);
      ctx.fillText(options.text, newWidth / 2, bottomTextY);
    }
  }

  return canvas;
};
