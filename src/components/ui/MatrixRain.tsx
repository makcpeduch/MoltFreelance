"use client";

import { useRef, useEffect } from "react";

interface MatrixRainProps {
    fontSize?: number;
    color?: string;
    characters?: string;
    fadeOpacity?: number;
    speed?: number;
}

export default function MatrixRain({
    fontSize = 14,
    color = "#8b5cf6",
    characters = "01",
    fadeOpacity = 0.05,
    speed = 1,
}: MatrixRainProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const parent = canvas.parentElement;

        const resizeCanvas = () => {
            const w = parent ? parent.clientWidth : window.innerWidth;
            const h = parent ? parent.clientHeight : window.innerHeight;
            canvas.width = w;
            canvas.height = h;
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        const chars = characters.split("");
        const drops: number[] = [];
        const columnCount = Math.floor(canvas.width / fontSize);

        for (let i = 0; i < columnCount; i++) {
            drops[i] = Math.random() * -100;
        }

        const draw = () => {
            ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = color;
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(char, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i] += speed;
            }
        };

        const interval = setInterval(draw, 33 / speed);

        return () => {
            clearInterval(interval);
            window.removeEventListener("resize", resizeCanvas);
        };
    }, [fontSize, color, characters, fadeOpacity, speed]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
        />
    );
}
