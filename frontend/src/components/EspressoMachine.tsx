import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, MathUtils } from 'three'
import { useSoundEffects } from '../useSoundEffects'

interface ModelProps {
  exploded: boolean
  onSelect: (part: string) => void
  selectedPart: string | null
  isBrewing?: boolean
  onBrewComplete?: () => void
  onStatusChange?: (status: string) => void
}

export default function EspressoMachine({ exploded, onSelect, selectedPart, isBrewing, onBrewComplete, onStatusChange }: ModelProps) {
  const groupRef = useRef<Group>(null)
  
  // Refs for animated parts
  const groupHeadRef = useRef<Mesh>(null)
  const portafilterRef = useRef<Group>(null)
  const dripTrayRef = useRef<Mesh>(null)
  const waterTankRef = useRef<Mesh>(null)
  const steamWandRef = useRef<Mesh>(null)
  
  // Refs for effects
  const streamRef = useRef<Mesh>(null)
  const steamCloudRef = useRef<Mesh>(null)

  const { playSound, stopSound } = useSoundEffects()

  const [hoveredPart, setHoveredPart] = useState<string | null>(null)
  const [brewStep, setBrewStep] = useState<'idle' | 'heating' | 'brewing' | 'steaming'>('idle')

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>
    let t2: ReturnType<typeof setTimeout>
    let t3: ReturnType<typeof setTimeout>

    if (isBrewing) {
        setBrewStep('heating')
        playSound('brew')
        onStatusChange?.('Heating Boiler')
        
        // Heating phase (2 seconds)
        t1 = setTimeout(() => {
            setBrewStep('brewing')
            onStatusChange?.('Extracting Espresso')
            
            // Brewing phase (3 seconds)
            t2 = setTimeout(() => {
                stopSound('brew')
                setBrewStep('steaming')
                playSound('steam')
                onStatusChange?.('Steaming Milk')
                
                // Steaming phase (3 seconds)
                t3 = setTimeout(() => {
                    stopSound('steam')
                    setBrewStep('idle')
                    onStatusChange?.('Ready')
                    onBrewComplete?.()
                }, 3000)
            }, 3000)
        }, 2000)
    }

    return () => {
        stopSound('brew')
        stopSound('steam')
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
    }
  }, [isBrewing])

  useEffect(() => {
    document.body.style.cursor = hoveredPart ? 'pointer' : 'auto'
  }, [hoveredPart])

  const getMaterialProps = (partName: string) => {
    const isSelected = selectedPart === partName
    const isHovered = hoveredPart === partName
    const isHeating = brewStep === 'heating' && partName === 'Group Head'
    
    return {
      color: isSelected ? '#ff9f1c' : (isHovered ? '#ffffff' : '#d0d0d0'),
      roughness: 0.2,
      metalness: 0.7,
      emissive: isHeating ? '#ff4400' : (isSelected ? '#552200' : '#000000'),
      emissiveIntensity: isHeating ? 2 : (isSelected ? 0.5 : 0)
    }
  }

  // Animation logic (rotation & explosion)
  useFrame((state, delta) => {
    const speed = 4 * delta
    const time = state.clock.getElapsedTime()
    
    // Rotate entire group
    if (groupRef.current) {
       if (brewStep === 'idle') {
           groupRef.current.rotation.y += 0.002
       } else {
           // Slow rotation during brewing for better view
           groupRef.current.rotation.y += 0.0005
       }
    }

    // Effect Animation Logic
    if (streamRef.current) {
        streamRef.current.visible = brewStep === 'brewing'
        if (brewStep === 'brewing') {
            // Pulse the stream slightly
            streamRef.current.scale.x = 1 + Math.sin(time * 10) * 0.1
            streamRef.current.scale.z = 1 + Math.sin(time * 10) * 0.1
        }
    }

    if (steamCloudRef.current) {
        steamCloudRef.current.visible = brewStep === 'steaming'
        if (brewStep === 'steaming') {
            // Random jitter for steam cloud
            steamCloudRef.current.scale.setScalar(1 + Math.sin(time * 20) * 0.3)
            steamCloudRef.current.rotation.z += 0.1
            steamCloudRef.current.rotation.x += 0.05
            
            // Wobble position slightly
            steamCloudRef.current.position.y = -0.7 + Math.sin(time * 15) * 0.05
        }
    }

    // Animate parts based on exploded state
    if (groupHeadRef.current) {
        groupHeadRef.current.position.y = MathUtils.lerp(groupHeadRef.current.position.y, exploded ? 1.5 : 0.8, speed)
    }
    if (portafilterRef.current) {
        portafilterRef.current.position.z = MathUtils.lerp(portafilterRef.current.position.z, exploded ? 2.0 : 0.9, speed)
        portafilterRef.current.position.y = MathUtils.lerp(portafilterRef.current.position.y, exploded ? 0.4 : 0.6, speed)
    }
    if (dripTrayRef.current) {
        dripTrayRef.current.position.y = MathUtils.lerp(dripTrayRef.current.position.y, exploded ? -1.2 : -0.6, speed)
    }
    if (waterTankRef.current) {
        waterTankRef.current.position.z = MathUtils.lerp(waterTankRef.current.position.z, exploded ? -1.8 : -0.8, speed)
    }
    if (steamWandRef.current) {
        steamWandRef.current.position.x = MathUtils.lerp(steamWandRef.current.position.x, exploded ? 1.5 : 0.8, speed)
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main Body */}
      <mesh 
        position={[0, 0.5, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect('Main Body') }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Main Body') }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
      >
        <boxGeometry args={[2, 2.5, 1.5]} />
        <meshStandardMaterial {...getMaterialProps('Main Body')} color={selectedPart === 'Main Body' ? '#ff9f1c' : '#e0e0e0'} />
      </mesh>

      {/* Group Head */}
      <mesh 
        ref={groupHeadRef}
        position={[0, 0.8, 0.9]}
        rotation={[Math.PI / 2, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect('Group Head') }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Group Head') }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
      >
        <cylinderGeometry args={[0.3, 0.3, 0.5, 32]} />
        <meshStandardMaterial {...getMaterialProps('Group Head')} />
      </mesh>

      {/* Portafilter */}
      <group ref={portafilterRef} position={[0, 0.6, 0.9]}>
        {/* Handle */}
        <mesh 
            position={[0, 0, 1]} 
            rotation={[Math.PI / 2, 0, 0]}
            onClick={(e) => { e.stopPropagation(); onSelect('Portafilter') }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Portafilter') }}
            onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
        >
            <cylinderGeometry args={[0.1, 0.1, 1.5, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        {/* Basket */}
        <mesh 
            position={[0, 0, 0]}
            onClick={(e) => { e.stopPropagation(); onSelect('Portafilter') }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Portafilter') }}
            onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
        >
            <cylinderGeometry args={[0.35, 0.25, 0.3, 32]} />
            <meshStandardMaterial {...getMaterialProps('Portafilter')} />
        </mesh>
        
        {/* Espresso Stream */}
        <mesh ref={streamRef} position={[0, -0.65, 0]} visible={false}>
            <cylinderGeometry args={[0.04, 0.04, 1.0, 8]} />
            <meshPhysicalMaterial 
                color="#3b1505" 
                transparent 
                opacity={0.9} 
                roughness={0.3} 
                metalness={0.1} 
            />
        </mesh>
      </group>

      {/* Drip Tray */}
      <mesh 
        ref={dripTrayRef}
        position={[0, -0.6, 0.8]}
        onClick={(e) => { e.stopPropagation(); onSelect('Drip Tray') }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Drip Tray') }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
      >
        <boxGeometry args={[1.8, 0.2, 1]} />
        <meshStandardMaterial {...getMaterialProps('Drip Tray')} />
      </mesh>

      {/* Water Tank (Back) */}
      <mesh 
        ref={waterTankRef}
        position={[0, 0.5, -0.8]}
        onClick={(e) => { e.stopPropagation(); onSelect('Water Tank') }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Water Tank') }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
      >
        <boxGeometry args={[1.8, 2.4, 0.5]} />
        <meshStandardMaterial {...getMaterialProps('Water Tank')} color="#aaddff" transparent opacity={0.6} roughness={0.1} />
      </mesh>

      {/* Steam Wand */}
      <mesh 
        ref={steamWandRef}
        position={[0.8, 0.5, 0.8]}
        rotation={[0, 0, -0.2]}
        onClick={(e) => { e.stopPropagation(); onSelect('Steam Wand') }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Steam Wand') }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
      >
        <cylinderGeometry args={[0.05, 0.05, 1.2, 16]} />
        <meshStandardMaterial {...getMaterialProps('Steam Wand')} />
        
        {/* Steam Effect Cloud */}
        <mesh ref={steamCloudRef} position={[0, -0.7, 0]} visible={false}>
             <sphereGeometry args={[0.25, 16, 16]} />
             <meshStandardMaterial 
                color="#ffffff" 
                transparent 
                opacity={0.4} 
                roughness={1} 
                emissive="#ffffff"
                emissiveIntensity={0.5}
             />
        </mesh>
      </mesh>

    </group>
  )
}
