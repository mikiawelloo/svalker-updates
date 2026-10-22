'use strict';
// Alfa 0.1 browser patch: local generated artwork and turn-based encounters.
const WORLD_ART=Object.fromEntries(['base','road','crate','dog','gun'].map(key=>{
 const image=new Image();image.src=key==='gun'?'assets/gun-v49.png':'assets/'+key+'-v2.png';return[key,image];
}));
for(const key of ['crate-parts','signpost']){const image=new Image();image.src='assets/'+key+'-v3.png';WORLD_ART[key]=image;}
for(const key of ['dog-down','artifact']){const image=new Image();image.src='assets/'+key+'-v5.png';WORLD_ART[key]=image;}
const reloadHand50=new Image();reloadHand50.src='assets/reload-hand-v50.png';WORLD_ART.reloadHand50=reloadHand50;
const reloadGun50=new Image();reloadGun50.src='assets/gun-reload-v50.png';WORLD_ART.reloadGun50=reloadGun50;
const TECH_OPTIONS={
 damage:{name:'Урон',max:10,description:n=>'Урон выстрела: '+(5+n*2)+' → '+(7+n*2)},
 accuracy:{name:'Точность',max:10,description:n=>n>=8?'Точность достигла предела 95%. Модификация нужна для перехода на снаряжение II.':'Базовая точность: '+(75+n*2.5)+'% → '+Math.min(95,77.5+n*2.5)+'%'},
 reliability:{name:'Защита от клина',max:10,description:n=>'Шанс клина: '+Math.max(2,12-n)+'% → '+Math.max(2,11-n)+'%'},
 pack:{name:'Улучшить рюкзак',max:10,description:n=>'Вместимость: '+(20+n*10)+' → '+(30+n*10)+' шт. каждого вида'},
 container:{name:'Защитный контейнер',max:1,description:n=>'Изготовить контейнер · 5 шт. каждого вида · блокирует радиацию артефактов'},
 armor:{name:'Усилить куртку',max:10,description:n=>'Защита куртки: '+(2+n)+' → '+(3+n)},
 boots:{name:'Укрепить ботинки',max:10,description:n=>'Расход выносливости: −'+(n*2)+'% → −'+((n+1)*2)+'%'},
 mask:{name:'Фильтр противогаза',max:10,description:n=>'Защита от аномалий: '+(60+n*2)+'% → '+(62+n*2)+'%'},
 lamp:{name:'Усилить фонарик',max:10,description:n=>'Шанс лута ночью с фонарём: +'+n+'% → +'+(n+1)+'%'}
};
let techTab='weapon';
function techLevel(key){return key==='container'?(state.ownedGear.some(k=>['container','stalkerPack','packMk2'].includes(k))?1:0):state.upgrades[key];}
function techOffer(key){const n=techLevel(key);return{money:servicePrice((key==='container'?250:150)+n*125),scrap:3+n*2,circuit:1+Math.floor(n/2),cloth:key==='armor'?5+n*2:0,chance:techChance(Math.max(.45,.8-n*.05))};}
function ownsModificationGear(key){return key==='mask'?state.ownedGear.some(k=>['gasmask','maskMk2'].includes(k)):key==='lamp'?state.ownedGear.some(k=>['headlamp','lampMk2'].includes(k)):true;}
function affordOffer(offer){return state.money>=offer.money&&state.items.scrap>=offer.scrap&&state.items.circuit>=offer.circuit&&(state.items.cloth||0)>=(offer.cloth||0);}
function openTech(category=techTab){
 if(state.mode!=='base')return;
 techTab=category==='equipment'?'equipment':'weapon';if(state.location>0&&techTab==='equipment'&&window.Gear78)return openWorkshop72();
 const keys=(techTab==='weapon'?['accuracy','damage','reliability']:['pack','container','armor','boots','mask','lamp']).filter(k=>state.location===0||k!=='container');
 openModal('<span class="eyebrow">МАСТЕРСКАЯ</span><h2 id="modalTitle">Техник</h2><div class="tech-tabs"><button id="tech-weapon" class="'+(techTab==='weapon'?'active':'')+'">'+uiIcon('weapon')+' Оружие</button><button id="tech-equipment" class="'+(techTab==='equipment'?'active':'')+'">'+uiIcon('shield')+' Экипировка</button></div><p>Оплата и материалы расходуются за попытку. Неудача сохраняет текущий уровень.</p><div class="tech-balance">'+state.money+' ₽ · '+state.items.scrap+' металла · '+state.items.circuit+' электроники · '+state.items.cloth+' ткани</div>'+keys.map(key=>{
  const option=TECH_OPTIONS[key],n=techLevel(key),offer=techOffer(key),maxed=n>=option.max;
  return '<div class="tech-upgrade"><div><b class="tech-name">'+itemIcon(techIcon(key))+' '+option.name+'</b><span>'+(key==='container'?(maxed?'СОБРАН':'НЕ СОБРАН'):'Ур. '+n+' / '+option.max)+'</span></div><p>'+(!maxed?option.description(n):key==='container'?'Контейнер готов. Полностью блокирует излучение артефактов.':'Максимальный уровень достигнут')+'</p>'+(!ownsModificationGear(key)?'<small>Сначала собери соответствующий предмет снаряжения.</small>':key==='container'?'<small>Надень вместо рюкзака. Вместимость: 5 предметов каждого вида.</small>':'')+(!maxed?'<p class="upgrade-cost">'+offer.money+' ₽ + '+offer.scrap+' металла + '+offer.circuit+' электроники'+(offer.cloth?' + '+offer.cloth+' ткани':'')+'</p><span class="upgrade-odds">Шанс успеха '+Math.round(offer.chance*100)+'%</span><button class="secondary" id="improve-'+key+'" '+(!affordOffer(offer)||!ownsModificationGear(key)?'disabled':'')+'>'+(key==='container'?'Попытаться собрать':'Попытаться улучшить')+'</button>':'')+'</div>';
 }).join('')+rareTechHTML()+(techTab==='equipment'?(window.Economy51?.componentsHTML()||'')+gearRecipesHTML()+advancedRecipesHTML():'')+'<div class="tech-upgrade"><b class="tech-name">'+itemIcon('medkit')+' Самодельная аптечка</b><p>'+servicePrice(200)+' ₽ + 5 ткани + 2 электроники · шанс '+Math.round(techChance(.85)*100)+'%</p><small>+40 здоровья и остановка кровотечения</small><button class="secondary" id="craft" '+(state.money<servicePrice(200)||state.items.cloth<5||state.items.circuit<2||state.items.medkit>=capacity()?'disabled':'')+'>Собрать аптечку</button></div>');
 if(window.Progression72){$('modalBody').innerHTML+='<button class="primary" id="p72-workshop">Местные модификации · пояс</button>';bind('p72-workshop',()=>window.Progression72.openWorkshop());}
 modalNpc=2;window.Hubs62?.decorate(2);modalReturn=openPeople;bind('rare-key',craftRescueKey);bind('tech-weapon',()=>openTech('weapon'));bind('tech-equipment',()=>openTech('equipment'));
 for(const key of keys)bind('improve-'+key,()=>attemptUpgrade(key));
 bind('craft',craftMedkit);if(techTab==='equipment')window.Economy51?.bindComponents();if(techTab==='equipment')for(const key of Object.keys(GEAR_RECIPES))bind('craft-'+key,()=>craftGear(key));if(techTab==='equipment')for(const key of Object.keys(ADVANCED_RECIPES))bind('advanced-'+key,()=>craftAdvanced(key));
}
function attemptUpgrade(key){if(state.location!==0&&['container','pack','armor','boots','mask','lamp'].includes(key))return false;
 if(state.mode!=='base'||modalNpc!==2||!Object.hasOwn(TECH_OPTIONS,key))return false;
 const offer=techOffer(key);if(techLevel(key)>=TECH_OPTIONS[key].max||!affordOffer(offer)||!ownsModificationGear(key))return false;
 state.money-=offer.money;state.items.scrap-=offer.scrap;state.items.circuit-=offer.circuit;state.items.cloth-=offer.cloth||0;
 const success=Math.random()<offer.chance;
 if(success){if(key==='container'&&!state.ownedGear.includes('container'))state.ownedGear.push('container');else state.upgrades[key]++;state.weapon=1+state.upgrades.damage;}
 AudioFX.play(success?'craft':'upgradeFail');save();render();openTech();
 toast(success?(key==='container'&&state.upgrades.container===0?'Контейнер собран. Надень его в слоте рюкзака.':'Улучшение успешно: '+TECH_OPTIONS[key].name):'Неудача. Деньги и материалы потрачены, уровень сохранён.');
 return success;
}
function craftMedkit(){
 if(state.mode!=='base'||modalNpc!==2||state.money<servicePrice(200)||state.items.cloth<5||state.items.circuit<2||state.items.medkit>=capacity())return;
 state.money-=servicePrice(200);state.items.cloth-=5;state.items.circuit-=2;const success=Math.random()<techChance(.85);
 if(success)addItem('medkit',1);AudioFX.play(success?'craft':'upgradeFail');save();render();openTech();toast(success?'Аптечка готова.':'Сборка не удалась. Материалы и оплата потрачены.');
}
function setBackEquipment(key){
 if(!canEquipBack(key)){toast('Сначала сократи запас до '+capacity(key)+' предметов каждого вида. Вещи сохранены.');return false;}
 state.equipment.back=key;return true;
}
function discardItem(key){
 if(!Object.hasOwn(ITEMS,key)||state.items[key]<=0)return;
 state.items[key]--;AudioFX.play('close');save();render();toast(ITEMS[key].name+' оставлен в безопасной зоне.');
}
function artifactDetails(){return ['container','stalkerPack','packMk2','pack72'].includes(state.equipment.back)?'Артефакт защищён контейнером':'На вылазке: +0,5 радиации/сек. за каждый артефакт';}
function openItemDetails(key){
 const returnToPlayer=playerModalVisible||modalReturn===openPlayer;
 if(!safeZone()||!ITEMS[key]||state.items[key]<=0)return;
 openModal('<span class="eyebrow">ИНВЕНТАРЬ</span><h2 id="modalTitle">'+ITEMS[key].name+' ×'+state.items[key]+'</h2><p>'+ (key==='artifactX'?sparkDetails():key==='artifact'?artifactDetails()+'<br>Чтобы защититься, надень контейнер или сталкерский ранец.':(window.Progression72?.itemDetails(key)||'Находку можно продать скупщику или заинтересованным одиночкам.'))+'</p>'+(window.ItemInfo79?.html(key)||'')+(['medkit','vodka','energy'].includes(key)?'<button class="primary" id="item79-use">Использовать</button>':'')+'<button class="secondary" id="discard-item">Оставить одну штуку</button>');
 bind('item79-use',()=>{({medkit:useMedkit,vodka:useVodka,energy:useEnergy}[key])?.();if(state.items[key]>0){openItemDetails(key);if(returnToPlayer)modalReturn=openPlayer;}else if(returnToPlayer)openPlayer();else closeModal();});if(returnToPlayer)modalReturn=openPlayer;bind('discard-item',()=>{discardItem(key);if(state.items[key]>0)openItemDetails(key);else closeModal();});
}
function startCombat(){
 if(!isCombatEncounter()||event.resolved||event.combat||!weaponDamage()||document.hidden||!$('modalBackdrop').hidden||exhaustionOpen)return false;
 if(!rounds48()){event.combat={phase:'reload',shots:0,nextAt:performance.now()};return beginReload48('combat',event.combat);}
 if(!spend(4,startCombat))return false;
 event.battleStarted=true;event.combat={phase:'player',shots:0,nextAt:performance.now()+80};event.combatLog=[];event.weaponUntil=performance.now()+3000;renderAction();save();return true;
}
function combatLine(message){event.combatLog=(event.combatLog||[]).concat(message).slice(-3);}
function winCombat(){
 if(!isCombatEncounter()||event.resolved||event.hp>0)return false;
 const wasCleared=cleared(state.location);event.combat=null;event.defeated=true;event.deathAt=performance.now();
 if(isMonsterEnemy())recordQuestKill();
 if(isNewEnemy()){winNewEnemy();}
 else if(event.rareCombat){winRareFight();}
 else if(event.enemy==='chupacabra'){winChupacabra();}
 else if(event.boss){state.bossDefeated[state.location]=true;state.rep+=5;addXP(35);resolve('Босс побеждён','+35 опыта · +5 репутации. '+(state.location<LOCATIONS.length-1?'Следующая территория с '+LOCATIONS[state.location+1].level+' уровня.':'Все территории пройдены!'));log('Побеждён '+LOCATIONS[state.location].boss.name+'.');}
 else{state.kills[state.location]++;state.rep++;addXP(12);const loot=collectDogLoot();resolve('Тропа свободна','Моб уничтожен. +12 опыта · +1 репутация.'+(state.location===0?' Зачистка: '+Math.min(10,state.kills[0])+'/10.':'')+(totalLoot(loot)?' Трофеи собраны.':' Трофеев не осталось.'),loot);log('Угроза устранена. Продолжаем маршрут.');}
 if(!wasCleared&&cleared(state.location))toast(LOCATIONS[state.location].name+' пройдена!');save();
}
function updateCombat(t){
 if(!event?.combat||event.resolved||exhaustionOpen||document.hidden)return;
 const turn=event.combat;
 if(turn.phase==='reload'){if(stepReload48(t)){turn.phase='monster';turn.nextAt=t+650;combatLine('Магазин заменён: пропускаем атаку');save();renderAction();updateVitals();}return;}
 if(t<turn.nextAt||!$('modalBackdrop').hidden)return;
 if(turn.phase==='player'){
  if(!rounds48()){turn.phase='monster';turn.nextAt=t+650;save();renderAction();return;}
  turn.shots++;event.weaponUntil=t+1600;
  if(Math.random()<weaponJamChance()){
   event.jamAt=t;spawnCombatPopup('Клин','jam','player');combatLine('Выстрел '+turn.shots+': клин — урон 0');AudioFX.play('jam');
  }else{
   consumeRound48();event.shotAt=t;AudioFX.play('shot');
   if(Math.random()<weaponAccuracy()){const beforeHP=event.hp;event.hp=Math.max(0,event.hp-weaponDamage());spawnCombatPopup('−'+Math.ceil(beforeHP-event.hp),'hit');event.flash=t;combatLine('Выстрел '+turn.shots+': попадание −'+weaponDamage());}
   else{spawnCombatPopup('Промах','miss');combatLine('Выстрел '+turn.shots+': промах');}
  }
  if(event.hp<=0){winCombat();return;}
  if(turn.shots>=2||!rounds48()){turn.phase='monster';turn.nextAt=t+650;}else turn.nextAt=t+430;
 }else if(turn.phase==='monster'){
  event.attackAt=t;AudioFX.play(event.enemy==='bum'?'bumAttack':event.enemy==='ratMutant'?'ratAttack':event.enemy==='raider'?'shot':event.enemy==='chupacabra'?'chupacabra':event.boss?(state.location===3?'echoAttack':'boss'):'dogAttack');
  if(Math.random()<enemyAccuracy()){
   const damage=Math.max(1,enemyAttack()-armor()),beforeHP=state.hp;state.hp=Math.max(0,state.hp-damage);spawnCombatPopup('−'+Math.ceil(beforeHP-state.hp),'hurt','player');event.playerHitAt=t;if(!(event.boss&&state.location===3))AudioFX.play('hit');
   let effects=[];if(event.enemy==='chupacabra')effects=applyChupacabraHit();else if(Math.random()<(event.boss ? .3 : .25)){state.bleeding=30;effects.push('кровотечение');}
   combatLine('Атака: −'+damage+' здоровья'+(effects.length?' · '+effects.join(' · '):''));
   if(state.hp<=0){defeatPlayer(isMonsterEnemy()?'monster':'human');return;}
  }else{spawnCombatPopup('Промах','miss','player');combatLine(isMonsterEnemy()?'Монстр промахнулся':'Противник промахнулся');}
  if(event.enemy==='raider'&&(turn.burstShots=(turn.burstShots||0)+1)<5){turn.nextAt=t+140;}else{turn.phase='recover';turn.burstShots=0;turn.nextAt=t+550;if(event.enemy==='raider')AudioFX.play('reload');}
 }else event.combat=null;
 save();renderAction();updateVitals();
}
function renderCombat(){
 if(!isCombatEncounter()||event.resolved)return;
 const busy=!!event.combat,title=enemyName();
 const hint=combatHint48(busy);
 setSceneInteraction(hint,combatHUD49(title,event.hp,event.maxHp));
 renderEscapeButton(busy);

}
function activeEffectDetails(){
 const effects=window.Progression72?.effects()||[],base=safeZone(),rate=radiationRate(),drunk=alcoholDoses();
 if(state.mode==='expedition'&&state.events47?.rainWear)effects.push({key:'rainWear',name:'Разъеденная защита',icon:uiIcon('shield'),className:'blood active-effect',description:'Кислотный дождь повредил покрытие: защита −2. На базе снаряжение обслужат, и защита восстановится.'});
 if(state.mode==='expedition'&&event47TravelCost()===4)effects.push({key:'guideTrail',name:'Безопасная тропа',icon:uiIcon('walk'),className:'good-rest',description:'Проводник показал обход. Следующие '+state.events47.guideSteps+' перехода стоят вдвое меньше выносливости. Тропа действует до возвращения на базу.'});
 if(drunk)effects.push({key:'alcohol',name:alcoholName(),icon:uiIcon('alcohol'+Math.min(5,drunk)),className:'blood active-effect',description:alcoholName()+' Точность −'+Math.round(alcoholPenalty()*100)+' п.п. Одна доза выветривается за 5 минут.'});
 if(state.radiation>0||rate>0)effects.push({key:'radiation',name:'Радиация',icon:uiIcon('radiation'),className:'radiation '+(rate>0?'active-effect':''),description:'Уровень радиации: '+Math.floor(state.radiation)+' / 100. '+(base?'В лагере радиация снижается на 2 в секунду.':rate>0?'Получаешь '+rate.toFixed(1)+' радиации в секунду.':'Сейчас радиация не растёт.')+' Водка снимает 40 радиации. Контейнер защищает от излучения находок.'});
 if(state.bleeding>0)effects.push({key:'bleeding',name:'Кровотечение',icon:uiIcon('bleeding'),className:'blood '+(base?'':'active-effect'),description:'Осталось '+Math.ceil(state.bleeding)+' сек. '+(base?'В безопасной зоне кровотечение не наносит урон.':'Теряешь 1 здоровье в секунду.')+' Аптечка остановит кровотечение.'});
 if(hasSparkX())effects.push({key:'spark',name:'Искра Х',icon:itemIcon('artifactX'),className:'spark-x',description:sparkDetails()});
 if(sickSeconds())effects.push({key:'illness',name:'Срачка',icon:uiIcon('illness'),className:'blood active-effect',description:'Осталось '+sickSeconds()+' сек. Выносливость потеряна. Пока не станет лучше, выйти в дорогу нельзя.'});
 if(restActive())effects.push({key:'rest',name:'Хороший отдых',icon:uiIcon('rest'),className:'good-rest',description:'Расход выносливости −25%, восстановление здоровья +50%, точность +10 п.п., шанс обычной добычи +5 п.п. '+(base?'В безопасной зоне эффект действует постоянно. После выхода сохраняется 60 секунд.':'Осталось '+restSeconds()+' сек.')});
 return effects;
}
function openEffectDetails(key){
 if(document.hidden||exhaustionOpen)return false;const effect=activeEffectDetails().find(e=>e.key===key);if(!effect)return false;
 openModal('<div class="effect-detail-icon '+effect.className+'">'+effect.icon+'</div><h2 id="modalTitle">'+effect.name+'</h2><p>'+effect.description+'</p>');return true;
}
function updateEffectIcons(){
 const el=$('statusEffects');if(!el)return;const effects=activeEffectDetails();
 $('gameRoot').classList.toggle('has-rest-buff',restActive());$('gameRoot').classList.toggle('has-effects',effects.length>0);
 const markup=effects.map(e=>'<button class="effect-chip '+e.className+'" id="effect-'+e.key+'" aria-label="'+e.name+': открыть описание">'+e.icon+'</button>').join('');
 if(updateEffectIcons.last!==markup){el.innerHTML=markup;updateEffectIcons.last=markup;for(const e of effects)bind('effect-'+e.key,()=>openEffectDetails(e.key));}
}

