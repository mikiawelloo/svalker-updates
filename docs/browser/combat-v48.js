'use strict';
const MAGAZINE48_SIZE=8,RELOAD48_MS=1100;
function initMagazine48(raw){
 const n=raw?.magazine48?.rounds;
 state.magazine48={rounds:Number.isInteger(n)?Math.max(0,Math.min(MAGAZINE48_SIZE,n)):MAGAZINE48_SIZE};
}
function rounds48(){return state.magazine48?.rounds??MAGAZINE48_SIZE;}
function consumeRound48(){if(rounds48()<=0)return false;state.magazine48.rounds--;return true;}
function magazineHUD48(){return '<span class="magazine48">Патроны <b>'+rounds48()+' / '+MAGAZINE48_SIZE+'</b></span>'+(event?.reload48?'<small class="magazine48-note">Перезарядка…</small>':!rounds48()?'<small class="magazine48-note">'+(window.RadioEcho?.healing()?'Нажми «Зарядить»':'Коснись сцены: перезарядка займёт ход')+'</small>':'');}
function combatHUD49(name,hp,maxHp){
 const health=Math.max(0,Math.min(maxHp,Math.ceil(hp))),percent=Math.max(0,Math.min(100,health/maxHp*100));
 return '<div class="enemy-health49"><div class="health-track" role="progressbar" aria-label="Здоровье противника" aria-valuemin="0" aria-valuemax="'+maxHp+'" aria-valuenow="'+health+'"><i style="width:'+percent+'%"></i></div><span>'+health+' / '+maxHp+'</span></div><h3 class="enemy-title49">'+name+'</h3>';
}
function combatHint48(busy=!!event?.combat){
 if(!weaponDamage())return 'Оружие не надето · попробуй сбежать';
 if(event?.reload48)return 'Перезарядка · пропуск хода';
 if(busy)return event.combat?.phase==='player'?'Стреляем…':event.combat?.phase==='recover'?'Готовимся…':'Противник атакует…';
 return rounds48()?'Коснись сцены · '+(rounds48()===1?'1 выстрел':'2 выстрела')+' · −'+staminaCost(4)+' выносливости':'Коснись сцены · перезарядить · пропуск хода';
}
function beginReload48(origin='combat',turn=event?.combat){
 if(!event||event.resolved||event.reload48||rounds48()>0)return false;
 const t=performance.now();event.reload48={elapsed:0,lastAt:t,origin};event.weaponUntil=t+RELOAD48_MS;event.battleStarted=true;
 if(turn){turn.phase='reload';turn.shots=0;turn.nextAt=t+RELOAD48_MS;}
 AudioFX.play('reload');spawnCombatPopup('Перезарядка','jam','player');save();renderAction();return true;
}
function stepReload48(t=performance.now()){
 const a=event?.reload48;if(!a)return false;
 const dt=Math.max(0,t-a.lastAt);a.lastAt=t;
 if(document.hidden||exhaustionOpen||!$('modalBackdrop').hidden||window.Alcohol?.active())return false;
 a.elapsed=Math.min(RELOAD48_MS,a.elapsed+dt);
 if(a.elapsed<RELOAD48_MS)return false;
 state.magazine48.rounds=MAGAZINE48_SIZE;event.reload48=null;return true;
}
function pauseReload48(){if(event?.reload48)event.reload48.lastAt=performance.now();}
function reloadSnapshot48(){const a=event?.reload48;return a?{elapsed:Math.max(0,Math.min(RELOAD48_MS,a.elapsed)),origin:a.origin}:null;}
function restoreReload48(p){
 if(!p||!Number.isFinite(p.elapsed)||p.elapsed<0||p.elapsed>RELOAD48_MS||!['combat','minions','lamps'].includes(p.origin))return false;
 event.reload48={elapsed:p.elapsed,origin:p.origin,lastAt:performance.now()};return true;
}

// Deterministic poses use the saved reload clock, including after a pause/reload.
function weaponPose50(t=performance.now()){
 const p=event?.reload48?Math.max(0,Math.min(1,event.reload48.elapsed/RELOAD48_MS)):0;
 const smooth=n=>{n=Math.max(0,Math.min(1,n));return n*n*(3-2*n);};
 const enter=smooth((p-.16)/.34),seat=smooth((p-.50)/.18),leave=smooth((p-.76)/.20);
 const shot=Math.max(0,1-(t-(event?.shotAt??-10000))/210),jam=Math.max(0,1-(t-(event?.jamAt??-10000))/160);
 return {x:250+shot*4,y:430+shot*24+jam*6,angle:shot*.018,w:600,h:400,
  reloadMix:event?.reload48?smooth(p/.16)*(1-smooth((p-.86)/.14)):0,
  handX:309-204+(1-enter)*-35-seat*30-leave*45,handY:274-27+(1-enter)*115-seat*145+leave*35,
  handAlpha:event?.reload48?smooth((p-.12)/.10)*(1-leave):0};
}
