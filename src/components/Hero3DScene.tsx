import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, Torus, Icosahedron } from "@react-three/drei";
import * as THREE from "three";

// ─── Floating Medical Orb ───
function GlowOrb({ position, color, size = 0.3, speed = 1 }: {
  position: [number, number, number];
  color: string;
  size?: number;
  speed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.4;
    meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * speed * 0.7) * 0.2;
  });

  return (
    <Float speed={speed * 2} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.6}
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

// ─── DNA Double Helix ───
function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null);
  const particleCount = 30;

  const particles = useMemo(() => {
    const items = [];
    for (let i = 0; i < particleCount; i++) {
      const t = (i / particleCount) * Math.PI * 4;
      const radius = 1.2;
      // Strand 1
      items.push({
        pos: [Math.cos(t) * radius, (i / particleCount) * 6 - 3, Math.sin(t) * radius] as [number, number, number],
        color: "#7B6FE0",
        strand: 1,
      });
      // Strand 2
      items.push({
        pos: [Math.cos(t + Math.PI) * radius, (i / particleCount) * 6 - 3, Math.sin(t + Math.PI) * radius] as [number, number, number],
        color: "#3DDC97",
        strand: 2,
      });
    }
    return items;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={0.5}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
      {/* Connection bars between strands */}
      {Array.from({ length: Math.floor(particleCount / 3) }).map((_, i) => {
        const idx = i * 3;
        const t = (idx / particleCount) * Math.PI * 4;
        const y = (idx / particleCount) * 6 - 3;
        const radius = 1.2;
        const x1 = Math.cos(t) * radius;
        const z1 = Math.sin(t) * radius;
        const x2 = Math.cos(t + Math.PI) * radius;
        const z2 = Math.sin(t + Math.PI) * radius;
        const midX = (x1 + x2) / 2;
        const midZ = (z1 + z2) / 2;
        const length = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
        const angle = Math.atan2(z2 - z1, x2 - x1);
        return (
          <mesh key={`bar-${i}`} position={[midX, y, midZ]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[length, 0.02, 0.02]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Floating Ring ───
function FloatingRing({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.5;
      ref.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1}>
      <mesh ref={ref} position={position}>
        <torusGeometry args={[0.5, 0.08, 16, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </Float>
  );
}

// ─── Molecular Cross ───
function MolecularCross({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.4;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={ref} position={position}>
        {/* Center sphere */}
        <mesh>
          <icosahedronGeometry args={[0.2, 1]} />
          <MeshWobbleMaterial
            color="#FF6B8A"
            emissive="#FF6B8A"
            emissiveIntensity={0.4}
            transparent
            opacity={0.7}
            factor={0.3}
            speed={2}
          />
        </mesh>
        {/* Arms */}
        {[
          [0.5, 0, 0],
          [-0.5, 0, 0],
          [0, 0.5, 0],
          [0, -0.5, 0],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color="#FFB830"
              emissive="#FFB830"
              emissiveIntensity={0.3}
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// ─── Ambient Particles ───
function AmbientParticles({ count = 80 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#7B6FE0"
        size={0.04}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Main 3D Scene ───
function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} color="#ffffff" />
      <pointLight position={[-3, 3, 2]} intensity={0.8} color="#7B6FE0" />
      <pointLight position={[3, -2, -3]} intensity={0.5} color="#3DDC97" />

      {/* DNA Helix - center piece */}
      <DNAHelix />

      {/* Floating orbs */}
      <GlowOrb position={[-3, 1.5, -1]} color="#0A2463" size={0.4} speed={0.8} />
      <GlowOrb position={[3.5, -0.5, -2]} color="#3DDC97" size={0.35} speed={1.2} />
      <GlowOrb position={[-2, -2, 0]} color="#7B6FE0" size={0.25} speed={1} />
      <GlowOrb position={[2.5, 2, -1.5]} color="#FFB830" size={0.2} speed={1.5} />
      <GlowOrb position={[-4, 0, -2]} color="#FF6B8A" size={0.15} speed={0.9} />

      {/* Floating rings */}
      <FloatingRing position={[4, 1, -3]} color="#7B6FE0" />
      <FloatingRing position={[-3.5, -1.5, -2]} color="#3DDC97" />

      {/* Molecular structure */}
      <MolecularCross position={[-4.5, 2.5, -2]} />

      {/* Ambient particles */}
      <AmbientParticles count={100} />
    </>
  );
}

export function Hero3DScene() {
  return (
    <div className="hero-3d-canvas">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
