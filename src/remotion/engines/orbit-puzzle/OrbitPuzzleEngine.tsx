import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
const C = { bg:"#07111F", line:"#24435C", cyan:"#55D6FF", violet:"#A78BFA", gold:"#FFD166", white:"#F4F8FC", muted:"#8DA4BA", green:"#72E6B2" };
const Orbit: React.FC<{radius:number;speed:number;phase:number;color:string;size:number;frame:number}> = ({radius,speed,phase,color,size,frame}) => {
 const angle=frame*speed+phase, x=540+Math.cos(angle)*radius, y=870+Math.sin(angle)*radius*.72;
 return <g><ellipse cx="540" cy="870" rx={radius} ry={radius*.72} fill="none" stroke={color} strokeOpacity=".32" strokeWidth="2"/><circle cx={x} cy={y} r={size+10} fill={color} opacity=".12"/><circle cx={x} cy={y} r={size} fill={color}/><circle cx={x-size*.25} cy={y-size*.25} r={size*.25} fill="#fff" opacity=".7"/></g>;
};
export const OrbitPuzzleEngine: React.FC = () => {
 const frame=useCurrentFrame(), {fps}=useVideoConfig();
 const reveal=spring({frame:frame-650,fps,config:{damping:18,stiffness:90}});
 const countdown=Math.max(0,8-Math.floor(Math.max(0,frame-390)/30));
 const answerVisible=frame>=650, titleIn=spring({frame,fps,config:{damping:18}});
 const pulse=1+Math.sin(frame/12)*.025;
 return <AbsoluteFill style={{background:"radial-gradient(ellipse at 50% 43%, #122B43 0%, #07111F 68%)",color:C.white,fontFamily:"Arial,sans-serif"}}>
  <AbsoluteFill style={{opacity:.14,backgroundImage:"linear-gradient(rgba(85,214,255,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(85,214,255,.18) 1px,transparent 1px)",backgroundSize:"64px 64px"}}/>
  <div style={{position:"absolute",top:118,left:72,right:72,display:"flex",justifyContent:"space-between"}}><span style={{color:C.cyan,fontSize:22,letterSpacing:5,fontWeight:800}}>ORBIT LAB</span><span style={{color:C.muted,fontSize:20,letterSpacing:2}}>PUZZLE 01 / 05</span></div>
  <div style={{position:"absolute",top:220,left:70,right:70,textAlign:"center",opacity:titleIn}}><div style={{color:C.gold,fontSize:22,letterSpacing:6,fontWeight:700}}>OBSERVE THE PATTERN</div><div style={{fontSize:58,fontWeight:900,lineHeight:1.08,marginTop:24}}>Which orbit<br/>comes next?</div></div>
  <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position:"absolute",inset:0}}>
   <defs><filter id="orbitGlow"><feGaussianBlur stdDeviation="12" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
   <circle cx="540" cy="870" r="72" fill="#FFD166" opacity=".12"/><circle cx="540" cy="870" r="40" fill={C.gold} filter="url(#orbitGlow)"/>
   <Orbit radius={150} speed={.018} phase={0} color={C.cyan} size={18} frame={frame}/><Orbit radius={250} speed={-.012} phase={1.4} color={C.violet} size={22} frame={frame}/><Orbit radius={350} speed={.008} phase={2.8} color={C.green} size={25} frame={frame}/>
   <path d="M540 450 V1290 M190 870 H890" stroke="#7AA0BE" strokeOpacity=".12" strokeDasharray="8 14"/><circle cx="540" cy="870" r="420" fill="none" stroke="#55D6FF" strokeOpacity=".08" strokeWidth="2"/>
  </svg>
  <div style={{position:"absolute",top:1330,left:86,right:86,padding:30,borderRadius:28,border:"1px solid "+C.line,background:"rgba(13,27,45,.92)",transform:"scale("+pulse+")"}}>
   <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:C.muted,fontSize:20,letterSpacing:3}}>YOUR CHALLENGE</span><span style={{color:C.gold,fontSize:34,fontWeight:900}}>{answerVisible?"SOLVED":countdown+"s"}</span></div>
   <div style={{display:"flex",gap:18,marginTop:26}}>{["A","B","C"].map((label,i)=><div key={label} style={{flex:1,height:110,borderRadius:18,border:"2px solid "+(answerVisible&&i===1?C.green:C.line),background:answerVisible&&i===1?"rgba(114,230,178,.16)":"#102238",display:"flex",alignItems:"center",justifyContent:"center",color:answerVisible&&i===1?C.green:C.white,fontSize:32,fontWeight:800}}>{label}{answerVisible&&i===1?" ✓":""}</div>)}</div>
   <div style={{marginTop:24,textAlign:"center",color:answerVisible?C.green:C.muted,fontSize:22,letterSpacing:2,opacity:answerVisible?reveal:1}}>{answerVisible?"OPTION B — THE INNER ORBIT REPEATS":"PAUSE • THINK • PICK YOUR ANSWER"}</div>
  </div>
  <div style={{position:"absolute",bottom:110,left:72,right:72,height:5,borderRadius:9,background:"#1B3045"}}><div style={{width:Math.min(100,frame/900*100)+"%",height:"100%",background:C.cyan,borderRadius:9}}/></div>
 </AbsoluteFill>;
};
