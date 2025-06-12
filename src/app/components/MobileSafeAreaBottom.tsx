import { useMobileDetection } from "./useMobileDetection";
import { VoiceSineWave } from "./VoiceSineWave";

export function MobileSafeAreaBottom() {
    const isMobile = useMobileDetection();
  
    // Don't render on desktop
    if (!isMobile) {
      // return null;
    }
  
    return (
      <div 
        style={{
          height: '80px',
          minHeight: '60px',
          backgroundColor: '#f8fafc', // Subtle background that matches app
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          flexShrink: 0,
          zIndex: 100000,
        }}
      >
        <VoiceSineWave />
      </div>
    );
  }