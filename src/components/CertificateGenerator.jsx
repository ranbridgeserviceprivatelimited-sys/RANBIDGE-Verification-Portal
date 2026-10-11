import React, { useRef, useEffect, useState } from 'react';
import { Download, Printer, Award, Linkedin, Share2, Copy, Check, ExternalLink, X, CheckCircle2, FileCheck } from 'lucide-react';
import referenceCertImg from '../assets/reference_certificate.png';

let globalTemplateImage = null;

// Preload the official certificate template image reliably across environments
const preloadTemplate = () => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (globalTemplateImage && globalTemplateImage.complete && globalTemplateImage.naturalWidth > 0) {
    return Promise.resolve(globalTemplateImage);
  }

  return new Promise((resolve) => {
    const sources = [
      referenceCertImg,
      '/reference_certificate.png',
      '/assets/reference_certificate.png'
    ];

    let index = 0;
    const tryNext = () => {
      if (index >= sources.length) {
        resolve(null);
        return;
      }
      const candidate = sources[index++];
      const img = new Image();
      img.onload = () => {
        globalTemplateImage = img;
        resolve(img);
      };
      img.onerror = () => {
        tryNext();
      };
      img.src = candidate;
      if (img.complete && img.naturalWidth > 0) {
        globalTemplateImage = img;
        resolve(img);
      }
    };

    tryNext();
  });
};

// Start preloading template image immediately
preloadTemplate();

