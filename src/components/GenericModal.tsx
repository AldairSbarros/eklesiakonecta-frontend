import React from "react";
import "./SuperModal.scss";

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function GenericModal({ isOpen, onClose, children }: GenericModalProps) {
  if (!isOpen) return null;
  return (
    <div className="supermodal-overlay">
      <div className="supermodal">
        <button className="supermodal-close" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
}
