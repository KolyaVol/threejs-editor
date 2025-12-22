'use client';

import { useState, useEffect, useRef, memo } from 'react';
import ModelThumbnail from './ModelThumbnail';

interface LazyModelThumbnailProps {
  modelPath: string;
}

const LazyModelThumbnail = memo(function LazyModelThumbnail({ modelPath }: LazyModelThumbnailProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isIntersecting = entry.isIntersecting;
          setIsInViewport(isIntersecting);
          
          // Clear any pending timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          
          if (isIntersecting) {
            // Small delay to ensure previous context cleanup completes
            timeoutRef.current = setTimeout(() => {
              setIsVisible(true);
            }, 50);
          } else {
            // Hide immediately when out of viewport
            setIsVisible(false);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      {isVisible && isInViewport ? (
        <ModelThumbnail key={modelPath} modelPath={modelPath} />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500">
          <div className="w-4 h-4 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
});

export default LazyModelThumbnail;

