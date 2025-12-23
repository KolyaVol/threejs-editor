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

// Helper function to snap scale to step
const snapScale = (value: number, step: number): number => {
  return Math.round(value / step) * step;
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
  const [shiftPressed, setShiftPressed] = useState<boolean>(false);
  
  // Check if object is locked or part of a selected group
  const isLocked = selectedObject?.locked || false;
  const isGroupSelected = selectedGroupId !== null;
  
  // Check if selected object belongs to a group (even if group is not explicitly selected)
  const objectGroup = selectedObject?.groupId 
    ? groups.find(g => g.id === selectedObject.groupId)
    : null;
  
  // Determine effective mode: 
  // Priority: Shift (scale) > Ctrl (rotate) > normal mode
  // Only override when in translate mode
  let effectiveMode = transformMode;
  if (transformMode === 'translate') {
    if (shiftPressed) {
      effectiveMode = 'scale';
    } else if (ctrlPressed) {
      effectiveMode = 'rotate';
    }
  }

  // Track Ctrl and Shift key state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'Control' || e.metaKey) {
        setCtrlPressed(true);
      }
      if (e.key === 'Shift') {
        setShiftPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.metaKey) {
        setCtrlPressed(false);
      }
      if (e.key === 'Shift') {
        setShiftPressed(false);
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
    
    // Update mode based on key state (Shift > Ctrl > normal)
    if (transformMode === 'translate') {
      if (shiftPressed) {
        controls.setMode('scale');
      } else if (ctrlPressed) {
        controls.setMode('rotate');
      } else {
        controls.setMode('translate');
      }
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

      // Apply snap to grid for position if enabled and in translate mode (and no modifier keys pressed)
      if (settings.snapToGrid && transformMode === 'translate' && !ctrlPressed && !shiftPressed) {
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

      let scale: [number, number, number] = [
        controls.object.scale.x,
        controls.object.scale.y,
        controls.object.scale.z,
      ];
      
      // Apply scale snapping if enabled and in scale mode (or Shift is pressed)
      if (settings.snapScale && (transformMode === 'scale' || (shiftPressed && transformMode === 'translate'))) {
        scale = [
          snapScale(scale[0], settings.scaleStep),
          snapScale(scale[1], settings.scaleStep),
          snapScale(scale[2], settings.scaleStep),
        ];
        // Update the control's scale to reflect snapping
        controls.object.scale.set(scale[0], scale[1], scale[2]);
      }

      // Determine which transform to apply based on effective mode
      const isRotating = effectiveMode === 'rotate';
      const isScaling = effectiveMode === 'scale';
      
      // Handle group transform or single object transform
      if (isGroupSelected && selectedGroup) {
        dispatch(updateGroupTransform({
          groupId: selectedGroup.id,
          position: effectiveMode === 'translate' ? position : undefined,
          rotation: isRotating ? rotation : undefined,
          scale: isScaling ? scale : undefined,
        }));
      } else if (objectGroup && selectedObjectId) {
        // If selected object is in a group, apply transform to all objects in the group
        dispatch(updateGroupTransform({
          groupId: objectGroup.id,
          position: effectiveMode === 'translate' ? position : undefined,
          rotation: isRotating ? rotation : undefined,
          scale: isScaling ? scale : undefined,
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

      // Apply snap to grid for position if enabled and in translate mode (and no modifier keys pressed)
      if (settings.snapToGrid && transformMode === 'translate' && !ctrlPressed && !shiftPressed) {
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

      let scale: [number, number, number] = [
        controls.object.scale.x,
        controls.object.scale.y,
        controls.object.scale.z,
      ];
      
      // Apply scale snapping if enabled and in scale mode (or Shift is pressed)
      if (settings.snapScale && (transformMode === 'scale' || (shiftPressed && transformMode === 'translate'))) {
        scale = [
          snapScale(scale[0], settings.scaleStep),
          snapScale(scale[1], settings.scaleStep),
          snapScale(scale[2], settings.scaleStep),
        ];
        // Update the control's scale to reflect snapping
        controls.object.scale.set(scale[0], scale[1], scale[2]);
      }

      // Determine which transform to apply based on effective mode
      const isRotating = effectiveMode === 'rotate';
      const isScaling = effectiveMode === 'scale';
      
      // Handle group transform or single object transform
      if (isGroupSelected && selectedGroup) {
        // For groups, we need to update all objects in the group with history
        // This is handled by updateGroupTransformWithHistory
        dispatch(updateGroupTransformWithHistory({
          groupId: selectedGroup.id,
          position: effectiveMode === 'translate' ? position : undefined,
          rotation: isRotating ? rotation : undefined,
          scale: isScaling ? scale : undefined,
        }));
      } else if (objectGroup && selectedObjectId) {
        // If selected object is in a group, apply transform to all objects in the group with history
        dispatch(updateGroupTransformWithHistory({
          groupId: objectGroup.id,
          position: effectiveMode === 'translate' ? position : undefined,
          rotation: isRotating ? rotation : undefined,
          scale: isScaling ? scale : undefined,
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
  }, [selectedObjectId, selectedGroupId, isLocked, isGroupSelected, selectedGroup, objectGroup, dispatch, settings, transformMode, effectiveMode, ctrlPressed, shiftPressed]);

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

