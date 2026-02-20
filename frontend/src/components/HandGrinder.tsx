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

export default function HandGrinder({ exploded, onSelect, selectedPart, isGrinding, onGrindComplete, onStatusChange }: ModelProps) {
  const groupRef = useRef<Group>(null)
  const { playSound, stopSound } = useSoundEffects()
  const [hoveredPart, setHoveredPart] = useState<string | null>(null)
  const [grindStep, setGrindStep] = useState<'idle' | 'opening' | 'pouring' | 'closing' | 'grinding' | 'finished'>('idle')

  // Refs for animated parts
  const handleRef = useRef<Group>(null)
  const lidRef = useRef<Mesh>(null)
  const bodyRef = useRef<Mesh>(null)
  const catchCupRef = useRef<Mesh>(null)
  const knobRef = useRef<Mesh>(null)
  
  // Refs for effects
  const beansRef = useRef<Group>(null)
  const groundsRef = useRef<Group>(null)

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>
    let t2: ReturnType<typeof setTimeout>
    let t3: ReturnType<typeof setTimeout>
    let t4: ReturnType<typeof setTimeout>
    let t5: ReturnType<typeof setTimeout>

    if (isGrinding) {
        setGrindStep('opening')
        onStatusChange?.('Opening Lid')
        
        // Open lid (1s)
        t1 = setTimeout(() => {
            setGrindStep('pouring')
            playSound('pour')
            onStatusChange?.('Pouring Beans')
            
            // Pour beans (1s)
            t2 = setTimeout(() => {
                stopSound('pour')
                setGrindStep('closing')
                onStatusChange?.('Closing Lid')
                
                // Close lid (1s)
                t3 = setTimeout(() => {
                    setGrindStep('grinding')
                    playSound('grind')
                    onStatusChange?.('Grinding Beans')
                    
                    // Grind (4s)
                    t4 = setTimeout(() => {
                        stopSound('grind')
                        setGrindStep('finished')
                        playSound('slide')
                        onStatusChange?.('Grounds Ready')
                        
                        // Show grounds (2s)
                        t5 = setTimeout(() => {
                            setGrindStep('idle')
                            onStatusChange?.('Ready')
                            onGrindComplete?.()
                        }, 2000)
                    }, 4000)
                }, 1000)
            }, 1000)
        }, 1000)
    }

    return () => {
        stopSound('pour')
        stopSound('grind')
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
        clearTimeout(t4)
        clearTimeout(t5)
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

  // Animation logic
  useFrame((_, delta) => {
    const speed = 4 * delta
    
    // Continuous rotation for idle
    if (groupRef.current && grindStep === 'idle') {
       groupRef.current.rotation.y += 0.002
    }

    // Lid Animation (Open/Close)
    if (lidRef.current) {
        let targetY = exploded ? 1.8 : 1.2
        let targetX = 0
        let targetRotX = 0

        if (grindStep === 'opening' || grindStep === 'pouring') {
            targetY = 1.6
            targetX = 0.5
            targetRotX = -Math.PI / 4
        }
        
        lidRef.current.position.y = MathUtils.lerp(lidRef.current.position.y, targetY, speed)
        lidRef.current.position.x = MathUtils.lerp(lidRef.current.position.x, targetX, speed)
        lidRef.current.rotation.x = MathUtils.lerp(lidRef.current.rotation.x, targetRotX, speed)
    }

    // Handle Rotation (Grinding)
    if (handleRef.current) {
        if (grindStep === 'grinding') {
            handleRef.current.rotation.y -= delta * 10 // Clockwise rotation
        } else {
             handleRef.current.position.y = MathUtils.lerp(handleRef.current.position.y, exploded ? 2.5 : 1.5, speed)
        }
    }

    // Catch Cup Animation (Show Grounds)
    if (catchCupRef.current) {
        let targetY = exploded ? -1.5 : -0.8
        let targetRotZ = 0
        let targetX = 0

        if (grindStep === 'finished') {
            targetY = -2.2 // Lower cup further to show grounds
            targetRotZ = 0.4 // Tilt to show contents
            targetX = 0.5 // Move side slightly
        }
        
        catchCupRef.current.position.y = MathUtils.lerp(catchCupRef.current.position.y, targetY, speed)
        catchCupRef.current.position.x = MathUtils.lerp(catchCupRef.current.position.x, targetX, speed)
        catchCupRef.current.rotation.z = MathUtils.lerp(catchCupRef.current.rotation.z, targetRotZ, speed)
    }

    // Beans Animation
    if (beansRef.current) {
        if (grindStep === 'pouring') {
            beansRef.current.visible = true
            beansRef.current.scale.setScalar(MathUtils.lerp(beansRef.current.scale.x, 1, speed))
        } else if (grindStep === 'grinding') {
            // Deplete beans
             if (beansRef.current.scale.y > 0) {
                 beansRef.current.scale.y -= delta * 0.25
                 beansRef.current.position.y -= delta * 0.1
             }
        } else if (grindStep === 'idle' && !isGrinding) {
            beansRef.current.visible = false
            beansRef.current.scale.setScalar(0.1)
            beansRef.current.position.y = 0
        }
    }

    // Grounds Animation
    if (groundsRef.current) {
        if (grindStep === 'grinding') {
            groundsRef.current.visible = true
             // Accumulate grounds
             if (groundsRef.current.scale.y < 1) {
                 groundsRef.current.scale.y += delta * 0.25
                 groundsRef.current.position.y += delta * 0.1
             }
        } else if (grindStep === 'idle' && !isGrinding) {
            groundsRef.current.visible = false
            groundsRef.current.scale.y = 0.1
            groundsRef.current.position.y = -0.4
        }
    }

    // Other Exploded View Logic
    if (bodyRef.current) {
        // Body stays relatively central
    }
  })

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      
      {/* Handle Group */}
      <group ref={handleRef} position={[0, 1.5, 0]}>
        {/* Arm */}
        <mesh 
            position={[0.5, 0, 0]}
            onClick={(e) => { e.stopPropagation(); onSelect('Crank Handle') }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Crank Handle') }}
            onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
        >
            <boxGeometry args={[1.2, 0.1, 0.2]} />
            <meshStandardMaterial {...getMaterialProps('Crank Handle')} color="#333333" />
        </mesh>
        {/* Knob */}
        <mesh 
            ref={knobRef}
            position={[1, 0.3, 0]}
            onClick={(e) => { e.stopPropagation(); onSelect('Knob') }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Knob') }}
            onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
        >
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial {...getMaterialProps('Knob')} color="#8b4513" roughness={0.6} />
        </mesh>
        
        {/* Shaft & Burr (Attached to handle) */}
        <group position={[0, -1.5, 0]}>
            <mesh position={[0, 0, 0]} scale={[0.1, 3, 0.1]}>
                <cylinderGeometry />
                <meshStandardMaterial {...getMaterialProps('Shaft')} color="#888888" metalness={0.8} />
            </mesh>
            <mesh position={[0, -1.5, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.3, 0.5, 16]} />
                <meshStandardMaterial {...getMaterialProps('Burr')} color="#555555" metalness={0.8} roughness={0.5} />
            </mesh>
        </group>
      </group>

      {/* Hopper Lid */}
      <mesh 
        ref={lidRef}
        position={[0, 1.2, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect('Hopper Lid') }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Hopper Lid') }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
      >
        <cylinderGeometry args={[0.55, 0.55, 0.1, 32]} />
        <meshStandardMaterial {...getMaterialProps('Hopper Lid')} color="#444444" transparent opacity={0.9} />
      </mesh>
      
      {/* Coffee Beans (Inside Hopper) */}
      <group ref={beansRef} position={[0, 0.8, 0]} visible={false} scale={[0.1, 0.1, 0.1]}>
           <mesh>
               <cylinderGeometry args={[0.45, 0.2, 0.5, 16]} />
               <meshStandardMaterial color="#3e2723" roughness={0.9} />
           </mesh>
           {/* Individual beans */}
            {Array.from({ length: 8 }).map((_, i) => (
                <mesh 
                    key={i} 
                    position={[
                        Math.sin(i) * 0.2, 
                        0.25 + Math.random() * 0.1, 
                        Math.cos(i) * 0.2
                    ]} 
                    rotation={[Math.random(), Math.random(), Math.random()]}
                >
                    <capsuleGeometry args={[0.06, 0.12, 4, 8]} />
                    <meshStandardMaterial color="#4e342e" roughness={0.8} />
                </mesh>
            ))}
      </group>

      {/* Main Body */}
      <mesh 
        ref={bodyRef}
        position={[0, 0.2, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect('Hand Grinder Body') }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Hand Grinder Body') }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
      >
        <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
        <meshStandardMaterial {...getMaterialProps('Hand Grinder Body')} color={selectedPart === 'Hand Grinder Body' ? '#ff9f1c' : '#222222'} />
      </mesh>
        {/* Textured Grip Area (Visual only) */}
        <mesh position={[0, 0.2, 0]} scale={[1.01, 0.8, 1.01]}>
             <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
             <meshStandardMaterial color="#111111" wireframe opacity={0.1} transparent />
        </mesh>


      {/* Catch Cup */}
      <mesh 
        ref={catchCupRef}
        position={[0, -0.8, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect('Catch Cup') }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Catch Cup') }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
      >
        <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
        <meshStandardMaterial {...getMaterialProps('Catch Cup')} color="#e0e0e0" metalness={0.5} />
        
        {/* Ground Coffee (Inside Catch Cup) */}
        <group ref={groundsRef} position={[0, -0.4, 0]} scale={[1, 0.1, 1]} visible={false}>
             <mesh>
                <cylinderGeometry args={[0.45, 0.45, 0.8, 32]} />
                <meshStandardMaterial color="#5d4037" roughness={1} />
             </mesh>
             {/* Pile effect on top */}
             <mesh position={[0, 0.4, 0]} rotation={[0, 0, 0]}>
                <coneGeometry args={[0.4, 0.2, 32]} />
                <meshStandardMaterial color="#5d4037" roughness={1} />
             </mesh>
        </group>
      </mesh>



    </group>
  )
}
