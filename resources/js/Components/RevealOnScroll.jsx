import { useEffect, useRef, useState } from 'react';

export default function RevealOnScroll({ children, className = '', delay = 0 }) {
    const [isVisible, setIsVisible] = useState(false);
    const [direction, setDirection] = useState('up'); // 'up' (fade-in-up) or 'down' (fade-in-down)
    const ref = useRef(null);
    const lastY = useRef(0);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                const currentY = entry.boundingClientRect.y;
                const isIntersecting = entry.isIntersecting;

                if (isIntersecting) {
                    // If currentY < lastY.current, we are scrolling DOWN (element moving up)
                    // If currentY > lastY.current, we are scrolling UP (element moving down)

                    // Actually, let's simplify:
                    // If we enter and currentY is POSITIVE (bottom of screen), we are scrolling DOWN.
                    // If we enter and currentY is NEGATIVE or close to 0 (top of screen), we are scrolling UP.

                    if (currentY > 0) {
                        setDirection('up'); // Fade In Up (Standard)
                    } else {
                        setDirection('down'); // Fade In Down (From Top)
                    }
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }

                lastY.current = currentY;
            },
            {
                threshold: 0.1,
                rootMargin: '-50px 0px -50px 0px'
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.disconnect();
            }
        };
    }, []);

    const getDelayClass = () => {
        if (!delay) return '';
        return `animation-delay-${delay}`;
    };

    const getAnimationClass = () => {
        return direction === 'up' ? 'animate-fade-in-up' : 'animate-fade-in-down';
    };

    return (
        <div
            ref={ref}
            className={`${className} transition-opacity duration-500 ${isVisible ? `${getAnimationClass()} ${getDelayClass()}` : 'opacity-0'}`}
        >
            {children}
        </div>
    );
}
