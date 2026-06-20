import React from 'react';

interface Props {
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

export function GlassCard({ style, className = '', children, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`ac-scroll ${className}`}
      style={{
        background: 'rgba(255,255,255,.94)',
        border: '1px solid rgba(120,150,165,.22)',
        borderRadius: 20,
        boxShadow: '0 18px 44px rgba(40,80,120,.12)',
        backdropFilter: 'blur(12px)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
