'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import ErrorBoundary from '../ErrorBoundary';

function ModelPreview({ modelPath }: { modelPath: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelPath) as any;
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  if (!gltf?.scene) {
    return null;
  }

  const clonedScene = gltf.scene.clone(true);
  
  // Center and scale the model
  const box = new THREE.Box3().setFromObject(clonedScene);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 0 ? 1.5 / maxDim : 1;

  clonedScene.scale.multiplyScalar(scale);
  clonedScene.position.sub(center.multiplyScalar(scale));

  return <primitive object={clonedScene} ref={groupRef} />;
}

function ThumbnailError() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500">
      <span className="text-2xl">🏠</span>
    </div>
  );
}

export default function ModelThumbnail({ modelPath }: { modelPath: string }) {
  return (
    <div className="w-full h-full bg-zinc-900 rounded overflow-hidden relative">
      <ErrorBoundary fallback={<ThumbnailError />}>
        <Canvas
          camera={{ position: [0, 0, 2.5], fov: 50 }}
          gl={{ 
            antialias: false, 
            alpha: true, 
            preserveDrawingBuffer: false,
            powerPreference: 'low-power',
            stencil: false,
            depth: true,
          }}
          dpr={[0.5, 1]} // Lower pixel ratio for thumbnails
          style={{ width: '100%', height: '100%' }}
          frameloop="always"
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[1, 1, 1]} intensity={0.8} />
          <Suspense fallback={<ThumbnailError />}>
            <ModelPreview modelPath={modelPath} />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}
