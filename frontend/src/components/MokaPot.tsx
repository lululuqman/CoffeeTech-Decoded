import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, MathUtils } from 'three'
import { useSoundEffects } from '../useSoundEffects'

interface MokaPotProps {
  exploded: boolean
  onSelect: (part: string) => void
  selectedPart: string | null
  isBrewing?: boolean
  onBrewComplete?: () => void
  onStatusChange?: (status: string) => void
}

export default function MokaPot({ exploded, onSelect, selectedPart, isBrewing, onBrewComplete, onStatusChange }: MokaPotProps) {
  const groupRef = useRef<Group>(null)
  const filterRef = useRef<Mesh>(null)
  const chamberRef = useRef<Group>(null)
  const lidRef = useRef<Mesh>(null)
  const streamRef = useRef<Group>(null)
  
  const { playSound, stopSound } = useSoundEffects()

  const [hoveredPart, setHoveredPart] = useState<string | null>(null)
  const [brewStep, setBrewStep] = useState<'idle' | 'heating' | 'pouring'>('idle')

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>
    let t2: ReturnType<typeof setTimeout>

    if (isBrewing) {
        setBrewStep('heating')
        playSound('brew')
        onStatusChange?.('Heating Water')
        
        // Heating phase (2 seconds)
        t1 = setTimeout(() => {
            stopSound('brew')
            setBrewStep('pouring')
            playSound('pour')
            onStatusChange?.('Pressurized Extraction')
            
            // Pouring phase (3 seconds)
            t2 = setTimeout(() => {
                stopSound('pour')
                setBrewStep('idle')
                onStatusChange?.('Ready')
                onBrewComplete?.()
            }, 3000)
        }, 2000)
    }

    return () => {
        stopSound('brew')
        stopSound('pour')
        clearTimeout(t1)
        clearTimeout(t2)
    }
  }, [isBrewing])

  useEffect(() => {
    document.body.style.cursor = hoveredPart ? 'pointer' : 'auto'
  }, [hoveredPart])

  // Target positions based on exploded state
  const targetPositions = {
    filter: exploded ? 1.2 : 0.8,
    chamber: exploded ? 2.5 : 1.6,
    lid: exploded ? 3.5 : 2.6
  }

  useFrame((_, delta) => {
    // Smoothly interpolate positions
    const speed = 4 * delta

    if (filterRef.current) {
      filterRef.current.position.y = MathUtils.lerp(filterRef.current.position.y, targetPositions.filter, speed)
    }
    if (chamberRef.current) {
      chamberRef.current.position.y = MathUtils.lerp(chamberRef.current.position.y, targetPositions.chamber, speed)
    }
    if (lidRef.current) {
      lidRef.current.position.y = MathUtils.lerp(lidRef.current.position.y, targetPositions.lid, speed)
    }
    
    // Animation Logic
    if (groupRef.current) {
       // Continuous rotation for presentation (idle)
       if (brewStep === 'idle') {
           groupRef.current.rotation.y += 0.002
           // Reset tilt
           groupRef.current.rotation.z = MathUtils.lerp(groupRef.current.rotation.z, 0, speed)
       } else if (brewStep === 'pouring') {
           // Align to profile view (Spout Left) for the pour
           const currentY = groupRef.current.rotation.y
           const targetY = Math.round(currentY / (Math.PI * 2)) * (Math.PI * 2)
           groupRef.current.rotation.y = MathUtils.lerp(currentY, targetY, speed)

           // Tilt for pouring (Spout Down)
           groupRef.current.rotation.z = MathUtils.lerp(groupRef.current.rotation.z, Math.PI / 2.5, speed)
           
           // Water Stream Logic
           if (streamRef.current) {
               streamRef.current.visible = true
               // Counter-rotate to keep stream vertical
               // Total Parent Z = Group Z + Spout Z (-PI/4)
               // We want World Z = 0
               // Local Stream Z = - (Group Z + Spout Z)
               streamRef.current.rotation.z = -(groupRef.current.rotation.z - Math.PI / 4)
           }
       } else {
           // Heating - keep rotating Y but ensure Z is 0
           groupRef.current.rotation.y += 0.002
           groupRef.current.rotation.z = MathUtils.lerp(groupRef.current.rotation.z, 0, speed)
           
           if (streamRef.current) streamRef.current.visible = false
       }
    }
  })

  const getMaterialProps = (partName: string) => {
    const isSelected = selectedPart === partName
    const isHovered = hoveredPart === partName
    const isHeating = brewStep === 'heating' && partName === 'Boiler'
    
    return {
      color: isSelected ? '#ff9f1c' : (isHovered ? '#ffffff' : '#d0d0d0'),
      roughness: 0.2,
      metalness: 0.8,
      emissive: isHeating ? '#ff4400' : (isSelected ? '#552200' : '#000000'),
      emissiveIntensity: isHeating ? 2 : (isSelected ? 0.5 : 0)
    }
  }

  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      {/* Base (Boiler) */}
      <mesh 
        position={[0, 0, 0]} 
        onClick={(e) => { e.stopPropagation(); onSelect('Boiler') }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Boiler') }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
      >
        <cylinderGeometry args={[1, 1.2, 1.5, 32]} />
        <meshStandardMaterial {...getMaterialProps('Boiler')} />
      </mesh>

      {/* Filter Funnel */}
      <mesh 
        ref={filterRef}
        position={[0, 0.8, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect('Filter Funnel') }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Filter Funnel') }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
      >
        <cylinderGeometry args={[0.9, 0.2, 0.8, 32]} />
        <meshStandardMaterial {...getMaterialProps('Filter Funnel')} roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Collection Chamber Group (includes Handle) */}
      <group ref={chamberRef} position={[0, 1.6, 0]}>
        {/* Main Chamber Body */}
        <mesh 
          onClick={(e) => { e.stopPropagation(); onSelect('Collection Chamber') }}
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Collection Chamber') }}
          onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
        >
          <cylinderGeometry args={[1.2, 1, 1.8, 8]} />
          <meshStandardMaterial {...getMaterialProps('Collection Chamber')} />
        </mesh>
        
        {/* Handle */}
        <mesh 
            position={[1.2, 0, 0]} 
            rotation={[0, 0, -Math.PI / 2]}
            onClick={(e) => { e.stopPropagation(); onSelect('Handle') }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Handle') }}
            onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
        >
            <torusGeometry args={[0.5, 0.12, 8, 16, Math.PI]} />
            <meshStandardMaterial 
                color={selectedPart === 'Handle' ? '#ff9f1c' : (hoveredPart === 'Handle' ? '#4a4a4a' : '#1a1a1a')} 
                roughness={0.8}
                emissive={selectedPart === 'Handle' ? '#552200' : '#000000'}
                emissiveIntensity={selectedPart === 'Handle' ? 0.5 : 0}
            />
        </mesh>

        {/* Spout */}
        <mesh 
            position={[-1, 0.8, 0]} 
            rotation={[0, 0, -Math.PI / 4]}
            onClick={(e) => { e.stopPropagation(); onSelect('Spout') }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Spout') }}
            onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
        >
             <cylinderGeometry args={[0.2, 0.3, 0.5, 8]} />
             <meshStandardMaterial {...getMaterialProps('Spout')} />
             
             {/* Pouring Stream */}
             <group ref={streamRef} position={[0, 0.25, 0]} visible={false}>
                <mesh position={[0, -3, 0]}>
                    <cylinderGeometry args={[0.04, 0.04, 6, 8]} />
                    <meshPhysicalMaterial 
                        color="#aaddff" 
                        transparent 
                        opacity={0.6} 
                        roughness={0.1} 
                        metalness={0.1} 
                        transmission={0.9}
                        ior={1.33}
                        thickness={0.5}
                    />
                </mesh>
             </group>
        </mesh>
      </group>

      {/* Lid */}
      <mesh 
        ref={lidRef}
        position={[0, 2.6, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect('Lid') }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Lid') }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
      >
        <cylinderGeometry args={[1.2, 1.2, 0.2, 32]} />
        <meshStandardMaterial {...getMaterialProps('Lid')} />
        {/* Lid Knob */}
        <mesh position={[0, 0.3, 0]}>
             <sphereGeometry args={[0.2, 32, 32]} />
             <meshStandardMaterial {...getMaterialProps('Lid Knob')} color="#1a1a1a" roughness={0.5} />
        </mesh>
      </mesh>

    </group>
  )
}