function aimStick(e){
 const r=canvas.getBoundingClientRect(),p=canvasPoint(e);
 const scale=Math.max(r.width/900,r.height/800);
 stick.x=Math.max(30,Math.min(870,p.x));stick.y=Math.max(170,Math.min(740,p.y-56/scale));
}
function artReady(key){const image=WORLD_ART[key];return !!image&&image.complete&&image.naturalWidth>0;}
function drawPatchedBackground(t,walking){
 const original=walking?'road':'base',key=window.Hubs62?.backgroundKey(original)||original;if(!artReady(key))return false;
 const image=WORLD_ART[key],progress=walking?Math.max(0,Math.min(1,((event?event.created:t)-walkStarted)/4200)):0,z=1.025+progress*.095;
 const scale=Math.max(900/image.naturalWidth,800/image.naturalHeight)*z,w=image.naturalWidth*scale,h=image.naturalHeight*scale;
 ctx.drawImage(image,(900-w)/2,(800-h)/2,w,h);
 // Restrained moving fog adds depth without covering the road or encounters.
 const fog=ctx.createLinearGradient(0,170,0,720);fog.addColorStop(0,'#c6cacc00');fog.addColorStop(.5,'#c6cacc0d');fog.addColorStop(1,'#c6cacc00');ctx.fillStyle=fog;ctx.fillRect(0,170,900,550);
 return true;
}
function drawPatchedCrate(t){
 if(!artReady('crate'))return false;
 const arrival=Math.min(1,(t-event.created)/650),p=crateLidProgress(t);
 ctx.save();ctx.translate(450,555);ctx.scale(.82+arrival*.18,.82+arrival*.18);ellipse(ctx,0,120,207,27,'#080c0f70');
 if(artReady('crate-parts')){
  const image=WORLD_ART['crate-parts'],sx=image.naturalWidth/1536,sy=image.naturalHeight/1024;
  ctx.drawImage(image,0,200*sy,768*sx,640*sy,-250,-145,500,360);
  ctx.save();ctx.translate(0,-130);ctx.scale(1,.48*(1-p)-1.05*p);
  ctx.drawImage(image,810*sx,265*sy,700*sx,444*sy,-240,0,480,306);ctx.restore();
 }else ctx.drawImage(WORLD_ART.crate,-270,-190,540,360);
 if(event.searching){ctx.strokeStyle='#e1d6b7';ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,-30,36,t*.005,t*.005+Math.PI*1.55);ctx.stroke();}
 if(event.resolved){ctx.fillStyle='#161c20b0';ctx.fillRect(-172,-76,312,80);ctx.font='bold 20px system-ui';ctx.textAlign='center';ctx.fillStyle='#e3e0d1';ctx.fillText(event.hasLoot?'ОБЫСКАН':'ПУСТО',0,-28);}
 ctx.restore();return true;
}
function drawPatchedDog(t){
 if(event.defeated&&artReady('dog-down')){
  ctx.save();ctx.translate(450,480);ellipse(ctx,0,208,250,22,'#050a0c77');
  ctx.drawImage(WORLD_ART['dog-down'],-300,-100,600,400);ctx.restore();return true;
 }
 if(!artReady('dog'))return false;
 if(event.defeated){ctx.save();ctx.translate(450,620);ctx.rotate(-Math.PI/2);ctx.scale(.7,.7);ctx.drawImage(WORLD_ART.dog,-290,-210,580,387);ctx.restore();return true;}
 const arrival=Math.min(1,(t-event.created)/650),lunge=Math.max(0,1-(t-(event.attackAt??-10000))/420);
 ctx.save();ctx.translate(450,535+Math.sin(t*.003)*2+lunge*35);ctx.scale((.76+arrival*.24)*(1+lunge*.22),(.76+arrival*.24)*(1+lunge*.22));
 ellipse(ctx,0,147,204,26,'#050a0c77');if(event.resolved)ctx.globalAlpha=.4;
 ctx.drawImage(WORLD_ART.dog,-290,-210,580,387);
 if(t-event.flash<120){ctx.globalCompositeOperation='screen';ellipse(ctx,-35,-15,20,16,'#b8aa8555');}
 ctx.restore();return true;
}
function drawWeapon(t){
 if(!isCombatEncounter()||event.resolved||event.defeated||!weaponDamage()||!artReady('gun'))return;
 const shot=Math.max(0,1-(t-(event.shotAt??-10000))/210),jam=Math.max(0,1-(t-(event.jamAt??-10000))/160);
 const pose=weaponPose50(t);
 ctx.save();ctx.translate(pose.x,pose.y);ctx.rotate(pose.angle);
 if(pose.handAlpha>0&&artReady('reloadHand50')){
  // The magazine enters behind the grip; its top is occluded as it seats.
  ctx.save();ctx.globalAlpha=pose.handAlpha;
  ctx.translate(pose.handX+204,pose.handY+27);ctx.rotate(-.33);
  ctx.drawImage(WORLD_ART.reloadHand50,-204,-27,300,300);ctx.restore();
 }
 if(pose.reloadMix>0&&artReady('reloadGun50')){
  ctx.save();ctx.globalAlpha=1-pose.reloadMix;ctx.drawImage(WORLD_ART.gun,0,0,pose.w,pose.h);
  ctx.globalAlpha=pose.reloadMix;ctx.drawImage(WORLD_ART.reloadGun50,0,0,pose.w,pose.h);ctx.restore();
 }else ctx.drawImage(WORLD_ART.gun,0,0,pose.w,pose.h);
 if(shot>.52&&!event.reload48){ctx.globalCompositeOperation='screen';const x=266,y=57;path(ctx,[[x-10,y],[x-49,y-26],[x-15,y-12],[x-11,y-52],[x+4,y-16],[x+31,y-22],[x+11,y],[x+19,y+24],[x-4,y+9]],'#ffe3a5');}
 ctx.restore();
 if(t-(event.playerHitAt??-10000)<180){ctx.fillStyle='#b536252b';ctx.fillRect(0,0,900,800);}
}

