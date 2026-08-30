'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { 
  ShoppingBag, 
  Store, 
  ShieldCheck, 
  ClipboardList, 
  PlusCircle, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="role-pill pill-admin"><ShieldCheck size={13} /> ADMIN</span>;
      case 'seller':
        return <span className="role-pill pill-seller"><Store size={13} /> SELLER</span>;
      case 'buyer':
        return <span className="role-pill pill-buyer"><ShoppingBag size={13} /> BUYER</span>;
      default:
        return null;
    }
  };

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link href="/" className="navbar-brand">
          <div className="brand-logo-icon">
            <ShoppingBag size={22} />
          </div>
          <span className="brand-text">
            Market<span className="brand-highlight">MVP</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="navbar-nav desktop-nav">
          <Link
            href="/marketplace"
            className={`nav-link ${isActive('/marketplace') ? 'nav-active' : ''}`}
          >
            <ShoppingBag size={16} />
            <span>Marketplace</span>
          </Link>

          {user?.role === 'buyer' && (
            <Link
              href="/my-orders"
              className={`nav-link ${isActive('/my-orders') ? 'nav-active' : ''}`}
            >
              <ClipboardList size={16} />
              <span>My Orders</span>
            </Link>
          )}

          {(user?.role === 'seller' || user?.role === 'admin') && (
            <>
              <Link
                href="/seller"
                className={`nav-link ${isActive('/seller') && !isActive('/seller/new') ? 'nav-active' : ''}`}
              >
                <Store size={16} />
                <span>Seller Hub</span>
              </Link>
              <Link
                href="/seller/new"
                className={`nav-link ${isActive('/seller/new') ? 'nav-active' : ''}`}
              >
                <PlusCircle size={16} />
                <span>New Listing</span>
              </Link>
            </>
          )}

          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className={`nav-link ${isActive('/admin') ? 'nav-active' : ''}`}
            >
              <ShieldCheck size={16} />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* Auth / User Actions */}
        <div className="navbar-actions desktop-actions">
          {loading ? (
            <div className="nav-skeleton" />
          ) : user ? (
            <div className="user-profile-menu">
              <div className="user-info-chip">
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
                </div>
                <div className="user-text-meta">
                  <span className="user-name">{user.name}</span>
                  {getRoleBadge(user.role)}
                </div>
              </div>
              <button
                onClick={logout}
                className="btn-logout"
                title="Sign out of account"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-button-group">
              <Link href="/login" className="btn-nav btn-nav-ghost">
                Sign In
              </Link>
              <Link href="/register" className="btn-nav btn-nav-primary">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileOpen(false)}>
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            {user && (
              <div className="mobile-user-card">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
                <div className="mt-2">{getRoleBadge(user.role)}</div>
              </div>
            )}

            <div className="mobile-nav-links">
              <Link
                href="/marketplace"
                className={`mobile-link ${isActive('/marketplace') ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <ShoppingBag size={18} /> Marketplace
              </Link>

              {user?.role === 'buyer' && (
                <Link
                  href="/my-orders"
                  className={`mobile-link ${isActive('/my-orders') ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <ClipboardList size={18} /> My Orders
                </Link>
              )}

              {(user?.role === 'seller' || user?.role === 'admin') && (
                <>
                  <Link
                    href="/seller"
                    className={`mobile-link ${isActive('/seller') && !isActive('/seller/new') ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Store size={18} /> Seller Hub
                  </Link>
                  <Link
                    href="/seller/new"
                    className={`mobile-link ${isActive('/seller/new') ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <PlusCircle size={18} /> New Listing
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className={`mobile-link ${isActive('/admin') ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <ShieldCheck size={18} /> Admin Panel
                </Link>
              )}
            </div>

            <div className="mobile-auth-footer">
              {user ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="btn-mobile-logout"
                >
                  <LogOut size={18} /> Logout
                </button>
              ) : (
                <div className="mobile-guest-buttons">
                  <Link
                    href="/login"
                    className="btn-mobile-login"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="btn-mobile-register"
                    onClick={() => setMobileOpen(false)}
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
