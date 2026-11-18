import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GlowBackground from './components/GlowBackground';
import ChatBox from './components/ChatBox';
import Home from './pages/Home';
import Scan from './pages/Scan';
import Recommendations from './pages/Recommendations';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Store from './pages/Store';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderHistory from './pages/OrderHistory';
import { authService } from './services/api';

// Simple Route guard for dashboard page
const PrivateRoute = ({ children }) => {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  const [chatCondition, setChatCondition] = useState(null);
  const [chatConfidence, setChatConfidence] = useState(null);
  const [chatForceOpen, setChatForceOpen] = useState(0);

  // Listen for chat-open events dispatched by Dashboard scan cards
  useEffect(() => {
    const handler = (e) => {
      setChatCondition(e.detail.condition);
      setChatConfidence(e.detail.confidence);
      setChatForceOpen(prev => prev + 1);
    };
    window.addEventListener('dv:openchat', handler);
    return () => window.removeEventListener('dv:openchat', handler);
  }, []);

  return (
    <Router>
      <div className="relative min-h-screen flex flex-col z-10 overflow-hidden">
        {/* Glow Nodes Backdrop */}
        <GlowBackground />

        {/* Global Nav Bar */}
        <Navbar />

        {/* Page Content Layout */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/store" element={<Store />} />
            
            {/* Guarded route */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/checkout" 
              element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/order-success" 
              element={
                <PrivateRoute>
                  <OrderSuccess />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/orders" 
              element={
                <PrivateRoute>
                  <OrderHistory />
                </PrivateRoute>
              } 
            />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Global ChatBox — visible on every page */}
        <ChatBox
          condition={chatCondition}
          confidence={chatConfidence}
          forceOpen={chatForceOpen}
        />
      </div>
    </Router>
  );
}

export default App;
