'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function ForbiddenPage() {
  const { user } = useAuth();

  return (
    <div className="forbidden-container">
      <div className="glass-card forbidden-card">
        <div className="forbidden-icon-box">
          <ShieldAlert size={48} className="text-rose-400" />
        </div>

        <h1 className="forbidden-title">403 — Access Forbidden</h1>
        <p className="forbidden-desc">
          You do not have the required permissions or role to access this protected area.
          {user && (
            <span>
              {' '}Your current role is <strong className="text-primary">{user.role.toUpperCase()}</strong>.
            </span>
          )}
        </p>

        <div className="forbidden-actions">
          <Link href="/" className="btn-secondary">
            <Home size={16} /> Home
          </Link>
          {user ? (
            <Link
              href={
                user.role === 'admin'
                  ? '/admin'
                  : user.role === 'seller'
                  ? '/seller'
                  : '/marketplace'
              }
              className="btn-primary"
            >
              Go to Your Role Dashboard <ArrowLeft size={16} className="rotate-180" />
            </Link>
          ) : (
            <Link href="/login" className="btn-primary">
              Sign In with Authorized Account
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        .forbidden-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 220px);
        }
        .forbidden-card {
          max-width: 520px;
          width: 100%;
          text-align: center;
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }
        .forbidden-icon-box {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-full);
          background: rgba(244, 63, 94, 0.12);
          border: 1px solid rgba(244, 63, 94, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 25px rgba(244, 63, 94, 0.2);
        }
        .forbidden-title {
          font-size: 1.8rem;
          font-weight: 800;
        }
        .forbidden-desc {
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .forbidden-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .rotate-180 {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
}
