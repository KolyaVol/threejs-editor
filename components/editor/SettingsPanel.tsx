'use client';

import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { updateSettings } from '@/lib/store/editorSlice';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.editor.settings);

  if (!isOpen) return null;

  const handleSnapToggle = (enabled: boolean) => {
    dispatch(updateSettings({ snapToGrid: enabled }));
  };

  const handleSnapSizeChange = (size: number) => {
    dispatch(updateSettings({ snapSize: size }));
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-zinc-800 border border-zinc-700 rounded-l-lg shadow-2xl z-50 flex flex-col">
        <div className="h-14 border-b border-zinc-700 flex items-center px-4 justify-between rounded-tl-lg">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors text-2xl leading-none"
            title="Close"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Snap to Grid Section */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Snap to Grid</h3>
            
            {/* Enable/Disable Snap */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-zinc-400">Enable Snap to Grid</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.snapToGrid}
                    onChange={(e) => handleSnapToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p className="text-xs text-zinc-500">
                When enabled, objects will snap to grid points when moved
              </p>
            </div>

            {/* Snap Size */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Snap Size: {settings.snapSize} units
              </label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={settings.snapSize}
                onChange={(e) => handleSnapSizeChange(parseFloat(e.target.value))}
                disabled={!settings.snapToGrid}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>0.1</span>
                <span>1.0</span>
                <span>2.0</span>
              </div>
            </div>

            {/* Quick Presets */}
            {settings.snapToGrid && (
              <div className="mt-4">
                <label className="block text-xs text-zinc-500 mb-2">Quick Presets:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSnapSizeChange(0.1)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      settings.snapSize === 0.1 ? 'bg-blue-600' : 'bg-zinc-700 hover:bg-zinc-600'
                    }`}
                  >
                    0.1
                  </button>
                  <button
                    onClick={() => handleSnapSizeChange(0.5)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      settings.snapSize === 0.5 ? 'bg-blue-600' : 'bg-zinc-700 hover:bg-zinc-600'
                    }`}
                  >
                    0.5
                  </button>
                  <button
                    onClick={() => handleSnapSizeChange(1.0)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      settings.snapSize === 1.0 ? 'bg-blue-600' : 'bg-zinc-700 hover:bg-zinc-600'
                    }`}
                  >
                    1.0
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="border-t border-zinc-700 pt-4">
            <p className="text-xs text-zinc-500">
              Snap to grid applies when moving objects with the transform controls. 
              Objects will automatically align to the nearest grid point based on the snap size.
            </p>
          </div>
        </div>
      </div>
  );
}

