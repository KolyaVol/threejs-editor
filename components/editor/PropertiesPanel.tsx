'use client';

import { useAppSelector, useAppDispatch, selectors } from '@/lib/store/hooks';
import { updateObjectWithHistory } from '@/lib/store/editorSlice';
import { MaterialConfig } from '@/types/editor.types';
import { useCallback, useMemo, useState, useEffect } from 'react';

interface PropertiesPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function PropertiesPanel({ isCollapsed, onToggleCollapse }: PropertiesPanelProps) {
  const dispatch = useAppDispatch();
  const selectedObjectId = useAppSelector((state) => state.editor.selectedObjectId);
  const selectedObject = useAppSelector(selectors.selectSelectedObject);

  if (!selectedObject) {
    return (
      <div className="w-80 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl flex flex-col">
        <div className="h-10 border-b border-zinc-700 flex items-center px-4 justify-between rounded-t-lg">
          <h2 className="text-sm font-semibold">Properties</h2>
          <button
            onClick={onToggleCollapse}
            className="text-zinc-400 hover:text-white transition-colors text-xl"
            title="Close"
          >
            ×
          </button>
        </div>
        <div className="p-8 flex items-center justify-center text-sm text-zinc-500">
          No object selected
        </div>
      </div>
    );
  }

  const isLight = useMemo(() => selectedObject && ['ambientLight', 'directionalLight', 'pointLight', 'spotLight'].includes(selectedObject.type), [selectedObject]);

  // Local state for number inputs (rotation, position, scale) to allow free typing
  const [rotationInputs, setRotationInputs] = useState<[string, string, string]>(['', '', '']);
  const [positionInputs, setPositionInputs] = useState<[string, string, string]>(['', '', '']);
  const [scaleInputs, setScaleInputs] = useState<[string, string, string]>(['', '', '']);

  // Sync local state when selectedObject changes
  useEffect(() => {
    if (selectedObject) {
      setRotationInputs([
        (selectedObject.rotation[0] * 180 / Math.PI).toFixed(1),
        (selectedObject.rotation[1] * 180 / Math.PI).toFixed(1),
        (selectedObject.rotation[2] * 180 / Math.PI).toFixed(1),
      ]);
      setPositionInputs([
        selectedObject.position[0].toFixed(2),
        selectedObject.position[1].toFixed(2),
        selectedObject.position[2].toFixed(2),
      ]);
      setScaleInputs([
        selectedObject.scale[0].toFixed(2),
        selectedObject.scale[1].toFixed(2),
        selectedObject.scale[2].toFixed(2),
      ]);
    }
  }, [selectedObject?.id, selectedObject?.rotation, selectedObject?.position, selectedObject?.scale]);

  const updateProperty = useCallback((property: string, value: any) => {
    if (!selectedObjectId) return;
    dispatch(updateObjectWithHistory({
      id: selectedObjectId,
      updates: { [property]: value }
    }));
  }, [dispatch, selectedObjectId]);

  const updateTransform = useCallback((axis: 'position' | 'rotation' | 'scale', index: number, value: number) => {
    if (!selectedObjectId || !selectedObject) return;
    const newTransform = [...selectedObject[axis]];
    newTransform[index] = value;
    dispatch(updateObjectWithHistory({
      id: selectedObjectId,
      updates: { [axis]: newTransform as [number, number, number] }
    }));
  }, [dispatch, selectedObjectId, selectedObject]);

  // Handle number input changes (updates local state only)
  const handleRotationInputChange = useCallback((index: number, value: string) => {
    const newInputs: [string, string, string] = [...rotationInputs];
    newInputs[index] = value;
    setRotationInputs(newInputs);
  }, [rotationInputs]);

  const handlePositionInputChange = useCallback((index: number, value: string) => {
    const newInputs: [string, string, string] = [...positionInputs];
    newInputs[index] = value;
    setPositionInputs(newInputs);
  }, [positionInputs]);

  const handleScaleInputChange = useCallback((index: number, value: string) => {
    const newInputs: [string, string, string] = [...scaleInputs];
    newInputs[index] = value;
    setScaleInputs(newInputs);
  }, [scaleInputs]);

  // Commit rotation value (on blur or Enter)
  const commitRotation = useCallback((index: number) => {
    const value = parseFloat(rotationInputs[index]);
    if (!isNaN(value)) {
      updateTransform('rotation', index, value * Math.PI / 180);
    } else {
      // Reset to current value if invalid
      if (selectedObject) {
        setRotationInputs([
          (selectedObject.rotation[0] * 180 / Math.PI).toFixed(1),
          (selectedObject.rotation[1] * 180 / Math.PI).toFixed(1),
          (selectedObject.rotation[2] * 180 / Math.PI).toFixed(1),
        ]);
      }
    }
  }, [rotationInputs, updateTransform, selectedObject]);

  // Commit position value (on blur or Enter)
  const commitPosition = useCallback((index: number) => {
    const value = parseFloat(positionInputs[index]);
    if (!isNaN(value)) {
      updateTransform('position', index, value);
    } else {
      // Reset to current value if invalid
      if (selectedObject) {
        setPositionInputs([
          selectedObject.position[0].toFixed(2),
          selectedObject.position[1].toFixed(2),
          selectedObject.position[2].toFixed(2),
        ]);
      }
    }
  }, [positionInputs, updateTransform, selectedObject]);

