import React, { useState, useRef, useEffect } from 'react';

export default function IOSTimePicker({ 
    value, 
    onChange, 
    placeholder = 'Select time', 
    required = false, 
    className = '', 
    style = {},
    openUpward = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropUp, setDropUp] = useState(openUpward);
    const containerRef = useRef(null);

    // Parse value (e.g. "14:30" or "09:15 AM")
    const parseTime = (val) => {
        if (!val) return { hour: '09', minute: '00', period: 'AM' };
        if (val.includes(':')) {
            const parts = val.split(':');
            let h = parseInt(parts[0], 10);
            let m = parseInt(parts[1], 10) || 0;
            let period = 'AM';
            if (h >= 12) {
                period = 'PM';
                if (h > 12) h -= 12;
            } else if (h === 0) {
                h = 12;
            }
            return {
                hour: String(h).padStart(2, '0'),
                minute: String(m).padStart(2, '0'),
                period: period
            };
        }
        return { hour: '09', minute: '00', period: 'AM' };
    };

    const timeState = parseTime(value);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleOpen = () => {
        if (!isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow < 280 || openUpward) {
                setDropUp(true);
            } else {
                setDropUp(false);
            }
        }
        setIsOpen(!isOpen);
    };

    const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
    const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

    const updateTime = (h, m, p) => {
        let hour24 = parseInt(h, 10);
        if (p === 'PM' && hour24 < 12) hour24 += 12;
        if (p === 'AM' && hour24 === 12) hour24 = 0;
        const formatted24 = `${String(hour24).padStart(2, '0')}:${m}`;
        onChange({ target: { value: formatted24 } });
    };

    const formatDisplay = (val) => {
        if (!val) return '';
        const { hour, minute, period } = parseTime(val);
        return `${hour}:${minute} ${period}`;
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', width: '100%', ...style }}>
            {/* Input Trigger */}
            <div
                onClick={handleToggleOpen}
                className={`ios-timepicker-trigger ${className}`}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    border: isOpen ? '1.5px solid #3B82F6' : '1px solid #CBD5E1',
                    borderRadius: '10px',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: value ? '#0F172A' : '#94A3B8',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Outfit", sans-serif',
                    boxShadow: isOpen ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s ease',
                    minHeight: '38px',
                    boxSizing: 'border-box',
                }}
            >
                <span>{value ? formatDisplay(value) : placeholder}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8, flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            </div>

            {/* Hidden input for form validation */}
            <input type="hidden" value={value || ''} required={required} />

            {/* iOS Time Picker Popover Card */}
            {isOpen && (
                <div
                    className="ios-time-popover"
                    style={{
                        position: 'absolute',
                        ...(dropUp ? { bottom: 'calc(100% + 8px)' } : { top: 'calc(100% + 8px)' }),
                        left: 0,
                        zIndex: 99999,
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 16px 36px -4px rgba(15, 23, 42, 0.18), 0 6px 16px rgba(0, 0, 0, 0.08)',
                        padding: '16px',
                        width: '260px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Outfit", sans-serif',
                        userSelect: 'none',
                    }}
                >
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '12px', textAlign: 'center' }}>
                        Select Time
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                        {/* Hours */}
                        <div style={{ flex: 1, maxHeight: '150px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '4px' }}>
                            {hours.map(h => (
                                <div
                                    key={h}
                                    onClick={() => updateTime(h, timeState.minute, timeState.period)}
                                    style={{
                                        padding: '6px 0',
                                        textAlign: 'center',
                                        fontSize: '13px',
                                        fontWeight: timeState.hour === h ? 700 : 500,
                                        color: timeState.hour === h ? '#3B82F6' : '#1E293B',
                                        backgroundColor: timeState.hour === h ? '#EBF5FF' : 'transparent',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        marginBottom: '2px',
                                    }}
                                >
                                    {h}
                                </div>
                            ))}
                        </div>

                        <span style={{ fontWeight: 700, fontSize: '16px', color: '#64748B' }}>:</span>

                        {/* Minutes */}
                        <div style={{ flex: 1, maxHeight: '150px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '4px' }}>
                            {minutes.map(m => (
                                <div
                                    key={m}
                                    onClick={() => updateTime(timeState.hour, m, timeState.period)}
                                    style={{
                                        padding: '6px 0',
                                        textAlign: 'center',
                                        fontSize: '13px',
                                        fontWeight: timeState.minute === m ? 700 : 500,
                                        color: timeState.minute === m ? '#3B82F6' : '#1E293B',
                                        backgroundColor: timeState.minute === m ? '#EBF5FF' : 'transparent',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        marginBottom: '2px',
                                    }}
                                >
                                    {m}
                                </div>
                            ))}
                        </div>

                        {/* AM/PM Toggle */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {['AM', 'PM'].map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => updateTime(timeState.hour, timeState.minute, p)}
                                    style={{
                                        border: 'none',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        backgroundColor: timeState.period === p ? '#3B82F6' : '#F1F5F9',
                                        color: timeState.period === p ? '#FFFFFF' : '#64748B',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        style={{
                            width: '100%',
                            padding: '8px 0',
                            backgroundColor: '#3B82F6',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer',
                        }}
                    >
                        Done
                    </button>
                </div>
            )}
        </div>
    );
}
