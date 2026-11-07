import React from "react";
import type { VehicleKind } from "./model";

/** Footprint in local units (width, length). Everything is drawn centred, facing up. */
export const VEHICLE_SIZE: Record<VehicleKind, { w: number; l: number }> = {
  kaalipeeli: { w: 98, l: 186 },
  bestbus: { w: 112, l: 300 },
  taxi: { w: 100, l: 190 },
  police: { w: 100, l: 192 },
  ambulance: { w: 108, l: 220 },
  bus: { w: 110, l: 290 },
  truck: { w: 110, l: 290 },
  sports: { w: 96, l: 184 },
  auto: { w: 92, l: 150 },
  suv: { w: 108, l: 204 }
};

export interface VehicleProps {
  kind: VehicleKind;
  color: string;
  trim: string;
  /** 0..1, how "on" the special lights (siren, roof sign) are. */
  lit: number;
  frame: number;
}

const DARK = "#161A22";
const GLASS = "#222935";

const Wheels: React.FC<{ w: number; l: number; front?: number; rear?: number }> = ({ w, l, front = 0.28, rear = 0.3 }) => (
  <g fill="#0A0B0E">
    {[-1, 1].map((s) => (
      <g key={s}>
        <rect x={s * w / 2 - 9 + (s > 0 ? -2 : 2)} y={-l / 2 + l * front - 16} width={18} height={32} rx={5} />
        <rect x={s * w / 2 - 9 + (s > 0 ? -2 : 2)} y={l / 2 - l * rear - 16} width={18} height={32} rx={5} />
      </g>
    ))}
  </g>
);

const Lights: React.FC<{ w: number; l: number; inset?: number }> = ({ w, l, inset = 0.2 }) => (
  <g>
    {[-1, 1].map((s) => (
      <g key={s}>
        <rect x={s * w * (0.5 - inset) - 11} y={-l / 2 + 2} width={22} height={9} rx={4} fill="#FFF7D6" />
        <circle cx={s * w * (0.5 - inset)} cy={-l / 2 + 4} r={18} fill="url(#tv-head)" />
        <rect x={s * w * (0.5 - inset) - 12} y={l / 2 - 10} width={24} height={8} rx={3} fill="#FF2A2A" />
        <circle cx={s * w * (0.5 - inset)} cy={l / 2 - 4} r={22} fill="url(#tv-tail)" />
      </g>
    ))}
  </g>
);

/** Classic car shell shared by taxi / police / sports / suv. */
const CarShell: React.FC<{ w: number; l: number; color: string; trim: string; cabin?: number; frontR?: number; children?: React.ReactNode }> = ({ w, l, color, trim, cabin = 0.42, frontR = 0.32, children }) => {
  const cabTop = -l / 2 + l * 0.27, cabH = l * cabin;
  return (
    <g>
      <Wheels w={w} l={l} />
      <rect x={-w / 2} y={-l / 2} width={w} height={l} rx={w * frontR} fill={color} stroke={trim} strokeWidth={3.5} />
      <rect x={-w / 2} y={-l / 2} width={w} height={l} rx={w * frontR} fill="url(#tv-sheen)" />
      {/* windshield + rear glass */}
      <path d={`M ${-w * 0.4} ${cabTop} Q 0 ${cabTop - 14} ${w * 0.4} ${cabTop} L ${w * 0.33} ${cabTop + l * 0.1} L ${-w * 0.33} ${cabTop + l * 0.1} Z`} fill={GLASS} />
      <path d={`M ${-w * 0.34} ${cabTop + cabH - l * 0.07} L ${w * 0.34} ${cabTop + cabH - l * 0.07} L ${w * 0.38} ${cabTop + cabH} Q 0 ${cabTop + cabH + 8} ${-w * 0.38} ${cabTop + cabH} Z`} fill={GLASS} />
      {/* roof */}
      <rect x={-w * 0.34} y={cabTop + l * 0.1} width={w * 0.68} height={cabH - l * 0.17} rx={10} fill={color} />
      <rect x={-w * 0.34} y={cabTop + l * 0.1} width={w * 0.68} height={cabH - l * 0.17} rx={10} fill="#fff" opacity={0.1} />
      {/* mirrors */}
      <ellipse cx={-w / 2 - 6} cy={cabTop + 6} rx={7} ry={5} fill={color} stroke={trim} strokeWidth={2} />
      <ellipse cx={w / 2 + 6} cy={cabTop + 6} rx={7} ry={5} fill={color} stroke={trim} strokeWidth={2} />
      <Lights w={w} l={l} />
      {children}
    </g>
  );
};

