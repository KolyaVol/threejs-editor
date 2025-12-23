"use client";

import { Suspense, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, GizmoHelper, GizmoViewcube } from "@react-three/drei";
import { useAppSelector, selectors } from "@/lib/store/hooks";
import SceneObjects from "./SceneObjects";
import TransformControlsWrapper from "./TransformControlsWrapper";
import GroupTransformControls from "./GroupTransformControls";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorBoundary from "../ErrorBoundary";

export default function EditorCanvas() {
  const selectedObjectId = useAppSelector((state) => state.editor.selectedObjectId);
  const selectedGroupId = useAppSelector((state) => state.editor.selectedGroupId);
  const settings = useAppSelector(selectors.selectSettings);

  const handleRightClickObject = useCallback(() => {
    // This will be handled by parent component
    window.dispatchEvent(new CustomEvent("openProperties"));
  }, []);

  return (
    <div className="w-full h-full bg-zinc-900" onContextMenu={(e) => e.preventDefault()}>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Canvas
            camera={{ position: [5, 5, 5], fov: 50 }}
            shadows
            gl={{
              preserveDrawingBuffer: true,
              alpha: false,
              antialias: true,
            }}
            style={{ background: "#18181b" }}
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

            {/* Grid - always visible for reference */}
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
            <SceneObjects onRightClickObject={handleRightClickObject} />

            {/* Transform Controls for selected object */}
            {selectedObjectId && !selectedGroupId && <TransformControlsWrapper />}

            {/* Transform Controls for selected group */}
            {selectedGroupId && <GroupTransformControls />}

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
