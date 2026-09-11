import { useEffect, useRef, useCallback } from 'react';
import { Direction } from './useSnakeGame';

interface UseTouchControlsProps {
  onDirectionChange: (dir: Direction) => void;
  onTap: () => void;
  enabled: boolean;
}

export function useTouchControls({ onDirectionChange, onTap, enabled }: UseTouchControlsProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchStartTime = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    touchStartTime.current = Date.now();
  }, [enabled]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enabled || !touchStart.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const elapsed = Date.now() - touchStartTime.current;
    
    const minSwipeDistance = 30;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX < minSwipeDistance && absY < minSwipeDistance && elapsed < 300) {
      // It's a tap
      onTap();
      touchStart.current = null;
      return;
    }

    if (absX > absY) {
      // Horizontal swipe
      if (deltaX > minSwipeDistance) {
        onDirectionChange('RIGHT');
      } else if (deltaX < -minSwipeDistance) {
        onDirectionChange('LEFT');
      }
    } else {
      // Vertical swipe
      if (deltaY > minSwipeDistance) {
        onDirectionChange('DOWN');
      } else if (deltaY < -minSwipeDistance) {
        onDirectionChange('UP');
      }
    }

    touchStart.current = null;
  }, [enabled, onDirectionChange, onTap]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return containerRef;
}
