'use client';

import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { selectObject, removeObject, duplicateObject, updateObjectWithHistory } from '@/lib/store/editorSlice';
import { useState } from 'react';

export default function SceneHierarchy() {
  const dispatch = useAppDispatch();
  const objects = useAppSelector((state) => state.editor.objects);
  const selectedObjectId = useAppSelector((state) => state.editor.selectedObjectId);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; objectId: string } | null>(null);

  const handleSelect = (id: string) => {
    dispatch(selectObject(id));
  };

  const handleContextMenu = (e: React.MouseEvent, objectId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, objectId });
  };

  const handleDuplicate = () => {
    if (contextMenu) {
      dispatch(duplicateObject(contextMenu.objectId));
      setContextMenu(null);
    }
  };

  const handleDelete = () => {
    if (contextMenu) {
      dispatch(removeObject(contextMenu.objectId));
      setContextMenu(null);
    }
  };

  const handleRename = () => {
    if (contextMenu) {
      const object = objects.find(obj => obj.id === contextMenu.objectId);
      if (object) {
        const newName = prompt('Enter new name:', object.name);
        if (newName && newName.trim()) {
          dispatch(updateObjectWithHistory({
            id: contextMenu.objectId,
            updates: { name: newName.trim() }
          }));
        }
      }
      setContextMenu(null);
    }
  };

  const getObjectIcon = (type: string) => {
    const icons: Record<string, string> = {
      box: '◻',
      sphere: '●',
      cylinder: '▢',
      cone: '▲',
      torus: '◯',
      plane: '▭',
      model: '🎨',
      ambientLight: '☀',
      directionalLight: '💡',
      pointLight: '⚡',
      spotLight: '🔦',
    };
    return icons[type] || '■';
  };

  return (
    <>
      <div className="w-64 bg-zinc-800 border-r border-zinc-700 flex flex-col">
        <div className="h-10 border-b border-zinc-700 flex items-center px-4">
          <h2 className="text-sm font-semibold">Scene Hierarchy</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {objects.length === 0 ? (
            <div className="text-sm text-zinc-500 text-center mt-4">
              No objects in scene
            </div>
          ) : (
            <div className="space-y-0.5">
              {objects.map((object) => (
                <div
                  key={object.id}
                  onClick={() => handleSelect(object.id)}
                  onContextMenu={(e) => handleContextMenu(e, object.id)}
                  className={`px-3 py-2 rounded cursor-pointer text-sm flex items-center gap-2 transition-colors ${
                    selectedObjectId === object.id
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  <span className="text-base">{getObjectIcon(object.type)}</span>
                  <span className="flex-1 truncate">{object.name}</span>
                  {!object.visible && <span className="text-xs opacity-50">👁‍🗨</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="h-8 border-t border-zinc-700 flex items-center px-4 text-xs text-zinc-500">
          {objects.length} object{objects.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed bg-zinc-700 rounded shadow-lg py-1 z-50 min-w-[150px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={handleRename}
              className="block w-full text-left px-4 py-2 hover:bg-zinc-600 text-sm"
            >
              Rename
            </button>
            <button
              onClick={handleDuplicate}
              className="block w-full text-left px-4 py-2 hover:bg-zinc-600 text-sm"
            >
              Duplicate
            </button>
            <div className="border-t border-zinc-600 my-1" />
            <button
              onClick={handleDelete}
              className="block w-full text-left px-4 py-2 hover:bg-red-600 text-sm text-red-400"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </>
  );
}

