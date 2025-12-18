'use client';

import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { selectObject } from '@/lib/store/editorSlice';
import { useGLTF } from '@react-three/drei';
import { createMaterialFromConfig } from '@/lib/utils/sceneHelpers';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';

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
      const gltf = useGLTF(object.modelPath) as any;
      const clonedScene = gltf.scene.clone();
      
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
      console.error('Error loading model:', error);
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

