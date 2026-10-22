'use strict';
// Road encounters and multi-expedition stories. All random facts are rolled once,
// stored in the encounter snapshot, and never rerolled by opening a menu/reloading.
const EVENTS47=[
 {kind:'abandonedCart',title:'Брошенная тележка',art:'cart',weight:3},
 {kind:'acidRain',title:'Кислотный дождь',art:'rain',weight:2},
 {kind:'cargoLift',title:'Заклинивший грузовой лифт',art:'lift',weight:2,locations:[1]},
 {kind:'singingReeds',title:'Поющий камыш',art:'reeds',weight:2,locations:[2]},
 {kind:'lostBackpack',title:'Чужой рюкзак',art:'backpack',weight:2,locations:[4],story:true},
 {kind:'unlitGuide',title:'Проводник без фонаря',art:'guide',weight:2},
 {kind:'wreckedCaravan',title:'Сорванный караван',art:'caravan',weight:1.5,story:true},
 {kind:'blackMarks',title:'Чёрные метки',art:'marks',weight:1,locations:[1,3,4],story:true}
];
const FOLLOWUPS47=['backpackOwner','caravanThanks','marksFollow'];
BUTTON_EVENTS.push(...EVENTS47.map(d=>d.kind),...FOLLOWUPS47);
for(const d of EVENTS47){const image=new Image();image.src='assets/events-v47/'+d.art+'.png';WORLD_ART['rare-event47-'+d.art]=image;}
function isEvent47(e=event){return !!e&&(EVENTS47.some(d=>d.kind===e.type)||FOLLOWUPS47.includes(e.type));}
function event47Definition(e=event){return EVENTS47.find(d=>d.kind===e?.type)||EVENTS47.find(d=>d.kind===({backpackOwner:'lostBackpack',caravanThanks:'wreckedCaravan',marksFollow:'blackMarks'}[e?.type]));}
function initEvents47(raw){
 const old=raw?.events47||{},count=n=>finiteCount(n),valid=q=>q&&Number.isInteger(q.location)&&q.location>=0&&q.location<5;
 const history={};for(const d of EVENTS47)if(old.history?.[d.kind])history[d.kind]=count(old.history[d.kind]);
 state.events47={version:1,nextStep:old.version===1?count(old.nextStep):state.steps+3,misses:Math.min(10,count(old.misses)),history,storyAt:count(old.storyAt),backpack:null,cargo:null,marks:null,guideSteps:Math.min(3,count(old.guideSteps)),guideSerial:count(old.guideSerial),rainWear:Math.min(2,count(old.rainWear))};
 const r=state.events47;
 if(valid(old.backpack)&&['sealed','opened','stolen','returned','closed'].includes(old.backpack.stage))r.backpack={stage:old.backpack.stage,location:old.backpack.location,serial:count(old.backpack.serial),nextStep:count(old.backpack.nextStep)};
 if(valid(old.cargo)&&['medicine','ammo','tech'].includes(old.cargo.kind)&&['sealed','opened','delivered','closed'].includes(old.cargo.stage))r.cargo={kind:old.cargo.kind,stage:old.cargo.stage,location:old.cargo.location,serial:count(old.cargo.serial),nextStep:count(old.cargo.nextStep)};
 if(valid(old.marks)&&Number.isInteger(old.marks.stage)&&old.marks.stage>=1&&old.marks.stage<=3)r.marks={location:old.marks.location,stage:old.marks.stage,knowledge:Math.min(3,count(old.marks.knowledge)),erased:Math.min(3,count(old.marks.erased)),serial:count(old.marks.serial),nextStep:count(old.marks.nextStep)};
 if(state.mode==='base'&&raw?.mode!=='expedition')r.rainWear=0;
}
function eligibleEvents47(){
 const r=state.events47,now=Date.now();
 return EVENTS47.filter(d=>(!d.locations||d.locations.includes(state.location))&&(!r.history[d.kind]||state.steps-r.history[d.kind]>=12)&&(!d.story||now>=r.storyAt)&&
  (d.kind!=='lostBackpack'||!r.backpack||['returned','closed'].includes(r.backpack.stage))&&
  (d.kind!=='wreckedCaravan'||!r.cargo||r.cargo.stage==='closed'||r.cargo.stage==='opened')&&
  (d.kind!=='blackMarks'||!r.marks));
}
function rollEvent47(){
 const r=state.events47;if(!r||dungeonActive()||state.steps<r.nextStep)return null;
 const list=eligibleEvents47();if(!list.length)return null;
 // A separate pool for short events; the old five-minute rare cooldown stays intact.
 if(r.misses<10&&Math.random()>=Math.min(.42,.12+r.misses*.03)){r.misses++;return null;}
 const unseen=list.filter(d=>!r.history[d.kind]),pool=unseen.length?unseen:list,total=pool.reduce((n,d)=>n+d.weight,0);let pick=Math.random()*total,chosen=pool[pool.length-1];
 for(const d of pool){pick-=d.weight;if(pick<0){chosen=d;break;}}
 r.misses=0;r.nextStep=state.steps+4;r.history[chosen.kind]=state.steps;if(chosen.story)r.storyAt=Date.now()+90000;
 return chosen.kind;
}
function continuation47(){
 if(dungeonActive()||!state.events47)return null;const r=state.events47,serial=state.expeditionSerial||0;
 const ready=q=>q&&q.location===state.location&&serial>q.serial&&state.steps>=q.nextStep;
 if(ready(r.backpack)&&['sealed','opened','stolen'].includes(r.backpack.stage))return 'backpackOwner';
 if(ready(r.cargo)&&r.cargo.stage==='delivered')return 'caravanThanks';
 if(ready(r.marks))return 'marksFollow';return null;
}
function prepareEvent47(){
 const e=event;e.phase='choice';
 if(e.type==='abandonedCart'){e.variant=['supplies','empty','jammed'][Math.floor(Math.random()*3)];e.danger=Math.random()<.4;}
 if(e.type==='acidRain')e.traveler=Math.random()<.45;
 if(e.type==='cargoLift')e.danger=Math.random()<.45;
 if(e.type==='unlitGuide'){e.honest=Math.random()<.7;e.questioned=false;}
 if(e.type==='singingReeds'){e.period=2400;e.safeCenter=.5;e.attempts=0;e.scouted=false;}
 syncAudioScene();if(!['cart','marks'].includes(event47Definition(e).art))AudioFX.play('event47-'+event47Definition(e).art);log(event47Title(e));
}
function event47Title(e=event){return ({backpackOwner:'Хозяин рюкзака',caravanThanks:'Долг караванщика',marksFollow:state.events47?.marks?.stage===3?'У логова':'Метки стали свежее'}[e?.type])||event47Definition(e)?.title||'Встреча';}
function canEvent47(types,phase='choice'){return rareCan(types,phase);}
function finishEvent47(title,text,loot={},xp=0,rep=0){return rareFinish(title,text,loot,xp,rep);}
function passEvent47(){
 if(!canEvent47([...EVENTS47.map(d=>d.kind),...FOLLOWUPS47]))return false;
 const r=state.events47,q=event.type==='backpackOwner'?r.backpack:event.type==='caravanThanks'?r.cargo:event.type==='marksFollow'?r.marks:null;
 if(q){q.serial=state.expeditionSerial||0;q.nextStep=state.steps+3;}
 return finishEvent47('Идём дальше',q?'Вернёмся к этому в другой вылазке.':'Встреча осталась позади.');
}
function cart47(action){
 if(!canEvent47(['abandonedCart']))return false;const e=event;
 if(action==='quick')AudioFX.play('event47-cart');
 if(action==='quick')return finishEvent47('Что лежало сверху',e.variant==='empty'?'В мешке только мокрые тряпки.':'Забрали припасы, пока в лесу тихо.',e.variant==='empty'?{cloth:1}:{scrap:2,cloth:2},5);
 if(!['search','trail'].includes(action)||!spend(action==='search'?8:12,()=>cart47(action)))return false;
 if(action==='search')AudioFX.play('event47-cart');
 if(action==='trail')return startFight47('shadowDog','cart');
 if(e.danger)return startFight47('shadowDog','cart');
 return finishEvent47('Тележка обыскана',e.variant==='jammed'?'Высвободили заклинившее дно. Под ним сохранились детали.':e.variant==='empty'?'Долгий обыск дал немного металла. Остальное сгнило.':'Под мешками нашлись лекарства и электроника.',e.variant==='empty'?{scrap:3}:e.variant==='jammed'?{scrap:5,circuit:3}:{medkit:1,circuit:2,cloth:3},12);
}
function rain47(action){
 if(!canEvent47(['acidRain']))return false;
 if(action==='shelter'){
  if(!spend(10,()=>rain47(action)))return false;
  return finishEvent47('Дождь переждали',event.traveler?'Под навесом сидел молчаливый сталкер. За предупреждение о дороге он дал перевязку.':'Переждали под бетоном. На дороге осталось только шипение.',event.traveler?{cloth:2}:{},8,event.traveler?2:0);
 }
 if(action==='cover'){
  if(!state.items.tarpaulin&&!state.items.cloth)return false;
  if(state.items.tarpaulin)state.items.tarpaulin--;else{if(state.items.cloth<3)return false;state.items.cloth-=3;}
  return finishEvent47('Под защитой', 'Самодельный плащ принял капли на себя. Защитный материал испорчен, но снаряжение цело.',{},8);
 }
 if(action!=='run'||!spend(6,()=>rain47(action)))return false;
 const hp=Math.max(3,10-Math.floor(armor()/2));if(!rareDamage(hp))return true;
 const worn=!!state.equipment.body;if(worn)state.events47.rainWear=2;
 return finishEvent47('Прошли под дождём','Едкие капли: −'+hp+' здоровья.'+(worn?' Защита −2 до обслуживания на базе.':''),{},5);
}
function lift47(action){
 if(!canEvent47(['cargoLift']))return false;
 if(action==='power'){if(state.items.scrap<3||state.items.circuit<1)return false;state.items.scrap-=3;state.items.circuit--;}
 else if(action==='crank'){if(!spend(16,()=>lift47(action)))return false;}
 else return false;
 AudioFX.play('event47-lift');
 if(event.danger)return startFight47('shadowDog','lift');
 return finishEvent47('Платформа опущена','Лебёдка загрохотала, но никто не пришёл. Ящик снят с платформы.',baseLevel()>=5?{scrap:6,circuit:4,tarpaulin:1}:{scrap:6,circuit:4,medkit:1},18);
}
function reeds47Position(t=performance.now()){return .5+.48*Math.sin((t-event.miniStart)*Math.PI*2/event.period-Math.PI/2);}
function reeds47(action){
 if(!canEvent47(['singingReeds'],action==='step'?'trap':'choice'))return false;
 if(action==='scout'){
  if(event.scouted||state.items.scrap<1)return false;state.items.scrap--;event.scouted=true;AudioFX.play('craft');save();renderAction();return true;
 }
 if(action==='start'){event.phase='trap';event.miniStart=performance.now();AudioFX.play('event47-reeds');save();renderAction();return true;}
 if(action!=='step')return false;
 const p=reeds47Position(),width=event.scouted?.18:.105;
 if(Math.abs(p-.5)<=width)return finishEvent47('Камыш пропустил','Прошли между волнами свечения и забрали находку с сухого островка.',{artifact:1},22);
 event.phase='choice';event.attempts++;
 if(!rareDamage(0,8,4))return true;
 if(event.attempts>=2)return finishEvent47('Тропа затоплена','Две волны сомкнули проход. Отступаем. Последняя ошибка: +8 радиации, −4 выносливости.');
 event.feedback='Волна задела край тропы: +8 радиации, −4 выносливости. Можно отступить или попробовать ещё раз.';save();render();return true;
}
function backpack47(action){
 if(!canEvent47(['lostBackpack']))return false;const r=state.events47;
 if(r.backpack&&!['returned','closed'].includes(r.backpack.stage))return false;
 if(!['keep','take','part'].includes(action))return false;
 r.backpack={stage:action==='keep'?'sealed':action==='part'?'opened':'stolen',location:state.location,serial:state.expeditionSerial||0,nextStep:state.steps+4};
 return finishEvent47(action==='keep'?'Сохранили для хозяина':'Взяли чужие припасы',action==='keep'?'Рюкзак подписан «Лис». Сохраним его целым: владельца стоит поискать в следующих вылазках.':action==='part'?'Взяли аптечку, остальное оставили в рюкзаке. На клапане имя «Лис».':'Припасы переложены в свой рюкзак. Именной жетон оставлен: хозяин может ещё объявиться.',action==='keep'?{}:action==='part'?{medkit:1}:{medkit:1,circuit:3,cloth:4},6,action==='take'?-3:0);
}
function owner47(action){
 if(!canEvent47(['backpackOwner']))return false;const q=state.events47.backpack;if(!q||!['sealed','opened','stolen'].includes(q.stage))return false;
 if(action==='return'&&q.stage==='sealed'){q.stage='returned';state.money+=260;return finishEvent47('Рюкзак вернулся к Лису','Лис пересчитал вещи и пожал руку. +260 ₽, +8 репутации.',{energy:1},20,8);}
 if(action==='admit'&&q.stage!=='sealed'){const part=q.stage==='opened';q.stage='closed';return finishEvent47('Сказали как было',part?'Лис забрал оставшиеся вещи. «Аптечка тебе нужнее была? Ладно. Спасибо, что остальное донёс».':'Лис забрал именной жетон. Разговор вышел коротким. Чужие вещи он запомнил.',{},8,part?2:-4);}
 if(action==='lie'){const intact=q.stage==='sealed';q.stage='closed';return finishEvent47('Разошлись',intact?'Спрятали чужой рюкзак и сказали, что ничего не находили.':'Соврали, но Лис заметил знакомую перевязку. Встреча закончилась ссорой.',intact?{medkit:1,circuit:3,cloth:4}:{},3,-6);}
 return false;
}
const CARGO47={medicine:{name:'Медикаменты',reward:320,loot:{medkit:2,cloth:3}},ammo:{name:'Боеприпасы',reward:360,loot:{scrap:5,circuit:3}},tech:{name:'Оборудование',reward:420,loot:{circuit:6,scrap:2}}};
function cargo47(kind){
 if(!canEvent47(['wreckedCaravan'])||!Object.hasOwn(CARGO47,kind))return false;
 const old=state.events47.cargo;if(old&&!['closed','opened'].includes(old.stage))return false;
 state.events47.cargo={kind,stage:'sealed',location:state.location,serial:state.expeditionSerial||0,nextStep:state.steps+4};
 event.cargoChosen=true;AudioFX.play('event47-caravan');save();renderAction();return true;
}
function sealCargo47(){
 if(!canEvent47(['wreckedCaravan'])||!event.cargoChosen||state.events47.cargo?.stage!=='sealed')return false;
 return finishEvent47('Один груз спасён',CARGO47[state.events47.cargo.kind].name+' закреплены на рюкзаке. Остальные ящики затянуло в провал. На базе передай посылку через «Найденные вещи».',{},8);
}
function openRoadCargo47(){
 if(!canEvent47(['wreckedCaravan'])||!event.cargoChosen||state.events47.cargo?.stage!=='sealed')return false;
 const q=state.events47.cargo;q.stage='opened';
 return finishEvent47('Чужой груз вскрыт','Забрали содержимое. Владелец не дождётся посылки. Репутация −3.',cargo47Loot(q.kind),8,-3);
}
function confirmRoadCargo47(){
 if(!canEvent47(['wreckedCaravan'])||!event.cargoChosen||state.events47.cargo?.stage!=='sealed')return false;
 openModal('<h2 id="modalTitle">Вскрыть чужой груз?</h2><p>Это посылка для владельца. После вскрытия передать её уже нельзя: репутация −3. Непоместившиеся припасы придётся оставить.</p><button class="primary" id="cargo47-road-confirm">Всё равно вскрыть</button><button class="secondary" id="cargo47-road-cancel">Сохранить целым</button>');
 bind('cargo47-road-confirm',()=>{closeModal();openRoadCargo47();});bind('cargo47-road-cancel',closeModal);return true;
}
function cargo47Loot(kind){return kind==='ammo'&&baseLevel()>=5?{weaponParts:1,scrap:3}:kind==='tech'&&baseLevel()>=5?{radioParts:1,circuit:3}:CARGO47[kind].loot;}
function manageCargo47(action){
 const q=state.events47?.cargo;if(document.hidden||state.mode!=='base'||!q||q.stage!=='sealed'||!['deliver','open'].includes(action))return false;
 if(action==='deliver'){q.stage='delivered';state.money+=CARGO47[q.kind].reward;state.rep+=6;addXP(18);AudioFX.play('coin');toast('Груз передан: +'+CARGO47[q.kind].reward+' ₽, +6 репутации.');}
 else{q.stage='opened';const loot=rareLoot(cargo47Loot(q.kind));state.rep=Math.max(0,state.rep-3);AudioFX.play('loot');toast('Груз вскрыт. −3 репутации.'+(totalLoot(loot)?' Припасы убраны в рюкзак.':' В рюкзаке нет места.'));}
 save();render();openParcels47();return true;
}
function caravanThanks47(){
 if(!canEvent47(['caravanThanks']))return false;const q=state.events47.cargo;if(q?.stage!=='delivered')return false;
 q.stage='closed';return finishEvent47('Караван помнит','Караванщик узнал спасителя груза. Он поделился припасами и безопасной тропой на ближайшие три перехода.',{medkit:1,energy:1},15,4)&&guide47Grant();
}
function guide47Grant(){state.events47.guideSteps=3;state.events47.guideSerial=state.expeditionSerial||0;save();return true;}
function guide47(action){
 if(!canEvent47(['unlitGuide']))return false;
 if(action==='ask'){if(event.questioned)return false;event.questioned=true;AudioFX.play('event47-guide');save();renderAction();return true;}
 if(action==='pay'){if(state.money<90)return false;state.money-=90;}
 else if(action==='supplies'){if(state.items.cloth<2)return false;state.items.cloth-=2;}
 else if(action==='help'){if(!spend(8,()=>guide47(action)))return false;}
 else return false;
 if(!event.honest){if(!rareDamage(8,5))return true;return finishEvent47('Проводник потерял дорогу','За бетонным забором он замялся и исчез. Выбрались сами: −8 здоровья, +5 радиации.',{},4);}
 guide47Grant();return finishEvent47('Безопасная тропа','Проводник показал обход. Следующие три перехода стоят вдвое меньше выносливости.',{},10,2);
}
function marks47(action){
 if(!canEvent47(['blackMarks','marksFollow']))return false;const r=state.events47;
 if(!['study','erase','follow','cache','fight','trap'].includes(action))return false;
 let q=r.marks;
 if(event.type==='marksFollow'&&(!q||q.stage<1||q.stage>3))return false;
 if(q?.stage===3){
  if(action==='cache'&&q.erased>=2){r.marks=null;return finishEvent47('Сбили чужой след','Дважды стёртые метки увели зверя от тайника. Внутри вещи прежних путников.',{circuit:5,medkit:1,artifact:1},25,5);}
  if(!['fight','trap'].includes(action)||q.erased>=2)return false;
  if(action==='trap'){if(state.items.scrap<2||state.items.cloth<1)return false;state.items.scrap-=2;state.items.cloth--;}
  const knowledge=q.knowledge;r.marks=null;return startFight47('huntAlpha','marks',knowledge,action==='trap');
 }
 if(!['study','erase','follow'].includes(action)||!spend(action==='study'?6:action==='erase'?4:8,()=>marks47(action)))return false;
 AudioFX.play('event47-marks');
 if(!q)q=r.marks={location:state.location,stage:0,knowledge:0,erased:0,serial:0,nextStep:0};
 if(action==='study')q.knowledge++;if(action==='erase')q.erased++;
 q.stage++;q.serial=state.expeditionSerial||0;q.nextStep=state.steps+4;
 const clue=action==='study'?(q.knowledge>=2?'Метки отмечают подходы к логову пепельного вожака. Зверь плохо видит справа — это даст преимущество в бою.':'В чёрной смоле застряла серая шерсть. Под стеной крупные отпечатки лап.'):action==='erase'?'Счистили смолу и сбили ориентир. Повторив это на следующей вылазке, можно увести зверя от тайника.':'Отметины тянутся к глубокому оврагу. Рядом всё чаще попадаются кости.';
 return finishEvent47('След остаётся',clue+' Продолжение ищи здесь в следующей вылазке.',{},8);
}
function startFight47(enemy,origin,knowledge=0,trap=false){
 const hunt=state.rare.hunt;startRareFight(enemy);state.rare.hunt=hunt;
 event.event47Combat=origin;event.rareArt='event47-'+origin;
 if(origin==='marks'){event.attack=knowledge>=2?7:10;event.hp=event.maxHp=Math.max(25,65-knowledge*8-(trap?15:0));delete event.balance51;window.Economy51?.apply(event);}
 if(!['cart','marks'].includes(origin))AudioFX.play('event47-'+origin);save();render();return true;
}
function winFight47(){
 if(!event?.event47Combat||event.resolved)return false;
 const origin=event.event47Combat;state.kills[state.location]++;
 if(origin==='marks')return finishEvent47('Хозяин меток повержен','Пепельный вожак больше не охотится у тайника. Под костями сохранились вещи пропавших путников.',{alphaFang:1,circuit:4,medkit:1},35,6);
 return finishEvent47(origin==='lift'?'Шум стих':'Логово за тележкой',origin==='lift'?'Пёс пришёл на шум лебёдки. Теперь можно забрать ящик.':'В логове нашли утащенные мешки. Путь обратно свободен.',origin==='lift'?{scrap:6,circuit:4,medkit:1}:{scrap:4,cloth:3,medkit:1},18,2);
}
function event47TravelCost(){const r=state.events47;return r?.guideSteps>0&&r.guideSerial===(state.expeditionSerial||0)?4:8;}
function event47TravelUsed(){if(event47TravelCost()===4)state.events47.guideSteps--;}
function event47StoryHTML(){
 const r=state.events47;if(!r)return '';const lines=[];
 if(r.backpack&&['sealed','opened','stolen'].includes(r.backpack.stage))lines.push('Рюкзак Лиса · '+({sealed:'сохранён целым',opened:'часть припасов взята',stolen:'остался именной жетон'}[r.backpack.stage])+' · хозяина ищи в следующей вылазке: '+LOCATIONS[r.backpack.location].name);
 if(r.cargo&&['sealed','delivered'].includes(r.cargo.stage))lines.push(CARGO47[r.cargo.kind].name+' · '+(r.cargo.stage==='sealed'?'передай на базе через «Найденные вещи»':'груз доставлен; караванщик может встретиться в следующей вылазке: '+LOCATIONS[r.cargo.location].name));
 if(r.marks)lines.push('Чёрные метки · '+r.marks.stage+'/3 · '+LOCATIONS[r.marks.location].name+' · продолжение в следующей вылазке');
 return lines.map(s=>'<p>'+s+'</p>').join('');
}
function event47ParcelsHTML(){
 const r=state.events47;if(!r)return '';const lines=[];
 if(r.backpack&&['sealed','opened','stolen'].includes(r.backpack.stage))lines.push('<b>Рюкзак Лиса</b><p>'+({sealed:'Целый. Верни хозяину в следующей вылазке.',opened:'Часть припасов взята. Остальное можно вернуть.',stolen:'Припасы присвоены. Именной жетон остался.'}[r.backpack.stage])+'</p>');
 if(r.cargo&&r.cargo.stage==='sealed')lines.push('<b>'+CARGO47[r.cargo.kind].name+'</b><p>Груз запечатан. Владелец ждёт его на базе.</p>');
 return lines.length?'<div class="rare-story-notes"><span class="eyebrow">НАЙДЕННЫЕ ВЕЩИ</span>'+lines.join('')+'</div>':'';
}
function openParcels47(){
 if(state.mode!=='base'||document.hidden)return false;const q=state.events47?.cargo;
 return openQuests();
}
function confirmCargoOpen47(){
 if(state.mode!=='base'||state.events47?.cargo?.stage!=='sealed')return false;
 openModal('<h2 id="modalTitle">Вскрыть чужой груз?</h2><p>Владелец не получит посылку. Ты заберёшь припасы и потеряешь 3 репутации. То, что не поместится в рюкзак, придётся оставить.</p><button class="primary" id="cargo47-confirm">Вскрыть</button><button class="secondary" id="cargo47-cancel">Сохранить груз</button>');
 bind('cargo47-confirm',()=>manageCargo47('open'));bind('cargo47-cancel',openParcels47);return true;
}
function validateEvent47(e){
 if(!isEvent47(e))return true;if(!['choice','trap'].includes(e.phase))return false;
 if(e.type==='singingReeds')return e.period===2400&&Number.isInteger(e.attempts)&&e.attempts>=0&&e.attempts<=2&&typeof e.scouted==='boolean';
 if(e.type==='unlitGuide')return typeof e.honest==='boolean'&&typeof e.questioned==='boolean';
 if(e.type==='abandonedCart')return ['supplies','empty','jammed'].includes(e.variant)&&typeof e.danger==='boolean';
 if(e.type==='cargoLift')return typeof e.danger==='boolean';return true;
}
function renderEvent47Action(){
 if(!isEvent47()||event.resolved)return false;
 const e=event,r=state.events47,actions=[];let desc='',mini='',leave=true;
 const add=(id,label,fn,disabled=false)=>actions.push(rareButton('ev47-'+id,label,fn,disabled));
 const cost=n=>staminaCost(n)+' выносливости';
 if(e.type==='abandonedCart'){
  desc={supplies:'Из тележки высыпались мешки. След волочения уходит между соснами.',empty:'Мешки промокли, под сломанной осью виден ржавый ящик.',jammed:'Колесо вывернуто, дно заклинило. Внутри что-то звякнуло.'}[e.variant]+' Долгий обыск может привлечь обитателя леса.';
  add('cart-quick','Забрать видимое',()=>cart47('quick'));add('cart-search','Тщательный обыск · −'+cost(8),()=>cart47('search'));add('cart-trail','К логову по следам · −'+cost(12),()=>cart47('trail'));
 }else if(e.type==='acidRain'){
  desc='Капли шипят на металле. Под бетонным навесом можно переждать, но это отнимет силы. Пробежка обойдётся здоровьем и повредит защиту до возвращения на базу.';
  add('rain-shelter','Под навес · −'+cost(10),()=>rain47('shelter'));
  add('rain-cover',state.items.tarpaulin?'Укрыться брезентом ×1':'Сделать плащ · ткань ×3',()=>rain47('cover'),!state.items.tarpaulin&&state.items.cloth<3);
  add('rain-run','Пройти под дождём · −'+cost(6),()=>rain47('run'));leave=false;
 }else if(e.type==='cargoLift'){
  desc='На платформе за решёткой застрял ящик. Лебёдку можно запитать или провернуть вручную. Шум способен привлечь пса.';
  add('lift-power','Подать питание · металл ×3, электроника ×1',()=>lift47('power'),state.items.scrap<3||state.items.circuit<1);add('lift-crank','Крутить лебёдку · −'+cost(16),()=>lift47('crank'));
 }else if(e.type==='singingReeds'){
  desc=e.phase==='trap'?'Шагни, когда бегунок внутри зелёного просвета. Волна за его краями добавляет радиацию.':(e.feedback||'Волна света пробегает по камышу. В глубине лежит артефакт. Попробуй поймать безопасный ритм или обойди болото.');
  if(e.phase==='trap'){
   const width=e.scouted?36:21;mini='<div class="rare-meter event47-meter" role="meter" aria-label="Ритм камыша"><span style="left:'+(50-width/2)+'%;width:'+width+'%"></span><i id="event47ReedNeedle" style="left:'+reeds47Position()*100+'%"></i></div>';add('reed-step','Шагнуть в просвет',()=>reeds47('step'));add('reed-back','Отступить',()=>{if(canEvent47(['singingReeds'],'trap')){event.phase='choice';return passEvent47();}});leave=false;
  }else{add('reed-start',e.attempts?'Попробовать снова':'Следить за волной',()=>reeds47('start'));add('reed-scout',e.scouted?'Ритм проверен · просвет шире':'Бросить металлический болт · металл ×1',()=>reeds47('scout'),e.scouted||!state.items.scrap);}
 }else if(e.type==='lostBackpack'){
  desc='Под стеной лежит рюкзак. На жетоне имя «Лис». Лекарства целы, следов крови нет. Возможно, хозяин ещё вернётся.';
  add('pack-keep','Сохранить рюкзак целым',()=>backpack47('keep'));add('pack-part','Взять аптечку, сохранить остальное',()=>backpack47('part'));add('pack-take','Присвоить припасы · −3 реп.',()=>backpack47('take'));
 }else if(e.type==='backpackOwner'){
  const q=r.backpack;desc='«Рюкзак с жетоном не видел? Лис я. У забора потерял». Сталкер внимательно смотрит на твои вещи.';
  if(q?.stage==='sealed')add('owner-return','Вернуть целым · +260 ₽, +8 реп.',()=>owner47('return'));
  else add('owner-admit',q?.stage==='opened'?'Вернуть остаток и признаться':'Вернуть жетон и признаться',()=>owner47('admit'));
  add('owner-lie','Сказать, что ничего не видел · −6 реп.',()=>owner47('lie'));
 }else if(e.type==='unlitGuide'){
  const landmarks=['старую насосную','цех с проваленной крышей','сухую гряду между топями','северный забор радиоузла','арку без верхнего этажа'];
  desc=e.questioned?(e.honest?'Он уверенно описал '+landmarks[state.location]+' и назвал примету сразу за поворотом. На сапогах свежая грязь с этой тропы.':'Он путает ориентиры, говорит про мост, которого здесь нет, и настойчиво просит оплату вперёд.'):'«Проведу в обход. Фонарь не нужен — дорогу знаю». За помощь он просит деньги, припасы или помочь расчистить проход.';
  add('guide-ask','Расспросить о маршруте',()=>guide47('ask'),e.questioned);add('guide-pay','Заплатить · 90 ₽',()=>guide47('pay'),state.money<90);add('guide-supply','Дать ткань ×2',()=>guide47('supplies'),state.items.cloth<2);add('guide-help','Помочь расчистить · −'+cost(8),()=>guide47('help'));
 }else if(e.type==='wreckedCaravan'){
  if(e.cargoChosen&&r.cargo?.stage==='sealed'){
   desc=CARGO47[r.cargo.kind].name+' спасены. Другие ящики уже ушли в провал. Владелец заплатит за целую посылку, но содержимое можно забрать сейчас.';
   add('cargo-seal','Унести целым для владельца',sealCargo47);add('cargo-open','Вскрыть ради припасов · −3 реп.',confirmRoadCargo47);leave=false;
  }else{desc='Повозка сползает в провал. Унести успеешь один ящик. На каждом бирка владельца: целый груз оплатят на базе, вскрытый даст припасы сразу.';
   for(const [kind,d]of Object.entries(CARGO47))add('cargo-'+kind,d.name+' · доставка '+d.reward+' ₽',()=>cargo47(kind));}
 }else if(e.type==='caravanThanks'){
  desc='«Это ты мой груз вытащил? Спасибо. Держи припасы. И сюда ходи — тут спокойнее». Караванщик узнаёт тебя первым.';add('thanks','Принять припасы и узнать обход',caravanThanks47);
 }else if(e.type==='blackMarks'||e.type==='marksFollow'){
  const q=r.marks;
  if(q?.stage===3){
   desc=q.erased>=2?'Следы зверя уходят в сторону от стёртых знаков. У корней дерева виден замаскированный тайник.':'Метки привели к логову пепельного вожака. Под костями видны утащенные мешки.'+(q.knowledge>=2?' Ты знаешь его слепую сторону: в бою он будет слабее.':' Изученные следы помогут подготовиться к бою.');
   if(q.erased>=2)add('marks-cache','Забрать тайник',()=>marks47('cache'));
   else{add('marks-fight','Выйти к вожаку',()=>marks47('fight'));add('marks-trap','Подготовить ловушку · металл ×2, ткань ×1',()=>marks47('trap'),state.items.scrap<2||state.items.cloth<1);}
  }else{
   desc=q?'Смола ещё липкая. Метки появляются ближе друг к другу, под стеной сереют клочья шерсти. Кто-то использует этот путь.':'На стене три чёрных штриха из смолы. Ниже такая же метка, уже старая. За поворотом что-то царапнуло бетон.';
   add('marks-study','Изучить следы · −'+cost(6),()=>marks47('study'));add('marks-erase','Стереть ориентир · −'+cost(4),()=>marks47('erase'));add('marks-follow','Следовать указателям · −'+cost(8),()=>marks47('follow'));
  }
 }
 setSceneInteraction('','<span class="eyebrow">'+(FOLLOWUPS47.includes(e.type)?'ИСТОРИЯ ПРОДОЛЖАЕТСЯ':'ВСТРЕЧА В ЗОНЕ')+'</span><h3>'+event47Title()+'</h3><p>'+desc+'</p>');
 if(leave)add('pass','Пройти мимо',passEvent47);actions.push(rareButton('escape','На базу',escapeExpedition));
 buttons(mini+'<div class="rare-options event47-options">'+actions.map(a=>a.html).join('')+'</div>');for(const a of actions)bind(a.id,a.fn);return true;
}
function updateEvent47(t){
 if(event.type==='singingReeds'&&event.phase==='trap'&&!exhaustionOpen&&$('modalBackdrop').hidden&&$('event47ReedNeedle'))$('event47ReedNeedle').style.left=reeds47Position(t)*100+'%';
}
