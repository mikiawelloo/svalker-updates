'use strict';
(() => {
const keys=['armorMk2','maskMk2','bootsMk2','packMk2','lampMk2'];
function init(){const old=state.gear78?.levels||{};state.gear78={version:1,levels:Object.fromEntries(keys.filter(k=>state.ownedGear.includes(k)).map(k=>[k,Math.max(0,Math.min(10,Math.floor(Number(old[k])||0)))]))};}
function level(k){return Math.max(0,Math.min(10,Number(state.gear78?.levels?.[k])||0));}
function cost(k){const n=level(k);return {money:4000+n*n*1200,materials:{scrap:12+n*5,circuit:6+n*3,tarpaulin:1+Math.floor(n/3),...(k==='armorMk2'?{cloth:8+n*3}:{})}};}
function chance(k){return techChance(Math.max(.3,.9-level(k)*.055));}
function can(k){return !document.hidden&&state.mode==='base'&&state.location>0&&modalNpc===2&&keys.includes(k)&&state.ownedGear.includes(k)&&level(k)<10&&affordable72(cost(k));}
function upgrade(k){if(!can(k)||!pay72(cost(k)))return false;const success=Math.random()<chance(k);if(success)state.gear78.levels[k]=level(k)+1;AudioFX.play(success?'craft':'upgradeFail');save();render();openWorkshop72();toast(success?'Усиление II успешно: '+GEAR[k].name:'Неудача. Оплата и материалы потрачены, предмет и уровень сохранены.');return success;}
function consume(k){if(state.gear78)delete state.gear78.levels[k];}
function reset(k){if(keys.includes(k)){if(!state.gear78)init();state.gear78.levels[k]=0;}}
function ui(){return '<div class="tech-tabs"><button id="tech-weapon">Оружие</button><button class="active" id="tech-equipment">Экипировка</button></div><h3>Усиление снаряжения II · до 10/10</h3><p>Для региональной модификации усили соответствующую вещь II уровня до 10/10. Старые улучшения начального снаряжения относятся к первой базе. При неудаче предмет и текущий уровень сохраняются, оплата и материалы расходуются.</p>'+keys.map(k=>'<div class="tech-upgrade"><b>'+itemIcon(k)+' '+GEAR[k].name+' · '+level(k)+'/10</b><p>'+GEAR[k].desc+'</p><p>'+costHTML72(cost(k))+'</p><span class="upgrade-odds">Шанс успеха '+Math.round(chance(k)*100)+'%</span>'+(!state.ownedGear.includes(k)?'<p>Сначала создай этот предмет II уровня в Тихой гавани.</p>':'')+'<button id="gear78-'+k+'" class="secondary" '+(!can(k)?'disabled':'')+'>Попытаться усилить</button></div>').join('');}
function bindUI(){for(const k of keys)bind('gear78-'+k,()=>upgrade(k));bind('tech-weapon',()=>openTech('weapon'));bind('tech-equipment',()=>openTech('equipment'));}
function workshopChance(action){if(action==='packUp')return techChance(Math.max(.3,.9-(state.p72?.packLevel||0)*.055));if(action==='beltUp')return techChance(.85-(state.p72?.beltLevel||0)*.09);return techChance(['body','mask','feet'].includes(action)?.60:.75);}
function artifactChance(a){return techChance(Math.max(.25,.85-a.level*.055));}
window.Gear78={keys,init,level,cost,chance,can,upgrade,consume,reset,ui,bindUI,workshopChance,artifactChance};
})();
