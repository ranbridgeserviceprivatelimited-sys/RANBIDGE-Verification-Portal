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
    // Try primary public path first, fallback if needed
    bgImage.src = '/reference_certificate.png';
    bgImage.crossOrigin = 'anonymous';

    bgImage.onload = () => {
      setImgLoaded(true);
      // 1. Draw reference certificate background image
      ctx.drawImage(bgImage, 0, 0, width, height);

      const centerX = width / 2;

      // 2. White Patch & Overlay Student Name
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(240, 455, 934, 75);

      ctx.textAlign = 'center';
      ctx.font = 'bold italic 44px "Georgia", serif';
      ctx.fillStyle = '#0c2340';
      ctx.fillText(recipientName, centerX, 502);

      // Name underline & Diamond symbol (◇)
      const nameTextWidth = ctx.measureText(recipientName).width;
      const underlineWidth = Math.max(380, nameTextWidth + 50);
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(centerX - underlineWidth / 2, 522);
      ctx.lineTo(centerX - 12, 522);
      ctx.moveTo(centerX + 12, 522);
      ctx.lineTo(centerX + underlineWidth / 2, 522);
      ctx.stroke();

      // Center Diamond symbol
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.moveTo(centerX, 516);
      ctx.lineTo(centerX + 6, 522);
      ctx.lineTo(centerX, 528);
      ctx.lineTo(centerX - 6, 522);
      ctx.closePath();
      ctx.fill();

      // 3. White Patch & Overlay Workshop Duration & Title
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(140, 545, 1134, 98);

      // Line 1: "for successfully participating in the 3-Day Workshop on"
      const prefixText = 'for successfully participating in the ';
      const durationPart = `${durationText} `;
      const suffixText = 'Workshop on';

      ctx.font = '500 22px "Georgia", serif';
      const prefixWidth = ctx.measureText(prefixText).width;

      ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
      const durationWidth = ctx.measureText(durationPart).width;

      ctx.font = '500 22px "Georgia", serif';
      const suffixWidth = ctx.measureText(suffixText).width;

      const totalLineWidth = prefixWidth + durationWidth + suffixWidth;
      const startX = centerX - (totalLineWidth / 2);

      // Draw Prefix ("for successfully participating in the ")
      ctx.textAlign = 'left';
      ctx.font = '500 22px "Georgia", serif';
      ctx.fillStyle = '#1b365d';
      ctx.fillText(prefixText, startX, 576);

      // Draw Duration ("3-Day ")
      ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#1d4ed8';
      ctx.fillText(durationPart, startX + prefixWidth, 576);

      // Draw Suffix ("Workshop on")
      ctx.font = '500 22px "Georgia", serif';
      ctx.fillStyle = '#1b365d';
      ctx.fillText(suffixText, startX + prefixWidth + durationWidth, 576);

      // Line 2: Main Workshop Title (Bold Uppercase Dark Blue)
      ctx.textAlign = 'center';
      ctx.font = '900 34px "Plus Jakarta Sans", "Inter", sans-serif';
      ctx.fillStyle = '#0c2340';
      ctx.fillText(workshopTitle.toUpperCase(), centerX, 628);

      // 4. White Patch & Overlay Date & College Name
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(160, 655, 1094, 55);

      // Line 3: Date (Calendar Icon) & College Name (Location Pin Icon) - Perfectly Centered
      const dateStr = `📅  ${workshopDate}`;
      const collegeStr = `📍  ${collegeName}`;
      const gapBetween = 45;

      ctx.font = '600 19px "Georgia", serif';
      const dateWidth = ctx.measureText(dateStr).width;
      const collegeWidth = ctx.measureText(collegeStr).width;

      const line3TotalWidth = dateWidth + gapBetween + collegeWidth;
      const line3StartX = centerX - (line3TotalWidth / 2);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#1b365d';
      ctx.fillText(dateStr, line3StartX, 688);
      ctx.fillText(collegeStr, line3StartX + dateWidth + gapBetween, 688);
    };

    bgImage.onerror = () => {
      // Fallback path
      const bgImage2 = new Image();
      bgImage2.src = '/assets/reference_certificate.png';
      bgImage2.onload = () => {
        setImgLoaded(true);
        ctx.drawImage(bgImage2, 0, 0, width, height);

        const centerX = width / 2;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(240, 455, 934, 75);
        ctx.textAlign = 'center';
        ctx.font = 'bold italic 44px "Georgia", serif';
        ctx.fillStyle = '#0c2340';
        ctx.fillText(recipientName, centerX, 502);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(140, 545, 1134, 98);
        ctx.font = '500 22px "Georgia", serif';
        ctx.fillStyle = '#1b365d';
        ctx.fillText(`for successfully participating in the ${durationText} Workshop on`, centerX, 576);

        ctx.font = '900 34px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#0c2340';
        ctx.fillText(workshopTitle.toUpperCase(), centerX, 628);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(160, 655, 1094, 55);
        
        const dateStr = `📅  ${workshopDate}`;
        const collegeStr = `📍  ${collegeName}`;
        const gapBetween = 45;
        ctx.font = '600 19px "Georgia", serif';
        const dateWidth = ctx.measureText(dateStr).width;
        const collegeWidth = ctx.measureText(collegeStr).width;
        const line3TotalWidth = dateWidth + gapBetween + collegeWidth;
        const line3StartX = centerX - (line3TotalWidth / 2);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#1b365d';
        ctx.fillText(dateStr, line3StartX, 688);
        ctx.fillText(collegeStr, line3StartX + dateWidth + gapBetween, 688);
      };
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
