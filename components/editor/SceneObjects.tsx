'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { selectObject } from '@/lib/store/editorSlice';
import { useGLTF } from '@react-three/drei';
import { createMaterialFromConfig } from '@/lib/utils/sceneHelpers';
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

function SceneObject({ object }: { object: any }) {
  const dispatch = useAppDispatch();
  const selectedObjectId = useAppSelector((state) => state.editor.selectedObjectId);
  const isSelected = selectedObjectId === object.id;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    dispatch(selectObject(object.id));
  };

  // Create material
  const material = object.material
    ? createMaterialFromConfig(object.material)
    : new THREE.MeshStandardMaterial({ color: '#888888' });

  // Handle different object types
  if (object.type === 'model' && object.modelPath) {
    try {
      // Load the GLTF model
      const gltf = useGLTF(object.modelPath) as any;
      const clonedScene = gltf.scene.clone(true);
      
      // Get the base path for textures
      const modelDir = object.modelPath.substring(0, object.modelPath.lastIndexOf('/'));
      
      // Fix texture paths and handle materials
      clonedScene.traverse((child: any) => {
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
      
      return (
        <primitive
          object={clonedScene}
          position={object.position}
          rotation={object.rotation}
          scale={object.scale}
          visible={object.visible}
          onClick={handleClick}
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
      castShadow
      receiveShadow
    >
      {object.type === 'box' && (
        <boxGeometry args={object.geometryArgs || [1, 1, 1]} />
      )}
      {object.type === 'sphere' && (
        <sphereGeometry args={object.geometryArgs || [1, 32, 32]} />
      )}
      {object.type === 'cylinder' && (
        <cylinderGeometry args={object.geometryArgs || [1, 1, 2, 32]} />
      )}
      {object.type === 'plane' && (
        <planeGeometry args={object.geometryArgs || [10, 10]} />
      )}
      {object.type === 'torus' && (
        <torusGeometry args={object.geometryArgs || [1, 0.4, 16, 100]} />
      )}
      {object.type === 'cone' && (
        <coneGeometry args={object.geometryArgs || [1, 2, 32]} />
      )}
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default function SceneObjects() {
  const objects = useAppSelector((state) => state.editor.objects);
  const dispatch = useAppDispatch();

  const handleCanvasClick = () => {
    dispatch(selectObject(null));
  };

  return (
    <group onClick={handleCanvasClick}>
      {objects.map((object) => (
        <SceneObject key={object.id} object={object} />
      ))}
    </group>
  );
}