// Equipment is crafted on base and equipped through the existing character slots.
const GEAR_RECIPES={
 stalkerPack:{money:800,materials:{scrap:6,circuit:3,cloth:4},gear:['pack','container'],chance:.85},
 gasmask:{money:600,materials:{scrap:3,circuit:1,cloth:4},gear:[],chance:.85},
 headlamp:{money:450,materials:{scrap:3,circuit:3,cloth:1},gear:[],chance:.85}
};
function techIcon(key){return {pack:['stalkerPack','packMk2'].includes(state.equipment.back)?'stalkerPack':'pack',container:'container',armor:'jacket',boots:'boots',mask:'gasmask',lamp:'headlamp'}[key]||'pistol';}
function canCraftGear(key){
 const recipe=Object.hasOwn(GEAR_RECIPES,key)?GEAR_RECIPES[key]:null;
 return state.location===0&&!!recipe&&!state.ownedGear.includes(key)&&state.money>=servicePrice(recipe.money)&&recipe.gear.every(g=>state.ownedGear.includes(g))&&Object.entries(recipe.materials).every(([k,n])=>state.items[k]>=n);
}
function gearRecipesHTML(){if(state.location!==0)return '';return '<h3 class="recipe-heading">Крафт снаряжения</h3>'+Object.entries(GEAR_RECIPES).map(([key,r])=>{
 const owned=state.ownedGear.includes(key);
 const ingredients=r.gear.map(g=>g==='pack'?'Сумка (походный рюкзак)':'Защитный контейнер').concat(Object.entries(r.materials).map(([k,n])=>ITEMS[k].name+' ×'+n));
 return '<div class="tech-upgrade"><b class="tech-name">'+itemIcon(key)+' '+GEAR[key].name+'</b><p>'+GEAR[key].desc+'</p>'+(owned?'<small>СОБРАН · надень через «Рюкзак»</small>':'<p class="upgrade-cost">'+servicePrice(r.money)+' ₽ · '+ingredients.join(' + ')+'</p><span class="upgrade-odds">Шанс успеха '+Math.round(techChance(r.chance)*100)+'%</span><small>Деньги и детали расходуются за попытку.'+(r.gear.length?' Сумка и контейнер объединяются только при успехе. Ранец надевается автоматически.':' Готовый предмет нужно надеть в меню персонажа.')+'</small><button class="secondary" id="craft-'+key+'" '+(!canCraftGear(key)?'disabled':'')+'>Попытаться собрать</button>')+'</div>';
 }).join('');}
