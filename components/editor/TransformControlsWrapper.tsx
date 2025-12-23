'use client';

import { useEffect, useRef, useState } from 'react';
import { TransformControls } from '@react-three/drei';
import { useAppSelector, useAppDispatch, selectors } from '@/lib/store/hooks';
import { updateObject, updateObjectWithHistory, updateGroupTransform, updateGroupTransformWithHistory } from '@/lib/store/editorSlice';
import * as THREE from 'three';

// Helper function to snap value to grid
const snapToGrid = (value: number, snapSize: number): number => {
  return Math.round(value / snapSize) * snapSize;
};

// Helper function to snap rotation to step (in radians)
const snapRotation = (value: number, stepDegrees: number): number => {
  const stepRadians = (stepDegrees * Math.PI) / 180;
  return Math.round(value / stepRadians) * stepRadians;
};

export default function TransformControlsWrapper() {
  const dispatch = useAppDispatch();
  const selectedObjectId = useAppSelector((state) => state.editor.selectedObjectId);
  const selectedGroupId = useAppSelector((state) => state.editor.selectedGroupId);
  const transformMode = useAppSelector(selectors.selectTransformMode);
  const settings = useAppSelector(selectors.selectSettings);
  const selectedObject = useAppSelector(selectors.selectSelectedObject);
  const selectedGroup = useAppSelector(selectors.selectSelectedGroup);
  const groups = useAppSelector(selectors.selectGroups);
  const transformRef = useRef<any>(null);
  const [ctrlPressed, setCtrlPressed] = useState<boolean>(false);
  
  // Check if object is locked or part of a selected group
  const isLocked = selectedObject?.locked || false;
  const isGroupSelected = selectedGroupId !== null;
  
  // Check if selected object belongs to a group (even if group is not explicitly selected)
  const objectGroup = selectedObject?.groupId 
    ? groups.find(g => g.id === selectedObject.groupId)
    : null;
  
  // Determine effective mode: if Ctrl is pressed and mode is translate, use rotate instead
  const effectiveMode = ctrlPressed && transformMode === 'translate' ? 'rotate' : transformMode;

  // Track Ctrl key state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'Control' || e.metaKey) {
        setCtrlPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.metaKey) {
        setCtrlPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!transformRef.current) return;

    const controls = transformRef.current;
    
    // Update mode based on Ctrl key state
    if (ctrlPressed && transformMode === 'translate') {
      controls.setMode('rotate');
    } else {
      controls.setMode(transformMode);
    }
    
    const handleChange = () => {
      if (!controls.object || isLocked) return;

      let position: [number, number, number] = [
        controls.object.position.x,
        controls.object.position.y,
        controls.object.position.z,
      ];

      // Apply snap to grid for position if enabled and in translate mode (and Ctrl not pressed)
      if (settings.snapToGrid && transformMode === 'translate' && !ctrlPressed) {
        position = [
          snapToGrid(position[0], settings.snapSize),
          snapToGrid(position[1], settings.snapSize),
          snapToGrid(position[2], settings.snapSize),
        ];
        // Update the control's position to reflect snapping
        controls.object.position.set(position[0], position[1], position[2]);
      }

      let rotation: [number, number, number] = [
        controls.object.rotation.x,
        controls.object.rotation.y,
        controls.object.rotation.z,
      ];
      
      // Apply rotation snapping if enabled and in rotate mode (or Ctrl is pressed)
      if (settings.snapRotation && (transformMode === 'rotate' || (ctrlPressed && transformMode === 'translate'))) {
        rotation = [
          snapRotation(rotation[0], settings.rotationStep),
          snapRotation(rotation[1], settings.rotationStep),
          snapRotation(rotation[2], settings.rotationStep),
        ];
        // Update the control's rotation to reflect snapping
        controls.object.rotation.set(rotation[0], rotation[1], rotation[2]);
      }

      const scale: [number, number, number] = [
        controls.object.scale.x,
        controls.object.scale.y,
        controls.object.scale.z,
      ];

      // Determine which transform to apply based on effective mode
      const isRotating = effectiveMode === 'rotate' || (ctrlPressed && transformMode === 'translate');
      
      // Handle group transform or single object transform
      if (isGroupSelected && selectedGroup) {
        dispatch(updateGroupTransform({
          groupId: selectedGroup.id,
          position: effectiveMode === 'translate' ? position : undefined,
          rotation: isRotating ? rotation : undefined,
          scale: effectiveMode === 'scale' ? scale : undefined,
        }));
      } else if (objectGroup && selectedObjectId) {
        // If selected object is in a group, apply transform to all objects in the group
        dispatch(updateGroupTransform({
          groupId: objectGroup.id,
          position: effectiveMode === 'translate' ? position : undefined,
          rotation: isRotating ? rotation : undefined,
          scale: effectiveMode === 'scale' ? scale : undefined,
        }));
      } else if (selectedObjectId) {
        // Update without adding to history during drag
        dispatch(updateObject({
          id: selectedObjectId,
          updates: { position, rotation, scale },
        }));
      }
    };

    const handleMouseUp = () => {
      if (!controls.object || isLocked) return;

      let position: [number, number, number] = [
        controls.object.position.x,
        controls.object.position.y,
        controls.object.position.z,
      ];

      // Apply snap to grid for position if enabled and in translate mode (and Ctrl not pressed)
      if (settings.snapToGrid && transformMode === 'translate' && !ctrlPressed) {
        position = [
          snapToGrid(position[0], settings.snapSize),
          snapToGrid(position[1], settings.snapSize),
          snapToGrid(position[2], settings.snapSize),
        ];
        // Update the control's position to reflect snapping
        controls.object.position.set(position[0], position[1], position[2]);
      }

      let rotation: [number, number, number] = [
        controls.object.rotation.x,
        controls.object.rotation.y,
        controls.object.rotation.z,
      ];
      
      // Apply rotation snapping if enabled and in rotate mode (or Ctrl is pressed)
      if (settings.snapRotation && (transformMode === 'rotate' || (ctrlPressed && transformMode === 'translate'))) {
        rotation = [
          snapRotation(rotation[0], settings.rotationStep),
          snapRotation(rotation[1], settings.rotationStep),
          snapRotation(rotation[2], settings.rotationStep),
        ];
        // Update the control's rotation to reflect snapping
        controls.object.rotation.set(rotation[0], rotation[1], rotation[2]);
      }

      const scale: [number, number, number] = [
        controls.object.scale.x,
        controls.object.scale.y,
        controls.object.scale.z,
      ];

      // Determine which transform to apply based on effective mode
      const isRotating = effectiveMode === 'rotate' || (ctrlPressed && transformMode === 'translate');
      
      // Handle group transform or single object transform
      if (isGroupSelected && selectedGroup) {
        // For groups, we need to update all objects in the group with history
        // This is handled by updateGroupTransformWithHistory
        dispatch(updateGroupTransformWithHistory({
          groupId: selectedGroup.id,
          position: effectiveMode === 'translate' ? position : undefined,
          rotation: isRotating ? rotation : undefined,
          scale: effectiveMode === 'scale' ? scale : undefined,
        }));
      } else if (objectGroup && selectedObjectId) {
        // If selected object is in a group, apply transform to all objects in the group with history
        dispatch(updateGroupTransformWithHistory({
          groupId: objectGroup.id,
          position: effectiveMode === 'translate' ? position : undefined,
          rotation: isRotating ? rotation : undefined,
          scale: effectiveMode === 'scale' ? scale : undefined,
        }));
      } else if (selectedObjectId) {
        // Add to history on mouse up
        dispatch(updateObjectWithHistory({
          id: selectedObjectId,
          updates: { position, rotation, scale },
        }));
      }
    };

    controls.addEventListener('change', handleChange);
    controls.addEventListener('mouseUp', handleMouseUp);

    return () => {
      controls.removeEventListener('change', handleChange);
      controls.removeEventListener('mouseUp', handleMouseUp);
    };
  }, [selectedObjectId, selectedGroupId, isLocked, isGroupSelected, selectedGroup, objectGroup, dispatch, settings, transformMode, effectiveMode, ctrlPressed]);

  // Don't show controls if locked or if group is explicitly selected (groups use GroupTransformControls)
  // But show controls if an object in a group is selected (we'll handle group transforms here)
  if (!selectedObject || isLocked || isGroupSelected) return null;

  return (
    <TransformControls
      ref={transformRef}
      mode={effectiveMode}
      position={selectedObject.position}
      rotation={selectedObject.rotation}
      scale={selectedObject.scale}
    />
  );
}

