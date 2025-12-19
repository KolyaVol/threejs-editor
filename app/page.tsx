'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { undo, redo, removeObject } from '@/lib/store/editorSlice';
import EditorCanvas from '@/components/editor/EditorCanvas';
import SceneHierarchy from '@/components/editor/SceneHierarchy';
import PropertiesPanel from '@/components/editor/PropertiesPanel';
import MaterialLibrary from '@/components/editor/MaterialLibrary';
import ModelLibrary from '@/components/editor/ModelLibrary';
import Toolbar from '@/components/editor/Toolbar';
import ExportModal from '@/components/editor/ExportModal';
import SettingsPanel from '@/components/editor/SettingsPanel';

export default function EditorPage() {
  const dispatch = useAppDispatch();
  const selectedObjectId = useAppSelector((state) => state.editor.selectedObjectId);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  
  // Panel collapsed states
  const [hierarchyCollapsed, setHierarchyCollapsed] = useState(false);
  const [propertiesCollapsed, setPropertiesCollapsed] = useState(false);
  const [materialsCollapsed, setMaterialsCollapsed] = useState(false);
  const [modelsCollapsed, setModelsCollapsed] = useState(false);

  // Listen for right-click on object to open properties
  useEffect(() => {
    const handleOpenProperties = () => {
      setPropertiesCollapsed(false);
    };

    window.addEventListener('openProperties', handleOpenProperties);
    return () => window.removeEventListener('openProperties', handleOpenProperties);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch(undo());
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
        e.preventDefault();
        dispatch(redo());
      }

      // Delete: Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectId) {
        e.preventDefault();
        dispatch(removeObject(selectedObjectId));
      }

      // Help: ? or F1
      if (e.key === '?' || e.key === 'F1') {
        e.preventDefault();
        setShowHelp(!showHelp);
      }

      // Export: Ctrl/Cmd + E
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setShowExportModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, selectedObjectId, showHelp]);

  return (
    <div className="w-screen h-screen flex flex-col bg-zinc-900 text-white">
      {/* Toolbar */}
      <Toolbar 
        onExport={() => setShowExportModal(true)}
        onOpenSettings={() => setShowSettings(true)}
        hierarchyCollapsed={hierarchyCollapsed}
        propertiesCollapsed={propertiesCollapsed}
        materialsCollapsed={materialsCollapsed}
        modelsCollapsed={modelsCollapsed}
        onExpandHierarchy={() => setHierarchyCollapsed(false)}
        onExpandProperties={() => setPropertiesCollapsed(false)}
        onExpandMaterials={() => setMaterialsCollapsed(false)}
        onExpandModels={() => setModelsCollapsed(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Center - 3D Viewport - Full Width */}
        <div className="flex-1 relative">
          <EditorCanvas />

          {/* Left Panel - Scene Hierarchy - Overlay */}
          {!hierarchyCollapsed && (
            <div className="absolute left-0 top-0 z-50 max-h-[calc(100vh-3.5rem)] overflow-hidden">
              <SceneHierarchy 
                isCollapsed={hierarchyCollapsed}
                onToggleCollapse={() => setHierarchyCollapsed(!hierarchyCollapsed)}
              />
            </div>
          )}

          {/* Right Panels - Overlays */}
          {!propertiesCollapsed && (
            <div className="absolute right-0 top-0 z-50 max-h-[calc(100vh-3.5rem)] overflow-hidden">
              <PropertiesPanel 
                isCollapsed={propertiesCollapsed}
                onToggleCollapse={() => setPropertiesCollapsed(!propertiesCollapsed)}
              />
            </div>
          )}

          {!materialsCollapsed && (
            <div className={`absolute top-0 z-50 max-h-[calc(100vh-3.5rem)] overflow-hidden ${!propertiesCollapsed ? 'right-80' : 'right-0'}`}>
              <MaterialLibrary 
                isCollapsed={materialsCollapsed}
                onToggleCollapse={() => setMaterialsCollapsed(!materialsCollapsed)}
              />
            </div>
          )}

          {!modelsCollapsed && (
            <div className={`absolute top-0 z-50 max-h-[calc(100vh-3.5rem)] overflow-hidden ${!propertiesCollapsed && !materialsCollapsed ? 'right-[32rem]' : !propertiesCollapsed ? 'right-80' : !materialsCollapsed ? 'right-64' : 'right-0'}`}>
              <ModelLibrary 
                isCollapsed={modelsCollapsed}
                onToggleCollapse={() => setModelsCollapsed(!modelsCollapsed)}
              />
            </div>
          )}
          
          {/* Panel Toggle Buttons */}
          <div className="absolute top-4 left-4 flex gap-2">
            <button
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              className="lg:hidden w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded flex items-center justify-center transition-colors border border-zinc-600"
              title="Toggle Hierarchy"
            >
              ☰
            </button>
            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className="lg:hidden w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded flex items-center justify-center transition-colors border border-zinc-600"
              title="Toggle Panels"
            >
              ⚙
            </button>
          </div>
          
          {/* Help Button */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="absolute bottom-4 left-4 w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-xl transition-colors border border-zinc-600 z-30"
            title="Keyboard Shortcuts (F1 or ?)"
          >
            ?
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Export Modal */}
      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-700">
              <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-zinc-400 hover:text-white transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-blue-400">General</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Help</span>
                      <kbd className="px-2 py-1 bg-zinc-900 rounded text-xs">F1</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Export</span>
                      <kbd className="px-2 py-1 bg-zinc-900 rounded text-xs">Ctrl+E</kbd>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-blue-400">Edit</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Undo</span>
                      <kbd className="px-2 py-1 bg-zinc-900 rounded text-xs">Ctrl+Z</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Redo</span>
                      <kbd className="px-2 py-1 bg-zinc-900 rounded text-xs">Ctrl+Shift+Z</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Delete</span>
                      <kbd className="px-2 py-1 bg-zinc-900 rounded text-xs">Del</kbd>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-zinc-700 pt-4">
                <h3 className="font-semibold mb-2 text-blue-400">Viewport Controls</h3>
                <div className="space-y-2 text-sm text-zinc-400">
                  <div><strong>Left Mouse</strong> - Rotate camera</div>
                  <div><strong>Right Mouse</strong> - Pan camera</div>
                  <div><strong>Scroll</strong> - Zoom in/out</div>
                  <div><strong>Click Object</strong> - Select object</div>
                </div>
              </div>
              <div className="border-t border-zinc-700 pt-4">
                <h3 className="font-semibold mb-2 text-blue-400">Scene Hierarchy</h3>
                <div className="space-y-2 text-sm text-zinc-400">
                  <div><strong>Click</strong> - Select object</div>
                  <div><strong>Right Click</strong> - Context menu (rename, duplicate, delete)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
