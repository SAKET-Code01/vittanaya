import React, { useState, useEffect, useRef, useId } from 'react';

/**
 * SearchableLocationSelect Component
 * 
 * Reusable accessible location selector supporting:
 * - Search as you type
 * - Click and keyboard navigation (Up, Down, Enter, Escape)
 * - Clear selection button
 * - Disabled state before parent selection
 * - Custom input fallback if unlisted
 * - Touch-friendly 44px minimum target sizes
 */
export default function SearchableLocationSelect({
  label,
  required = false,
  value = '',
  placeholder = 'Select or type...',
  loadOptions,
  parentSelected = true,
  parentName = 'Parent',
  onChange,
  onClear,
  error = null,
  helperText = '',
  className = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [options, setOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputId = useId();

  // Sync internal search term with external value changes
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Load options from service whenever parent is selected
  useEffect(() => {
    let isMounted = true;

    async function fetchOptions() {
      if (!parentSelected || disabled || typeof loadOptions !== 'function') {
        setOptions([]);
        setFilteredOptions([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await loadOptions();
        if (isMounted) {
          setOptions(data || []);
          setFilteredOptions(data || []);
        }
      } catch (err) {
        console.error('Error fetching location options:', err);
        if (isMounted) {
          setOptions([]);
          setFilteredOptions([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchOptions();

    return () => {
      isMounted = false;
    };
  }, [loadOptions, parentSelected, disabled]);

  // Filter options based on user typing
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(options);
      return;
    }

    const query = searchTerm.toLowerCase().trim();
    const filtered = options.filter(
      (opt) =>
        opt.name.toLowerCase().includes(query) ||
        (opt.id && opt.id.toLowerCase().includes(query))
    );
    setFilteredOptions(filtered);
    setHighlightedIndex(filtered.length > 0 ? 0 : -1);
  }, [searchTerm, options]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        // If user left without picking an option and value was already selected, revert input text to value
        if (value && searchTerm !== value) {
          setSearchTerm(value);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, searchTerm]);

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    if (disabled || !parentSelected) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (searchTerm.trim()) {
          // Allow custom entry on Enter if not in list
          handleCustomSelect(searchTerm.trim());
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelect = (option) => {
    setSearchTerm(option.name);
    setIsOpen(false);
    if (typeof onChange === 'function') {
      onChange(option);
    }
  };

  const handleCustomSelect = (customName) => {
    setSearchTerm(customName);
    setIsOpen(false);
    if (typeof onChange === 'function') {
      onChange({
        id: `CUSTOM_${customName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`,
        name: customName,
        isCustom: true,
      });
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSearchTerm('');
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (typeof onClear === 'function') {
      onClear();
    }
  };

  const isFieldDisabled = disabled || !parentSelected;

  return (
    <div ref={containerRef} className={`relative flex flex-col ${className}`}>
      {/* Label and Helper info */}
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={inputId}
          className="text-xs font-bold text-slate-700 flex items-center gap-1"
        >
          <span>{label}</span>
          {required && <span className="text-rose-500 font-black">*</span>}
        </label>
        {helperText && (
          <span className="text-[10px] text-slate-400 font-medium">{helperText}</span>
        )}
      </div>

      {/* Input Field Container */}
      <div className="relative flex items-center">
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          value={searchTerm}
          disabled={isFieldDisabled}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (!isFieldDisabled) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={isFieldDisabled ? `Select ${parentName} first` : placeholder}
          autoComplete="off"
          className={`w-full min-h-[44px] px-3.5 pr-16 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
            isFieldDisabled
              ? 'bg-slate-100/80 text-slate-400 border-slate-200 cursor-not-allowed select-none'
              : error
              ? 'bg-white text-slate-900 border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : isOpen
              ? 'bg-white text-slate-900 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
          }`}
        />

        {/* Right side controls: Loading / Clear / Dropdown Chevron */}
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {isLoading && (
            <svg className="animate-spin h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}

          {!isFieldDisabled && searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Clear selection"
              aria-label="Clear location"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <button
            type="button"
            disabled={isFieldDisabled}
            onClick={() => !isFieldDisabled && setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors disabled:cursor-not-allowed"
            tabIndex={-1}
            aria-hidden="true"
          >
            <svg
              className={`w-3.5 h-3.5 transform transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-blue-600' : ''
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Inline Validation Error */}
      {error && (
        <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
          <span>⚠</span>
          <span>{error}</span>
        </p>
      )}

      {/* Floating Suggestions Dropdown */}
      {isOpen && !isFieldDisabled && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 backdrop-blur-md animate-fadeIn"
          style={{ width: '100%' }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => {
              const isSelected = opt.name.toLowerCase() === value.toLowerCase();
              const isHighlighted = idx === highlightedIndex;
              return (
                <div
                  key={opt.id || opt.name}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : isHighlighted
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-400 text-xs">📍</span>
                    <span className="truncate">{opt.name}</span>
                  </div>
                  {opt.code && (
                    <span className="text-[10px] font-mono text-slate-400 ml-2 uppercase">
                      Code {opt.code}
                    </span>
                  )}
                  {isSelected && (
                    <span className="text-blue-600 text-xs font-black">✓</span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-3 text-center">
              <p className="text-xs text-slate-500">
                No matching locations found for &ldquo;<span className="font-semibold text-slate-800">{searchTerm}</span>&rdquo;
              </p>
              {searchTerm.trim() && (
                <button
                  type="button"
                  onClick={() => handleCustomSelect(searchTerm.trim())}
                  className="mt-2 w-full px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Use &ldquo;{searchTerm.trim()}&rdquo; as custom {label.replace('*', '').trim()}</span>
                  <span>↵</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
