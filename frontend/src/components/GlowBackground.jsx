import React from 'react';

const GlowBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="glow-node glow-primary w-96 h-96 -top-20 -left-20"></div>
      <div className="glow-node glow-secondary w-[500px] h-[500px] top-[40%] right-[-100px]"></div>
      <div className="glow-node glow-accent w-80 h-80 bottom-[-50px] left-[20%]"></div>
    </div>
  );
};

export default GlowBackground;
