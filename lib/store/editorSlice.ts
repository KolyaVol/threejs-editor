import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EditorState, SceneObject, TransformMode, EditorSettings } from '@/types/editor.types';

const initialState: EditorState = {
  objects: [],
  selectedObjectId: null,
  transformMode: 'translate',
  history: [[]],
  historyIndex: 0,
  cameraPosition: [5, 5, 5],
  cameraTarget: [0, 0, 0],
  settings: {
    snapToGrid: true,
    snapSize: 0.5,
  },
};

const MAX_HISTORY = 50;

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    addObject: (state, action: PayloadAction<SceneObject>) => {
      state.objects.push(action.payload);
      // Add to history
      if (state.historyIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIndex + 1);
      }
      state.history.push(JSON.parse(JSON.stringify(state.objects)));
      if (state.history.length > MAX_HISTORY) {
        state.history.shift();
      } else {
        state.historyIndex++;
      }
    },
    
    removeObject: (state, action: PayloadAction<string>) => {
      state.objects = state.objects.filter(obj => obj.id !== action.payload);
      if (state.selectedObjectId === action.payload) {
        state.selectedObjectId = null;
      }
      // Add to history
      if (state.historyIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIndex + 1);
      }
      state.history.push(JSON.parse(JSON.stringify(state.objects)));
      if (state.history.length > MAX_HISTORY) {
        state.history.shift();
      } else {
        state.historyIndex++;
      }
    },
    
    updateObject: (state, action: PayloadAction<{ id: string; updates: Partial<SceneObject> }>) => {
      const object = state.objects.find(obj => obj.id === action.payload.id);
      if (object) {
        Object.assign(object, action.payload.updates);
      }
    },
    
    updateObjectWithHistory: (state, action: PayloadAction<{ id: string; updates: Partial<SceneObject> }>) => {
      const object = state.objects.find(obj => obj.id === action.payload.id);
      if (object) {
        Object.assign(object, action.payload.updates);
        // Add to history
        if (state.historyIndex < state.history.length - 1) {
          state.history = state.history.slice(0, state.historyIndex + 1);
        }
        state.history.push(JSON.parse(JSON.stringify(state.objects)));
        if (state.history.length > MAX_HISTORY) {
          state.history.shift();
        } else {
          state.historyIndex++;
        }
      }
    },
    
    selectObject: (state, action: PayloadAction<string | null>) => {
      state.selectedObjectId = action.payload;
    },
    
    setTransformMode: (state, action: PayloadAction<TransformMode>) => {
      state.transformMode = action.payload;
    },
    
    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.objects = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
      }
    },
    
    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.objects = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
      }
    },
    
    duplicateObject: (state, action: PayloadAction<string>) => {
      const object = state.objects.find(obj => obj.id === action.payload);
      if (object) {
        const newObject = {
          ...JSON.parse(JSON.stringify(object)),
          id: `${Date.now()}-${Math.random()}`,
          name: `${object.name} Copy`,
          position: [object.position[0] + 1, object.position[1], object.position[2]] as [number, number, number],
        };
        state.objects.push(newObject);
        state.selectedObjectId = newObject.id;
        // Add to history
        if (state.historyIndex < state.history.length - 1) {
          state.history = state.history.slice(0, state.historyIndex + 1);
        }
        state.history.push(JSON.parse(JSON.stringify(state.objects)));
        if (state.history.length > MAX_HISTORY) {
          state.history.shift();
        } else {
          state.historyIndex++;
        }
      }
    },
    
    setCameraPosition: (state, action: PayloadAction<[number, number, number]>) => {
      state.cameraPosition = action.payload;
    },
    
    setCameraTarget: (state, action: PayloadAction<[number, number, number]>) => {
      state.cameraTarget = action.payload;
    },
    
    clearScene: (state) => {
      state.objects = [];
      state.selectedObjectId = null;
      state.history = [[]];
      state.historyIndex = 0;
    },
    
    updateSettings: (state, action: PayloadAction<Partial<EditorSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
});

export const {
  addObject,
  removeObject,
  updateObject,
  updateObjectWithHistory,
  selectObject,
  setTransformMode,
  undo,
  redo,
  duplicateObject,
  setCameraPosition,
  setCameraTarget,
  clearScene,
  updateSettings,
} = editorSlice.actions;

export default editorSlice.reducer;

