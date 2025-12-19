'use client';

import { useState, useEffect, useRef } from 'react';
import ModelThumbnail from './ModelThumbnail';

interface LazyModelThumbnailProps {
  modelPath: string;
}

export default function LazyModelThumbnail({ modelPath }: LazyModelThumbnailProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isIntersecting = entry.isIntersecting;
          setIsInViewport(isIntersecting);
          
          if (isIntersecting && !hasLoaded) {
            // Start loading when entering viewport
            setIsVisible(true);
            setHasLoaded(true);
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [hasLoaded]);

  return (
    <div ref={containerRef} className="w-full h-full">
      {isVisible ? (
        <div className={isInViewport ? '' : 'pointer-events-none'}>
          <ModelThumbnail modelPath={modelPath} />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500">
          <div className="w-4 h-4 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

