import { useEffect, useRef, useState } from 'react';

/**
 * FadeUp — animasi muncul dari bawah saat mount / saat masuk viewport.
 *
 * Props:
 *  - delay   : delay dalam ms (default 0)
 *  - duration: durasi dalam ms (default 500)
 *  - y       : jarak geser awal dalam px (default 24)
 *  - once    : jika true (default), animasi hanya sekali saat mount
 *              jika false, animasi ulang setiap masuk viewport (IntersectionObserver)
 *  - className: class tambahan untuk wrapper div
 */
export default function FadeUp({
    children,
    delay    = 0,
    duration = 600,
    y        = 24,
    once     = true,
    className = '',
}) {
    const [visible, setVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (once) {
            // Trigger animasi setelah mount, dengan delay
            const t = setTimeout(() => setVisible(true), delay);
            return () => clearTimeout(t);
        }

        // Mode scroll: IntersectionObserver
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setVisible(true);
            },
            { threshold: 0.1, rootMargin: '-30px 0px -30px 0px' }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [delay, once]);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity   : visible ? 1 : 0,
                transform : visible ? 'translateY(0px)' : `translateY(${y}px)`,
                transition: `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${once ? 0 : delay}ms, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${once ? 0 : delay}ms`,
                // Saat mode once, delay sudah ditangani setTimeout (setVisible),
                // jadi transition tidak perlu delay lagi.
            }}
        >
            {children}
        </div>
    );
}
