'use client';

import { useAppDispatch } from '@/lib/store/hooks';
import { addObject } from '@/lib/store/editorSlice';
import { generateObjectId } from '@/lib/utils/sceneHelpers';
import { SceneObject } from '@/types/editor.types';
import { useState, useEffect, memo } from 'react';
import LazyModelThumbnail from './LazyModelThumbnail';

interface ModelLibraryProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const ModelLibrary = memo(function ModelLibrary({ isCollapsed, onToggleCollapse }: ModelLibraryProps) {
  const dispatch = useAppDispatch();
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all models from the house folder via API
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/models');
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setModels(data.models || []);
        }
      } catch (err) {
        console.error('Failed to fetch models:', err);
        setError('Failed to load models');
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const addModelToScene = (modelPath: string) => {
    try {
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
    } catch (error) {
      console.error('Failed to add model to scene:', error);
    }
  };

  return (
    <div className="w-64 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl flex flex-col">
      <div className="h-10 border-b border-zinc-700 flex items-center px-4 justify-between rounded-t-lg">
        <h2 className="text-sm font-semibold">Models</h2>
        <button
          onClick={onToggleCollapse}
          className="text-zinc-400 hover:text-white transition-colors text-xl"
          title="Close"
        >
          ×
        </button>
      </div>

      <div className="max-h-[calc(100vh-10rem)] overflow-y-auto p-3">
        {loading ? (
          <div className="text-sm text-zinc-500 text-center mt-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p>Loading models...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-sm text-red-400 text-center mt-4 px-2">
            <p className="mb-2">⚠️ {error}</p>
          </div>
        ) : models.length === 0 ? (
          <div className="text-sm text-zinc-500 text-center mt-4 px-2">
            <p className="mb-2">No models found</p>
            <p className="text-xs">Add .glb or .gltf files to:</p>
            <code className="text-xs bg-zinc-900 px-2 py-1 rounded block mt-2">
              public/assets/models/house/
            </code>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {models.map((model) => {
              const modelName = model.split('/').pop()?.replace('.glb', '').replace('.gltf', '') || 'Model';
              return (
                <button
                  key={model}
                  onClick={() => addModelToScene(model)}
                  className="group bg-zinc-700 hover:bg-zinc-600 rounded transition-colors flex flex-col overflow-hidden"
                  title={modelName}
                >
                  <div className="w-full aspect-square relative">
                    <LazyModelThumbnail modelPath={model} />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  <div className="p-2 text-xs text-zinc-300 truncate text-center">
                    {modelName}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-zinc-700">
        <div className="text-xs text-zinc-500 mb-2">
          📂 From: public/assets/models/house/
        </div>
        <div className="text-xs text-zinc-400">
          {loading ? 'Loading...' : `${models.length} model${models.length !== 1 ? 's' : ''} available`}
        </div>
      </div>
    </div>
  );
});

export default ModelLibrary;

