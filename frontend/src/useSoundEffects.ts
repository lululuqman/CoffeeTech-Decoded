import { useRef, useEffect, useCallback } from 'react';

type SoundType = 'grind' | 'brew' | 'steam' | 'pour' | 'slide';

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<Map<SoundType, AudioNode[]>>(new Map());

  useEffect(() => {
    // Initialize AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
    }
    
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const createNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  const playSound = useCallback((type: SoundType) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    
    // Resume context if suspended (browser policy)
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    // Stop if already playing to avoid overlap
    stopSound(type);

    const nodes: AudioNode[] = [];
    const mainGain = ctx.createGain();
    mainGain.connect(ctx.destination);
    nodes.push(mainGain);

    const now = ctx.currentTime;

    if (type === 'grind') {
        // Grinding: Low sawtooth + noise
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        // Modulate frequency slightly for irregularity
        osc.frequency.linearRampToValueAtTime(80, now + 0.1);
        
        const oscGain = ctx.createGain();
        oscGain.gain.value = 0.2;
        
        osc.connect(oscGain);
        oscGain.connect(mainGain);
        osc.start();
        nodes.push(osc, oscGain);

        // Add noise
        const noiseBuffer = createNoiseBuffer(ctx);
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;
        noiseSrc.loop = true;
        
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 800;
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.3;
        
        noiseSrc.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(mainGain);
        noiseSrc.start();
        nodes.push(noiseSrc, noiseFilter, noiseGain);

        // Envelope
        mainGain.gain.setValueAtTime(0, now);
        mainGain.gain.linearRampToValueAtTime(1, now + 0.1);

    } else if (type === 'brew') {
        // Brewing: Hissing noise (Bandpass)
        const noiseBuffer = createNoiseBuffer(ctx);
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;
        noiseSrc.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1;

        noiseSrc.connect(filter);
        filter.connect(mainGain);
        noiseSrc.start();
        nodes.push(noiseSrc, filter);
        
        // Rumble
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 50;
        const oscGain = ctx.createGain();
        oscGain.gain.value = 0.15;
        osc.connect(oscGain);
        oscGain.connect(mainGain);
        osc.start();
        nodes.push(osc, oscGain);

        mainGain.gain.setValueAtTime(0, now);
        mainGain.gain.linearRampToValueAtTime(0.5, now + 0.5);

    } else if (type === 'steam') {
        // Steam: High frequency noise + high sine
        const noiseBuffer = createNoiseBuffer(ctx);
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;
        noiseSrc.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;

        noiseSrc.connect(filter);
        filter.connect(mainGain);
        noiseSrc.start();
        nodes.push(noiseSrc, filter);

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 1500;
        const oscGain = ctx.createGain();
        oscGain.gain.value = 0.05;
        osc.connect(oscGain);
        oscGain.connect(mainGain);
        osc.start();
        nodes.push(osc, oscGain);
        
        mainGain.gain.setValueAtTime(0, now);
        mainGain.gain.linearRampToValueAtTime(0.3, now + 0.2);

    } else if (type === 'pour') {
        // Pouring: Filtered noise changing frequency
        const noiseBuffer = createNoiseBuffer(ctx);
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;
        noiseSrc.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.linearRampToValueAtTime(800, now + 2); // Rising pitch as filling

        noiseSrc.connect(filter);
        filter.connect(mainGain);
        noiseSrc.start();
        nodes.push(noiseSrc, filter);

        mainGain.gain.setValueAtTime(0, now);
        mainGain.gain.linearRampToValueAtTime(0.5, now + 0.1);

    } else if (type === 'slide') {
        // Sliding/Friction sound (White noise with lowpass sweep)
        const noiseBuffer = createNoiseBuffer(ctx);
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.linearRampToValueAtTime(300, now + 0.4);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.1);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        
        noiseSrc.connect(filter);
        filter.connect(gain);
        gain.connect(mainGain);
        noiseSrc.start();
        noiseSrc.stop(now + 0.6);
        nodes.push(noiseSrc, filter, gain);
    }

    activeNodesRef.current.set(type, nodes);

  }, []);

  const stopSound = useCallback((type: SoundType) => {
    if (!activeNodesRef.current.has(type)) return;
    
    const nodes = activeNodesRef.current.get(type);
    if (nodes) {
        // Fade out
        const mainGain = nodes[0] as GainNode; // First node is always the main gain
        if (mainGain && mainGain.gain) {
             const ctx = audioContextRef.current;
             if (ctx) {
                 mainGain.gain.cancelScheduledValues(ctx.currentTime);
                 mainGain.gain.setValueAtTime(mainGain.gain.value, ctx.currentTime);
                 mainGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
                 
                 setTimeout(() => {
                     nodes.forEach(node => {
                         try {
                             if (node instanceof AudioBufferSourceNode || node instanceof OscillatorNode) {
                                 node.stop();
                             }
                             node.disconnect();
                         } catch (e) {
                             // ignore
                         }
                     });
                 }, 150);
             }
        } else {
             nodes.forEach(node => node.disconnect());
        }
    }
    activeNodesRef.current.delete(type);
  }, []);

  return { playSound, stopSound };
}
