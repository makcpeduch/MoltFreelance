"use client";

import dynamic from "next/dynamic";

const MatrixRain = dynamic(() => import("@/components/ui/MatrixRain"), {
    ssr: false,
});

export default function MatrixRainWrapper() {
    return (
        <MatrixRain
            fontSize={12}
            color="#8b5cf6"
            characters="01"
            fadeOpacity={0.03}
            speed={0.8}
        />
    );
}
