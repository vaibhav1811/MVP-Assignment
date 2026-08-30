'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/ToastContext';
import { apiClient } from '@/lib/apiClient';
import StatusBadge from '@/components/StatusBadge';
import { 
  Store, 
  PlusCircle, 
  Package, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCheck, 
  DollarSign, 
  Layers, 
  ShoppingBag, 
  Loader2, 
  X, 
  Save 
} from 'lucide-react';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingListing, setEditingListing] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch seller's own listings
      const listingsData = await apiClient.get(`/api/listings?sellerId=${user.id}`);
      setListings(listingsData.listings || []);

      // 2. Fetch orders placed for this seller's products
      const ordersData = await apiClient.get('/api/orders/me');
      setOrders(ordersData.orders || []);
    } catch (err) {
      error('Failed to load seller dashboard: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  }, [user, error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Edit
  const openEditModal = (item) => {
    setEditingListing(item);
    setEditTitle(item.title);
    setEditDesc(item.description);
    setEditPrice(item.price);
    setEditStock(item.quantityAvailable);
  };

  const closeEditModal = () => {
    setEditingListing(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingListing) return;

    setSavingEdit(true);
    try {
      await apiClient.put(`/api/listings/${editingListing.id}`, {
        title: editTitle,
        description: editDesc,
        price: parseFloat(editPrice),
        quantityAvailable: parseInt(editStock, 10),
      });

      success('Listing updated successfully!');
      closeEditModal();
      fetchData();
    } catch (err) {
      error(err.message || 'Failed to update listing');
    } finally {
      setSavingEdit(false);
    }
  };

  // Toggle Active/Inactive status
  const handleToggleActive = async (item) => {
    try {
      await apiClient.put(`/api/listings/${item.id}`, {
        isActive: !item.isActive,
      });
      success(`Listing marked as ${!item.isActive ? 'Active' : 'Inactive'}`);
      fetchData();
    } catch (err) {
      error(err.message || 'Failed to update listing status');
    }
  };

  // Soft Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate and remove this listing?')) return;

    try {
      await apiClient.delete(`/api/listings/${id}`);
      success('Listing deactivated successfully');
      fetchData();
    } catch (err) {
      error(err.message || 'Failed to delete listing');
    }
  };

  // Seller completes an approved order
  const handleCompleteOrder = async (orderId) => {
    try {
      await apiClient.patch(`/api/orders/${orderId}/complete`);
      success('Order marked as Completed!');
      fetchData();
    } catch (err) {
      error(err.message || 'Failed to complete order');
    }
  };

  // Computed metrics
  const activeListingsCount = listings.filter((l) => l.isActive).length;
  const totalStockCount = listings.reduce((sum, l) => sum + l.quantityAvailable, 0);
  const totalSalesRevenue = orders
    .filter((o) => o.status === 'completed' || o.status === 'approved')
    .reduce((sum, o) => sum + parseFloat(o.totalPrice || 0), 0);

  return (
    <div className="seller-dashboard-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Seller Hub</h1>
          <p className="page-subtitle">
            Manage your inventory catalog, stock levels, and fulfill incoming customer orders.
          </p>
        </div>

        <Link href="/seller/new" className="btn-primary">
          <PlusCircle size={18} /> Add New Listing
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-icon icon-cyan"><Layers size={22} /></div>
          <div>
            <div className="metric-label">Total Listings</div>
            <div className="metric-value">{listings.length} <span className="metric-sub">({activeListingsCount} active)</span></div>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon icon-emerald"><Package size={22} /></div>
          <div>
            <div className="metric-label">Total Inventory Units</div>
            <div className="metric-value">{totalStockCount}</div>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon icon-purple"><ShoppingBag size={22} /></div>
          <div>
            <div className="metric-label">Orders Received</div>
            <div className="metric-value">{orders.length}</div>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon icon-amber"><DollarSign size={22} /></div>
          <div>
            <div className="metric-label">Gross Processed Sales</div>
            <div className="metric-value">${totalSalesRevenue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Product Catalog Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Product Catalog & Inventory</h2>
        </div>

        {loading ? (
          <div className="loading-state">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
            <p>Loading your catalog...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="empty-state glass-card">
            <Store size={44} className="text-dim" />
            <h3>No Products in Catalog</h3>
            <p>You have not published any listings yet. Add your first product to start selling!</p>
            <Link href="/seller/new" className="btn-primary mt-2">
              <PlusCircle size={16} /> Create Listing
            </Link>
          </div>
        ) : (
          <div className="table-wrapper glass-card">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="table-product-cell">
                        <strong>{item.title}</strong>
                        <span className="product-desc-preview">{item.description}</span>
                      </div>
                    </td>
                    <td>
                      <span className="table-price">${parseFloat(item.price).toFixed(2)}</span>
                    </td>
                    <td>
                      <span className={`stock-indicator ${item.quantityAvailable <= 5 ? 'text-amber-400' : ''}`}>
                        {item.quantityAvailable} units
                      </span>
                    </td>
                    <td>
                      {item.isActive ? (
                        <span className="status-badge badge-completed badge-sm">Active</span>
                      ) : (
                        <span className="status-badge badge-rejected badge-sm">Inactive</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => openEditModal(item)}
                          className="action-btn action-edit"
                          title="Edit Listing"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(item)}
                          className="action-btn action-toggle"
                          title={item.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {item.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="action-btn action-delete"
                          title="Soft Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Customer Orders for Seller's Products */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Orders for Your Products</h2>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state-mini glass-card">
            <p className="text-muted">No customer orders recorded yet for your products.</p>
          </div>
        ) : (
          <div className="table-wrapper glass-card">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Fulfillment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <span className="font-mono text-xs text-primary">
                        #{o.id.slice(0, 8)}
                      </span>
                    </td>
                    <td>{o.buyer?.name} ({o.buyer?.email})</td>
                    <td>{o.listing?.title}</td>
                    <td>{o.quantity}</td>
                    <td><strong>${o.totalPrice}</strong></td>
                    <td><StatusBadge status={o.status} size="sm" /></td>
                    <td>
                      {o.status === 'approved' && (
                        <button
                          onClick={() => handleCompleteOrder(o.id)}
                          className="btn-success btn-xs"
                          title="Mark Order as Completed"
                        >
                          <CheckCheck size={14} /> Fulfill Order
                        </button>
                      )}
                      {o.status === 'completed' && (
                        <span className="text-emerald-400 text-xs font-semibold">Fulfilled</span>
                      )}
                      {o.status === 'pending' && (
                        <span className="text-muted text-xs">Awaiting Admin Approval</span>
                      )}
                      {o.status === 'rejected' && (
                        <span className="text-rose-400 text-xs">Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Edit Listing Modal */}
      {editingListing && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Product Listing</h2>
              <button onClick={closeEditModal} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label className="form-label">Product Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="grid-2-col">
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity in Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-actions mt-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="btn-secondary"
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="btn-primary"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .seller-dashboard-container {
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
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
        }
        .metric-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
        }
        .metric-icon {
          width: 46px;
          height: 46px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .icon-cyan { background: rgba(6, 182, 212, 0.15); color: #38bdf8; }
        .icon-emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .icon-purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
        .icon-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        .metric-label {
          font-size: 0.8rem;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .metric-value {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .metric-sub {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: normal;
        }
        .dashboard-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .section-title {
          font-size: 1.35rem;
          font-weight: 700;
        }
        .table-product-cell {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          max-width: 320px;
        }
        .product-desc-preview {
          font-size: 0.78rem;
          color: var(--text-dim);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .table-price {
          font-weight: 700;
          color: #818cf8;
        }
        .table-actions {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .action-edit:hover { color: #38bdf8; border-color: #38bdf8; }
        .action-toggle:hover { color: #fbbf24; border-color: #fbbf24; }
        .action-delete:hover { color: #fb7185; border-color: #fb7185; }
        .grid-2-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .btn-xs {
          padding: 0.35rem 0.65rem;
          font-size: 0.78rem;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .empty-state-mini {
          padding: 2rem;
          text-align: center;
        }
        .loading-state, .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
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
