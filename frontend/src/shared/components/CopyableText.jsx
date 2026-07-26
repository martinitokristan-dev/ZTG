import React, { useState } from 'react';
import { showToast } from '../../utils/toast';

export default function CopyableText({ 
    text, 
    label = '', 
    style = {}, 
    codeStyle = {},
    showIcon = true,
    customToast
}) {
    const [copied, setCopied] = useState(false);

    if (!text || text === '—' || text === 'N/A') {
        return <span style={{ color: '#94A3B8', fontSize: '12px', ...style }}>{text || '—'}</span>;
    }

    const handleCopy = (e) => {
        e.stopPropagation();
        const copyText = text.toString().trim();

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(copyText);
        } else {
            // Fallback for non-HTTPS or legacy browsers
            const textArea = document.createElement('textarea');
            textArea.value = copyText;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('Fallback copy failed:', err);
            }
            document.body.removeChild(textArea);
        }

        setCopied(true);
        showToast(customToast || `Copied ${label ? label + ' ' : ''}"${copyText}" to clipboard`);

        setTimeout(() => setCopied(false), 1600);
    };

    return (
        <span 
            onClick={handleCopy}
            title={`Click to copy ${label ? label + ' ' : ''}"${text}"`}
            style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '5px', 
                cursor: 'pointer',
                userSelect: 'none',
                verticalAlign: 'middle',
                ...style 
            }}
            className="copyable-text-btn"
        >
            <code style={{ 
                fontFamily: 'var(--font-mono, monospace)', 
                fontWeight: 700, 
                fontSize: '12px',
                color: 'inherit',
                ...codeStyle 
            }}>
                {text}
            </code>
            {showIcon && (
                <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: copied ? '#10B981' : '#94A3B8',
                    transition: 'all 0.15s ease',
                    flexShrink: 0
                }}>
                    {copied ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    )}
                </span>
            )}
        </span>
    );
}
