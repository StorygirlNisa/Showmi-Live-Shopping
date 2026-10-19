import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface HostDisclaimerModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const HostDisclaimerModal: React.FC<HostDisclaimerModalProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  const [isAccepted, setIsAccepted] = useState(false);

  // Reset agreement checkbox each time the dialog is opened
  useEffect(() => {
    if (isOpen) {
      setIsAccepted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
    >
      <div className="bg-[#171A21] border border-[#242936] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 text-left animate-scale-up">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#242936]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="disclaimer-title" className="text-base font-bold text-white font-heading">
                Host Responsibility & AI Disclaimer
              </h2>
              <p className="text-xs text-slate-400">Required before launching live broadcast</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#20242E] transition-colors cursor-pointer"
            aria-label="Cancel and close disclaimer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verbatim Disclaimer Body */}
        <div className="p-4 rounded-xl bg-[#0D1018] border border-[#242936] text-xs leading-relaxed text-slate-300 space-y-2">
          <p>
            <strong className="text-white font-bold">Seller Responsibility:</strong> AI-generated
            scripts and sales assistance may contain errors. You are responsible for verifying all
            product claims, prices and other information before communicating them to customers.
            Do not read AI-generated content verbatim without checking its accuracy. Showmi’s AI sales
            assistant does not guarantee the accuracy of generated content.
          </p>
        </div>

        {/* Required Unchecked Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group select-none">
          <input
            type="checkbox"
            checked={isAccepted}
            onChange={(e) => setIsAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-[#242936] bg-[#0D1018] text-[#19BFFF] accent-[#19BFFF] focus:ring-[#19BFFF] cursor-pointer"
          />
          <span className="text-xs text-slate-200 group-hover:text-white font-medium leading-snug">
            I have read and understood this disclaimer. I accept responsibility for the accuracy of
            information I communicate during my livestream.
          </span>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#20242E] text-slate-300 hover:text-white hover:bg-[#262C3A] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isAccepted}
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              isAccepted
                ? 'bg-[#19BFFF] text-[#0D1018] hover:bg-[#00AEEF] shadow-lg shadow-[#19BFFF]/25 active:scale-95'
                : 'bg-[#20242E] text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Go Live</span>
          </button>
        </div>
      </div>
    </div>
  );
};
