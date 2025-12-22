import { SceneObject } from '@/types/editor.types';

export const exportToReactComponent = (objects: SceneObject[]): string => {
  // Separate objects by type
  const lights = objects.filter(obj => 
    ['ambientLight', 'directionalLight', 'pointLight', 'spotLight'].includes(obj.type)
  );
  const models = objects.filter(obj => obj.type === 'model' && obj.modelPath);
  const meshes = objects.filter(obj => 
    !['ambientLight', 'directionalLight', 'pointLight', 'spotLight', 'model'].includes(obj.type)
  );

  // Check if we need model imports
  const hasModels = models.length > 0;
  const needsSuspense = hasModels;

  // Generate imports
  const imports = `'use client';

${needsSuspense ? 'import { Suspense } from \'react\';\n' : ''}import { Canvas } from '@react-three/fiber';
import { OrbitControls${hasModels ? ', useGLTF' : ''} } from '@react-three/drei';
import * as THREE from 'three';`;

  // Generate model components
  const modelComponents = models.map((model, index) => {
    const componentName = `Model${index + 1}`;
    const indent = '  ';
    
    return `${indent}function ${componentName}({ position, rotation, scale, visible }: { position: [number, number, number], rotation: [number, number, number], scale: [number, number, number], visible: boolean }) {
${indent}  const gltf = useGLTF('${model.modelPath}');
${indent}  const clonedScene = gltf.scene.clone(true);
${indent}  
${indent}  return (
${indent}    <primitive
${indent}      object={clonedScene}
${indent}      position={position}
${indent}      rotation={rotation}
${indent}      scale={scale}
${indent}      visible={visible}
${indent}    />
${indent}  );
${indent}}`;
  }).join('\n\n');

  // Generate light JSX
  const lightsJSX = lights.map(light => {
    const indent = '      ';
    const visible = light.visible !== undefined ? ` visible={${light.visible}}` : '';
    
    switch (light.type) {
      case 'ambientLight':
        return `${indent}<ambientLight intensity={${light.intensity || 0.5}} color="${light.lightColor || '#ffffff'}"${visible} />`;
      
      case 'directionalLight':
        return `${indent}<directionalLight
${indent}  position={[${light.position.join(', ')}]}
${indent}  intensity={${light.intensity || 1}}
${indent}  color="${light.lightColor || '#ffffff'}"
${indent}  castShadow={${light.castShadow || false}}${visible}
${indent}/>`;
      
      case 'pointLight':
        return `${indent}<pointLight
${indent}  position={[${light.position.join(', ')}]}
${indent}  intensity={${light.intensity || 1}}
${indent}  color="${light.lightColor || '#ffffff'}"
${indent}  castShadow={${light.castShadow || false}}${visible}
${indent}/>`;
      
      case 'spotLight':
        return `${indent}<spotLight
${indent}  position={[${light.position.join(', ')}]}
${indent}  intensity={${light.intensity || 1}}
${indent}  color="${light.lightColor || '#ffffff'}"
${indent}  castShadow={${light.castShadow || false}}${visible}
${indent}/>`;
      
      default:
        return '';
    }
  }).filter(Boolean).join('\n');

  // Generate mesh JSX
  const meshesJSX = meshes.map(obj => {
    const indent = '        ';

    const geometryMap: Record<string, string> = {
      box: 'boxGeometry',
      sphere: 'sphereGeometry',
      cylinder: 'cylinderGeometry',
      plane: 'planeGeometry',
      torus: 'torusGeometry',
      cone: 'coneGeometry',
    };

    const geometry = geometryMap[obj.type] || 'boxGeometry';
    const args = obj.geometryArgs ? ` args={[${obj.geometryArgs.join(', ')}]}` : '';

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

    const materialPropsStr = materialProps.length > 0 ? ` ${materialProps.join(' ')}` : '';
    const visible = obj.visible !== undefined ? ` visible={${obj.visible}}` : '';

    return `${indent}<mesh
${indent}  position={[${obj.position.join(', ')}]}
${indent}  rotation={[${obj.rotation.join(', ')}]}
${indent}  scale={[${obj.scale.join(', ')}]}
${indent}  castShadow
${indent}  receiveShadow${visible}
${indent}>
${indent}  <${geometry}${args} />
${indent}  <${materialType}${materialPropsStr} />
${indent}</mesh>`;
  }).join('\n\n');

  // Generate model usage JSX
  const modelsJSX = models.map((model, index) => {
    const indent = '          ';
    const componentName = `Model${index + 1}`;
    const visible = model.visible !== undefined ? model.visible : true;
    
    return `${indent}<${componentName}
${indent}  position={[${model.position.join(', ')}]}
${indent}  rotation={[${model.rotation.join(', ')}]}
${indent}  scale={[${model.scale.join(', ')}]}
${indent}  visible={${visible}}
${indent}/>`;
  }).join('\n\n');

  // Wrap models in Suspense if they exist
  const modelsWithSuspense = modelsJSX ? `        <Suspense fallback={null}>
${modelsJSX}
        </Suspense>` : '';

  // Combine all scene objects
  const allSceneObjects: string[] = [];
  if (meshesJSX) allSceneObjects.push(meshesJSX);
  if (modelsWithSuspense) allSceneObjects.push(modelsWithSuspense);
  const sceneObjectsJSX = allSceneObjects.join('\n\n');

  // Generate complete component
  const component = `${imports}${hasModels ? '\n\n' + modelComponents : ''}

export default function CustomScene() {
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }} shadows>
      {/* Lights */}
${lightsJSX ? lightsJSX + '\n' : '      {/* No lights */}\n'}
      {/* Scene Objects */}
      <group>
${sceneObjectsJSX ? sceneObjectsJSX : '        {/* No objects */}'}
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
