"use client";

import React from "react";
import ElectricalCalculator from "@/components/Eleccalc";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

const Page = () => {
  return (
    <div className="relative min-h-screen">
      {/* Dotted Glow Background */}
      <DottedGlowBackground
        className="-z-5"
        gap={20}
        radius={1.5}
        color="rgba(97, 68, 10, 0.3)"
        darkColor="rgba(233, 212, 179, 0.2)"
        glowColor="rgba(163, 168, 92, 0.7)"
        darkGlowColor="rgba(139, 144, 110, 0.8)"
        opacity={0.5}
        speedMin={0.3}
        speedMax={1.0}
        speedScale={0.8}
      />
      <ElectricalCalculator />
    </div>
  );
};

export default Page;
