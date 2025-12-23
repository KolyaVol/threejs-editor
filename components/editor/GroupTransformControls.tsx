'use client';

import { useEffect, useRef, useMemo } from 'react';
import { TransformControls } from '@react-three/drei';
import { useAppSelector, useAppDispatch, selectors } from '@/lib/store/hooks';
import { updateObject, updateGroupTransform, updateGroupTransformWithHistory } from '@/lib/store/editorSlice';
import * as THREE from 'three';

// Helper function to snap value to grid
const snapToGrid = (value: number, snapSize: number): number => {
  return Math.round(value / snapSize) * snapSize;
};

export default function GroupTransformControls() {
  const dispatch = useAppDispatch();
  const selectedGroupId = useAppSelector((state) => state.editor.selectedGroupId);
  const selectedGroup = useAppSelector(selectors.selectSelectedGroup);
  const objects = useAppSelector((state) => state.editor.objects);
  const transformMode = useAppSelector(selectors.selectTransformMode);
  const settings = useAppSelector(selectors.selectSettings);
  const transformRef = useRef<any>(null);
  const groupCenterRef = useRef<THREE.Group>(null);

  // Calculate group center and create a virtual group object
  const groupData = useMemo(() => {
    if (!selectedGroup) return null;

    const groupObjects = objects.filter(obj => selectedGroup.objectIds.includes(obj.id));
    if (groupObjects.length === 0) return null;

    // Calculate center
    const center: [number, number, number] = [0, 0, 0];
    groupObjects.forEach(obj => {
      center[0] += obj.position[0];
      center[1] += obj.position[1];
      center[2] += obj.position[2];
    });
    center[0] /= groupObjects.length;
    center[1] /= groupObjects.length;
    center[2] /= groupObjects.length;

    // Calculate average rotation and scale
    const rotation: [number, number, number] = [0, 0, 0];
    const scale: [number, number, number] = [1, 1, 1];
    
    groupObjects.forEach(obj => {
      rotation[0] += obj.rotation[0];
      rotation[1] += obj.rotation[1];
      rotation[2] += obj.rotation[2];
      scale[0] += obj.scale[0];
      scale[1] += obj.scale[1];
      scale[2] += obj.scale[2];
    });
    rotation[0] /= groupObjects.length;
    rotation[1] /= groupObjects.length;
    rotation[2] /= groupObjects.length;
    scale[0] /= groupObjects.length;
    scale[1] /= groupObjects.length;
    scale[2] /= groupObjects.length;

    return { center, rotation, scale, groupObjects };
  }, [selectedGroup, objects]);

  useEffect(() => {
    if (!transformRef.current || !groupData) return;

    const controls = transformRef.current;
    
    const handleChange = () => {
      if (!controls.object) return;

      let position: [number, number, number] = [
        controls.object.position.x,
        controls.object.position.y,
        controls.object.position.z,
      ];

      // Apply snap to grid for position if enabled and in translate mode
      if (settings.snapToGrid && transformMode === 'translate') {
        position = [
          snapToGrid(position[0], settings.snapSize),
          snapToGrid(position[1], settings.snapSize),
          snapToGrid(position[2], settings.snapSize),
        ];
        controls.object.position.set(position[0], position[1], position[2]);
      }

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

      // Update group transform without history (during drag)
      dispatch(updateGroupTransform({
        groupId: selectedGroupId!,
        position: transformMode === 'translate' ? position : undefined,
        rotation: transformMode === 'rotate' ? rotation : undefined,
        scale: transformMode === 'scale' ? scale : undefined,
      }));
    };

    const handleMouseUp = () => {
      if (!controls.object || !groupData) return;

      let position: [number, number, number] = [
        controls.object.position.x,
        controls.object.position.y,
        controls.object.position.z,
      ];

      if (settings.snapToGrid && transformMode === 'translate') {
        position = [
          snapToGrid(position[0], settings.snapSize),
          snapToGrid(position[1], settings.snapSize),
          snapToGrid(position[2], settings.snapSize),
        ];
        controls.object.position.set(position[0], position[1], position[2]);
      }

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

      // Update group transform with history (on mouse up)
      dispatch(updateGroupTransformWithHistory({
        groupId: selectedGroupId!,
        position: transformMode === 'translate' ? position : undefined,
        rotation: transformMode === 'rotate' ? rotation : undefined,
        scale: transformMode === 'scale' ? scale : undefined,
      }));
    };

    controls.addEventListener('change', handleChange);
    controls.addEventListener('mouseUp', handleMouseUp);

    return () => {
      controls.removeEventListener('change', handleChange);
      controls.removeEventListener('mouseUp', handleMouseUp);
    };
  }, [selectedGroupId, groupData, dispatch, settings, transformMode]);

  if (!selectedGroup || !groupData) return null;

  return (
    <TransformControls
      ref={transformRef}
      mode={transformMode}
      position={groupData.center}
      rotation={groupData.rotation}
      scale={groupData.scale}
    />
  );
}

