import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, CheckCircle, ChevronRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { storeService } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Billing Form State
  const [billing, setBilling] = useState({
    full_name: '', email: '', phone: '',
    address: '', city: '', state: '', pincode: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  // Pricing State
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('dv_cart')) || [];
    if (savedCart.length === 0) {
      navigate('/store');
    } else {
      setCart(savedCart);
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setBilling({ ...billing, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      setCouponError('');
      const res = await storeService.validateCoupon(couponCode);
      setCouponApplied(res);
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Invalid coupon');
      setCouponApplied(null);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const discountAmount = couponApplied ? (subtotal * couponApplied.discount_percentage) / 100 : 0;
  const taxableAmount = subtotal - discountAmount;
  const tax = taxableAmount * 0.18; // 18% GST
  const shipping = taxableAmount > 1000 ? 0 : 50;
  const total = taxableAmount + tax + shipping;

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const items = cart.map(i => ({ product_id: i.product.id, quantity: i.quantity }));
      const orderData = {
        items,
        billing,
        payment_method: paymentMethod,
        coupon_code: couponApplied?.code || null
      };
      const res = await storeService.checkout(orderData);
      
      // Clear cart
      localStorage.removeItem('dv_cart');
      
      // Navigate to success
      navigate('/order-success', { state: { order: res.order } });
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative pt-28 pb-16 px-6 max-w-7xl mx-auto z-10 flex flex-col lg:flex-row gap-8">
      {/* Left Column: Form Steps */}
      <div className="lg:w-2/3">
        {/* Stepper Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-cyan-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-500'}`}>1</div>
            <span className="font-bold hidden sm:block">Address</span>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-300" />
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-cyan-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-500'}`}>2</div>
            <span className="font-bold hidden sm:block">Payment</span>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-300" />
          <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-cyan-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-500'}`}>3</div>
            <span className="font-bold hidden sm:block">Review</span>
          </div>
        </div>

        {/* Step 1: Address */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <MapPin className="h-6 w-6 text-cyan-600" />
              <h2 className="text-xl font-bold text-slate-900">Billing & Shipping Address</h2>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input required name="full_name" value={billing.full_name} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-cyan-400 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                <input required type="email" name="email" value={billing.email} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-cyan-400 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                <input required name="phone" value={billing.phone} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-cyan-400 focus:outline-none" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Address Line</label>
                <input required name="address" value={billing.address} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-cyan-400 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">City</label>
                <input required name="city" value={billing.city} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-cyan-400 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">State</label>
                <input required name="state" value={billing.state} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-cyan-400 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">PIN Code</label>
                <input required name="pincode" value={billing.pincode} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-cyan-400 focus:outline-none" />
              </div>
              <div className="md:col-span-2 mt-4 text-right">
                <button type="submit" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition cursor-pointer">Continue to Payment</button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <CreditCard className="h-6 w-6 text-cyan-600" />
              <h2 className="text-xl font-bold text-slate-900">Select Payment Method</h2>
            </div>
            
            <div className="space-y-4">
              {['COD'].map((method) => (
                <label key={method} className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${paymentMethod === method ? 'border-cyan-500 bg-cyan-50/50' : 'border-slate-200 hover:border-cyan-300'}`}>
                  <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="h-4 w-4 text-cyan-600" />
                  <span className="ml-3 font-bold text-slate-800">
                    Cash on Delivery
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer">Back</button>
              <button onClick={() => setStep(3)} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition cursor-pointer">Review Order</button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <CheckCircle className="h-6 w-6 text-cyan-600" />
              <h2 className="text-xl font-bold text-slate-900">Review & Confirm</h2>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl mb-6 border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-2">Delivery Address</h3>
              <p className="text-sm text-slate-600">{billing.full_name}<br/>{billing.address}<br/>{billing.city}, {billing.state} - {billing.pincode}</p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl mb-6 border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-2">Payment Method</h3>
              <p className="text-sm text-slate-600">{paymentMethod === 'COD' ? 'Cash on Delivery' : paymentMethod}</p>
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(2)} className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer">Back</button>
              <button 
                onClick={handlePlaceOrder} 
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-teal-600 transition shadow-md shadow-cyan-500/20 cursor-pointer flex items-center justify-center min-w-[200px]"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Order Summary */}
      <div className="lg:w-1/3">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-32">
          <h3 className="font-bold text-slate-900 flex items-center space-x-2 mb-6 pb-4 border-b border-slate-100">
            <ShoppingBag className="h-5 w-5 text-cyan-600" />
            <span>Order Summary</span>
          </h3>
          
          <div className="space-y-4 max-h-[30vh] overflow-y-auto mb-6 pr-2 custom-scrollbar">
            {cart.map((item, idx) => (
              <div key={idx} className="flex space-x-3 items-center">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shrink-0">
                  {item.product.image_url ? <img src={item.product.image_url} alt="img" className="w-full h-full object-cover rounded-xl"/> : item.product.emoji_icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{item.product.name}</p>
                  <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                </div>
                <div className="font-bold text-slate-900 text-sm shrink-0">
                  ₹{(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          {/* Coupon Code */}
          <div className="mb-6">
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Discount Code" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-cyan-400 focus:outline-none uppercase"
              />
              <button 
                onClick={handleApplyCoupon}
                className="px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                Apply
              </button>
            </div>
            {couponError && <p className="text-rose-500 text-xs mt-1 font-bold">{couponError}</p>}
            {couponApplied && <p className="text-teal-600 text-xs mt-1 font-bold">✓ Coupon applied: {couponApplied.discount_percentage}% OFF</p>}
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-200 border-dashed mb-6">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-bold">₹{subtotal.toFixed(2)}</span>
            </div>
            {couponApplied && (
              <div className="flex justify-between text-sm text-teal-600">
                <span>Discount ({couponApplied.code})</span>
                <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-slate-600">
              <span>Tax (18% GST)</span>
              <span className="font-bold">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Delivery Charges</span>
              <span className="font-bold text-teal-600">{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">Grand Total</span>
            <span className="text-2xl font-black text-cyan-700">₹{total.toFixed(2)}</span>
          </div>
          
          <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
