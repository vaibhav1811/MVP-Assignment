'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/ToastContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Store, ShoppingBag, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      success(`Welcome back, ${user.name}!`);

      if (redirectPath) {
        router.push(redirectPath);
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'seller') {
        router.push('/seller');
      } else {
        router.push('/marketplace');
      }
    } catch (err) {
      error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your multi-role marketplace account</p>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="quick-demo-section">
          <span className="quick-demo-label">1-Click Demo Credentials:</span>
          <div className="quick-demo-buttons">
            <button
              type="button"
              className="quick-btn btn-quick-admin"
              onClick={() => handleQuickLogin('admin@marketplace.local', 'AdminPassword123!')}
            >
              <ShieldCheck size={14} /> Admin
            </button>
            <button
              type="button"
              className="quick-btn btn-quick-seller"
              onClick={() => handleQuickLogin('seller@marketplace.local', 'SellerPassword123!')}
            >
              <Store size={14} /> Seller
            </button>
            <button
              type="button"
              className="quick-btn btn-quick-buyer"
              onClick={() => handleQuickLogin('buyer@marketplace.local', 'BuyerPassword123!')}
            >
              <ShoppingBag size={14} /> Buyer
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
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
              Password
            </label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary auth-submit-btn">
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Signing In...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don&apos;t have an account yet?</span>
          <Link href="/register" className="auth-link">
            Create Account
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
          max-width: 460px;
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
        .quick-demo-section {
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.85rem;
          margin-bottom: 1.5rem;
        }
        .quick-demo-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-dim);
          margin-bottom: 0.5rem;
        }
        .quick-demo-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.5rem;
        }
        .quick-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.4rem 0.6rem;
          font-size: 0.78rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.15s;
        }
        .btn-quick-admin {
          background: rgba(168, 85, 247, 0.15);
          color: #c084fc;
          border-color: rgba(168, 85, 247, 0.3);
        }
        .btn-quick-admin:hover {
          background: rgba(168, 85, 247, 0.25);
        }
        .btn-quick-seller {
          background: rgba(6, 182, 212, 0.15);
          color: #38bdf8;
          border-color: rgba(6, 182, 212, 0.3);
        }
        .btn-quick-seller:hover {
          background: rgba(6, 182, 212, 0.25);
        }
        .btn-quick-buyer {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.3);
        }
        .btn-quick-buyer:hover {
          background: rgba(16, 185, 129, 0.25);
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
        .auth-submit-btn {
          width: 100%;
          margin-top: 0.5rem;
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
