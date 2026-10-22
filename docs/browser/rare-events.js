'use strict';
const SPECIAL_ITEMS={alphaFang:{name:'Клык пепельного вожака',price:950}};
const SPECIAL_EVENTS=[
 {kind:'wounded',chance:.0035,title:'Раненый сталкер',sound:'wounded'},
 {kind:'trappedCache',chance:.003,title:'Схрон на растяжке',sound:'tripwire',locations:[0,1,4]},
 {kind:'radioSignal',chance:.0025,title:'Сигнал по рации',sound:'radio-static'},
 {kind:'emission',chance:.0015,title:'Приближается выброс',sound:'emission-siren'},
 {kind:'anomalyFog',chance:.0025,title:'Аномальный туман',sound:'anomaly-fog',locations:[0,2,3]},
 {kind:'rivalLoot',chance:.003,title:'Чужая добыча',sound:'rival-loot'},
 {kind:'nightShadow',chance:.002,title:'Шаги за спиной',sound:'night-shadow',night:true},
 {kind:'mutantTracks',chance:.0025,title:'Следы редкого мутанта',sound:'mutant-tracks'}
];
const SPECIAL_KINDS=SPECIAL_EVENTS.map(e=>e.kind),STORY_KINDS=['rescueCache','radioFollow','huntClue'];
BUTTON_EVENTS.push(...SPECIAL_KINDS,...STORY_KINDS);
const SPECIAL_COOLDOWN_MS=300000,SPECIAL_GAP_STEPS=8,SPECIAL_REPEAT_MS=1800000;
const FOG_MARKERS=['Бочка','Камень','Труба'];
for(const key of [...SPECIAL_KINDS,'radioAmbush','huntAlpha','huntAlpha-down','alphaFang']){const image=new Image();image.src='assets/rare-v23/'+key+'.webp';WORLD_ART['rare-'+key]=image;}
function finiteCount(n,max=Number.MAX_SAFE_INTEGER){return Number.isFinite(Number(n))?Math.max(0,Math.min(max,Math.floor(Number(n)))):0;}
function initRareEvents(raw){
 const old=raw?.rare||{},history={};for(const k of SPECIAL_KINDS)history[k]=finiteCount(old.history?.[k]);
 state.rare={nextAt:finiteCount(old.nextAt),nextStep:old.nextStep===undefined?state.steps+SPECIAL_GAP_STEPS:finiteCount(old.nextStep),history,rescue:null,hunt:null,radio:null,pending:null};
 const valid=q=>q&&Number.isInteger(q.location)&&q.location>=0&&q.location<LOCATIONS.length;
 if(valid(old.rescue)&&['coordinates','locked','key','completed'].includes(old.rescue.stage))state.rare.rescue={stage:old.rescue.stage,location:old.rescue.location,nextStep:finiteCount(old.rescue.nextStep),reunion:!!old.rescue.reunion};
 if(valid(old.hunt)&&['following','ready'].includes(old.hunt.stage))state.rare.hunt={stage:old.hunt.stage,location:old.hunt.location,clues:Math.min(2,finiteCount(old.hunt.clues)),nextStep:finiteCount(old.hunt.nextStep)};
 if(valid(old.radio)&&['survivor','empty','ambush'].includes(old.radio.variant))state.rare.radio={location:old.radio.location,variant:old.radio.variant,nextStep:finiteCount(old.radio.nextStep)};
 initEvents47(raw);
}
function isRareEvent(e=event){return !!e&&(isEvent47(e)||SPECIAL_KINDS.includes(e.type)||STORY_KINDS.includes(e.type)||e.rareCombat===true);}
function rareSheltered(){return state.mode==='expedition'&&event?.type==='emission'&&event.phase==='sheltered'&&!event.resolved;}
function specialEligible(def){return (!def.night||isNight())&&(!def.locations||def.locations.includes(state.location));}
function rareDepthBonus(){return dungeonActive()?0:.05*Math.max(0,expeditionTurns()-1)/(EXPEDITION_TURN_LIMIT-1);}
function rareChanceMultiplier(){const base=SPECIAL_EVENTS.reduce((n,def)=>n+def.chance,0);return (base+rareDepthBonus())/base;}
function rollRareEvent(){
 const r=state.rare,now=Date.now();if(dungeonActive()||state.steps<r.nextStep||now<r.nextAt)return null;
 const roll=Math.random(),multiplier=rareChanceMultiplier();let edge=0;
 for(const def of SPECIAL_EVENTS){const start=edge;edge+=def.chance*multiplier;if(roll>=start&&roll<edge){if(!specialEligible(def)||(r.history[def.kind]&&now-r.history[def.kind]<SPECIAL_REPEAT_MS))return null;r.nextAt=now+SPECIAL_COOLDOWN_MS;r.nextStep=state.steps+SPECIAL_GAP_STEPS;r.history[def.kind]=now;return def.kind;}}
 return null;
}
function rareContinuation(){
 if(dungeonActive())return null;const r=state.rare,ready=q=>q&&q.location===state.location&&state.steps>=q.nextStep;
 if(ready(r.radio))return 'radioFollow';
 if(ready(r.hunt))return r.hunt.stage==='ready'?'huntAlpha':'huntClue';
 if(ready(r.rescue)&&['coordinates','key'].includes(r.rescue.stage))return 'rescueCache';
 return null;
}
function prepareRareEvent(){
 if(isEvent47()){prepareEvent47();return;}
 const e=event;if(!isRareEvent(e))return;if(e.rareCombat){AudioFX.play('dog');log('Пепельный вожак вышел из логова.');return;}
 e.phase='choice';
 if(e.type==='wounded')e.reunion=state.rare.rescue?.stage==='completed'&&!state.rare.rescue.reunion;
 if(e.type==='radioSignal'){const r=Math.random();e.variant=r<.45?'survivor':r<.75?'empty':'ambush';}
 if(e.type==='nightShadow'){const r=Math.random();e.variant=r<.5?'nothing':r<.75?'friend':'dog';e.night=true;}
 if(e.type==='emission'){e.deadlineAt=Date.now()+45000;window.Emission52?.prepare(e);}
 if(e.type==='anomalyFog'){e.sequence=shuffle([0,1,2]);e.answer=0;}
 if(e.type==='radioFollow'){e.variant=state.rare.radio?.variant||'empty';if(e.variant==='ambush'){startRareFight('raider');return;}}
 const def=SPECIAL_EVENTS.find(d=>d.kind===e.type),sound=def?.sound;if(sound&&!['trappedCache','mutantTracks'].includes(e.type))AudioFX.play(sound);log(def?.title||rareStoryTitle());
}
function rareCan(types,phase=null){return state.mode==='expedition'&&event&&!event.resolved&&!document.hidden&&!exhaustionOpen&&$('modalBackdrop').hidden&&types.includes(event.type)&&(!phase||event.phase===phase);}
function rareLoot(found){const loot={};for(const [key,n]of Object.entries(found))if(ITEMS[key]){const got=addItem(key,n);if(got)loot[key]=got;}return loot;}
function rareFinish(title,text,found={},xp=0,rep=0){
 if(!event||event.resolved)return false;state.rep=Math.max(0,state.rep+rep);if(xp)addXP(xp);const loot=rareLoot(found);if(!['trappedCache','mutantTracks','huntClue','abandonedCart','blackMarks','marksFollow'].includes(event.type))AudioFX.play(totalLoot(loot)?'loot':'mini-success');resolve(title,text+(totalLoot(loot)?' Находки убраны в рюкзак.':Object.keys(found).length?' Рюкзак заполнен: находки не поместились.':''),loot);log(text);save();return true;
}
function rareDamage(hp,rad=0,energy=0){state.hp=Math.max(0,state.hp-hp);state.radiation=Math.min(100,state.radiation+rad);state.energy=Math.max(0,state.energy-energy);AudioFX.play(event?.type==='trappedCache'?'hit':'mini-fail');if(state.hp<=0){defeatPlayer(event?.type==='trappedCache'?'bleeding':'radiation');return false;}return true;}
function helpWounded(){
 if(!rareCan(['wounded','radioFollow'],'choice')||event.type==='radioFollow'&&event.variant!=='survivor')return false;
 if(event.reunion){state.rare.rescue.reunion=true;return rareFinish('Старый знакомый','Спасённый сталкер узнал тебя и поделился припасами.',{medkit:1,energy:1},10,5);}
 if(state.items.medkit<1)return false;state.items.medkit--;AudioFX.play('heal');
 if(!state.rare.rescue||state.rare.rescue.stage==='completed')state.rare.rescue={stage:'coordinates',location:state.location,nextStep:state.steps+4,reunion:false};
 if(event.type==='radioFollow')state.rare.radio=null;
 state.money+=120;return rareFinish('Помощь не забыта','Сталкер выжил. +120 ₽, +8 репутации. Он оставил координаты своего схрона.',{},12,8);
}
function searchWounded(){if(!rareCan(['wounded'],'choice')||event.reunion)return false;return rareFinish('Чужие вещи','Забрали мелочь из сумки и оставили раненого. Репутация −5.',{cloth:2,scrap:2},2,-5);}
function passRareEvent(){
 if(!rareCan([...SPECIAL_KINDS,...STORY_KINDS])||event.type==='emission'||['trap','memorize','recall'].includes(event.phase))return false;
 if(event.type==='radioFollow')state.rare.radio=null;if(event.type==='huntClue')state.rare.hunt=null;
 if(event.type==='rescueCache')state.rare.rescue.nextStep=state.steps+8;
 return rareFinish('Идём дальше','Встреча осталась позади.');
}
function beginTrap(){if(!rareCan(['trappedCache'],'choice'))return false;event.phase='trap';event.miniStart=performance.now();AudioFX.play('tripwire');save();renderAction();return true;}
function trapPosition(t=performance.now()){return .5+.48*Math.sin((t-event.miniStart)*Math.PI*2/1700-Math.PI/2);}
function stopTrap(){
 if(!rareCan(['trappedCache'],'trap'))return false;const p=trapPosition();event.phase='choice';
 if(p>=.38&&p<=.62)return rareFinish('Растяжка снята','Попали в безопасный сектор и открыли схрон.',baseLevel()>=10?{scrap:5,circuit:3,medkit:1,tarpaulin:1}:{scrap:5,circuit:3,medkit:1},18,3);
 if(!rareDamage(20,5))return true;state.bleeding=Math.max(state.bleeding,10);return rareFinish('Ловушка сработала','Растяжка сорвалась: −20 HP, +5 радиации и кровотечение. Схрон потерян.');
}
function followRadio(){if(!rareCan(['radioSignal'],'choice'))return false;if(!spend(6,followRadio))return false;state.rare.radio={variant:event.variant,location:state.location,nextStep:state.steps+3};return rareFinish('Координаты приняты','Сворачиваем к источнику сигнала. До места ещё три участка.',{},5);}
function collectRadioCache(){if(!rareCan(['radioFollow'],'choice')||event.variant!=='empty')return false;state.rare.radio=null;return rareFinish('Пустой лагерь','Людей уже нет. Под навесом сохранились припасы и записка.',{circuit:2,cloth:3,vodka:1},10);}
function enterEmissionShelter(){if(window.Emission52?.active())return window.Emission52.run();if(!rareCan(['emission'],'choice'))return false;event.phase='sheltered';event.shelterUntil=Date.now()+8000;AudioFX.play('open');save();renderAction();return true;}
function dashThroughEmission(){
 if(!rareCan(['emission'],'choice'))return false;if(!spend(18,dashThroughEmission))return false;
 if(!rareDamage(10,12))return true;return rareFinish('Прошли через аномалии','Успели уйти от фронта выброса. Короткий путь обошёлся в 10 HP и 12 радиации.',{},8);
}
function startFogMemory(){if(!rareCan(['anomalyFog'],'choice'))return false;event.phase='memorize';event.revealUntil=performance.now()+4500;event.answer=0;AudioFX.play('anomaly-fog');save();renderAction();return true;}
function chooseFogMarker(marker){
 if(!rareCan(['anomalyFog'],'recall')||!Number.isInteger(marker)||marker<0||marker>2)return false;
 if(event.sequence[event.answer]!==marker){if(!rareDamage(0,8,10))return true;return rareFinish('Сбились с тропы','Туман запутал дорогу: −10 выносливости, +8 радиации.');}
 event.answer++;AudioFX.play('click');if(event.answer===3)return rareFinish('Правильная тропа','Запомнили ориентиры и прошли туман. Под камнем нашлись припасы.',{cloth:2,energy:1},20,4);
 save();renderAction();return true;
}
function waitFog(){if(!rareCan(['anomalyFog'],'choice'))return false;if(!spend(8,waitFog))return false;return rareFinish('Туман рассеялся','Переждали на обочине. Путь снова виден.',{},3);}
function shareRivalLoot(exchange=false){
 if(!rareCan(['rivalLoot'],'choice')||exchange&&state.items.medkit<1)return false;
 if(exchange){state.items.medkit--;return rareFinish('Удачный обмен','Отдали аптечку и получили большую часть находок.',baseLevel()>=10?{circuit:4,scrap:5,radioParts:1}:{circuit:4,scrap:5,vodka:1},12,3);}
 return rareFinish('Разделили находки','Договорились по-человечески. Каждый взял свою долю.',{scrap:3,cloth:2},8,2);
}
function turnToShadow(){
 if(!rareCan(['nightShadow'],'choice'))return false;
 if(event.variant==='dog'){startRareFight('shadowDog');return true;}
 return event.variant==='friend'?rareFinish('Ночной попутчик','Это одиночка. Он поделился перевязкой и предупредил об опасной тропе.',{cloth:2},8,2):rareFinish('Никого нет','В темноте только качаются ветви. Можно выдохнуть.',{},5);
}
function hurryFromShadow(){if(!rareCan(['nightShadow'],'choice'))return false;if(!spend(12,hurryFromShadow))return false;return rareFinish('Оторвались','Ускорили шаг и оставили шорохи позади.',{},5);}
function hideFromShadow(){if(!rareCan(['nightShadow'],'choice'))return false;event.lampDisabled=true;AudioFX.play('click');return rareFinish('Тихо переждали','Погасили свет и замерли. Шаги растворились в темноте.',{},5);}
function followMutantTracks(){
 if(!rareCan(['mutantTracks','huntClue'],'choice'))return false;if(!spend(4,followMutantTracks))return false;
 AudioFX.play('mutant-tracks');const h=state.rare.hunt;if(event.type==='mutantTracks')state.rare.hunt={stage:'following',location:state.location,clues:0,nextStep:state.steps+3};
 else if(h){h.clues++;h.stage=h.clues>=2?'ready':'following';h.nextStep=state.steps+3;}
 return rareFinish('След взят',state.rare.hunt.stage==='ready'?'Следы ведут к логову вожака. До него ещё три участка.':'Продолжаем охоту. Следующую зацепку ищем через три участка.',{},5);
}
function rareStoryTitle(){return event?.type==='rescueCache'?'Схрон спасённого сталкера':event?.type==='radioFollow'?'Источник сигнала':'Свежие следы';}
function inspectRescueCache(){
 if(!rareCan(['rescueCache'],'choice'))return false;const q=state.rare.rescue;if(!q)return false;
 if(q.stage==='key'){q.stage='completed';return rareFinish('Схрон открыт','Ключ подошёл. В тайнике лежали припасы и ценные детали.',baseLevel()>=10?{medkit:2,energy:1,radioParts:1,weaponParts:1}:{medkit:2,energy:1,circuit:5},30,10);}
 q.stage='locked';return rareFinish('Замок не поддаётся','Записали номер замка. Техник на базе изготовит подходящий ключ.');
}
function rareTechHTML(){return state.rare?.rescue?.stage==='locked'?'<div class="tech-upgrade rare-contract"><b>Ключ от сталкерского схрона</b><p>'+servicePrice(240)+' ₽ + 6 металла. Изготовление без случайного провала.</p><button class="secondary" id="rare-key" '+(state.money<servicePrice(240)||state.items.scrap<6?'disabled':'')+'>Изготовить ключ</button></div>':'';}
function craftRescueKey(){if(state.mode!=='base'||modalNpc!==2||state.rare.rescue?.stage!=='locked'||state.money<servicePrice(240)||state.items.scrap<6)return false;state.money-=servicePrice(240);state.items.scrap-=6;state.rare.rescue.stage='key';state.rare.rescue.nextStep=state.steps+4;AudioFX.play('craft');save();render();openTech();toast('Ключ готов. Вернись к схрону в '+LOCATIONS[state.rare.rescue.location].name+'.');return true;}
function startRareFight(enemy){
 if(!event||event.resolved)return false;if(event.type==='radioFollow')state.rare.radio=null;
 const hp=enemy==='huntAlpha'?65:enemy==='raider'?45:30;
 event={type:enemy==='raider'?'human':'monster',enemy,rareCombat:true,rareArt:enemy==='raider'?'radioAmbush':null,boss:false,maxHp:hp,hp,attack:enemy==='huntAlpha'?10:enemy==='raider'?8:7,created:performance.now(),resolved:false,flash:0,combatLog:[]};
 window.Economy51?.apply(event);if(enemy==='huntAlpha')state.rare.hunt=null;AudioFX.play(enemy==='raider'?'failure':'dog');save();render();log(enemy==='huntAlpha'?'Пепельный вожак вышел из логова.':enemy==='raider'?'Сигнал оказался приманкой. На дороге налётчик.':'На шорох вышел слепой пёс.');return true;
}
function winRareFight(){
 if(event.event47Combat){winFight47();return;}
 if(event.enemy==='huntAlpha'){state.kills[state.location]++;return rareFinish('Вожак повержен','Охота закончена. Редкий клык можно продать за 950 ₽ до бонусов базы.',{alphaFang:1,fang:1},35,5);}
 if(event.enemy==='raider'){state.money+=150;return rareFinish('Засада сорвана','Налётчик отступил. Найдено 150 ₽ и припасы.',{medkit:1,scrap:2},20,3);}
 state.kills[state.location]++;return rareFinish('Тень оказалась мутантом','Пёс больше не преследует тебя.',rollDogLoot(),12,1);
}
function rareStoryHTML(){
 if(!state.rare)return '';const r=state.rare,rescue=r.rescue&&r.rescue.stage!=='completed'?('Схрон · '+({coordinates:'координаты получены',locked:'ключ у техника',key:'ключ готов'}[r.rescue.stage])+' · '+LOCATIONS[r.rescue.location].name):'',hunt=r.hunt?'Охота · '+r.hunt.clues+'/2 следа · '+LOCATIONS[r.hunt.location].name:'',radio=r.radio?'Радиосигнал · '+LOCATIONS[r.radio.location].name:'';
 const lines=[rescue,hunt,radio].filter(Boolean),extra=event47StoryHTML();return lines.length||extra?'<div class="rare-story-notes"><span class="eyebrow">ЗАПИСКИ И СЛЕДЫ</span>'+lines.map(s=>'<p>'+s+'</p>').join('')+extra+'</div>':'';
}
function rareArtKey(){if(event?.enemy==='raider')return 'raider48-background';return event?.rareArt||(isEvent47()?'event47-'+event47Definition().art:null)||({rescueCache:'trappedCache',radioFollow:event?.variant==='survivor'?'wounded':'radioSignal',huntClue:'mutantTracks'}[event?.type])||(SPECIAL_KINDS.includes(event?.type)?event.type:null);}
function drawRareBackground(t){if(window.Emission52?.draw(t))return true;
 const key=rareArtKey();if(!key||!artReady('rare-'+key))return false;
 const image=WORLD_ART['rare-'+key],scale=Math.max(900/image.naturalWidth,800/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;
 ctx.save();if(event.enemy==='raider'&&key!=='raider48-background'&&t-event.flash<150)ctx.filter='brightness(1.35)';ctx.drawImage(image,(900-w)/2,(800-h)/2,w,h);
 if(event.type==='emission'){ctx.fillStyle='rgba(145,30,20,'+(.06+Math.sin(t*.009)*.025)+')';ctx.fillRect(0,0,900,800);if(event.phase==='sheltered'){ctx.fillStyle='#090d10b0';ctx.fillRect(0,0,900,800);}}
 if(event.type==='anomalyFog')for(let i=0;i<5;i++)ellipse(ctx,(t*.025+i*210)%1200-150,470+i*48,250,35,'#a5b8b010');ctx.restore();return true;
}
function rareButton(id,label,fn,disabled=false){return {html:'<button class="secondary" id="'+id+'" '+(disabled?'disabled':'')+'>'+label+'</button>',id,fn};}
function renderRareAction(){
 if(window.Emission52?.active())return window.Emission52.render();
 if(isEvent47()&&!event.resolved)return renderEvent47Action();
 if(!event||event.resolved||!isRareEvent()||event.rareCombat)return false;
 const e=event,actions=[],def=SPECIAL_EVENTS.find(d=>d.kind===e.type);let title=def?.title||rareStoryTitle(),desc='',mini='';
 const add=(id,label,fn,disabled=false)=>actions.push(rareButton(id,label,fn,disabled));
 if(e.type==='wounded'||e.type==='radioFollow'&&e.variant==='survivor'){title=e.reunion?'Старый знакомый':title;desc=e.reunion?'Спасённый сталкер узнал тебя и зовёт подойти.':'Одиночка прижимает перевязку к боку. Ему нужна аптечка.';add('rare-help',e.reunion?'Подойти к знакомому':'Помочь · аптечка ×1',helpWounded,!e.reunion&&!state.items.medkit);if(e.type==='wounded'&&!e.reunion)add('rare-search','Забрать вещи · −5 реп.',searchWounded);}
 else if(e.type==='trappedCache'){desc=e.phase==='trap'?'Останови индикатор в зелёной зоне. Ошибка активирует растяжку.':'Тонкая проволока уходит под рюкзак. Схрон можно обезвредить.';if(e.phase==='trap'){mini='<div class="rare-meter" role="progressbar" aria-label="Индикатор обезвреживания"><span></span><i id="rareTrapNeedle" style="left:'+trapPosition()*100+'%"></i></div>';add('rare-stop','Снять растяжку',stopTrap);}else add('rare-trap','Осмотреть растяжку',beginTrap);}
 else if(e.type==='radioSignal'){desc='Сквозь помехи слышен зов. Координаты ведут в сторону от основной тропы.';add('rare-follow-radio','Идти на сигнал · −'+staminaCost(6),followRadio);}
 else if(e.type==='radioFollow'){desc='Под навесом никого. На ящике осталась записка и несколько вещей.';add('rare-radio-cache','Осмотреть лагерь',collectRadioCache);}
 else if(e.type==='emission'){desc=e.phase==='sheltered'?'Укрытие держит удар. Здесь безопасно: подождём, пока стихнет.':'Небо краснеет. Выбирай укрытие или уходи с открытой дороги.';mini='<div class="rare-countdown"><b id="rareTimer">'+Math.max(0,Math.ceil(((e.phase==='sheltered'?e.shelterUntil:e.deadlineAt)-Date.now())/1000))+'</b><span>сек.</span></div>';if(e.phase!=='sheltered'){add('rare-shelter','В ближайший подвал',enterEmissionShelter);add('rare-dash','Через аномалии · −'+staminaCost(18),dashThroughEmission);}}
 else if(e.type==='anomalyFog'){
  desc=e.phase==='memorize'?'Запомни порядок ориентиров. Потом он исчезнет.':e.phase==='recall'?'Выбирай ориентиры в том же порядке. Шаг '+(e.answer+1)+' из 3.':'Туман скрывает тропу. Можно запомнить ориентиры или переждать.';
  if(e.phase==='memorize')mini='<div class="rare-memory">'+e.sequence.map(i=>'<span>'+FOG_MARKERS[i]+'</span>').join('<b>→</b>')+'</div><small class="rare-mini-hint">Запоминай…</small>';
  else if(e.phase==='recall')FOG_MARKERS.forEach((s,i)=>add('rare-marker-'+i,s,()=>chooseFogMarker(i)));
  else{add('rare-fog-start','Запомнить тропу',startFogMemory);add('rare-fog-wait','Переждать · −'+staminaCost(8),waitFog);}
 }
 else if(e.type==='rivalLoot'){desc='«Я первым нашёл. Но можем поделить… или обменяемся на аптечку?»';add('rare-share','Разделить находки',()=>shareRivalLoot(false));add('rare-exchange','Обменять аптечку ×1',()=>shareRivalLoot(true),!state.items.medkit);}
 else if(e.type==='nightShadow'){desc='Шорохи повторяют твои шаги. Кто-то идёт следом.';add('rare-shadow-turn','Обернуться',turnToShadow);add('rare-shadow-hurry','Ускориться · −'+staminaCost(12),hurryFromShadow);add('rare-shadow-hide',hasHeadlamp()?'Погасить фонарь и замереть':'Замереть в темноте',hideFromShadow);}
 else if(e.type==='mutantTracks'||e.type==='huntClue'){desc=e.type==='huntClue'?'Крупные следы снова видны. На коре свежие царапины.':'Необычные отпечатки ведут в чащу. Похоже, здесь ходит вожак.';add('rare-track','Идти по следам · −'+staminaCost(4),followMutantTracks);}
 else if(e.type==='rescueCache'){desc=state.rare.rescue?.stage==='key'?'Под рюкзаком тот самый замок. Ключ техника должен подойти.':'Координаты привели к тайнику. На нём старый замок.';add('rare-rescue-cache',state.rare.rescue?.stage==='key'?'Открыть ключом':'Осмотреть замок',inspectRescueCache);}
 setSceneInteraction('','<span class="eyebrow">'+(STORY_KINDS.includes(e.type)?'ЗАПИСКИ И СЛЕДЫ':'РЕДКАЯ ВСТРЕЧА')+'</span><h3>'+title+'</h3><p>'+desc+'</p>');
 const locked=['trap','memorize','recall'].includes(e.phase)||e.type==='emission';
 if(!locked)add('rare-pass',e.type==='huntClue'?'Прекратить охоту':'Пройти мимо',passRareEvent);
 add('escape',e.type==='emission'?'Уйти на базу':'На базу',escapeExpedition,e.phase==='sheltered');
 buttons(mini+'<div class="rare-options">'+actions.map(a=>a.html).join('')+'</div>');for(const a of actions)bind(a.id,a.fn);return true;
}
function updateRareEvent(t){
 if(!isRareEvent()||event.rareCombat||event.resolved||state.mode!=='expedition'||document.hidden)return;
 const e=event;
 if(window.Emission52?.active()){window.Emission52.update();return;}
 if(isEvent47()){updateEvent47(t);return;}
 if(e.type==='emission'){
  const end=e.phase==='sheltered'?e.shelterUntil:e.deadlineAt;if($('rareTimer'))$('rareTimer').textContent=Math.max(0,Math.ceil((end-Date.now())/1000));
  if(Date.now()>=end){if(e.phase==='sheltered'){rareFinish('Выброс прошёл','Укрытие защитило от фронта выброса.',{},10);}
   else if(rareDamage(30,20)){rareFinish('Фронт выброса настиг','Не успели укрыться: −30 HP и +20 радиации.');}return;}
 }
 if(exhaustionOpen||!$('modalBackdrop').hidden)return;
 if(e.phase==='trap'&&$('rareTrapNeedle'))$('rareTrapNeedle').style.left=(trapPosition(t)*100)+'%';
 if(e.phase==='memorize'&&t>=e.revealUntil){e.phase='recall';save();renderAction();}
}
function persistRareEvent(){
 if(!state.rare)return;if(state.mode!=='expedition'||!isRareEvent()&&!isNewEnemy()&&!window.Economy51?.persistentFight(event)){state.rare.pending=null;return;}
 const now=event.miniPauseAt??performance.now(),copy=JSON.parse(JSON.stringify(event));
 state.rare.pending={event:copy,age:Math.max(0,now-event.created),miniElapsed:event.phase==='trap'?Math.max(0,now-event.miniStart):0,revealLeft:event.phase==='memorize'?Math.max(0,event.revealUntil-now):0,combatLeft:event.combat?Math.max(0,event.combat.nextAt-now):0};
}
function restoreRareEvent(raw){
 const p=raw?.rare?.pending,e=p?.event;if(raw?.mode!=='expedition'||dungeonActive()||!e||!isRareEvent(e)&&!isNewEnemy(e)&&!window.Economy51?.persistentFight(e))return false;
 if(e.type==='emission'&&!e.emission52&&window.Emission52){window.Emission52.prepare(e);if(e.phase==='sheltered'){e.emission52.found=true;e.emission52.stage=e.emission52.occupants='empty';}}
 if(e.emission52&&window.Emission52&&!window.Emission52.validate(e))return false;
 if(!validateEvent47(e)||e.boss&&!LOCATIONS[state.location].boss)return false;
 if((e.rareCombat||e.persistFight||window.Economy51?.persistentFight(e))&&((![null,'raider','huntAlpha','shadowDog','ratMutant','bum','chupacabra'].includes(e.enemy)&&!isNewEnemy(e))||!Number.isFinite(e.hp)||e.hp<0||!Number.isFinite(e.maxHp)||e.maxHp<=0||e.maxHp>100000||e.hp>e.maxHp))return false;
 if(e.type==='anomalyFog'&&(!Array.isArray(e.sequence)||e.sequence.length!==3||new Set(e.sequence).size!==3||e.sequence.some(n=>![0,1,2].includes(n))))return false;
 if(e.type==='emission'&&(!Number.isFinite(e.deadlineAt)||e.deadlineAt>Date.now()+45000||e.phase==='sheltered'&&!Number.isFinite(e.shelterUntil)))return false;
 if(!['choice','trap','memorize','recall','sheltered'].includes(e.phase)&&!e.rareCombat&&!isNewEnemy(e)&&!window.Economy51?.persistentFight(e))return false;
 const now=performance.now();state.mode='expedition';event={...e,created:now-Math.min(60000,finiteCount(p.age)),weaponUntil:0};
 delete event.miniPauseAt;
 if(e.phase==='trap')event.miniStart=now-Math.min(60000,finiteCount(p.miniElapsed));if(e.phase==='memorize')event.revealUntil=now+Math.max(1000,Math.min(4500,finiteCount(p.revealLeft)));
 if(e.reload48&&!restoreReload48(e.reload48))event.reload48=null;
 if(e.combat&&['player','monster','recover','reload'].includes(e.combat.phase))event.combat={...e.combat,nextAt:now+Math.min(1200,finiteCount(p.combatLeft))};else event.combat=null;
 if(e.resolved)event.resumeAt=isRareEvent(e)?Infinity:now+2400;nextWalkAt=0;return true;
}
function renderRareResult(){setSceneInteraction('','<h3>'+event.resultTitle+'</h3><p>'+event.resultText+'</p>'+rewardHTML(event.loot||{}));buttons('<button class="primary" id="rare-continue">'+nextTravelLabel()+'</button><button class="secondary camp-bag" id="escape">На базу</button>');bind('rare-continue',()=>{if(state.mode==='expedition'&&isRareEvent()&&event.resolved&&!document.hidden)walk();});bind('escape',escapeExpedition);}
function rareAudioScene(){if(window.Storm56?.active())return 'rare-emission';if(!event||event.resolved||event.rareCombat)return null;if(isEvent47())return 'event47-'+event47Definition().art;return event.type==='emission'?(event.phase==='sheltered'?'rare-shelter':'rare-emission'):event.type==='anomalyFog'?'rare-fog':['radioSignal','radioFollow'].includes(event.type)?'rare-radio':event.type==='nightShadow'?'rare-shadow':null;}
function pauseRareMinigame(hidden){
 if(!isRareEvent()||event.resolved||!['trap','memorize'].includes(event.phase))return;
 const now=performance.now();if(hidden){if(event.miniPauseAt===undefined)event.miniPauseAt=now;}
 else if(event.miniPauseAt!==undefined){const gap=Math.max(0,now-event.miniPauseAt);if(event.phase==='trap')event.miniStart+=gap;else event.revealUntil+=gap;delete event.miniPauseAt;}
}
function drawRareMonster(t){
 if(event?.enemy!=='huntAlpha')return false;
 const dead=event.defeated,key=dead?'rare-huntAlpha-down':'rare-huntAlpha';if(!artReady(key))return false;
 const image=WORLD_ART[key],scale=Math.min(660/image.naturalWidth,(dead?330:460)/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;
 const lunge=dead?0:Math.max(0,1-(t-(event.attackAt??-10000))/420);
 ctx.save();ctx.translate(450,dead?710:705+Math.sin(t*.003)*2+lunge*20);ctx.scale(1+lunge*.1,1+lunge*.1);ellipse(ctx,0,-4,dead?260:210,22,'#050a0c88');if(!dead&&t-event.flash<150)ctx.filter='brightness(1.5)';ctx.drawImage(image,-w/2,-h,w,h);ctx.restore();return true;
}
