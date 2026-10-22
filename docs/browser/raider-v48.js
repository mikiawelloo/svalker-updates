'use strict';
// Separate actor/background; the truck remains a stationary occluding foreground.
for(const [key,file]of [['rare-raider48-background','background'],['raider48-idle','idle'],['raider48-aim','aim'],['raider48-dead','dead']]){
 const img=new Image();img.src='assets/raider-v48/'+file+'.png';WORLD_ART[key]=img;
}
function raiderFrame48(){
 const img=WORLD_ART['rare-raider48-background'];if(!img?.naturalWidth)return null;
 const s=Math.max(900/img.naturalWidth,800/img.naturalHeight);
 return {x:(900-img.naturalWidth*s)/2,y:(800-img.naturalHeight*s)/2,s:s*img.naturalWidth/1100};
}
function raiderPose48(t=performance.now()){
 const f=raiderFrame48();if(!f)return null;const c=event?.combat;
 let aim=0;
 if(c?.phase==='monster')aim=c.burstShots?1:Math.max(0,Math.min(1,1-(c.nextAt-t)/420));
 else if(c?.phase==='recover')aim=Math.max(0,1-(t-(event.attackAt??-10000))/450);
 const kick=Math.max(0,1-(t-(event?.attackAt??-10000))/125),breath=Math.sin(t*.0024);
 const x=f.x+641*f.s,y=f.y+(995+breath*1.8-kick*5)*f.s,w=560*f.s,h=840*f.s*(1+breath*.0015),angle=-kick*.008;
 const mx=0,my=(.184-1)*h;
 return {f,x,y,w,h,angle,aim,kick,muzzle:{x:x+mx*Math.cos(angle)-my*Math.sin(angle),y:y+mx*Math.sin(angle)+my*Math.cos(angle)}};
}
function raiderCoverClip48(f){
 // Left edge of the retained rusty truck, expressed in original plate coordinates.
 const points=[[0,0],[1005,0],[958,160],[922,355],[872,423],[769,443],[735,476],[710,548],[682,690],[654,830],[604,978],[0,978]];
 ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(f.x+x*f.s,f.y+y*f.s):ctx.moveTo(f.x+x*f.s,f.y+y*f.s));ctx.closePath();ctx.clip();
}
function drawRaider48(t){
 if(event?.enemy!=='raider')return false;const p=raiderPose48(t);if(!p)return true;
 ctx.save();raiderCoverClip48(p.f);
 if(event.defeated){
  const img=WORLD_ART['raider48-dead'];if(artReady('raider48-dead')){
   const w=650*p.f.s,h=w*img.naturalHeight/img.naturalWidth;
   ctx.drawImage(img,p.f.x+300*p.f.s,p.f.y+978*p.f.s-h,w,h);
  }
 }else{
  ctx.translate(p.x,p.y);ctx.rotate(p.angle);
  if(t-(event.flash??-10000)<140)ctx.filter='brightness(1.5)';
  for(const [pose,alpha]of [['idle',1-p.aim],['aim',p.aim]])if(alpha>0&&artReady('raider48-'+pose)){
   ctx.globalAlpha=alpha;ctx.drawImage(WORLD_ART['raider48-'+pose],-p.w/2,-p.h,p.w,p.h);
  }
 }
 ctx.restore();return true;
}
