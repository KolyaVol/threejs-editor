import { MaterialPreset } from '@/types/editor.types';

export const materialPresets: MaterialPreset[] = [
  // Basic Materials
  {
    id: 'standard-white',
    name: 'White Standard',
    category: 'basic',
    config: {
      type: 'standard',
      color: '#ffffff',
      metalness: 0,
      roughness: 0.5,
    },
  },
  {
    id: 'standard-gray',
    name: 'Gray Standard',
    category: 'basic',
    config: {
      type: 'standard',
      color: '#808080',
      metalness: 0,
      roughness: 0.5,
    },
  },
  {
    id: 'basic-red',
    name: 'Red Basic',
    category: 'basic',
    config: {
      type: 'basic',
      color: '#ff0000',
    },
  },
  {
    id: 'basic-green',
    name: 'Green Basic',
    category: 'basic',
    config: {
      type: 'basic',
      color: '#00ff00',
    },
  },
  {
    id: 'basic-blue',
    name: 'Blue Basic',
    category: 'basic',
    config: {
      type: 'basic',
      color: '#0000ff',
    },
  },
  
  // Metal Materials
  {
    id: 'metal-gold',
    name: 'Gold',
    category: 'metal',
    config: {
      type: 'standard',
      color: '#ffd700',
      metalness: 1,
      roughness: 0.2,
    },
  },
  {
    id: 'metal-silver',
    name: 'Silver',
    category: 'metal',
    config: {
      type: 'standard',
      color: '#c0c0c0',
      metalness: 1,
      roughness: 0.1,
    },
  },
  {
    id: 'metal-copper',
    name: 'Copper',
    category: 'metal',
    config: {
      type: 'standard',
      color: '#b87333',
      metalness: 1,
      roughness: 0.3,
    },
  },
  {
    id: 'metal-bronze',
    name: 'Bronze',
    category: 'metal',
    config: {
      type: 'standard',
      color: '#cd7f32',
      metalness: 1,
      roughness: 0.4,
    },
  },
  {
    id: 'metal-iron',
    name: 'Iron',
    category: 'metal',
    config: {
      type: 'standard',
      color: '#4a4a4a',
      metalness: 1,
      roughness: 0.5,
    },
  },
  
  // Plastic Materials
  {
    id: 'plastic-red',
    name: 'Red Plastic',
    category: 'plastic',
    config: {
      type: 'phong',
      color: '#ff3333',
      metalness: 0,
      roughness: 0.3,
    },
  },
  {
    id: 'plastic-blue',
    name: 'Blue Plastic',
    category: 'plastic',
    config: {
      type: 'phong',
      color: '#3333ff',
      metalness: 0,
      roughness: 0.3,
    },
  },
  {
    id: 'plastic-green',
    name: 'Green Plastic',
    category: 'plastic',
    config: {
      type: 'phong',
      color: '#33ff33',
      metalness: 0,
      roughness: 0.3,
    },
  },
  {
    id: 'plastic-yellow',
    name: 'Yellow Plastic',
    category: 'plastic',
    config: {
      type: 'phong',
      color: '#ffff00',
      metalness: 0,
      roughness: 0.3,
    },
  },
  {
    id: 'plastic-black',
    name: 'Black Plastic',
    category: 'plastic',
    config: {
      type: 'phong',
      color: '#1a1a1a',
      metalness: 0,
      roughness: 0.4,
    },
  },
  
  // Special Materials
  {
    id: 'glass',
    name: 'Glass',
    category: 'special',
    config: {
      type: 'physical',
      color: '#ffffff',
      metalness: 0,
      roughness: 0,
      transparent: true,
      opacity: 0.5,
    },
  },
  {
    id: 'rubber',
    name: 'Rubber',
    category: 'special',
    config: {
      type: 'standard',
      color: '#2a2a2a',
      metalness: 0,
      roughness: 0.9,
    },
  },
  {
    id: 'wood',
    name: 'Wood',
    category: 'special',
    config: {
      type: 'lambert',
      color: '#8b4513',
      metalness: 0,
      roughness: 0.8,
    },
  },
  {
    id: 'stone',
    name: 'Stone',
    category: 'special',
    config: {
      type: 'lambert',
      color: '#808080',
      metalness: 0,
      roughness: 0.9,
    },
  },
  {
    id: 'toon',
    name: 'Toon',
    category: 'special',
    config: {
      type: 'toon',
      color: '#ff6b6b',
    },
  },
];

export const getMaterialPresetById = (id: string): MaterialPreset | undefined => {
  return materialPresets.find(preset => preset.id === id);
};

export const getMaterialPresetsByCategory = (category: string): MaterialPreset[] => {
  return materialPresets.filter(preset => preset.category === category);
};

