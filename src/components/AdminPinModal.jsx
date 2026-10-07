import React, { useState, useEffect } from 'react';
import { Lock, Key, X, AlertTriangle } from 'lucide-react';

const ADMIN_SECRET_PIN = '824739';

export default function AdminPinModal({ isOpen, onClose, onSuccess, showToast }) {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_SECRET_PIN) {
      setError(false);
      setPinInput('');
      onSuccess();
      showToast('🔑 Admin Authenticated Successfully!');
    } else {
      setError(true);
      setPinInput('');
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="pin-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="btn-icon-close pin-close-pos" onClick={onClose} title="Cancel">
          <X size={20} />
        </button>

        <div className="pin-header">
          <div className="pin-icon-wrapper">
            <Lock size={28} />
          </div>
          <h2>Admin Authentication</h2>
          <p>Enter the 6-digit security PIN to access the Secret Admin Portal.</p>
        </div>

        <form onSubmit={handleSubmit} className="pin-form">
          <div className="pin-input-group">
            <input
              type="password"
              className="pin-input"
              maxLength={6}
              placeholder="••••••"
              value={pinInput}
              onChange={(e) => {
                setError(false);
                setPinInput(e.target.value);
              }}
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="pin-error-msg">
              <AlertTriangle size={16} /> Incorrect PIN. Access Denied.
            </div>
          )}

          <div className="pin-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <span>Unlock Dashboard</span>
              <Key size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
