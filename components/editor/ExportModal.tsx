'use client';

import { useState } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { exportToReactComponent, downloadCode } from '@/lib/utils/exportToComponent';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const objects = useAppSelector((state) => state.editor.objects);
  const [filename, setFilename] = useState('CustomScene.tsx');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generatedCode = exportToReactComponent(objects);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    downloadCode(generatedCode, filename);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 className="text-lg font-semibold">Export React Component</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Code Preview */}
        <div className="flex-1 overflow-auto p-4 bg-zinc-900">
          <pre className="text-sm text-zinc-300 font-mono">
            <code>{generatedCode}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-700 flex items-center gap-4">
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm focus:outline-none focus:border-blue-500"
            placeholder="Filename..."
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-sm font-medium transition-colors"
          >
            {copied ? '✓ Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
          >
            Download File
          </button>
        </div>
      </div>
    </div>
  );
}

