import { useMemo } from 'react';
import { motion } from 'framer-motion';

export interface RadarMetric {
    label: string;
    value: number; // 0-100
    fullMark: number; // Usually 100
}

interface PerformanceRadarProps {
    data: RadarMetric[];
    width?: number;
    height?: number;
    isDarkMode: boolean;
}

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

export default function PerformanceRadar({ data, width = 200, height = 200, isDarkMode }: PerformanceRadarProps) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 30; // Padding for labels
    
    // Calculate points for the data polygon
    const points = useMemo(() => {
        return data.map((metric, i) => {
            const angle = (360 / data.length) * i;
            const valueRadius = (metric.value / metric.fullMark) * radius;
            const { x, y } = polarToCartesian(centerX, centerY, valueRadius, angle);
            return `${x},${y}`;
        }).join(' ');
    }, [data, centerX, centerY, radius]);

    // Calculate background grid polygons (5 levels)
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];
    
    // Calculate label positions
    const labels = useMemo(() => {
        return data.map((metric, i) => {
            const angle = (360 / data.length) * i;
            const labelRadius = radius + 15;
            const { x, y } = polarToCartesian(centerX, centerY, labelRadius, angle);
            
            // Adjust label position based on angle to prevent overlap
            let anchor: "start" | "middle" | "end" = "middle";
            let baseline: "auto" | "hanging" | "middle" = "middle";

            if (angle === 0 || angle === 360) { anchor = "middle"; baseline = "auto"; } // Top
            else if (angle === 180) { anchor = "middle"; baseline = "hanging"; } // Bottom
            else if (angle > 0 && angle < 180) { anchor = "start"; } // Right side
            else { anchor = "end"; } // Left side

            return { x, y, label: metric.label, angle, anchor, baseline };
        });
    }, [data, centerX, centerY, radius]);

    const polygonFill = isDarkMode ? 'rgba(251, 146, 60, 0.2)' : 'rgba(234, 88, 12, 0.1)'; // Orange-400/600 with opacity
    const polygonStroke = isDarkMode ? '#fb923c' : '#ea580c';
    const gridStroke = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textFill = isDarkMode ? '#a3a3a3' : '#525252'; // Neutral-400/600

    return (
        <div className="flex flex-col items-center justify-center relative">
            <svg width={width} height={height} className="overflow-visible">
                {/* Background Grid */}
                {gridLevels.map((level, idx) => {
                    const levelPoints = data.map((_, i) => {
                        const angle = (360 / data.length) * i;
                        const levelRadius = radius * level;
                        const { x, y } = polarToCartesian(centerX, centerY, levelRadius, angle);
                        return `${x},${y}`;
                    }).join(' ');
                    
                    return (
                        <polygon
                            key={idx}
                            points={levelPoints}
                            fill="none"
                            stroke={gridStroke}
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Axes Lines */}
                {data.map((_, i) => {
                    const angle = (360 / data.length) * i;
                    const { x, y } = polarToCartesian(centerX, centerY, radius, angle);
                    return (
                        <line
                            key={`axis-${i}`}
                            x1={centerX}
                            y1={centerY}
                            x2={x}
                            y2={y}
                            stroke={gridStroke}
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data Polygon with Animation */}
                <motion.polygon
                    points={points}
                    fill={polygonFill}
                    stroke={polygonStroke}
                    strokeWidth="2"
                    initial={{ opacity: 0, scale: 0.8, transformOrigin: "center" }}
                    animate={{ opacity: 1, scale: 1, points: points }}
                    transition={{ duration: 0.6, ease: "circOut" }}
                />
                
                {/* Data Points (Dots) */}
                {data.map((metric, i) => {
                    const angle = (360 / data.length) * i;
                    const valueRadius = (metric.value / metric.fullMark) * radius;
                    const { x, y } = polarToCartesian(centerX, centerY, valueRadius, angle);
                    return (
                        <motion.circle
                            key={`dot-${i}`}
                            cx={x}
                            cy={y}
                            r="3"
                            fill={polygonStroke}
                            initial={{ scale: 0 }}
                            animate={{ cx: x, cy: y, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.1 * i }}
                        />
                    )
                })}

                {/* Labels */}
                {labels.map((l, i) => (
                    <text
                        key={`label-${i}`}
                        x={l.x}
                        y={l.y}
                        textAnchor={l.anchor}
                        alignmentBaseline={l.baseline}
                        fill={textFill}
                        fontSize="9"
                        fontWeight="600"
                        className="font-mono uppercase tracking-widest pointer-events-none select-none"
                    >
                        {l.label}
                    </text>
                ))}
            </svg>
        </div>
    );
}
