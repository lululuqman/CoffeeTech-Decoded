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

export default function FrenchPress({ exploded, onSelect, selectedPart, isBrewing, onBrewComplete, onStatusChange }: ModelProps) {
  const groupRef = useRef<Group>(null)
  const [hoveredPart, setHoveredPart] = useState<string | null>(null)
  const [brewStep, setBrewStep] = useState<'idle' | 'grounds' | 'water' | 'steeping' | 'pressing' | 'finished'>('idle')

  // Refs for animated parts
  const plungerRef = useRef<Group>(null)
  const lidRef = useRef<Mesh>(null)
  const beakerRef = useRef<Mesh>(null)
  const frameRef = useRef<Group>(null)
  const coffeeRef = useRef<Group>(null)
  const waterRef = useRef<Mesh>(null)

  const { playSound, stopSound } = useSoundEffects()

  useEffect(() => {
    document.body.style.cursor = hoveredPart ? 'pointer' : 'auto'
  }, [hoveredPart])

  // Animation sequence
  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>
    let t2: ReturnType<typeof setTimeout>
    let t3: ReturnType<typeof setTimeout>
    let t4: ReturnType<typeof setTimeout>
    let t5: ReturnType<typeof setTimeout>

    if (isBrewing) {
        setBrewStep('grounds')
        onStatusChange?.('Adding Grounds')
        
        // Add grounds (1s)
        t1 = setTimeout(() => {
            setBrewStep('water')
            playSound('pour')
            onStatusChange?.('Pouring Hot Water')
            
            // Pour water (1.5s)
            t2 = setTimeout(() => {
                stopSound('pour')
                setBrewStep('steeping')
                onStatusChange?.('Steeping')
                
                // Steep (2s)
                t3 = setTimeout(() => {
                    setBrewStep('pressing')
                    playSound('brew')
                    onStatusChange?.('Pressing Plunger')
                    
                    // Press (3s)
                    t4 = setTimeout(() => {
                        stopSound('brew')
                        setBrewStep('finished')
                        
                        // Finish (2s)
                        t5 = setTimeout(() => {
                            setBrewStep('idle')
                            onStatusChange?.('Ready')
                            onBrewComplete?.()
                        }, 2000)
                    }, 3000)
                }, 2000)
            }, 1500)
        }, 1000)
    }

    return () => {
        stopSound('pour')
        stopSound('brew')
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
        clearTimeout(t4)
        clearTimeout(t5)
    }
  }, [isBrewing])

  const getMaterialProps = (partName: string) => {
    const isSelected = selectedPart === partName
    const isHovered = hoveredPart === partName
    
    return {
      color: isSelected ? '#ff9f1c' : (isHovered ? '#ffffff' : '#d0d0d0'),
      emissive: isSelected ? '#552200' : '#000000',
      emissiveIntensity: isSelected ? 0.5 : 0
    }
  }

  // Animation logic
  useFrame((_, delta) => {
    const speed = 4 * delta
    
    // Continuous rotation
    if (groupRef.current) {
       groupRef.current.rotation.y += 0.002
    }

    // Exploded view animation
    if (plungerRef.current) {
        // Plunger lifts straight up
        let targetY = exploded ? 3.5 : 0
        
        // Override for brewing animation
        if (!exploded) {
            if (brewStep === 'grounds' || brewStep === 'water' || brewStep === 'steeping') {
                targetY = 2.5 // Lifted for adding ingredients
            } else if (brewStep === 'pressing') {
                // Animate pressing down
                // Simple oscillation for now, refined below
                // Actually we want linear interpolation over the 3s period
                // But since we don't have start time here easily without more state, let's approximate
                // We'll let the lerp handle it towards 0
                targetY = 0
                // Slow down the press
                plungerRef.current.position.y = MathUtils.lerp(plungerRef.current.position.y, 0, delta * 0.5)
                return 
            } else if (brewStep === 'finished') {
                targetY = 0
            }
        }
        
        plungerRef.current.position.y = MathUtils.lerp(plungerRef.current.position.y, targetY, speed)
    }
    
    // Coffee Grounds Animation
    if (coffeeRef.current) {
        const targetScale = (brewStep !== 'idle') ? 1 : 0
        coffeeRef.current.scale.setScalar(MathUtils.lerp(coffeeRef.current.scale.x, targetScale, speed))
    }

    // Water/Coffee Liquid Animation
    if (waterRef.current) {
        let targetHeight = 0
        let targetColor = '#aaddff' // Water color
        
        if (brewStep === 'water') {
            targetHeight = 0.5
        } else if (brewStep === 'steeping' || brewStep === 'pressing' || brewStep === 'finished') {
            targetHeight = 0.8
            targetColor = '#3e2723' // Coffee color
        }
        
        waterRef.current.scale.y = MathUtils.lerp(waterRef.current.scale.y, targetHeight > 0 ? targetHeight : 0.01, speed * 0.5)
        
        // Color transition
        // @ts-ignore
        waterRef.current.material.color.lerp({ r: parseInt(targetColor.slice(1,3), 16)/255, g: parseInt(targetColor.slice(3,5), 16)/255, b: parseInt(targetColor.slice(5,7), 16)/255 }, delta)
    }
  })

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      
      {/* Plunger Assembly (Lid + Rod + Filter) */}
      <group ref={plungerRef}>
        {/* Knob */}
        <mesh 
            position={[0, 2.8, 0]}
            onClick={(e) => { e.stopPropagation(); onSelect('Plunger Knob') }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Plunger Knob') }}
            onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
        >
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial {...getMaterialProps('Plunger Knob')} color="#111111" roughness={0.5} />
        </mesh>

        {/* Lid */}
        <mesh 
            ref={lidRef}
            position={[0, 2.4, 0]}
            onClick={(e) => { e.stopPropagation(); onSelect('Lid') }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Lid') }}
            onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
        >
            <cylinderGeometry args={[1.1, 1.1, 0.2, 32]} />
            <meshStandardMaterial {...getMaterialProps('Lid')} color="#c0c0c0" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Rod */}
        <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 2.4, 16]} />
            <meshStandardMaterial {...getMaterialProps('Rod')} color="#c0c0c0" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Filter Assembly (Mesh + Cross Plate) */}
        <group position={[0, 0.1, 0]}>
            {/* Cross Plate */}
            <mesh 
                position={[0, 0.05, 0]}
                onClick={(e) => { e.stopPropagation(); onSelect('Filter Assembly') }}
                onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Filter Assembly') }}
                onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
            >
                <cylinderGeometry args={[0.95, 0.95, 0.05, 32]} />
                <meshStandardMaterial {...getMaterialProps('Filter Assembly')} color="#a0a0a0" metalness={0.8} />
            </mesh>
            {/* Mesh Screen (Visual representation) */}
            <mesh 
                position={[0, 0, 0]}
                onClick={(e) => { e.stopPropagation(); onSelect('Filter Mesh') }}
                onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Filter Mesh') }}
                onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
            >
                <cylinderGeometry args={[1.0, 1.0, 0.02, 32]} />
                <meshStandardMaterial {...getMaterialProps('Filter Mesh')} color="#dddddd" wireframe />
            </mesh>
             {/* Spiral Plate */}
             <mesh position={[0, -0.05, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 0.05, 16]} />
                <meshStandardMaterial {...getMaterialProps('Spiral Plate')} color="#c0c0c0" metalness={0.9} />
            </mesh>
        </group>
      </group>

      {/* Glass Beaker */}
      <mesh 
        ref={beakerRef}
        position={[0, 1.2, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect('Glass Beaker') }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Glass Beaker') }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
      >
        <cylinderGeometry args={[1.05, 1.05, 2.4, 32, 1, true]} />
        <meshPhysicalMaterial 
            {...getMaterialProps('Glass Beaker')} 
            color="#ffffff" 
            transmission={0.9} 
            opacity={0.3} 
            transparent 
            roughness={0} 
            metalness={0.1} 
            thickness={0.1}
            side={2} // DoubleSide
        />
      </mesh>
      {/* Beaker Bottom */}
       <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[1.05, 1.05, 0.1, 32]} />
            <meshPhysicalMaterial 
            {...getMaterialProps('Glass Beaker')} 
            color="#ffffff" 
            transmission={0.9} 
            opacity={0.3} 
            transparent 
            roughness={0} 
            metalness={0.1} 
            thickness={0.1}
            side={2} // DoubleSide
        />
        </mesh>

        {/* Coffee/Water Liquid */}
      <mesh ref={waterRef} position={[0, 0, 0]} scale={[1, 0.01, 1]}>
        <cylinderGeometry args={[1, 1, 2.4, 32]} />
        <meshPhysicalMaterial color="#aaddff" transmission={0.2} opacity={0.8} transparent roughness={0.2} />
      </mesh>

      {/* Coffee Grounds (Bottom) */}
      <group ref={coffeeRef} position={[0, 0.1, 0]} scale={[0, 0, 0]}>
         <mesh>
            <cylinderGeometry args={[1, 1, 0.2, 32]} />
            <meshStandardMaterial color="#3e2723" roughness={1} />
         </mesh>
      </group>


      {/* Frame */}
      <group ref={frameRef}>
        {/* Base Ring */}
        <mesh 
            position={[0, 0.1, 0]}
            onClick={(e) => { e.stopPropagation(); onSelect('Frame') }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Frame') }}
            onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
        >
            <cylinderGeometry args={[1.15, 1.15, 0.2, 32]} />
             <meshStandardMaterial {...getMaterialProps('Frame')} color="#c0c0c0" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Top Ring */}
        <mesh position={[0, 2.2, 0]}>
             <cylinderGeometry args={[1.15, 1.15, 0.1, 32, 1, true]} />
             <meshStandardMaterial {...getMaterialProps('Top Ring')} color="#c0c0c0" metalness={0.8} roughness={0.2} side={2} />
        </mesh>
        {/* Vertical Struts */}
        {[0, 120, 240].map((angle, i) => (
            <mesh key={i} position={[Math.sin(angle * Math.PI / 180) * 1.15, 1.15, Math.cos(angle * Math.PI / 180) * 1.15]}>
                <boxGeometry args={[0.1, 2.2, 0.05]} />
                <meshStandardMaterial {...getMaterialProps('Vertical Struts')} color="#c0c0c0" metalness={0.8} roughness={0.2} />
            </mesh>
        ))}
         {/* Handle */}
         <mesh 
            position={[1.4, 1.2, 0]} 
            rotation={[0, 0, 0]}
            onClick={(e) => { e.stopPropagation(); onSelect('Handle') }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Handle') }}
            onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
         >
            <boxGeometry args={[0.2, 1.5, 0.1]} />
            <meshStandardMaterial {...getMaterialProps('Handle')} color="#111111" roughness={0.8} />
         </mesh>
         {/* Handle Connectors */}
         <mesh position={[1.2, 1.8, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
            <meshStandardMaterial {...getMaterialProps('Handle Connectors')} color="#c0c0c0" metalness={0.8} />
         </mesh>
         <mesh position={[1.2, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
            <meshStandardMaterial {...getMaterialProps('Handle Connectors')} color="#c0c0c0" metalness={0.8} />
         </mesh>
      </group>

    </group>
  )
}
