'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/ToastContext';
import { apiClient } from '@/lib/apiClient';
import { 
  Search, 
  ShoppingBag, 
  Store, 
  Package, 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  Minus, 
  X, 
  Loader2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function MarketplacePage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Buy Modal state
  const [selectedListing, setSelectedListing] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ isActive: 'true' });
      if (search.trim()) query.set('search', search.trim());

      const data = await apiClient.get(`/api/listings?${query.toString()}`);
      setListings(data.listings || []);
    } catch (err) {
      error('Failed to load listings: ' + (err.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  }, [search, error]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchListings]);

  const handleOpenBuyModal = (listing) => {
    if (!user) {
      router.push('/login?redirect=/marketplace');
      return;
    }
    if (user.role !== 'buyer') {
      error(`You are logged in as '${user.role.toUpperCase()}'. Only Buyers can place orders.`);
      return;
    }
    setSelectedListing(listing);
    setQuantity(1);
  };

  const handleCloseBuyModal = () => {
    setSelectedListing(null);
    setQuantity(1);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedListing) return;

    if (quantity < 1 || quantity > selectedListing.quantityAvailable) {
      error(`Please select a valid quantity between 1 and ${selectedListing.quantityAvailable}`);
      return;
    }

    setSubmittingOrder(true);
    try {
      const data = await apiClient.post('/api/orders', {
        listingId: selectedListing.id,
        quantity: quantity,
      });

      success(`Order placed successfully! Order ID: ${data.order.id.slice(0, 8)}... (Status: Pending)`);
      handleCloseBuyModal();
      // Refresh listings to update available stock
      fetchListings();
    } catch (err) {
      error(err.message || 'Failed to place order.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const formatPrice = (p) => {
    const num = parseFloat(p);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <div className="marketplace-container">
      {/* Marketplace Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Marketplace</h1>
          <p className="page-subtitle">
            Explore active products from verified merchants with live inventory guarantees.
          </p>
        </div>

        {user?.role === 'buyer' && (
          <Link href="/my-orders" className="btn-secondary">
            <ShoppingBag size={18} /> View My Orders
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="search-bar-wrapper">
        <div className="search-input-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search products by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button onClick={() => setSearch('')} className="search-clear-btn">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="loading-state">
          <Loader2 size={36} className="animate-spin text-indigo-400" />
          <p>Loading active listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="empty-state glass-card">
          <Package size={48} className="text-dim" />
          <h3>No Active Listings Found</h3>
          <p>
            {search
              ? `No products matched "${search}". Try searching for something else.`
              : 'There are currently no active products in the marketplace.'}
          </p>
          {user?.role === 'seller' && (
            <Link href="/seller/new" className="btn-primary mt-3">
              <Plus size={16} /> Create Your First Listing
            </Link>
          )}
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map((item) => {
            const isOutOfStock = item.quantityAvailable <= 0;
            const isLowStock = item.quantityAvailable > 0 && item.quantityAvailable <= 5;

            return (
              <div key={item.id} className="glass-card glass-card-hover listing-card">
                <div className="listing-card-header">
                  <div className="seller-badge">
                    <Store size={14} />
                    <span>{item.seller?.name || 'Verified Seller'}</span>
                  </div>
                  {isOutOfStock ? (
                    <span className="stock-pill stock-out">Out of Stock</span>
                  ) : isLowStock ? (
                    <span className="stock-pill stock-low">Only {item.quantityAvailable} left!</span>
                  ) : (
                    <span className="stock-pill stock-ok">{item.quantityAvailable} available</span>
                  )}
                </div>

                <div className="listing-body">
                  <h3 className="listing-title">{item.title}</h3>
                  <p className="listing-desc">{item.description}</p>
                </div>

                <div className="listing-footer">
                  <div className="price-tag">
                    <span className="currency">$</span>
                    <span className="amount">{formatPrice(item.price)}</span>
                  </div>

                  <button
                    onClick={() => handleOpenBuyModal(item)}
                    disabled={isOutOfStock}
                    className="btn-primary buy-btn"
                  >
                    <ShoppingBag size={16} />
                    {isOutOfStock ? 'Sold Out' : 'Buy Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Buy Modal Dialog */}
      {selectedListing && (
        <div className="modal-overlay" onClick={handleCloseBuyModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Place Your Order</h2>
              <button onClick={handleCloseBuyModal} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder}>
              <div className="order-item-summary">
                <h3 className="order-product-title">{selectedListing.title}</h3>
                <div className="order-seller-info">
                  Sold by <strong>{selectedListing.seller?.name}</strong>
                </div>
                <div className="order-unit-price">
                  Unit Price: <span>${formatPrice(selectedListing.price)}</span>
                </div>
              </div>

              {/* Quantity Picker */}
              <div className="form-group mt-3">
                <label className="form-label">Select Quantity</label>
                <div className="quantity-controller">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={selectedListing.quantityAvailable}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setQuantity(Math.min(Math.max(1, val), selectedListing.quantityAvailable));
                      }
                    }}
                    className="qty-input"
                  />
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() =>
                      setQuantity((q) => Math.min(selectedListing.quantityAvailable, q + 1))
                    }
                    disabled={quantity >= selectedListing.quantityAvailable}
                  >
                    <Plus size={16} />
                  </button>
                  <span className="qty-max-hint">Max: {selectedListing.quantityAvailable}</span>
                </div>
              </div>

              {/* Server-side Total Preview */}
              <div className="total-calculation-box">
                <div className="calc-row">
                  <span>Subtotal ({quantity} {quantity === 1 ? 'item' : 'items'})</span>
                  <span>${(parseFloat(selectedListing.price) * quantity).toFixed(2)}</span>
                </div>
                <div className="calc-row">
                  <span>Estimated Taxes & Shipping</span>
                  <span className="text-emerald-400">FREE</span>
                </div>
                <div className="calc-row total-row">
                  <strong>Total Order Price</strong>
                  <strong className="total-amount">
                    ${(parseFloat(selectedListing.price) * quantity).toFixed(2)}
                  </strong>
                </div>
              </div>

              <div className="modal-actions mt-4">
                <button
                  type="button"
                  onClick={handleCloseBuyModal}
                  className="btn-secondary"
                  disabled={submittingOrder}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder || selectedListing.quantityAvailable <= 0}
                  className="btn-primary"
                >
                  {submittingOrder ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      Confirm & Place Order <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .marketplace-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
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
        .search-bar-wrapper {
          max-width: 600px;
          width: 100%;
        }
        .search-input-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-dim);
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 0.85rem 3rem 0.85rem 2.85rem;
          color: var(--text-primary);
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s;
        }
        .search-input:focus {
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }
        .search-clear-btn {
          position: absolute;
          right: 1rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }
        .listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.75rem;
        }
        .listing-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
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
        .stock-low {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.35);
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
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
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
          letter-spacing: -0.02em;
        }
        .buy-btn {
          padding: 0.6rem 1.1rem;
          font-size: 0.88rem;
        }
        .loading-state, .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .empty-state h3 {
          font-size: 1.3rem;
        }
        .empty-state p {
          color: var(--text-muted);
          max-width: 440px;
        }
        .order-item-summary {
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 1rem;
        }
        .order-product-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .order-seller-info {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .order-unit-price {
          font-size: 0.9rem;
        }
        .order-unit-price span {
          font-weight: 700;
          color: #818cf8;
        }
        .quantity-controller {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.25rem;
        }
        .qty-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .qty-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .qty-input {
          width: 60px;
          text-align: center;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.45rem;
          color: var(--text-primary);
          font-weight: 700;
          font-size: 1rem;
        }
        .qty-max-hint {
          font-size: 0.8rem;
          color: var(--text-dim);
        }
        .total-calculation-box {
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: var(--radius-md);
          padding: 1rem;
          margin-top: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .calc-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.88rem;
          color: var(--text-secondary);
        }
        .total-row {
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          font-size: 1.05rem;
        }
        .total-amount {
          color: #818cf8;
          font-size: 1.25rem;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
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