const Taxi: React.FC<VehicleProps> = ({ color, trim, lit }) => {
  const { w, l } = VEHICLE_SIZE.taxi;
  return (
    <CarShell w={w} l={l} color={color} trim={trim}>
      <rect x={-w * 0.24} y={-l * 0.04} width={w * 0.48} height={22} rx={5} fill="#FFE27A" stroke={DARK} strokeWidth={2} />
      <text x={0} y={-l * 0.04 + 16} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={14} fill={DARK}>TAXI</text>
      <circle cx={0} cy={-l * 0.04 + 11} r={34} fill="url(#tv-amber)" opacity={lit} />
    </CarShell>
  );
};

const Police: React.FC<VehicleProps> = ({ color, trim, lit, frame }) => {
  const { w, l } = VEHICLE_SIZE.police;
  const blink = Math.floor(frame / 4) % 2 === 0;
  return (
    <CarShell w={w} l={l} color={color} trim={trim}>
      <rect x={-w * 0.34} y={-l * 0.12} width={w * 0.68} height={l * 0.2} rx={8} fill="#F4F6FA" opacity={0.92} />
      <rect x={-w * 0.36} y={-l * 0.03} width={w * 0.72} height={14} rx={6} fill={DARK} />
      <rect x={-w * 0.34} y={-l * 0.03 + 2} width={w * 0.32} height={10} rx={4} fill="#FF2D2D" opacity={0.35 + 0.65 * lit * (blink ? 1 : 0.2)} />
      <rect x={w * 0.02} y={-l * 0.03 + 2} width={w * 0.32} height={10} rx={4} fill="#2D6BFF" opacity={0.35 + 0.65 * lit * (blink ? 0.2 : 1)} />
      <circle cx={-w * 0.2} cy={-l * 0.03 + 7} r={40} fill="url(#tv-red)" opacity={lit * (blink ? 1 : 0.15)} />
      <circle cx={w * 0.2} cy={-l * 0.03 + 7} r={40} fill="url(#tv-blue)" opacity={lit * (blink ? 0.15 : 1)} />
    </CarShell>
  );
};

const Ambulance: React.FC<VehicleProps> = ({ color, trim, lit, frame }) => {
  const { w, l } = VEHICLE_SIZE.ambulance;
  const blink = Math.floor(frame / 5) % 2 === 0;
  return (
    <g>
      <Wheels w={w} l={l} front={0.2} rear={0.18} />
      <rect x={-w / 2} y={-l / 2} width={w} height={l} rx={20} fill={color} stroke={trim} strokeWidth={3.5} />
      <rect x={-w / 2} y={-l / 2} width={w} height={l} rx={20} fill="url(#tv-sheen)" />
      <path d={`M ${-w * 0.42} ${-l / 2 + 26} Q 0 ${-l / 2 + 14} ${w * 0.42} ${-l / 2 + 26} L ${w * 0.4} ${-l / 2 + 50} L ${-w * 0.4} ${-l / 2 + 50} Z`} fill={GLASS} />
      <rect x={-w * 0.44} y={-l / 2 + 62} width={w * 0.88} height={l * 0.62} rx={8} fill="#fff" opacity={0.12} />
      <rect x={-8} y={-l * 0.02 - 26} width={16} height={52} rx={3} fill={trim} />
      <rect x={-26} y={-l * 0.02 - 8} width={52} height={16} rx={3} fill={trim} />
      <rect x={-w * 0.38} y={-l / 2 + 52} width={w * 0.76} height={12} rx={5} fill={DARK} />
      <rect x={-w * 0.36} y={-l / 2 + 54} width={w * 0.34} height={8} rx={3} fill="#FF2D2D" opacity={0.3 + 0.7 * lit * (blink ? 1 : 0.2)} />
      <rect x={w * 0.02} y={-l / 2 + 54} width={w * 0.34} height={8} rx={3} fill="#2D6BFF" opacity={0.3 + 0.7 * lit * (blink ? 0.2 : 1)} />
      <circle cx={0} cy={-l / 2 + 58} r={46} fill={blink ? "url(#tv-red)" : "url(#tv-blue)"} opacity={lit} />
      <Lights w={w} l={l} inset={0.18} />
    </g>
  );
};

