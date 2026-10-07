import React, { useRef, useEffect, useState } from 'react';
import { Download, Printer, Award } from 'lucide-react';

export default function CertificateGenerator({ record, showActions = true, onDownloadComplete }) {
  const canvasRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Dynamic values from registration record
  const recipientName = record?.fullName || 'Participant Name';
  const collegeName = record?.college || 'Narasaraopeta Engineering College';
  const workshopTitle = record?.workshopName || 'STARTUP & ENTREPRENEURSHIP AND IPR RIGHTS';
  const workshopDate = record?.workshopDate || 'October 7, 2026';
  const durationText = record?.duration || '3-Day';
  const rollNumber = record?.rollNumber || 'REG-2026';

  // Draw High-Resolution Certificate on HTML5 Canvas using reference image background
  const drawCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = 1414;
    const height = 1000;

    canvas.width = width;
    canvas.height = height;

    const bgImage = new Image();
    bgImage.src = '/assets/reference_certificate.png';
    bgImage.crossOrigin = 'anonymous';

    bgImage.onload = () => {
      setImgLoaded(true);
      // 1. Draw reference certificate background image
      ctx.drawImage(bgImage, 0, 0, width, height);

      const centerX = width / 2;

      // 2. White Patch & Overlay Student Name
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(260, 455, 894, 75);

      ctx.textAlign = 'center';
      ctx.font = 'bold italic 44px "Georgia", serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(recipientName, centerX, 502);

      // Name underline & Diamond symbol (◇)
      const nameTextWidth = ctx.measureText(recipientName).width;
      const underlineWidth = Math.max(380, nameTextWidth + 50);
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(centerX - underlineWidth / 2, 522);
      ctx.lineTo(centerX - 12, 522);
      ctx.moveTo(centerX + 12, 522);
      ctx.lineTo(centerX + underlineWidth / 2, 522);
      ctx.stroke();

      // Center Diamond symbol
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.moveTo(centerX, 516);
      ctx.lineTo(centerX + 6, 522);
      ctx.lineTo(centerX, 528);
      ctx.lineTo(centerX - 6, 522);
      ctx.closePath();
      ctx.fill();

      // 3. White Patch & Overlay Workshop Duration & Title
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(160, 550, 1094, 95);

      // Dynamically measure line width for perfect centering & clean spacing
      const prefixText = 'for successfully participating in the ';
      const durationFullText = `${durationText} Workshop on`;

      ctx.font = '500 22px "Georgia", serif';
      const prefixWidth = ctx.measureText(prefixText).width;

      ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
      const durationWidth = ctx.measureText(durationFullText).width;

      const totalLineWidth = prefixWidth + durationWidth;
      const startX = centerX - (totalLineWidth / 2);

      // Draw Prefix Text ("for successfully participating in the ")
      ctx.textAlign = 'left';
      ctx.font = '500 22px "Georgia", serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(prefixText, startX, 576);

      // Draw Duration Text ("3-Day Workshop on") with guaranteed space
      ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#1e40af';
      ctx.fillText(durationFullText, startX + prefixWidth, 576);

      // Main Workshop Title (Bold Uppercase +2 font size: 34px)
      ctx.textAlign = 'center';
      ctx.font = '900 34px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(workshopTitle.toUpperCase(), centerX, 628);

      // 4. White Patch & Overlay Date & College Name (+2 font size: 19px)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(180, 652, 1054, 58);

      // Date (Calendar Icon)
      ctx.font = '600 19px "Georgia", serif';
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'right';
      ctx.fillText(`📅  ${workshopDate}`, centerX - 25, 690);

      // College Name with Location Pin Symbol 📍 on the left
      ctx.textAlign = 'left';
      ctx.fillText(`📍  ${collegeName}`, centerX + 25, 690);
    };

    bgImage.onerror = () => {
      // Fallback white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      ctx.textAlign = 'center';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('RANBIDGE SOLUTIONS PRIVATE LIMITED', centerX, 150);

      ctx.font = 'bold italic 40px "Georgia", serif';
      ctx.fillText(recipientName, centerX, 400);
      ctx.font = '900 30px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(workshopTitle.toUpperCase(), centerX, 550);
    };
  };

  useEffect(() => {
    drawCertificate();
  }, [record]);

  // Download High-Resolution Certificate Image
  const handleDownload = () => {
    setIsGenerating(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    drawCertificate();

    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `RANBIDGE_Certificate_${(recipientName || 'Participant').replace(/\s+/g, '_')}_${rollNumber}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsGenerating(false);
      if (onDownloadComplete) onDownloadComplete();
    }, 200);
  };

  // Print Certificate Action
  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print RANBIDGE Certificate - ${recipientName}</title>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #ffffff; }
            img { width: 100%; height: auto; max-width: 100vw; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', alignItems: 'center' }}>
      {/* Interactive Live Canvas Certificate Preview */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        maxWidth: '920px'
      }}>
        <canvas 
          ref={canvasRef} 
          style={{ 
            width: '100%', 
            height: 'auto', 
            display: 'block',
            borderRadius: 'var(--radius-lg)'
          }} 
        />
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <button
            className="btn-primary"
            onClick={handleDownload}
            disabled={isGenerating}
            style={{ padding: '0.75rem 1.75rem', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Download size={18} />
            <span>{isGenerating ? 'Generating...' : 'Download Official Certificate (PNG)'}</span>
          </button>
          <button
            className="btn-secondary"
            onClick={handlePrint}
            style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Printer size={18} />
            <span>Print Certificate</span>
          </button>
        </div>
      )}
    </div>
  );
}
