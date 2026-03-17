import type { ReactNode, RefObject, CSSProperties } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  children: ReactNode;
  /** When true, render inline instead of in a portal (default false) */
  disablePortal?: boolean;
  /** Theme attribute to propagate to portal wrapper */
  theme?: string;
  /** Density attribute to propagate to portal wrapper */
  density?: string;
  /** Ref for outside-click detection on the portal element */
  popoverRef?: RefObject<HTMLDivElement | null>;
  /** Fixed positioning style from usePopoverPosition */
  style?: CSSProperties;
  /** Resolved placement for animation direction */
  placement?: 'bottom' | 'top';
}

export function Portal({
  children,
  disablePortal,
  theme,
  density,
  popoverRef,
  style,
  placement,
}: PortalProps) {
  if (disablePortal || typeof document === 'undefined') {
    return <>{children}</>;
  }

  return createPortal(
    <div
      ref={(el) => {
        if (popoverRef) (popoverRef as { current: HTMLDivElement | null }).current = el;
      }}
      style={style}
      data-dp-portal=""
      data-dp-theme={theme || undefined}
      data-dp-density={density || undefined}
      data-dp-placement={placement || undefined}
    >
      {children}
    </div>,
    document.body,
  );
}
