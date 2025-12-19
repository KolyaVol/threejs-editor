'use client';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { addObject, removeObject, setTransformMode, undo, redo, clearScene } from '@/lib/store/editorSlice';
import { generateObjectId } from '@/lib/utils/sceneHelpers';
import { SceneObject, TransformMode } from '@/types/editor.types';
import { useState } from 'react';

interface ToolbarProps {
  onExport: () => void;
  onOpenSettings: () => void;
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
  onOpenSettings,
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
  const [showCollapsedPanelsMenu, setShowCollapsedPanelsMenu] = useState(false);
  const [primitiveMenuPos, setPrimitiveMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [lightMenuPos, setLightMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [panelsMenuPos, setPanelsMenuPos] = useState<{ top: number; left: number } | null>(null);

  // Count collapsed panels
  const collapsedPanels = [
    { collapsed: hierarchyCollapsed, name: 'Hierarchy', icon: '☰', onExpand: onExpandHierarchy },
    { collapsed: propertiesCollapsed, name: 'Properties', icon: '⚙', onExpand: onExpandProperties },
    { collapsed: materialsCollapsed, name: 'Materials', icon: '🎨', onExpand: onExpandMaterials },
    { collapsed: modelsCollapsed, name: 'Models', icon: '🏠', onExpand: onExpandModels },
  ].filter(panel => panel.collapsed);

  const hasCollapsedPanels = collapsedPanels.length > 0;

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
    <div className="h-14 bg-zinc-800 border-b border-zinc-700 flex items-center px-4 gap-2 overflow-x-auto relative z-50">
      {/* Collapsed Panel Buttons - Individual on large screens, dropdown on small */}
      {hasCollapsedPanels && (
        <>
          {/* Individual buttons - hidden on small screens */}
          <div className="hidden lg:flex items-center gap-2">
            {hierarchyCollapsed && (
              <button
                onClick={onExpandHierarchy}
                className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
                title="Expand Scene Hierarchy"
              >
                <span>☰</span>
                <span>Hierarchy</span>
              </button>
            )}
            {propertiesCollapsed && (
              <button
                onClick={onExpandProperties}
                className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
                title="Expand Properties"
              >
                <span>⚙</span>
                <span>Properties</span>
              </button>
            )}
            {materialsCollapsed && (
              <button
                onClick={onExpandMaterials}
                className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
                title="Expand Materials"
              >
                <span>🎨</span>
                <span>Materials</span>
              </button>
            )}
            {modelsCollapsed && (
              <button
                onClick={onExpandModels}
                className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
                title="Expand Models"
              >
                <span>🏠</span>
                <span>Models</span>
              </button>
            )}
          </div>

          {/* Dropdown menu - visible on small screens */}
          <div className="relative lg:hidden">
            <button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                if (!showCollapsedPanelsMenu) {
                  setPanelsMenuPos({ top: rect.bottom + 4, left: rect.left });
                }
                setShowCollapsedPanelsMenu(!showCollapsedPanelsMenu);
              }}
              className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
              title="Collapsed Panels"
            >
              <span>📋</span>
              <span>Panels ({collapsedPanels.length})</span>
            </button>
            {showCollapsedPanelsMenu && panelsMenuPos && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowCollapsedPanelsMenu(false)}
                />
                <div 
                  className="fixed bg-zinc-700 rounded shadow-lg py-1 z-50 min-w-[180px]"
                  style={{
                    top: `${panelsMenuPos.top}px`,
                    left: `${panelsMenuPos.left}px`
                  }}
                >
                  {collapsedPanels.map((panel) => (
                    <button
                      key={panel.name}
                      onClick={() => {
                        panel.onExpand();
                        setShowCollapsedPanelsMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-zinc-600 text-sm flex items-center gap-2"
                    >
                      <span>{panel.icon}</span>
                      <span>{panel.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="w-px h-8 bg-zinc-600 mx-1" />
        </>
      )}

      {/* Add Primitive Dropdown */}
      <div className="relative">
        <button
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            if (!showPrimitiveMenu) {
              setPrimitiveMenuPos({ top: rect.bottom + 4, left: rect.left });
            }
            setShowPrimitiveMenu(!showPrimitiveMenu);
          }}
          className="px-2 md:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors whitespace-nowrap"
        >
          <span className="hidden sm:inline">+ Add Shape</span>
          <span className="sm:hidden">+ Shape</span>
        </button>
        {showPrimitiveMenu && primitiveMenuPos && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setShowPrimitiveMenu(false)}
            />
            <div 
              className="fixed bg-zinc-700 rounded shadow-lg py-1 z-50 min-w-[140px]"
              style={{
                top: `${primitiveMenuPos.top}px`,
                left: `${primitiveMenuPos.left}px`
              }}
            >
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
          </>
        )}
      </div>

      {/* Add Light Dropdown */}
      <div className="relative">
        <button
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            if (!showLightMenu) {
              setLightMenuPos({ top: rect.bottom + 4, left: rect.left });
            }
            setShowLightMenu(!showLightMenu);
          }}
          className="px-2 md:px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-medium transition-colors whitespace-nowrap"
        >
          <span className="hidden sm:inline">+ Add Light</span>
          <span className="sm:hidden">+ Light</span>
        </button>
        {showLightMenu && lightMenuPos && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setShowLightMenu(false)}
            />
            <div 
              className="fixed bg-zinc-700 rounded shadow-lg py-1 z-50 min-w-[160px]"
              style={{
                top: `${lightMenuPos.top}px`,
                left: `${lightMenuPos.left}px`
              }}
            >
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
          </>
        )}
      </div>

      <div className="w-px h-8 bg-zinc-600 mx-1" />

      {/* Transform Mode Buttons */}
      <div className="flex gap-1">
        <button
          onClick={() => dispatch(setTransformMode('translate'))}
          className={`px-2 md:px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
            transformMode === 'translate' ? 'bg-blue-600' : 'bg-zinc-700 hover:bg-zinc-600'
          }`}
          title="Translate (Move)"
        >
          <span className="hidden sm:inline">Move</span>
          <span className="sm:hidden">M</span>
        </button>
        <button
          onClick={() => dispatch(setTransformMode('rotate'))}
          className={`px-2 md:px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
            transformMode === 'rotate' ? 'bg-blue-600' : 'bg-zinc-700 hover:bg-zinc-600'
          }`}
          title="Rotate"
        >
          <span className="hidden sm:inline">Rotate</span>
          <span className="sm:hidden">R</span>
        </button>
        <button
          onClick={() => dispatch(setTransformMode('scale'))}
          className={`px-2 md:px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
            transformMode === 'scale' ? 'bg-blue-600' : 'bg-zinc-700 hover:bg-zinc-600'
          }`}
          title="Scale"
        >
          <span className="hidden sm:inline">Scale</span>
          <span className="sm:hidden">S</span>
        </button>
      </div>

      <div className="w-px h-8 bg-zinc-600 mx-1" />

      {/* Action Buttons */}
      <button
        onClick={handleDelete}
        disabled={!selectedObjectId}
        className="px-2 md:px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:text-zinc-500 rounded text-sm font-medium transition-colors whitespace-nowrap"
        title="Delete Selected (Del)"
      >
        <span className="hidden sm:inline">Delete</span>
        <span className="sm:hidden">Del</span>
      </button>

      <div className="w-px h-8 bg-zinc-600 mx-1" />

      {/* Undo/Redo */}
      <button
        onClick={handleUndo}
        disabled={historyIndex <= 0}
        className="px-2 md:px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-600 rounded text-sm font-medium transition-colors whitespace-nowrap"
        title="Undo (Ctrl+Z)"
      >
        <span className="hidden sm:inline">↶ Undo</span>
        <span className="sm:hidden">↶</span>
      </button>
      <button
        onClick={handleRedo}
        disabled={historyIndex >= historyLength - 1}
        className="px-2 md:px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-600 rounded text-sm font-medium transition-colors whitespace-nowrap"
        title="Redo (Ctrl+Shift+Z)"
      >
        <span className="hidden sm:inline">↷ Redo</span>
        <span className="sm:hidden">↷</span>
      </button>

      <div className="flex-1 min-w-4" />

      {/* Settings Button */}
      <button
        onClick={onOpenSettings}
        className="px-2 md:px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-sm font-medium transition-colors whitespace-nowrap"
        title="Settings"
      >
        <span className="hidden sm:inline">⚙️ Settings</span>
        <span className="sm:hidden">⚙️</span>
      </button>

      {/* Export and Clear */}
      <button
        onClick={handleClear}
        className="px-2 md:px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-sm font-medium transition-colors whitespace-nowrap hidden sm:block"
        title="Clear Scene"
      >
        Clear Scene
      </button>
      <button
        onClick={onExport}
        className="px-3 md:px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors whitespace-nowrap"
        title="Export Code"
      >
        <span className="hidden sm:inline">Export Code</span>
        <span className="sm:hidden">Export</span>
      </button>
    </div>
  );
}

