"use client";

import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { updateSettings } from "@/lib/store/editorSlice";

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

  const handleRotationSnapToggle = (enabled: boolean) => {
    dispatch(updateSettings({ snapRotation: enabled }));
  };

  const handleRotationStepChange = (step: number) => {
    dispatch(updateSettings({ rotationStep: step }));
  };

  const handleScaleSnapToggle = (enabled: boolean) => {
    dispatch(updateSettings({ snapScale: enabled }));
  };

  const handleScaleStepChange = (step: number) => {
    dispatch(updateSettings({ scaleStep: step }));
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

          {settings.snapToGrid && (
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
          )}

          {/* Quick Presets */}
          {settings.snapToGrid && (
            <div className="mt-4">
              <label className="block text-xs text-zinc-500 mb-2">Quick Presets:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSnapSizeChange(0.1)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    settings.snapSize === 0.1 ? "bg-blue-600" : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  0.1
                </button>
                <button
                  onClick={() => handleSnapSizeChange(0.5)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    settings.snapSize === 0.5 ? "bg-blue-600" : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  0.5
                </button>
                <button
                  onClick={() => handleSnapSizeChange(1.0)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    settings.snapSize === 1.0 ? "bg-blue-600" : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  1.0
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rotation Snap Section */}
        <div className="border-t border-zinc-700 pt-6">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Rotation Snap</h3>

          {/* Enable/Disable Rotation Snap */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-zinc-400">Enable Rotation Snap</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.snapRotation}
                  onChange={(e) => handleRotationSnapToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-xs text-zinc-500">
              When enabled, objects will snap to rotation steps when rotated (hold Ctrl to rotate in
              translate mode)
            </p>
          </div>

          {/* Rotation Step */}
          {settings.snapRotation && (
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Rotation Step: {settings.rotationStep}°
              </label>
              <input
                type="range"
                min="1"
                max="90"
                step="1"
                value={settings.rotationStep}
                onChange={(e) => handleRotationStepChange(parseInt(e.target.value))}
                disabled={!settings.snapRotation}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>1°</span>
                <span>45°</span>
                <span>90°</span>
              </div>
            </div>
          )}

          {/* Quick Presets */}
          {settings.snapRotation && (
            <div className="mt-4">
              <label className="block text-xs text-zinc-500 mb-2">Quick Presets:</label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleRotationStepChange(15)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    settings.rotationStep === 15 ? "bg-blue-600" : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  15°
                </button>
                <button
                  onClick={() => handleRotationStepChange(30)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    settings.rotationStep === 30 ? "bg-blue-600" : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  30°
                </button>
                <button
                  onClick={() => handleRotationStepChange(45)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    settings.rotationStep === 45 ? "bg-blue-600" : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  45°
                </button>
                <button
                  onClick={() => handleRotationStepChange(90)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    settings.rotationStep === 90 ? "bg-blue-600" : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  90°
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scale Snap Section */}
        <div className="border-t border-zinc-700 pt-6">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Scale Snap</h3>

          {/* Enable/Disable Scale Snap */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-zinc-400">Enable Scale Snap</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.snapScale}
                  onChange={(e) => handleScaleSnapToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-xs text-zinc-500">
              When enabled, objects will snap to scale steps when scaled (hold Shift to scale in
              translate mode)
            </p>
          </div>

          {/* Scale Step */}
          {settings.snapScale && (
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Scale Step: {settings.scaleStep}
              </label>
              <input
                type="range"
                min="0.01"
                max="1"
                step="0.01"
                value={settings.scaleStep}
                onChange={(e) => handleScaleStepChange(parseFloat(e.target.value))}
                disabled={!settings.snapScale}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>0.01</span>
                <span>0.5</span>
                <span>1.0</span>
              </div>
            </div>
          )}

          {/* Quick Presets */}
          {settings.snapScale && (
            <div className="mt-4">
              <label className="block text-xs text-zinc-500 mb-2">Quick Presets:</label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleScaleStepChange(0.1)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    settings.scaleStep === 0.1 ? "bg-blue-600" : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  0.1
                </button>
                <button
                  onClick={() => handleScaleStepChange(0.25)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    settings.scaleStep === 0.25 ? "bg-blue-600" : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  0.25
                </button>
                <button
                  onClick={() => handleScaleStepChange(0.5)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    settings.scaleStep === 0.5 ? "bg-blue-600" : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  0.5
                </button>
                <button
                  onClick={() => handleScaleStepChange(1.0)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    settings.scaleStep === 1.0 ? "bg-blue-600" : "bg-zinc-700 hover:bg-zinc-600"
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
          <p className="text-xs text-zinc-500 mb-2">
            Snap to grid applies when moving objects with the transform controls. Objects will
            automatically align to the nearest grid point based on the snap size.
          </p>
          <div className="space-y-1 text-xs text-zinc-500">
            <p>
              <strong>Keyboard Shortcuts:</strong>
            </p>
            <p>
              • Hold <kbd className="px-1 py-0.5 bg-zinc-700 rounded text-xs">Ctrl</kbd> while in
              translate mode to temporarily switch to <strong>rotation</strong> mode.
            </p>
            <p>
              • Hold <kbd className="px-1 py-0.5 bg-zinc-700 rounded text-xs">Shift</kbd> while in
              translate mode to temporarily switch to <strong>scale</strong> mode.
            </p>
            <p className="text-zinc-400 mt-2">
              In scale mode: drag axis handles for axis-specific scaling, drag center handle for
              uniform scaling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
