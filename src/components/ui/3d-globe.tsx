"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

export type GlobeMarker = {
  lat: number;
  lng: number;
  src?: string;
  label?: string;
  size?: number;
};

export type Globe3DConfig = {
  radius?: number;
  textureUrl?: string;
  globeColor?: string;
  wireColor?: string;
  markerColor?: string;
  atmosphereColor?: string;
  atmosphereIntensity?: number;
  bumpScale?: number;
  autoRotateSpeed?: number;
};

const DEFAULT_CONFIG: Required<Omit<Globe3DConfig, "bumpScale" | "textureUrl">> = {
  radius: 2,
  globeColor: "#0f2b24",
  wireColor: "#2f7d68",
  markerColor: "#7fc4b4",
  atmosphereColor: "#4da6ff",
  atmosphereIntensity: 6,
  autoRotateSpeed: 0.3,
};

// India faces the camera at start; the globe keeps spinning from there.
const INITIAL_ROTATION_Y = THREE.MathUtils.degToRad(-170);

function latLngToVector3(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function Marker({
  marker,
  radius,
  color,
  onClick,
  onHover,
}: {
  marker: GlobeMarker;
  radius: number;
  color: string;
  onClick?: (marker: GlobeMarker) => void;
  onHover?: (marker: GlobeMarker | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);
  const position = useMemo(() => latLngToVector3(marker.lat, marker.lng, radius * 1.015), [marker.lat, marker.lng, radius]);
  const baseSize = marker.size ?? 0.032;
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!glowRef.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 1.6 + phase) * 0.18;
    glowRef.current.scale.setScalar(pulse);
  });

  return (
    <group position={position}>
      <mesh
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(true);
          onHover?.(marker);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(false);
          onHover?.(null);
          document.body.style.cursor = "auto";
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onClick?.(marker);
        }}
      >
        <sphereGeometry args={[hovered ? baseSize * 1.4 : baseSize, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[baseSize * 2, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.4 : 0.22} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function EarthSurface({ radius, textureUrl }: { radius: number; textureUrl: string }) {
  const texture = useLoader(THREE.TextureLoader, textureUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial map={texture} roughness={0.85} metalness={0} />
    </mesh>
  );
}

function Scene({
  markers,
  config,
  onMarkerClick,
  onMarkerHover,
}: {
  markers: GlobeMarker[];
  config: Required<Omit<Globe3DConfig, "bumpScale" | "textureUrl">> & { textureUrl?: string };
  onMarkerClick?: (marker: GlobeMarker) => void;
  onMarkerHover?: (marker: GlobeMarker | null) => void;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * config.autoRotateSpeed;
  });

  return (
    <>
      <ambientLight intensity={config.textureUrl ? 1.1 : 0.8} />
      <directionalLight position={[4, 3.5, 4]} intensity={config.textureUrl ? 1.2 : 0.6} />
      <group ref={group} rotation={[0, INITIAL_ROTATION_Y, 0]}>
        {config.textureUrl ? (
          <Suspense
            fallback={
              <mesh>
                <sphereGeometry args={[config.radius, 64, 64]} />
                <meshStandardMaterial color={config.globeColor} roughness={0.9} metalness={0} />
              </mesh>
            }
          >
            <EarthSurface radius={config.radius} textureUrl={config.textureUrl} />
          </Suspense>
        ) : (
          <>
            <mesh>
              <sphereGeometry args={[config.radius, 64, 64]} />
              <meshStandardMaterial color={config.globeColor} roughness={0.9} metalness={0} emissive={config.markerColor} emissiveIntensity={0.04} />
            </mesh>
            <mesh>
              <sphereGeometry args={[config.radius * 1.003, 18, 10]} />
              <meshBasicMaterial color={config.wireColor} wireframe transparent opacity={0.28} />
            </mesh>
          </>
        )}
        {markers.map((m, i) => (
          <Marker key={`${m.lat}-${m.lng}-${i}`} marker={m} radius={config.radius} color={config.markerColor} onClick={onMarkerClick} onHover={onMarkerHover} />
        ))}
      </group>
      <mesh scale={config.textureUrl ? 1.045 : 1.22}>
        <sphereGeometry args={[config.radius, 48, 48]} />
        <meshBasicMaterial
          color={config.atmosphereColor}
          transparent
          opacity={Math.min(config.atmosphereIntensity / (config.textureUrl ? 90 : 45), config.textureUrl ? 0.55 : 0.32)}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <OrbitControls enablePan={false} enableZoom={false} rotateSpeed={0.5} />
    </>
  );
}

export function Globe3D({
  markers = [],
  config,
  onMarkerClick,
  onMarkerHover,
  className,
  paused = false,
}: {
  paused?: boolean;
  markers?: GlobeMarker[];
  config?: Globe3DConfig;
  onMarkerClick?: (marker: GlobeMarker) => void;
  onMarkerHover?: (marker: GlobeMarker | null) => void;
  className?: string;
}) {
  const merged: Required<Omit<Globe3DConfig, "bumpScale" | "textureUrl">> & { textureUrl?: string } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [2.8, 2.4, 6.0], fov: 38 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, powerPreference: "low-power" }}
        frameloop={paused ? "never" : "always"}
      >
        <Scene markers={markers} config={merged} onMarkerClick={onMarkerClick} onMarkerHover={onMarkerHover} />
      </Canvas>
    </div>
  );
}
