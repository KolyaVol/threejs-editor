# Three.js Editor - Next.js

A comprehensive Three.js editor built with Next.js, TypeScript, and Tailwind CSS. This editor allows you to create, manipulate, and export 3D scenes with an intuitive interface similar to the official Three.js editor.

## Features

### Core Functionality

- **3D Viewport** - Interactive 3D canvas with OrbitControls
- **Primitive Shapes** - Add boxes, spheres, cylinders, cones, torus, and planes
- **Transform Controls** - Move, rotate, and scale objects with visual gizmos
- **Scene Hierarchy** - Tree view of all objects in the scene
- **Properties Panel** - Edit object properties, transforms, and materials
- **Material Library** - 20+ preset materials (metals, plastics, glass, etc.)
- **Model Loading** - Import and place GLTF/GLB models
- **Lighting System** - Add and configure ambient, directional, point, and spot lights

### Advanced Features

- **Undo/Redo** - Full history system with 50-level undo stack
- **React Component Export** - Generate clean React Three Fiber code
- **Keyboard Shortcuts** - Efficient workflow with hotkeys
- **Context Menus** - Right-click for quick actions
- **Dark Theme** - Professional dark UI inspired by Three.js editor

## Getting Started

### Installation

```bash
cd threejs-editor
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Usage

### Adding Objects

1. Click **"+ Add Shape"** in the toolbar to add primitive shapes
2. Click **"+ Add Light"** to add lighting to your scene
3. Use the **Model Library** panel to load 3D models (GLTF/GLB)

### Transforming Objects

1. Select an object by clicking it in the viewport or scene hierarchy
2. Use the toolbar buttons to switch between **Move**, **Rotate**, and **Scale** modes
3. Drag the gizmo handles in the viewport to transform the object
4. Or use the **Properties Panel** to enter precise values

### Materials

1. Select an object
2. Open the **Materials** panel on the right
3. Browse categories: Basic, Metal, Plastic, Special
4. Click a material preset to apply it
5. Fine-tune material properties in the **Properties Panel**

### Scene Hierarchy

- **Click** an object to select it
- **Right-click** for context menu:
  - Rename
  - Duplicate
  - Delete

### Exporting

1. Click **"Export Code"** in the toolbar
2. Preview the generated React Three Fiber component
3. **Copy to Clipboard** or **Download** as a .tsx file
4. Use the generated component in your Next.js or React projects

### Keyboard Shortcuts

| Action          | Shortcut             |
| --------------- | -------------------- |
| Undo            | `Ctrl+Z`             |
| Redo            | `Ctrl+Shift+Z`       |
| Delete Selected | `Del` or `Backspace` |
| Export          | `Ctrl+E`             |
| Help            | `F1` or `?`          |

### Viewport Controls

- **Left Mouse Button** - Rotate camera
- **Right Mouse Button** - Pan camera
- **Mouse Wheel** - Zoom in/out
- **Click Object** - Select object

## Adding Custom Models

1. Place your GLTF/GLB files in `public/assets/models/house/`
2. Refresh the page - models are automatically loaded!
3. All `.glb` and `.gltf` files from the house folder will appear in the Model Library panel

The editor automatically scans the `house` folder and loads all available models via an API route.

## Project Structure

```
threejs-editor/
├── app/
│   ├── layout.tsx          # Root layout with Redux provider
│   ├── page.tsx            # Main editor page
│   └── globals.css         # Global styles
├── components/
│   ├── editor/
│   │   ├── EditorCanvas.tsx        # 3D viewport
│   │   ├── SceneObjects.tsx        # Renders scene objects
│   │   ├── TransformControlsWrapper.tsx  # Transform gizmos
│   │   ├── SceneHierarchy.tsx      # Object tree
│   │   ├── PropertiesPanel.tsx     # Object properties
│   │   ├── MaterialLibrary.tsx     # Material presets
│   │   ├── ModelLibrary.tsx        # Model browser
│   │   ├── Toolbar.tsx             # Top toolbar
│   │   └── ExportModal.tsx         # Export dialog
│   └── ReduxProvider.tsx   # Redux store provider
├── lib/
│   ├── store/
│   │   ├── store.ts        # Redux store config
│   │   ├── editorSlice.ts  # Editor state slice
│   │   └── hooks.ts        # Typed Redux hooks
│   ├── utils/
│   │   ├── exportToComponent.ts  # Code generation
│   │   └── sceneHelpers.ts       # Three.js utilities
│   └── materials/
│       └── materialPresets.ts    # Material definitions
├── types/
│   └── editor.types.ts     # TypeScript types
└── public/
    └── assets/
        └── models/         # GLTF/GLB models
```

## Technologies Used

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **Three.js** - 3D graphics library

## State Management

This project uses **Redux Toolkit** for state management, providing:

- Centralized state for scene objects
- Structured actions and reducers
- Time-travel debugging with Redux DevTools
- Immutable updates with Immer
- History management for undo/redo

## Export Format

The editor exports clean React Three Fiber components:

```tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function CustomScene() {
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }} shadows>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      <group>
        <mesh position={[0, 1, 0]} rotation={[0, 0, 0]} scale={[1, 1, 1]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
      </group>

      <OrbitControls makeDefault />
    </Canvas>
  );
}
```

## Future Enhancements

Potential features for future versions:

- Texture loading and mapping
- Post-processing effects
- Animation timeline
- Group/parent-child relationships
- Import existing scenes
- Camera presets
- Multiple viewports
- Mesh editing tools
- Physics simulation
- Export to GLTF/GLB

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
