'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/ToastContext';
import { apiClient } from '@/lib/apiClient';
import { 
  ArrowLeft, 
  Store, 
  Package, 
  Sparkles, 
  Loader2, 
  Check, 
  ShoppingBag,
  DollarSign,
  Layers
} from 'lucide-react';

export default function NewListingPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantityAvailable, setQuantityAvailable] = useState('10');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !price || !quantityAvailable) {
      error('Please complete all required listing fields');
      return;
    }

    const numPrice = parseFloat(price);
    const numStock = parseInt(quantityAvailable, 10);

    if (isNaN(numPrice) || numPrice <= 0) {
      error('Price must be a valid positive amount');
      return;
    }

    if (isNaN(numStock) || numStock < 0) {
      error('Quantity must be 0 or greater');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/api/listings', {
        title,
        description,
        price: numPrice,
        quantityAvailable: numStock,
        isActive,
      });

      success('New listing published successfully!');
      router.push('/seller');
    } catch (err) {
      error(err.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="new-listing-container">
      {/* Back button */}
      <div>
        <Link href="/seller" className="back-link">
          <ArrowLeft size={16} /> Back to Seller Hub
        </Link>
      </div>

      <div className="page-header">
        <h1 className="page-title">Create Product Listing</h1>
        <p className="page-subtitle">
          Publish a new item to the active marketplace catalog with real-time stock allocation.
        </p>
      </div>

      <div className="form-and-preview-grid">
        {/* Form Card */}
        <div className="glass-card form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Product Title <span className="text-rose-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                placeholder="e.g. Ultra HD 4K Mechanical Webcam"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description & Specifications <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="description"
                rows={4}
                required
                placeholder="Detail key features, technical specifications, and condition..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
              />
            </div>

            <div className="grid-2-col">
              <div className="form-group">
                <label className="form-label" htmlFor="price">
                  Unit Price ($ USD) <span className="text-rose-400">*</span>
                </label>
                <div className="input-prefix-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="49.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-input with-prefix"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="quantity">
                  Available Quantity in Stock <span className="text-rose-400">*</span>
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="0"
                  required
                  placeholder="25"
                  value={quantityAvailable}
                  onChange={(e) => setQuantityAvailable(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="custom-checkbox"
                />
                <span>Publish as Active immediately for buyers</span>
              </label>
            </div>

            <div className="form-actions mt-4">
              <Link href="/seller" className="btn-secondary">
                Cancel
              </Link>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Publishing...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Publish Listing
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Marketplace Card Preview */}
        <div className="preview-column">
          <h3 className="preview-label">Live Marketplace Preview</h3>
          <div className="glass-card listing-card preview-card">
            <div className="listing-card-header">
              <div className="seller-badge">
                <Store size={14} />
                <span>{user?.name || 'Your Merchant Account'}</span>
              </div>
              <span className={`stock-pill ${parseInt(quantityAvailable, 10) > 0 ? 'stock-ok' : 'stock-out'}`}>
                {parseInt(quantityAvailable, 10) > 0 ? `${quantityAvailable} available` : 'Out of Stock'}
              </span>
            </div>

            <div className="listing-body">
              <h3 className="listing-title">
                {title.trim() || 'Product Title Will Appear Here'}
              </h3>
              <p className="listing-desc">
                {description.trim() || 'Enter your product description to preview how potential buyers will see your listing.'}
              </p>
            </div>

            <div className="listing-footer">
              <div className="price-tag">
                <span className="currency">$</span>
                <span className="amount">{price ? parseFloat(price).toFixed(2) : '0.00'}</span>
              </div>

              <button disabled className="btn-primary buy-btn">
                <ShoppingBag size={16} /> Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .new-listing-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 1040px;
          margin: 0 auto;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 500;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: #818cf8;
        }
        .page-title {
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .page-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-top: 0.25rem;
        }
        .form-and-preview-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 2rem;
          align-items: start;
        }
        .grid-2-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .input-prefix-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-prefix {
          position: absolute;
          left: 1rem;
          color: #818cf8;
          font-weight: 700;
        }
        .with-prefix {
          padding-left: 2.2rem;
        }
        .checkbox-group {
          margin-top: 0.75rem;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.88rem;
          color: var(--text-secondary);
          cursor: pointer;
        }
        .custom-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #6366f1;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }
        .preview-column {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .preview-label {
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-dim);
          font-weight: 700;
        }
        .preview-card {
          border: 1px dashed rgba(99, 102, 241, 0.35);
        }
        .listing-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.85rem;
        }
        .seller-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .stock-pill {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
        }
        .stock-ok {
          background: rgba(16, 185, 129, 0.12);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .stock-out {
          background: rgba(244, 63, 94, 0.15);
          color: #fb7185;
          border: 1px solid rgba(244, 63, 94, 0.35);
        }
        .listing-title {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }
        .listing-desc {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 1.25rem;
          min-height: 4.5rem;
        }
        .listing-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid var(--border-subtle);
        }
        .price-tag {
          display: flex;
          align-items: baseline;
          color: var(--text-primary);
        }
        .currency {
          font-size: 1rem;
          font-weight: 600;
          color: #818cf8;
          margin-right: 2px;
        }
        .amount {
          font-size: 1.45rem;
          font-weight: 800;
        }
        .buy-btn {
          padding: 0.6rem 1.1rem;
          font-size: 0.88rem;
          opacity: 0.6;
        }
        @media (max-width: 840px) {
          .form-and-preview-grid {
            grid-template-columns: 1fr;
          }
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
