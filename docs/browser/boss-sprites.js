'use strict';
// RGBA boss artwork: atlas frames or individual high-resolution states. Combat rules stay separate.
(() => {
 const fallback=drawBoss;
 const definitions={
  1:{key:'rusty-maw',frames:[[28,39,862,799],[889,342,878,485]],size:[650,535],down:[660,300]},
  2:{key:'swamp-guardian',frames:[[18,26,889,850],[925,375,830,487]],size:[650,570],down:[680,315]},
  3:{key:'radio-echo-hq-v46',files:['assets/echo-hq-v46/radio-echo-alive.png','assets/echo-hq-v46/radio-echo-dead.png'],frames:[[0,0,1024,1536],[0,0,1536,1024]],references:[[1024,1536],[1536,1024]],size:[650,630],down:[730,420]},
  4:{key:'watcher',frames:[[18,53,859,783],[896,346,865,486]],size:[720,590],down:[720,330]}
 };
 for(const def of Object.values(definitions)){
  const image=new Image();image.src=def.files?.[0]||'assets/bosses-v1/'+def.key+'.png';WORLD_ART['boss-'+def.key]=image;
  if(def.files){const dead=new Image();dead.src=def.files[1];WORLD_ART['boss-'+def.key+'-dead']=dead;}
 }
 function layout(t){
  const def=definitions[state.location];
  if(!def||!artReady('boss-'+def.key))return null;
  const dead=!!event.defeated,image=WORLD_ART['boss-'+def.key+(dead&&def.files?'-dead':'')];if(!image.complete||!image.naturalWidth)return null;
  const frame=dead?1:0,rect=def.frames[frame],[referenceWidth,referenceHeight]=def.references?.[frame]||[1774,887];
  const sx=rect[0]*image.naturalWidth/referenceWidth,sy=rect[1]*image.naturalHeight/referenceHeight;
  const sw=rect[2]*image.naturalWidth/referenceWidth,sh=rect[3]*image.naturalHeight/referenceHeight;
  const bounds=dead?def.down:def.size,fit=Math.min(bounds[0]/(def.files?rect[2]:sw),bounds[1]/(def.files?rect[3]:sh));
  const arrival=Math.max(0,Math.min(1,(t-event.created)/800));
  const locked=event.echo?.phase==='healing';
  const attack=dead||locked?0:Math.max(0,1-(t-(event.attackAt||-10000))/420);
  const retreat=dead?0:(window.RadioEchoV45?.retreatProgress(t)||0);
  const motion=dead?1:(.82+.18*arrival)*(1+attack*.08)*(1-retreat*.38),w=(def.files?rect[2]:sw)*fit*motion,h=(def.files?rect[3]:sh)*fit*motion;
  const ground=dead?725:715-retreat*150+(locked?0:Math.sin(t*.003)*2)+attack*16;
  return {def,image,dead,rect,sx,sy,sw,sh,w,h,ground,x:450-w/2,y:ground-h,scale:w/rect[2]};
 }
 drawBoss=function(t){
  const l=layout(t);if(!l)return fallback(t);
  const {def,image,dead,sx,sy,sw,sh,w,h,ground,x,y}=l;
  ctx.save();
  ellipse(ctx,450,ground+5,(dead?def.down[0]:def.size[0])*.28,dead?18:23,'#050a0c66');
  if(event.resolved&&!dead)ctx.globalAlpha=.35;
  if(!dead&&event.flash>0&&t-event.flash<160)ctx.filter='brightness(1.6)';
  ctx.drawImage(image,sx,sy,sw,sh,x,y,w,h);
  ctx.restore();
 };
 // Source rectangles exclude unused transparent padding, without modifying the generated images.
 window.BossSprites={definitions,layout};
})();
