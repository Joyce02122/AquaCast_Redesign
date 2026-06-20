import React from 'react';

interface Props {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  style?: React.CSSProperties;
}

export function Chip({ children, color = '#1559b0', bg = 'rgba(31,111,212,.09)', style }: Props) {
  return (
    <span style={{
      fontFamily: "'Roboto Mono', monospace",
      fontSize: 10.5,
      color,
      background: bg,
      borderRadius: 6,
      padding: '3px 7px',
      ...style,
    }}>
      {children}
    </span>
  );
}
