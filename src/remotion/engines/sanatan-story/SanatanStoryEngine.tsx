import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
const GOLD="#F4C56A";
const scenes=[
 {start:0,end:270,kicker:"ANCIENT WISDOM • EPISODE 01",title:["THE PROMISE OF","DHARMA"],body:"When darkness rises, the path of dharma is tested.",palette:["#120F22","#452A39"],symbol:"ॐ"},
 {start:270,end:630,kicker:"THE TURNING POINT",title:["A CHOICE THAT","CHANGES DESTINY"],body:"Courage is not the absence of fear. It is choosing what is right.",palette:["#101A2C","#25485A"],symbol:"धर्म"},
 {start:630,end:1080,kicker:"THE REVELATION",title:["LIGHT RETURNS","TO THE WORLD"],body:"Every action carries a consequence. Every honest choice creates a way forward.",palette:["#24172A","#70472F"],symbol:"✦"},
 {start:1080,end:1500,kicker:"THE LESSON",title:["DHARMA IS","A DAILY CHOICE"],body:"Stand with truth. Act with compassion. Let wisdom guide your strength.",palette:["#101D24","#315044"],symbol:"ॐ"},
 {start:1500,end:1800,kicker:"REMEMBER THE STORY",title:["WALK THE PATH","OF DHARMA"],body:"Follow for more stories from Sanatan tradition.",palette:["#171327","#50352D"],symbol:"🙏"}
];
const SacredGeometry:React.FC<{frame:number}> = ({frame})=><svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position:"absolute",inset:0,opacity:.24}}><g transform={"translate(540 900) rotate("+frame*.08+")"} fill="none" stroke={GOLD} strokeWidth="2">{[180,260,340,420].map(r=><circle key={r} r={r}/>)}{Array.from({length:12},(_,i)=><ellipse key={i} rx="150" ry="340" transform={"rotate("+i*15+")"}/>)}<path d="M0 -390 L338 195 L-338 195 Z M0 390 L338 -195 L-338 -195 Z"/></g></svg>;
export const SanatanStoryEngine:React.FC=()=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig();
 const sceneIndex=Math.max(0,scenes.findIndex(s=>frame>=s.start&&frame<s.end));
 const scene=scenes[sceneIndex]||scenes[scenes.length-1];
 const local=frame-scene.start,duration=scene.end-scene.start;
 const enter=spring({frame:local,fps,config:{damping:18,stiffness:75,mass:1.1}});
 const exit=interpolate(local,[duration-28,duration],[1,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
 const drift=interpolate(local,[0,duration],[0,-34]),glow=.75+Math.sin(frame/24)*.12;
 return <AbsoluteFill style={{background:"linear-gradient(155deg, "+scene.palette[0]+" 0%, "+scene.palette[1]+" 100%)",color:"#FFF7E8",fontFamily:"Georgia, 'Noto Serif Devanagari', serif"}}>
  <AbsoluteFill style={{background:"radial-gradient(ellipse at 50% 43%, rgba(255,202,118,.2), transparent 58%)"}}/><SacredGeometry frame={frame}/>
  <div style={{position:"absolute",top:0,left:0,right:0,height:18,background:"linear-gradient(90deg, transparent, "+GOLD+", transparent)",opacity:.75}}/>
  <div style={{position:"absolute",top:125,left:72,right:72,textAlign:"center",color:GOLD,fontFamily:"Arial,sans-serif",fontSize:19,letterSpacing:5,fontWeight:800,opacity:enter*exit}}>{scene.kicker}</div>
  <div style={{position:"absolute",top:350,left:60,right:60,textAlign:"center",transform:"translateY("+drift+"px) scale("+(0.96+enter*.04)+")",opacity:enter*exit}}>
   <div style={{fontSize:scene.symbol.length>2?92:142,color:GOLD,textShadow:"0 0 48px rgba(244,197,106,"+glow+")",marginBottom:44}}>{scene.symbol}</div>
   <div style={{fontSize:66,fontWeight:700,lineHeight:1.18,letterSpacing:1,textShadow:"0 8px 30px rgba(0,0,0,.28)"}}>{scene.title.map((line,i)=><React.Fragment key={line}>{i>0?<br/>:null}{line}</React.Fragment>)}</div>
   <div style={{width:150,height:3,background:GOLD,margin:"42px auto",boxShadow:"0 0 20px "+GOLD}}/>
   <div style={{maxWidth:820,margin:"0 auto",fontFamily:"Arial,sans-serif",fontSize:31,lineHeight:1.55,color:"#F5E6D0"}}>{scene.body}</div>
  </div>
  <div style={{position:"absolute",bottom:160,left:72,right:72,display:"flex",alignItems:"center",gap:18}}><div style={{flex:1,height:3,background:"rgba(255,255,255,.2)"}}><div style={{width:frame/1800*100+"%",height:"100%",background:GOLD}}/></div><span style={{color:GOLD,fontFamily:"Arial,sans-serif",fontSize:17,letterSpacing:2}}>EP 01</span></div>
  <div style={{position:"absolute",bottom:95,left:0,right:0,textAlign:"center",color:"#E6D4B6",opacity:.7,fontFamily:"Arial,sans-serif",fontSize:17,letterSpacing:4}}>STORIES • WISDOM • SANATAN</div>
 </AbsoluteFill>;
};
