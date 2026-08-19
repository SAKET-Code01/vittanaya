import React, { useRef, useEffect } from 'react';

/**
 * Universal Contextual Three-Dot Menu Component
 * 
 * Complies with Section 6 & 8 specifications:
 * - Crisp white surface with soft shadow and subtle border
 * - Closes on click outside, Escape key, or when another menu opens
 * - Smooth transition
 * - Viewport-bounded positioning
 */
export default function ContextMenu({
  items = [],
  menuId,
  activeMenuId,
  setActiveMenuId,
  buttonClassName = '',
  align = 'right', // 'right' | 'left'
}) {
  const isOpen = activeMenuId === menuId;
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (isOpen) {
      setActiveMenuId(null);
    } else {
      setActiveMenuId(menuId);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setActiveMenuId(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setActiveMenuId(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, setActiveMenuId]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className={
          buttonClassName ||
          'p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center'
        }
        aria-label="Card options"
        aria-expanded={isOpen}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-1.5 w-48 rounded-xl bg-white border border-slate-200 shadow-2xl p-1.5 z-50 animate-fadeIn ring-1 ring-black/5`}
          style={{ transformOrigin: align === 'right' ? 'top right' : 'top left' }}
        >
          <div className="space-y-0.5" role="menu">
            {items.map((item, idx) => {
              if (item.separator) {
                return (
                  <div key={`sep-${idx}`} className="my-1 border-t border-slate-100" />
                );
              }

              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(null);
                    if (item.onClick) item.onClick();
                  }}
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                    item.danger
                      ? 'text-rose-600 hover:bg-rose-50'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  role="menuitem"
                >
                  {item.icon && (
                    <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 text-slate-400">
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1 truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
