import React from 'react';

function Button({ children, type = 'button', onClick, className = '', variant = 'primary', disabled = false, style }) {
    const getVariantClasses = () => {
        switch (variant) {
            case 'primary':
                return 'bg-accent-primary hover:bg-accent-hover text-white focus:ring-2 focus:ring-accent-primary/50';
            case 'danger':
                return 'bg-danger hover:bg-danger/90 text-white focus:ring-2 focus:ring-danger/50';
            case 'secondary':
                return 'bg-canvas hover:bg-border-primary/50 text-text-secondary border border-border-primary';
            default:
                return 'bg-accent-primary text-white';
        }
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={style}
            className={`px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 cursor-pointer text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClasses()} ${className}`}
        >
            {children}
        </button>
    );
}

export default Button;
