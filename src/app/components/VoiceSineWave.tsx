export function VoiceSineWave() {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      overflow: 'hidden'
    }}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 400 60" 
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          {/* Primary wave gradient - vibrant blues and cyans */}
          <linearGradient id="primaryWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#3b82f6" stopOpacity="1.0" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1.0" />
            <stop offset="75%" stopColor="#3b82f6" stopOpacity="1.0" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
          </linearGradient>
          
          {/* Secondary wave gradient - deeper purples */}
          <linearGradient id="secondaryWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.8" />
          </linearGradient>
          
          {/* Tertiary wave gradient - electric blues */}
          <linearGradient id="tertiaryWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.7" />
          </linearGradient>
          
          {/* Glow filter for professional effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background ambient glow layer */}
        <path
          d="M0,30 Q100,25 200,30 T400,30"
          stroke="url(#primaryWaveGradient)"
          strokeWidth="8"
          fill="none"
          opacity="0.3"
          filter="url(#glow)"
        >
          <animate
            attributeName="d"
            values="M0,30 Q100,25 200,30 T400,30;M0,30 Q100,35 200,30 T400,30;M0,30 Q100,25 200,30 T400,30"
            dur="8s"
            repeatCount="indefinite"
          />
        </path>
        
        {/* Primary dynamic wave - most prominent */}
        <path
          d="M0,30 Q100,10 200,30 T400,30"
          stroke="url(#primaryWaveGradient)"
          strokeWidth="3"
          fill="none"
          opacity="1.0"
          filter="url(#glow)"
        >
          <animate
            attributeName="d"
            values="M0,30 Q100,10 200,30 T400,30;M0,30 Q100,50 200,30 T400,30;M0,30 Q100,10 200,30 T400,30"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>
        
        {/* Secondary enthusiastic wave */}
        <path
          d="M0,30 Q50,20 100,30 Q150,40 200,30 Q250,20 300,30 Q350,40 400,30"
          stroke="url(#secondaryWaveGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.9"
        >
          <animate
            attributeName="d"
            values="M0,30 Q50,20 100,30 Q150,40 200,30 Q250,20 300,30 Q350,40 400,30;M0,30 Q50,40 100,30 Q150,20 200,30 Q250,40 300,30 Q350,20 400,30;M0,30 Q50,20 100,30 Q150,40 200,30 Q250,20 300,30 Q350,40 400,30"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>
        
        {/* Tertiary high-frequency wave for energy */}
        <path
          d="M0,30 Q25,25 50,30 Q75,35 100,30 Q125,25 150,30 Q175,35 200,30 Q225,25 250,30 Q275,35 300,30 Q325,25 350,30 Q375,35 400,30"
          stroke="url(#tertiaryWaveGradient)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.8"
        >
          <animate
            attributeName="d"
            values="M0,30 Q25,25 50,30 Q75,35 100,30 Q125,25 150,30 Q175,35 200,30 Q225,25 250,30 Q275,35 300,30 Q325,25 350,30 Q375,35 400,30;M0,30 Q25,35 50,30 Q75,25 100,30 Q125,35 150,30 Q175,25 200,30 Q225,35 250,30 Q275,25 300,30 Q325,35 350,30 Q375,25 400,30;M0,30 Q25,25 50,30 Q75,35 100,30 Q125,25 150,30 Q175,35 200,30 Q225,25 250,30 Q275,35 300,30 Q325,25 350,30 Q375,35 400,30"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>
        
        {/* Accent particles/dots for professional flair */}
        <circle cx="50" cy="30" r="1" fill="#06b6d4" opacity="0.8">
          <animate attributeName="cy" values="30;25;30" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="30" r="1" fill="#8b5cf6" opacity="0.7">
          <animate attributeName="cy" values="30;35;30" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="250" cy="30" r="1" fill="#3b82f6" opacity="0.9">
          <animate attributeName="cy" values="30;25;30" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;1;0.9" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="350" cy="30" r="1" fill="#06b6d4" opacity="0.8">
          <animate attributeName="cy" values="30;35;30" dur="3.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;1;0.8" dur="3.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
} 