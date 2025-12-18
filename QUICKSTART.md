# Quick Start Guide

Get up and running with the Three.js Editor in under 5 minutes!

## Installation & Setup

```bash
# Navigate to the project
cd threejs-editor

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open http://localhost:3000 in your browser.

## Your First Scene

### 1. Add a Cube
- Click **"+ Add Shape"** in the toolbar
- Select **"Box"**
- A cube appears at the origin

### 2. Transform the Cube
- The cube is automatically selected (highlighted in blue)
- Use the **Move** button (default) and drag the gizmo arrows
- Try **Rotate** and **Scale** buttons to explore other transformations

### 3. Change the Material
- Look at the **Materials** panel on the right
- Click any material preset (try "Gold" under the Metal category)
- The cube instantly updates with the new material

### 4. Fine-tune Properties
- In the **Properties** panel, adjust:
  - Position values for precise placement
  - Metalness and Roughness sliders
  - Color picker to customize the color

### 5. Add More Objects
- Click **"+ Add Shape"** and add a **Sphere**
- Click **"+ Add Light"** and add a **Point Light**
- Position the light above the scene (Y: 3)

### 6. Export Your Scene
- Click **"Export Code"** in the toolbar
- Copy the generated React component code
- Use it in any Next.js or React project!

## Tips

### Navigation
- **Rotate View**: Left-click and drag
- **Pan View**: Right-click and drag
- **Zoom**: Scroll wheel

### Workflow
- Use the **Scene Hierarchy** (left) to quickly select objects
- Right-click objects in the hierarchy for quick actions
- Press `Ctrl+Z` to undo, `Ctrl+Shift+Z` to redo
- Press `Del` to delete selected objects

### Materials
The materials are organized into categories:
- **Basic**: Simple colored materials
- **Metal**: Gold, silver, copper, etc.
- **Plastic**: Colored plastics
- **Special**: Glass, wood, stone, toon

### Pro Tips
- Hold `Shift` while transforming for precision mode (coming soon)
- Use the gizmo viewcube (bottom-right) to snap to orthographic views
- The grid helps you align objects precisely

## Adding Custom Models

1. Get a GLTF/GLB model (free resources: [Sketchfab](https://sketchfab.com/), [Poly Pizza](https://poly.pizza/))
2. Place the `.glb` file in `public/assets/models/`
3. Edit `components/editor/ModelLibrary.tsx`:

```typescript
const availableModels = [
  '/assets/models/your-model.glb',
];
```

4. Refresh the page - your model appears in the Model Library!

## Keyboard Shortcuts

Master these for a faster workflow:

| Action | Shortcut |
|--------|----------|
| Undo | `Ctrl+Z` |
| Redo | `Ctrl+Shift+Z` |
| Delete | `Del` |
| Export | `Ctrl+E` |
| Help | `F1` or `?` |

## Common Issues

### Canvas is blank
- Check browser console for errors
- Ensure WebGL is enabled in your browser

### Models won't load
- Verify the file is in `public/assets/models/`
- Check the path in `ModelLibrary.tsx` starts with `/assets/models/`
- GLTF/GLB files only (not OBJ, FBX, etc.)

### Performance is slow
- Reduce number of objects
- Disable shadows in complex scenes
- Use simpler materials (Basic instead of Physical)

## Next Steps

- Experiment with different lighting setups
- Try combining multiple objects to create complex scenes
- Export and use your scenes in a real project
- Explore the Properties panel to understand all available options

## Need Help?

Press `F1` or `?` in the editor to see all keyboard shortcuts and viewport controls.

Happy editing! 🎨