export default function CertificateGenerator({ 
  record, 
  showActions = true, 
  onDownloadComplete, 
  showToast,
  customTemplateUrl,
  portalSettings
}) {
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
  const workshopTitle = safeText(record?.workshopName || record?.workshop, 'IDEA TO MVP – ENTREPRENEURSHIP & STARTUPS');
  const durationText = safeText(record?.workshopDuration || record?.duration, '3-Day');
  const rollNumber = safeText(record?.rollNumber || record?.id, 'REG-2026');
  const rawDate = safeText(record?.workshopDate || record?.date, 'October 7, 2026');
  const workshopDate = (typeof rawDate === 'string' && (rawDate.includes('[object') || rawDate.includes('HTML') || rawDate.trim() === '' || rawDate === 'N/A')) ? 'October 7, 2026' : rawDate;

  // Resolve custom template from props, record, or program settings
  const customTemplate = customTemplateUrl || 
    record?.certificateTemplate || 
    record?.certificateTemplateUrl ||
    (portalSettings?.programs && Array.isArray(portalSettings.programs)
      ? portalSettings.programs.find(p => 
          p.title && (p.title.trim().toLowerCase() === (record?.workshopName || record?.workshop || '').trim().toLowerCase())
        )?.certificateTemplate
      : null);

  const loadTemplateImage = async () => {
    if (customTemplate) {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => {
          preloadTemplate().then(resolve);
        };
        img.src = customTemplate;
        if (img.complete && img.naturalWidth > 0) resolve(img);
      });
    }
    return preloadTemplate();
  };

  // Draw High-Resolution Official Certificate on HTML5 Canvas using reference image or uploaded template
  const drawCertificate = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const width = 1414;
      const height = 1000;

      canvas.width = width;
      canvas.height = height;

      const bgImg = await loadTemplateImage();
      if (!canvasRef.current) return;

      if (bgImg && bgImg.naturalWidth > 0) {
        setImgLoaded(true);
        ctx.drawImage(bgImg, 0, 0, width, height);

        const centerX = width / 2;

        if (!customTemplate) {
          // Clean patch over name placeholder for official reference template
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(240, 455, 934, 75);
        }

        // Recipient Name in elegant serif
        ctx.textAlign = 'center';
        ctx.font = 'bold italic 44px "Georgia", serif';
        ctx.fillStyle = '#0c2340';
        ctx.fillText(recipientName, centerX, 502);

        // Elegant Decorative Underline with Diamond Accent
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

        if (!customTemplate) {
          // Clean patch over workshop prefix and title
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

          // Workshop Title in bold uppercase
          ctx.textAlign = 'center';
          ctx.font = '900 34px "Plus Jakarta Sans", "Inter", sans-serif';
          ctx.fillStyle = '#0c2340';
          ctx.fillText(workshopTitle.toUpperCase(), centerX, 628);

          // Clean patch over date & college line
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
        } else {
          // For custom uploaded event certificate, cleanly render participant details
          ctx.textAlign = 'center';
          ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#1e293b';
          ctx.fillText(`${collegeName} • Roll: ${rollNumber}`, centerX, 570);
          ctx.font = '500 18px "Georgia", serif';
          ctx.fillStyle = '#475569';
          ctx.fillText(`Issued on ${workshopDate} | Verification ID: ${rollNumber}`, centerX, 610);
        }
      }
    } catch (err) {
      console.error('Canvas draw error:', err);
    }
  };

  useEffect(() => {
    drawCertificate();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => drawCertificate());
    }
  }, [record, recipientName, collegeName, workshopTitle, durationText, workshopDate, rollNumber]);

  // Download High-Resolution Certificate Image
  const handleDownload = async () => {
    setIsGenerating(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    await drawCertificate();

    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `RANBIDGE_Certificate_${(recipientName || 'Participant').replace(/\s+/g, '_')}_${rollNumber}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsGenerating(false);
      if (onDownloadComplete) onDownloadComplete();
    }, 100);
  };

  // Print Certificate Action
  const handlePrint = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    await drawCertificate();

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
• Program: ${workshopTitle}
• Duration: ${durationText}
• Department / Branch: ${record?.department || 'Engineering & Technology'}
• Roll Number: ${rollNumber}
• Certificate ID: ${record?.id || rollNumber}
• Verification Portal: ${portalUrl}

A sincere thank you to the expert instructors and mentors at RANBIDGE Solutions for delivering such an enriching, career-defining learning experience! Excited to continue building and innovating! ✨

#RANBIDGE #RANBRIDGESolutions #StudentAchievement #WorkshopExperience #Entrepreneurship #IdeaToMVP #Engineering #Upskilling #ContinuousLearning #Innovation #TechSkills`;
  };

  // Close LinkedIn modal on Escape key
  useEffect(() => {
    if (!isLinkedInModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLinkedInModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLinkedInModalOpen]);

  // Copy image to clipboard so user can press Ctrl+V directly inside LinkedIn post
  const handleCopyCertificateImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const certBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
      if (certBlob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': certBlob })
        ]);
        if (showToast) {
          showToast('🖼️ Certificate image copied to clipboard! You can paste (Ctrl+V) directly into LinkedIn!');
        }
      }
    } catch (err) {
      console.warn('Clipboard image write error:', err);
      handleDownload();
    }
  };

  // Direct Share to LinkedIn Action (opens LinkedIn feed composer immediately, copies text & downloads certificate)
  const handleShareLinkedIn = async () => {
    const postText = getLinkedInPostText();

    // 1. Immediately open LinkedIn in a new tab synchronously (NEVER blocked by browser popup blockers)
    const linkedinComposerUrl = 'https://www.linkedin.com/feed/?shareActive=true';
    window.open(linkedinComposerUrl, '_blank');

    // 2. Automatically copy formatted workshop experience text to clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(postText);
        setCopiedLinkedInText(true);
        setTimeout(() => setCopiedLinkedInText(false), 3500);
      }
    } catch (err) {
      console.warn('Clipboard write error:', err);
    }

    // 3. Automatically download the high-resolution Certificate PNG so it's ready to attach
    handleDownload();

    // 4. Open guidance modal in the portal
    setIsLinkedInModalOpen(true);

    if (showToast) {
      showToast('🚀 Redirected to LinkedIn! Press Ctrl+V in the post box to paste your text, and attach your certificate!');
    }
  };

  // Add Certificate to LinkedIn Profile (Licenses & Certifications)
  const handleAddToLinkedInProfile = () => {
    const portalUrl = window.location.origin || window.location.href;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const certName = encodeURIComponent(workshopTitle || 'Technical Certification');
    const orgName = encodeURIComponent('RANBIDGE Solutions');
    const certId = encodeURIComponent(rollNumber || 'REG-2026');
    const certUrl = encodeURIComponent(portalUrl);

    const addUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&organizationName=${orgName}&issueYear=${currentYear}&issueMonth=${currentMonth}&certUrl=${certUrl}&certId=${certId}`;
    window.open(addUrl, '_blank');

    if (showToast) {
      showToast('🎓 Opened LinkedIn Add Certification form with your certificate details pre-filled!');
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

          <button
            type="button"
            className="btn-secondary cert-action-btn"
            onClick={handleAddToLinkedInProfile}
            title="Add this certificate to your LinkedIn Profile under Licenses & Certifications"
            style={{ border: '1.5px solid #0a66c2', color: '#0a66c2' }}
          >
            <Award size={18} />
            <span>Add to Profile</span>
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

            <div className="linkedin-modal-header" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem', paddingRight: '2.5rem' }}>
              <div style={{
                background: '#0a66c2',
                color: '#ffffff',
                width: '46px',
                height: '46px',
                minWidth: '46px',
                minHeight: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(10, 102, 194, 0.35)',
                border: '2px solid rgba(255, 255, 255, 0.9)'
              }}>
                <Linkedin size={24} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2, margin: 0 }}>
                  Share on LinkedIn
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                  Post your certificate and hands-on workshop experience with your network.
                </p>
              </div>
            </div>

            {/* Steps Guide */}
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 'var(--radius-md)', padding: '0.9rem 1.15rem', marginBottom: '1.25rem', fontSize: '0.84rem', color: '#0369a1' }}>
              <div style={{ fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="#0284c7" /> Easy 2-Step Sharing in LinkedIn:
              </div>
              <ol style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.6 }}>
                <li><strong>Paste Content:</strong> Click into the LinkedIn post box and press <kbd style={{ background: '#ffffff', padding: '0.1rem 0.35rem', borderRadius: '3px', border: '1px solid #cbd5e1' }}>Ctrl+V</kbd> to paste your experience post text.</li>
                <li><strong>Attach Certificate:</strong> Your high-resolution certificate is already saved in your Downloads. Drag and drop it into the post, or click LinkedIn's <strong>Media/Photo icon</strong>!</li>
              </ol>
            </div>

            {/* Post Content Preview Box */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Workshop Experience Content:
                </label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={handleCopyPostTextOnly}
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    {copiedLinkedInText ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    <span>{copiedLinkedInText ? 'Text Copied!' : 'Copy Text'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyCertificateImage}
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Copy certificate image to clipboard to paste directly into LinkedIn"
                  >
                    <Copy size={14} />
                    <span>Copy Image</span>
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                value={getLinkedInPostText()}
                rows={6}
                className="form-input"
                style={{ fontSize: '0.82rem', fontFamily: 'inherit', resize: 'none', background: 'var(--bg-secondary)', lineHeight: 1.5 }}
              />
            </div>

            {/* Modal Actions */}
            <div className="linkedin-modal-actions" style={{ display: 'flex', gap: '0.65rem', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleAddToLinkedInProfile}
                style={{ padding: '0.6rem 1rem', fontSize: '0.84rem', color: '#0a66c2', borderColor: '#0a66c2' }}
              >
                <Award size={16} /> Add to Profile (Licenses)
              </button>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleDownload}
                  style={{ padding: '0.6rem 1rem', fontSize: '0.84rem' }}
                >
                  <Download size={15} /> Re-Download PNG
                </button>
                <button
                  type="button"
                  className="btn-linkedin"
                  onClick={() => {
                    const url = 'https://www.linkedin.com/feed/?shareActive=true';
                    window.open(url, '_blank');
                  }}
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.84rem' }}
                >
                  <ExternalLink size={15} /> Re-Open LinkedIn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

