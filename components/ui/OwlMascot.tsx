'use client'

interface OwlMascotProps {
  mode: 'idle' | 'tracking' | 'hiding' | 'peeking'
  pupilX?: number
  pupilY?: number
  size?: number
}

export default function OwlMascot({ mode, pupilX = 0, pupilY = 0, size = 140 }: OwlMascotProps) {
  const cx = size / 2
  const cy = size / 2
  const bodyR = size * 0.36

  // Eye geometry
  const eyeOffsetX  = size * 0.13
  const eyeOffsetY  = size * -0.06
  const eyeR        = size * 0.095
  const pupilR      = size * 0.052
  const pupilMax    = eyeR - pupilR - size * 0.006

  // Pupils
  const ePX = mode === 'peeking' ? -0.4 : pupilX
  const ePY = mode === 'peeking' ? -0.8 : pupilY
  const lPX = cx - eyeOffsetX + ePX * pupilMax
  const lPY = cy + eyeOffsetY + ePY * pupilMax
  const rPX = cx + eyeOffsetX + (mode === 'peeking' ? 0 : pupilX) * pupilMax
  const rPY = cy + eyeOffsetY + (mode === 'peeking' ? 0 : pupilY) * pupilMax

  // Wing pivots - sit at edge of face, mid-height
  const wingW      = size * 0.24
  const wingH      = size * 0.40
  const lPivotX    = cx - bodyR * 0.55
  const rPivotX    = cx + bodyR * 0.55
  const wingPivotY = cy + size * 0.03

  // ── ANIMATION VALUES ──

  // HEAD
  const headTY    = mode === 'tracking' ? size * 0.04 : 0
  const headSY    = mode === 'tracking' ? 0.95 : 1
  const headRot   = mode === 'peeking'  ? -10  : 0
  const headTrans = mode === 'hiding'
    ? 'transform 0.15s ease-in'
    : mode === 'peeking'
    ? 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1)'
    : 'transform 0.4s cubic-bezier(0.34,1.4,0.64,1)'

  // LEFT WING: hiding=-125, peeking=-65 (half cover), idle=0
  const lWingRot   = mode === 'hiding' ? -125 : mode === 'peeking' ? -65 : 0
  const lWingTrans = mode === 'hiding'
    ? 'transform 0.13s ease-in'
    : mode === 'peeking'
    ? 'transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94)'
    : 'transform 0.52s cubic-bezier(0.34,1.45,0.64,1)'

  // RIGHT WING: hiding=125, peeking=125 (stays up), idle=0
  const rWingRot   = (mode === 'hiding' || mode === 'peeking') ? 125 : 0
  const rWingTrans = mode === 'hiding'
    ? 'transform 0.13s ease-in'
    : mode === 'peeking'
    ? 'transform 0.18s ease-in'
    : 'transform 0.52s cubic-bezier(0.34,1.45,0.64,1)'

  // EYES: scale to 0 when hiding (blink as wings arrive)
  // In peeking: left eye visible (scale 1), right eye hidden (scale 0)
  const lEyeScale  = (mode === 'hiding') ? 0 : 1
  const rEyeScale  = (mode === 'hiding' || mode === 'peeking') ? 0 : 1
  const eyeTrans   = mode === 'hiding'
    ? 'transform 0.07s ease-in'
    : 'transform 0.28s cubic-bezier(0.34,1.6,0.64,1)'

  // GLASSES: scale down partially when hiding (wings cover them too)
  // hiding: scale to 0.15 (sliver still visible under wings edge)
  // peeking: left glasses fully show, right hidden
  const lGlassScale = mode === 'hiding' ? 0.15 : 1
  const rGlassScale = (mode === 'hiding' || mode === 'peeking') ? 0.15 : 1
  const glassTrans  = mode === 'hiding'
    ? 'transform 0.10s ease-in'
    : 'transform 0.3s cubic-bezier(0.34,1.4,0.64,1)'

  // ── STYLES ──
  const headStyle: React.CSSProperties = {
    transformOrigin: `${cx}px ${cy + bodyR * 0.4}px`,
    transition: headTrans,
    transform: `translateY(${headTY}px) scaleY(${headSY}) rotate(${headRot}deg)`,
  }
  const lWingStyle: React.CSSProperties = {
    transformOrigin: `${lPivotX}px ${wingPivotY}px`,
    transition: lWingTrans,
    transform: `rotate(${lWingRot}deg)`,
  }
  const rWingStyle: React.CSSProperties = {
    transformOrigin: `${rPivotX}px ${wingPivotY}px`,
    transition: rWingTrans,
    transform: `rotate(${rWingRot}deg)`,
  }

  // Glasses frame helper - rendered per-eye so each can animate independently
  const glassStyle = (scale: number): React.CSSProperties => ({
    transformOrigin: `${cx}px ${cy + eyeOffsetY}px`,
    transition: glassTrans,
    transform: `scale(${scale})`,
  })

  const lEyeStyle: React.CSSProperties = {
    transformOrigin: `${cx - eyeOffsetX}px ${cy + eyeOffsetY}px`,
    transition: eyeTrans,
    transform: `scale(${lEyeScale})`,
  }
  const rEyeStyle: React.CSSProperties = {
    transformOrigin: `${cx + eyeOffsetX}px ${cy + eyeOffsetY}px`,
    transition: eyeTrans,
    transform: `scale(${rEyeScale})`,
  }

  // Wing color - warm teal/slate, clearly distinct from navy body
  const wingFill    = '#3a6b8a'   // teal-blue, visible against dark bg
  const wingFeather = '#5a9abb'   // lighter highlight stripe
  const wingEdge    = '#2a5070'   // darker edge for depth

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Hoot the CodeRead owl"
      style={{ overflow: 'visible', filter: 'drop-shadow(0 6px 16px rgba(30,45,90,0.3))' }}
    >
      {/* ── 1. BODY ── */}
      <ellipse cx={cx} cy={cy + size*0.1} rx={bodyR} ry={bodyR*1.12} fill="#1e2d5a" />
      <ellipse cx={cx} cy={cy + size*0.22} rx={bodyR*0.42} ry={bodyR*0.26} fill="#2d4080" opacity={0.5} />

      {/* ── 2. HEAD BASE (under wings) ── */}
      <g style={headStyle}>
        <polygon points={`${cx-size*0.11},${cy-bodyR*0.78} ${cx-size*0.2},${cy-bodyR*1.22} ${cx-size*0.04},${cy-bodyR*0.9}`} fill="#162245" />
        <polygon points={`${cx+size*0.11},${cy-bodyR*0.78} ${cx+size*0.2},${cy-bodyR*1.22} ${cx+size*0.04},${cy-bodyR*0.9}`} fill="#162245" />
        <ellipse cx={cx} cy={cy-size*0.02} rx={bodyR*0.78} ry={bodyR*0.72} fill="#253370" />
      </g>

      {/* ── 3. GLASSES BASE (rendered UNDER wings so wings cover them) ── */}
      <g style={headStyle}>
        <g style={glassStyle(lGlassScale)}>
          <circle cx={cx - eyeOffsetX} cy={cy + eyeOffsetY} r={eyeR + size*0.016} fill="none" stroke="#c9932a" strokeWidth={size*0.024} />
        </g>
        <g style={glassStyle(rGlassScale)}>
          <circle cx={cx + eyeOffsetX} cy={cy + eyeOffsetY} r={eyeR + size*0.016} fill="none" stroke="#c9932a" strokeWidth={size*0.024} />
        </g>
        {/* Bridge always visible */}
        <line
          x1={cx - eyeOffsetX + eyeR + size*0.016} y1={cy + eyeOffsetY}
          x2={cx + eyeOffsetX - eyeR - size*0.016} y2={cy + eyeOffsetY}
          stroke="#c9932a" strokeWidth={size*0.022} strokeLinecap="round"
        />
        {/* Temple arms */}
        <line x1={cx-eyeOffsetX-eyeR-size*0.016} y1={cy+eyeOffsetY} x2={cx-bodyR*0.82} y2={cy+eyeOffsetY-size*0.016} stroke="#c9932a" strokeWidth={size*0.018} strokeLinecap="round" />
        <line x1={cx+eyeOffsetX+eyeR+size*0.016} y1={cy+eyeOffsetY} x2={cx+bodyR*0.82} y2={cy+eyeOffsetY-size*0.016} stroke="#c9932a" strokeWidth={size*0.018} strokeLinecap="round" />
      </g>

      {/* ── 4. WINGS (cover glasses AND eyes) ── */}
      <g style={lWingStyle}>
        {/* Wing body */}
        <ellipse cx={lPivotX} cy={wingPivotY + wingH*0.3} rx={wingW*0.54} ry={wingH*0.58} fill={wingFill} />
        {/* Wing edge shading */}
        <ellipse cx={lPivotX - wingW*0.08} cy={wingPivotY + wingH*0.3} rx={wingW*0.38} ry={wingH*0.52} fill={wingEdge} opacity={0.5} />
        {/* Feather highlight stripes */}
        <line x1={lPivotX-wingW*0.12} y1={wingPivotY+wingH*0.1} x2={lPivotX-wingW*0.26} y2={wingPivotY+wingH*0.65} stroke={wingFeather} strokeWidth={size*0.018} strokeLinecap="round" opacity={0.8} />
        <line x1={lPivotX+wingW*0.06} y1={wingPivotY+wingH*0.08} x2={lPivotX-wingW*0.04} y2={wingPivotY+wingH*0.68} stroke={wingFeather} strokeWidth={size*0.016} strokeLinecap="round" opacity={0.6} />
        <line x1={lPivotX+wingW*0.22} y1={wingPivotY+wingH*0.12} x2={lPivotX+wingW*0.18} y2={wingPivotY+wingH*0.62} stroke={wingFeather} strokeWidth={size*0.013} strokeLinecap="round" opacity={0.4} />
      </g>

      <g style={rWingStyle}>
        <ellipse cx={rPivotX} cy={wingPivotY + wingH*0.3} rx={wingW*0.54} ry={wingH*0.58} fill={wingFill} />
        <ellipse cx={rPivotX + wingW*0.08} cy={wingPivotY + wingH*0.3} rx={wingW*0.38} ry={wingH*0.52} fill={wingEdge} opacity={0.5} />
        <line x1={rPivotX+wingW*0.12} y1={wingPivotY+wingH*0.1} x2={rPivotX+wingW*0.26} y2={wingPivotY+wingH*0.65} stroke={wingFeather} strokeWidth={size*0.018} strokeLinecap="round" opacity={0.8} />
        <line x1={rPivotX-wingW*0.06} y1={wingPivotY+wingH*0.08} x2={rPivotX+wingW*0.04} y2={wingPivotY+wingH*0.68} stroke={wingFeather} strokeWidth={size*0.016} strokeLinecap="round" opacity={0.6} />
        <line x1={rPivotX-wingW*0.22} y1={wingPivotY+wingH*0.12} x2={rPivotX-wingW*0.18} y2={wingPivotY+wingH*0.62} stroke={wingFeather} strokeWidth={size*0.013} strokeLinecap="round" opacity={0.4} />
      </g>

      {/* ── 5. EYES + BEAK (on top so visible in idle/tracking) ── */}
      <g style={headStyle}>
        {/* Left eye */}
        <g style={lEyeStyle}>
          <circle cx={cx-eyeOffsetX} cy={cy+eyeOffsetY} r={eyeR} fill="white" />
          <circle cx={lPX} cy={lPY} r={pupilR} fill="#1a1a2e" />
          <circle cx={lPX-pupilR*0.35} cy={lPY-pupilR*0.35} r={pupilR*0.3} fill="white" opacity={0.8} />
        </g>
        {/* Right eye */}
        <g style={rEyeStyle}>
          <circle cx={cx+eyeOffsetX} cy={cy+eyeOffsetY} r={eyeR} fill="white" />
          <circle cx={rPX} cy={rPY} r={pupilR} fill="#1a1a2e" />
          <circle cx={rPX-pupilR*0.35} cy={rPY-pupilR*0.35} r={pupilR*0.3} fill="white" opacity={0.8} />
        </g>
        {/* Beak */}
        <polygon
          points={`${cx},${cy+size*0.085} ${cx-size*0.048},${cy+size*0.022} ${cx+size*0.048},${cy+size*0.022}`}
          fill="#e8a020"
        />
      </g>
    </svg>
  )
}