<<<<<<< Updated upstream
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';

function AnimatedSphere() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      
      // Smooth interactive mouse follow
      const targetX = state.mouse.x * 2;
      const targetY = state.mouse.y * 2;
      
      meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.05;
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.05;
=======
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedSpheres() {
  const groupRef = useRef();

  // Rotate slowly
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      groupRef.current.rotation.x = state.clock.elapsedTime * 0.05;
>>>>>>> Stashed changes
    }
  });

  return (
<<<<<<< Updated upstream
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 100, 200]} scale={1.8}>
        <MeshDistortMaterial
          color="#ff9b71"
          attach="material"
          distort={0.3}
          speed={1.5}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
=======
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[1.5, 64, 64]} position={[-3, 1, -2]}>
          <MeshDistortMaterial
            color="#f4b833"
            envMapIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            metalness={0.2}
            roughness={0.1}
            distort={0.4}
            speed={2}
          />
        </Sphere>
      </Float>

      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <Sphere args={[2, 64, 64]} position={[3, -2, -4]}>
          <MeshDistortMaterial
            color="#7e9067"
            envMapIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0.2}
            metalness={0.1}
            roughness={0.2}
            distort={0.3}
            speed={1.5}
          />
        </Sphere>
      </Float>

      <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1.5}>
        <Sphere args={[1.2, 64, 64]} position={[0, 3, -5]}>
          <MeshDistortMaterial
            color="#b78211"
            envMapIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            metalness={0.3}
            roughness={0.2}
            distort={0.5}
            speed={2.5}
          />
        </Sphere>
      </Float>
    </group>
>>>>>>> Stashed changes
  );
}

export default function ThreeBackground() {
  return (
<<<<<<< Updated upstream
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
      <Canvas camera={{ position: [0, 0, 6] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <AnimatedSphere />
        <Environment preset="sunset" />
=======
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: 'linear-gradient(135deg, #faf4e8 0%, #f8f4ec 45%, #eef1e6 100%)'
      }}
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#f4b833" />
        
        <AnimatedSpheres />
        
        {/* Soft environment lighting to give spheres a realistic look */}
        <Environment preset="apartment" />
>>>>>>> Stashed changes
      </Canvas>
    </div>
  );
}