function craftGear(key){
 if(state.mode!=='base'||modalNpc!==2||!canCraftGear(key))return false;
 const r=GEAR_RECIPES[key];state.money-=servicePrice(r.money);
 for(const [k,n] of Object.entries(r.materials))state.items[k]-=n;
 const success=Math.random()<techChance(r.chance);
 if(success){
  state.ownedGear=state.ownedGear.filter(g=>!r.gear.includes(g));state.ownedGear.push(key);
  if(key==='stalkerPack')state.equipment.back=key;
 }
 AudioFX.play(success?'craft':'upgradeFail');save();render();openTech('equipment');
 toast(success?GEAR[key].name+' готов'+(key==='stalkerPack'?' и надет.':'. Надень через «Рюкзак».'):'Сборка не удалась. Оплата и детали потрачены.'+(r.gear.length?' Сумка и контейнер сохранены.':''));
 return success;
}

const DAY_CYCLE={day:300,night:180};
function isNight(){return state.playTime>=DAY_CYCLE.day;}
function hasHeadlamp(){return ['headlamp','lampMk2'].includes(state.equipment.head)&&!event?.lampDisabled;}
function nightPenalty(){return state.mode==='expedition'&&isNight()&&!hasHeadlamp();}
function lootChance(){return Math.min(1,(nightPenalty() ? .42 : .72)+(restActive()?.05:0)+(dungeonActive()?.10:0)+(isNight()&&hasHeadlamp()?state.upgrades.lamp*.01+(state.equipment.head==='lampMk2'?.05+(window.Gear78?.level('lampMk2')||0)*.005:0):0));}
function artifactChance(){return nightPenalty() ? .35 : .65;}
function advanceDayClock(seconds){
 if(document.hidden||!Number.isFinite(seconds)||seconds<=0)return;
 const previousTime=state.playTime,wasNight=isNight();state.playTime=(state.playTime+seconds)%(DAY_CYCLE.day+DAY_CYCLE.night);
 if(wasNight!==isNight()){
  syncAudioScene();
  AudioFX.play(isNight()?'wolves':'dawn');
  toast(isNight()?(hasHeadlamp()?'Наступила ночь. Налобный фонарик освещает дорогу.':'Наступила ночь. Без фонаря труднее стрелять и искать добычу.'):'Рассвело. Дорога снова видна.');
  if(isCombatEncounter()&&!event.resolved)renderCombat();
 }else if(wasNight&&isNight()&&Math.floor((state.playTime-DAY_CYCLE.day)/60)>Math.floor((previousTime-DAY_CYCLE.day)/60)){AudioFX.play('wolves');}
}
function nightDarkness(){
 if(!isNight())return 0;
 const t=state.playTime-DAY_CYCLE.day;
 return Math.min(1,t/8,(DAY_CYCLE.night-t)/8);
}
function updateDayUI(){
 const el=$('dayPhase');if(!el)return;
 const night=isNight(),remaining=Math.ceil((night?480:300)-state.playTime),minutes=Math.floor(remaining/60),seconds=String(remaining%60).padStart(2,'0');
 const text=(night?'НОЧЬ':'ДЕНЬ')+' · '+minutes+':'+seconds;
 const cacheKey=text+'|'+state.mode;
 if(updateDayUI.last!==cacheKey){el.textContent=text;el.classList.toggle('night',night);el.title=nightPenalty()?'Без фонаря: точность −25 п.п.; шанс добычи 42%; артефакта 35%.':'5 минут дня сменяются 3 минутами ночи. Надетый фонарь сохраняет дневные шансы.';updateDayUI.last=cacheKey;}
}
function drawNightOverlay(){
 const darkness=nightDarkness();if(darkness<=0)return;
 ctx.save();
 if(hasHeadlamp()||state.mode==='camp'||event?.type==='camp'){
  const y=state.mode==='camp'||event?.type==='camp'?610:435;
  const light=ctx.createRadialGradient(450,y,45,450,y,330);
  light.addColorStop(0,'rgba(9,15,23,'+(darkness*.025)+')');light.addColorStop(.58,'rgba(9,15,23,'+(darkness*.12)+')');light.addColorStop(1,'rgba(9,15,23,'+(darkness*.83)+')');ctx.fillStyle=light;
 }else ctx.fillStyle='rgba(9,15,23,'+(darkness*.76)+')';
 ctx.fillRect(0,0,900,800);ctx.restore();
}
function crateLidProgress(t){
 if(!event||event.type!=='crate')return 0;
 const progress=event.searching?Math.max(0,Math.min(1,(t-event.searchStart)/700)):event.resolved?1:0;
 return progress*progress*(3-2*progress);
}
function drawPatchedFork(t){
 if(!artReady('signpost'))return;
 const image=WORLD_ART.signpost,arrival=Math.max(0,Math.min(1,(t-event.created)/650));
 ctx.save();ctx.translate(450,480);ctx.scale(.9+arrival*.1,.9+arrival*.1);
 ellipse(ctx,0,220,80,16,'#090e104a');ctx.drawImage(image,-235,-250,470,470);
 ctx.textAlign='center';ctx.fillStyle='#d1d0b8';ctx.font='bold 19px monospace';ctx.shadowColor='#101716';ctx.shadowBlur=3;
 ctx.fillText('ТАЙНИКИ',-26,-98);ctx.fillText('АНОМАЛИЯ',28,6);ctx.restore();
}

