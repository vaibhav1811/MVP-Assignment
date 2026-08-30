'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/ToastContext';
import { apiClient } from '@/lib/apiClient';
import StatusBadge from '@/components/StatusBadge';
import OrderTimeline from '@/components/OrderTimeline';
import { 
  ClipboardList, 
  ShoppingBag, 
  Store, 
  Calendar, 
  DollarSign, 
  ArrowRight, 
  Loader2, 
  PackageCheck,
  RefreshCw
} from 'lucide-react';

export default function MyOrdersPage() {
  const { user } = useAuth();
  const { error } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/orders/me');
      setOrders(data.orders || []);
    } catch (err) {
      error('Failed to load your orders: ' + (err.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'ALL') return true;
    return order.status === filterStatus;
  });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="orders-page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">
            Track your purchases and view live order approval and fulfillment status.
          </p>
        </div>

        <div className="header-actions">
          <button onClick={fetchOrders} className="btn-secondary btn-icon-only" title="Refresh Orders">
            <RefreshCw size={16} />
          </button>
          <Link href="/marketplace" className="btn-primary">
            <ShoppingBag size={16} /> Browse Marketplace
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['ALL', 'pending', 'approved', 'completed', 'rejected'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`filter-tab-btn ${filterStatus === st ? 'tab-active' : ''}`}
          >
            {st === 'ALL' ? 'All Orders' : st.charAt(0).toUpperCase() + st.slice(1)}
            <span className="tab-count">
              {st === 'ALL' ? orders.length : orders.filter((o) => o.status === st).length}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="loading-state">
          <Loader2 size={36} className="animate-spin text-indigo-400" />
          <p>Loading your order history...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state glass-card">
          <ClipboardList size={48} className="text-dim" />
          <h3>No Orders Found</h3>
          <p>
            {filterStatus === 'ALL'
              ? "You haven't placed any orders yet. Visit the marketplace to find great items!"
              : `You have no orders currently in '${filterStatus}' status.`}
          </p>
          <Link href="/marketplace" className="btn-primary mt-2">
            Start Shopping <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div key={order.id} className="glass-card order-card">
              <div className="order-card-top">
                <div className="order-meta-info">
                  <span className="order-id-label">ORDER #{order.id.slice(0, 8)}</span>
                  <span className="order-date">
                    <Calendar size={14} /> {formatDate(order.createdAt)}
                  </span>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="order-card-middle">
                <div className="product-info-col">
                  <h3 className="product-title">{order.listing?.title || 'Product'}</h3>
                  <div className="seller-name-row">
                    <Store size={14} />
                    <span>Sold by {order.listing?.seller?.name || 'Merchant'}</span>
                  </div>
                </div>

                <div className="order-numbers-col">
                  <div className="number-item">
                    <span className="number-label">Quantity</span>
                    <span className="number-value">{order.quantity}</span>
                  </div>
                  <div className="number-item">
                    <span className="number-label">Unit Price</span>
                    <span className="number-value">${order.listing?.price || '0.00'}</span>
                  </div>
                  <div className="number-item total-item">
                    <span className="number-label">Total Price</span>
                    <span className="number-value total-val">${order.totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <OrderTimeline status={order.status} />
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .orders-page-container {
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
        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .filter-tabs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }
        .filter-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 0.45rem 1rem;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .filter-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.06);
        }
        .tab-active {
          background: rgba(99, 102, 241, 0.16);
          border-color: rgba(99, 102, 241, 0.35);
          color: #a5b4fc;
        }
        .tab-count {
          font-size: 0.75rem;
          background: rgba(255, 255, 255, 0.08);
          padding: 0.1rem 0.45rem;
          border-radius: var(--radius-full);
        }
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .order-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .order-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .order-meta-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .order-id-label {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: 0.05em;
        }
        .order-date {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .order-card-middle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .product-title {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .seller-name-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .order-numbers-col {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .number-item {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .number-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-dim);
        }
        .number-value {
          font-size: 0.95rem;
          font-weight: 600;
        }
        .total-val {
          font-size: 1.3rem;
          font-weight: 800;
          color: #818cf8;
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
