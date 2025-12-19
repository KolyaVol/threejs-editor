'use client';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { addObject, removeObject, setTransformMode, undo, redo, clearScene } from '@/lib/store/editorSlice';
import { generateObjectId } from '@/lib/utils/sceneHelpers';
import { SceneObject, TransformMode } from '@/types/editor.types';
import { useState } from 'react';

interface ToolbarProps {
  onExport: () => void;
  hierarchyCollapsed: boolean;
  propertiesCollapsed: boolean;
  materialsCollapsed: boolean;
  modelsCollapsed: boolean;
  onExpandHierarchy: () => void;
  onExpandProperties: () => void;
  onExpandMaterials: () => void;
  onExpandModels: () => void;
}

export default function Toolbar({ 
  onExport, 
  hierarchyCollapsed,
  propertiesCollapsed,
  materialsCollapsed,
  modelsCollapsed,
  onExpandHierarchy,
  onExpandProperties,
  onExpandMaterials,
  onExpandModels
}: ToolbarProps) {
  const dispatch = useAppDispatch();
  const selectedObjectId = useAppSelector((state) => state.editor.selectedObjectId);
  const transformMode = useAppSelector((state) => state.editor.transformMode);
  const historyIndex = useAppSelector((state) => state.editor.historyIndex);
  const historyLength = useAppSelector((state) => state.editor.history.length);
  const [showPrimitiveMenu, setShowPrimitiveMenu] = useState(false);
  const [showLightMenu, setShowLightMenu] = useState(false);

  const addPrimitive = (type: 'box' | 'sphere' | 'cylinder' | 'plane' | 'torus' | 'cone') => {
    const geometryArgsMap = {
      box: [1, 1, 1],
      sphere: [1, 32, 32],
      cylinder: [1, 1, 2, 32],
      plane: [10, 10],
      torus: [1, 0.4, 16, 100],
      cone: [1, 2, 32],
    };

    const newObject: SceneObject = {
      id: generateObjectId(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      position: [0, type === 'plane' ? 0 : 1, 0],
      rotation: type === 'plane' ? [-Math.PI / 2, 0, 0] : [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      geometryArgs: geometryArgsMap[type],
      material: {
        type: 'standard',
        color: '#888888',
        metalness: 0,
        roughness: 0.5,
      },
    };

    dispatch(addObject(newObject));
    setShowPrimitiveMenu(false);
  };

  const addLight = (type: 'ambientLight' | 'directionalLight' | 'pointLight' | 'spotLight') => {
    const newLight: SceneObject = {
      id: generateObjectId(),
      name: type.replace('Light', ' Light').replace(/([A-Z])/g, ' $1').trim(),
      type,
      position: type === 'ambientLight' ? [0, 0, 0] : [5, 5, 5],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      intensity: type === 'ambientLight' ? 0.5 : 1,
      lightColor: '#ffffff',
      castShadow: type !== 'ambientLight',
    };

    dispatch(addObject(newLight));
    setShowLightMenu(false);
  };

  const handleDelete = () => {
    if (selectedObjectId) {
      dispatch(removeObject(selectedObjectId));
    }
  };

  const handleUndo = () => {
    dispatch(undo());
  };

  const handleRedo = () => {
    dispatch(redo());
  };

  const handleClear = () => {
    if (confirm('Clear entire scene? This cannot be undone.')) {
      dispatch(clearScene());
    }
  };

  return (
    <div className="h-14 bg-zinc-800 border-b border-zinc-700 flex items-center px-4 gap-2">
      {/* Collapsed Panel Buttons */}
      {hierarchyCollapsed && (
        <button
          onClick={onExpandHierarchy}
          className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-sm transition-colors flex items-center gap-2"
          title="Expand Scene Hierarchy"
        >
          <span>☰</span>
          <span>Hierarchy</span>
        </button>
      )}
      {propertiesCollapsed && (
        <button
          onClick={onExpandProperties}
          className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-sm transition-colors flex items-center gap-2"
          title="Expand Properties"
        >
          <span>⚙</span>
          <span>Properties</span>
        </button>
      )}
      {materialsCollapsed && (
        <button
          onClick={onExpandMaterials}
          className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-sm transition-colors flex items-center gap-2"
          title="Expand Materials"
        >
          <span>🎨</span>
          <span>Materials</span>
        </button>
      )}
      {modelsCollapsed && (
        <button
          onClick={onExpandModels}
          className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-sm transition-colors flex items-center gap-2"
          title="Expand Models"
        >
          <span>🏠</span>
          <span>Models</span>
        </button>
      )}
      
      {(hierarchyCollapsed || propertiesCollapsed || materialsCollapsed || modelsCollapsed) && (
        <div className="w-px h-8 bg-zinc-600 mx-1" />
      )}

      {/* Add Primitive Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowPrimitiveMenu(!showPrimitiveMenu)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
        >
          + Add Shape
        </button>
        {showPrimitiveMenu && (
          <div className="absolute top-full mt-1 left-0 bg-zinc-700 rounded shadow-lg py-1 z-10 min-w-[140px]">
            <button onClick={() => addPrimitive('box')} className="block w-full text-left px-4 py-2 hover:bg-zinc-600 text-sm">
              Box
            </button>
            <button onClick={() => addPrimitive('sphere')} className="block w-full text-left px-4 py-2 hover:bg-zinc-600 text-sm">
              Sphere
            </button>
            <button onClick={() => addPrimitive('cylinder')} className="block w-full text-left px-4 py-2 hover:bg-zinc-600 text-sm">
              Cylinder
            </button>
            <button onClick={() => addPrimitive('cone')} className="block w-full text-left px-4 py-2 hover:bg-zinc-600 text-sm">
              Cone
            </button>
            <button onClick={() => addPrimitive('torus')} className="block w-full text-left px-4 py-2 hover:bg-zinc-600 text-sm">
              Torus
            </button>
            <button onClick={() => addPrimitive('plane')} className="block w-full text-left px-4 py-2 hover:bg-zinc-600 text-sm">
              Plane
            </button>
          </div>
        )}
      </div>

      {/* Add Light Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowLightMenu(!showLightMenu)}
          className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-medium transition-colors"
        >
          + Add Light
        </button>
        {showLightMenu && (
          <div className="absolute top-full mt-1 left-0 bg-zinc-700 rounded shadow-lg py-1 z-10 min-w-[160px]">
            <button onClick={() => addLight('ambientLight')} className="block w-full text-left px-4 py-2 hover:bg-zinc-600 text-sm">
              Ambient Light
            </button>
            <button onClick={() => addLight('directionalLight')} className="block w-full text-left px-4 py-2 hover:bg-zinc-600 text-sm">
              Directional Light
            </button>
            <button onClick={() => addLight('pointLight')} className="block w-full text-left px-4 py-2 hover:bg-zinc-600 text-sm">
              Point Light
            </button>
            <button onClick={() => addLight('spotLight')} className="block w-full text-left px-4 py-2 hover:bg-zinc-600 text-sm">
              Spot Light
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-8 bg-zinc-600 mx-1" />

      {/* Transform Mode Buttons */}
      <div className="flex gap-1">
        <button
          onClick={() => dispatch(setTransformMode('translate'))}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            transformMode === 'translate' ? 'bg-blue-600' : 'bg-zinc-700 hover:bg-zinc-600'
          }`}
          title="Translate (Move)"
        >
          Move
        </button>
        <button
          onClick={() => dispatch(setTransformMode('rotate'))}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            transformMode === 'rotate' ? 'bg-blue-600' : 'bg-zinc-700 hover:bg-zinc-600'
          }`}
          title="Rotate"
        >
          Rotate
        </button>
        <button
          onClick={() => dispatch(setTransformMode('scale'))}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            transformMode === 'scale' ? 'bg-blue-600' : 'bg-zinc-700 hover:bg-zinc-600'
          }`}
          title="Scale"
        >
          Scale
        </button>
      </div>

      <div className="w-px h-8 bg-zinc-600 mx-1" />

      {/* Action Buttons */}
      <button
        onClick={handleDelete}
        disabled={!selectedObjectId}
        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:text-zinc-500 rounded text-sm font-medium transition-colors"
        title="Delete Selected (Del)"
      >
        Delete
      </button>

      <div className="w-px h-8 bg-zinc-600 mx-1" />

      {/* Undo/Redo */}
      <button
        onClick={handleUndo}
        disabled={historyIndex <= 0}
        className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-600 rounded text-sm font-medium transition-colors"
        title="Undo (Ctrl+Z)"
      >
        ↶ Undo
      </button>
      <button
        onClick={handleRedo}
        disabled={historyIndex >= historyLength - 1}
        className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-600 rounded text-sm font-medium transition-colors"
        title="Redo (Ctrl+Shift+Z)"
      >
        ↷ Redo
      </button>

      <div className="flex-1" />

      {/* Export and Clear */}
      <button
        onClick={handleClear}
        className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-sm font-medium transition-colors"
      >
        Clear Scene
      </button>
      <button
        onClick={onExport}
        className="px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
      >
        Export Code
      </button>
    </div>
  );
}

