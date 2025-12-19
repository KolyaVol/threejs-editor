import * as THREE from 'three';

export type TransformMode = 'translate' | 'rotate' | 'scale';

export type ObjectType = 'box' | 'sphere' | 'cylinder' | 'plane' | 'torus' | 'cone' | 'model' | 'ambientLight' | 'directionalLight' | 'pointLight' | 'spotLight';

export interface MaterialConfig {
  type: 'standard' | 'basic' | 'phong' | 'lambert' | 'physical' | 'toon';
  color: string;
  metalness?: number;
  roughness?: number;
  wireframe?: boolean;
  transparent?: boolean;
  opacity?: number;
}

export interface SceneObject {
  id: string;
  name: string;
  type: ObjectType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  material?: MaterialConfig;
  visible: boolean;
  modelPath?: string; // for imported models
  // Light specific properties
  intensity?: number;
  lightColor?: string;
  castShadow?: boolean;
  // Geometry args for primitives
  geometryArgs?: number[];
}

export interface EditorSettings {
  snapToGrid: boolean;
  snapSize: number;
}

export interface EditorState {
  objects: SceneObject[];
  selectedObjectId: string | null;
  transformMode: TransformMode;
  history: SceneObject[][];
  historyIndex: number;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  settings: EditorSettings;
}

export interface MaterialPreset {
  id: string;
  name: string;
  config: MaterialConfig;
  category: 'basic' | 'metal' | 'plastic' | 'special';
}

