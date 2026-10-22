'use strict';
// Continue the same panorama below the interactive 900×800 scene.
// Ground alone adapts to the remaining height; buildings and hit targets retain their scale.
(() => {
 let dirty=true,geometry=null,paint='',ground=null,context=null,observing=false;
 function invalidate(){dirty=true;}
 function sync(visible){
  const root=document.getElementById('gameRoot');ground=document.getElementById('settlementGround82');
  if(!root||!ground)return;
  root.classList.toggle('settlement-extended82',visible);ground.hidden=!visible;
  if(!visible){paint='';return;}
  if(!observing){
   observing=true;window.addEventListener('resize',invalidate);
   if(typeof ResizeObserver==='function'){
    const observer=new ResizeObserver(invalidate);observer.observe(root);observer.observe(document.getElementById('sceneSection'));
   }
  }
  invalidate();
 }
 function projection(image,width,sceneHeight,height,position){
  const half=image.naturalWidth/2,join=Math.min(image.naturalHeight,half*800/900);
  const scale=Math.max(width/900,sceneHeight/800),visibleWidth=Math.min(half,width/scale*half/900);
  return {sx:position*half+(half-visibleWidth)/2,sy:join,sw:visibleWidth,sh:image.naturalHeight-join,width,height};
 }
 function draw(image,position){
  if(!ground||ground.hidden)return;
  if(dirty){
   const root=document.getElementById('gameRoot'),scene=document.getElementById('sceneSection');
   const r=root.getBoundingClientRect(),s=scene.getBoundingClientRect();
   const width=root.clientWidth||r.width,top=s.bottom-r.top-(root.clientTop||0),height=Math.max(1,(root.clientHeight||r.height)-top);
   if(!width||!s.height)return;
   geometry={width,height,sceneHeight:s.height};
   ground.style.top=top+'px';ground.style.height=height+'px';
   const dpr=Math.max(1,Math.min(2,Number(window.devicePixelRatio)||1));
   ground.width=Math.round(width*dpr);ground.height=Math.round(height*dpr);
   context=ground.getContext('2d');context.setTransform(dpr,0,0,dpr,0,0);context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
   dirty=false;paint='';
  }
  const darkness=nightDarkness(),key=image.src+'|'+position+'|'+darkness+'|'+hasHeadlamp();
  if(paint===key)return;
  const p=projection(image,geometry.width,geometry.sceneHeight,geometry.height,position);
  if(p.sh<=0)return;
  context.drawImage(image,p.sx,p.sy,p.sw,p.sh,0,0,p.width,p.height);
  if(darkness>0){context.fillStyle='rgba(9,15,23,'+(darkness*(hasHeadlamp()?.83:.76))+')';context.fillRect(0,0,p.width,p.height);}
  paint=key;
 }
 window.Settlement82={sync,draw,projection,invalidate};
})();
