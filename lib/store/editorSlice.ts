import { createSlice, PayloadAction, current } from '@reduxjs/toolkit';
import { EditorState, SceneObject, TransformMode, EditorSettings, ObjectGroup } from '@/types/editor.types';
import { generateObjectId } from '@/lib/utils/sceneHelpers';

// Optimized deep clone function using structuredClone with fallback
const deepClone = <T>(obj: T): T => {
  if (typeof structuredClone !== 'undefined') {
    return structuredClone(obj);
  }
  // Fallback for older browsers
  return JSON.parse(JSON.stringify(obj)) as T;
};

const initialState: EditorState = {
  objects: [],
  groups: [],
  selectedObjectId: null,
  selectedObjectIds: [],
  selectedGroupId: null,
  transformMode: 'translate',
  history: [[]],
  historyIndex: 0,
  cameraPosition: [5, 5, 5],
  cameraTarget: [0, 0, 0],
  settings: {
    snapToGrid: true,
    snapSize: 0.5,
    snapRotation: false,
    rotationStep: 15, // degrees
    snapScale: false,
    scaleStep: 0.1, // scale increment
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
      state.history.push(deepClone(current(state.objects)));
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
      state.history.push(deepClone(current(state.objects)));
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
        state.history.push(deepClone(current(state.objects)));
        if (state.history.length > MAX_HISTORY) {
          state.history.shift();
        } else {
          state.historyIndex++;
        }
      }
    },
    
    selectObject: (state, action: PayloadAction<{ id: string | null; multiSelect?: boolean }>) => {
      const { id, multiSelect } = action.payload;
      
      if (multiSelect && id) {
        // Multi-select: toggle the object in the selection
        const index = state.selectedObjectIds.indexOf(id);
        if (index === -1) {
          // Add to selection
          state.selectedObjectIds.push(id);
          state.selectedObjectId = id; // Set as primary selection
        } else {
          // Remove from selection
          state.selectedObjectIds.splice(index, 1);
          if (state.selectedObjectIds.length > 0) {
            state.selectedObjectId = state.selectedObjectIds[state.selectedObjectIds.length - 1];
          } else {
            state.selectedObjectId = null;
          }
        }
        // Clear group selection when selecting objects
        state.selectedGroupId = null;
      } else {
        // Single select: replace selection
        state.selectedObjectId = id;
        state.selectedObjectIds = id ? [id] : [];
        // Clear group selection when selecting objects
        if (id) {
          state.selectedGroupId = null;
        }
      }
    },
    
    setTransformMode: (state, action: PayloadAction<TransformMode>) => {
      state.transformMode = action.payload;
    },
    
    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.objects = deepClone(state.history[state.historyIndex]);
      }
    },
    
    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.objects = deepClone(state.history[state.historyIndex]);
      }
    },
    
    duplicateObject: (state, action: PayloadAction<string>) => {
      const object = state.objects.find(obj => obj.id === action.payload);
      if (object) {
        const newObject = {
          ...deepClone(object),
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
        state.history.push(deepClone(current(state.objects)));
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
      state.groups = [];
      state.selectedObjectId = null;
      state.selectedGroupId = null;
      state.history = [[]];
      state.historyIndex = 0;
    },
    
    updateSettings: (state, action: PayloadAction<Partial<EditorSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    
    // Lock/Unlock actions
    toggleLock: (state, action: PayloadAction<string>) => {
      const object = state.objects.find(obj => obj.id === action.payload);
      if (object) {
        object.locked = !object.locked;
        // Add to history
        if (state.historyIndex < state.history.length - 1) {
          state.history = state.history.slice(0, state.historyIndex + 1);
        }
        state.history.push(deepClone(current(state.objects)));
        if (state.history.length > MAX_HISTORY) {
          state.history.shift();
        } else {
          state.historyIndex++;
        }
      }
    },
    
    // Group management actions
    createGroup: (state, action: PayloadAction<{ name: string; objectIds: string[] }>) => {
      const groupId = generateObjectId();
      const newGroup: ObjectGroup = {
        id: groupId,
        name: action.payload.name,
        objectIds: action.payload.objectIds,
      };
      state.groups.push(newGroup);
      
      // Assign groupId to objects
      action.payload.objectIds.forEach(objId => {
        const obj = state.objects.find(o => o.id === objId);
        if (obj) {
          obj.groupId = groupId;
        }
      });
      
      // Add to history
      if (state.historyIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIndex + 1);
      }
      state.history.push(deepClone(current(state.objects)));
      if (state.history.length > MAX_HISTORY) {
        state.history.shift();
      } else {
        state.historyIndex++;
      }
    },
    
    addToGroup: (state, action: PayloadAction<{ groupId: string; objectId: string }>) => {
      const group = state.groups.find(g => g.id === action.payload.groupId);
      const object = state.objects.find(obj => obj.id === action.payload.objectId);
      
      if (group && object && !group.objectIds.includes(action.payload.objectId)) {
        group.objectIds.push(action.payload.objectId);
        object.groupId = action.payload.groupId;
        
        // Add to history
        if (state.historyIndex < state.history.length - 1) {
          state.history = state.history.slice(0, state.historyIndex + 1);
        }
        state.history.push(deepClone(current(state.objects)));
        if (state.history.length > MAX_HISTORY) {
          state.history.shift();
        } else {
          state.historyIndex++;
        }
      }
    },
    
    removeFromGroup: (state, action: PayloadAction<string>) => {
      const object = state.objects.find(obj => obj.id === action.payload);
      if (object && object.groupId) {
        const group = state.groups.find(g => g.id === object.groupId);
        if (group) {
          group.objectIds = group.objectIds.filter(id => id !== action.payload);
          object.groupId = undefined;
          
          // Remove group if empty
          if (group.objectIds.length === 0) {
            state.groups = state.groups.filter(g => g.id !== group.id);
          }
          
          // Add to history
          if (state.historyIndex < state.history.length - 1) {
            state.history = state.history.slice(0, state.historyIndex + 1);
          }
          state.history.push(deepClone(current(state.objects)));
          if (state.history.length > MAX_HISTORY) {
            state.history.shift();
          } else {
            state.historyIndex++;
          }
        }
      }
    },
    
    deleteGroup: (state, action: PayloadAction<string>) => {
      const group = state.groups.find(g => g.id === action.payload);
      if (group) {
        // Remove groupId from all objects in the group
        group.objectIds.forEach(objId => {
          const obj = state.objects.find(o => o.id === objId);
          if (obj) {
            obj.groupId = undefined;
          }
        });
        
        // Remove the group
        state.groups = state.groups.filter(g => g.id !== action.payload);
        
        // Add to history
        if (state.historyIndex < state.history.length - 1) {
          state.history = state.history.slice(0, state.historyIndex + 1);
        }
        state.history.push(deepClone(current(state.objects)));
        if (state.history.length > MAX_HISTORY) {
          state.history.shift();
        } else {
          state.historyIndex++;
        }
      }
    },
    
    updateGroup: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const group = state.groups.find(g => g.id === action.payload.id);
      if (group) {
        group.name = action.payload.name;
      }
    },
    
    selectGroup: (state, action: PayloadAction<string | null>) => {
      state.selectedGroupId = action.payload;
      if (action.payload) {
        state.selectedObjectId = null; // Clear object selection when selecting group
      }
    },
    
    updateGroupTransform: (state, action: PayloadAction<{ groupId: string; position?: [number, number, number]; rotation?: [number, number, number]; scale?: [number, number, number] }>) => {
      const group = state.groups.find(g => g.id === action.payload.groupId);
      if (!group) return;
      
      // Get all objects in the group (excluding locked ones)
      const groupObjects = state.objects.filter(obj => 
        group.objectIds.includes(obj.id) && !obj.locked
      );
      if (groupObjects.length === 0) return;
      
      // Calculate current group center
      const center: [number, number, number] = [0, 0, 0];
      groupObjects.forEach(obj => {
        center[0] += obj.position[0];
        center[1] += obj.position[1];
        center[2] += obj.position[2];
      });
      center[0] /= groupObjects.length;
      center[1] /= groupObjects.length;
      center[2] /= groupObjects.length;
      
      // Apply transform to all objects in group
      groupObjects.forEach(obj => {
        if (action.payload.position) {
          const offset: [number, number, number] = [
            obj.position[0] - center[0],
            obj.position[1] - center[1],
            obj.position[2] - center[2],
          ];
          obj.position = [
            action.payload.position[0] + offset[0],
            action.payload.position[1] + offset[1],
            action.payload.position[2] + offset[2],
          ];
        }
        if (action.payload.rotation) {
          obj.rotation = action.payload.rotation;
        }
        if (action.payload.scale) {
          obj.scale = action.payload.scale;
        }
      });
      
      // Add to history only on mouse up (this is called from handleMouseUp)
      // For handleChange, we don't add to history
    },
    
    updateGroupTransformWithHistory: (state, action: PayloadAction<{ groupId: string; position?: [number, number, number]; rotation?: [number, number, number]; scale?: [number, number, number] }>) => {
      const group = state.groups.find(g => g.id === action.payload.groupId);
      if (!group) return;
      
      // Get all objects in the group (excluding locked ones)
      const groupObjects = state.objects.filter(obj => 
        group.objectIds.includes(obj.id) && !obj.locked
      );
      if (groupObjects.length === 0) return;
      
      // Calculate current group center
      const center: [number, number, number] = [0, 0, 0];
      groupObjects.forEach(obj => {
        center[0] += obj.position[0];
        center[1] += obj.position[1];
        center[2] += obj.position[2];
      });
      center[0] /= groupObjects.length;
      center[1] /= groupObjects.length;
      center[2] /= groupObjects.length;
      
      // Apply transform to all objects in group
      groupObjects.forEach(obj => {
        if (action.payload.position) {
          const offset: [number, number, number] = [
            obj.position[0] - center[0],
            obj.position[1] - center[1],
            obj.position[2] - center[2],
          ];
          obj.position = [
            action.payload.position[0] + offset[0],
            action.payload.position[1] + offset[1],
            action.payload.position[2] + offset[2],
          ];
        }
        if (action.payload.rotation) {
          obj.rotation = action.payload.rotation;
        }
        if (action.payload.scale) {
          obj.scale = action.payload.scale;
        }
      });
      
      // Add to history
      if (state.historyIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIndex + 1);
      }
      state.history.push(deepClone(current(state.objects)));
      if (state.history.length > MAX_HISTORY) {
        state.history.shift();
      } else {
        state.historyIndex++;
      }
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
  toggleLock,
  createGroup,
  addToGroup,
  removeFromGroup,
  deleteGroup,
  updateGroup,
  selectGroup,
  updateGroupTransform,
  updateGroupTransformWithHistory,
} = editorSlice.actions;

export default editorSlice.reducer;

