import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor, Maximize2, RotateCw, X, ChevronUp, ChevronDown } from 'lucide-react';

export type ViewportMode = 'responsive' | 'mobile-sm' | 'mobile-md' | 'tablet' | 'desktop';

interface ResponsivePreviewToolbarProps {
  currentMode: ViewportMode;
  onModeChange: (mode: ViewportMode) => void;
  isLandscape: boolean;
  onToggleOrientation: () => void;
}

export const ResponsivePreviewToolbar: React.FC<ResponsivePreviewToolbarProps> = ({
  currentMode,
  onModeChange,
  isLandscape,
  onToggleOrientation
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const presets: { id: ViewportMode; label: string; icon: React.ReactNode; dims: string }[] = [
    { id: 'responsive', label: 'Fluid / Full', icon: <Maximize2 className="w-3.5 h-3.5" />, dims: '100%' },
    { id: 'mobile-sm', label: 'Mobile (375px)', icon: <Smartphone className="w-3.5 h-3.5" />, dims: '375×667' },
    { id: 'mobile-md', label: 'Mobile (390px)', icon: <Smartphone className="w-3.5 h-3.5" />, dims: '390×844' },
    { id: 'tablet', label: 'Tablet (768px)', icon: <Tablet className="w-3.5 h-3.5" />, dims: '768×1024' },
    { id: 'desktop', label: 'Desktop (1200px)', icon: <Monitor className="w-3.5 h-3.5" />, dims: '1200×800' }
  ];

  if (isCollapsed) {
    return (
      <div className="fixed bottom-16 right-4 md:bottom-4 md:right-4 z-50">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-[#141720]/90 hover:bg-[#1c2230] text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-[#2e374d] text-xs font-semibold backdrop-blur-md shadow-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          title="Open Responsive Layout Inspector"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#0066ff]" />
          <span>Viewport: {presets.find(p => p.id === currentMode)?.label || 'Fluid'}</span>
          <ChevronUp className="w-3 h-3 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-16 right-3 left-3 sm:left-auto md:bottom-4 md:right-4 z-50 max-w-xl">
      <div className="bg-[#10131a]/95 backdrop-blur-md border border-[#212633] rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
            Dev Viewport
          </span>

          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {presets.map(p => (
              <button
                key={p.id}
                onClick={() => onModeChange(p.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  currentMode === p.id
                    ? 'bg-[#0066ff] text-white shadow-sm'
                    : 'bg-[#181c25] text-slate-300 hover:text-white hover:bg-[#202532] border border-[#262c3a]'
                }`}
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {currentMode !== 'responsive' && (
            <button
              onClick={onToggleOrientation}
              className={`p-1.5 rounded-lg text-xs font-medium border border-[#262c3a] transition-colors cursor-pointer flex items-center gap-1 ${
                isLandscape ? 'bg-[#0066ff]/20 text-[#60a5fa] border-[#0066ff]/40' : 'bg-[#181c25] text-slate-400 hover:text-white'
              }`}
              title="Rotate orientation"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">{isLandscape ? 'Landscape' : 'Portrait'}</span>
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg bg-[#181c25] text-slate-400 hover:text-white border border-[#262c3a] cursor-pointer transition-colors"
            title="Minimize toolbar"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
