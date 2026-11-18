import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  useEffect(() => {
    if (!order) {
      navigate('/store');
    }
  }, [order, navigate]);

  if (!order) return null;

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 bg-slate-50 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm text-center">
        <div className="w-24 h-24 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
          <CheckCircle className="h-12 w-12" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Order Placed Successfully!</h1>
        <p className="text-slate-500 mb-8">Thank you for shopping with DermaVision AI. Your order is confirmed.</p>
        
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order Number</p>
            <p className="text-lg font-bold text-slate-800">{order.order_id}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Amount Paid</p>
            <p className="text-lg font-bold text-slate-800">₹{parseFloat(order.total).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Method</p>
            <p className="text-base font-semibold text-slate-700">{order.payment_method}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Est. Delivery</p>
            <p className="text-base font-semibold text-slate-700">{deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/orders" className="w-full sm:w-auto px-6 py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition cursor-pointer flex items-center justify-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Track Order</span>
          </Link>
          
          <Link to="/store" className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition cursor-pointer flex items-center justify-center space-x-2">
            <span>Continue Shopping</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
