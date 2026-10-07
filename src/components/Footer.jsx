import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>
          RANBIDGE Solutions Private Limited
        </p>
        <p>&copy; {new Date().getFullYear()} RANBIDGE Solutions Private Limited. All Rights Reserved. Verification Portal.</p>
      </div>
    </footer>
  );
}