const Bus: React.FC<VehicleProps> = ({ color, trim }) => {
  const { w, l } = VEHICLE_SIZE.bus;
  return (
    <g>
      <Wheels w={w} l={l} front={0.16} rear={0.2} />
      <rect x={-w / 2} y={-l / 2} width={w} height={l} rx={18} fill={color} stroke={trim} strokeWidth={3.5} />
      <rect x={-w / 2} y={-l / 2} width={w} height={l} rx={18} fill="url(#tv-sheen)" />
      <rect x={-w * 0.42} y={-l / 2 + 8} width={w * 0.84} height={22} rx={8} fill={GLASS} />
      {Array.from({ length: 5 }, (_, i) => <rect key={i} x={-w * 0.3} y={-l / 2 + 50 + i * 44} width={w * 0.6} height={26} rx={6} fill="#fff" opacity={0.16} />)}
      <rect x={-w * 0.2} y={l * 0.05} width={w * 0.4} height={40} rx={6} fill={DARK} opacity={0.6} />
      <Lights w={w} l={l} inset={0.16} />
    </g>
  );
};

const Truck: React.FC<VehicleProps> = ({ color, trim }) => {
  const { w, l } = VEHICLE_SIZE.truck;
  const cab = l * 0.26;
  return (
    <g>
      <Wheels w={w} l={l} front={0.12} rear={0.12} />
      <Wheels w={w} l={l} front={0.12} rear={0.24} />
      <rect x={-w * 0.46} y={-l / 2} width={w * 0.92} height={cab} rx={18} fill={color} stroke={trim} strokeWidth={3.5} />
      <path d={`M ${-w * 0.38} ${-l / 2 + 14} Q 0 ${-l / 2 + 4} ${w * 0.38} ${-l / 2 + 14} L ${w * 0.36} ${-l / 2 + 36} L ${-w * 0.36} ${-l / 2 + 36} Z`} fill={GLASS} />
      <rect x={-w / 2} y={-l / 2 + cab + 8} width={w} height={l - cab - 8} rx={6} fill="#D9DCE3" stroke={trim} strokeWidth={3.5} />
      <rect x={-w / 2} y={-l / 2 + cab + 8} width={w} height={l - cab - 8} rx={6} fill={color} opacity={0.55} />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-w / 2 + 6} x2={w / 2 - 6} y1={-l / 2 + cab + 26 + i * 22} y2={-l / 2 + cab + 26 + i * 22} stroke={DARK} strokeOpacity={0.25} strokeWidth={3} />)}
      <Lights w={w} l={l} inset={0.16} />
    </g>
  );
};

const Sports: React.FC<VehicleProps> = ({ color, trim }) => {
  const { w, l } = VEHICLE_SIZE.sports;
  return (
    <CarShell w={w} l={l} color={color} trim={trim} cabin={0.34} frontR={0.48}>
      <rect x={-13} y={-l / 2 + 6} width={8} height={l - 12} rx={3} fill="#fff" opacity={0.8} />
      <rect x={5} y={-l / 2 + 6} width={8} height={l - 12} rx={3} fill="#fff" opacity={0.8} />
      <rect x={-w * 0.46} y={l / 2 - 26} width={w * 0.92} height={10} rx={4} fill={DARK} />
    </CarShell>
  );
};

const Suv: React.FC<VehicleProps> = ({ color, trim }) => {
  const { w, l } = VEHICLE_SIZE.suv;
  return (
    <CarShell w={w} l={l} color={color} trim={trim} cabin={0.52} frontR={0.2}>
      <line x1={-w * 0.3} x2={-w * 0.3} y1={-l * 0.08} y2={l * 0.2} stroke={DARK} strokeWidth={5} strokeLinecap="round" />
      <line x1={w * 0.3} x2={w * 0.3} y1={-l * 0.08} y2={l * 0.2} stroke={DARK} strokeWidth={5} strokeLinecap="round" />
    </CarShell>
  );
};

