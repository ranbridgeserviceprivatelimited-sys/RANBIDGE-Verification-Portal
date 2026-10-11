import React, { useRef, useEffect, useState } from 'react';
import { Download, Printer, Award, Linkedin, Share2, Copy, Check, ExternalLink, X, CheckCircle2, FileCheck } from 'lucide-react';

export default function CertificateGenerator({ record, showActions = true, onDownloadComplete, showToast }) {
  const canvasRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
  const [copiedLinkedInText, setCopiedLinkedInText] = useState(false);

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

  // Generate inspiring workshop experience content for LinkedIn
  const getLinkedInPostText = () => {
    const portalUrl = window.location.origin || window.location.href;
    return `🎓 Thrilled to announce that I have successfully participated in and completed the intensive technical workshop on "${workshopTitle}" conducted by RANBIDGE Solutions! 🚀

💡 Experience & Key Insights Gained:
• Acquired practical, hands-on knowledge in translating early-stage ideas into Minimum Viable Products (MVPs).
• Learned real-world engineering problem solving, agile execution, and entrepreneurship methodologies.
• Mentored by industry professionals on startup workflows, tech validation, and modern product frameworks.

📜 Verified Certificate Credential:
• Participant Name: ${recipientName}
• Institution: ${collegeName}
• Department / Branch: ${record?.department || 'Engineering & Technology'}
• Roll Number: ${rollNumber}
• Certificate ID: ${record?.id || rollNumber}
• Verification Portal: ${portalUrl}

A sincere thank you to the expert instructors and mentors at RANBIDGE Solutions for delivering such an enriching, career-defining learning experience! Excited to continue building and innovating! ✨

#RANBIDGE #RANBRIDGESolutions #StudentAchievement #WorkshopExperience #Entrepreneurship #IdeaToMVP #Engineering #Upskilling #ContinuousLearning #Innovation #TechSkills`;
  };

  // Direct Share to LinkedIn Action
  const handleShareLinkedIn = () => {
    const postText = getLinkedInPostText();

    // 1. Copy formatted workshop experience text to clipboard
    try {
      navigator.clipboard.writeText(postText);
      setCopiedLinkedInText(true);
      setTimeout(() => setCopiedLinkedInText(false), 3000);
    } catch (err) {
      console.warn('Clipboard write error:', err);
    }

    // 2. Automatically trigger Certificate Image download so it's ready in Downloads to attach
    handleDownload();

    // 3. Try copying image directly to clipboard if browser supports ClipboardItem
    const canvas = canvasRef.current;
    if (canvas && navigator.clipboard && window.ClipboardItem) {
      try {
        canvas.toBlob((blob) => {
          if (blob) {
            navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]).catch(() => {});
          }
        });
      } catch (e) {}
    }

    // 4. Open LinkedIn Feed Post Composer with text pre-filled
    const linkedinComposerUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(postText)}`;
    window.open(linkedinComposerUrl, '_blank', 'width=750,height=800,scrollbars=yes');

    // 5. Open LinkedIn Share Modal with helper instructions
    setIsLinkedInModalOpen(true);

    if (showToast) {
      showToast('🚀 LinkedIn post opened with pre-filled content! Certificate PNG downloaded to attach.');
    }
  };

  const handleCopyPostTextOnly = () => {
    const postText = getLinkedInPostText();
    navigator.clipboard.writeText(postText);
    setCopiedLinkedInText(true);
    if (showToast) showToast('📋 Copied LinkedIn post text to clipboard!');
    setTimeout(() => setCopiedLinkedInText(false), 2500);
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
        <div className="cert-action-buttons">
          <button
            className="btn-primary cert-action-btn"
            onClick={handleDownload}
            disabled={isGenerating}
            title={isGenerating ? "Generating PNG..." : "Download Official Certificate (PNG)"}
          >
            <Download size={18} />
            <span>Download Certificate</span>
          </button>
          
          <button
            className="btn-secondary cert-action-btn"
            onClick={handlePrint}
            title="Print Certificate"
          >
            <Printer size={18} />
            <span>Print</span>
          </button>

          <button
            type="button"
            className="btn-linkedin cert-action-btn"
            onClick={handleShareLinkedIn}
            title="Share on LinkedIn with Certificate & Workshop Experience"
          >
            <Linkedin size={18} />
            <span>Share on LinkedIn</span>
          </button>
        </div>
      )}

      {/* LinkedIn Share Helper Modal */}
      {isLinkedInModalOpen && (
        <div className="admin-modal-overlay" style={{ zIndex: 1400 }} onClick={() => setIsLinkedInModalOpen(false)}>
          <div className="pin-modal-container" style={{ maxWidth: '640px', width: '92%', padding: '1.75rem', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <button className="btn-icon-close pin-close-pos" onClick={() => setIsLinkedInModalOpen(false)} title="Close">
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{ background: '#0a66c2', color: '#ffffff', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Linkedin size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Share on LinkedIn
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Post your certificate and hands-on workshop experience with your network.
                </p>
              </div>
            </div>

            {/* Steps Guide */}
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 'var(--radius-md)', padding: '0.9rem 1.15rem', marginBottom: '1.25rem', fontSize: '0.84rem', color: '#0369a1' }}>
              <div style={{ fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="#0284c7" /> Easy 3-Step Sharing:
              </div>
              <ol style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.6 }}>
                <li>We opened LinkedIn with your experience post text pre-filled.</li>
                <li>Your Certificate PNG is downloaded. Click the <strong>Media/Photo icon</strong> on LinkedIn and select your certificate.</li>
                <li>Click <strong>Post</strong> to share your accomplishment!</li>
              </ol>
            </div>

            {/* Post Content Preview Box */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Workshop Experience Content:
                </label>
                <button
                  type="button"
                  onClick={handleCopyPostTextOnly}
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  {copiedLinkedInText ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  <span>{copiedLinkedInText ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>
              <textarea
                readOnly
                value={getLinkedInPostText()}
                rows={7}
                className="form-input"
                style={{ fontSize: '0.82rem', fontFamily: 'inherit', resize: 'none', background: 'var(--bg-secondary)', lineHeight: 1.5 }}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleDownload}
                style={{ padding: '0.7rem 1.2rem', fontSize: '0.88rem' }}
              >
                <Download size={16} /> Re-Download PNG
              </button>
              <button
                type="button"
                className="btn-linkedin"
                onClick={() => {
                  const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(getLinkedInPostText())}`;
                  window.open(url, '_blank', 'width=750,height=800,scrollbars=yes');
                }}
                style={{ padding: '0.7rem 1.4rem', fontSize: '0.88rem' }}
              >
                <ExternalLink size={16} /> Open LinkedIn Composer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

