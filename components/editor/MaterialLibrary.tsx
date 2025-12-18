'use client';

import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { updateObjectWithHistory } from '@/lib/store/editorSlice';
import { materialPresets } from '@/lib/materials/materialPresets';
import { useState } from 'react';

export default function MaterialLibrary() {
  const dispatch = useAppDispatch();
  const selectedObjectId = useAppSelector((state) => state.editor.selectedObjectId);
  const objects = useAppSelector((state) => state.editor.objects);
  const [activeCategory, setActiveCategory] = useState<'basic' | 'metal' | 'plastic' | 'special'>('basic');

  const selectedObject = objects.find(obj => obj.id === selectedObjectId);
  const isLight = selectedObject && ['ambientLight', 'directionalLight', 'pointLight', 'spotLight'].includes(selectedObject.type);

  const applyMaterial = (presetId: string) => {
    if (!selectedObjectId || isLight) return;

    const preset = materialPresets.find(p => p.id === presetId);
    if (preset) {
      dispatch(updateObjectWithHistory({
        id: selectedObjectId,
        updates: { material: preset.config }
      }));
    }
  };

  const categories = [
    { id: 'basic', name: 'Basic' },
    { id: 'metal', name: 'Metal' },
    { id: 'plastic', name: 'Plastic' },
    { id: 'special', name: 'Special' },
  ];

  const filteredPresets = materialPresets.filter(preset => preset.category === activeCategory);

  return (
    <div className="w-64 bg-zinc-800 border-l border-zinc-700 flex flex-col">
      <div className="h-10 border-b border-zinc-700 flex items-center px-4">
        <h2 className="text-sm font-semibold">Materials</h2>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-zinc-700 flex">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:bg-zinc-750'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {!selectedObjectId || isLight ? (
          <div className="text-sm text-zinc-500 text-center mt-4">
            {isLight ? 'Lights do not have materials' : 'Select an object to apply materials'}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyMaterial(preset.id)}
                className="group flex flex-col items-center p-2 rounded hover:bg-zinc-700 transition-colors"
                title={preset.name}
              >
                <div
                  className="w-full aspect-square rounded mb-1 border border-zinc-600"
                  style={{
                    background: `linear-gradient(135deg, ${preset.config.color} 0%, ${preset.config.color}dd 100%)`
                  }}
                />
                <div className="text-xs text-center truncate w-full">{preset.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-8 border-t border-zinc-700 flex items-center px-4 text-xs text-zinc-500">
        {filteredPresets.length} material{filteredPresets.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

