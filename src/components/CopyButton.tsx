'use client';

import { useState } from 'react';

export default function CopyButton({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!code) return;
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            style={{ 
                width: '100%', 
                padding: '1rem', 
                backgroundColor: copied ? '#993556' : '#D4537E',
                color: 'white',
                fontWeight: '600',
                borderRadius: '1rem',
                border: 'none',
                cursor: 'pointer',
                marginTop: '1.5rem',
                transition: 'all 0.2s ease'
            }}
        >
            {copied ? '✅ Código Copiado!' : '📋 Copiar código'}
        </button>
    );
}
