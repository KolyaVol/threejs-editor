import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';

// Base selectors
const selectEditorState = (state: RootState) => state.editor;
const selectObjects = (state: RootState) => state.editor.objects;
const selectSelectedObjectId = (state: RootState) => state.editor.selectedObjectId;

// Memoized selectors
export const selectSelectedObject = createSelector(
  [selectObjects, selectSelectedObjectId],
  (objects, selectedObjectId) => {
    if (!selectedObjectId) return null;
    return objects.find(obj => obj.id === selectedObjectId) || null;
  }
);

export const selectObjectsByType = createSelector(
  [selectObjects],
  (objects) => {
    const byType: Record<string, typeof objects> = {};
    objects.forEach(obj => {
      if (!byType[obj.type]) {
        byType[obj.type] = [];
      }
      byType[obj.type].push(obj);
    });
    return byType;
  }
);

export const selectLights = createSelector(
  [selectObjects],
  (objects) => objects.filter(obj => 
    ['ambientLight', 'directionalLight', 'pointLight', 'spotLight'].includes(obj.type)
  )
);

export const selectMeshes = createSelector(
  [selectObjects],
  (objects) => objects.filter(obj => 
    !['ambientLight', 'directionalLight', 'pointLight', 'spotLight', 'model'].includes(obj.type)
  )
);

export const selectModels = createSelector(
  [selectObjects],
  (objects) => objects.filter(obj => obj.type === 'model' && obj.modelPath)
);

export const selectTransformMode = createSelector(
  [selectEditorState],
  (editor) => editor.transformMode
);

export const selectSettings = createSelector(
  [selectEditorState],
  (editor) => editor.settings
);

export const selectHistoryState = createSelector(
  [selectEditorState],
  (editor) => ({
    canUndo: editor.historyIndex > 0,
    canRedo: editor.historyIndex < editor.history.length - 1,
    historyLength: editor.history.length,
    historyIndex: editor.historyIndex,
  })
);

