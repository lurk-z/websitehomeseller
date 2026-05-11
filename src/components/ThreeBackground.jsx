import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, MeshDistortMaterial, Sphere } from '@react-three/drei'

function AnimatedSpheres() {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
      groupRef.current.rotation.x = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[1.5, 64, 64]} position={[-3, 1, -2]}>
          <MeshDistortMaterial
            clearcoat={1}
            clearcoatRoughness={0.1}
            color="#f4b833"
            distort={0.4}
            envMapIntensity={1}
            metalness={0.2}
            roughness={0.1}
            speed={2}
          />
        </Sphere>
      </Float>

      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <Sphere args={[2, 64, 64]} position={[3, -2, -4]}>
          <MeshDistortMaterial
            clearcoat={1}
            clearcoatRoughness={0.2}
            color="#7e9067"
            distort={0.3}
            envMapIntensity={1}
            metalness={0.1}
            roughness={0.2}
            speed={1.5}
          />
        </Sphere>
      </Float>

      <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1.5}>
        <Sphere args={[1.2, 64, 64]} position={[0, 3, -5]}>
          <MeshDistortMaterial
            clearcoat={1}
            clearcoatRoughness={0.1}
            color="#b78211"
            distort={0.5}
            envMapIntensity={1}
            metalness={0.3}
            roughness={0.2}
            speed={2.5}
          />
        </Sphere>
      </Float>
    </group>
  )
}

export default function ThreeBackground() {
  return (
    <div
      style={{
        background:
          'linear-gradient(135deg, #faf4e8 0%, #f8f4ec 45%, #eef1e6 100%)',
        height: '100vh',
        left: 0,
        pointerEvents: 'none',
        position: 'fixed',
        top: 0,
        width: '100vw',
        zIndex: -1,
      }}
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight color="#f4b833" intensity={0.5} position={[-10, -10, -5]} />
        <AnimatedSpheres />
        <Environment preset="apartment" />
      </Canvas>
    </div>
  )
}
