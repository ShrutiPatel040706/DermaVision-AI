import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, ShieldCheck, Filter, ArrowRight, Heart, X, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { scanService, authService, storeService } from '../services/api';

const Store = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const conditionParam = searchParams.get('condition') || 'All';

  const [selectedCondition, setSelectedCondition] = useState(conditionParam);
  const [lastCondition, setLastCondition] = useState(null);

  // Keep selectedCondition in sync with URL changes
  useEffect(() => {
    if (conditionParam) {
      setSelectedCondition(conditionParam);
    }
  }, [conditionParam]);

  // Cart: array of { product, quantity } — persisted in localStorage
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dv_cart')) || []; } catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Wishlist: array of product objects — persisted in localStorage
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dv_wishlist')) || []; } catch { return []; }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Sync cart & wishlist to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dv_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('dv_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const productsRef = useRef(null);

  useEffect(() => {
    if (authService.isAuthenticated()) fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await scanService.getHistory();
      if (data && data.length > 0) {
        setLastCondition(data[0].condition);
        if (conditionParam === 'All') setSelectedCondition(data[0].condition);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async (condition) => {
    setLoadingProducts(true);
    try {
      const data = await storeService.getProducts(condition);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts(selectedCondition);
  }, [selectedCondition]);

  // ── Cart handlers ──
  const handleAddToCart = (product) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const q = item.quantity + delta;
            return q > 0 ? { ...item, quantity: q } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    navigate('/checkout');
  };

  // ── Wishlist handlers ──
  const isWishlisted = (productId) => wishlist.some(p => p.id === productId);

  const toggleWishlist = (product) => {
    setWishlist(prev =>
      prev.some(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  };

  const handleRemoveFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(p => p.id !== productId));
  };

  const handleMoveToCart = (product) => {
    handleAddToCart(product);
    handleRemoveFromWishlist(product.id);
    // stays on wishlist so user can continue adding more items
  };

  // ── Derived values ──
  const totalItemsCount = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartSubtotal = cart.reduce((acc, i) => acc + i.product.price * i.quantity, 0);

  const baseFilterOptions = ['All', 'Unknown_Normal', 'Acne', 'Eczema', 'Psoriasis', 'SkinCancer', 'Moles', 'Vitiligo', 'Rosacea'];
  const filterOptions =
    lastCondition && !baseFilterOptions.some(o => o.toLowerCase() === lastCondition.toLowerCase())
      ? [...baseFilterOptions, lastCondition]
      : baseFilterOptions;

  return (
    <>
    <div className="relative pt-28 pb-16 px-6 max-w-7xl mx-auto z-10">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest block mb-1">DERMAVISION PHARMACY</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Recommended Skincare Store</h1>
          <p className="text-slate-600 text-sm mt-1">Medical-grade skincare matched with your diagnostic conditions.</p>
        </div>

        {/* Cart + Wishlist action buttons */}
        <div className="flex items-center space-x-3">
          {/* Wishlist Button */}
          <button
            onClick={() => { setIsWishlistOpen(true); setIsCartOpen(false); }}
            className="relative flex items-center space-x-2 bg-rose-50 hover:bg-rose-100/80 px-4 py-2.5 border border-rose-200 rounded-xl text-rose-700 font-bold transition cursor-pointer shadow-sm"
          >
            <Heart className="h-5 w-5 text-rose-500" />
            <span className="text-sm">Wishlist</span>
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={() => { setIsCartOpen(true); setIsWishlistOpen(false); }}
            className="relative flex items-center space-x-2 bg-cyan-50 hover:bg-cyan-100/80 px-4 py-2.5 border border-cyan-200 rounded-xl text-cyan-800 font-bold transition cursor-pointer shadow-sm"
          >
            <ShoppingBag className="h-5 w-5 text-cyan-600" />
            <span className="text-sm">{totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'} in Cart</span>
            {totalItemsCount > 0 && (
              <span className="w-2.5 h-2.5 bg-cyan-600 rounded-full animate-ping absolute -top-1 -right-1"></span>
            )}
          </button>
        </div>
      </div>

      {/* ── Personalized banner ── */}
      {lastCondition ? (
        <div className="bg-gradient-to-r from-cyan-500/10 via-teal-500/5 to-cyan-500/10 border border-cyan-200/80 p-5 rounded-3xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 flex items-center justify-center text-lg">✨</div>
            <div>
              <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider block">PERSONALIZED MATCH</span>
              <p className="text-sm text-slate-800 font-semibold">
                Your last scan indicated <span className="text-cyan-700 font-extrabold">{lastCondition}</span>. Showing products tailored to your needs.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedCondition(lastCondition);
              setTimeout(() => productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 rounded-xl text-white text-xs font-bold transition shadow-md shadow-cyan-500/15 cursor-pointer"
          >
            <span>View Tailored Items</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 p-5 rounded-3xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-lg">🔬</div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">GET PERSONALIZED PRODUCTS</span>
              <p className="text-sm text-slate-700 font-semibold">Run a skin scan first to get product recommendations tailored to your condition.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/scan')}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 rounded-xl text-white text-xs font-bold transition shadow-md shadow-cyan-500/15 cursor-pointer"
          >
            <span>Go to Scanner</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Filter row ── */}
      <div className="flex items-center space-x-3 mb-8 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-slate-500 shrink-0" />
        <span className="text-xs text-slate-600 font-bold uppercase tracking-wider shrink-0 mr-1">Filter Condition:</span>
        <div className="flex space-x-2">
          {filterOptions.map(opt => (
            <button
              key={opt}
              onClick={() => setSelectedCondition(opt)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCondition.toLowerCase() === opt.toLowerCase()
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-cyan-300 hover:text-cyan-600'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* ── Products Grid ── */}
      <div ref={productsRef} />
      {loadingProducts ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center border border-slate-200 max-w-md mx-auto bg-white">
          <ShoppingBag className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-slate-900 font-bold">No Products Found</h3>
          <p className="text-slate-500 text-xs mt-1">We are currently stocking products matching {selectedCondition}. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const liked = isWishlisted(product.id);
            return (
              <div
                key={product.id}
                className="glass-panel rounded-3xl p-5 border border-cyan-100 flex flex-col justify-between group hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-500/10 transition duration-300 relative bg-white"
              >
                {/* Like/Wishlist button */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`absolute top-4 right-4 p-2 rounded-full border shadow-sm transition cursor-pointer z-10 ${
                    liked
                      ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
                      : 'bg-white/90 border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-white'
                  }`}
                  title={liked ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`h-4 w-4 transition-transform hover:scale-110 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>

                <div>
                  {/* Product image / emoji */}
                  <div className="w-full aspect-square bg-slate-50 rounded-2xl border border-slate-150 flex items-center justify-center mb-4 group-hover:scale-[1.02] transition duration-300 overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl">{product.image}</span>
                    )}
                  </div>

                  {/* Brand & rating */}
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-cyan-700 font-extrabold uppercase tracking-wider">{product.brand}</span>
                    <div className="flex items-center space-x-1 text-xs text-amber-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                      <span className="text-[10px] text-slate-400">({product.reviews})</span>
                    </div>
                  </div>

                  <h3 className="text-slate-900 font-extrabold text-base leading-tight mb-2 group-hover:text-cyan-600 transition duration-300">
                    {product.name}
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed mb-4">{product.desc}</p>
                </div>

                {/* Price & Add to Cart */}
                <div className="border-t border-slate-100 pt-4 mt-auto flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">PRICE</span>
                    <span className="text-xl font-black text-slate-900">₹{product.price.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 hover:scale-105 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-md shadow-cyan-500/20 cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Safety footer ── */}
      <div className="mt-16 p-4 bg-cyan-50/80 rounded-2xl border border-cyan-200/60 flex items-start space-x-3.5 max-w-3xl mx-auto">
        <ShieldCheck className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-600 leading-relaxed">
          DermaVision Pharmacy recommends skincare formulations containing non-prescription active compounds matching the general classifications of your diagnosed condition. For pharmaceutical-grade prescription therapies, please request a clinical referral to consult a doctor.
        </p>
      </div>
    </div>

    {/* ══════════════════════════════════════════
        WISHLIST DRAWER
    ══════════════════════════════════════════ */}
    {isWishlistOpen && (
      <div className="fixed inset-0 z-[10000] flex justify-end">
        <div onClick={() => setIsWishlistOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" />

        <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-rose-100">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-rose-50/40">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
              <h2 className="text-base font-extrabold text-slate-900">My Wishlist</h2>
              <span className="text-xs text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded-full">{wishlist.length}</span>
            </div>
            <button onClick={() => setIsWishlistOpen(false)} className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-slate-900 transition cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Item list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {wishlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-400 mb-3">
                  <Heart className="h-8 w-8" />
                </div>
                <h3 className="text-slate-900 font-bold text-base mb-1">No liked items yet</h3>
                <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
                  Tap the ♥ heart on any product to save it here for later.
                </p>
              </div>
            ) : (
              wishlist.map(product => (
                <div key={product.id} className="flex items-center space-x-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-rose-200 transition">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 bg-white rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center shrink-0">
                    {product.image_url
                      ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      : <span className="text-2xl">{product.image}</span>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] text-cyan-700 font-extrabold uppercase block">{product.brand}</span>
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{product.name}</h4>
                    <span className="text-xs font-extrabold text-slate-900 mt-0.5 block">₹{product.price.toFixed(2)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end space-y-1.5">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="flex items-center space-x-1 px-2.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg text-cyan-700 text-[10px] font-bold transition cursor-pointer"
                      title="Add to Cart"
                    >
                      <ShoppingBag className="h-3 w-3" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {wishlist.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => {
                  wishlist.forEach(p => handleAddToCart(p));
                  setWishlist([]);
                }}              
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-xl transition shadow-md shadow-rose-500/20 text-xs flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add All to Cart ({wishlist.length} items)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    )}

    {/* ══════════════════════════════════════════
        CART DRAWER
    ══════════════════════════════════════════ */}
    {isCartOpen && (
      <div className="fixed inset-0 z-[10000] flex justify-end">
        <div onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" />

        <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-cyan-100">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-cyan-50/40">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-cyan-600" />
              <h2 className="text-base font-extrabold text-slate-900">Shopping Cart</h2>
              <span className="text-xs text-cyan-700 font-bold bg-cyan-100 px-2 py-0.5 rounded-full">{totalItemsCount}</span>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-slate-900 transition cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 mb-3">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-slate-900 font-bold text-base mb-1">Your cart is empty</h3>
                <p className="text-slate-500 text-xs max-w-xs leading-relaxed">Explore our recommended products and add items to your cart.</p>
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center space-x-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-14 h-14 bg-white rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center shrink-0">
                    {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <span className="text-2xl">{product.image}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] text-cyan-700 font-extrabold uppercase block">{product.brand}</span>
                    <h4 className="text-xs font-extrabold text-slate-900 truncate">{product.name}</h4>
                    <span className="text-xs font-extrabold text-slate-900 mt-0.5 block">₹{(product.price * quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-1">
                    <button onClick={() => handleUpdateQuantity(product.id, -1)} className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"><Minus className="h-3 w-3" /></button>
                    <span className="text-xs font-bold px-1.5 text-slate-800">{quantity}</span>
                    <button onClick={() => handleUpdateQuantity(product.id, 1)} className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"><Plus className="h-3 w-3" /></button>
                  </div>
                  <button onClick={() => handleRemoveFromCart(product.id)} className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-bold text-slate-900">₹{cartSubtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-teal-700 font-semibold"><span>Shipping</span><span>FREE</span></div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Total</span><span className="text-cyan-700">₹{cartSubtotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold rounded-xl transition shadow-md shadow-cyan-500/20 text-xs flex items-center justify-center space-x-2 cursor-pointer"
              >
                <CreditCard className="h-4 w-4" />
                <span>Complete Checkout (₹{cartSubtotal.toFixed(2)})</span>
              </button>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
};

export default Store;
