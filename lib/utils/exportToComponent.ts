import { SceneObject } from '@/types/editor.types';

export const exportToReactComponent = (objects: SceneObject[]): string => {
  // Generate imports
  const imports = `import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';`;

  // Separate lights and meshes
  const lights = objects.filter(obj => 
    ['ambientLight', 'directionalLight', 'pointLight', 'spotLight'].includes(obj.type)
  );
  const meshes = objects.filter(obj => 
    !['ambientLight', 'directionalLight', 'pointLight', 'spotLight'].includes(obj.type)
  );

  // Generate light JSX
  const lightsJSX = lights.map(light => {
    const indent = '      ';
    
    switch (light.type) {
      case 'ambientLight':
        return `${indent}<ambientLight intensity={${light.intensity || 0.5}} color="${light.lightColor || '#ffffff'}" />`;
      
      case 'directionalLight':
        return `${indent}<directionalLight
${indent}  position={[${light.position.join(', ')}]}
${indent}  intensity={${light.intensity || 1}}
${indent}  color="${light.lightColor || '#ffffff'}"
${indent}  castShadow={${light.castShadow || false}}
${indent}/>`;
      
      case 'pointLight':
        return `${indent}<pointLight
${indent}  position={[${light.position.join(', ')}]}
${indent}  intensity={${light.intensity || 1}}
${indent}  color="${light.lightColor || '#ffffff'}"
${indent}  castShadow={${light.castShadow || false}}
${indent}/>`;
      
      case 'spotLight':
        return `${indent}<spotLight
${indent}  position={[${light.position.join(', ')}]}
${indent}  intensity={${light.intensity || 1}}
${indent}  color="${light.lightColor || '#ffffff'}"
${indent}  castShadow={${light.castShadow || false}}
${indent}/>`;
      
      default:
        return '';
    }
  }).filter(Boolean).join('\n');

  // Generate mesh JSX
  const meshesJSX = meshes.map(obj => {
    const indent = '        ';
    
    if (obj.type === 'model' && obj.modelPath) {
      return `${indent}{/* Model: ${obj.name} - Path: ${obj.modelPath} */}
${indent}{/* Load this model using useGLTF hook */}`;
    }

    const geometryMap: Record<string, string> = {
      box: 'boxGeometry',
      sphere: 'sphereGeometry',
      cylinder: 'cylinderGeometry',
      plane: 'planeGeometry',
      torus: 'torusGeometry',
      cone: 'coneGeometry',
    };

    const geometry = geometryMap[obj.type] || 'boxGeometry';
    const args = obj.geometryArgs ? `args={[${obj.geometryArgs.join(', ')}]}` : '';

    // Material props
    const material = obj.material;
    let materialType = 'meshStandardMaterial';
    let materialProps: string[] = [];

    if (material) {
      switch (material.type) {
        case 'basic': materialType = 'meshBasicMaterial'; break;
        case 'lambert': materialType = 'meshLambertMaterial'; break;
        case 'phong': materialType = 'meshPhongMaterial'; break;
        case 'standard': materialType = 'meshStandardMaterial'; break;
        case 'physical': materialType = 'meshPhysicalMaterial'; break;
        case 'toon': materialType = 'meshToonMaterial'; break;
      }

      materialProps.push(`color="${material.color}"`);
      
      if (material.metalness !== undefined && (material.type === 'standard' || material.type === 'physical')) {
        materialProps.push(`metalness={${material.metalness}}`);
      }
      
      if (material.roughness !== undefined && (material.type === 'standard' || material.type === 'physical')) {
        materialProps.push(`roughness={${material.roughness}}`);
      }
      
      if (material.wireframe) {
        materialProps.push('wireframe');
      }
      
      if (material.transparent) {
        materialProps.push('transparent');
        materialProps.push(`opacity={${material.opacity || 1}}`);
      }
    }

    return `${indent}<mesh
${indent}  position={[${obj.position.join(', ')}]}
${indent}  rotation={[${obj.rotation.join(', ')}]}
${indent}  scale={[${obj.scale.join(', ')}]}
${indent}  castShadow
${indent}  receiveShadow
${indent}>
${indent}  <${geometry} ${args} />
${indent}  <${materialType} ${materialProps.join(' ')} />
${indent}</mesh>`;
  }).join('\n\n');

  // Generate complete component
  const component = `${imports}

export default function CustomScene() {
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }} shadows>
      {/* Lights */}
${lightsJSX}

      {/* Scene Objects */}
      <group>
${meshesJSX}
      </group>

      <OrbitControls makeDefault />
    </Canvas>
  );
}
`;

  return component;
};

export const downloadCode = (code: string, filename: string = 'CustomScene.tsx') => {
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

