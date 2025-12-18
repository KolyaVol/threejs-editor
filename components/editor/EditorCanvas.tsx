'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewcube } from '@react-three/drei';
import { useAppSelector } from '@/lib/store/hooks';
import SceneObjects from './SceneObjects';
import TransformControlsWrapper from './TransformControlsWrapper';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorBoundary from '../ErrorBoundary';

export default function EditorCanvas() {
  const selectedObjectId = useAppSelector((state) => state.editor.selectedObjectId);

  return (
    <div className="w-full h-full bg-zinc-900">
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Canvas
            camera={{ position: [5, 5, 5], fov: 50 }}
            shadows
            gl={{ preserveDrawingBuffer: true }}
          >
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />

            {/* Grid and helpers */}
            <Grid
              args={[20, 20]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#6e6e6e"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#9d9d9d"
              fadeDistance={50}
              fadeStrength={1}
              infiniteGrid
            />

            {/* Scene Objects */}
            <SceneObjects />

            {/* Transform Controls for selected object */}
            {selectedObjectId && <TransformControlsWrapper />}

            {/* Camera Controls */}
            <OrbitControls makeDefault />

            {/* Gizmo Helper */}
            <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
              <GizmoViewcube />
            </GizmoHelper>
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

