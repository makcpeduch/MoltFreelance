"use client";

import { useEffect, useRef } from "react";

/*
 * ParticleNetwork — lightweight HTML5 Canvas background
 * –  Neon-teal dots slowly drift & bounce off viewport edges
 * –  Nearby dots connect with opacity-faded lines
 * –  Mouse cursor acts as a super-node (larger capture radius)
 * –  Mobile-friendly: halves particle count on < 768 px
 * –  pointer-events: none on <canvas>; listener on window
 */

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
}

const BRAND = { r: 30, g: 235, b: 183 };          // #1EEBB7
const LINE_DIST = 120;                              // px – particle↔particle
const MOUSE_DIST = 150;                             // px – mouse↔particle
const BASE_COUNT = 90;                              // full-screen density
const SPEED = 0.25;                                 // very slow drift

export default function ParticleNetwork() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;

        /* ── state ─────────────────────────────────────── */
        let particles: Particle[] = [];
        let mouse = { x: -9999, y: -9999 };
        let animId = 0;
        let W = 0;
        let H = 0;

        /* ── helpers ───────────────────────────────────── */
        const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

        function createParticles() {
            const count = window.innerWidth < 768 ? Math.floor(BASE_COUNT / 2) : BASE_COUNT;
            particles = Array.from({ length: count }, () => ({
                x: rand(0, W),
                y: rand(0, H),
                vx: rand(-SPEED, SPEED),
                vy: rand(-SPEED, SPEED),
                r: rand(1.5, 2),
            }));
        }

        function resize() {
            if (!canvas) return;
            const parent = canvas.parentElement;
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            W = rect.width;
            H = rect.height;
            canvas.width = W * devicePixelRatio;
            canvas.height = H * devicePixelRatio;
            canvas.style.width = `${W}px`;
            canvas.style.height = `${H}px`;
            ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
            createParticles();
        }

        /* ── draw loop ─────────────────────────────────── */
        function draw() {
            ctx.clearRect(0, 0, W, H);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                /* move */
                p.x += p.vx;
                p.y += p.vy;

                /* bounce */
                if (p.x < 0 || p.x > W) p.vx *= -1;
                if (p.y < 0 || p.y > H) p.vy *= -1;

                /* draw dot */
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.7)`;
                ctx.fill();

                /* lines between dots */
                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j];
                    const dx = p.x - q.x;
                    const dy = p.y - q.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < LINE_DIST) {
                        const alpha = 1 - dist / LINE_DIST;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.strokeStyle = `rgba(${BRAND.r},${BRAND.g},${BRAND.b},${(alpha * 0.35).toFixed(3)})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }

                /* lines to mouse */
                const mdx = p.x - mouse.x;
                const mdy = p.y - mouse.y;
                const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (mDist < MOUSE_DIST) {
                    const alpha = 1 - mDist / MOUSE_DIST;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(${BRAND.r},${BRAND.g},${BRAND.b},${(alpha * 0.6).toFixed(3)})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }

            animId = requestAnimationFrame(draw);
        }

        /* ── listeners ─────────────────────────────────── */
        function onMouseMove(e: MouseEvent) {
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        }
        function onMouseLeave() {
            mouse.x = -9999;
            mouse.y = -9999;
        }
        function onTouchMove(e: TouchEvent) {
            if (e.touches.length) {
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
            }
        }
        function onTouchEnd() {
            mouse.x = -9999;
            mouse.y = -9999;
        }

        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseleave", onMouseLeave);
        window.addEventListener("touchmove", onTouchMove, { passive: true });
        window.addEventListener("touchend", onTouchEnd);

        resize();
        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseleave", onMouseLeave);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchEnd);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
            }}
        />
    );
}
