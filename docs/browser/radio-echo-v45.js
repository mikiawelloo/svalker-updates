'use strict';
// Boss-specific secondary attack and a durable two-minion interlude.
(() => {
 const E=window.RadioEcho,PAUSE=()=>document.hidden||exhaustionOpen||!$('modalBackdrop').hidden||window.Alcohol?.active();
 const defs=[
  {name:'Зомбированный связист',maxHp:40,attack:9,accuracy:.40,resistance:.60,heal:6,art:'echo-zombie1'},
  {name:'Зомбированный охранник',maxHp:55,attack:11,accuracy:.35,resistance:.65,heal:8,art:'echo-zombie2'}
 ];
 function def51(i){return window.Economy51?.minion(defs[i],event)||defs[i];}
 for(const [key,file]of [['echo-antenna','antenna.png']]){const img=new Image();img.src='assets/echo-v45/'+file;WORLD_ART[key]=img;}
 for(let i=1;i<=2;i++)for(const pose of ['idle','raised','strike','dead']){const img=new Image();img.src='assets/echo-hq-v46/zombie'+i+'-'+pose+'.png';WORLD_ART['echo-zombie'+i+'-'+pose]=img;}
 const old={update:updateCombat,start:startCombat,win:winCombat,render:renderCombat,action:renderAction,draw:drawBoss,save,tick,escape:escapeExpedition};
 function data(){if(!E.isEcho())return null;return event.echoSpecial||(event.echoSpecial={attackNumber:0,summonUsed:false,phase:'boss',elapsed:0,lastAt:performance.now(),zombies:[],target:0,turnIndex:0,combat:null,attack:null,antenna:null});}
 const minions=()=>E.isEcho()&&!event.resolved&&['summoning','minions'].includes(event.echoSpecial?.phase);
 const living=()=>data()?.zombies.map((z,i)=>z.hp>0?i:-1).filter(i=>i>=0)||[];
 function summon(force=false){
  if(!E.isEcho()||event.resolved||E.healing())return false;
  const d=data();if(d.summonUsed||!event.echo?.broken?.every(Boolean)||(!force&&event.hp>45))return false;
  d.summonUsed=true;d.phase='summoning';d.elapsed=0;d.lastAt=performance.now();d.zombies=defs.map((_,i)=>({hp:def51(i).maxHp,dead:false,flash:0}));d.target=0;d.turnIndex=0;d.combat=null;d.attack=null;d.antenna=null;
  event.hp=Math.max(10,Math.min(45,event.hp));event.combat=null;event.echoAttack=null;
  AudioFX.play('zombieRoar');spawnCombatPopup('Сигнал призыва','heal');save();renderAction();return true;
 }
 function retreatProgress(){const d=E.isEcho()&&event.echoSpecial;if(!d)return 0;if(d.phase==='summoning')return Math.min(1,d.elapsed/1200);if(d.phase==='minions')return 1;if(d.phase==='returning')return Math.max(0,1-d.elapsed/800);return 0;}
 function renderMinions(){
  const d=data(),z=def51(d.target),hp=d.zombies[d.target]?.hp||0,busy=d.phase==='summoning'||!!d.combat;
  setSceneInteraction(event.reload48?'Перезарядка · пропуск хода':busy?'Противник готовит удар':rounds48()?'Коснись сцены · два выстрела в текущую цель':'Коснись сцены · перезарядить · пропуск хода',combatHUD49(d.phase==='summoning'?'Радиоэхо зовёт заражённых':z.name,hp,z.maxHp));
  buttons('<p class="echo-aim-note">Сначала связист, затем охранник. Устойчивы к пулям; успешные удары восстанавливают им здоровье.</p>');
  $('echoControls').hidden=true;
 }
 function startMinionCombat(){
  const d=data();if(!d||d.phase!=='minions'||d.combat||PAUSE()||consumableBusy()||!weaponDamage())return false;
  if(!rounds48()){d.combat={phase:'reload',shots:0,nextAt:performance.now()};return beginReload48('minions',d.combat);}
  if(!spend(4,startCombat))return false;
  d.combat={phase:'player',shots:0,nextAt:performance.now()+80};event.weaponUntil=performance.now()+3000;event.battleStarted=true;save();renderAction();return true;
 }
 function finishMinions(){
  const d=data();d.phase='returning';d.elapsed=0;d.lastAt=performance.now();d.combat=null;d.attack=null;event.combat=null;save();renderAction();
 }
 function playerShot(t){
  const d=data(),c=d.combat,z=d.zombies[d.target],def=def51(d.target);if(!rounds48()){c.phase='zombie';c.nextAt=t+650;return;}c.shots++;event.weaponUntil=t+1600;
  if(Math.random()<weaponJamChance()){event.jamAt=t;AudioFX.play('jam');spawnCombatPopup('Клин','jam','player');}
  else{consumeRound48();event.shotAt=t;AudioFX.play('shot');if(Math.random()<weaponAccuracy()){
   const damage=Math.max(1,Math.round(weaponDamage()*(1-def.resistance))),before=z.hp;z.hp=Math.max(0,z.hp-damage);z.flash=t;spawnCombatPopup('−'+Math.ceil(before-z.hp),'hit');
   if(!z.hp){z.dead=true;AudioFX.play('zombieDeath');if(d.target===0)d.target=1;else{finishMinions();return;}}
  }else spawnCombatPopup('Промах','miss');}
  if(c.shots>=2||!rounds48()){c.phase='zombie';c.nextAt=t+650;}else c.nextAt=t+430;
 }
 function minionUpdate(t){
  const d=data(),dt=Math.max(0,t-d.lastAt);d.lastAt=t;if(PAUSE()){if(d.combat)d.combat.nextAt+=dt;if(d.attack)d.attack.lastAt+=dt;return;}
  if(d.attack)d.attack.elapsed=Math.min(900,Math.max(0,t-d.attack.lastAt));
  if(d.phase==='summoning'){d.elapsed=Math.min(1200,d.elapsed+dt);if(d.elapsed>=1200){d.phase='minions';save();renderAction();}return;}
  if(d.phase==='returning'){d.elapsed=Math.min(800,d.elapsed+dt);if(d.elapsed>=800){d.phase='boss';save();renderAction();}return;}
  const c=d.combat;if(!c)return;
  if(c.phase==='reload'){if(stepReload48(t)){c.phase='zombie';c.nextAt=t+650;save();renderAction();}return;}
  if(t<c.nextAt)return;
  if(c.phase==='player')playerShot(t);
  else if(c.phase==='zombie'){
   if(!d.attack){const alive=living();if(!alive.length){finishMinions();return;}let attacker=d.turnIndex%2;if(!alive.includes(attacker))attacker=alive[0];d.turnIndex=(attacker+1)%2;d.attack={attacker,elapsed:0,lastAt:t,applied:false};c.nextAt=t+600;AudioFX.play('zombieRoar');}
   else{const a=d.attack;a.elapsed=Math.max(0,t-a.lastAt);if(a.elapsed<600)return;
    if(!a.applied){a.applied=true;const def=def51(a.attacker),z=d.zombies[a.attacker];event.attackAt=t;AudioFX.play('zombieAttack');
     if(Math.random()<def.accuracy){const damage=Math.max(1,def.attack-armor());state.hp=Math.max(0,state.hp-damage);event.playerHitAt=t;spawnCombatPopup('−'+damage,'hurt','player');z.hp=Math.min(def.maxHp,z.hp+def.heal);if(state.hp<=0){defeatPlayer('monster');return;}}
     else spawnCombatPopup('Промах','miss','player');
    }c.phase='recover';c.nextAt=t+550;
   }
  }else{d.combat=null;d.attack=null;}
  save();renderAction();updateVitals();
 }
 function antennaUpdate(t){
  const d=data(),a=d.antenna,c=event.combat;if(!a||!c)return;
  const dt=Math.max(0,t-a.lastAt);a.lastAt=t;if(PAUSE())return;a.elapsed=Math.min(1300,a.elapsed+dt);
  if(a.elapsed>=800&&!a.applied){a.applied=true;state.radiation=Math.min(100,state.radiation+15);spawnCombatPopup('+15 радиации','radiation','player');AudioFX.play('radio-static');save();updateVitals();}
  if(a.elapsed>=1300){d.antenna=null;d.attackNumber++;c.phase='recover';c.nextAt=t+550;save();renderAction();}
 }
 startCombat=function(){if(minions())return startMinionCombat();if(E.isEcho()&&data().phase==='returning')return false;return old.start();};
 escapeExpedition=function(){if(minions()||E.isEcho()&&data().phase==='returning')return false;return old.escape();};
 winCombat=function(){if(minions())return false;if(E.isEcho()&&!event.resolved&&event.hp<=0&&event.echo?.broken?.every(Boolean)&&summon())return false;return old.win();};
 updateCombat=function(t){
  if(E.isEcho()&&!event.resolved){
   const d=data();
   if(minions()||d.phase==='returning')return minionUpdate(t);
   if(!E.healing()&&event.echo?.broken?.every(Boolean)&&event.hp<=45&&!d.summonUsed){summon();return;}
   if(d.antenna)return antennaUpdate(t);
   const c=event.combat;
   if(!E.healing()&&c?.phase==='monster'&&!c.echoTelegraphed&&t>=c.nextAt&&d.attackNumber%2===1&&!PAUSE()){
    d.antenna={elapsed:0,lastAt:t,applied:false};event.echoAttack=null;c.echoRadiation=true;c.nextAt=t+1300;AudioFX.play('echoWindup');save();return;
   }
   const phase=c?.phase;const result=old.update(t);
   if(E.isEcho()&&phase==='monster'&&event.combat?.phase==='recover'){data().attackNumber++;save();}
   return result;
  }
  return old.update(t);
 };
 tick=function(t){
  if(E.isEcho()&&!event.resolved&&PAUSE()){
   const d=data(),gap=Math.max(0,t-d.lastAt);d.lastAt=t;
   if(d.antenna)d.antenna.lastAt=t;
   if(minions()||d.phase==='returning'){if(d.combat)d.combat.nextAt+=gap;if(d.attack)d.attack.lastAt+=gap;}
  }
  return old.tick(t);
 };
 renderCombat=function(){if(minions())return renderMinions();if(E.isEcho()&&data().phase==='returning'){setSceneInteraction('','<h3>Радиоэхо возвращается</h3>');buttons('');return;}return old.render();};
 renderAction=function(){const ui=$('echoControls');ui.hidden=!E.healing();if(ui.hidden)ui.innerHTML='';return old.action();};
 function drawAntenna(t){
  const d=data(),a=d?.antenna;if(!a||!artReady('echo-antenna'))return;
  const l=window.BossSprites.layout(t);if(!l)return;
  const f=a.elapsed,rise=Math.min(1,f/650),lower=f>1000?(f-1000)/300:0,angle=.10-rise*1.55+lower*1.55;
  const img=WORLD_ART['echo-antenna'],w=500,h=w*img.naturalHeight/img.naturalWidth;
  ctx.save();ctx.translate(l.x+l.w*.25,l.y+l.h*.77);ctx.rotate(angle);ctx.drawImage(img,0,-h*.5,w,h);ctx.restore();
  if(a.applied&&f<1100){ctx.save();ctx.strokeStyle='#b2ed8a88';ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(450,330,90+(f-800)*.6+i*65,45+(f-800)*.25+i*28,0,0,Math.PI*2);ctx.stroke();}ctx.restore();}
 }
 function drawZombies(t){
  const d=data();if(!d?.summonUsed||!['summoning','minions','returning'].includes(d.phase))return;
  for(let i=1;i>=0;i--){
   const z=d.zombies[i],a=d.attack;let pose=z.dead?'dead':'idle';
   if(a?.attacker===i&&!z.dead){const elapsed=t-a.lastAt;pose=elapsed<450?'raised':elapsed<850?'strike':'idle';}
   const key=defs[i].art+'-'+pose,img=WORLD_ART[key];if(!artReady(key))continue;
   const rect=frameRect(i,pose,img),scale=Math.min((z.dead?330:340)/rect[2],(z.dead?240:440)/rect[3]),w=rect[2]*scale,h=rect[3]*scale,x=(i?650:260)-w/2;
   const appear=d.phase==='summoning'?Math.min(1,d.elapsed/1100):1,fade=d.phase==='returning'?1-d.elapsed/800:1;
   const y=775-h+(1-appear)*70+(z.dead?0:Math.sin(t*.003+i)*2);
   ctx.save();ctx.globalAlpha=appear*fade;if(!z.dead&&t-z.flash<130)ctx.filter='brightness(1.6)';ctx.drawImage(img,...rect,x,y,w,h);ctx.restore();
  }
 }
 function frameRect(i,pose,img){return [0,0,img.naturalWidth,img.naturalHeight];}
 drawBoss=function(t){old.draw(t);if(E.isEcho()&&!event.resolved){drawAntenna(t);drawZombies(t);}};
 function snapshot(){const d=E.isEcho()&&event.echoSpecial;if(!d)return null;const p=JSON.parse(JSON.stringify(d));if(p.combat){p.combat.left=Math.max(0,p.combat.nextAt-performance.now());delete p.combat.nextAt;}return p;}
 function restore(){
  const p=loadedRaw?.radioEchoFight?.special;if(!E.isEcho()||!p)return false;
  if(!['boss','summoning','minions','returning'].includes(p.phase)||!Number.isInteger(p.attackNumber)||p.attackNumber<0||typeof p.summonUsed!=='boolean')return false;
  if(p.summonUsed&&(!Array.isArray(p.zombies)||p.zombies.length!==2||p.zombies.some((z,i)=>!Number.isFinite(z.hp)||z.hp<0||z.hp>def51(i).maxHp)||p.target!==0&&p.target!==1))return false;
  const d=JSON.parse(JSON.stringify(p)),t=performance.now();d.lastAt=t;d.elapsed=Math.max(0,Math.min(1200,Number(d.elapsed)||0));
  if(d.combat){if(!['player','zombie','recover','reload'].includes(d.combat.phase))return false;d.combat.nextAt=t+Math.max(80,Math.min(1200,Number(d.combat.left)||0));}
  if(d.attack){d.attack.elapsed=Math.min(900,Number(d.attack.elapsed)||0);d.attack.lastAt=t-d.attack.elapsed;}
  if(d.antenna){d.antenna.elapsed=Math.min(1300,Number(d.antenna.elapsed)||0);d.antenna.lastAt=t;}
  event.echoSpecial=d;if(['summoning','minions','returning'].includes(d.phase))event.combat=null;render();return true;
 }
 window.RadioEchoV45={defs,data,minions,busy:()=>minions()||E.isEcho()&&data().phase==='returning',summon,retreatProgress,snapshot,frameRect};restore();
})();
