import { useRef, useEffect, useCallback } from 'react';

/**
 * useMobileSheet — adds touch drag-to-dismiss to a modal card on mobile.
 * 
 * Usage:
 *   const { sheetRef, dragHandleProps } = useMobileSheet({ onClose });
 *   <div ref={sheetRef} className="modal-card">
 *     <div {...dragHandleProps} className="sheet-drag-handle" />
 *     ...
 *   </div>
 * 
 * Behaviour:
 * - Dragging the sheet DOWN ≥ 80px closes it (calls onClose)
 * - Dragging UP is ignored (modal doesn't expand beyond content)
 * - Horizontal drags are ignored (so form inputs / horizontal scrolls work)
 */
export default function useMobileSheet({ onClose, disabled = false }) {
    const sheetRef  = useRef(null);
    const startY    = useRef(0);
    const startX    = useRef(0);
    const currentY  = useRef(0);
    const dragging  = useRef(false);
    const isTouch   = useRef(false);

    const isMobile = () => window.innerWidth <= 768;

    const onDragStart = useCallback((clientX, clientY) => {
        if (disabled || !isMobile()) return;
        startY.current   = clientY;
        startX.current   = clientX;
        currentY.current = 0;
        dragging.current = true;
        if (sheetRef.current) {
            sheetRef.current.style.transition = 'none';
        }
    }, [disabled]);

    const onDragMove = useCallback((clientX, clientY) => {
        if (!dragging.current || !sheetRef.current) return;
        const deltaX = Math.abs(clientX - startX.current);
        const deltaY = clientY - startY.current;
        // Ignore mostly-horizontal swipes (so horizontal form scroll works)
        if (deltaX > deltaY * 2 && Math.abs(deltaY) < 20) {
            dragging.current = false;
            sheetRef.current.style.transform = '';
            return;
        }
        // Only allow downward drag
        if (deltaY > 0) {
            currentY.current = deltaY;
            sheetRef.current.style.transform = `translateY(${deltaY}px)`;
            // Fade overlay based on drag distance
            const overlay = sheetRef.current.closest('.modal-overlay');
            if (overlay) {
                const opacity = Math.max(0, 1 - deltaY / 300);
                overlay.style.backgroundColor = `rgba(15, 23, 42, ${0.4 * opacity})`;
            }
        }
    }, []);

    const onDragEnd = useCallback(() => {
        if (!dragging.current || !sheetRef.current) return;
        dragging.current = false;
        const threshold = 80;
        if (currentY.current >= threshold) {
            // Animate out then close
            sheetRef.current.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 1, 1)';
            sheetRef.current.style.transform  = `translateY(100%)`;
            setTimeout(() => onClose && onClose(), 240);
        } else {
            // Snap back
            sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)';
            sheetRef.current.style.transform  = '';
            const overlay = sheetRef.current.closest('.modal-overlay');
            if (overlay) overlay.style.backgroundColor = '';
        }
        currentY.current = 0;
    }, [onClose]);

    // Touch events (mobile)
    const handleTouchStart = useCallback((e) => {
        isTouch.current = true;
        onDragStart(e.touches[0].clientX, e.touches[0].clientY);
    }, [onDragStart]);

    const handleTouchMove = useCallback((e) => {
        onDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }, [onDragMove]);

    const handleTouchEnd = useCallback(() => {
        onDragEnd();
    }, [onDragEnd]);

    // Attach move/end listeners globally (drag can leave the handle area)
    useEffect(() => {
        const moveHandler = (e) => {
            if (dragging.current && isTouch.current) {
                onDragMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        };
        const endHandler = () => {
            if (dragging.current && isTouch.current) {
                isTouch.current = false;
                onDragEnd();
            }
        };
        document.addEventListener('touchmove',  moveHandler, { passive: true });
        document.addEventListener('touchend',   endHandler,  { passive: true });
        document.addEventListener('touchcancel',endHandler,  { passive: true });
        return () => {
            document.removeEventListener('touchmove',   moveHandler);
            document.removeEventListener('touchend',    endHandler);
            document.removeEventListener('touchcancel', endHandler);
        };
    }, [onDragMove, onDragEnd]);

    const dragHandleProps = {
        onTouchStart: handleTouchStart,
        onTouchMove:  handleTouchMove,
        onTouchEnd:   handleTouchEnd,
        style: {
            touchAction: 'none',
            cursor:      'grab',
        },
    };

    return { sheetRef, dragHandleProps };
}
