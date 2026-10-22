'use strict';
// Balance is frozen when a fight starts; reloading never heals or rescales it.
(() => {
 const mobHP=[1.5,2.1,2.8,3.5,4.5],mobAttack=[1.2,1.6,2,2.5,3.1];
 const bossHP=[1.4,1.6,1.8,2,2.3],bossAttack=[1.1,1.4,1.65,1.85,2.05];
 const recipes={
  tarpaulin:{money:800,materials:{cloth:6,scrap:2}},
  radioParts:{money:1600,materials:{circuit:5,scrap:3}},
  weaponParts:{money:2400,materials:{scrap:8,circuit:3}},
  anomalousComponent:{money:4800,materials:{artifact:1,circuit:8,scrap:10}}
 };
 function stats(hp,attack,boss=false,location=state.location,playerLevel=level()){
  const loc=Math.max(0,Math.min(4,Math.floor(location))),growth=Math.max(0,Math.min(200,playerLevel)-1);
  return {maxHp:Math.ceil(hp*((boss?bossHP:mobHP)[loc]+growth*(boss?.018:.075))),attack:Math.ceil(attack*(boss?bossAttack:mobAttack)[loc]+growth*(boss?.30:.50))};
 }
 function apply(e=event){
  if(!e||e.resolved||e.balance51||!['monster','human'].includes(e.type)||e.type==='human'&&e.enemy!=='raider'&&e.enemy!=='bum')return;
  const old=e.maxHp,ratio=old>0?Math.max(0,Math.min(1,e.hp/old)):1;
  const s=stats(old,e.attack,!!e.boss);
  // Five bullets share one attack: keep late-game bursts survivable in appropriate armor.
  if(e.enemy==='raider')s.attack=Math.ceil(e.attack+(s.attack-e.attack)*.60);
  e.balance51={location:state.location,level:level(),baseHP:old,baseAttack:e.attack};e.maxHp=s.maxHp;e.hp=Math.ceil(s.maxHp*ratio);e.attack=s.attack;
 }
 function init(raw){
  const old=raw?.economy51,counts={};
  for(const [k,n]of Object.entries(old?.events||{}))if(Number.isSafeInteger(n)&&n>=0)counts[k]=n;
  state.economy51={version:1,events:counts,recent:Array.isArray(old?.recent)?old.recent.filter(k=>typeof k==='string').slice(-2):[]};
  if(!old&&state.dungeonReadyAt>Date.now())state.dungeonReadyAt+=15*60*1000;
 }
 function eligible(){
  const r=state.rare,q=state.events47;
  return ['crate','monster','fork','anomaly','camp','stalkers','pump','well',
   ...SPECIAL_EVENTS.filter(d=>specialEligible(d)&&
    (d.kind!=='radioSignal'||!r.radio)&&(d.kind!=='mutantTracks'||!r.hunt)&&
    (d.kind!=='wounded'||!r.rescue||r.rescue.stage==='completed')).map(d=>d.kind),
   ...EVENTS47.filter(d=>(!d.locations||d.locations.includes(state.location))&&
    (d.kind!=='lostBackpack'||!q.backpack||['returned','closed'].includes(q.backpack.stage))&&
    (d.kind!=='wreckedCaravan'||!q.cargo||['closed','opened'].includes(q.cargo.stage))&&
    (d.kind!=='blackMarks'||!q.marks)).map(d=>d.kind)];
 }
 function roll(){
  // Keep the original patrol roll, boundaries and two-expedition lock untouched.
  if(rollRoadEvent()==='patrol')return 'patrol';
  const r=state.economy51,list=eligible().filter(k=>!r.recent.includes(k)),min=Math.min(...list.map(k=>r.events[k]||0));
  const pool=list.filter(k=>(r.events[k]||0)===min),kind=pool[Math.min(pool.length-1,Math.floor(Math.random()*pool.length))];
  r.events[kind]=(r.events[kind]||0)+1;r.recent=[...r.recent,kind].slice(-2);
  if(SPECIAL_KINDS.includes(kind))state.rare.history[kind]=Date.now();
  if(EVENTS47.some(d=>d.kind===kind))state.events47.history[kind]=state.steps;
  return kind;
 }
 function loss(){
  const lost={};for(const [key,n]of Object.entries(state.items))if(ITEMS[key]&&!['medkit','vodka','energy'].includes(key)&&n>0){const count=Math.ceil(n*.30);state.items[key]-=count;lost[key]=count;}
  return lost;
 }
 function canComponent(key){const r=recipes[key];return !!r&&state.mode==='base'&&modalNpc===2&&state.money>=servicePrice(r.money)&&(state.items[key]||0)<capacity()&&Object.entries(r.materials).every(([k,n])=>state.items[k]>=n);}
 function craft(key){
  if(!canComponent(key))return false;const r=recipes[key];state.money-=servicePrice(r.money);for(const [k,n]of Object.entries(r.materials))state.items[k]-=n;
  addItem(key,1);AudioFX.play('craft');save();render();openTech('equipment');toast(ITEMS[key].name+' изготовлено.');return true;
 }
 function componentsHTML(){return '<h3 class="recipe-heading">Изготовить компоненты</h3><p>Собираются из найденных вещей. Успех 100%.</p>'+Object.entries(recipes).map(([k,r])=>'<div class="tech-upgrade"><b>'+itemIcon(k)+' '+ITEMS[k].name+' ×1</b><p>'+servicePrice(r.money)+' ₽ · '+Object.entries(r.materials).map(([key,n])=>ITEMS[key].name+' ×'+n).join(' + ')+'</p><button class="secondary" id="component-'+k+'" '+(state.money<servicePrice(r.money)||(state.items[k]||0)>=capacity()||Object.entries(r.materials).some(([key,n])=>state.items[key]<n)?'disabled':'')+'>Изготовить</button></div>').join('');}
 const legacyOffer=techOffer;techOffer=function(key){const n=techLevel(key),o=legacyOffer(key);return {...o,money:servicePrice((key==='container'?900:450)+n*300+n*n*60),scrap:6+n*3,circuit:2+Math.floor(n/2)};};
 for(const table of [GEAR_RECIPES,ADVANCED_RECIPES])for(const r of Object.values(table)){r.money*=3;for(const key of Object.keys(r.materials))r.materials[key]*=2;}
 window.Economy51={init,stats,apply,roll,eligible,loss,recipes,craft,componentsHTML,
  persistentFight:e=>!!e&&!e.resolved&&['monster','human'].includes(e.type)&&!(e.boss&&e.balance51?.location===3),
  bindComponents(){for(const k of Object.keys(recipes))bind('component-'+k,()=>craft(k));},
  minion(def,e){if(!e?.balance51)return def;const s=stats(def.maxHp,def.attack,true,e.balance51.location,e.balance51.level);return {...def,maxHp:s.maxHp,attack:s.attack};}};
})();