const Auto: React.FC<VehicleProps> = ({ color, trim }) => {
  const { w, l } = VEHICLE_SIZE.auto;
  const body = `M 0 ${-l / 2} C ${w * 0.32} ${-l / 2} ${w * 0.5} ${-l * 0.2} ${w * 0.5} ${l * 0.1} L ${w * 0.5} ${l / 2 - 12} Q ${w * 0.5} ${l / 2} ${w * 0.38} ${l / 2} L ${-w * 0.38} ${l / 2} Q ${-w * 0.5} ${l / 2} ${-w * 0.5} ${l / 2 - 12} L ${-w * 0.5} ${l * 0.1} C ${-w * 0.5} ${-l * 0.2} ${-w * 0.32} ${-l / 2} 0 ${-l / 2} Z`;
  return (
    <g>
      <rect x={-9} y={-l / 2 - 6} width={18} height={30} rx={5} fill="#0A0B0E" />
      <rect x={-w / 2 - 5} y={l / 2 - 52} width={16} height={34} rx={5} fill="#0A0B0E" />
      <rect x={w / 2 - 11} y={l / 2 - 52} width={16} height={34} rx={5} fill="#0A0B0E" />
      <path d={body} fill={trim} stroke={trim} strokeWidth={3.5} />
      <path d={body} fill="url(#tv-sheen)" />
      <rect x={-w * 0.46} y={-l * 0.12} width={w * 0.92} height={l * 0.6} rx={22} fill={color} stroke={DARK} strokeWidth={3} />
      <rect x={-w * 0.46} y={-l * 0.12} width={w * 0.92} height={l * 0.6} rx={22} fill="#fff" opacity={0.14} />
      {[0.08, 0.2, 0.32].map((k) => <line key={k} x1={-w * 0.4} x2={w * 0.4} y1={l * k} y2={l * k} stroke={DARK} strokeOpacity={0.2} strokeWidth={3} />)}
      <path d={`M ${-w * 0.3} ${-l * 0.2} Q 0 ${-l * 0.3} ${w * 0.3} ${-l * 0.2} L ${w * 0.36} ${-l * 0.12} L ${-w * 0.36} ${-l * 0.12} Z`} fill={GLASS} />
      <rect x={-8} y={-l / 2 + 4} width={16} height={8} rx={4} fill="#FFF7D6" />
      <circle cx={0} cy={-l / 2 + 6} r={20} fill="url(#tv-head)" />
      {[-1, 1].map((s) => <circle key={s} cx={s * w * 0.3} cy={l / 2 - 5} r={18} fill="url(#tv-tail)" />)}
    </g>
  );
};

/** Mumbai kaali-peeli: black body, yellow roof, roof carrier. */
const KaaliPeeli: React.FC<VehicleProps> = ({ color, lit }) => {
  const { w, l } = VEHICLE_SIZE.kaalipeeli;
  return (
    <CarShell w={w} l={l} color="#161616" trim={color} frontR={0.26}>
      <rect x={-w * 0.34} y={-l / 2 + l * 0.37} width={w * 0.68} height={l * 0.25} rx={10} fill={color} />
      <rect x={-w * 0.34} y={-l / 2 + l * 0.37} width={w * 0.68} height={l * 0.25} rx={10} fill="url(#tv-sheen)" />
      {[0.42, 0.5, 0.58].map((k) => <line key={k} x1={-w * 0.3} x2={w * 0.3} y1={-l / 2 + l * k} y2={-l / 2 + l * k} stroke="#3A2E00" strokeWidth={3} strokeOpacity={0.6} />)}
      <rect x={-w * 0.38} y={-l / 2 + 20} width={w * 0.76} height={l * 0.13} rx={8} fill={color} opacity={0.95} />
      <circle cx={0} cy={-l / 2 + l * 0.5} r={60} fill="url(#tv-amber)" opacity={lit * 0.8} />
    </CarShell>
  );
};

