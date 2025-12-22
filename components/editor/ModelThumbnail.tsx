'use client';

import { Suspense, useRef, useEffect, useState, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import ErrorBoundary from '../ErrorBoundary';

function ModelPreview({ modelPath, isHovered }: { modelPath: string; isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelPath) as any;
  const { invalidate } = useThree();
  
  useFrame(() => {
    if (groupRef.current && isHovered) {
      groupRef.current.rotation.y += 0.01;
      // Invalidate to trigger next frame (needed for frameloop="demand")
      invalidate();
    }
  });

  useEffect(() => {
    // Invalidate when model loads to trigger initial render
    if (gltf?.scene) {
      invalidate();
    }
  }, [gltf, invalidate]);

  useEffect(() => {
    // Invalidate when hover state changes to start/stop animation
    invalidate();
  }, [isHovered, invalidate]);

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

function CanvasErrorFallback() {
  // This component is rendered inside Canvas, so it must be a THREE object
  // Return null or a valid THREE primitive
  return null;
}

const ModelThumbnail = memo(function ModelThumbnail({ modelPath }: { modelPath: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const glContextRef = useRef<WebGLRenderingContext | WebGL2RenderingContext | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Cleanup function to dispose WebGL context when component unmounts
    return () => {
      // Dispose renderer first
      if (glRendererRef.current) {
        try {
          glRendererRef.current.dispose();
        } catch (error) {
          // Renderer may already be disposed
        }
        glRendererRef.current = null;
      }
      
      // Then dispose context
      if (glContextRef.current) {
        try {
          const loseContext = glContextRef.current.getExtension('WEBGL_lose_context');
          if (loseContext) {
            loseContext.loseContext();
          }
        } catch (error) {
          // Context may already be lost, ignore error
        }
        glContextRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-zinc-900 rounded overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
          frameloop="demand"
          onCreated={({ gl }) => {
            // Store renderer reference for cleanup
            glRendererRef.current = gl;
            
            // Get the WebGL context from the renderer's DOM element
            const canvas = gl.domElement;
            const context = canvas.getContext('webgl') || canvas.getContext('webgl2');
            if (context) {
              glContextRef.current = context as WebGLRenderingContext | WebGL2RenderingContext;
            }
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[1, 1, 1]} intensity={0.8} />
          <Suspense fallback={<CanvasErrorFallback />}>
            <ModelPreview modelPath={modelPath} isHovered={isHovered} />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
});

export default ModelThumbnail;
