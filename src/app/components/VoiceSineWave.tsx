export function VoiceSineWave() {
  return (
    <div style={{ opacity: 0.8, width: '100%', height: '100%', position: 'relative' }}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 400 60" 
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        
        {/* Animated sine wave path */}
        <path
          d="M0,30 Q100,10 200,30 T400,30"
          stroke="url(#waveGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.8"
        >
          <animate
            attributeName="d"
            values="M0,30 Q100,10 200,30 T400,30;M0,30 Q100,50 200,30 T400,30;M0,30 Q100,10 200,30 T400,30"
            dur="6s"
            repeatCount="indefinite"
          />
        </path>
        
        {/* Secondary wave */}
        <path
          d="M0,30 Q50,20 100,30 Q150,40 200,30 Q250,20 300,30 Q350,40 400,30"
          stroke="url(#waveGradient)"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        >
          <animate
            attributeName="d"
            values="M0,30 Q50,20 100,30 Q150,40 200,30 Q250,20 300,30 Q350,40 400,30;M0,30 Q50,40 100,30 Q150,20 200,30 Q250,40 300,30 Q350,20 400,30;M0,30 Q50,20 100,30 Q150,40 200,30 Q250,20 300,30 Q350,40 400,30"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
} 