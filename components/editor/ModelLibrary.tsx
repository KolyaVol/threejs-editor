'use client';

import { useAppDispatch } from '@/lib/store/hooks';
import { addObject } from '@/lib/store/editorSlice';
import { generateObjectId } from '@/lib/utils/sceneHelpers';
import { SceneObject } from '@/types/editor.types';
import { useState, useEffect } from 'react';

export default function ModelLibrary() {
  const dispatch = useAppDispatch();
  const [models, setModels] = useState<string[]>([]);

  // In a real implementation, you would fetch this from an API or file system
  // For now, we'll use a predefined list
  useEffect(() => {
    // Example models - users can add their own .glb files to public/assets/models/
    const availableModels: string[] = [
      // Users will add their own models here
      // Example: '/assets/models/chair.glb',
    ];
    setModels(availableModels);
  }, []);

  const addModelToScene = (modelPath: string) => {
    const modelName = modelPath.split('/').pop()?.replace('.glb', '').replace('.gltf', '') || 'Model';
    
    const newModel: SceneObject = {
      id: generateObjectId(),
      name: modelName,
      type: 'model',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      modelPath: modelPath,
    };

    dispatch(addObject(newModel));
  };

  return (
    <div className="w-64 bg-zinc-800 border-l border-zinc-700 flex flex-col">
      <div className="h-10 border-b border-zinc-700 flex items-center px-4">
        <h2 className="text-sm font-semibold">Models</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {models.length === 0 ? (
          <div className="text-sm text-zinc-500 text-center mt-4 px-2">
            <p className="mb-2">No models found</p>
            <p className="text-xs">Add .glb or .gltf files to:</p>
            <code className="text-xs bg-zinc-900 px-2 py-1 rounded block mt-2">
              public/assets/models/
            </code>
          </div>
        ) : (
          <div className="space-y-2">
            {models.map((model) => {
              const modelName = model.split('/').pop()?.replace('.glb', '').replace('.gltf', '') || 'Model';
              return (
                <button
                  key={model}
                  onClick={() => addModelToScene(model)}
                  className="w-full p-3 bg-zinc-700 hover:bg-zinc-600 rounded text-sm text-left transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">🎨</span>
                  <span className="flex-1 truncate">{modelName}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-zinc-700">
        <div className="text-xs text-zinc-500 mb-2">
          Supported formats: GLB, GLTF
        </div>
        <div className="text-xs text-zinc-400">
          {models.length} model{models.length !== 1 ? 's' : ''} available
        </div>
      </div>
    </div>
  );
}

