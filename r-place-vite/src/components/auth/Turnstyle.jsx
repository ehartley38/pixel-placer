import React, { useEffect, useRef } from 'react';

const Turnstile = ({ siteKey, onVerify }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (window.turnstile) {
            window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                callback: onVerify,
            });
        }
    }, [siteKey, onVerify]);

    return <div ref={containerRef}></div>;
};

export default Turnstile;
