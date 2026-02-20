import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, GizmoHelper, GizmoViewport, Environment, ContactShadows } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, Minimize2, ChevronLeft, RotateCcw, ChevronDown, Play, Sun, Moon } from 'lucide-react'
import MokaPot from './MokaPot'
import EspressoMachine from './EspressoMachine'
import Grinder from './Grinder'
import HandGrinder from './HandGrinder'
import FrenchPress from './FrenchPress'
import Aeropress from './Aeropress'
import PerformanceRadar from './PerformanceRadar'

type EquipmentType = 'moka' | 'espresso' | 'grinder' | 'handGrinder' | 'frenchPress' | 'aeropress';

export default function Scene() {
  const [exploded, setExploded] = useState(false)
  const [selectedPart, setSelectedPart] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(true)
  const [equipment, setEquipment] = useState<EquipmentType>('moka')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isBrewing, setIsBrewing] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [statusMessage, setStatusMessage] = useState("")

  const handleBrewComplete = useCallback(() => {
    setIsBrewing(false)
    setStatusMessage("Ready")
  }, [])

  const handleEquipmentChange = (type: EquipmentType) => {
    setEquipment(type)
    setSelectedPart(null)
    setExploded(false)
    setIsDropdownOpen(false)
  }

  const getEquipmentName = (type: EquipmentType) => {
    switch(type) {
        case 'moka': return 'Moka Pot';
        case 'espresso': return 'Espresso Machine';
        case 'grinder': return 'Burr Grinder';
        case 'handGrinder': return 'Hand Grinder';
        case 'frenchPress': return 'French Press';
        case 'aeropress': return 'AeroPress';
    }
  }

  const getEquipmentDescription = (type: EquipmentType) => {
    switch(type) {
        case 'moka': return "Classic Italian stovetop maker producing strong, rich coffee by passing boiling water pressurized by steam through ground coffee.";
        case 'espresso': return "Uses high pressure to force hot water through a compacted 'puck' of coffee, creating a concentrated, rich shot with crema.";
        case 'grinder': return "Crushes beans between two abrasive surfaces (burrs) for a uniform grind size, essential for balanced extraction.";
        case 'handGrinder': return "Manual burr grinder offering portability and precision, perfect for slow coffee rituals and travel.";
        case 'frenchPress': return "Immersion brewing method where coarse grounds steep in hot water, producing a full-bodied and robust cup.";
        case 'aeropress': return "Versatile device using air pressure to push water through coffee and a paper filter, resulting in a clean, smooth cup.";
    }
  }

  const getTechSpecs = (type: EquipmentType) => {
    switch(type) {
        case 'moka': return [
            { label: 'Pressure', value: '1-2 bar' },
            { label: 'Temp', value: '96-99°C' },
            { label: 'Ratio', value: '1:7 - 1:10' },
            { label: 'Grind', value: 'Fine - Med' }
        ];
        case 'espresso': return [
            { label: 'Pressure', value: '8-10 bar' },
            { label: 'Temp', value: '90-96°C' },
            { label: 'Ratio', value: '1:1.5 - 1:2.5' },
            { label: 'Grind', value: 'Very Fine' }
        ];
        case 'grinder': return [
            { label: 'Burrs', value: 'Flat/Conical' },
            { label: 'RPM', value: '800-1400' },
            { label: 'Retention', value: '0.1-0.5g' },
            { label: 'Use', value: 'All Methods' }
        ];
        case 'handGrinder': return [
            { label: 'Burrs', value: 'Conical' },
            { label: 'Speed', value: '60-120 RPM' },
            { label: 'Heat', value: 'Negligible' },
            { label: 'Portability', value: 'Max' }
        ];
        case 'frenchPress': return [
            { label: 'Temp', value: '92-96°C' },
            { label: 'Time', value: '4-8 min' },
            { label: 'Ratio', value: '1:12 - 1:16' },
            { label: 'Grind', value: 'Coarse' }
        ];
        case 'aeropress': return [
            { label: 'Pressure', value: '0.5-0.7 bar' },
            { label: 'Temp', value: '80-96°C' },
            { label: 'Time', value: '1-3 min' },
            { label: 'Grind', value: 'Fine - Med' }
        ];
    }
  }

  const getPerformanceData = (type: EquipmentType) => {
    switch(type) {
        case 'moka': return [
            { label: 'Body', value: 90, fullMark: 100 },
            { label: 'Acidity', value: 30, fullMark: 100 },
            { label: 'Complexity', value: 50, fullMark: 100 },
            { label: 'Clarity', value: 40, fullMark: 100 },
            { label: 'Sweetness', value: 60, fullMark: 100 }
        ];
        case 'espresso': return [
            { label: 'Body', value: 100, fullMark: 100 },
            { label: 'Acidity', value: 60, fullMark: 100 },
            { label: 'Complexity', value: 80, fullMark: 100 },
            { label: 'Clarity', value: 50, fullMark: 100 },
            { label: 'Sweetness', value: 70, fullMark: 100 }
        ];
        case 'frenchPress': return [
            { label: 'Body', value: 90, fullMark: 100 },
            { label: 'Acidity', value: 40, fullMark: 100 },
            { label: 'Complexity', value: 60, fullMark: 100 },
            { label: 'Clarity', value: 30, fullMark: 100 },
            { label: 'Sweetness', value: 60, fullMark: 100 }
        ];
        case 'aeropress': return [
            { label: 'Body', value: 60, fullMark: 100 },
            { label: 'Acidity', value: 70, fullMark: 100 },
            { label: 'Complexity', value: 70, fullMark: 100 },
            { label: 'Clarity', value: 80, fullMark: 100 },
            { label: 'Sweetness', value: 70, fullMark: 100 }
        ];
        case 'grinder': return [
            { label: 'Uniformity', value: 90, fullMark: 100 },
            { label: 'Speed', value: 80, fullMark: 100 },
            { label: 'Heat', value: 90, fullMark: 100 },
            { label: 'Workflow', value: 85, fullMark: 100 },
            { label: 'Value', value: 70, fullMark: 100 }
        ];
        case 'handGrinder': return [
            { label: 'Uniformity', value: 85, fullMark: 100 },
            { label: 'Speed', value: 40, fullMark: 100 },
            { label: 'Heat', value: 100, fullMark: 100 },
            { label: 'Workflow', value: 60, fullMark: 100 },
            { label: 'Value', value: 90, fullMark: 100 }
        ];
    }
  }

  const getGlossary = (type: EquipmentType) => {
    if (type === 'grinder' || type === 'handGrinder') {
        return [
            { term: 'Uniformity', def: 'Consistency of particle size' },
            { term: 'Speed', def: 'Grinding rate (g/sec)' },
            { term: 'Heat', def: 'Heat generation during grinding' },
            { term: 'Workflow', def: 'Ease of use and cleaning' },
            { term: 'Value', def: 'Performance to price ratio' }
        ];
    } else {
        return [
            { term: 'Body', def: 'Physical weight/texture in mouth' },
            { term: 'Acidity', def: 'Bright, lively, tangy sensation' },
            { term: 'Complexity', def: 'Layering of different flavors' },
            { term: 'Clarity', def: 'Ability to distinguish flavors' },
            { term: 'Sweetness', def: 'Perceived sugary/fruity notes' }
        ];
    }
  }

  return (
    <div className={`h-screen w-full font-sans overflow-hidden relative selection:bg-orange-500 selection:text-white transition-colors duration-500 ${isDarkMode ? 'bg-neutral-950 text-white' : 'bg-[#e3f2fd] text-neutral-900'}`}>
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [4, 4, 6], fov: 45 }}>
          <color attach="background" args={[isDarkMode ? '#101010' : '#e3f2fd']} />
          <Environment preset="studio" />
          <ambientLight intensity={0.3} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          
          <group position={[0, -0.5, 0]}>
            <AnimatePresence mode="wait">
                {equipment === 'moka' && (
                    <MokaPot 
                        key="moka"
                        exploded={exploded} 
                        onSelect={(part: string) => { setSelectedPart(part); setShowInfo(true); }}
                        selectedPart={selectedPart}
                        isBrewing={isBrewing}
                        onBrewComplete={handleBrewComplete}
                        onStatusChange={setStatusMessage}
                    />
                )}
                {equipment === 'espresso' && (
                    <EspressoMachine 
                        key="espresso"
                        exploded={exploded} 
                        onSelect={(part: string) => { setSelectedPart(part); setShowInfo(true); }}
                        selectedPart={selectedPart}
                        isBrewing={isBrewing}
                        onBrewComplete={handleBrewComplete}
                        onStatusChange={setStatusMessage}
                    />
                )}
                {equipment === 'grinder' && (
                    <Grinder 
                        key="grinder"
                        exploded={exploded} 
                        onSelect={(part: string) => { setSelectedPart(part); setShowInfo(true); }}
                        selectedPart={selectedPart}
                        isGrinding={isBrewing}
                        onGrindComplete={handleBrewComplete}
                        onStatusChange={setStatusMessage}
                    />
                )}
                {equipment === 'handGrinder' && (
                    <HandGrinder 
                        key="handGrinder"
                        exploded={exploded} 
                        onSelect={(part) => { setSelectedPart(part); setShowInfo(true); }}
                        selectedPart={selectedPart}
                        isGrinding={isBrewing}
                        onGrindComplete={handleBrewComplete}
                        onStatusChange={setStatusMessage}
                    />
                )}
                {equipment === 'frenchPress' && (
                    <FrenchPress 
                        key="frenchPress"
                        exploded={exploded} 
                        onSelect={(part) => { setSelectedPart(part); setShowInfo(true); }}
                        selectedPart={selectedPart}
                        isBrewing={isBrewing}
                        onBrewComplete={handleBrewComplete}
                        onStatusChange={setStatusMessage}
                    />
                )}
                {equipment === 'aeropress' && (
                    <Aeropress 
                        key="aeropress"
                        exploded={exploded} 
                        onSelect={(part) => { setSelectedPart(part); setShowInfo(true); }}
                        selectedPart={selectedPart}
                        isBrewing={isBrewing}
                        onBrewComplete={handleBrewComplete}
                        onStatusChange={setStatusMessage}
                    />
                )}
            </AnimatePresence>
            <ContactShadows position={[0, -2.25, 0]} resolution={1024} scale={10} blur={1} opacity={0.5} far={10} color="#000000" />
          </group>

          <gridHelper position={[0, -2.75, 0]} args={[60, 60, isDarkMode ? 0x666666 : 0x555555, isDarkMode ? 0x222222 : 0xaaaaaa]} />
          
          <OrbitControls enablePan={false} minPolarAngle={0} maxPolarAngle={Math.PI / 1.5} />
          <GizmoHelper alignment="top-right" margin={[80, 80]}>
            <GizmoViewport axisColors={['#ff3e3e', '#4caf50', '#2196f3']} labelColor={isDarkMode ? "white" : "black"} />
          </GizmoHelper>
        </Canvas>
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        
        {/* Header */}
        <header className="flex justify-start items-start gap-8 pointer-events-auto relative z-30">
          {/* Equipment Selector Dropdown & Description */}
          <div className="flex flex-col gap-4">
              <div className="relative">
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-2 backdrop-blur-md border rounded-xl px-4 py-2 transition-all text-sm font-medium ${isDarkMode ? 'bg-white/10 hover:bg-white/20 border-white/10 text-neutral-200' : 'bg-black/5 hover:bg-black/10 border-black/5 text-neutral-800'}`}
                >
                    {getEquipmentName(equipment)}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`absolute left-0 top-full mt-2 w-48 backdrop-blur-xl border rounded-xl overflow-hidden shadow-2xl flex flex-col z-50 ${isDarkMode ? 'bg-neutral-900/90 border-white/10' : 'bg-white/90 border-black/5'}`}
                        >
                            <button 
                                onClick={() => handleEquipmentChange('moka')}
                                className={`px-4 py-3 text-left text-sm transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'} ${equipment === 'moka' ? 'text-orange-400 font-semibold' : (isDarkMode ? 'text-neutral-300' : 'text-neutral-600')}`}
                            >
                                Moka Pot
                            </button>
                            <button 
                                onClick={() => handleEquipmentChange('espresso')}
                                className={`px-4 py-3 text-left text-sm transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'} ${equipment === 'espresso' ? 'text-orange-400 font-semibold' : (isDarkMode ? 'text-neutral-300' : 'text-neutral-600')}`}
                            >
                                Espresso Machine
                            </button>
                            <button 
                                onClick={() => handleEquipmentChange('grinder')}
                                className={`px-4 py-3 text-left text-sm transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'} ${equipment === 'grinder' ? 'text-orange-400 font-semibold' : (isDarkMode ? 'text-neutral-300' : 'text-neutral-600')}`}
                            >
                                Burr Grinder
                            </button>
                            <button 
                                onClick={() => handleEquipmentChange('handGrinder')}
                                className={`px-4 py-3 text-left text-sm transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'} ${equipment === 'handGrinder' ? 'text-orange-400 font-semibold' : (isDarkMode ? 'text-neutral-300' : 'text-neutral-600')}`}
                            >
                                Hand Grinder
                            </button>
                            <button 
                                onClick={() => handleEquipmentChange('frenchPress')}
                                className={`px-4 py-3 text-left text-sm transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'} ${equipment === 'frenchPress' ? 'text-orange-400 font-semibold' : (isDarkMode ? 'text-neutral-300' : 'text-neutral-600')}`}
                            >
                                French Press
                            </button>
                            <button 
                                onClick={() => handleEquipmentChange('aeropress')}
                                className={`px-4 py-3 text-left text-sm transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'} ${equipment === 'aeropress' ? 'text-orange-400 font-semibold' : (isDarkMode ? 'text-neutral-300' : 'text-neutral-600')}`}
                            >
                                AeroPress
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
              </div>

              <motion.p 
                key={equipment}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`w-64 text-xs font-light leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}
              >
                {getEquipmentDescription(equipment)}
              </motion.p>
          </div>

          <div className="pt-1">
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-200">
              CoffeeTech Decoded
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Interactive {getEquipmentName(equipment)} Explorer</p>
          </div>
        </header>

        {/* Tech Specs Panel */}
        <div className={`absolute top-0 right-[160px] pt-[40px] pr-6 pointer-events-none flex flex-col items-end z-20`}>
             <motion.div 
                key={equipment}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`flex flex-col gap-3 items-end`}
             >
                <span className={`text-[10px] uppercase tracking-widest font-semibold ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>Tech Specs</span>
                <div className="flex flex-col gap-2 items-end">
                    {getTechSpecs(equipment).map((spec, i) => (
                        <div key={i} className={`flex items-center gap-3 text-xs font-mono border-r-2 pr-3 py-0.5 ${isDarkMode ? 'border-white/10 text-neutral-400' : 'border-black/10 text-neutral-600'}`}>
                            <span className={isDarkMode ? 'text-neutral-600' : 'text-neutral-400'}>{spec.label}</span>
                            <span className={`font-semibold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{spec.value}</span>
                        </div>
                    ))}
                </div>
             </motion.div>

             {/* Performance Radar */}
             <motion.div
                key={`${equipment}-radar`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex flex-col items-end gap-2"
             >
                 <span className={`text-[10px] uppercase tracking-widest font-semibold ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    {(equipment === 'grinder' || equipment === 'handGrinder') ? 'Performance' : 'Flavor Profile'}
                 </span>
                 <PerformanceRadar 
                    data={getPerformanceData(equipment)!} 
                    isDarkMode={isDarkMode} 
                    width={180} 
                    height={180} 
                 />
             </motion.div>
        </div>

        {/* Gizmo Legend Panel & Glossary */}
        <div className="absolute top-0 right-0 w-[160px] z-20 pointer-events-none flex flex-col">
            {/* Orientation - With Background */}
            <div className={`pt-[140px] pb-4 px-4 backdrop-blur-[1px] rounded-bl-3xl border-l border-b flex flex-col gap-2 items-center w-full ${isDarkMode ? 'bg-gradient-to-b from-transparent via-black/20 to-black/40 border-white/5' : 'bg-gradient-to-b from-transparent via-white/40 to-white/60 border-black/5'}`}>
                <span className={`text-[10px] uppercase tracking-widest font-semibold mb-1 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>Orientation</span>
                <div className="w-full space-y-1.5">
                    <div className={`flex items-center justify-between text-[10px] font-mono ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        <span>X-Axis</span>
                        <div className="flex items-center gap-1.5">
                            <span className={isDarkMode ? 'text-white/60' : 'text-black/60'}>Right</span>
                            <div className="w-2 h-2 rounded-full bg-[#ff3e3e] shadow-[0_0_8px_rgba(255,62,62,0.5)]"></div>
                        </div>
                    </div>
                    <div className={`flex items-center justify-between text-[10px] font-mono ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        <span>Y-Axis</span>
                        <div className="flex items-center gap-1.5">
                            <span className={isDarkMode ? 'text-white/60' : 'text-black/60'}>Up</span>
                            <div className="w-2 h-2 rounded-full bg-[#4caf50] shadow-[0_0_8px_rgba(76,175,80,0.5)]"></div>
                        </div>
                    </div>
                    <div className={`flex items-center justify-between text-[10px] font-mono ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        <span>Z-Axis</span>
                        <div className="flex items-center gap-1.5">
                            <span className={isDarkMode ? 'text-white/60' : 'text-black/60'}>Front</span>
                            <div className="w-2 h-2 rounded-full bg-[#2196f3] shadow-[0_0_8px_rgba(33,150,243,0.5)]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mini Glossary - No Background */}
            <div className="px-4 py-4 w-full flex flex-col gap-3">
                <span className={`text-[10px] uppercase tracking-widest font-semibold ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    Glossary
                </span>
                <div className="flex flex-col gap-2.5">
                    {getGlossary(equipment).map((item, i) => (
                        <div key={i} className="flex flex-col gap-0.5">
                            <span className={`text-[10px] font-bold ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                                {item.term}
                            </span>
                            <span className={`text-[9px] leading-tight font-medium ${isDarkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                                {item.def}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Main Content Area (Empty for center view) */}
        <div className="flex-1 flex items-center justify-start">
            {/* Side Info Panel */}
            <AnimatePresence>
              {selectedPart && showInfo && (
                <motion.div 
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  className={`w-80 backdrop-blur-md border rounded-2xl p-6 pointer-events-auto shadow-2xl ${isDarkMode ? 'bg-black/60 border-white/10' : 'bg-white/60 border-black/5'}`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-orange-400">{selectedPart}</h2>
                    <button onClick={() => setShowInfo(false)} className={`hover:text-orange-400 transition-colors ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        <ChevronLeft />
                    </button>
                  </div>
                  <p className={`leading-relaxed text-sm ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    {getPartDescription(selectedPart, equipment)}
                  </p>
                  <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
                     <span className={`text-xs uppercase tracking-widest font-semibold ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>Status</span>
                     <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Operational</span>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
        </div>

        {/* Bottom Controls */}
        <div className="flex justify-center items-end pointer-events-auto pb-4">
          <div className={`backdrop-blur-xl border rounded-full px-4 py-3 flex gap-4 shadow-lg items-center ${isDarkMode ? 'bg-black/50 border-white/10' : 'bg-white/50 border-black/5'}`}>
             <ControlTooltip label={exploded ? "Collapse View" : "Explode View"}>
                <button 
                  onClick={() => setExploded(!exploded)}
                  className={`p-3 rounded-full transition-all duration-300 shadow-md ${exploded ? 'bg-orange-500 text-white ring-2 ring-orange-500 ring-offset-2 ring-offset-black' : (isDarkMode ? 'bg-white/10 text-neutral-200 hover:bg-white/20' : 'bg-black/5 text-neutral-700 hover:bg-black/10')}`}
                >
                  {exploded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
             </ControlTooltip>
             
             <div className={`w-px h-8 mx-1 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>

             <ControlTooltip label="Reset Selection">
                <button 
                  onClick={() => { setSelectedPart(null); setShowInfo(false); }}
                  className={`p-3 rounded-full transition-colors ${isDarkMode ? 'bg-white/5 text-neutral-300 hover:bg-white/10' : 'bg-black/5 text-neutral-600 hover:bg-black/10'}`}
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
             </ControlTooltip>

             <div className={`w-px h-8 mx-1 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>

             <ControlTooltip label={isBrewing ? "Processing..." : "Start Process"}>
                <button 
                  onClick={() => setIsBrewing(true)}
                  disabled={isBrewing || (equipment !== 'moka' && equipment !== 'espresso' && equipment !== 'grinder' && equipment !== 'handGrinder' && equipment !== 'frenchPress' && equipment !== 'aeropress')}
                  className={`p-3 rounded-full transition-all duration-300 shadow-md ${isBrewing ? 'bg-orange-500/50 text-white cursor-not-allowed' : (equipment === 'moka' || equipment === 'espresso' || equipment === 'grinder' || equipment === 'handGrinder' || equipment === 'frenchPress' || equipment === 'aeropress' ? 'bg-orange-500 text-white hover:bg-orange-600' : (isDarkMode ? 'bg-white/5 text-neutral-500 cursor-not-allowed' : 'bg-black/5 text-neutral-400 cursor-not-allowed'))}`}
                >
                  <Play className={`w-5 h-5 ${isBrewing ? 'animate-pulse' : ''}`} fill="currentColor" />
                </button>
             </ControlTooltip>
          </div>
        </div>

        {/* Animation Status - Bottom Right */}
        <div className="absolute bottom-6 right-6 pointer-events-none">
            <AnimatePresence>
                {isBrewing && statusMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className={`backdrop-blur-xl border rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-4 ${isDarkMode ? 'bg-black/60 border-white/10' : 'bg-white/60 border-black/5'}`}
                    >
                        <div className="relative w-3 h-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                        </div>
                        <div>
                            <p className={`text-[10px] uppercase tracking-widest font-bold mb-0.5 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>Status</p>
                            <p className={`text-sm font-medium whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{statusMessage}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Theme Toggle - Bottom Left */}
        <div className="absolute bottom-6 left-6 pointer-events-auto flex gap-3">
            <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-3 rounded-full transition-all duration-300 shadow-lg border ${isDarkMode ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-white/80 border-black/5 text-neutral-800 hover:bg-white'}`}
            >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
        </div>

      </div>
    </div>
  )
}

function ControlTooltip({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="group relative flex flex-col items-center">
            {children}
            <div className="absolute bottom-full mb-3 px-2 py-1 bg-neutral-900 text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                {label}
            </div>
        </div>
    )
}

function getPartDescription(part: string, equipment: EquipmentType): string {
  switch (part) {
    // Shared Parts (Disambiguated by Equipment Type)
    case 'Lid':
        if (equipment === 'moka') {
            return "Keeps the coffee from splattering while brewing and maintains the temperature. Always keep it down during brewing!"
        } else if (equipment === 'frenchPress') {
            return "Covers the beaker to retain heat and keeps the plunger rod aligned vertically."
        }
        return "A cover for the equipment."
    case 'Handle':
        if (equipment === 'moka') {
            return "Made of heat-resistant material (historically Bakelite), allowing you to pour the hot coffee safely without burning your hand."
        } else if (equipment === 'frenchPress') {
            return "Keeps your hand safe from the hot glass while pouring your brew."
        }
        return "A handle for holding or operating the equipment."

    // Moka Pot Specific
    case 'Boiler':
      return "The bottom chamber that holds the water. When heated, pressure builds up here, forcing boiling water up through the coffee grounds."
    case 'Filter Funnel':
      return "Holds the ground coffee. It sits inside the boiler. As water boils, it passes through this funnel, extracting the coffee flavors."
    case 'Collection Chamber':
      return "The top chamber where the brewed coffee ends up. It has a central column that the coffee spills out of."
    case 'Spout':
      return "The V-shaped lip that ensures a smooth, drip-free pour of your delicious espresso-like coffee."
    
    // Espresso Machine Specific
    case 'Main Body':
      return "The housing that contains the boiler, pump, and electronics. It provides stability and style to the machine."
    case 'Group Head':
      return "The component where the portafilter locks in. Hot water is dispersed from here through the coffee puck."
    case 'Portafilter':
      return "The handle and basket assembly that holds the ground coffee. It locks into the group head for brewing."
    case 'Drip Tray':
      return "Catches any spilled water or coffee. It needs to be emptied and cleaned regularly."
    case 'Water Tank':
      return "Reservoir holding fresh water. It can be removable or plumbed directly into a water line."
    case 'Steam Wand':
      return "Used to steam and froth milk for cappuccinos and lattes. Be careful, it gets very hot!"

    // Grinder Specific
    case 'Grinder Body':
      return "Houses the motor and electronics. Heavy construction helps reduce vibration during grinding."
    case 'Bean Hopper':
      return "Holds the whole coffee beans before they are ground. Usually made of clear plastic to see the bean level."
    case 'Adjustment Collar':
      return "Allows you to change the grind size by moving the burrs closer together (finer) or further apart (coarser)."
    case 'Chute':
      return "Directs the ground coffee from the burr chamber into the catch bin or portafilter."
    case 'Grounds Bin':
    case 'Catch Bin':
      return "Collects the ground coffee. Some grinders dispense directly into a portafilter instead."
    case 'Base':
      return "Provides a stable foundation for the grinder, often with rubber feet to prevent slipping."

    // Hand Grinder Specific
    case 'Hand Grinder Body':
        return "The main cylindrical body that houses the burr set. It's designed to be held firmly in one hand while grinding."
    case 'Crank Handle':
        return "The lever arm that provides the mechanical advantage needed to rotate the burrs and crush the coffee beans manually."
    case 'Hopper Lid':
        return "Keeps the beans from popping out while you grind. Essential for vigorous grinding sessions!"
    case 'Knob':
        return "The ergonomic grip at the end of the handle. It spins freely to allow for smooth, continuous rotation."
    case 'Catch Cup':
        return "The bottom container that collects the ground coffee. It screws or magnetically attaches to the body."

    // French Press Specific
    case 'Plunger Knob':
        return "Allows you to push the plunger down safely and comfortably after the coffee has steeped."
    case 'Filter Assembly':
        return "The heart of the press. It pushes the grounds to the bottom while letting oils and water through."
    case 'Filter Mesh':
        return "A fine metal screen that traps coffee grounds but allows natural oils to pass, creating a full-bodied brew."
    case 'Glass Beaker':
        return "Heat-resistant borosilicate glass vessel where the coffee steeps (immerses) in hot water."
    case 'Frame':
        return "Protects the fragile glass beaker and provides a sturdy base and handle."

    // AeroPress Specific
    case 'Plunger':
        return "The inner cylinder that you push down. It creates air pressure to force water through the coffee."
    case 'Rubber Seal':
        return "Creates an airtight seal against the chamber walls, generating the pressure needed for rapid extraction."
    case 'Chamber':
        return "Holds the coffee and water. The hexagonal flange rests on your mug during pressing."
    case 'Filter Cap':
        return "The perforated cap that holds the paper filter and screws securely onto the bottom of the chamber."
    case 'Paper Filter':
        return "Removes almost all sediment and oils, resulting in a very clean, smooth, and sediment-free cup."

    default:
      return "Select a part to learn more."
  }
}