function setSceneInteraction(hint,hud=''){
 $('sceneHint').textContent='';$('sceneHint').hidden=true;
 const combat=!!hud&&isCombatEncounter()&&!event.resolved;
 $('sceneSection').classList.toggle('combat-scene49',combat);
 $('sceneHUD').classList.toggle('combat-hud49',hud.includes('enemy-health49'));
 $('combatAmmo49').hidden=!combat;$('combatAmmo49').innerHTML=combat?magazineHUD48():'';
 $('sceneHUD').innerHTML=hud;$('sceneHUD').hidden=!hud;$('sceneHUD').classList.toggle('anomaly-hud',state.mode==='expedition'&&event?.type==='anomaly');
 canvas.setAttribute('role',hint&&state.mode==='expedition'?'button':'img');
 canvas.setAttribute('aria-label',hint||'Игровая сцена');canvas.style.cursor=hint?'pointer':'default';
}
function escapeChance(){return event?.boss||event?.enemy==='chupacabra' ? .4 : .65;}
function renderEscapeButton(busy=false){
 const contested=isCombatEncounter()&&!event.resolved;
 buttons('<button class="secondary escape-button" id="escape" '+(busy?'disabled':'')+'>'+uiIcon('return')+' '+(contested?'Побег · '+Math.round(escapeChance()*100)+'% · −'+Math.min(staminaCost(10),state.energy):dungeonActive()?'Выйти из подвала':'Вернуться на базу')+'</button>');
 bind('escape',escapeExpedition);
}
function renderExpeditionAction(){
 if(travelMotion){setSceneInteraction('');canvas.setAttribute('aria-label',travelMotion.kind==='depart'?'Поворот камеры от базы к дороге':travelMotion.kind==='left'?'Поворачиваем налево':'Поворачиваем направо');renderEscapeButton(true);return;}
 if(!event){setSceneInteraction('Идём вперёд · участок '+round);renderEscapeButton();return;}
 if(event.type==='anomaly'&&event.resolved){
  const loot=event.loot||{},key=Object.keys(loot).find(k=>loot[k]>0);
  setSceneInteraction('',key?'<div class="artifact-result">'+itemIcon(key)+'</div>':event.hasArtifact?'<div class="artifact-result artifact-full" role="img" aria-label="Рюкзак заполнен" title="Рюкзак заполнен">'+uiIcon('backpack')+'</div>':'<p class="anomaly-empty">Пусто</p>');renderEscapeButton();return;
 }
 if(event.resolved&&isRareEvent()){renderRareResult();return;}
 if(event.resolved){setSceneInteraction(BUTTON_EVENTS.includes(event.type)?'':'Коснись сцены, чтобы идти дальше',(event.resultTitle?'<h3>'+event.resultTitle+'</h3>':'')+(event.resultText?'<p>'+event.resultText+'</p>':'')+(totalLoot(event.loot||{})?rewardHTML(event.loot):''));renderEscapeButton();if(BUTTON_EVENTS.includes(event.type)){buttons('<button class="primary" id="road-continue">'+nextTravelLabel()+'</button><button class="secondary camp-bag" id="escape">На базу</button>');bind('road-continue',()=>walk());bind('escape',escapeExpedition);}return;}
 if(renderRareAction()||renderRoadAction())return;
 if(isCombatEncounter()){renderCombat();return;}
 if(event.type==='crate'){
  setSceneInteraction(event.searching?'Обыскиваем…':'Коснись ящика, чтобы открыть');
 }else if(event.type==='anomaly'){
  setSceneInteraction(window.Progression72?.anomalyHint()||(event.scanning?'Поиск артефакта':'Исследовать аномалию'),event.scanning?artifactLootRingHTML(event.artifactKind||'artifact',event.progress):'');
 }else if(event.type==='fork'){
  setSceneInteraction('','');canvas.setAttribute('role','button');canvas.setAttribute('aria-label','Развилка: слева тайники, справа аномалия');canvas.style.cursor='pointer';
 }
 renderEscapeButton();
 if(event.type==='fork'){const panel=$('actionPanel');panel.innerHTML='<div class="action-row fork-directions"><button class="secondary" id="fork-left">← Налево</button><button class="secondary" id="fork-right">Направо →</button></div>'+panel.innerHTML;bind('fork-left',()=>chooseForkRoute('left'));bind('fork-right',()=>chooseForkRoute('right'));}
}
function artifactLootRingHTML(key,progress=0){
 const amount=Math.max(0,Math.min(1,Number(progress)||0));
 return '<div id="artifactLootProgress" class="artifact-progress" role="progressbar" aria-label="Поиск артефакта" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.round(amount*100)+'"><svg class="meter-ring" viewBox="0 0 100 100" aria-hidden="true"><defs><mask id="artifact-loot-dashes" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><circle cx="50" cy="50" r="42" fill="none" stroke="white" stroke-width="6" stroke-dasharray="5.27787566 2.96880506"/></mask></defs><g transform="rotate(-90 50 50)" mask="url(#artifact-loot-dashes)"><circle class="meter-track" cx="50" cy="50" r="42"/><circle class="meter-fill" id="catchFill" cx="50" cy="50" r="42" stroke-dasharray="263.89378290 263.89378290" style="stroke-dashoffset:'+((1-amount)*263.89378290)+'"/></g></svg><span class="artifact-progress-icon">'+itemIcon(key)+'</span></div>';
}
function updateArtifactLootRing(progress){const amount=Math.max(0,Math.min(1,Number(progress)||0));const fill=$('catchFill'),meter=$('artifactLootProgress');if(fill)fill.style.strokeDashoffset=String((1-amount)*263.89378290);if(meter)meter.setAttribute('aria-valuenow',Math.round(amount*100));}
function beginArtifactSearch(){
 if(!event||event.type!=='anomaly'||event.scanning||event.resolved)return false;
 event.artifactKind=event.hasArtifact?selectArtifactKind():'artifact';event.scanning=true;event.scanStart=performance.now();stick.active=true;AudioFX.play('search');renderAction();return true;
}
function activateScene(e=null){
 if(state.mode!=='expedition'||travelMotion||exhaustionOpen||document.hidden||!$('modalBackdrop').hidden||!event)return false;
 if(event.resolved){if(BUTTON_EVENTS.includes(event.type)||isRareEvent())return false;walk();return true;}
 if(isCombatEncounter()){if(event.combat||!weaponDamage())return false;return startCombat()!==false;}
 if(BUTTON_EVENTS.includes(event.type)||isRareEvent())return false;
 if(event.type==='crate'){if(event.searching)return false;searchCrate();return true;}
 if(event.type==='anomaly'){beginArtifactSearch();return true;}
 if(event.type==='fork'&&e&&Number.isFinite(e.clientX)){const r=canvas.getBoundingClientRect();return chooseForkRoute(e.clientX<r.left+r.width/2?'left':'right');}
 return false;
}
function handleScenePointer(e){
 if(window.Hubs62?.pointerDown(e))return;
 if(e.isPrimary===false||(typeof e.button==='number'&&e.button!==0))return;
 if(window.Storm56?.pointerDown(e))return;
 if(window.Loners53?.available()){AudioFX.unlock(sound);window.Loners53.pointerDown(e);return;}
 if(!activateScene(e))return;
 AudioFX.unlock(sound);
 if(event?.type==='anomaly'&&event.scanning&&!event.resolved){
  stickDown=true;dragPointer=e.pointerId;canvas.setPointerCapture(e.pointerId);aimStick(e);canvas.style.touchAction='none';
 }
 e.preventDefault();
}
function escapeExpedition(){
 if(window.Storm56?.locked()||window.Emission52?.locked())return false;
 if(state.routeEnd)return false;
 if(state.mode!=='expedition'||travelMotion||rareSheltered()||document.hidden||event?.combat||event?.type==='patrol'&&!event.resolved)return false;
 if(!isCombatEncounter()||event.resolved){returnToBase();return true;}
 if(exhaustionOpen){exhaustionOpen=false;exhaustionPending=null;closeModal();}
 state.energy=Math.max(0,state.energy-staminaCost(10));
 if(Math.random()<escapeChance()){returnToBase('Удалось сбежать. Добыча сохранена.');return true;}
 event.battleStarted=true;event.combat={phase:'monster',shots:2,nextAt:performance.now()+180};event.combatLog=event.combatLog||[];
 combatLine('Побег не удался — противник догнал');AudioFX.play('danger');save();renderAction();updateVitals();return false;
}

const GUIDE_FEE=10000;
let guideTarget=null,visitResultOpen=false;
function openGuide(target){
 if(state.mode!=='base'||target===state.location||!unlocked(target))return false;
 const l=LOCATIONS[target];
 if(!state.guideVisit||state.guideVisit.origin!==state.location||state.guideVisit.target!==target){
  state.guideVisit={origin:state.location,target,variant:Math.random()<.1};save();
 }
 const alternate=state.guideVisit.variant;
 const portrait=alternate?'guide-alt-v4.png':'guide-v3.png';
 const phrase=alternate?'Деньги — сразу. До '+l.name+' есть короткая дорожка. Иди за мной и не оглядывайся. Лишние вопросы у нас не любят.':'До '+l.name+' дойти можно. Но дорогу знаю только я. '+servicePrice(GUIDE_FEE).toLocaleString('ru-RU')+' рублей — и идёшь следом. Не отставай';
 openModal('<div class="guide-portrait"><img src="assets/'+portrait+'" alt="Проводник"></div><span class="eyebrow">ПЕРЕХОД ПО ЗОНЕ</span><h2 id="modalTitle">Проводник</h2><p class="guide-quote">«'+phrase+'».</p><div class="guide-offer"><span>'+LOCATIONS[state.location].name+' → '+l.name+'</span><b>'+servicePrice(GUIDE_FEE).toLocaleString('ru-RU')+' ₽</b><small>Твой баланс: '+state.money.toLocaleString('ru-RU')+' ₽ · оплата за этот переход</small></div>'+(state.money<servicePrice(GUIDE_FEE)?'<p>Не хватает '+(servicePrice(GUIDE_FEE)-state.money).toLocaleString('ru-RU')+' ₽. Вернись с добычей — я подожду.</p>':'')+'<button class="primary" id="guide-pay" '+(state.money<servicePrice(GUIDE_FEE)?'disabled':'')+'>Заплатить и перейти</button><button class="secondary guide-back" id="guide-cancel">Вернуться к карте</button>','open');
 guideTarget=target;bind('guide-pay',payGuide);bind('guide-cancel',()=>{guideTarget=null;openMap();});return true;
}
function payGuide(){
 const target=guideTarget,visit=state.guideVisit;
 if(state.mode!=='base'||target===null||target===state.location||!unlocked(target)||state.money<servicePrice(GUIDE_FEE)||!visit||visit.target!==target||visit.origin!==state.location)return false;
 const money=state.money,count=totalItems();guideTarget=null;state.guideVisit=null;state.money-=servicePrice(GUIDE_FEE);
 AudioFX.play('coin');closeModal();
 if(visit.variant){
  state.money=0;for(const key of Object.keys(state.items))state.items[key]=0;
  state.visitAftermath={money,count};save();render();log('Тебя завели в тупик и ограбили. Денег и припасов не осталось.');showVisitAftermath();
 }else{
  state.location=target;save();render();log('Проводник привёл на базу: '+LOCATIONS[target].name+'. Оплачено '+servicePrice(GUIDE_FEE).toLocaleString('ru-RU')+' ₽.');toast('Прибыли: '+LOCATIONS[target].name);
 }
 return true;
}
function showVisitAftermath(){
 if(!state.visitAftermath)return;
 openModal('<div class="visit-picture"><img src="assets/gang-v4.png" alt="Бандиты перегородили тупик"></div><span class="eyebrow">ТУПИК</span><h2 id="modalTitle">Тебя гопнули</h2><p>Тропа упёрлась в забор. Из-за угла вышла банда, а проводник встал рядом с ними.</p><p>«Сюда давай всё. И карманы выверни. Теперь можешь идти».</p><div class="quest"><b>Все деньги и припасы забрали</b><p>Потеряно: '+state.visitAftermath.money.toLocaleString('ru-RU')+' ₽ и '+state.visitAftermath.count+' предметов. До новой локации ты не добрался.</p></div><button class="primary" id="visit-return">Вернуться на базу</button>','danger');
 visitResultOpen=true;bind('visit-return',closeModal);
}
