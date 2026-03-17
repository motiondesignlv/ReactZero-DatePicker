import { useState, useLayoutEffect, useCallback, type RefObject } from 'react';

export interface PopoverPosition {
  top: number;
  left: number;
  placement: 'bottom' | 'top';
}

export interface UsePopoverPositionOptions {
  triggerRef: RefObject<HTMLElement | null>;
  popoverRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  /** Gap between trigger and popover in px (default 6) */
  offset?: number;
  /** Preferred placement direction (default 'bottom') */
  preferredPlacement?: 'bottom' | 'top';
  /** Horizontal alignment (default 'start') */
  alignment?: 'start' | 'end';
}

const INITIAL: PopoverPosition = { top: 0, left: 0, placement: 'bottom' };

export function usePopoverPosition({
  triggerRef,
  popoverRef,
  isOpen,
  offset = 6,
  preferredPlacement = 'bottom',
  alignment = 'start',
}: UsePopoverPositionOptions): PopoverPosition {
  const [pos, setPos] = useState<PopoverPosition>(INITIAL);

  const update = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const popover = popoverRef.current;
    const popoverHeight = popover?.offsetHeight ?? 300;
    const popoverWidth = popover?.offsetWidth ?? 280;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let placement: 'bottom' | 'top' = preferredPlacement;
    if (placement === 'bottom' && spaceBelow < popoverHeight + offset && spaceAbove > spaceBelow) {
      placement = 'top';
    } else if (placement === 'top' && spaceAbove < popoverHeight + offset && spaceBelow > spaceAbove) {
      placement = 'bottom';
    }

    const top = placement === 'bottom'
      ? rect.bottom + offset
      : rect.top - popoverHeight - offset;

    let left = alignment === 'start' ? rect.left : rect.right - popoverWidth;

    // Clamp horizontal to viewport
    const maxLeft = document.documentElement.clientWidth - popoverWidth - 8;
    if (left > maxLeft) left = maxLeft;
    if (left < 8) left = 8;

    setPos({ top, left, placement });
  }, [triggerRef, popoverRef, offset, preferredPlacement, alignment]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    update();

    // Re-measure after popover has rendered and has its real dimensions
    const raf = requestAnimationFrame(update);

    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, update]);

  return isOpen ? pos : INITIAL;
}
