'use strict';
// Ordinary encounters share one probability roll: no competing independent rolls.
const ROAD_EVENTS=[['camp',.10],['stalkers',.20],['pump',.28],['well',.31],['patrol',.335]];
const BUTTON_EVENTS=['camp','stalkers','pump','well','patrol'];
const PATROL_APPROACH_MS=4000;
const PATROL_RESPONSE_MS=2000;
const TROPHIES={tail:{name:'Хвост собаки',price:70},fang:{name:'Клык собаки',price:110},collar:{name:'Именной ошейник',price:650}};
const EVENT_CELLS={stalkers:[0,0],pump:[1,0],well:[0,1],patrol:[1,1]};
for(const key of ['camp','encounters']){const img=new Image();img.src='assets/'+key+'-v7.png';WORLD_ART[key]=img;}
let campBagOpen=false;
function safeZone(){return state.mode==='base'||state.mode==='camp'||rareSheltered();}
function restActive(){return safeZone()||Date.now()<(Number(state.restUntil)||0);}
function restSeconds(){return safeZone()?60:Math.max(0,Math.ceil(((Number(state.restUntil)||0)-Date.now())/1000));}
function grantRest(){state.restUntil=Date.now()+60000;}
function staminaCost(n){return Math.round(n*(1-(window.Progression72?.buffs().stamina||0))*(restActive()?.75:1)*(['boots','bootsMk2'].includes(state.equipment.feet)?1-(state.upgrades.boots||0)*.02-(state.equipment.feet==='bootsMk2'?.1+(window.Gear78?.level('bootsMk2')||0)*.005:0):1)*100)/100;}
function healthRegenRate(){return restActive()?.5:safeZone()?1/3:0;}
function syncAudioScene(){
 const fighting=isCombatEncounter()&&event.battleStarted&&!event.resolved;
 const special=rareAudioScene();const scene=state.mode==='base'?'base':state.mode==='camp'||event?.type==='camp'?'camp':fighting?(dungeonActive()||isNight()||chupacabraDark()?'combat-night':'combat'):special|| (dungeonActive()?'dungeon':(isNight()?'road-night':'road'));
 AudioFX.setScene?.(scene,state.location,!!event&&!event.resolved&&!travelMotion);
}
function showLevelUp(){
 const el=$('levelToast');el.innerHTML=uiIcon('star')+'<span><small>НОВЫЙ УРОВЕНЬ</small><b>'+level()+'</b></span>';
 el.hidden=false;clearTimeout(showLevelUp.timer);showLevelUp.timer=setTimeout(()=>{el.hidden=true;},4200);AudioFX.play('levelUp');
}
function sickSeconds(){return Math.max(0,Math.ceil(((Number(state.diarrheaUntil)||0)-Date.now())/1000));}
function rollRoadEvent(){const r=Math.random(),kind=ROAD_EVENTS.find(([,limit])=>r<limit)?.[0]||null;return kind==='patrol'&&Number.isFinite(state.lastPatrolExpedition)&&(state.expeditionSerial||0)-state.lastPatrolExpedition<2?null:kind;}
function rollDogLoot(){
 // Exactly 1% full set; remaining categories include pairs and an empty result.
 const r=Math.random(),bonus=restActive()?.05:0;
 if(r<.01)return {tail:1,fang:1,collar:1};
 if(r<.015)return {collar:1};
 if(r<.02)return {tail:1,collar:1};
 if(r<.025)return {fang:1,collar:1};
 if(r<.105)return {tail:1,fang:1};
 if(r<.405+bonus/2)return {tail:1};
 if(r<.605+bonus)return {fang:1};
 return {};
}
function collectDogLoot(){const loot={};for(const [key,n]of Object.entries(rollDogLoot())){const got=addItem(key,n);if(got)loot[key]=got;}if(totalLoot(loot))AudioFX.play('loot');return loot;}
function prepareRoadEvent(){
 if(event.type==='stalkers'){
  const wants=['scrap','circuit','cloth','artifact','tail','fang','collar'];
  event.interest=wants[Math.floor(Math.random()*wants.length)];event.offer=salePrice(Math.ceil(ITEMS[event.interest].price*1.6));event.stock={medkit:3,vodka:3,energy:2};
 }
 if(event.type==='patrol'){
  state.lastPatrolExpedition=state.expeditionSerial||0;save();
  event.night=isNight();event.needsLamp=event.night&&['headlamp','lampMk2'].includes(state.equipment.head);
  event.approachEnd=performance.now()+PATROL_APPROACH_MS;event.arrived=false;
  event.deadline=event.approachEnd+(event.night?PATROL_RESPONSE_MS:1500);AudioFX.play('patrol');
 }
 if(event.type==='camp')AudioFX.play('rest');
 const messages={camp:'За поворотом — костёр и палатка. Здесь можно перевести дух.',stalkers:'На обочине встретились одиночки. У них есть припасы и свой заказ.',pump:'У дороги сохранилась старая колонка с водой.',well:'Между дворами виднеется старый колодец.',patrol:event.night?'На дороге военный патруль. Не выдавай себя светом.':'Военный патруль заметил тебя. Дорогу перекрыли.'};
 if(messages[event.type])log(messages[event.type]);
}
function roadSpriteHTML(type){const [x,y]=EVENT_CELLS[type];return '<div class="road-portrait" style="background-position:'+x*100+'% '+y*100+'%" aria-hidden="true"></div>';}
function renderRoadAction(){
 if(!event||event.resolved||!Object.hasOwn(EVENT_CELLS,event.type)&&event.type!=='camp')return false;
 const kind=event.type;
 if(kind==='patrol'&&event.detained){setSceneInteraction('','<h3>Военный патруль</h3>');buttons('');return true;}
 const approaching=kind==='patrol'&&performance.now()<event.approachEnd;
 const info={camp:['Привал у дороги','Костёр, палатка и несколько минут тишины.'],stalkers:['Встречные сталкеры','«Есть припасы. А за '+ITEMS[event.interest]?.name.toLowerCase()+' хорошо заплатим».'],pump:['Колонка','Можно попить и восстановить всю выносливость.'],well:['Старый колодец','На дне темнеет вода. Ведро ещё держится на цепи.'],patrol:['Военный патруль',event.night?(event.needsLamp&&!event.lampDisabled?'Выключи фонарь, пока тебя не заметили!':'Не шуми. Патруль можно обойти.'): 'Патруль требует остановиться.']};
 const [title,description]=info[kind];
 setSceneInteraction('', '<span class="eyebrow">ВСТРЕЧА В ПУТИ</span><h3>'+title+'</h3><p>'+(approaching?'На дороге впереди силуэты. Военные приближаются…':description)+'</p>'+(!approaching&&kind==='patrol'&&event.needsLamp&&!event.lampDisabled?'<div class="patrol-timer"><b id="patrolCountdown">2.0</b><span>секунды до обнаружения</span></div>':''));
 const action=kind==='camp'?['event-rest','Остановиться у костра',enterCamp]:kind==='stalkers'?['event-trade','Поговорить',openRoadTrade]:kind==='pump'||kind==='well'?['event-drink','Попить воды',drinkRoadWater]:event.night?(event.needsLamp&&!event.lampDisabled?['event-lamp','Выключить фонарик',switchOffForPatrol]:['event-bypass','Обойти патруль',bypassPatrol]):null;
 buttons((action?'<button class="primary road-action" id="'+action[0]+'" '+(approaching?'disabled':'')+'>'+uiIcon(kind==='patrol'?'headlamp':kind==='camp'?'heart':'people')+' '+action[1]+'</button>':'')+(kind!=='patrol'?'<div class="road-secondary"><button class="secondary" id="event-pass">Пройти мимо</button><button class="secondary" id="escape">На базу</button></div>':'<p class="action-note">'+(approaching?'Патруль ещё вдалеке':event.night?'Тихо обойти патруль':'Возвращение на базу')+'</p>'));
 if(action)bind(action[0],action[2]);bind('event-pass',()=>resolve('Идём дальше','Встреча осталась позади.'));bind('escape',escapeExpedition);return true;
}
function enterCamp(){
 if(state.mode!=='expedition'||event?.type!=='camp'||event.resolved)return false;
 exhaustionOpen=false;exhaustionPending=null;closeModal();event=null;state.mode='camp';campBagOpen=false;stick.active=false;nextWalkAt=0;state.lastUpdate=Date.now();
 AudioFX.play('rest');save();render();log('Привал. Можно отдохнуть и проверить экипировку.');return true;
}
function renderCampAction(){
 setSceneInteraction('','<span class="eyebrow">БЕЗОПАСНЫЙ ПРИВАЛ</span><h3>У костра</h3><p>Отдых восстанавливает силы и здоровье. Радиация спадает на 2 в секунду.</p>');
 buttons('<button class="primary" id="camp-depart" '+(!expeditionLimitReached()&&(state.energy<staminaCost(8)||sickSeconds())?'disabled':'')+'>'+uiIcon('walk')+' '+'Отправиться в путь'+'</button><button class="secondary camp-bag" id="camp-bag">'+uiIcon('backpack')+' '+(campBagOpen?'Закрыть рюкзак':'Рюкзак · экипировка')+'</button><p class="action-note">'+(sickSeconds()?'Плохое самочувствие: ещё '+sickSeconds()+' сек.':'Хороший отдых · ещё 1 минута после выхода')+'</p>');
 bind('camp-depart',leaveCamp);bind('camp-bag',()=>{campBagOpen=!campBagOpen;AudioFX.play(campBagOpen?'inventory':'close');render();});
}
function leaveCamp(){
 if(state.mode==='camp'&&expeditionLimitReached()){finishExpeditionRoute();return true;}
 if(state.mode!=='camp'||sickSeconds()||state.energy<staminaCost(8))return false;
 closeModal();campBagOpen=false;grantRest();state.mode='expedition';event=null;AudioFX.play('depart');walk();log('Отдохнули. Продолжаем прежний маршрут.');return true;
}
function roadTradeValid(){return state.mode==='expedition'&&event?.type==='stalkers'&&!event.resolved;}
function openRoadTrade(){
 if(!roadTradeValid())return false;
 const key=event.interest;
 openModal(roadSpriteHTML('stalkers')+'<span class="eyebrow">ТОРГОВЛЯ В ПУТИ</span><h2 id="modalTitle">Одиночки</h2><p>«Нужен только '+ITEMS[key].name.toLowerCase()+'. Остальное не берём».</p><button class="road-order" id="road-sell" '+(!state.items[key]?'disabled':'')+'>'+itemIcon(key)+'<span><b>'+ITEMS[key].name+'</b><small>В рюкзаке: '+state.items[key]+' · нажми, чтобы выбрать количество</small></span><strong>'+event.offer+' ₽</strong></button><h3>Припасы для дороги</h3><div class="road-shop">'+Object.entries(SHOP).map(([k,v])=>'<button class="gear-choice" id="road-buy-'+k+'" '+(!event.stock[k]||state.money<servicePrice(v.price)||state.items[k]>=capacity()?'disabled':'')+'>'+itemIcon(k)+'<div><b>'+ITEMS[k].name+'</b><small>'+v.effect+' · осталось '+event.stock[k]+'</small></div><strong>'+servicePrice(v.price)+' ₽</strong></button>').join('')+'</div><div class="buyer-balance">Твой баланс <b>'+state.money+' ₽</b></div><button class="secondary camp-bag" id="trade-continue">Попрощаться и идти дальше</button>');
 modalNpc=null;bind('road-sell',()=>sellRoadItem());for(const key of Object.keys(SHOP))bind('road-buy-'+key,()=>buyRoadItem(key));bind('trade-continue',()=>{closeModal();resolve('До встречи','Попрощались с одиночками и продолжили путь.');});return true;
}
function sellRoadItem(amount=null,confirmed=false){
 if(!roadTradeValid()||state.items[event.interest]<=0)return false;
 const key=event.interest,uses=questItemUses(key);
 if(amount===null)return selectQuantity(key,state.items[key],'Продать',n=>sellRoadItem(n),openRoadTrade,event.offer);
 if(!Number.isInteger(amount)||amount<1||amount>state.items[key])return false;
 if(uses.length&&!confirmed){
  openModal('<span class="eyebrow">КВЕСТОВЫЙ ПРЕДМЕТ</span><h2 id="modalTitle">ВЫ УВЕРЕНЫ?</h2><p>'+ITEMS[key].name+' ×'+amount+' используется для квеста: '+uses.join(', ')+'.</p><button class="primary" id="quest-sale-confirm">Всё равно продать</button><button class="secondary" id="quest-sale-cancel">Отмена</button>');
  bind('quest-sale-confirm',()=>sellRoadItem(amount,true));bind('quest-sale-cancel',openRoadTrade);return false;
 }
 state.items[key]-=amount;state.money+=event.offer*amount;AudioFX.play('coin');save();render();openRoadTrade();return true;
}
function buyRoadItem(key){
 if(!roadTradeValid()||!Object.hasOwn(SHOP,key)||!event.stock[key]||state.money<servicePrice(SHOP[key].price)||state.items[key]>=capacity())return false;
 if(!addItem(key,1))return false;state.money-=servicePrice(SHOP[key].price);event.stock[key]--;AudioFX.play('coin');save();render();openRoadTrade();return true;
}
function drinkRoadWater(){
 if(state.mode!=='expedition'||!event||event.resolved||!['pump','well'].includes(event.type))return false;
 AudioFX.play('water');
 if(event.type==='pump'){state.energy=100;resolve('Свежая вода','Напились из колонки. Выносливость полностью восстановлена.');return true;}
 state.diarrheaUntil=Date.now()+60000;state.energy=0;state.hp=Math.max(1,state.hp-15);
 returnToBase('Грязная вода: отравление и срачка. Вылазка прервана.');
 openModal('<div class="illness-art">'+roadSpriteHTML('well')+'</div><span class="eyebrow">НЕУДАЧНЫЙ ГЛОТОК</span><h2 id="modalTitle">Грязная вода</h2><p>Живот скрутило. Пришлось вернуться в безопасную зону.</p><div class="quest"><b>Срачка · 60 секунд</b><p>Выносливость полностью потеряна. Пока не станет лучше, выйти в дорогу нельзя.</p></div><button class="primary" id="sick-rest">Отлежаться</button>','tired');bind('sick-rest',closeModal);return true;
}
function capturePatrol(){
 if(state.mode!=='expedition'||event?.type!=='patrol'||event.resolved)return false;
 if(event.detained&&!$('modalBackdrop').hidden&&$('modalBody').innerHTML.includes('id="patrol-bribe"'))return true;
 event.detained=true;const price=100*level();
 openModal(roadSpriteHTML('patrol')+'<h2 id="modalTitle">Военный патруль</h2><p>Сдай припасы и возвращайся на базу или заплати, чтобы продолжить путь.</p><div class="rare-options"><button class="secondary" id="patrol-surrender">Сдаться</button><button class="primary" id="patrol-bribe" '+(state.money<price?'disabled':'')+'>Откупиться · '+price+' ₽</button></div>'+(state.money<price?'<p>Недостаточно денег для взятки.</p>':''),'open');
 $('closeModal').hidden=true;bind('patrol-surrender',surrenderPatrol);bind('patrol-bribe',payPatrolBribe);save();updateTopActions();return true;
}
function switchOffForPatrol(){
 if(state.mode!=='expedition'||event?.type!=='patrol'||event.resolved||event.detained||!event.night||!event.needsLamp||document.hidden)return false;
 if(performance.now()<event.approachEnd)return false;
 if(performance.now()>=event.deadline){capturePatrol();return false;}
 event.lampDisabled=true;AudioFX.play('click');resolve('Свет погашен','Замерли в темноте и обошли патруль. За поворотом можно снова включить фонарь.');return true;
}
function bypassPatrol(){
 if(state.mode!=='expedition'||event?.type!=='patrol'||event.resolved||event.detained||!event.night||document.hidden||performance.now()<event.approachEnd||event.needsLamp&&!event.lampDisabled)return false;
 resolve('Патруль позади','Без света тебя не заметили. Продолжаем путь.');return true;
}
function updateRoadEvents(t){
 if(event?.type!=='patrol'||event.resolved||state.mode!=='expedition')return;
 if(event.detained)return;
 if(t<event.approachEnd)return;
 if(!event.arrived){event.arrived=true;AudioFX.play('patrol');renderAction();}
 if(!event.night||event.needsLamp&&!event.lampDisabled){
  if(t>=event.deadline){capturePatrol();return;}
  const timer=$('patrolCountdown');if(timer)timer.textContent=Math.max(0,(event.deadline-t)/1000).toFixed(1);
 }
}
function drawCamp(t){
 if(!artReady('camp'))return false;
 const img=WORLD_ART.camp,scale=Math.max(900/img.naturalWidth,800/img.naturalHeight),w=img.naturalWidth*scale,h=img.naturalHeight*scale;
 ctx.drawImage(img,(900-w)/2,(800-h)/2,w,h);
 const glow=ctx.createRadialGradient(450,620,12,450,620,180);glow.addColorStop(0,'rgba(245,145,62,'+(.08+Math.sin(t*.009)*.025)+')');glow.addColorStop(1,'rgba(245,145,62,0)');ctx.fillStyle=glow;ctx.fillRect(250,410,400,380);
 for(let i=0;i<5;i++){const y=(t*.027+i*28)%145;ellipse(ctx,450+Math.sin(t*.002+i)*25,620-y,1.4,2,'#f3ba7960');}return true;
}
function drawRoadSprite(t){
 if(!event||!Object.hasOwn(EVENT_CELLS,event.type)||!artReady('encounters'))return;
 const img=WORLD_ART.encounters,[x,y]=EVENT_CELLS[event.type],sw=img.naturalWidth/2,sh=img.naturalHeight/2;
 const patrol=event.type==='patrol',p=patrol?patrolApproachProgress(t):1;
 const scale=patrol ? .32+p*.68 : Math.min(1,Math.max(.84,.84+(t-event.created)/4000));
 ctx.save();ctx.translate(450,patrol?420+p*120:540);ctx.scale(scale,scale);ellipse(ctx,0,158,220,24,'#070b0d66');ctx.drawImage(img,x*sw,y*sh,sw,sh,-260,-310,520,520);ctx.restore();
}
function patrolApproachProgress(t){
 if(event?.type!=='patrol')return 1;
 const p=Math.max(0,Math.min(1,(t-event.created)/PATROL_APPROACH_MS));return p*p*(3-2*p);
}
