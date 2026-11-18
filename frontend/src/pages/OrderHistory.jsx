import React, { useState, useEffect } from 'react';
import { storeService } from '../services/api';
import { Package, XCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await storeService.getOrders();
      setOrders(data);
    } catch {
      setError('Failed to load order history.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await storeService.cancelOrder(orderId);
      fetchOrders(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel order.');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Processing': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Delivered': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Processing': return <Clock className="h-4 w-4 mr-1.5" />;
      case 'Shipped': return <Package className="h-4 w-4 mr-1.5" />;
      case 'Delivered': return <CheckCircle className="h-4 w-4 mr-1.5" />;
      case 'Cancelled': return <XCircle className="h-4 w-4 mr-1.5" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-cyan-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 px-6 max-w-5xl mx-auto z-10 relative">
      <div className="flex items-center space-x-3 mb-8">
        <Package className="h-8 w-8 text-cyan-600" />
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order History</h1>
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-10 w-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No orders yet</h2>
          <p className="text-slate-500 mb-6">Looks like you haven't made your first purchase.</p>
          <Link to="/store" className="inline-flex items-center px-6 py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
              {/* Header */}
              <div className="bg-slate-50 p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Order Placed</p>
                    <p className="text-sm font-semibold text-slate-800">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Total</p>
                    <p className="text-sm font-semibold text-slate-800">₹{parseFloat(order.total).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Order #</p>
                    <p className="text-sm font-semibold text-slate-800">{order.order_id}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.order_status)}`}>
                    {getStatusIcon(order.order_status)}
                    {order.order_status}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                        {item.product_image.startsWith('http') ? <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover"/> : item.product_image}
                      </div>
                      <div className="flex-1">
                        <Link to="/store" className="text-sm font-bold text-slate-900 hover:text-cyan-600 transition">{item.product_name}</Link>
                        <p className="text-xs text-slate-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {order.order_status === 'Processing' && (
                  <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={() => {
                        // Simplified cancel without window.confirm due to restrictions
                        handleCancelOrder(order.id);
                      }}
                      className="text-rose-600 text-sm font-bold hover:text-rose-700 transition"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
