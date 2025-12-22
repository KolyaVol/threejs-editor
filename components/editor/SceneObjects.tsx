'use client';

import { useEffect, memo, useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { selectObject } from '@/lib/store/editorSlice';
import { useGLTF } from '@react-three/drei';
import { createMaterialFromConfig, getGeometry } from '@/lib/utils/sceneHelpers';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';

// Setup Three.js texture loader to use correct base path
if (typeof window !== 'undefined') {
  THREE.DefaultLoadingManager.setURLModifier((url) => {
    // If the URL is relative and contains Textures/, make it absolute
    if (url.includes('Textures/') && !url.startsWith('http') && !url.startsWith('/')) {
      return `/assets/models/house/${url}`;
    }
    return url;
  });
}

// Model cache - stores processed model scenes by path
const modelCache = new Map<string, THREE.Object3D>();

// Process textures on a model scene (only once per model)
const processModelTextures = (scene: THREE.Object3D) => {
  scene.traverse((child: any) => {
    if (child.isMesh && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      
      materials.forEach((mat: any) => {
        // Handle texture maps
        ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap'].forEach((mapType) => {
          if (mat[mapType]) {
            const texture = mat[mapType];
            // Ensure texture has proper settings (Three.js r152+ uses colorSpace instead of encoding)
            if (mapType === 'map' || mapType === 'emissiveMap') {
              texture.colorSpace = 'srgb'; // For color textures
            } else {
              texture.colorSpace = 'srgb-linear'; // For data textures
            }
            texture.flipY = false;
            
            // If texture failed to load, use fallback color
            if (!texture.image || texture.image.width === 0) {
              console.warn(`Texture not loaded for ${mapType}, using fallback color`);
              mat[mapType] = null;
              if (!mat.color) {
                mat.color = new THREE.Color('#cccccc');
              }
            }
          }
        });
        
        mat.needsUpdate = true;
      });
    }
  });
};

interface SceneObjectProps {
  object: any;
  onRightClick?: () => void;
}

const SceneObject = memo(function SceneObject({ object, onRightClick }: SceneObjectProps) {
  const dispatch = useAppDispatch();
  const selectedObjectId = useAppSelector((state) => state.editor.selectedObjectId);
  const isSelected = selectedObjectId === object.id;

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    dispatch(selectObject(object.id));
  }, [dispatch, object.id]);

  const handleRightClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    dispatch(selectObject(object.id));
    if (onRightClick) {
      onRightClick();
    }
  }, [dispatch, object.id, onRightClick]);

  // Create material (memoized)
  const material = useMemo(() => {
    return object.material
      ? createMaterialFromConfig(object.material)
      : new THREE.MeshStandardMaterial({ color: '#888888' });
  }, [object.material]);

  // Handle different object types
  if (object.type === 'model' && object.modelPath) {
    try {
      // Load the GLTF model
      const gltf = useGLTF(object.modelPath) as any;
      
      // Cache and process model scene (only once per model path)
      const cachedScene = useMemo(() => {
        if (modelCache.has(object.modelPath)) {
          return modelCache.get(object.modelPath)!;
        }
        
        // Clone and process the scene
        const clonedScene = gltf.scene.clone(true);
        processModelTextures(clonedScene);
        
        // Cache the processed scene
        modelCache.set(object.modelPath, clonedScene);
        return clonedScene;
      }, [object.modelPath, gltf.scene]);
      
      // Clone from cache for this instance
      const instanceScene = useMemo(() => {
        return cachedScene.clone(true);
      }, [cachedScene]);
      
      return (
        <primitive
          object={instanceScene}
          position={object.position}
          rotation={object.rotation}
          scale={object.scale}
          visible={object.visible}
          onClick={handleClick}
          onContextMenu={handleRightClick}
        />
      );
    } catch (error) {
      console.error('Error loading model:', object.modelPath, error);
      return null;
    }
  }

  // Light objects
  if (object.type === 'ambientLight') {
    return (
      <ambientLight
        intensity={object.intensity || 0.5}
        color={object.lightColor || '#ffffff'}
      />
    );
  }

  if (object.type === 'directionalLight') {
    return (
      <directionalLight
        position={object.position}
        intensity={object.intensity || 1}
        color={object.lightColor || '#ffffff'}
        castShadow={object.castShadow}
      />
    );
  }

  if (object.type === 'pointLight') {
    return (
      <pointLight
        position={object.position}
        intensity={object.intensity || 1}
        color={object.lightColor || '#ffffff'}
        castShadow={object.castShadow}
      />
    );
  }

  if (object.type === 'spotLight') {
    return (
      <spotLight
        position={object.position}
        intensity={object.intensity || 1}
        color={object.lightColor || '#ffffff'}
        castShadow={object.castShadow}
      />
    );
  }

  // Primitive mesh objects
  return (
    <mesh
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      visible={object.visible}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      castShadow
      receiveShadow
    >
      {object.type === 'box' && (
        <primitive object={getGeometry('box', object.geometryArgs || [1, 1, 1])} attach="geometry" />
      )}
      {object.type === 'sphere' && (
        <primitive object={getGeometry('sphere', object.geometryArgs || [1, 32, 32])} attach="geometry" />
      )}
      {object.type === 'cylinder' && (
        <primitive object={getGeometry('cylinder', object.geometryArgs || [1, 1, 2, 32])} attach="geometry" />
      )}
      {object.type === 'plane' && (
        <primitive object={getGeometry('plane', object.geometryArgs || [10, 10])} attach="geometry" />
      )}
      {object.type === 'torus' && (
        <primitive object={getGeometry('torus', object.geometryArgs || [1, 0.4, 16, 100])} attach="geometry" />
      )}
      {object.type === 'cone' && (
        <primitive object={getGeometry('cone', object.geometryArgs || [1, 2, 32])} attach="geometry" />
      )}
      <primitive object={material} attach="material" />
    </mesh>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if object properties change or onRightClick reference changes
  return (
    prevProps.object.id === nextProps.object.id &&
    prevProps.object.position[0] === nextProps.object.position[0] &&
    prevProps.object.position[1] === nextProps.object.position[1] &&
    prevProps.object.position[2] === nextProps.object.position[2] &&
    prevProps.object.rotation[0] === nextProps.object.rotation[0] &&
    prevProps.object.rotation[1] === nextProps.object.rotation[1] &&
    prevProps.object.rotation[2] === nextProps.object.rotation[2] &&
    prevProps.object.scale[0] === nextProps.object.scale[0] &&
    prevProps.object.scale[1] === nextProps.object.scale[1] &&
    prevProps.object.scale[2] === nextProps.object.scale[2] &&
    prevProps.object.visible === nextProps.object.visible &&
    JSON.stringify(prevProps.object.material) === JSON.stringify(nextProps.object.material) &&
    prevProps.onRightClick === nextProps.onRightClick
  );
});

interface SceneObjectsProps {
  onRightClickObject?: () => void;
}

export default function SceneObjects({ onRightClickObject }: SceneObjectsProps) {
  const objects = useAppSelector((state) => state.editor.objects);
  const dispatch = useAppDispatch();

  const handleCanvasClick = useCallback(() => {
    dispatch(selectObject(null));
  }, [dispatch]);

  const handleCanvasRightClick = useCallback((e: any) => {
    e.stopPropagation();
    // Prevent browser context menu on canvas
    e.nativeEvent?.preventDefault();
  }, []);

  return (
    <group onClick={handleCanvasClick} onContextMenu={handleCanvasRightClick}>
      {objects.map((object) => (
        <SceneObject key={object.id} object={object} onRightClick={onRightClickObject} />
      ))}
    </group>
  );
}

