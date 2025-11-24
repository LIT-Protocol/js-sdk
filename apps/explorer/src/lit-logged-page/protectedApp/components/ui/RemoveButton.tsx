/**
 * RemoveButton Component
 * 
 * Reusable button for removing items with loading state
 */

import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface RemoveButtonProps {
  onRemove: () => void;
  isRemoving: boolean;
}

export const RemoveButton: React.FC<RemoveButtonProps> = ({
  onRemove,
  isRemoving,
}) => (
  <button
    onClick={onRemove}
    disabled={isRemoving}
    style={{
      padding: "4px 8px",
      backgroundColor: isRemoving ? "#9ca3af" : "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "4px",
      fontSize: "11px",
      cursor: isRemoving ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
      minWidth: "70px",
    }}
  >
    {isRemoving ? (
      <>
        <LoadingSpinner size={10} />
        Removing...
      </>
    ) : (
      "Remove"
    )}
  </button>
); 