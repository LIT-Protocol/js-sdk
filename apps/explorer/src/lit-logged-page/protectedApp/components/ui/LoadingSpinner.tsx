/**
 * LoadingSpinner Component
 * 
 * Reusable loading spinner with configurable size
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 16 }) => (
  <div
    style={{
      width: `${size}px`,
      height: `${size}px`,
      border: "2px solid #ffffff",
      borderTop: "2px solid transparent",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    }}
  />
); 