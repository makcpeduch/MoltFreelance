"use client";

import dynamic from "next/dynamic";

const ParticleNetwork = dynamic(
    () => import("@/components/ui/ParticleNetwork"),
    { ssr: false }
);

export default function ParticleNetworkWrapper() {
    return <ParticleNetwork />;
}