/** Mumbai BEST bus: red with a cream band, roof hatches. */
const BestBus: React.FC<VehicleProps> = ({ color, trim }) => {
  const { w, l } = VEHICLE_SIZE.bestbus;
  return (
    <g>
      <Wheels w={w} l={l} front={0.15} rear={0.2} />
      <rect x={-w / 2} y={-l / 2} width={w} height={l} rx={16} fill={color} stroke="#111" strokeWidth={3} />
      <rect x={-w / 2} y={-l / 2} width={w} height={l} rx={16} fill="url(#tv-sheen)" />
      <rect x={-w / 2 + 6} y={-l / 2 + 34} width={10} height={l - 50} fill={trim} />
      <rect x={w / 2 - 16} y={-l / 2 + 34} width={10} height={l - 50} fill={trim} />
      <rect x={-w * 0.42} y={-l / 2 + 8} width={w * 0.84} height={22} rx={8} fill={GLASS} />
      {[0.22, 0.48, 0.74].map((k) => <rect key={k} x={-w * 0.22} y={-l / 2 + l * k} width={w * 0.44} height={36} rx={6} fill="#000" opacity={0.25} />)}
      <text x={0} y={-l / 2 + l * 0.38} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={26} fill={trim} transform={`rotate(-90 0 ${-l / 2 + l * 0.38})`}>BEST</text>
      <Lights w={w} l={l} inset={0.16} />
    </g>
  );
};

const RENDERERS: Record<VehicleKind, React.FC<VehicleProps>> = { kaalipeeli: KaaliPeeli, bestbus: BestBus, taxi: Taxi, police: Police, ambulance: Ambulance, bus: Bus, truck: Truck, sports: Sports, auto: Auto, suv: Suv };

export const Vehicle: React.FC<VehicleProps> = (props) => {
  const R = RENDERERS[props.kind];
  const { w, l } = VEHICLE_SIZE[props.kind];
  return (
    <g>
      {/* headlight beams + ground shadow */}
      <path d={`M ${-w * 0.36} ${-l / 2} L ${-w * 0.75} ${-l / 2 - 150} L ${w * 0.75} ${-l / 2 - 150} L ${w * 0.36} ${-l / 2} Z`} fill="url(#tv-beam)" />
      <rect x={-w / 2 - 4} y={-l / 2 + 10} width={w + 8} height={l} rx={w * 0.3} fill="#000" opacity={0.55} filter="url(#tv-blur)" />
      <R {...props} />
    </g>
  );
};

/** Shared gradients/filters. Render once inside the scene <svg>. */
export const VehicleDefs: React.FC = () => (
  <defs>
    <linearGradient id="tv-beam" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stopColor="#FFF4C8" stopOpacity={0.32} />
      <stop offset="1" stopColor="#FFF4C8" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="tv-sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity={0.28} />
      <stop offset="0.45" stopColor="#fff" stopOpacity={0.04} />
      <stop offset="1" stopColor="#000" stopOpacity={0.22} />
    </linearGradient>
    <radialGradient id="tv-head"><stop offset="0" stopColor="#FFF6CF" stopOpacity={0.9} /><stop offset="1" stopColor="#FFF6CF" stopOpacity={0} /></radialGradient>
    <radialGradient id="tv-tail"><stop offset="0" stopColor="#FF2A2A" stopOpacity={0.75} /><stop offset="1" stopColor="#FF2A2A" stopOpacity={0} /></radialGradient>
    <radialGradient id="tv-amber"><stop offset="0" stopColor="#FFC23A" stopOpacity={0.9} /><stop offset="1" stopColor="#FFC23A" stopOpacity={0} /></radialGradient>
    <radialGradient id="tv-red"><stop offset="0" stopColor="#FF2D2D" stopOpacity={0.9} /><stop offset="1" stopColor="#FF2D2D" stopOpacity={0} /></radialGradient>
    <radialGradient id="tv-blue"><stop offset="0" stopColor="#2D6BFF" stopOpacity={0.9} /><stop offset="1" stopColor="#2D6BFF" stopOpacity={0} /></radialGradient>
    <filter id="tv-blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9" /></filter>
    <filter id="tv-noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.09 0" /></filter>
  </defs>
);
