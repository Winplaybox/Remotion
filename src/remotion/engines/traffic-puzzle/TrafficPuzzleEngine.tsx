import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
const K={bg:"#09121D",road:"#263746",lane:"#B9C8D3",yellow:"#FFD447",red:"#F26D6D",blue:"#5CB8FF",green:"#63D9A2",white:"#F4F7FA",muted:"#91A5B5"};
const Vehicle:React.FC<{x:number;y:number;w:number;h:number;color:string;label:string}> = ({x,y,w,h,color,label}) => <g transform={"translate("+x+" "+y+")"}><rect width={w} height={h} rx="18" fill="#07101A" opacity=".45"/><rect x="4" y="4" width={w-8} height={h-8} rx="15" fill={color} stroke="#fff" strokeOpacity=".35" strokeWidth="2"/><rect x="12" y="13" width={w-24} height={h*.28} rx="7" fill="#DFF4FF" opacity=".72"/><rect x="12" y={h*.64} width={w-24} height={h*.2} rx="7" fill="#07101A" opacity=".18"/><text x={w/2} y={h/2+7} fill="#0B1A25" textAnchor="middle" fontSize="22" fontWeight="900">{label}</text></g>;
export const TrafficPuzzleEngine:React.FC=()=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig();
 const solved=frame>=800,move=interpolate(frame,[690,790],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
 const timer=Math.max(0,10-Math.floor(Math.max(0,frame-390)/30)),intro=spring({frame,fps,config:{damping:16}}),pulse=1+Math.sin(frame/10)*.035;
 return <AbsoluteFill style={{background:"radial-gradient(circle at 50% 42%, #182A39, "+K.bg+" 72%)",fontFamily:"Arial,sans-serif",color:K.white}}>
  <div style={{position:"absolute",top:110,left:70,right:70,display:"flex",justifyContent:"space-between"}}><span style={{color:K.yellow,fontSize:22,letterSpacing:5,fontWeight:900}}>GRIDLOCK</span><span style={{color:K.muted,fontSize:20,letterSpacing:2}}>LEVEL 07</span></div>
  <div style={{position:"absolute",top:205,left:70,right:70,textAlign:"center",opacity:intro}}><div style={{color:K.yellow,fontSize:22,letterSpacing:5,fontWeight:800}}>TRAFFIC ESCAPE</div><div style={{fontSize:58,lineHeight:1.08,fontWeight:900,marginTop:20}}>Free the yellow car</div><div style={{color:K.muted,fontSize:25,marginTop:18}}>Move the vehicles. Clear the exit.</div></div>
  <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position:"absolute",inset:0}}>
   <rect x="130" y="540" width="820" height="820" rx="34" fill={K.road} stroke="#486173" strokeWidth="5"/>
   {[0,1,2,3,4,5].map(i=><g key={i}><path d={"M"+(267+i*136)+" 550 V1350"} stroke={K.lane} strokeOpacity=".23" strokeDasharray="18 20" strokeWidth="3"/><path d={"M140 "+(675+i*136)+" H940"} stroke={K.lane} strokeOpacity=".23" strokeDasharray="18 20" strokeWidth="3"/></g>)}
   <path d="M950 1080 H1015 M1002 1057 L1025 1080 L1002 1103" stroke={K.green} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
   <Vehicle x={155} y={1050} w={255} h={112} color={K.yellow} label="YOU"/><Vehicle x={425} y={570} w={112} h={250} color={K.blue} label="A"/><Vehicle x={695} y={570} w={112} h={250} color={K.red} label="B"/><Vehicle x={560} y={850} w={250} h={112} color="#A78BFA" label="C"/><Vehicle x={285} y={1220} w={112} h={112} color={K.green} label="D"/>
   <g transform={"translate("+(155+move*580)+" 1050)"} opacity={move}><rect width="255" height="112" rx="18" fill={K.yellow} stroke="#fff" strokeWidth="3"/><text x="127" y="68" fill="#111B20" textAnchor="middle" fontSize="25" fontWeight="900">ESCAPED!</text></g>
  </svg>
  <div style={{position:"absolute",top:1390,left:82,right:82,padding:30,borderRadius:28,background:"rgba(9,18,29,.94)",border:"1px solid #344D60",transform:"scale("+pulse+")"}}>
   <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:K.muted,fontSize:20,letterSpacing:3}}>TIME LEFT</span><span style={{fontSize:40,fontWeight:900,color:solved?K.green:K.yellow}}>{solved?"CLEAR!":"00:"+String(timer).padStart(2,"0")}</span></div>
   <div style={{marginTop:20,color:solved?K.green:K.white,fontSize:24,textAlign:"center",fontWeight:800}}>{solved?"THE YELLOW CAR HAS AN OPEN EXIT":"CAN YOU SOLVE IT BEFORE THE TIMER?"}</div>
  </div>
  <div style={{position:"absolute",bottom:110,left:72,right:72,height:5,borderRadius:8,background:"#233746"}}><div style={{width:Math.min(100,frame/1050*100)+"%",height:"100%",background:K.yellow,borderRadius:8}}/></div>
 </AbsoluteFill>;
};
