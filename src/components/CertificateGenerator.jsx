import React, { useRef, useEffect, useState } from 'react';
import { Download, Printer, Award, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function CertificateGenerator({ record, showActions = true, onDownloadComplete }) {
  const canvasRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fallback defaults if properties are missing
  const recipientName = record?.fullName || 'Participant Name';
  const collegeName = record?.college || 'Narasaraopeta Engineering College';
  const workshopTitle = record?.workshopName || 'STARTUP & ENTREPRENEURSHIP AND IPR RIGHTS';
  const workshopDate = record?.workshopDate || '29, 30 September & 1 October 2026';
  const rollNumber = record?.rollNumber || 'REG-2026';
  const verifyId = record?.id || 'RANBIDGE-VERIFIED';

  // Draw High-Resolution Certificate on HTML5 Canvas (1920 x 1358px landscape)
  const drawCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = 1920;
    const height = 1358;

    canvas.width = width;
    canvas.height = height;

    // 1. White Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 2. Top-Left & Bottom-Right Geometric Polygonal Borders
    // Top-Left Blue Polygons
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(480, 0);
    ctx.lineTo(0, 480);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(360, 0);
    ctx.lineTo(0, 360);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(240, 0);
    ctx.lineTo(0, 240);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(120, 0);
    ctx.lineTo(0, 120);
    ctx.closePath();
    ctx.fill();

    // Bottom-Right Blue Polygons
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.moveTo(width, height);
    ctx.lineTo(width - 480, height);
    ctx.lineTo(width, height - 480);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.moveTo(width, height);
    ctx.lineTo(width - 360, height);
    ctx.lineTo(width, height - 360);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(width, height);
    ctx.lineTo(width - 240, height);
    ctx.lineTo(width, height - 240);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(width, height);
    ctx.lineTo(width - 120, height);
    ctx.lineTo(width, height - 120);
    ctx.closePath();
    ctx.fill();

    // Corner Motivational Handwritten Accents
    ctx.save();
    ctx.translate(110, 260);
    ctx.rotate(-0.28);
    ctx.font = 'italic 700 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText('Ideas', 0, 0);
    ctx.fillText('Build', 15, 42);
    ctx.fillText('Tomorrow', 5, 84);

    // Curved underline
    ctx.beginPath();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 4;
    ctx.quadraticCurveTo(80, 105, 160, 95);
    ctx.stroke();
    ctx.restore();

    // Right Corner Accent Text
    ctx.save();
    ctx.translate(width - 220, 230);
    ctx.rotate(-0.15);
    ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0284c7';
    ctx.fillText('LEARN', 0, 0);
    ctx.fillText('CONNECT', 0, 38);
    ctx.fillText('CREATE', 0, 76);

    ctx.beginPath();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.moveTo(0, 88);
    ctx.lineTo(110, 88);
    ctx.stroke();
    ctx.restore();

    // 3. Header Section: RANBIDGE Arch Logo Icon
    const centerX = width / 2;

    // Arch Logo Graphic
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#1e40af';
    ctx.beginPath();
    ctx.arc(centerX, 125, 45, Math.PI, 0);
    ctx.stroke();

    // Logo Nodes & Pillars
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(centerX - 45, 125, 10, 35);
    ctx.fillRect(centerX + 35, 125, 10, 35);
    ctx.fillRect(centerX - 10, 110, 20, 50);

    ctx.beginPath();
    ctx.arc(centerX, 95, 8, 0, Math.PI * 2);
    ctx.arc(centerX - 25, 105, 6, 0, Math.PI * 2);
    ctx.arc(centerX + 25, 105, 6, 0, Math.PI * 2);
    ctx.fill();

    // RANBIDGE Branding Text
    ctx.textAlign = 'center';
    ctx.font = '900 48px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('RANBIDGE', centerX, 205);

    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText('SOLUTIONS PRIVATE LIMITED', centerX, 235);

    // Tagline with side lines
    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('— FROM IDEAS TO IMPACT —', centerX, 260);

    // 4. CERTIFICATE OF PARTICIPATION Header
    ctx.font = '800 82px "Georgia", serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('CERTIFICATE', centerX, 355);

    // — OF PARTICIPATION — Section
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 380, 405);
    ctx.lineTo(centerX - 170, 405);
    ctx.moveTo(centerX + 170, 405);
    ctx.lineTo(centerX + 380, 405);
    ctx.stroke();

    ctx.font = '700 28px "Plus Jakarta Sans", serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText('OF PARTICIPATION', centerX, 413);

    // 5. Certification Body Text
    ctx.font = 'italic 500 26px "Georgia", serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('This is to certify that', centerX, 480);

    // 6. Recipient Name Display
    ctx.font = 'bold italic 60px "Georgia", serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(recipientName, centerX, 560);

    // Name Underline & Diamond Accent Symbol
    const nameWidth = Math.max(500, ctx.measureText(recipientName).width + 60);
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - nameWidth / 2, 590);
    ctx.lineTo(centerX - 18, 590);
    ctx.moveTo(centerX + 18, 590);
    ctx.lineTo(centerX + nameWidth / 2, 590);
    ctx.stroke();

    // Diamond Symbol ◇ in middle
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.moveTo(centerX, 582);
    ctx.lineTo(centerX + 8, 590);
    ctx.lineTo(centerX, 598);
    ctx.lineTo(centerX - 8, 590);
    ctx.closePath();
    ctx.fill();

    // 7. Workshop Details
    ctx.font = '24px "Georgia", serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('for successfully participating in the', centerX - 90, 650);

    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText('3-Day Workshop on', centerX + 180, 650);

    // Main Workshop Title (Bold Navy Uppercase)
    ctx.font = '900 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(workshopTitle.toUpperCase(), centerX, 715);

    // 8. Date & Venue Details
    // Calendar Icon graphic
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(centerX - 350, 765, 28, 26);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerX - 346, 773, 20, 14);

    ctx.font = '600 22px "Georgia", serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(workshopDate, centerX - 180, 786);

    ctx.font = '600 22px "Georgia", serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(collegeName, centerX + 210, 786);

    // Organized By
    ctx.font = 'italic 500 22px "Georgia", serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Organized by Ranbidge Solutions Private Limited', centerX, 845);

    // 9. Signatures & Verification QR Code Row
    const sigY = 940;

    // Left Signature: R. Gopinath Reddy
    ctx.textAlign = 'center';
    ctx.font = 'italic 700 42px "Georgia", cursive';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('R. Gopinath Reddy', 400, sigY + 30);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(250, sigY + 50);
    ctx.lineTo(550, sigY + 50);
    ctx.stroke();

    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('CEO & Managing Director', 400, sigY + 80);

    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText('RANBIDGE SOLUTIONS PRIVATE LIMITED', 400, sigY + 105);

    // Center Dynamic QR Code Box & Label
    const qrSize = 110;
    const qrX = centerX - qrSize / 2;
    const qrY = sigY - 10;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
    ctx.strokeRect(qrX, qrY, qrSize, qrSize);

    // Mock QR Code pattern grid
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(qrX + 10, qrY + 10, 30, 30);
    ctx.fillRect(qrX + qrSize - 40, qrY + 10, 30, 30);
    ctx.fillRect(qrX + 10, qrY + qrSize - 40, 30, 30);

    ctx.fillRect(qrX + 18, qrY + 18, 14, 14);
    ctx.fillRect(qrX + qrSize - 32, qrY + 18, 14, 14);
    ctx.fillRect(qrX + 18, qrY + qrSize - 32, 14, 14);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrX + 15, qrY + 15, 20, 20);
    ctx.fillRect(qrX + qrSize - 35, qrY + 15, 20, 20);
    ctx.fillRect(qrX + 15, qrY + qrSize - 35, 20, 20);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(qrX + 18, qrY + 18, 14, 14);
    ctx.fillRect(qrX + qrSize - 32, qrY + 18, 14, 14);
    ctx.fillRect(qrX + 18, qrY + qrSize - 32, 14, 14);

    // Random QR data blocks
    ctx.fillRect(qrX + 50, qrY + 15, 12, 12);
    ctx.fillRect(qrX + 50, qrY + 35, 12, 12);
    ctx.fillRect(qrX + 50, qrY + 70, 12, 12);
    ctx.fillRect(qrX + 70, qrY + 50, 12, 12);
    ctx.fillRect(qrX + 30, qrY + 50, 12, 12);

    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText('Verify Certificate', centerX, sigY + 125);

    // Right Signature: V. Konda Reddy
    ctx.font = 'italic 700 42px "Georgia", cursive';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('V. Konda Reddy..', width - 400, sigY + 30);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width - 550, sigY + 50);
    ctx.lineTo(width - 250, sigY + 50);
    ctx.stroke();

    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('Resource Person', width - 400, sigY + 80);

    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Chief Developer', width - 400, sigY + 105);

    // 10. Bottom Tagline Banner Line
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX - 420, 1225);
    ctx.lineTo(centerX - 180, 1225);
    ctx.moveTo(centerX + 180, 1225);
    ctx.lineTo(centerX + 420, 1225);
    ctx.stroke();

    ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#2563eb';
    ctx.fillText('FROM IDEAS TO IMPACT', centerX, 1230);
  };

  useEffect(() => {
    drawCertificate();
  }, [record]);

  // Download High-Resolution Certificate Image
  const handleDownload = () => {
    setIsGenerating(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Draw to ensure freshness
    drawCertificate();

    const link = document.createElement('a');
    link.download = `RANBIDGE_Certificate_${(recipientName || 'Participant').replace(/\s+/g, '_')}_${rollNumber}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsGenerating(false);

    if (onDownloadComplete) onDownloadComplete();
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Hidden High-Res Canvas element */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* HTML / CSS Live Interactive Certificate Preview Box */}
      <div style={{
        background: '#ffffff',
        border: '2px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        padding: '2.5rem 2rem',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
        backgroundSize: 'cover'
      }}>
        {/* Top-Left Geometric Accents */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '140px',
          height: '140px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0284c7 100%)',
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
          zIndex: 1
        }} />

        {/* Bottom-Right Geometric Accents */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '140px',
          height: '140px',
          background: 'linear-gradient(315deg, #1e3a8a 0%, #2563eb 50%, #0284c7 100%)',
          clipPath: 'polygon(100% 100%, 0 100%, 100% 0)',
          zIndex: 1
        }} />

        {/* Top Header Logo */}
        <div style={{ position: 'relative', zIndex: 2, marginBottom: '1.25rem' }}>
          <div style={{
            width: '54px',
            height: '42px',
            margin: '0 auto 0.4rem',
            borderTopLeftRadius: '50px',
            borderTopRightRadius: '50px',
            border: '4px solid #1e40af',
            borderBottom: 'none',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ width: '8px', height: '24px', background: '#1e40af' }} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', letterSpacing: '0.04em', margin: 0 }}>
            RANBIDGE
          </h2>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', letterSpacing: '0.08em' }}>
            SOLUTIONS PRIVATE LIMITED
          </div>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', marginTop: '2px' }}>
            — FROM IDEAS TO IMPACT —
          </div>
        </div>

        {/* Main Title */}
        <div style={{ position: 'relative', zIndex: 2, marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            CERTIFICATE
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.8rem',
            marginTop: '0.2rem'
          }}>
            <div style={{ height: '1.5px', background: '#2563eb', width: '80px' }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e40af', letterSpacing: '0.12em' }}>
              OF PARTICIPATION
            </span>
            <div style={{ height: '1.5px', background: '#2563eb', width: '80px' }} />
          </div>
        </div>

        {/* Certify Text & Name */}
        <div style={{ position: 'relative', zIndex: 2, marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1rem', color: '#475569', marginBottom: '0.5rem' }}>
            This is to certify that
          </div>
          <div style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1.8rem',
            fontWeight: 800,
            fontStyle: 'italic',
            color: '#0f172a',
            margin: '0.2rem 0'
          }}>
            {recipientName}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            marginTop: '0.25rem'
          }}>
            <div style={{ height: '1.5px', background: '#2563eb', width: '120px' }} />
            <span style={{ color: '#2563eb', fontSize: '0.75rem' }}>◇</span>
            <div style={{ height: '1.5px', background: '#2563eb', width: '120px' }} />
          </div>
        </div>

        {/* Workshop Title */}
        <div style={{ position: 'relative', zIndex: 2, marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.92rem', color: '#334155', marginBottom: '0.4rem' }}>
            for successfully participating in the <strong style={{ color: '#1e40af' }}>3-Day Workshop on</strong>
          </p>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.02em', margin: 0 }}>
            {workshopTitle}
          </h3>
        </div>

        {/* Date & College */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          alignItems: 'center',
          marginBottom: '1.5rem',
          fontSize: '0.88rem',
          fontWeight: 600,
          color: '#1e293b',
          flexWrap: 'wrap'
        }}>
          <div>📅 {workshopDate}</div>
          <div>🏛️ {collegeName}</div>
        </div>

        {/* Signatures & Verification Stamp */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1.75rem',
          paddingTop: '1rem',
          borderTop: '1px dashed var(--border-color)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Left Sig */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Georgia, cursive', fontStyle: 'italic', fontWeight: 700, fontSize: '1.2rem', color: '#0f172a' }}>
              R. Gopinath Reddy
            </div>
            <div style={{ height: '1.5px', background: '#0f172a', width: '140px', margin: '2px auto 4px' }} />
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>CEO & Managing Director</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#1e40af' }}>RANBIDGE SOLUTIONS</div>
          </div>

          {/* QR Code */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              border: '1.5px solid #0f172a',
              borderRadius: '6px',
              margin: '0 auto 4px',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              fontWeight: 800,
              color: '#1e40af'
            }}>
              VERIFIED
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1e40af' }}>Verify Certificate</span>
          </div>

          {/* Right Sig */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Georgia, cursive', fontStyle: 'italic', fontWeight: 700, fontSize: '1.2rem', color: '#0f172a' }}>
              V. Konda Reddy..
            </div>
            <div style={{ height: '1.5px', background: '#0f172a', width: '140px', margin: '2px auto 4px' }} />
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Resource Person</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b' }}>Chief Developer</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={handleDownload}
            disabled={isGenerating}
            style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
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