  // Commit scale value (on blur or Enter)
  const commitScale = useCallback((index: number) => {
    const value = parseFloat(scaleInputs[index]);
    if (!isNaN(value)) {
      updateTransform('scale', index, value);
    } else {
      // Reset to current value if invalid
      if (selectedObject) {
        setScaleInputs([
          selectedObject.scale[0].toFixed(2),
          selectedObject.scale[1].toFixed(2),
          selectedObject.scale[2].toFixed(2),
        ]);
      }
    }
  }, [scaleInputs, updateTransform, selectedObject]);

  const updateMaterial = useCallback((property: keyof MaterialConfig, value: any) => {
    if (!selectedObjectId || !selectedObject?.material) return;
    const newMaterial = { ...selectedObject.material, [property]: value };
    dispatch(updateObjectWithHistory({
      id: selectedObjectId,
      updates: { material: newMaterial }
    }));
  }, [dispatch, selectedObjectId, selectedObject]);

  return (
    <div className="w-80 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl flex flex-col">
      <div className="h-10 border-b border-zinc-700 flex items-center px-4 justify-between rounded-t-lg">
        <h2 className="text-sm font-semibold">Properties</h2>
        <button
          onClick={onToggleCollapse}
          className="text-zinc-400 hover:text-white transition-colors text-xl"
          title="Close"
        >
          ×
        </button>
      </div>
      <div className="max-h-[calc(100vh-10rem)] overflow-y-auto p-4 space-y-4">
        {/* Object Name */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">Name</label>
          <input
            type="text"
            value={selectedObject.name}
            onChange={(e) => updateProperty('name', e.target.value)}
            className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Visibility */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="visible"
            checked={selectedObject.visible}
            onChange={(e) => updateProperty('visible', e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="visible" className="text-sm">Visible</label>
        </div>

        {/* Transform - Position */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-2">Position</label>
          <div className="grid grid-cols-3 gap-2">
            {(['x', 'y', 'z'] as const).map((axis, index) => (
              <div key={axis}>
                <label className="block text-xs text-zinc-500 mb-1">{axis.toUpperCase()}</label>
                <input
                  type="text"
                  value={positionInputs[index]}
                  onChange={(e) => handlePositionInputChange(index, e.target.value)}
                  onBlur={() => commitPosition(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Transform - Rotation */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-2">Rotation</label>
          <div className="grid grid-cols-3 gap-2">
            {(['x', 'y', 'z'] as const).map((axis, index) => (
              <div key={axis}>
                <label className="block text-xs text-zinc-500 mb-1">{axis.toUpperCase()}</label>
                <input
                  type="text"
                  value={rotationInputs[index]}
                  onChange={(e) => handleRotationInputChange(index, e.target.value)}
                  onBlur={() => commitRotation(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
          <div className="text-xs text-zinc-500 mt-1">Values in degrees</div>
        </div>

        {/* Transform - Scale */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-2">Scale</label>
          <div className="grid grid-cols-3 gap-2">
            {(['x', 'y', 'z'] as const).map((axis, index) => (
              <div key={axis}>
                <label className="block text-xs text-zinc-500 mb-1">{axis.toUpperCase()}</label>
                <input
                  type="text"
                  value={scaleInputs[index]}
                  onChange={(e) => handleScaleInputChange(index, e.target.value)}
                  onBlur={() => commitScale(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Light Properties */}
        {isLight && (
          <>
            <div className="border-t border-zinc-700 pt-4">
              <label className="block text-xs font-semibold text-zinc-400 mb-2">Light Properties</label>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Intensity</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={selectedObject.intensity || 1}
                onChange={(e) => updateProperty('intensity', parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Color</label>
              <input
                type="color"
                value={selectedObject.lightColor || '#ffffff'}
                onChange={(e) => updateProperty('lightColor', e.target.value)}
                className="w-full h-8 bg-zinc-900 border border-zinc-700 rounded cursor-pointer"
              />
            </div>

            {selectedObject.type !== 'ambientLight' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="castShadow"
                  checked={selectedObject.castShadow || false}
                  onChange={(e) => updateProperty('castShadow', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="castShadow" className="text-sm">Cast Shadow</label>
              </div>
            )}
          </>
        )}

        {/* Material Properties */}
        {!isLight && selectedObject.material && (
          <>
            <div className="border-t border-zinc-700 pt-4">
              <label className="block text-xs font-semibold text-zinc-400 mb-2">Material</label>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Type</label>
              <select
                value={selectedObject.material.type}
                onChange={(e) => updateMaterial('type', e.target.value as any)}
                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="standard">Standard</option>
                <option value="basic">Basic</option>
                <option value="phong">Phong</option>
                <option value="lambert">Lambert</option>
                <option value="physical">Physical</option>
                <option value="toon">Toon</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Color</label>
              <input
                type="color"
                value={selectedObject.material.color}
                onChange={(e) => updateMaterial('color', e.target.value)}
                className="w-full h-8 bg-zinc-900 border border-zinc-700 rounded cursor-pointer"
              />
            </div>

            {(selectedObject.material.type === 'standard' || selectedObject.material.type === 'physical') && (
              <>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">
                    Metalness: {selectedObject.material.metalness?.toFixed(2) || 0}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={selectedObject.material.metalness || 0}
                    onChange={(e) => updateMaterial('metalness', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-1">
                    Roughness: {selectedObject.material.roughness?.toFixed(2) || 0.5}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={selectedObject.material.roughness || 0.5}
                    onChange={(e) => updateMaterial('roughness', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="wireframe"
                checked={selectedObject.material.wireframe || false}
                onChange={(e) => updateMaterial('wireframe', e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="wireframe" className="text-sm">Wireframe</label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

