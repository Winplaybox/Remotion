// Platform + action icons drawn as plain SVG shapes (no logo files, no trademark artwork).
import React from 'react';
import {U} from './unpaper3d';

// ---------- icons (plain SVG shapes, no logo files) ----------
export const IconYouTube: React.FC<{s: number}> = ({s}) => (
  <svg width={s} height={s} viewBox="0 0 64 64"><rect x={4} y={14} width={56} height={36} rx={11} fill="#E5484D" /><path d="M27 23 L42 32 L27 41 Z" fill="#fff" /></svg>
);
export const IconInstagram: React.FC<{s: number}> = ({s}) => (
  <svg width={s} height={s} viewBox="0 0 64 64">
    <defs><linearGradient id="unp-ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#F5B12E" /><stop offset="0.5" stopColor="#E5484D" /><stop offset="1" stopColor="#8A3FFC" /></linearGradient></defs>
    <rect x={6} y={6} width={52} height={52} rx={15} fill="none" stroke="url(#unp-ig)" strokeWidth={6} />
    <circle cx={32} cy={32} r={11} fill="none" stroke="url(#unp-ig)" strokeWidth={6} /><circle cx={46} cy={18} r={3.5} fill="#E5484D" />
  </svg>
);
export const IconFacebook: React.FC<{s: number}> = ({s}) => (
  <svg width={s} height={s} viewBox="0 0 64 64"><circle cx={32} cy={32} r={28} fill="#2D6CDF" />
    <path d="M35 52 V35 H41 L42 28 H35 V24 C35 22 36 21 38 21 H42 V15 C40 14.6 38 14.5 36 14.5 C31 14.5 28 17.5 28 23 V28 H22 V35 H28 V52 Z" fill="#fff" /></svg>
);
export const IconComment: React.FC<{s: number; c: string}> = ({s, c}) => (
  <svg width={s} height={s} viewBox="0 0 64 64"><path d="M10 12 H54 A6 6 0 0 1 60 18 V40 A6 6 0 0 1 54 46 H28 L16 56 V46 H10 A6 6 0 0 1 4 40 V18 A6 6 0 0 1 10 12 Z" fill={c} />
    <circle cx={20} cy={29} r={4} fill="#fff" /><circle cx={32} cy={29} r={4} fill="#fff" /><circle cx={44} cy={29} r={4} fill="#fff" /></svg>
);
export const IconSave: React.FC<{s: number}> = ({s}) => (
  <svg width={s} height={s} viewBox="0 0 64 64"><path d="M16 6 H48 A4 4 0 0 1 52 10 V58 L32 44 L12 58 V10 A4 4 0 0 1 16 6 Z" fill={U.saffron} /></svg>
);
export const IconShare: React.FC<{s: number}> = ({s}) => (
  <svg width={s} height={s} viewBox="0 0 64 64"><path d="M6 30 L58 8 L44 58 L32 38 Z" fill={U.cyan} /><path d="M32 38 L58 8" stroke="#fff" strokeWidth={4} /></svg>
);
export const IconLoop: React.FC<{s: number}> = ({s}) => (
  <svg width={s} height={s} viewBox="0 0 64 64"><path d="M50 32 A18 18 0 1 1 40 16" fill="none" stroke={U.cyan} strokeWidth={7} strokeLinecap="round" />
    <path d="M36 6 L48 16 L34 24 Z" fill={U.cyan} /></svg>
);

