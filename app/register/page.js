'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/ToastContext';
import { Lock, Mail, User as UserIcon, ArrowRight, Store, ShoppingBag, Loader2, Info } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer'); // 'buyer' or 'seller'
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      error('Please complete all registration fields');
      return;
    }

    if (password.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const user = await register({ name, email, password, role });
      success(`Account created successfully! Welcome, ${user.name}`);
      if (user.role === 'seller') {
        router.push('/seller');
      } else {
        router.push('/marketplace');
      }
    } catch (err) {
      error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join the marketplace as a buyer or merchant seller</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Role Selection Toggle */}
          <div className="role-select-group">
            <label className="form-label">Select Account Role</label>
            <div className="role-options-grid">
              <button
                type="button"
                className={`role-option-btn ${role === 'buyer' ? 'role-selected-buyer' : ''}`}
                onClick={() => setRole('buyer')}
              >
                <ShoppingBag size={20} />
                <div className="role-option-text">
                  <strong>Buyer</strong>
                  <span>Browse & place orders</span>
                </div>
              </button>

              <button
                type="button"
                className={`role-option-btn ${role === 'seller' ? 'role-selected-seller' : ''}`}
                onClick={() => setRole('seller')}
              >
                <Store size={20} />
                <div className="role-option-text">
                  <strong>Seller</strong>
                  <span>List & sell products</span>
                </div>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name / Business Name
            </label>
            <div className="input-with-icon">
              <UserIcon size={18} className="input-icon" />
              <input
                id="name"
                type="text"
                required
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password (min 6 characters)
            </label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="admin-notice-banner">
            <Info size={16} />
            <span>Admin accounts are protected and cannot be self-registered.</span>
          </div>

          <button type="submit" disabled={loading} className="btn-primary auth-submit-btn">
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Creating Account...
              </>
            ) : (
              <>
                Complete Registration <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link href="/login" className="auth-link">
            Sign In
          </Link>
        </div>
      </div>

      <style jsx>{`
        .auth-page-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 200px);
        }
        .auth-card {
          max-width: 500px;
          width: 100%;
          padding: 2.25rem;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .auth-title {
          font-size: 1.75rem;
          font-weight: 700;
        }
        .auth-subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }
        .role-select-group {
          margin-bottom: 1.25rem;
        }
        .role-options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-top: 0.35rem;
        }
        .role-option-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem;
          background: rgba(13, 19, 33, 0.85);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          color: var(--text-muted);
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }
        .role-option-text {
          display: flex;
          flex-direction: column;
        }
        .role-option-text strong {
          font-size: 0.9rem;
          color: var(--text-primary);
        }
        .role-option-text span {
          font-size: 0.72rem;
          color: var(--text-dim);
        }
        .role-selected-buyer {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.12);
          color: #34d399;
          box-shadow: 0 0 14px rgba(16, 185, 129, 0.2);
        }
        .role-selected-seller {
          border-color: #06b6d4;
          background: rgba(6, 182, 212, 0.12);
          color: #38bdf8;
          box-shadow: 0 0 14px rgba(6, 182, 212, 0.2);
        }
        .input-with-icon {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-dim);
        }
        .input-with-icon .form-input {
          padding-left: 2.75rem;
        }
        .admin-notice-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 0.8rem;
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
          color: #a5b4fc;
          margin-bottom: 1.25rem;
        }
        .auth-submit-btn {
          width: 100%;
        }
        .auth-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
          font-size: 0.88rem;
          color: var(--text-muted);
        }
        .auth-link {
          color: #818cf8;
          text-decoration: none;
          font-weight: 600;
        }
        .auth-link:hover {
          text-decoration: underline;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
