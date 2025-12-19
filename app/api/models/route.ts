import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const modelsDir = path.join(process.cwd(), 'public', 'assets', 'models', 'house');
    
    // Check if directory exists
    if (!fs.existsSync(modelsDir)) {
      return NextResponse.json({ models: [] });
    }
    
    // Read all files from the house directory
    const files = fs.readdirSync(modelsDir);
    
    // Filter for .glb and .gltf files
    const modelFiles = files
      .filter(file => file.endsWith('.glb') || file.endsWith('.gltf'))
      .map(file => `/assets/models/house/${file}`);
    
    return NextResponse.json({ models: modelFiles });
  } catch (error) {
    console.error('Error reading models directory:', error);
    return NextResponse.json({ models: [], error: 'Failed to load models' }, { status: 500 });
  }
}



