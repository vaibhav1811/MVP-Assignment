'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/ToastContext';
import { apiClient } from '@/lib/apiClient';
import StatusBadge from '@/components/StatusBadge';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  CheckCheck, 
  DollarSign, 
  ShoppingBag, 
  Loader2, 
  RefreshCw, 
  Calendar, 
  User as UserIcon,
  Store,
  Layers
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionInProgress, setActionInProgress] = useState(null); // orderId

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/orders');
      setOrders(data.orders || []);
    } catch (err) {
      error('Failed to load admin orders: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Admin Transitions
  const handleApprove = async (orderId) => {
    setActionInProgress(orderId);
    try {
      await apiClient.patch(`/api/orders/${orderId}/approve`);
      success(`Order #${orderId.slice(0, 8)} approved!`);
      fetchOrders();
    } catch (err) {
      error(err.message || 'Failed to approve order');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (orderId) => {
    if (!window.confirm('Are you sure you want to reject this order? The inventory stock will be automatically restored.')) {
      return;
    }

    setActionInProgress(orderId);
    try {
      await apiClient.patch(`/api/orders/${orderId}/reject`);
      success(`Order #${orderId.slice(0, 8)} rejected and inventory restored.`);
      fetchOrders();
    } catch (err) {
      error(err.message || 'Failed to reject order');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleComplete = async (orderId) => {
    setActionInProgress(orderId);
    try {
      await apiClient.patch(`/api/orders/${orderId}/complete`);
      success(`Order #${orderId.slice(0, 8)} marked as completed!`);
      fetchOrders();
    } catch (err) {
      error(err.message || 'Failed to complete order');
    } finally {
      setActionInProgress(null);
    }
  };

  // Metrics calculation
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const approvedCount = orders.filter((o) => o.status === 'approved').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const rejectedCount = orders.filter((o) => o.status === 'rejected').length;
  const totalRevenue = orders
    .filter((o) => o.status === 'completed' || o.status === 'approved')
    .reduce((sum, o) => sum + parseFloat(o.totalPrice || 0), 0);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    return o.status === statusFilter;
  });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Command Center</h1>
          <p className="page-subtitle">
            Supervise platform marketplace transactions, enforce order state transitions, and audit inventory flows.
          </p>
        </div>

        <button onClick={fetchOrders} className="btn-secondary" title="Reload transactions">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-icon icon-purple"><ShoppingBag size={22} /></div>
          <div>
            <div className="metric-label">Total Orders</div>
            <div className="metric-value">{totalOrdersCount}</div>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon icon-amber"><Clock size={22} /></div>
          <div>
            <div className="metric-label">Pending Review</div>
            <div className="metric-value">{pendingCount}</div>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon icon-blue"><CheckCircle2 size={22} /></div>
          <div>
            <div className="metric-label">Approved</div>
            <div className="metric-value">{approvedCount}</div>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon icon-emerald"><CheckCheck size={22} /></div>
          <div>
            <div className="metric-label">Completed</div>
            <div className="metric-value">{completedCount}</div>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon icon-green"><DollarSign size={22} /></div>
          <div>
            <div className="metric-label">Platform Volume</div>
            <div className="metric-value">${totalRevenue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Orders Management Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Order Lifecycle Management</h2>

          {/* Filter tabs */}
          <div className="filter-tabs">
            {[
              { key: 'ALL', label: 'All Orders', count: totalOrdersCount },
              { key: 'pending', label: 'Pending Approval', count: pendingCount },
              { key: 'approved', label: 'Approved', count: approvedCount },
              { key: 'completed', label: 'Completed', count: completedCount },
              { key: 'rejected', label: 'Rejected', count: rejectedCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`filter-tab-btn ${statusFilter === tab.key ? 'tab-active' : ''}`}
              >
                {tab.label} <span className="tab-count">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
            <p>Loading transactions...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state glass-card">
            <ShieldCheck size={48} className="text-dim" />
            <h3>No Orders in this Queue</h3>
            <p>
              {statusFilter === 'ALL'
                ? 'No transactions have been placed on the marketplace yet.'
                : `There are currently zero orders with status '${statusFilter}'.`}
            </p>
          </div>
        ) : (
          <div className="table-wrapper glass-card">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order ID / Date</th>
                  <th>Buyer Account</th>
                  <th>Product & Merchant</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>State Machine Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => {
                  const isProcessing = actionInProgress === o.id;

                  return (
                    <tr key={o.id}>
                      <td>
                        <div className="order-id-block">
                          <span className="font-mono text-xs font-semibold text-primary">
                            #{o.id.slice(0, 8)}
                          </span>
                          <span className="order-date-text">
                            <Calendar size={12} /> {formatDate(o.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="user-table-cell">
                          <strong>{o.buyer?.name || 'Customer'}</strong>
                          <span className="user-email-text">{o.buyer?.email}</span>
                        </div>
                      </td>
                      <td>
                        <div className="listing-table-cell">
                          <strong>{o.listing?.title || 'Listing'}</strong>
                          <span className="merchant-name-text">
                            <Store size={12} /> {o.listing?.seller?.name || 'Seller'}
                          </span>
                        </div>
                      </td>
                      <td>{o.quantity} units</td>
                      <td>
                        <strong className="text-indigo-400">${o.totalPrice}</strong>
                      </td>
                      <td>
                        <StatusBadge status={o.status} size="sm" />
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          {o.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(o.id)}
                                disabled={isProcessing}
                                className="btn-success btn-xs"
                                title="Approve Order"
                              >
                                {isProcessing ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <CheckCircle2 size={13} />
                                )}
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(o.id)}
                                disabled={isProcessing}
                                className="btn-danger btn-xs"
                                title="Reject Order & Restore Stock"
                              >
                                <XCircle size={13} />
                                Reject
                              </button>
                            </>
                          )}

                          {o.status === 'approved' && (
                            <button
                              onClick={() => handleComplete(o.id)}
                              disabled={isProcessing}
                              className="btn-success btn-xs"
                              title="Mark as Completed"
                            >
                              <CheckCheck size={13} />
                              Complete
                            </button>
                          )}

                          {o.status === 'completed' && (
                            <span className="text-dim text-xs font-semibold">
                              Finalized (Terminal)
                            </span>
                          )}

                          {o.status === 'rejected' && (
                            <span className="text-rose-400 text-xs font-semibold">
                              Refunded (Terminal)
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
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
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
        }
        .metric-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
        }
        .metric-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .icon-purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
        .icon-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        .icon-blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
        .icon-emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .icon-green { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
        .metric-label {
          font-size: 0.78rem;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .metric-value {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .dashboard-section {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .section-title {
          font-size: 1.35rem;
          font-weight: 700;
        }
        .filter-tabs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow-x: auto;
        }
        .filter-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 0.4rem 0.85rem;
          color: var(--text-muted);
          font-size: 0.82rem;
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
          font-size: 0.72rem;
          background: rgba(255, 255, 255, 0.08);
          padding: 0.1rem 0.4rem;
          border-radius: var(--radius-full);
        }
        .order-id-block {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .order-date-text {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.75rem;
          color: var(--text-dim);
        }
        .user-table-cell, .listing-table-cell {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .user-email-text {
          font-size: 0.78rem;
          color: var(--text-dim);
        }
        .merchant-name-text {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.78rem;
          color: var(--text-dim);
        }
        .admin-actions-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .btn-xs {
          padding: 0.35rem 0.65rem;
          font-size: 0.78rem;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
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
        .font-mono { font-family: var(--font-mono); }
        .text-xs { font-size: 0.75rem; }
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
