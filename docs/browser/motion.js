'use strict';
// First-person camera pans over adjacent scene images as a continuous panorama.
// Transient visual state; route costs, deadlines and saves still belong to walk().
let travelMotion=null;
const MOTION_DURATION=1500, CAMERA_TURN_MS=1100, CAMERA_WIDTH=900;
function motionEase(p){p=Math.max(0,Math.min(1,p));return p*p*(3-2*p);}
function motionPose(m=travelMotion){
 if(!m)return null;
 const turn=motionEase(m.elapsed/CAMERA_TURN_MS),direction=m.kind==='left'?-1:1;
 return {yaw:direction*(m.kind==='depart'?Math.PI:Math.PI/2)*turn,
  offset:-direction*CAMERA_WIDTH*turn,turn,direction};
}
function beginTravelMotion(kind,source=null){
 if(!['depart','left','right'].includes(kind)||state.mode!=='expedition'||event||exhaustionOpen)return false;
 const now=performance.now();
 travelMotion={kind,elapsed:0,lastAt:now,sourceAt:source?.event?.created??now,
  sourceWalkStarted:source?.walkStarted??walkStarted,signArrival:source?.event?Math.min(1,Math.max(0,(now-source.event.created)/650)):1};
 renderAction();return true;
}
function updateTravelMotion(t){
 if(!travelMotion)return;
 if(state.mode!=='expedition'||event){travelMotion=null;return;}
 const m=travelMotion,dt=Math.max(0,t-m.lastAt);m.lastAt=t;
 if(document.hidden||exhaustionOpen)return;
 m.elapsed=Math.min(MOTION_DURATION,m.elapsed+dt);
 if(m.elapsed>=MOTION_DURATION){travelMotion=null;renderAction();}
}
function pauseTravelMotion(){if(travelMotion)travelMotion.lastAt=performance.now();}
function chooseForkRoute(side){
 if(!['left','right'].includes(side)||state.mode!=='expedition'||event?.type!=='fork'||event.resolved||travelMotion||exhaustionOpen||document.hidden||!$('modalBackdrop').hidden)return false;
 const steps=state.steps;walk(side==='left'?'crate':'anomaly',side);
 return state.steps>steps;
}
function cameraFrame(key,zoom){
 const image=WORLD_ART[key],scale=Math.max(900/image.naturalWidth,800/image.naturalHeight)*zoom;
 return {image,scale,x:(900-image.naturalWidth*scale)/2,y:(800-image.naturalHeight*scale)/2};
}
function roadCameraZoom(t,started){return 1.025+Math.max(0,Math.min(1,(t-started)/4200))*.095;}
function cameraCoordinate(x,pose){
 // Mild cylindrical projection during the turn; horizon and endpoints stay level.
 const q=(x-450)/450,curve=Math.sin(pose.turn*Math.PI)*35*(q*q*q-q);
 return x-pose.offset+curve;
}
function drawCameraStrip(frame,x,width,u,du){
 u=Math.max(0,Math.min(899.5,u));du=Math.max(.5,Math.min(du,900-u));
 ctx.drawImage(frame.image,(u-frame.x)/frame.scale,-frame.y/frame.scale,
  du/frame.scale,800/frame.scale,x,0,width,800);
}
function drawMotionFallback(t,pose){
 for(const [x,walking] of [[pose.offset,travelMotion.kind!=='depart'],[pose.offset+pose.direction*900,true]]){
  ctx.save();ctx.translate(x,0);ctx.beginPath();ctx.rect(0,0,900,800);ctx.clip();background(t,walking);ctx.restore();
 }
}
function drawMotionBackground(t){
 if(!travelMotion)return false;
 const m=travelMotion,pose=motionPose(),sourceKey=window.Hubs62?.backgroundKey(m.kind==='depart'?'base':'road')||(m.kind==='depart'?'base':'road'),roadKey=window.Hubs62?.backgroundKey('road')||'road';
 if(!artReady(sourceKey)||!artReady(roadKey))drawMotionFallback(t,pose);
 else{
  const before=cameraFrame(sourceKey,m.kind==='depart'?1.025:roadCameraZoom(m.sourceAt,m.sourceWalkStarted)),after=cameraFrame(roadKey,roadCameraZoom(t,walkStarted));
  const boundary=pose.direction>0?900:0,targetLeft=pose.direction*900;
  function segment(x0,x1,u0,u1){
   const source=pose.direction>0?(u0+u1)/2<900:(u0+u1)/2>=0;
   drawCameraStrip(source?before:after,x0,x1-x0,u0-(source?0:targetLeft),u1-u0);
   // Join only the narrow panorama seam; never fade the whole screen.
   const midpoint=(u0+u1)/2,join=motionEase((midpoint-boundary+90)/180),strength=Math.sin(pose.turn*Math.PI);
   if(midpoint>boundary-90&&midpoint<boundary+90&&strength>0){
    const weight=pose.direction>0?join:1-join;ctx.save();ctx.globalAlpha=(source?weight:1-weight)*strength;
    drawCameraStrip(source?after:before,x0,x1-x0,u0-(source?targetLeft:0),u1-u0);ctx.restore();
   }
  }
  // Sample the panorama, rather than fading or rotating the bitmap in its plane.
  // Split strips at its seam so there are no gaps, stretched edges or black bars.
  for(let x=0;x<900;x+=12){
   const end=Math.min(900,x+12),u0=cameraCoordinate(x,pose),u1=cameraCoordinate(end,pose);
   if(u0<boundary&&u1>boundary){const seam=x+(end-x)*(boundary-u0)/(u1-u0);segment(x,seam,u0,boundary);segment(seam,end,boundary,u1);}
   else segment(x,end,u0,u1);
  }
  const fog=ctx.createLinearGradient(0,170,0,720);fog.addColorStop(0,'#c6cacc00');fog.addColorStop(.5,'#c6cacc0d');fog.addColorStop(1,'#c6cacc00');ctx.fillStyle=fog;ctx.fillRect(0,170,900,550);
 }
 // The sign belongs to the old direction and moves out with the scenery.
 if(m.kind!=='depart'&&artReady('signpost')&&pose.turn<1){
  const scale=.9+m.signArrival*.1;
  ctx.save();ctx.translate(450+pose.offset,480);ctx.scale(scale,scale);
  ellipse(ctx,0,220,80,16,'#090e104a');ctx.drawImage(WORLD_ART.signpost,-235,-250,470,470);
  ctx.textAlign='center';ctx.fillStyle='#d1d0b8';ctx.font='bold 19px monospace';ctx.shadowColor='#101716';ctx.shadowBlur=3;
  ctx.fillText('ТАЙНИКИ',-26,-98);ctx.fillText('АНОМАЛИЯ',28,6);ctx.restore();
 }
 return true;
}
