'use strict';
// Radio Echo: repeatable regeneration interludes, four physical spotlight assemblies.
(() => {
 const DURATION=5000,HP_PER_LIGHT=8,SHOT_DELAY=400;
 const lamps=[
  {name:'Верхний',x:626,y:418,r:100,faces:[{x:626,y:418,rx:59,ry:83,a:-.45}]},
  {name:'Прямоугольный',x:261,y:755,r:94,faces:[{x:261,y:755,rx:43,ry:39,a:-.35,rect:true}]},
  {name:'Двойной',x:408,y:1030,r:110,faces:[{x:365,y:1044,rx:27,ry:36,a:.25},{x:449,y:1015,rx:27,ry:36,a:.25}]},
  {name:'В решётке',x:806,y:1056,r:88,faces:[{x:806,y:1056,rx:30,ry:50,a:.12}]}
 ];
 const original={win:winCombat,combat:updateCombat,start:startCombat,render:renderCombat,save,draw:drawBoss,tick,weapon:drawWeapon,audio:syncAudioScene};
 const arm=new Image();arm.src='assets/echo-v1/tentacle.png';WORLD_ART.echoTentacle=arm;
 const ads=new Image();ads.src='assets/echo-v2/pistol-ads.png';WORLD_ART.echoADS=ads;
 const isEcho=()=>state.mode==='expedition'&&state.location===3&&event?.boss&&event.type==='monster';
 const healing=()=>isEcho()&&!event.resolved&&event.echo?.phase==='healing';
 const intact=()=>event.echo.broken.reduce((n,b)=>n+!b,0);
 let aim={x:450,y:440},uiCache='',aiming=false;
 const clamp=(n,hi)=>Math.max(0,Math.min(hi,Number(n)||0));
 function setAim(x,y){aim={x:clamp(x,900),y:clamp(y,800)};return {...aim};}
 function weaponPose(t=performance.now()){
  // Camera looks straight down the slide. Move the entire rear view; never rotate it.
  const h=(840-aim.y)/(1-.249),w=h*1201/1309,anchor={x:.5*w,y:.249*h};
  const recoil=Math.max(0,1-(t-(event.echo?.lastShotAt??-10000))/170)*11;
  return {x:aim.x-anchor.x,y:aim.y-anchor.y+recoil,w,h,angle:0,anchor,
   sight:{x:aim.x,y:aim.y+recoil},muzzle:{...aim}};
 }
 function begin(){
  if(!isEcho()||event.resolved||event.echo?.broken?.every(Boolean))return false;
  const broken=event.echo?.broken||[false,false,false,false];
  const t=performance.now();event.echo={used:true,phase:'healing',elapsed:0,lastAt:t,broken:[...broken],lastShotAt:t-SHOT_DELAY,lastBreakAt:-10000,lastBreak:-1};
  event.hp=0;event.combat={phase:'echoRegen'};event.defeated=false;event.battleStarted=true;event.attackAt=0;event.echoAttack=null;
  aim={x:450,y:440};aiming=false;uiCache='';spawnCombatPopup('Восстановление','heal');
  renderAction();save();return true;
 }
 function finish(){
  if(!healing())return false;
  event.hp=Math.max(1,Math.min(event.maxHp,Math.ceil(event.hp)));event.echo.phase='finish';event.combat=event.reload48?{phase:'reload',shots:0,nextAt:performance.now()}:null;
  canvas.style.touchAction='auto';canvas.style.cursor='pointer';aiming=false;
  toast((intact()?'Прожекторы целы — лечение повторится. ':'Все прожекторы разбиты. ')+'Добей Радиоэхо: '+event.hp+' HP.');save();renderAction();updateVitals();return true;
 }
 function advance(t=performance.now()){
  if(!healing())return false;const e=event.echo;
  if(document.hidden||exhaustionOpen||!$('modalBackdrop').hidden){e.lastAt=t;return false;}
  if(event.reload48&&stepReload48(t)){save();renderHealing();}
  const dt=Math.min(DURATION-e.elapsed,Math.max(0,t-e.lastAt));e.lastAt=t;
  event.hp=Math.min(event.maxHp,event.hp+dt/1000*intact()*(event.maxHp/40));e.elapsed+=dt;
  if(e.elapsed>=DURATION||intact()===0)return finish();
  updateUI();return true;
 }
 function targets(t=performance.now()){
  if(!isEcho()||!window.BossSprites)return [];
  const l=window.BossSprites.layout(t);if(!l||l.dead)return [];
  return lamps.map((lamp,i)=>({...lamp,id:i,x:l.x+(lamp.x-l.rect[0])*l.scale,y:l.y+(lamp.y-l.rect[1])*l.scale,r:Math.max(39,lamp.r*l.scale),broken:!!event.echo?.broken[i]}));
 }
 function updateUI(){
  if(!healing())return;const e=event.echo;
  const remaining=(DURATION-e.elapsed)/1000,hp=Math.ceil(event.hp),count=intact();
  const key=remaining.toFixed(1)+'|'+hp+'|'+count;
  if(key===uiCache)return;uiCache=key;
  const clock=$('echoRegenClock'),health=$('echoRegenHP'),fill=$('echoRegenFill'),counter=$('echoLampCount');
  if(clock)clock.textContent=remaining.toFixed(1)+' с';if(health)health.textContent=hp+' / '+event.maxHp+' HP';
  if(fill)fill.style.width=event.hp/event.maxHp*100+'%';if(counter)counter.textContent='Разбито '+(4-count)+' / 4';
 }
 function toggleAim(){
  if(!healing())return false;aiming=!aiming;renderHealing();return aiming;
 }
 function renderHealing(){
  setSceneInteraction('Прицел → наведи мушку → отдельная кнопка «Выстрелить»',
   '<div class="echo-regen-info"><b id="echoRegenClock"></b><span id="echoLampCount"></span></div>');
  $('echoControls').hidden=false;$('echoControls').innerHTML='<button class="echo-touch-button echo-touch-aim" id="echo-aim" aria-label="Прицел" aria-pressed="'+aiming+'"><span>⌖</span><small>Прицел</small></button><button class="echo-touch-button echo-touch-fire" id="echo-fire" aria-label="Выстрелить" '+(!aiming||event.reload48?'disabled':'')+'><span>◎</span><small>'+(event.reload48?'Заряжаю':rounds48()?'Огонь':'Зарядить')+'</small></button>';
  buttons('<div class="echo-fight-panel"><h3>Радиоэхо · восстановление</h3><div class="health-track echo-heal-track"><i id="echoRegenFill"></i></div><span id="echoRegenHP"></span></div><p class="echo-aim-note">Нажми «Прицел», двигай мушку по экрану, затем отдельно нажми «Выстрелить». Касание сцены только наводит. Разбей 4 узла за 5 секунд: пока цел хотя бы один, лечение повторяется.</p>');
  bind('echo-aim',toggleAim);bind('echo-fire',()=>fire());canvas.style.cursor=aiming?'none':'pointer';canvas.style.touchAction='none';canvas.setAttribute('role','application');
  canvas.setAttribute('aria-label','Прицел: клавиша A. Стрелки наводят, Enter или пробел стреляют. Четыре прожектора за 5 секунд.');
  uiCache='';updateUI();
 }
 function fire(x=aim.x,y=aim.y){
  if(!healing()||!aiming||document.hidden||exhaustionOpen||!$('modalBackdrop').hidden||consumableBusy())return false;
  const t=performance.now();advance(t);if(!healing())return false;
  if(!weaponDamage()||event.reload48||t-event.echo.lastShotAt<SHOT_DELAY)return false;
  if(!rounds48()){beginReload48('lamps');renderHealing();return false;}
  setAim(x,y);
  const e=event.echo;consumeRound48();e.lastShotAt=t;event.shotAt=t;event.weaponUntil=t+500;AudioFX.play('shot');
  const hits=targets(t).filter(p=>!p.broken&&Math.hypot(p.x-aim.x,p.y-aim.y)<=p.r).sort((a,b)=>Math.hypot(a.x-aim.x,a.y-aim.y)-Math.hypot(b.x-aim.x,b.y-aim.y));
  if(hits.length){
   const hit=hits[0];e.broken[hit.id]=true;e.lastBreak=hit.id;e.lastBreakAt=t;AudioFX.play('echoGlass');spawnCombatPopup('Разбит','hit');
   if(intact()===0)finish();else updateUI();
  }else spawnCombatPopup('Мимо','miss');
  save();if(healing())renderHealing();return hits.length>0;
 }
 winCombat=function(){
  if(isEcho()&&!event.resolved&&event.hp<=0){if(healing())return false;if(!event.echo?.broken?.every(Boolean))return begin();}
  const finalEcho=isEcho()&&!event.resolved&&event.hp<=0&&event.echo?.used;
  const result=original.win();
  if(finalEcho&&event.resolved&&event.defeated&&!event.echoDeathPlayed){
   event.echoDeathPlayed=true;
   // Keep the corpse scene long enough for the user's complete 11.99-second death clip.
   event.resumeAt=Math.max(event.resumeAt,performance.now()+12200);
   AudioFX.play('echoDeath');save();
  }
  return result;
 };
 startCombat=function(){if(healing())return false;return original.start();};
 const paused=()=>document.hidden||exhaustionOpen||!$('modalBackdrop').hidden;
 function animateAttack(t){
  const a=event?.echoAttack;if(!isEcho()||!a)return;
  if(!paused())a.elapsed=Math.min(1150,a.elapsed+Math.max(0,t-a.lastAt));
  a.lastAt=t;
 }
 updateCombat=function(t){
  if(healing())return advance(t);
  if(isEcho()&&!event.resolved){
   animateAttack(t);if(paused())return;
   const c=event.combat;
   if(c?.phase==='monster'&&t>=c.nextAt&&!c.echoTelegraphed){
    event.echoAttack={elapsed:0,lastAt:t,impact:false};c.echoTelegraphed=true;c.nextAt=t+600;
    AudioFX.play('echoWindup');return;
   }
   if(c?.phase==='monster'&&c.echoTelegraphed){
    if(event.echoAttack?.elapsed<600)return;
    c.nextAt=t;event.echoAttack.impact=true;
   }
  }
  return original.combat(t);
 };
 syncAudioScene=function(){
  if(isEcho()){
   if(event.resolved&&event.defeated){AudioFX.setScene?.('echo-dead');return;}
   if(!event.resolved){AudioFX.setScene?.(event.battleStarted?'echo-combat':'echo-tower');return;}
  }
  return original.audio();
 };
 tick=function(t){
  if(healing()&&paused())event.echo.lastAt=t;
  animateAttack(t);
  return original.tick(t);
 };
 renderCombat=function(){if(healing())return renderHealing();return original.render();};
 function brokenFace(face,l){
  const x=l.x+(face.x-l.rect[0])*l.scale,y=l.y+(face.y-l.rect[1])*l.scale,rx=face.rx*l.scale,ry=face.ry*l.scale;
  ctx.save();ctx.translate(x,y);ctx.rotate(face.a);ctx.beginPath();
  if(face.rect){ctx.moveTo(-rx,-ry);ctx.lineTo(rx,-ry*.9);ctx.lineTo(rx*.9,ry);ctx.lineTo(-rx,ry*.9);}
  else for(let n=0;n<12;n++){const a=n*Math.PI/6,r=n%2?.87:1;const x=Math.cos(a)*rx*r,y=Math.sin(a)*ry*r;if(n===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
  ctx.closePath();ctx.clip();
  ctx.fillStyle='#0a0d0dec';ctx.fillRect(-rx,-ry,rx*2,ry*2);
  ctx.strokeStyle='#9ca9a680';ctx.lineWidth=1.1;
  for(let n=0;n<7;n++){const a=n*.897;ctx.beginPath();ctx.moveTo(rx*.15,ry*.05);ctx.lineTo(Math.cos(a)*rx*.55,Math.sin(a)*ry*.55);ctx.lineTo(Math.cos(a+.2)*rx,Math.sin(a+.2)*ry);ctx.stroke();}
  ctx.strokeStyle='#c9d0c076';ctx.beginPath();ctx.moveTo(-rx*.8,ry*.5);ctx.lineTo(-rx*.3,ry*.1);ctx.lineTo(rx*.35,ry*.65);ctx.stroke();
  ctx.restore();
 }
 function draw(t){
  if(!isEcho()||event.defeated)return;
  const l=window.BossSprites?.layout(t);if(!l)return;
  const e=event.echo;
  if(e?.used)lamps.forEach((lamp,i)=>{if(e.broken[i])lamp.faces.forEach(f=>brokenFace(f,l));});
  if(!healing())return;
  ctx.save();
  for(const p of targets(t)){
   ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.setLineDash(p.broken?[]:[6,6]);ctx.strokeStyle=p.broken?'#657b7377':'#ffdf8ed9';ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);
   if(!p.broken){ctx.font='bold 19px monospace';ctx.textAlign='center';ctx.fillStyle='#fff0bd';ctx.strokeStyle='#101b1a';ctx.lineWidth=4;ctx.strokeText(String(p.id+1),p.x,p.y-p.r-6);ctx.fillText(String(p.id+1),p.x,p.y-p.r-6);}
  }
  if(t-e.lastBreakAt<450&&e.lastBreak>=0){const p=targets(t)[e.lastBreak],f=Math.max(0,(t-e.lastBreakAt)/450);ctx.globalAlpha=1-f;for(let i=0;i<10;i++){const a=i*Math.PI/5,r=10+f*68;ctx.fillStyle=i%2?'#f4c477':'#c4d2ce';ctx.fillRect(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r+f*f*24,3,6);}ctx.globalAlpha=1;}
  // Iron sights are the aiming mark; a tiny fallback is used only while the PNG loads.
  if(aiming&&!artReady('echoADS')){ctx.strokeStyle='#fff3c8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(aim.x,aim.y,8,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
 }
 function attackShape(){
  const a=event.echoAttack;if(!isEcho()||event.resolved||healing()||!a||a.elapsed>=1150)return null;
  const l=window.BossSprites?.layout(a.lastAt);if(!l)return null;
  const base={x:l.x+l.w*.74,y:l.y+l.h*.83};
  const f=a.elapsed,wind=Math.min(1,f/420),strike=Math.max(0,Math.min(1,(f-420)/180)),back=Math.max(0,Math.min(1,(f-650)/500));
  const ease=n=>n*n*(3-2*n),s=ease(strike),b=ease(back);
  const tip={x:(770-wind*55)*(1-s)+380*s,y:(630-wind*310)*(1-s)+855*s};
  tip.x=tip.x*(1-b)+base.x*b;tip.y=tip.y*(1-b)+base.y*b;
  return {base,p1:{x:base.x+180*(1-b),y:base.y-100-wind*120},p2:{x:840-200*s,y:280+250*s+250*b},tip,alpha:1-b,scale:.38+.18*s};
 }
 function drawTentacle(){
  const a=attackShape();if(!a||!artReady('echoTentacle'))return;
  const point=u=>{const v=1-u;return{x:v*v*v*a.base.x+3*v*v*u*a.p1.x+3*v*u*u*a.p2.x+u*u*u*a.tip.x,y:v*v*v*a.base.y+3*v*v*u*a.p1.y+3*v*u*u*a.p2.y+u*u*u*a.tip.y};};
  ctx.save();ctx.globalAlpha=a.alpha;
  // Bend the generated raster along a cubic curve using overlapping narrow strips.
  const n=40,sx=16,sy=260,sw=1500,sh=510;
  for(let i=0;i<n;i++){
   const p=point(i/n),q=point((i+1)/n),length=Math.hypot(q.x-p.x,q.y-p.y),h=sh*a.scale;
   ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(q.y-p.y,q.x-p.x));
   ctx.drawImage(arm,(sx+sw*i/n)*arm.naturalWidth/1536,sy*arm.naturalHeight/1024,(sw/n+.5)*arm.naturalWidth/1536,sh*arm.naturalHeight/1024,0,-h/2,length+1.5,h);ctx.restore();
  }
  ctx.restore();
 }
 drawBoss=function(t){original.draw(t);drawTentacle();draw(t);};
 drawWeapon=function(t){
  if(!healing()||event.reload48)return original.weapon(t);
  if(!aiming){const until=event.weaponUntil;event.weaponUntil=t+1;original.weapon(t);event.weaponUntil=until;return;}
  if(artReady('echoADS')){
   const p=weaponPose(t);
   // Preserve the generated proportions; forearms continue below the viewport.
   ctx.save();
   ctx.drawImage(ads,p.x,p.y,p.w,p.h);
   if(t-event.echo.lastShotAt<65){
    const m=p.muzzle;ctx.fillStyle='#ffe5a2';ctx.beginPath();ctx.moveTo(m.x-11,m.y+3);ctx.lineTo(m.x-5,m.y-12);ctx.lineTo(m.x,m.y-25);ctx.lineTo(m.x+6,m.y-10);ctx.lineTo(m.x+12,m.y+3);ctx.closePath();ctx.fill();
   }
   ctx.restore();
  }
 };
 function snapshot(){
  if(!isEcho()||event.resolved)return null;
  const e=event.echo,t=performance.now(),c=event.combat;
  return {version:2,reload48:reloadSnapshot48(),duration:DURATION,hp:event.hp,maxHp:event.maxHp,attack:event.attack,balance51:event.balance51,phase:e?.phase||'main',elapsed:e?.elapsed||0,broken:e?.broken||[false,false,false,false],special:window.RadioEchoV45?.snapshot()||null,shotLeft:e?Math.max(0,SHOT_DELAY-(t-e.lastShotAt)):0,battleStarted:!!event.battleStarted,combat:c&&['player','monster','recover','reload'].includes(c.phase)?{phase:c.phase,shots:c.shots,left:Math.max(0,c.nextAt-t)}:null};
 }
 save=function(){state.radioEchoFight=snapshot();original.save();};
 function restore(){
  const p=loadedRaw?.radioEchoFight;aiming=false;
  if(loadedRaw?.mode!=='expedition'||loadedRaw.location!==3||!p||![1,2].includes(p.version)||!Number.isFinite(p.hp)||p.hp<0||p.hp>(p.maxHp??320)||!Number.isFinite(p.maxHp??320)||(p.maxHp??320)>100000||!['main','healing','finish'].includes(p.phase)||!Array.isArray(p.broken)||p.broken.length!==4||p.broken.some(v=>typeof v!=='boolean')||!Number.isFinite(p.elapsed)||p.elapsed<0||p.elapsed>(p.version===1?10000:DURATION))return false;
  if(p.phase!=='healing'&&p.hp<=0)return false;
  const t=performance.now();state.mode='expedition';state.location=3;state.dungeon=null;state.routeEnd=false;
  event={type:'monster',enemy:null,boss:true,maxHp:p.maxHp??320,hp:p.hp,attack:p.attack??14,balance51:p.balance51,created:t-1000,resolved:false,flash:0,battleStarted:!!p.battleStarted,combatLog:[],echo:{used:p.phase!=='main',phase:p.phase,elapsed:p.version===1?p.elapsed*DURATION/10000:p.elapsed,lastAt:t,broken:[...p.broken],lastShotAt:t-SHOT_DELAY+Math.max(0,Math.min(SHOT_DELAY,Number(p.shotLeft)||0)),lastBreak:-1,lastBreakAt:-10000}};
  if(p.phase==='healing')event.combat={phase:'echoRegen'};
  else if(p.combat&&['player','monster','recover','reload'].includes(p.combat.phase)&&Number.isInteger(p.combat.shots)&&p.combat.shots>=0&&p.combat.shots<=2)event.combat={phase:p.combat.phase,shots:p.combat.shots,nextAt:t+Math.max(80,Math.min(1200,Number(p.combat.left)||0))};
  if(p.reload48)restoreReload48(p.reload48);
  closeModal();travelMotion=null;nextWalkAt=Infinity;render();save();return true;
 }
 function pause(){if(healing())event.echo.lastAt=performance.now();}
 document.addEventListener('visibilitychange',pause);
 window.addEventListener('pagehide',()=>{pause();save();});
 function aimPointer(e){
  if(!healing())return;
  e.preventDefault();e.stopImmediatePropagation();
  if(!aiming||e.isPrimary===false)return;
  const p=canvasPoint(e);setAim(p.x,p.y);
 }
 canvas.addEventListener('pointermove',aimPointer,{capture:true});
 canvas.addEventListener('pointerdown',e=>{if(!healing())return;AudioFX.unlock(sound);aimPointer(e);},{capture:true});
 canvas.addEventListener('pointerup',e=>{if(healing()){e.preventDefault();e.stopImmediatePropagation();}},{capture:true});
 canvas.addEventListener('pointercancel',()=>{},{capture:true});
 canvas.addEventListener('keydown',e=>{
  if(!healing())return;
  e.preventDefault();e.stopImmediatePropagation();
  if(e.key.toLowerCase()==='a'&&!e.repeat){toggleAim();return;}
  if(!aiming)return;
  const dirs={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]};
  if(dirs[e.key])setAim(aim.x+dirs[e.key][0],aim.y+dirs[e.key][1]);
  else if((e.key==='Enter'||e.key===' ')&&!e.repeat)fire();
 },{capture:true});
 window.RadioEcho={isEcho,healing,begin,advance,fire,targets,pause,lamps,snapshot,setAim,weaponPose,attackShape,toggleAim,isAiming:()=>aiming};restore();
})();
