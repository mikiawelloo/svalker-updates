'use strict';
const NEW_ENEMIES={
 ratMutant:{name:'Крыса-мутант',group:'monster',hp:25,attack:5,accuracy:.78,xp:10},
 bum:{name:'Бомжара',group:'human',hp:40,attack:7,accuracy:.55,xp:14}
};
const ENEMY_ITEMS={ratTail:{name:'Хвост крысы',price:55},ratRear:{name:'Крысиная жопа',price:700},junkWatch:{name:'Потёртые часы',price:2500},junkRing:{name:'Декоративное кольцо',price:5000},junkChain:{name:'Тяжёлая цепочка',price:9000}};
const JEWELRY_KEYS=['junkWatch','junkRing','junkChain'];
const ENEMY_ART_KEYS=['ratMutant','ratMutant-down','bum','bum-down',...Object.keys(ENEMY_ITEMS)];
for(const key of ENEMY_ART_KEYS){const img=new Image();img.src='assets/enemies-v24/'+key+'.webp';WORLD_ART['enemy-'+key]=img;}
function isCombatEncounter(e=event){return !!e&&['monster','human'].includes(e.type);}
function isMonsterEnemy(e=event){return isCombatEncounter(e)&&e.type!=='human'&&!['bum','raider'].includes(e.enemy);}
function isNewEnemy(e=event){return !!e&&isCombatEncounter(e)&&Object.hasOwn(NEW_ENEMIES,e.enemy);}
function enemyGroup(e=event){return isMonsterEnemy(e)?'Монстр':'Человек';}
function rollEnemyKind(){const regional=window.Progression72?.rollEnemy();if(regional)return regional;const r=Math.random();return r<.30?'ratMutant':r<.45?'bum':null;}
function initEnemyState(){state.humanKills=finiteCount(state.humanKills);}
function prepareNewEnemy(){
 if(!isNewEnemy())return;const def=NEW_ENEMIES[event.enemy];
 event.type=def.group==='human'?'human':'monster';event.category=def.group;event.hp=def.hp;event.maxHp=def.hp;event.attack=def.attack;event.persistFight=true;
 if(def.p72){AudioFX.play('dog');log(def.name+' · обитатель '+LOCATIONS[state.location].name+'.');return;}
 AudioFX.play(event.enemy==='ratMutant'?'ratVoice':'bumVoice');log(event.enemy==='ratMutant'?'У дороги шевельнулась крупная крыса-мутант. Писк перешёл в рычание.':'Из-за развалин вышел Бомжара. Он качается и что-то невнятно бормочет.');
}
function rollRatLoot(){
 const found={};if(Math.random()<.45+(restActive()?.05:0))found.ratTail=1;
 if(Math.random()<.02)found.ratRear=1;return found;
}
function rollBumLoot(){
 const found={};if(Math.random()<.40)found.scrap=1+Math.floor(Math.random()*3);
 if(Math.random()<.22)found.circuit=1;if(Math.random()<.35)found.cloth=1+Math.floor(Math.random()*2);
 // One rare material or ordinary artifact. The exclusive jewelry pool is separate.
 const rare=Math.random();if(rare<.005)found.tarpaulin=1;else if(rare<.010)found.radioParts=1;else if(rare<.015)found.weaponParts=1;else if(rare<.030)found.artifact=1;
 const jewelry=Math.random();if(jewelry<.003)found.junkWatch=1;else if(jewelry<.0045)found.junkRing=1;else if(jewelry<.005)found.junkChain=1;
 return found;
}
function winNewEnemy(){
 if(window.Progression72?.winMonster())return true;
 if(!isNewEnemy())return false;const human=!isMonsterEnemy(),def=NEW_ENEMIES[event.enemy],found=human?rollBumLoot():rollRatLoot(),loot={};let overflow=0;
 for(const [key,n]of Object.entries(found)){const got=addItem(key,n);if(got)loot[key]=got;overflow+=n-got;}
 if(human)state.humanKills++;else{state.kills[state.location]++;state.rep++;}
 addXP(def.xp);AudioFX.play(human?'bumDown':'ratDown');if(totalLoot(loot))AudioFX.play('loot');
 let text=human?'Человеческий противник повержен. +14 опыта. В зачистку и задания на монстров не засчитывается.':'Крыса-мутант побеждена. +10 опыта · +1 репутация.';
 if(!totalLoot(loot))text+=' Добычи не осталось.';if(overflow)text+=' Не всё поместилось в рюкзак.';
 if(loot.artifact&&!['container','stalkerPack','packMk2'].includes(state.equipment.back))text+=' Найденный артефакт излучает радиацию.';
 resolve(human?'Бомжара повержен':'Крыса-мутант побеждена',text,loot);log(text);
 const special=JEWELRY_KEYS.find(k=>loot[k]);if(special){AudioFX.play('mini-success');toast('Особая добыча: '+ITEMS[special].name+' · '+salePrice(ITEMS[special].price)+' ₽ у скупщика!');}
 return true;
}
function newEnemyItemDetails(key){return key==='ratTail'?'Трофей крысы · 55 ₽':key==='ratRear'?'Редкий трофей крысы · 700 ₽':JEWELRY_KEYS.includes(key)?'Особая добыча Бомжары · '+ITEMS[key].price+' ₽':'';}
function drawNewEnemy(t){
 if(window.Progression72?.drawMonster(t))return true;
 if(!isNewEnemy())return false;const dead=event.defeated,key='enemy-'+event.enemy+(dead?'-down':'');if(!artReady(key))return true;
 const img=WORLD_ART[key],human=event.enemy==='bum',maxW=human?dead?650:440:dead?600:560,maxH=human?dead?280:520:dead?240:300;
 const scale=Math.min(maxW/img.naturalWidth,maxH/img.naturalHeight),w=img.naturalWidth*scale,h=img.naturalHeight*scale;
 const arrival=dead?1:.8+Math.min(1,Math.max(0,(t-event.created)/750))*.2,lunge=dead?0:Math.max(0,1-(t-(event.attackAt??-10000))/420);
 ctx.save();ctx.translate(450,dead?710:700+Math.sin(t*(human?.0028:.008))*(human?2:3)+lunge*(human?12:24));ctx.scale(arrival*(1+lunge*.08),arrival*(1+lunge*.08));
 if(human&&!dead)ctx.rotate(Math.sin(t*.0018)*.025);ellipse(ctx,0,-4,dead?230:human?85:180,18,'#050a0c77');if(!dead&&t-event.flash<150)ctx.filter='brightness(1.5)';ctx.drawImage(img,-w/2,-h,w,h);ctx.restore();return true;
}
