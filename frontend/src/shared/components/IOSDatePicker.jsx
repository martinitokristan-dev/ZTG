import React, { useState, useRef, useEffect } from 'react';

export default function IOSDatePicker({ value, onChange, placeholder = 'Select date', required = false, className = '', style = {}, alignRight = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Selected date object
    const selectedDate = value ? new Date(value + 'T00:00:00') : null;

    // View month & year state
    const [viewDate, setViewDate] = useState(() => selectedDate || new Date());

    useEffect(() => {
        if (value) {
            const d = new Date(value + 'T00:00:00');
            if (!isNaN(d.getTime())) setViewDate(d);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

    // Generate days for calendar grid
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => daysInPrevMonth - firstDayOfMonth + i + 1);
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const totalGridSlots = prevMonthDays.length + currentMonthDays.length;
    const nextMonthDays = Array.from({ length: (42 - totalGridSlots) % 7 }, (_, i) => i + 1);

    const prevMonth = () => setViewDate(new Date(viewYear, viewMonth - 1, 1));
    const nextMonth = () => setViewDate(new Date(viewYear, viewMonth + 1, 1));

    const handleSelectDay = (day) => {
        const m = String(viewMonth + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        const formatted = `${viewYear}-${m}-${d}`;
        onChange({ target: { value: formatted } });
        setIsOpen(false);
    };

    const handleToday = () => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        const formatted = `${y}-${m}-${d}`;
        setViewDate(today);
        onChange({ target: { value: formatted } });
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange({ target: { value: '' } });
        setIsOpen(false);
    };

    // Format display string
    const formatDisplay = (val) => {
        if (!val) return '';
        const d = new Date(val + 'T00:00:00');
        if (isNaN(d.getTime())) return val;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const isToday = (day) => {
        const today = new Date();
        return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
    };

    const isSelected = (day) => {
        if (!selectedDate) return false;
        return selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === day;
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', width: '100%', ...style }}>
            {/* Input Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`ios-datepicker-trigger ${className}`}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: value ? '#0F172A' : '#94A3B8',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Outfit", sans-serif',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s ease',
                    minHeight: '38px',
                    boxSizing: 'border-box',
                }}
            >
                <span>{value ? formatDisplay(value) : placeholder}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8, flexShrink: 0 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            </div>

            {/* Hidden native input for form compatibility */}
            <input type="hidden" value={value || ''} required={required} />

            {/* iOS Calendar Card Popover */}
            {isOpen && (
                <div
                    className="ios-calendar-popover"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: alignRight ? 'auto' : 0,
                        right: alignRight ? 0 : 'auto',
                        zIndex: 9999,
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(0, 0, 0, 0.06)',
                        padding: '16px',
                        width: '280px',
                        maxWidth: 'calc(100vw - 32px)',
                        boxSizing: 'border-box',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Outfit", sans-serif',
                        userSelect: 'none',
                    }}
                >
                    {/* Header: Month & Year + Nav Chevrons */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                            {monthNames[viewMonth]} {viewYear}
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                                type="button"
                                onClick={prevMonth}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: '8px', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <button
                                type="button"
                                onClick={nextMonth}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: '8px', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                    </div>

                    {/* Day Name Headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px' }}>
                        {dayNames.map((d) => (
                            <span key={d} style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.5px' }}>{d}</span>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
                        {prevMonthDays.map((d) => (
                            <span key={`prev-${d}`} style={{ padding: '8px 0', fontSize: '13px', color: '#CBD5E1', cursor: 'default' }}>{d}</span>
                        ))}
                        {currentMonthDays.map((d) => {
                            const active = isSelected(d);
                            const today = isToday(d);
                            return (
                                <button
                                    key={`curr-${d}`}
                                    type="button"
                                    onClick={() => handleSelectDay(d)}
                                    style={{
                                        border: 'none',
                                        background: active ? '#3B82F6' : 'transparent',
                                        color: active ? '#FFFFFF' : (today ? '#3B82F6' : '#0F172A'),
                                        fontWeight: active || today ? 700 : 500,
                                        fontSize: '13px',
                                        width: '32px',
                                        height: '32px',
                                        margin: 'auto',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        boxShadow: active ? '0 4px 10px rgba(59, 130, 246, 0.35)' : 'none',
                                    }}
                                >
                                    {d}
                                </button>
                            );
                        })}
                        {nextMonthDays.map((d) => (
                            <span key={`next-${d}`} style={{ padding: '8px 0', fontSize: '13px', color: '#CBD5E1', cursor: 'default' }}>{d}</span>
                        ))}
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                        <button
                            type="button"
                            onClick={handleClear}
                            style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={handleToday}
                            style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
