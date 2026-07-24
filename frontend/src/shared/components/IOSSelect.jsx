import React, { useState, useRef, useEffect } from 'react';

export default function IOSSelect({ value, onChange, options = [], placeholder = 'Select option', className = '', style = {}, disabled = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Format options as array of objects { value, label }
    const normalizedOptions = options.map(opt => {
        if (typeof opt === 'object' && opt !== null) {
            return { value: String(opt.value), label: String(opt.label || opt.value) };
        }
        return { value: String(opt), label: String(opt) };
    });

    const selectedOption = normalizedOptions.find(opt => opt.value === String(value)) || null;

    const handleSelect = (optValue) => {
        if (disabled) return;
        onChange({ target: { value: optValue } });
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', width: '100%', minWidth: 0, ...style }}>
            {/* Trigger Button matching iOS reference image */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`ios-select-trigger ${className}`}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '9px 14px',
                    border: isOpen ? '1px solid #3B82F6' : '1px solid #CBD5E1',
                    borderRadius: '12px',
                    backgroundColor: disabled ? '#F8FAFC' : '#FFFFFF',
                    color: selectedOption ? '#0F172A' : '#64748B',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Outfit", sans-serif',
                    boxShadow: isOpen ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
                    cursor: disabled ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '38px',
                    boxSizing: 'border-box',
                    textAlign: 'left',
                }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, paddingRight: 8 }}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0,
                    }}
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>

            {/* iOS Floating Popover Menu matching Reference Image */}
            {isOpen && (
                <div
                    className="ios-select-menu"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        right: 0,
                        zIndex: 9999,
                        backgroundColor: '#FFFFFF',
                        borderRadius: '14px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                        padding: '6px',
                        maxHeight: '260px',
                        overflowY: 'auto',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Outfit", sans-serif',
                        boxSizing: 'border-box',
                    }}
                >
                    {normalizedOptions.length === 0 ? (
                        <div style={{ padding: '10px 14px', fontSize: '13px', color: '#94A3B8', textAlign: 'center' }}>
                            No options available
                        </div>
                    ) : (
                        normalizedOptions.map((opt) => {
                            const isSelected = opt.value === String(value);
                            return (
                                <div
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '10px 12px',
                                        borderRadius: '10px',
                                        backgroundColor: isSelected ? '#F0F7FF' : 'transparent',
                                        color: isSelected ? '#2563EB' : '#1E293B',
                                        fontSize: '13px',
                                        fontWeight: isSelected ? 700 : 500,
                                        cursor: 'pointer',
                                        transition: 'background-color 0.15s ease',
                                        marginBottom: '2px',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                                        {opt.label}
                                    </span>
                                    {isSelected && (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
