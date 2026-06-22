export default function Logo({ width = 120, height = 120, className = '' }) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ backgroundColor: '#ffffff' }}
    >
      {/* 3 Pillars (Angled top, flat bottom) */}
      
      {/* Center Pillar */}
      <path d="M100 15 L130 30 V160 L100 145 Z" fill="#000000"/>
      
      {/* Left Pillar */}
      <path d="M55 45 L85 60 V130 L55 115 Z" fill="#000000"/>
      
      {/* Right Pillar */}
      <path d="M145 45 L175 60 V130 L145 115 Z" fill="#000000"/>
      
      {/* Text Area */}
      {/* Line 1: PROM */}
      <text x="15" y="170" fontFamily="'Space Grotesk', sans-serif" fontSize="30" fontWeight="800" fill="#000000">PRO</text>
      <text x="82" y="170" fontFamily="'Space Grotesk', sans-serif" fontSize="30" fontWeight="800" fill="#913831">M</text>
      
      {/* Line 2: SPECSTROY */}
      <text x="15" y="195" fontFamily="'Space Grotesk', sans-serif" fontSize="24" fontWeight="800" letterSpacing="1.5" fill="#000000">SPECSTROY</text>
    </svg>
  );
}
