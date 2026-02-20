import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, MathUtils } from 'three'
import { useSoundEffects } from '../useSoundEffects'

interface ModelProps {
  exploded: boolean
  onSelect: (part: string) => void
  selectedPart: string | null
  isGrinding?: boolean
  onGrindComplete?: () => void
  onStatusChange?: (status: string) => void
}

export default function Grinder({ exploded, onSelect, selectedPart, isGrinding, onGrindComplete, onStatusChange }: ModelProps) {
  const groupRef = useRef<Group>(null)
  
  // Refs for animated parts
  const hopperRef = useRef<Mesh>(null)
  const collarRef = useRef<Mesh>(null)
  const chuteRef = useRef<Mesh>(null)
  const binRef = useRef<Mesh>(null)
  const baseRef = useRef<Mesh>(null)
  
  // Refs for effects
  const beansRef = useRef<Group>(null)
  const groundsRef = useRef<Group>(null)
  const streamRef = useRef<Mesh>(null)
  const particlesRef = useRef<Group>(null)

  const { playSound, stopSound } = useSoundEffects()

  const [hoveredPart, setHoveredPart] = useState<string | null>(null)
  const [grindStep, setGrindStep] = useState<'idle' | 'grinding'>('idle')

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>

    if (isGrinding) {
        setGrindStep('grinding')
        playSound('grind')
        onStatusChange?.('Grinding Beans')
        
        // Grinding phase (4 seconds)
        t1 = setTimeout(() => {
            stopSound('grind')
            setGrindStep('idle')
            onStatusChange?.('Ready')
            onGrindComplete?.()
        }, 4000)
    }

    return () => {
        stopSound('grind')
        clearTimeout(t1)
    }
  }, [isGrinding])

  useEffect(() => {
    document.body.style.cursor = hoveredPart ? 'pointer' : 'auto'
  }, [hoveredPart])

  const getMaterialProps = (partName: string) => {
    const isSelected = selectedPart === partName
    const isHovered = hoveredPart === partName
    
    return {
      color: isSelected ? '#ff9f1c' : (isHovered ? '#ffffff' : '#d0d0d0'),
      roughness: 0.2,
      metalness: 0.7,
      emissive: isSelected ? '#552200' : '#000000',
      emissiveIntensity: isSelected ? 0.5 : 0
    }
  }

  // Animation logic (rotation & explosion)
  useFrame((state, delta) => {
    const speed = 4 * delta
    const time = state.clock.getElapsedTime()
    
    if (groupRef.current) {
       // Gentle idle rotation
       if (grindStep === 'idle') {
           groupRef.current.rotation.y += 0.002
       } else {
           // Vibration during grinding
           groupRef.current.rotation.x = Math.sin(time * 50) * 0.002
           groupRef.current.rotation.z = Math.cos(time * 50) * 0.002
       }
    }

    // Bean Depletion Animation
    if (beansRef.current && grindStep === 'grinding') {
        // Lower the beans level
        if (beansRef.current.scale.y > 0.1) {
            beansRef.current.scale.y -= delta * 0.2
            beansRef.current.position.y -= delta * 0.1
        }
        // Jiggle beans
        beansRef.current.rotation.y += 0.1
        beansRef.current.position.x = Math.sin(time * 20) * 0.02
        beansRef.current.position.z = Math.cos(time * 20) * 0.02
    } else if (beansRef.current && grindStep === 'idle' && !isGrinding) {
        // Reset beans
        beansRef.current.scale.y = 1
        beansRef.current.position.y = 0
        beansRef.current.position.x = 0
        beansRef.current.position.z = 0
    }

    // Grounds Accumulation Animation
    if (groundsRef.current) {
        if (grindStep === 'grinding') {
            groundsRef.current.visible = true
            // Fill up the bin
            if (groundsRef.current.scale.y < 1) {
                groundsRef.current.scale.y += delta * 0.25
                groundsRef.current.position.y += delta * 0.1
            }
        } else if (!isGrinding) {
            groundsRef.current.visible = false
            groundsRef.current.scale.y = 0.1
            groundsRef.current.position.y = -0.4
        }
    }
    
    // Grinds Stream Animation
    if (streamRef.current) {
        if (grindStep === 'grinding') {
            streamRef.current.visible = true
            // Jitter stream width to simulate flow variance
            streamRef.current.scale.x = 1 + Math.sin(time * 30) * 0.2
            streamRef.current.scale.z = 1 + Math.cos(time * 30) * 0.2
        } else {
            streamRef.current.visible = false
        }
    }

    // Falling Particles Animation
    if (particlesRef.current) {
        if (grindStep === 'grinding') {
            particlesRef.current.visible = true
            particlesRef.current.children.forEach((child) => {
                const mesh = child as Mesh
                // Fall down
                mesh.position.y -= delta * 3
                // Reset to top if too low
                if (mesh.position.y < -0.8) {
                    mesh.position.y = 0.2 + Math.random() * 0.2 // Start near chute
                    mesh.position.x = (Math.random() - 0.5) * 0.1
                    mesh.position.z = 0.8 + (Math.random() - 0.5) * 0.1 // Near stream center z=0.8
                }
            })
        } else {
            particlesRef.current.visible = false
        }
    }

    // Exploded View Logic
    if (hopperRef.current) {
        hopperRef.current.position.y = MathUtils.lerp(hopperRef.current.position.y, exploded ? 2.5 : 1.8, speed)
    }
    if (collarRef.current) {
        collarRef.current.position.y = MathUtils.lerp(collarRef.current.position.y, exploded ? 1.6 : 1.1, speed)
    }
    if (chuteRef.current) {
        chuteRef.current.position.z = MathUtils.lerp(chuteRef.current.position.z, exploded ? 1.2 : 0.7, speed)
        chuteRef.current.position.y = MathUtils.lerp(chuteRef.current.position.y, exploded ? 0.4 : 0.2, speed)
    }
    if (binRef.current) {
        binRef.current.position.z = MathUtils.lerp(binRef.current.position.z, exploded ? 1.5 : 0.8, speed)
    }
    if (baseRef.current) {
        baseRef.current.position.y = MathUtils.lerp(baseRef.current.position.y, exploded ? -1.5 : -1.1, speed)
    }
  })

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Body */}
      <mesh 
        position={[0, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect('Grinder Body') }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Grinder Body') }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
      >
        <boxGeometry args={[1.2, 2, 1.2]} />
        <meshStandardMaterial {...getMaterialProps('Grinder Body')} color={selectedPart === 'Grinder Body' ? '#ff9f1c' : '#333333'} />
      </mesh>

      {/* Hopper */}
      <mesh 
        ref={hopperRef}
        position={[0, 1.8, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect('Bean Hopper') }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Bean Hopper') }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
      >
        <cylinderGeometry args={[0.8, 0.4, 1.2, 32]} />
        <meshStandardMaterial {...getMaterialProps('Bean Hopper')} color="#aaddff" transparent opacity={0.6} roughness={0.1} />
        
        {/* Coffee Beans (Inside Hopper) */}
        <group ref={beansRef} position={[0, -0.2, 0]}>
            {/* Main volume of beans */}
            <mesh>
                <cylinderGeometry args={[0.7, 0.35, 0.6, 16]} />
                <meshStandardMaterial color="#3e2723" roughness={0.9} />
            </mesh>
            {/* Individual "whole beans" scattered on top/surface */}
            {Array.from({ length: 12 }).map((_, i) => (
                <mesh 
                    key={i} 
                    position={[
                        Math.sin(i) * 0.4, 
                        0.3 + Math.random() * 0.1, 
                        Math.cos(i) * 0.4
                    ]} 
                    rotation={[Math.random(), Math.random(), Math.random()]}
                >
                    <capsuleGeometry args={[0.08, 0.15, 4, 8]} />
                    <meshStandardMaterial color="#4e342e" roughness={0.8} />
                </mesh>
            ))}
        </group>
      </mesh>

      {/* Adjustment Collar */}
      <mesh 
        ref={collarRef}
        position={[0, 1.1, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect('Adjustment Collar') }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Adjustment Collar') }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
      >
        <cylinderGeometry args={[0.6, 0.6, 0.2, 32]} />
        <meshStandardMaterial {...getMaterialProps('Adjustment Collar')} color="#silver" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Chute */}
      <mesh 
        ref={chuteRef}
        position={[0, 0.2, 0.7]}
        rotation={[Math.PI / 4, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect('Chute') }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Chute') }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
      >
        <boxGeometry args={[0.4, 0.8, 0.2]} />
        <meshStandardMaterial {...getMaterialProps('Chute')} />
      </mesh>

      {/* Grinds Stream */}
      <mesh ref={streamRef} position={[0, -0.2, 0.8]} visible={false}>
          <cylinderGeometry args={[0.08, 0.15, 0.8, 8]} />
          <meshStandardMaterial color="#4e342e" transparent opacity={0.8} roughness={0.9} />
      </mesh>

      {/* Falling Particles */}
      <group ref={particlesRef} visible={false}>
          {Array.from({ length: 15 }).map((_, i) => (
              <mesh 
                  key={i} 
                  position={[
                      (Math.random() - 0.5) * 0.1, 
                      0.2 - Math.random() * 0.8, // Start distributed vertically
                      0.8 + (Math.random() - 0.5) * 0.1
                  ]}
                  rotation={[Math.random(), Math.random(), Math.random()]}
              >
                  <dodecahedronGeometry args={[0.03, 0]} />
                  <meshStandardMaterial color="#3e2723" />
              </mesh>
          ))}
      </group>

      {/* Grounds Bin */}
      <mesh 
        ref={binRef}
        position={[0, -0.6, 0.8]}
        onClick={(e) => { e.stopPropagation(); onSelect('Grounds Bin') }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Grounds Bin') }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
      >
        <boxGeometry args={[1, 0.8, 1]} />
        <meshStandardMaterial {...getMaterialProps('Grounds Bin')} color="#aaddff" transparent opacity={0.5} roughness={0.1} />
        
        {/* Ground Coffee (Inside Bin) */}
        <group ref={groundsRef} position={[0, -0.4, 0]} scale={[1, 0.1, 1]} visible={false}>
             <mesh>
                <boxGeometry args={[0.9, 0.7, 0.9]} />
                <meshStandardMaterial color="#5d4037" roughness={1} />
             </mesh>
             {/* Pile effect on top */}
             <mesh position={[0, 0.35, 0]} rotation={[0, 0, 0]}>
                <coneGeometry args={[0.8, 0.4, 32]} />
                <meshStandardMaterial color="#5d4037" roughness={1} />
             </mesh>
        </group>
      </mesh>

      {/* Base */}
      <mesh 
        ref={baseRef}
        position={[0, -1.1, 0.2]}
        onClick={(e) => { e.stopPropagation(); onSelect('Base') }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Base') }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
      >
        <boxGeometry args={[1.4, 0.2, 1.6]} />
        <meshStandardMaterial {...getMaterialProps('Base')} color="#111111" />
      </mesh>

    </group>
  )
}
