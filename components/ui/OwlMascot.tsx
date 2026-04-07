'use client'

import { useEffect, useRef } from 'react'

interface OwlMascotProps {
  mode: 'idle' | 'tracking' | 'hiding' | 'peeking'
  pupilX?: number
  pupilY?: number
  size?: number
}

export default function OwlMascot({ mode, pupilX = 0, pupilY = 0, size = 140 }: OwlMascotProps) {
  const prevMode = useRef(mode)

  useEffect(() => {
    prevMode.current = mode
  }, [mode])

  const cx = size / 2
  const cy = size / 2

  const bodyR = size * 0.36

  // Eye geometry
  const eyeOffsetX = size * 0.13
  const eyeOffsetY = size * -0.06
  const eyeR = size * 0.095
  const pupilR = size * 0.052
  const pupilMaxOffset = eyeR - pupilR - size * 0.006

  // Peeking: one eye glances up nervously
  const effectivePupilX = mode === 'peeking' ? -0.4 : pupilX
  const effectivePupilY = mode === 'peeking' ? -0.8 : pupilY

  const leftPupilX  = cx - eyeOffsetX + effectivePupilX * pupilMaxOffset
  const leftPupilY  = cy + eyeOffsetY + effectivePupilY * pupilMaxOffset
  const rightPupilX = cx + eyeOffsetX + (mode === 'peeking' ? 0 : pupilX) * pupilMaxOffset
  const rightPupilY = cy + eyeOffsetY + (mode === 'peeking' ? 0 : pupilY) * pupilMaxOffset

  // Wing pivot points at body edge, mid height
  const wingW = size * 0.22
  const wingH = size * 0.38
  const leftPivotX  = cx - bodyR * 0.52
  const rightPivotX = cx + bodyR * 0.52
  const wingPivotY  = cy + size * 0.05

  // HEAD - bobs down slightly when tracking
  const headTranslateY = mode === 'tracking' ? size * 0.04 : 0
  const headScaleY     = mode === 'tracking' ? 0.95 : 1
  const headRotate     = mode === 'peeking'  ? -10  : 0
  const headTransition = mode === 'hiding'
    ? 'transform 0.15s ease-in'
    : mode === 'peeking'
    ? 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)'
    : 'transform 0.4s cubic-bezier(0.34, 1.4, 0.64, 1)'

  // LEFT WING
  // hiding  -> snaps up fast (-118deg covers left eye)
  // peeking -> creeps down to -60deg (half-cover, sneaky)
  // idle    -> springs back to 0
  const leftWingRot = mode === 'hiding' ? -118 : mode === 'peeking' ? -62 : 0
  const leftWingTrans = mode === 'hiding'
    ? 'transform 0.14s ease-in'
    : mode === 'peeking'
    ? 'transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    : 'transform 0.52s cubic-bezier(0.34, 1.45, 0.64, 1)'

  // RIGHT WING
  // hiding  -> snaps up fast (118deg covers right eye)
  // peeking -> stays fully up (118deg) - blocks right eye
  // idle    -> springs back to 0
  const rightWingRot = (mode === 'hiding' || mode === 'peeking') ? 118 : 0
  const rightWingTrans = mode === 'hiding'
    ? 'transform 0.14s ease-in'
    : mode === 'peeking'
    ? 'transform 0.18s ease-in'
    : 'transform 0.52s cubic-bezier(0.34, 1.45, 0.64, 1)'

  // BLINK animation - tiny scale pulse on eyes when switching to hiding
  const eyeScale = mode === 'hiding' ? 0 : 1
  const eyeTransition = mode === 'hiding'
    ? 'transform 0.08s ease-in'
    : 'transform 0.25s cubic-bezier(0.34, 1.6, 0.64, 1)'

  const headStyle: React.CSSProperties = {
    transformOrigin: `${cx}px ${cy + bodyR * 0.4}px`,
    transition: headTransition,
    transform: `translateY(${headTranslateY}px) scaleY(${headScaleY}) rotate(${headRotate}deg)`,
  }

  const leftWingStyle: React.CSSProperties = {
    transformOrigin: `${leftPivotX}px ${wingPivotY}px`,
    transition: leftWingTrans,
    transform: `rotate(${leftWingRot}deg)`,
  }

  const rightWingStyle: React.CSSProperties = {
    transformOrigin: `${rightPivotX}px ${wingPivotY}px`,
    transition: rightWingTrans,
    transform: `rotate(${rightWingRot}deg)`,
  }

  const eyeGroupStyle: React.CSSProperties = {
    transformOrigin: `${cx}px ${cy + eyeOffsetY}px`,
    transition: eyeTransition,
    transform: `scale(${eyeScale})`,
  }

  const pupilStyle: React.CSSProperties = {
    transition: 'cx 0.1s ease-out, cy 0.1s ease-out',
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Hoot the CodeRead owl"
      style={{ overflow: 'visible', filter: 'drop-shadow(0 4px 12px rgba(30,45,90,0.25))' }}
    >
      {/* ── BODY ── */}
      <ellipse cx={cx} cy={cy + size * 0.1} rx={bodyR} ry={bodyR * 1.12} fill="#1e2d5a" />
      {/* belly highlight */}
      <ellipse cx={cx} cy={cy + size * 0.22} rx={bodyR * 0.42} ry={bodyR * 0.26} fill="#2d4080" opacity={0.6} />

      {/* ── HEAD BASE (rendered under wings) ── */}
      <g style={headStyle}>
        {/* Ear tufts */}
        <polygon
          points={`${cx - size*0.11},${cy - bodyR*0.78} ${cx - size*0.2},${cy - bodyR*1.22} ${cx - size*0.04},${cy - bodyR*0.9}`}
          fill="#162245"
        />
        <polygon
          points={`${cx + size*0.11},${cy - bodyR*0.78} ${cx + size*0.2},${cy - bodyR*1.22} ${cx + size*0.04},${cy - bodyR*0.9}`}
          fill="#162245"
        />
        {/* Face disc */}
        <ellipse cx={cx} cy={cy - size*0.02} rx={bodyR*0.78} ry={bodyR*0.72} fill="#253370" />
      </g>

      {/* ── WINGS (rendered after face disc, rotate OVER the eyes) ── */}
      <g id="owl-left-wing" style={leftWingStyle}>
        <ellipse
          cx={leftPivotX}
          cy={wingPivotY + wingH * 0.28}
          rx={wingW * 0.52}
          ry={wingH * 0.56}
          fill="#14213d"
        />
        {/* Feather detail lines */}
        <line x1={leftPivotX - wingW*0.15} y1={wingPivotY + wingH*0.08} x2={leftPivotX - wingW*0.28} y2={wingPivotY + wingH*0.62} stroke="#2a3f7a" strokeWidth={size*0.016} strokeLinecap="round" />
        <line x1={leftPivotX + wingW*0.05} y1={wingPivotY + wingH*0.06} x2={leftPivotX - wingW*0.05} y2={wingPivotY + wingH*0.65} stroke="#2a3f7a" strokeWidth={size*0.016} strokeLinecap="round" />
      </g>

      <g id="owl-right-wing" style={rightWingStyle}>
        <ellipse
          cx={rightPivotX}
          cy={wingPivotY + wingH * 0.28}
          rx={wingW * 0.52}
          ry={wingH * 0.56}
          fill="#14213d"
        />
        <line x1={rightPivotX + wingW*0.15} y1={wingPivotY + wingH*0.08} x2={rightPivotX + wingW*0.28} y2={wingPivotY + wingH*0.62} stroke="#2a3f7a" strokeWidth={size*0.016} strokeLinecap="round" />
        <line x1={rightPivotX - wingW*0.05} y1={wingPivotY + wingH*0.06} x2={rightPivotX + wingW*0.05} y2={wingPivotY + wingH*0.65} stroke="#2a3f7a" strokeWidth={size*0.016} strokeLinecap="round" />
      </g>

      {/* ── HEAD DETAILS (eyes + glasses + beak) ──
           Rendered LAST so eyes appear on top in idle/tracking.
           In hiding/peeking we SCALE the eyes to 0 (blink) so it looks
           like the wings are physically covering them. */}
      <g style={headStyle}>
        {/* Eye whites */}
        <g style={eyeGroupStyle}>
          <circle cx={cx - eyeOffsetX} cy={cy + eyeOffsetY} r={eyeR} fill="white" />
          <circle cx={cx + eyeOffsetX} cy={cy + eyeOffsetY} r={eyeR} fill="white" />

          {/* Pupils */}
          <circle cx={leftPupilX}  cy={leftPupilY}  r={pupilR} fill="#1a1a2e" style={pupilStyle} />
          <circle cx={rightPupilX} cy={rightPupilY} r={pupilR} fill="#1a1a2e" style={pupilStyle} />

          {/* Pupil shine */}
          <circle cx={leftPupilX  - pupilR*0.35} cy={leftPupilY  - pupilR*0.35} r={pupilR*0.3} fill="white" opacity={0.75} />
          <circle cx={rightPupilX - pupilR*0.35} cy={rightPupilY - pupilR*0.35} r={pupilR*0.3} fill="white" opacity={0.75} />
        </g>

        {/* Glasses (always visible, adds character) */}
        <circle cx={cx - eyeOffsetX} cy={cy + eyeOffsetY} r={eyeR + size*0.013} fill="none" stroke="#c9932a" strokeWidth={size*0.02} />
        <circle cx={cx + eyeOffsetX} cy={cy + eyeOffsetY} r={eyeR + size*0.013} fill="none" stroke="#c9932a" strokeWidth={size*0.02} />
        {/* Bridge */}
        <line
          x1={cx - eyeOffsetX + eyeR + size*0.013}
          y1={cy + eyeOffsetY}
          x2={cx + eyeOffsetX - eyeR - size*0.013}
          y2={cy + eyeOffsetY}
          stroke="#c9932a" strokeWidth={size*0.02} strokeLinecap="round"
        />
        {/* Arms */}
        <line x1={cx - eyeOffsetX - eyeR - size*0.013} y1={cy + eyeOffsetY} x2={cx - bodyR*0.82} y2={cy + eyeOffsetY - size*0.016} stroke="#c9932a" strokeWidth={size*0.016} strokeLinecap="round" />
        <line x1={cx + eyeOffsetX + eyeR + size*0.013} y1={cy + eyeOffsetY} x2={cx + bodyR*0.82} y2={cy + eyeOffsetY - size*0.016} stroke="#c9932a" strokeWidth={size*0.016} strokeLinecap="round" />

        {/* Beak */}
        <polygon
          points={`${cx},${cy + size*0.085} ${cx - size*0.048},${cy + size*0.022} ${cx + size*0.048},${cy + size*0.022}`}
          fill="#e8a020"
        />
      </g>
    </svg>
  )
}