import React, { useRef, useEffect, useState } from 'react';
import { Download, Printer, Award, Linkedin, Share2 } from 'lucide-react';

export default function CertificateGenerator({ record, showActions = true, onDownloadComplete, showToast }) {
  const canvasRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const safeText = (val, defaultVal = '') => {
    if (val === null || val === undefined) return defaultVal;
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object' && val.seconds !== undefined) {
      try { return new Date(val.seconds * 1000).toLocaleDateString(); } catch (e) {}
    }
    return defaultVal;
  };

  // Dynamic values from registration record
  const recipientName = safeText(record?.fullName || record?.studentName || record?.name, 'Participant Name');
  const collegeName = safeText(record?.college || record?.institution, 'Narasaraopeta Engineering College');
  const workshopTitle = safeText(record?.workshopName || record?.workshop, 'STARTUP & ENTREPRENEURSHIP AND IPR RIGHTS');
  const workshopDate = safeText(record?.workshopDate || record?.date, 'October 7, 2026');
  const durationText = safeText(record?.duration, '2-Day');
  const rollNumber = safeText(record?.rollNumber || record?.id, 'REG-2026');

  // Draw High-Resolution Certificate on HTML5 Canvas using reference image background
  const drawCertificate = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const width = 1414;
      const height = 1000;

    canvas.width = width;
    canvas.height = height;

    // Render fallback certificate layout immediately so canvas is never blank
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    const centerX = width / 2;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('RANBIDGE SOLUTIONS', centerX, 120);

    ctx.fillStyle = '#d97706';
    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('OFFICIAL CERTIFICATE OF PARTICIPATION', centerX, 160);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold italic 48px "Georgia", serif';
    ctx.fillText(recipientName, centerX, 360);

    ctx.fillStyle = '#334155';
    ctx.font = '500 22px "Georgia", serif';
    ctx.fillText(`for successfully participating in the ${durationText} Workshop on`, centerX, 440);

    ctx.fillStyle = '#1d4ed8';
    ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(workshopTitle.toUpperCase(), centerX, 510);

    ctx.fillStyle = '#475569';
    ctx.font = '700 20px "Georgia", serif';
    ctx.fillText(`📅  ${workshopDate}    |    📍  ${collegeName}`, centerX, 580);

    ctx.fillStyle = '#64748b';
    ctx.font = '600 16px monospace';
    ctx.fillText(`Certificate ID: ${rollNumber}  •  Status: VERIFIED & VALIDATED`, centerX, 880);

    const bgImage = new Image();
    bgImage.src = '/reference_certificate.png';
    bgImage.crossOrigin = 'anonymous';

    bgImage.onload = () => {
      setImgLoaded(true);
      ctx.drawImage(bgImage, 0, 0, width, height);

      const centerX = width / 2;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(240, 455, 934, 75);

      ctx.textAlign = 'center';
      ctx.font = 'bold italic 44px "Georgia", serif';
      ctx.fillStyle = '#0c2340';
      ctx.fillText(recipientName, centerX, 502);

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

      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.moveTo(centerX, 516);
      ctx.lineTo(centerX + 6, 522);
      ctx.lineTo(centerX, 528);
      ctx.lineTo(centerX - 6, 522);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(140, 545, 1134, 98);

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

      ctx.textAlign = 'left';
      ctx.font = '500 22px "Georgia", serif';
      ctx.fillStyle = '#1b365d';
      ctx.fillText(prefixText, startX, 576);

      ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#1d4ed8';
      ctx.fillText(durationPart, startX + prefixWidth, 576);

      ctx.font = '500 22px "Georgia", serif';
      ctx.fillStyle = '#1b365d';
      ctx.fillText(suffixText, startX + prefixWidth + durationWidth, 576);

      ctx.textAlign = 'center';
      ctx.font = '900 34px "Plus Jakarta Sans", "Inter", sans-serif';
      ctx.fillStyle = '#0c2340';
      ctx.fillText(workshopTitle.toUpperCase(), centerX, 628);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(160, 652, 1094, 60);

      const dateStr = `📅  ${workshopDate}`;
      const collegeStr = `📍  ${collegeName}`;
      const gapBetween = 45;

      ctx.font = '700 21px "Georgia", serif';
      const dateWidth = ctx.measureText(dateStr).width;
      const collegeWidth = ctx.measureText(collegeStr).width;

      const line3TotalWidth = dateWidth + gapBetween + collegeWidth;
      const line3StartX = centerX - (line3TotalWidth / 2);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#1b365d';
      ctx.fillText(dateStr, line3StartX, 690);
      ctx.fillText(collegeStr, line3StartX + dateWidth + gapBetween, 690);
    };

    bgImage.onerror = () => {
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
        ctx.fillRect(160, 652, 1094, 60);
        
        const dateStr = `📅  ${workshopDate}`;
        const collegeStr = `📍  ${collegeName}`;
        const gapBetween = 45;
        ctx.font = '700 21px "Georgia", serif';
        const dateWidth = ctx.measureText(dateStr).width;
        const collegeWidth = ctx.measureText(collegeStr).width;
        const line3TotalWidth = dateWidth + gapBetween + collegeWidth;
        const line3StartX = centerX - (line3TotalWidth / 2);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#1b365d';
        ctx.fillText(dateStr, line3StartX, 690);
        ctx.fillText(collegeStr, line3StartX + dateWidth + gapBetween, 690);
      };
    };
    } catch (err) {
      console.error('Canvas draw error:', err);
    }
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

  // Direct Share to LinkedIn Action
  const handleShareLinkedIn = () => {
    const postText = `🎓 Thrilled to announce that I have successfully completed the specialized technical workshop on "${workshopTitle}" organized by RANBIDGE Solutions! 🚀\n\n📜 Certificate ID: ${record?.id || rollNumber}\n🏫 Institution: ${collegeName}\n💻 Department: ${record?.department || 'Engineering & Technology'}\n\nGrateful for the valuable hands-on learning experience and skill enrichment!\n\n#RANBIDGE #Certification #ContinuousLearning #Upskilling #Engineering #Technology #Achievement`;

    try {
      navigator.clipboard.writeText(postText);
    } catch (err) {
      console.warn('Clipboard write error:', err);
    }

    const currentUrl = window.location.href;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(linkedinUrl, '_blank', 'width=650,height=700,scrollbars=yes');

    if (showToast) {
      showToast('📋 Copied LinkedIn post text to clipboard! Opening LinkedIn...');
    }
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

      {/* Action Buttons (Icon-Only) */}
      {showActions && (
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', alignItems: 'center', marginTop: '0.5rem' }}>
          <button
            className="btn-primary"
            onClick={handleDownload}
            disabled={isGenerating}
            style={{ 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-md)', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '44px',
              height: '44px'
            }}
            title={isGenerating ? "Generating PNG..." : "Download Official Certificate (PNG)"}
          >
            <Download size={20} />
          </button>
          
          <button
            className="btn-secondary"
            onClick={handlePrint}
            style={{ 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-md)', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '44px',
              height: '44px'
            }}
            title="Print Certificate"
          >
            <Printer size={20} />
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleShareLinkedIn}
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              background: '#0a66c2',
              borderColor: '#0a66c2',
              color: '#ffffff'
            }}
            title="Share on LinkedIn"
          >
            <Linkedin size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

