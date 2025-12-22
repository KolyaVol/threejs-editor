import * as THREE from 'three';
import { MaterialConfig } from '@/types/editor.types';

// Material cache
const materialCache = new Map<string, THREE.Material>();

// Geometry cache
const geometryCache = new Map<string, THREE.BufferGeometry>();

// Helper to create cache key from material config
const getMaterialCacheKey = (config: MaterialConfig): string => {
  return JSON.stringify({
    type: config.type,
    color: config.color,
    metalness: config.metalness,
    roughness: config.roughness,
    wireframe: config.wireframe,
    transparent: config.transparent,
    opacity: config.opacity,
  });
};

// Helper to create cache key from geometry
const getGeometryCacheKey = (type: string, args: number[]): string => {
  return `${type}-${args.join(',')}`;
};

export const createMaterialFromConfig = (config: MaterialConfig): THREE.Material => {
  const cacheKey = getMaterialCacheKey(config);
  
  // Check cache first
  if (materialCache.has(cacheKey)) {
    const cached = materialCache.get(cacheKey)!;
    // Clone the material to avoid sharing state
    return cached.clone();
  }
  const baseParams = {
    color: new THREE.Color(config.color),
    transparent: config.transparent || false,
    opacity: config.opacity !== undefined ? config.opacity : 1,
    wireframe: config.wireframe || false,
  };

  let material: THREE.Material;

  switch (config.type) {
    case 'basic':
      material = new THREE.MeshBasicMaterial(baseParams);
      break;
    
    case 'lambert':
      material = new THREE.MeshLambertMaterial(baseParams);
      break;
    
    case 'phong':
      material = new THREE.MeshPhongMaterial(baseParams);
      break;
    
    case 'standard':
      material = new THREE.MeshStandardMaterial({
        ...baseParams,
        metalness: config.metalness !== undefined ? config.metalness : 0,
        roughness: config.roughness !== undefined ? config.roughness : 0.5,
      });
      break;
    
    case 'physical':
      material = new THREE.MeshPhysicalMaterial({
        ...baseParams,
        metalness: config.metalness !== undefined ? config.metalness : 0,
        roughness: config.roughness !== undefined ? config.roughness : 0.5,
      });
      break;
    
    case 'toon':
      material = new THREE.MeshToonMaterial(baseParams);
      break;
    
    default:
      material = new THREE.MeshStandardMaterial(baseParams);
  }

  // Cache the material
  materialCache.set(cacheKey, material);
  
  // Return a clone to avoid sharing state
  return material.clone();
};

// Get or create geometry from cache
export const getGeometry = (type: string, args: number[]): THREE.BufferGeometry => {
  const cacheKey = getGeometryCacheKey(type, args);
  
  // Check cache first
  if (geometryCache.has(cacheKey)) {
    const cached = geometryCache.get(cacheKey)!;
    // Clone the geometry to avoid sharing state
    return cached.clone();
  }

  let geometry: THREE.BufferGeometry;

  switch (type) {
    case 'box':
      geometry = new THREE.BoxGeometry(...(args.length >= 3 ? args : [1, 1, 1]));
      break;
    case 'sphere':
      geometry = new THREE.SphereGeometry(...(args.length >= 3 ? args : [1, 32, 32]));
      break;
    case 'cylinder':
      geometry = new THREE.CylinderGeometry(...(args.length >= 4 ? args : [1, 1, 2, 32]));
      break;
    case 'plane':
      geometry = new THREE.PlaneGeometry(...(args.length >= 2 ? args : [10, 10]));
      break;
    case 'torus':
      geometry = new THREE.TorusGeometry(...(args.length >= 4 ? args : [1, 0.4, 16, 100]));
      break;
    case 'cone':
      geometry = new THREE.ConeGeometry(...(args.length >= 3 ? args : [1, 2, 32]));
      break;
    default:
      geometry = new THREE.BoxGeometry(1, 1, 1);
  }

  // Cache the geometry
  geometryCache.set(cacheKey, geometry);
  
  // Return a clone to avoid sharing state
  return geometry.clone();
};

// Clear caches (useful for cleanup)
export const clearCaches = () => {
  // Dispose cached materials
  materialCache.forEach(material => {
    material.dispose();
  });
  materialCache.clear();

  // Dispose cached geometries
  geometryCache.forEach(geometry => {
    geometry.dispose();
  });
  geometryCache.clear();
};

export const generateObjectId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

