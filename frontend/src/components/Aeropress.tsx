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

export default function Aeropress({ exploded, onSelect, selectedPart, isBrewing, onBrewComplete, onStatusChange }: ModelProps) {
  const groupRef = useRef<Group>(null)
  const [hoveredPart, setHoveredPart] = useState<string | null>(null)
  const [brewStep, setBrewStep] = useState<'idle' | 'grounds' | 'water' | 'steeping' | 'pressing' | 'finished'>('idle')

  // Refs for animated parts
  const plungerRef = useRef<Group>(null)
  const chamberRef = useRef<Mesh>(null)
  const capRef = useRef<Group>(null)
  const filterRef = useRef<Mesh>(null)
  const coffeeRef = useRef<Group>(null)
  const waterRef = useRef<Mesh>(null)
  const mugLiquidRef = useRef<Mesh>(null)

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
            onStatusChange?.('Adding Hot Water')
            
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
      color: isSelected ? '#ff9f1c' : (isHovered ? '#ffffff' : '#333333'), // Dark plastic for Aeropress
      roughness: 0.4,
      metalness: 0.1,
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
        let targetY = exploded ? 3.0 : 0.5

        if (!exploded) {
            if (brewStep === 'grounds' || brewStep === 'water' || brewStep === 'steeping') {
                targetY = 2.5 // Lift plunger out
            } else if (brewStep === 'pressing') {
                // Animate pressing down
                 targetY = -0.8 // Pressed down position
                 plungerRef.current.position.y = MathUtils.lerp(plungerRef.current.position.y, targetY, delta * 0.5)
                 return
            } else if (brewStep === 'finished') {
                targetY = -0.8
            }
        }

        plungerRef.current.position.y = MathUtils.lerp(plungerRef.current.position.y, targetY, speed)
    }
    
    if (capRef.current) {
        // Cap drops down
        capRef.current.position.y = MathUtils.lerp(capRef.current.position.y, exploded ? -1.5 : -1.0, speed)
    }

    if (filterRef.current) {
        // Filter drops further down or stays with cap
        filterRef.current.position.y = MathUtils.lerp(filterRef.current.position.y, exploded ? -1.2 : -0.95, speed)
    }

    // Coffee Grounds Animation
    if (coffeeRef.current) {
        const targetScale = (brewStep !== 'idle' && brewStep !== 'finished') ? 1 : 0
        coffeeRef.current.scale.setScalar(MathUtils.lerp(coffeeRef.current.scale.x, targetScale, speed))
    }

    // Water/Coffee Liquid Animation (Inside Chamber)
    if (waterRef.current) {
        let targetHeight = 0
        let targetColor = '#aaddff' // Water color
        
        if (brewStep === 'water') {
            targetHeight = 1.0
        } else if (brewStep === 'steeping') {
            targetHeight = 1.0
            targetColor = '#3e2723' // Coffee color
        } else if (brewStep === 'pressing') {
             targetHeight = 0.1 // Being pressed out
             targetColor = '#3e2723'
        } else if (brewStep === 'finished') {
             targetHeight = 0
        }
        
        waterRef.current.scale.y = MathUtils.lerp(waterRef.current.scale.y, targetHeight > 0 ? targetHeight : 0.01, speed * 0.5)
         // @ts-ignore
         waterRef.current.material.color.lerp({ r: parseInt(targetColor.slice(1,3), 16)/255, g: parseInt(targetColor.slice(3,5), 16)/255, b: parseInt(targetColor.slice(5,7), 16)/255 }, delta)
    }

    // Mug Liquid Animation
    if (mugLiquidRef.current) {
        let targetHeight = 0
        if (brewStep === 'pressing' || brewStep === 'finished') {
            targetHeight = 0.8
        }
        mugLiquidRef.current.scale.y = MathUtils.lerp(mugLiquidRef.current.scale.y, targetHeight > 0 ? targetHeight : 0.01, speed * 0.5)
    }

  })

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      
      {/* Plunger Assembly */}
      <group ref={plungerRef} position={[0, 0.5, 0]}>
        {/* Plunger Body */}
        <mesh 
            position={[0, 1.0, 0]}
            onClick={(e) => { e.stopPropagation(); onSelect('Plunger') }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Plunger') }}
            onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
        >
            <cylinderGeometry args={[0.9, 0.9, 2.5, 32]} />
            <meshStandardMaterial {...getMaterialProps('Plunger')} color="#444444" transparent opacity={0.9} />
        </mesh>
        {/* Plunger Top Flange */}
        <mesh position={[0, 2.25, 0]}>
            <cylinderGeometry args={[1.2, 1.2, 0.1, 32]} />
            <meshStandardMaterial {...getMaterialProps('Plunger')} color="#333333" />
        </mesh>
        {/* Rubber Seal */}
        <mesh 
            position={[0, -0.25, 0]}
            onClick={(e) => { e.stopPropagation(); onSelect('Rubber Seal') }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Rubber Seal') }}
            onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
        >
            <cylinderGeometry args={[0.92, 0.92, 0.3, 32]} />
            <meshStandardMaterial {...getMaterialProps('Rubber Seal')} color="#111111" roughness={0.9} />
        </mesh>
      </group>

      {/* Chamber */}
      <group position={[0, 0.5, 0]}>
         <mesh 
            ref={chamberRef}
            position={[0, 0, 0]}
            onClick={(e) => { e.stopPropagation(); onSelect('Chamber') }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Chamber') }}
            onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
         >
            {/* Using a tube geometry via cylinder with open ends or subtractive? Simple cylinder with transparency for now */}
            <cylinderGeometry args={[1.0, 1.0, 2.6, 32, 1, true]} />
            <meshStandardMaterial {...getMaterialProps('Chamber')} color="#666666" transparent opacity={0.4} side={2} />
         </mesh>
         {/* Chamber Flange (Top) */}
         <mesh position={[0, 1.25, 0]}>
             <cylinderGeometry args={[1.3, 1.1, 0.1, 6]} /> {/* Hexagonal-ish flange */}
             <meshStandardMaterial {...getMaterialProps('Chamber')} color="#333333" />
         </mesh>
          {/* Chamber Flange (Bottom) */}
          <mesh position={[0, -1.25, 0]}>
             <cylinderGeometry args={[1.1, 1.1, 0.1, 32]} />
             <meshStandardMaterial {...getMaterialProps('Chamber')} color="#333333" />
         </mesh>
         {/* Numbers on side (Visual only) */}
         <mesh position={[0.95, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.5, 2]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
         </mesh>

         {/* Coffee/Water Liquid Inside Chamber */}
         <mesh ref={waterRef} position={[0, -1.2, 0]} scale={[1, 0.01, 1]}>
             {/* Pivot at bottom so it grows up */}
             <cylinderGeometry args={[0.95, 0.95, 2.4, 32]} />
             <meshPhysicalMaterial color="#aaddff" transmission={0.2} opacity={0.8} transparent roughness={0.2} />
         </mesh>

         {/* Coffee Grounds (Bottom) */}
         <group ref={coffeeRef} position={[0, -1.0, 0]} scale={[0, 0, 0]}>
            <mesh>
                <cylinderGeometry args={[0.95, 0.95, 0.3, 32]} />
                <meshStandardMaterial color="#3e2723" roughness={1} />
            </mesh>
         </group>

      </group>

      {/* Filter Cap */}
      <group ref={capRef} position={[0, -1.0, 0]}>
         <mesh 
            onClick={(e) => { e.stopPropagation(); onSelect('Filter Cap') }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Filter Cap') }}
            onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
         >
            <cylinderGeometry args={[1.1, 1.1, 0.3, 32]} />
            <meshStandardMaterial {...getMaterialProps('Filter Cap')} color="#111111" roughness={0.6} />
         </mesh>
         {/* Perforations texture hint */}
         <mesh position={[0, -0.16, 0]}>
             <cylinderGeometry args={[0.9, 0.9, 0.01, 32]} />
             <meshStandardMaterial color="#000000" wireframe />
         </mesh>
      </group>

      {/* Paper Filter */}
      <mesh 
        ref={filterRef}
        position={[0, -0.95, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect('Paper Filter') }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Paper Filter') }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null) }}
      >
        <cylinderGeometry args={[0.95, 0.95, 0.02, 32]} />
        <meshStandardMaterial {...getMaterialProps('Paper Filter')} color="#f0f0f0" roughness={0.9} />
      </mesh>

      {/* Mug/Cup (Visible during brewing) */}
      <group position={[0, -2.5, 0]}>
           <mesh>
               <cylinderGeometry args={[1.2, 1.0, 2.5, 32, 1, true]} />
               <meshStandardMaterial {...getMaterialProps('Mug')} color="#ffffff" side={2} />
           </mesh>
           <mesh position={[0, -1.25, 0]}>
               <cylinderGeometry args={[1.0, 1.0, 0.1, 32]} />
               <meshStandardMaterial {...getMaterialProps('Mug')} color="#ffffff" />
           </mesh>
           <mesh position={[0.8, 0, 0]} rotation={[0, 0, -0.2]}>
               <torusGeometry args={[0.6, 0.1, 16, 32, Math.PI]} />
               <meshStandardMaterial {...getMaterialProps('Mug')} color="#ffffff" />
           </mesh>
           
           {/* Coffee in Mug */}
           <mesh ref={mugLiquidRef} position={[0, -1.2, 0]} scale={[1, 0.01, 1]}>
               <cylinderGeometry args={[1.1, 0.9, 2.0, 32]} />
               <meshStandardMaterial color="#3e2723" roughness={0.3} />
           </mesh>
      </group>

    </group>
  )
}
