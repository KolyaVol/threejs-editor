'use client';

import { useEffect, useRef } from 'react';
import { TransformControls } from '@react-three/drei';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { updateObject, updateObjectWithHistory } from '@/lib/store/editorSlice';
import * as THREE from 'three';

export default function TransformControlsWrapper() {
  const dispatch = useAppDispatch();
  const selectedObjectId = useAppSelector((state) => state.editor.selectedObjectId);
  const transformMode = useAppSelector((state) => state.editor.transformMode);
  const objects = useAppSelector((state) => state.editor.objects);
  const transformRef = useRef<any>(null);

  const selectedObject = objects.find(obj => obj.id === selectedObjectId);

  useEffect(() => {
    if (!transformRef.current) return;

    const controls = transformRef.current;
    
    const handleChange = () => {
      if (!controls.object) return;

      const position: [number, number, number] = [
        controls.object.position.x,
        controls.object.position.y,
        controls.object.position.z,
      ];

      const rotation: [number, number, number] = [
        controls.object.rotation.x,
        controls.object.rotation.y,
        controls.object.rotation.z,
      ];

      const scale: [number, number, number] = [
        controls.object.scale.x,
        controls.object.scale.y,
        controls.object.scale.z,
      ];

      // Update without adding to history during drag
      dispatch(updateObject({
        id: selectedObjectId!,
        updates: { position, rotation, scale },
      }));
    };

    const handleMouseUp = () => {
      if (!controls.object) return;

      const position: [number, number, number] = [
        controls.object.position.x,
        controls.object.position.y,
        controls.object.position.z,
      ];

      const rotation: [number, number, number] = [
        controls.object.rotation.x,
        controls.object.rotation.y,
        controls.object.rotation.z,
      ];

      const scale: [number, number, number] = [
        controls.object.scale.x,
        controls.object.scale.y,
        controls.object.scale.z,
      ];

      // Add to history on mouse up
      dispatch(updateObjectWithHistory({
        id: selectedObjectId!,
        updates: { position, rotation, scale },
      }));
    };

    controls.addEventListener('change', handleChange);
    controls.addEventListener('mouseUp', handleMouseUp);

    return () => {
      controls.removeEventListener('change', handleChange);
      controls.removeEventListener('mouseUp', handleMouseUp);
    };
  }, [selectedObjectId, dispatch]);

  if (!selectedObject) return null;

  return (
    <TransformControls
      ref={transformRef}
      mode={transformMode}
      position={selectedObject.position}
      rotation={selectedObject.rotation}
      scale={selectedObject.scale}
    />
  );
}

