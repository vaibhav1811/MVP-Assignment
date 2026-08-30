'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { 
  ShoppingBag, 
  Store, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Database, 
  Lock, 
  Cpu 
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={15} className="text-indigo-400" />
          <span>Next.js Full-Stack App Router • PostgreSQL • Prisma • JWT</span>
        </div>

        <h1 className="hero-title">
          Enterprise Multi-Role <br />
          <span className="brand-highlight">Marketplace Engine</span>
        </h1>

        <p className="hero-subtitle">
          Engineered with atomic database transactions, strict role-based access control, 
          httpOnly cookie security, and a deterministic finite-state machine order lifecycle.
        </p>

        <div className="hero-cta-group">
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
              Go to Your Dashboard ({user.role.toUpperCase()}) <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-primary">
                Sign In to Platform <ArrowRight size={18} />
              </Link>
              <Link href="/register" className="btn-secondary">
                Create Free Account
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Role Cards Section */}
      <section className="roles-grid-section">
        <h2 className="section-heading">Role-Based Experiences</h2>
        <p className="section-subheading">
          Select a persona below or use the quick 1-click credentials on the sign-in page to explore:
        </p>

        <div className="roles-grid">
          {/* Buyer Card */}
          <div className="glass-card glass-card-hover role-card">
            <div className="role-card-header">
              <div className="role-icon-box box-buyer">
                <ShoppingBag size={24} />
              </div>
              <span className="role-pill pill-buyer">Buyer Persona</span>
            </div>
            <h3 className="role-card-title">Buyer Experience</h3>
            <p className="role-card-desc">
              Browse inventory in real-time, place instant orders with live price calculations and atomic stock validation, and track orders across their full lifecycle.
            </p>
            <ul className="role-features-list">
              <li><CheckCircle2 size={16} className="text-emerald-400" /> Real-time active inventory search</li>
              <li><CheckCircle2 size={16} className="text-emerald-400" /> Race-condition safe order checkout</li>
              <li><CheckCircle2 size={16} className="text-emerald-400" /> Live order timeline & status tracking</li>
            </ul>
            <Link href="/marketplace" className="role-card-link">
              Explore Marketplace <ArrowRight size={16} />
            </Link>
          </div>

          {/* Seller Card */}
          <div className="glass-card glass-card-hover role-card">
            <div className="role-card-header">
              <div className="role-icon-box box-seller">
                <Store size={24} />
              </div>
              <span className="role-pill pill-seller">Seller Persona</span>
            </div>
            <h3 className="role-card-title">Seller Hub</h3>
            <p className="role-card-desc">
              Manage product catalog, edit stock quantities, publish or soft-delete listings, and fulfill approved orders for items in your inventory.
            </p>
            <ul className="role-features-list">
              <li><CheckCircle2 size={16} className="text-cyan-400" /> Product listing creation & management</li>
              <li><CheckCircle2 size={16} className="text-cyan-400" /> Ownership-guarded update & soft delete</li>
              <li><CheckCircle2 size={16} className="text-cyan-400" /> Mark approved orders as completed</li>
            </ul>
            <Link href="/seller" className="role-card-link">
              Open Seller Hub <ArrowRight size={16} />
            </Link>
          </div>

          {/* Admin Card */}
          <div className="glass-card glass-card-hover role-card">
            <div className="role-card-header">
              <div className="role-icon-box box-admin">
                <ShieldCheck size={24} />
              </div>
              <span className="role-pill pill-admin">Admin Persona</span>
            </div>
            <h3 className="role-card-title">Admin Command</h3>
            <p className="role-card-desc">
              Supervise all platform transactions, review pending orders with 1-click Approve / Reject, and trigger automatic inventory restorations.
            </p>
            <ul className="role-features-list">
              <li><CheckCircle2 size={16} className="text-purple-400" /> Order lifecycle state machine controls</li>
              <li><CheckCircle2 size={16} className="text-purple-400" /> Automatic stock refunds on rejection</li>
              <li><CheckCircle2 size={16} className="text-purple-400" /> Revenue & order status metrics</li>
            </ul>
            <Link href="/admin" className="role-card-link">
              Launch Admin Panel <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Tech Highlights Section */}
      <section className="tech-highlights-section glass-card">
        <h2 className="tech-title">Architecture Highlights</h2>
        <div className="tech-grid">
          <div className="tech-item">
            <div className="tech-icon"><Lock size={20} /></div>
            <div>
              <h4>HttpOnly Cookie Auth</h4>
              <p>JWT signing with Jose and strict same-origin cookies protect against XSS and CSRF.</p>
            </div>
          </div>
          <div className="tech-item">
            <div className="tech-icon"><Database size={20} /></div>
            <div>
              <h4>Atomic Transactions</h4>
              <p>Prisma <code>$transaction</code> ensures zero overselling and automatic stock refunds.</p>
            </div>
          </div>
          <div className="tech-item">
            <div className="tech-icon"><Cpu size={20} /></div>
            <div>
              <h4>Order State Machine</h4>
              <p>Deterministic transitions (Pending → Approved/Rejected → Completed) guarded in services.</p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .home-container {
          display: flex;
          flex-direction: column;
          gap: 4rem;
        }
        .hero-section {
          text-align: center;
          max-width: 840px;
          margin: 1.5rem auto 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: var(--radius-full);
          padding: 0.35rem 1rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: #a5b4fc;
        }
        .hero-title {
          font-size: 3.25rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
        }
        .hero-subtitle {
          font-size: 1.15rem;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 680px;
        }
        .hero-cta-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .section-heading {
          font-size: 1.75rem;
          font-weight: 700;
          text-align: center;
        }
        .section-subheading {
          text-align: center;
          color: var(--text-muted);
          margin-top: 0.25rem;
          margin-bottom: 2rem;
        }
        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.75rem;
        }
        .role-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .role-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .role-icon-box {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
        .box-buyer {
          background: var(--emerald-gradient);
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
        }
        .box-seller {
          background: var(--cyan-gradient);
          box-shadow: 0 4px 14px rgba(6, 182, 212, 0.3);
        }
        .box-admin {
          background: var(--primary-gradient);
          box-shadow: 0 4px 14px rgba(168, 85, 247, 0.3);
        }
        .role-card-title {
          font-size: 1.35rem;
          font-weight: 700;
        }
        .role-card-desc {
          color: var(--text-muted);
          font-size: 0.92rem;
          flex: 1;
        }
        .role-features-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin: 0.5rem 0;
          font-size: 0.88rem;
          color: var(--text-secondary);
        }
        .role-features-list li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .role-card-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 600;
          color: var(--text-primary);
          text-decoration: none;
          margin-top: 0.5rem;
          font-size: 0.95rem;
          transition: gap 0.2s;
        }
        .role-card-link:hover {
          gap: 0.75rem;
          color: #818cf8;
        }
        .tech-highlights-section {
          padding: 2.5rem;
        }
        .tech-title {
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }
        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .tech-item {
          display: flex;
          gap: 1rem;
        }
        .tech-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tech-item h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .tech-item p {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.3rem;
          }
          .hero-cta-group {
            flex-direction: column;
            width: 100%;
          }
          .hero-cta-group a {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
