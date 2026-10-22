'use strict';
const XP_CURVE_VERSION=3;
function levelCost(n){return 1000;}
function xpAtLevel(n){return (Math.max(1,Math.floor(Number(n)||1))-1)*1000;}
function xpProgress(xp=state.xp){
 xp=Number.isFinite(Number(xp))?Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(Number(xp)))):0;
 return {level:Math.floor(xp/1000)+1,current:xp%1000,required:1000};
}
function initPlayerXP(raw){
 const oldXP=Number.isFinite(Number(state.xp))?Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(Number(state.xp)))):0;
 if(raw&&raw.xpCurveVersion!==XP_CURVE_VERSION){
  let n=1,left=oldXP,cost=40;
  if(raw.xpCurveVersion===2){while(left>=cost){left-=cost;n++;cost=n===2?50:Math.ceil(cost*1.25);}}
  else{n=Math.floor(oldXP/40)+1;left=oldXP%40;}
  state.xp=xpAtLevel(n)+Math.min(999,Math.floor(left/cost*1000));
 }else state.xp=oldXP;
 state.xpCurveVersion=XP_CURVE_VERSION;
}
function topUIAvailable(){return !state.routeEnd&&!exhaustionOpen&&!event?.detained&&!event?.combat&&!state.defeat;}
function updateTopActions(){$('inventoryTab').disabled=!['base','camp'].includes(state.mode)||!topUIAvailable();for(const id of ['mapButton','questsButton','perksButton'])$(id).disabled=!topUIAvailable();}
function openQuests(){
 if(!topUIAvailable())return false;
 openModal('<h2 id="modalTitle">Квесты</h2>'+(questTrackerHTML()||'<p>Активных квестов пока нет.</p>')+(typeof event47ParcelsHTML==='function'?event47ParcelsHTML():'')+(state.mode==='base'&&state.events47?.cargo?.stage==='sealed'?'<div class="rare-options"><button class="primary" id="cargo47-deliver">Передать груз владельцу · +'+CARGO47[state.events47.cargo.kind].reward+' ₽</button><button class="secondary" id="cargo47-open">Вскрыть груз</button></div>':'')+(state.mode==='base'?'<button class="primary" id="quests-bartender">К бармену</button>':''));
 bind('cargo47-deliver',()=>manageCargo47('deliver'));bind('cargo47-open',()=>confirmCargoOpen47());
 bind('quests-bartender',()=>openBartender());return true;
}
function openPerks(){if(!topUIAvailable())return false;openModal('<h2 id="modalTitle">Перки</h2><p>Будет скоро.</p>');return true;}
function persistPatrolChoice(){state.patrolChoice=state.mode==='expedition'&&event?.type==='patrol'&&event.detained&&!event.resolved?{night:!!event.night,needsLamp:!!event.needsLamp}:null;}
function restorePatrolChoice(raw){
 if(!raw?.patrolChoice||typeof raw.patrolChoice.night!=='boolean')return false;
 state.dungeon=null;state.mode='expedition';const t=performance.now();nextWalkAt=0;
 event={type:'patrol',created:t-4000,approachEnd:t,deadline:t,arrived:true,detained:true,resolved:false,night:raw.patrolChoice.night,needsLamp:!!raw.patrolChoice.needsLamp};return true;
}
function surrenderPatrol(){
 if(state.mode!=='expedition'||event?.type!=='patrol'||!event.detained||event.resolved)return false;
 event.detained=false;const lost=totalItems();for(const key of Object.keys(state.items))state.items[key]=0;AudioFX.play('failure');
 returnToBase('Патруль отправил тебя на базу. Потеряно '+lost+' предметов. Деньги сохранены.');return true;
}
function payPatrolBribe(){
 if(state.mode!=='expedition'||event?.type!=='patrol'||!event.detained||event.resolved)return false;
 const price=100*level();if(state.money<price)return false;
 state.money-=price;event.detained=false;closeModal();AudioFX.play('coin');resolve('Патруль пропустил','Взятка уплачена. Можно идти дальше.');save();updateVitals();return true;
}
