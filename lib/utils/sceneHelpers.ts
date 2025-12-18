import * as THREE from 'three';
import { MaterialConfig } from '@/types/editor.types';

export const createMaterialFromConfig = (config: MaterialConfig): THREE.Material => {
  const baseParams = {
    color: new THREE.Color(config.color),
    transparent: config.transparent || false,
    opacity: config.opacity !== undefined ? config.opacity : 1,
    wireframe: config.wireframe || false,
  };

  switch (config.type) {
    case 'basic':
      return new THREE.MeshBasicMaterial(baseParams);
    
    case 'lambert':
      return new THREE.MeshLambertMaterial(baseParams);
    
    case 'phong':
      return new THREE.MeshPhongMaterial(baseParams);
    
    case 'standard':
      return new THREE.MeshStandardMaterial({
        ...baseParams,
        metalness: config.metalness !== undefined ? config.metalness : 0,
        roughness: config.roughness !== undefined ? config.roughness : 0.5,
      });
    
    case 'physical':
      return new THREE.MeshPhysicalMaterial({
        ...baseParams,
        metalness: config.metalness !== undefined ? config.metalness : 0,
        roughness: config.roughness !== undefined ? config.roughness : 0.5,
      });
    
    case 'toon':
      return new THREE.MeshToonMaterial(baseParams);
    
    default:
      return new THREE.MeshStandardMaterial(baseParams);
  }
};

export const generateObjectId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

