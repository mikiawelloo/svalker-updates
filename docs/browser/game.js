'use strict';
const $=id=>document.getElementById(id);
const SAVE_KEY='last-signal-zone-v2';
const EXPEDITION_TURN_LIMIT=30;
function expeditionTurns(){return Math.min(EXPEDITION_TURN_LIMIT,Math.max(0,Math.floor(Number(state.expeditionTurns)||0)));}
function expeditionLimitReached(){return !dungeonActive()&&expeditionTurns()>=EXPEDITION_TURN_LIMIT;}
function nextTravelLabel(){return 'Идти дальше';}
const ITEMS={scrap:{name:'Металлолом',price:12},circuit:{name:'Электроника',price:30},cloth:{name:'Ткань',price:8},artifact:{name:'Искра',price:140},medkit:{name:'Аптечка',price:25},vodka:{name:'Бутылка водки',price:15},energy:{name:'Энергетик',price:20}};
Object.assign(ITEMS,TROPHIES,RARE_ITEMS,ANOMALY_ITEMS,SPECIAL_ITEMS,ENEMY_ITEMS,typeof P72_ITEMS!=='undefined'?P72_ITEMS:{});
const REGION_NAME='Тихая гавань';
const SHOP={medkit:{price:400,effect:'+40 здоровья · остановит кровотечение'},vodka:{price:300,effect:'−40 радиации'},energy:{price:1000,effect:'+50 выносливости · 1 раз за вылазку'}};
const LOCATIONS=[
 {name:'Тихая гавань',level:1,area:'Заросшая тропа',color:'#72a798',goal:10,boss:null},
 {name:'Старый завод',level:5,area:'Промышленная окраина',color:'#aa8ca6',boss:{name:'Ржавая пасть',hp:160,attack:10}},
 {name:'Стеклянные болота',level:10,area:'Туманная низина',color:'#739dad',boss:{name:'Болотный страж',hp:220,attack:12}},
 {name:'Затихший радиоузел',level:15,area:'Лес мёртвых частот',color:'#8d8faf',boss:{name:'Радиоэхо',hp:320,attack:14}},
 {name:'Забытый район',level:30,area:'Руины старого города',color:'#a78f80',boss:{name:'Смотритель',hp:460,attack:17}}
];
const GEAR={
 pistol:{slot:'weapon',name:'Походный пистолет',desc:'Два выстрела за ход. Точность, урон и надёжность повышаются у техника.'},
 jacket:{slot:'body',name:'Куртка одиночки',armor:2,desc:'Плотная куртка. Снижает урон от каждой атаки на 2.'},
 boots:{slot:'feet',name:'Походные ботинки',desc:'Потёртые, но крепкие. Подходят для долгих вылазок.'},
 pack:{slot:'back',name:'Походный рюкзак',desc:'Вмещает от 20 предметов каждого вида. Не защищает от излучения артефактов.'},
 container:{slot:'back',name:'Защитный контейнер',desc:'Блокирует радиацию артефактов. Занимает слот рюкзака. До 5 предметов каждого вида.'},
 stalkerPack:{slot:'back',name:'Сталкерский ранец',desc:'Рюкзак со встроенным контейнером. Блокирует излучение артефактов, сохраняет вместимость и улучшения рюкзака.'},
 gasmask:{slot:'mask',name:'Противогаз',desc:'Снижает получение радиации рядом с аномалией на 60%. Излучение предметов требует контейнера.'},
 headlamp:{slot:'head',name:'Налобный фонарик',desc:'Ночью освещает круг перед собой и сохраняет дневные шансы попадания, добычи и поиска артефакта.'}
};
Object.assign(GEAR,ADVANCED_GEAR,VISOR_GEAR,typeof P72_GEAR!=='undefined'?P72_GEAR:{});
const SLOTS={head:'Голова',mask:'Маска',body:'Тело',back:'Спина',weapon:'Оружие',feet:'Обувь',...(window.Progression72?{belt:'Пояс'}:{})};
function starterEquipment(){return{head:null,mask:null,body:'jacket',back:'pack',weapon:'pistol',feet:'boots'};}
function initialState(){return{energy:100,hp:100,xp:0,rep:0,money:120,weapon:1,items:{scrap:0,circuit:0,cloth:0,tail:0,fang:0,collar:0,artifact:0,medkit:1,vodka:0,energy:0},quest:'available',location:0,steps:0,artifactsCaught:0,cratesSearched:0,lastUpdate:Date.now(),mode:'base',diarrheaUntil:0,restUntil:0,radiation:0,energyDrinkUsed:false,kills:[0,0,0,0,0],bossDefeated:[false,false,false,false,false],equipment:starterEquipment(),ownedGear:['pistol','jacket','boots','pack']};}
let state=initialState(),loadedRaw=null;
try{const raw=JSON.parse(localStorage.getItem(SAVE_KEY));if(raw){loadedRaw=raw;state={...state,...raw,items:{...state.items,...raw.items}};state.energy=Math.max(0,Math.min(100,Number(state.energy)||0));state.hp=Math.max(1,Math.min(300,Number(state.hp)||100));if(raw.mode==='expedition')state.guideVisit=null;state.mode=raw.mode==='camp'?'camp':'base';state.lastUpdate=Date.now();}}catch{}
initPlayerXP(loadedRaw);
// Add new progression and equipment fields without resetting existing loot, quests or upgrades.
state.restUntil=Math.max(0,Number(state.restUntil)||0);
state.diarrheaUntil=Math.max(0,Number(state.diarrheaUntil)||0);
state.radiation=Math.max(0,Math.min(100,Number(state.radiation)||0));
state.energyDrinkUsed=state.energyDrinkUsed===true;
state.expeditionTurns=loadedRaw&&['expedition','camp'].includes(loadedRaw.mode)?expeditionTurns():0;
state.routeEnd=loadedRaw?.mode==='expedition'&&loadedRaw.routeEnd===true&&expeditionTurns()>=EXPEDITION_TURN_LIMIT;
state.kills=LOCATIONS.map((_,i)=>Math.max(0,Math.floor(Number(state.kills?.[i])||0)));
state.bossDefeated=LOCATIONS.map((_,i)=>state.bossDefeated?.[i]===true);
state.equipment={...starterEquipment(),...state.equipment};
state.ownedGear=Array.isArray(state.ownedGear)?state.ownedGear.filter(key=>Object.hasOwn(GEAR,key)):['pistol','jacket','boots','pack'];
state.playTime=Number.isFinite(Number(state.playTime))?Math.max(0,Number(state.playTime))%480:0;
if(!state.guideVisit||!Number.isInteger(state.guideVisit.origin)||!Number.isInteger(state.guideVisit.target)||state.guideVisit.origin<0||state.guideVisit.origin>=LOCATIONS.length||state.guideVisit.target<0||state.guideVisit.target>=LOCATIONS.length||typeof state.guideVisit.variant!=='boolean')state.guideVisit=null;
if(!state.visitAftermath||!Number.isFinite(state.visitAftermath.money)||!Number.isFinite(state.visitAftermath.count))state.visitAftermath=null;
// Migrate old upgrades without losing progress; a new pistol deals 5 damage per shot.
const clampUpgrade=n=>Math.max(0,Math.min(10,Math.floor(Number(n)||0)));
state.upgrades={damage:clampUpgrade(Math.max(0,(Number(state.weapon)||1)-1)),accuracy:0,reliability:0,pack:0,container:0,armor:0,...state.upgrades};
for(const key of Object.keys(state.upgrades))state.upgrades[key]=clampUpgrade(state.upgrades[key]);
state.bleeding=Math.max(0,Math.min(30,Number(state.bleeding)||0));
for(const key of Object.keys(ITEMS))state.items[key]=Math.max(0,Math.floor(Number(state.items[key])||0));
for(const slot of Object.keys(SLOTS))if(state.equipment[slot]&&(!state.ownedGear.includes(state.equipment[slot])||GEAR[state.equipment[slot]]?.slot!==slot))state.equipment[slot]=null;
if(!Number.isInteger(state.location)||!unlocked(state.location))state.location=0;
window.Progression72?.init();initMagazine48(loadedRaw);initProgression(loadedRaw);initRareEvents(loadedRaw);initEnemyState();initDefeatState();
function weaponDamage(){return ['pistol','pistolMk2'].includes(state.equipment.weapon)?5+state.upgrades.damage*2+(state.equipment.weapon==='pistolMk2'?6:0)+(window.Progression72?.buffs().damage||0):0;}
// Intoxication: accuracy loses percentage points; one dose wears off every five minutes.
function alcoholDoses(){
 const now=Date.now(),n=Math.max(0,Math.min(6,Math.floor(Number(state.alcoholDoses)||0)));
 if(state.blackoutUntil>now)return n;
 if(state.blackoutUntil){state.blackoutUntil=0;state.alcoholDoses=0;state.alcoholAt=0;return 0;}
 const passed=Math.max(0,Math.floor((now-(state.alcoholAt||now))/300000));
 if(passed){state.alcoholDoses=Math.max(0,n-passed);state.alcoholAt=(state.alcoholAt||now)+passed*300000;}
 return Math.min(5,state.alcoholDoses||0);
}
function alcoholPenalty(){return [0,.02,.05,.10,.15,.20][alcoholDoses()]||0;}
function alcoholName(){return ['', 'Выпил','Напился','В дрова!','В щепки!','В говно!','Алкаш!'][Math.min(6,state.alcoholDoses||0)];}
function applyAlcoholDose(){
 const n=alcoholDoses();if(state.blackoutUntil>Date.now())return false;
 state.alcoholDoses=n+1;state.alcoholAt=Date.now();
 if(state.alcoholDoses>=6){
  state.blackoutUntil=Date.now()+60000;
  try{localStorage.setItem('svalker-test-blackout-until',String(state.blackoutUntil));}catch{}
  window.Alcohol?.sync();
 }else toast(alcoholName()+' · точность −'+Math.round(alcoholPenalty()*100)+'%');
 return true;
}
function weaponAccuracy(){const result=Math.max(.15,Math.min(.95+(state.equipment.weapon==='pistolMk2'?.03:0),.75+state.upgrades.accuracy*.025-(nightPenalty() ? .25 : 0)+(restActive()?.10:0)+(state.equipment.weapon==='pistolMk2'?.03:0))-alcoholPenalty()+(window.Progression72?.buffs().accuracy||0));return Math.min(.98,result);}
function weaponJamChance(){return Math.max(.01,.12-state.upgrades.reliability*.01-(state.equipment.weapon==='pistolMk2'?.01:0));}
function armor(){return Math.max(0,Object.values(state.equipment).reduce((n,key)=>n+(GEAR[key]?.armor||0),0)+(['jacket','armorMk2'].includes(state.equipment.body)?state.upgrades.armor:0)-(state.mode==='expedition'?state.events47?.rainWear||0:0)+(window.Progression72?.buffs().armor||0)+(state.equipment.body==='armorMk2'?(window.Gear78?.level('armorMk2')||0)*.5:0)+(state.equipment.body==='frame72'?(state.p72?.frameLevel||0):0));}
function capacity(back=state.equipment.back){if(window.Progression72&&back==='pack72')return 120+state.upgrades.pack*10+(state.p72?.packLevel||0)*15;return ['pack','stalkerPack','packMk2'].includes(back)?20+state.upgrades.pack*10+(back==='packMk2'?50+(window.Gear78?.level('packMk2')||0)*4:0):5;}
function canEquipBack(key){return Object.values(state.items).every(n=>n<=capacity(key));}
function addItem(key,amount){const accepted=Math.max(0,Math.min(amount,capacity()-state.items[key]));state.items[key]+=accepted;return accepted;}
function inventoryRadiationRate(){return ['container','stalkerPack','packMk2','pack72'].includes(state.equipment.back)?0:state.items.artifact*.5+(state.items.artifactX||0);}
function radiationRate(){if(safeZone())return 0;return inventoryRadiationRate()+(state.mode==='expedition'&&event?.type==='anomaly'&&!window.Progression72?.region()?((['maskMk2','visorMask72'].includes(state.equipment.mask)||state.equipment.mask?.startsWith('mask72'))?(state.equipment.mask==='maskMk2'?.2-(window.Gear78?.level('maskMk2')||0)*.01:.2):state.equipment.mask==='gasmask'?Math.max(.4,.8-state.upgrades.mask*.04):2):0);}
function cleared(i){return i===0?state.kills[0]>=10:state.bossDefeated[i]===true;}
function objective(i){return i===0?'Уничтожить 10 мобов · '+Math.min(10,state.kills[0])+'/10':'Победить босса «'+LOCATIONS[i].boss.name+'»';}
let tab='characters',event=null,walkStarted=0,nextWalkAt=0,bag=[],round=0,lastFrame=0,lastSave=0,resultUntil=0,sound=AudioFX.settings?.().enabled??true,audio=null,modalNpc=null,stick={x:450,y:580,active:false},stickDown=false,dragPointer=null,firstCrate=state.cratesSearched===0;
let modalReturn=null,barShopProduct=null;
let exhaustionAt=0,exhaustionOpen=false,exhaustionPending=null,lastStepSound=0,lastDetectorSound=0;
const canvas=$('scene'),ctx=canvas.getContext('2d');
let journal='«Держись дороги. И не трогай то, что светится. Хотя… решай сам».';
function save(){try{window.Storm56?.persist();persistRareEvent();persistLabCombat();persistPatrolChoice();state.lastUpdate=Date.now();localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch{journal='Сохранение недоступно в этом браузере. Оставь вкладку открытой.';}}
function level(){return xpProgress().level;}
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('show'),2800);}
function log(text){journal=text;$('journalText').textContent=text;}
function addXP(n){const before=level();state.xp+=n;if(level()>before)showLevelUp();}
function totalItems(){return Object.values(state.items).reduce((a,b)=>a+b,0);}
function updateVitalGauge(key,value){
 const amount=Math.max(0,Math.min(100,Number(value)||0));$(key+'Fill').style.strokeDashoffset=String((100-amount)/100*(2*Math.PI*42));$(key+'Meter').setAttribute('aria-valuenow',Math.round(amount));
}
function updateVitals(){ $('energyLabel').textContent=Math.floor(state.energy);updateVitalGauge('energy',state.energy);$('healthValue').textContent=Math.ceil(state.hp);updateVitalGauge('health',state.hp/(window.Progression72?.maxHealth()||100)*100);$('energyHint').textContent=sickSeconds()?'Срачка · до выхода '+sickSeconds()+' сек.':safeZone()?(state.energy>=100?'Полная выносливость · можно выходить':'До полной: '+Math.ceil((100-state.energy)*.6/staminaRecoveryMultiplier())+' сек. отдыха'):'Движение: −'+staminaCost(event47TravelCost())+' выносливости · на маршруте не восстанавливается';$('level').textContent=level();updateProgressionUI();$('money').textContent=state.money;updateTopActions();$('inventoryCount').textContent=totalItems();updateRadiationUI();updateEffectIcons();updateDayUI();updateDamageOverlays(); }
function spend(n,resume=null){n=staminaCost(n);if(exhaustionOpen)return false;if(state.energy<n){if(state.mode==='expedition')showExhaustion(resume);else toast('Нужно немного отдохнуть на базе.');return false;}state.energy=Math.max(0,state.energy-n);updateVitals();return true;}
function buttons(html){$('actionPanel').innerHTML=html;}
function bind(id,fn){const el=$(id);if(el)el.onclick=function(e){if(el.disabled)return;const choice=!!event&&!isCombatEncounter()&&id!=='escape';const result=fn.call(this,e);if(choice&&result!==false){const target=$(id);target?.classList.add('choice-selected52');if(target)target.setAttribute('aria-pressed','true');}return result;};}
function renderSceneLabels(){
 window.Hubs62?.sync();const base=state.mode==='base';$('gameRoot').classList.toggle('on-expedition',!base);$('gameRoot').classList.toggle('on-camp',state.mode==='camp');$('gameRoot').classList.toggle('on-dungeon',dungeonActive());
 $('sceneTop').hidden=!base;$('sceneCaption').hidden=true;$('mapButton').hidden=false;updateTopActions();$('encounterTag').hidden=true;
 for(const id of ['sceneLabel','sceneEyebrow','sceneTitle','sceneDesc'])$(id).textContent='';
}
function render(){updateVitals();renderSceneLabels();renderAction();renderTab();renderSupplies();$('journalText').textContent=journal;}
function renderAction(){
 syncAudioScene();
 if(state.mode==='camp'){renderCampAction();return;}
 if(state.mode==='base'){
  setSceneInteraction(window.Hubs62?.hint()||'');buttons('<button class="primary" id="depart">'+uiIcon('walk')+' ВЫЛАЗКА <span class="departure-cost">−'+staminaCost(8)+'</span><span class="arrow">'+uiIcon('right')+'</span></button>'+(LOCATIONS[state.location].boss&&!cleared(state.location)?'<button class="secondary boss-route" id="bossRoute">'+uiIcon('weapon')+' К боссу · '+LOCATIONS[state.location].boss.name+'</button>':''));bind('depart',()=>startExpedition());bind('bossRoute',()=>startExpedition('boss'));window.Hubs62?.sync();return;
 }
 renderExpeditionAction();window.Storm56?.actions();
}

function rewardHTML(loot){return '<div class="reward">'+Object.entries(loot).filter(([,n])=>n>0).map(([k,n])=>'<span>'+itemIcon(k)+' '+ITEMS[k].name+' +'+n+'</span>').join('')+'</div>';}
function questTrackerHTML(){
 return (dungeonActive()?'<div class="quest"><b>Подземная лаборатория</b><p>Ищи ящики и материалы для снаряжения II.</p></div>':!cleared(state.location)?'<div class="quest"><b>Зачистка</b><p>'+objective(state.location)+'</p></div>':'')+activeQuestHTML()+rareStoryHTML();
}
function renderExpeditionQuest(){const panel=$('activeQuest');panel.hidden=true;panel.innerHTML='';}
function renderTab(){
 if(state.mode==='camp'){for(const id of ['journalPanel','baseNav','baseFooter'])$(id).hidden=true;$('baseContent').hidden=playerModalVisible||!campBagOpen;renderExpeditionQuest();if(playerModalVisible){$('tabContent').innerHTML='';renderBackpack('playerContent');}else if(campBagOpen){$('sectionTitle').textContent='Персонаж и рюкзак';$('sectionBadge').textContent=totalItems()+' предметов';renderBackpack();}else $('tabContent').innerHTML='';return;}
 const expedition=state.mode==='expedition';$('baseContent').hidden=true;$('baseNav').hidden=expedition;$('baseFooter').hidden=true;$('journalPanel').hidden=true;renderExpeditionQuest();$('tabContent').innerHTML='';
 const visible=!$('modalBackdrop').hidden;$('inventoryTab').classList.toggle('active',visible&&tab==='inventory');
 if(!expedition&&playerModalVisible)renderBackpack('playerContent');
}

function slotHTML(slot){const item=GEAR[state.equipment[slot]];return '<button class="equip-slot slot-'+slot+' '+(item?'filled':'')+'" id="slot-'+slot+'" aria-label="Открыть слот: '+SLOTS[slot]+'"><small>'+SLOTS[slot]+'</small><span class="equip-symbol">'+(item?itemIcon(state.equipment[slot]):uiIcon('plus'))+'</span>'+(item?'':'<b>Пусто</b>')+'</button>';}
function renderBackpack(targetId='tabContent'){
 $(targetId).innerHTML='<div class="equipment-board">'+Object.keys(SLOTS).map(slotHTML).join('')+'<div class="survivor-avatar"><canvas id="survivor" width="260" height="380" aria-label="Твой персонаж в экипировке"></canvas><span>ОДИНОЧКА</span></div></div><div class="equipment-stats"><span>'+uiIcon('weapon')+' Урон <b>'+weaponDamage()+'</b></span><span>'+uiIcon('shield')+' Защита <b>'+armor()+'</b></span><span>'+uiIcon('heart')+' Здоровье <b>'+Math.ceil(state.hp)+'</b></span></div><div class="section-heading"><h3>Содержимое инвентаря</h3><span>'+totalItems()+' предметов</span></div><p class="inventory-help">Нажми на предмет, чтобы узнать, где его добыть и для чего он нужен.</p><div class="inventory-grid">'+Object.entries(ITEMS).filter(([k])=>state.items[k]>0).map(([k,v])=>'<button class="item-card backpack-item" id="bag-'+k+'"><span class="qty">×'+state.items[k]+'</span><span class="item-icon">'+itemIcon(k)+'</span><b>'+v.name+'</b><small>'+(window.ItemInfo79?.short(k)||newEnemyItemDetails(k)||window.Progression72?.itemDetails(k)||{scrap:'Для крафта',circuit:'Для улучшений',cloth:'Для аптечки',artifact:artifactDetails(),medkit:'40 здоровья · остановит кровь',vodka:'Убирает 40 радиации',energy:'+50 выносливости · 1 раз за вылазку',tail:'Трофей · можно продать',fang:'Трофей · можно продать',collar:'Редкий трофей · именной ошейник',tarpaulin:'Снаряжение II · 300 ₽',radioParts:'Снаряжение II · 650 ₽',weaponParts:'Снаряжение II · 1000 ₽',anomalousComponent:'Редкий компонент · для визора',artifactX:'+5% уклонения и восстановления сил',alphaFang:'Редкий трофей · 950 ₽'}[k]||'Региональная находка')+'</small></button>').join('')+'</div>'+(!totalItems()?'<p class="inventory-help">Пока пусто. Найди припасы на вылазке.</p>':'')+'<button class="secondary backpack-heal" id="useMedkit" '+(state.items.medkit<=0||(state.hp>=(window.Progression72?.maxHealth()||100)&&state.bleeding<=0)?'disabled':'')+'>Использовать аптечку · +40 здоровья</button>';
 $(targetId).innerHTML+=event47ParcelsHTML()+(window.Progression72?'<button class="secondary p72-artifacts-button" id="p72-artifacts">Артефакты · пояс '+(state.p72?.beltLevel||0)+'/5</button>':'');bind('p72-artifacts',()=>window.Progression72?.openArtifacts());
 drawSurvivor($('survivor').getContext('2d'));
 for(const slot of Object.keys(SLOTS))bind('slot-'+slot,()=>openEquipment(slot));
 for(const key of Object.keys(ITEMS))bind('bag-'+key,()=>{AudioFX.play('click');openItemDetails(key);render();});
 bind('useMedkit',()=>{useMedkit();render();});
}
function useMedkit(){
 if(consumableBusy()||event?.detained||state.items.medkit<=0||(state.hp>=(window.Progression72?.maxHealth()||100)&&state.bleeding<=0))return false;
 const beforeHP=state.hp;state.items.medkit--;state.hp=Math.min(window.Progression72?.maxHealth()||100,state.hp+40);state.bleeding=0;startConsumableMotion('medkit');spawnCombatPopup('+'+Math.ceil(state.hp-beforeHP),'heal','player');
 toast('Раны обработаны: +40 здоровья. Кровотечение остановлено.');save();updateVitals();return true;
}
function openEquipment(slot){
 if(!safeZone()||!Object.hasOwn(SLOTS,slot))return;
 const returnToPlayer=playerModalVisible||modalReturn===openPlayer;const current=state.equipment[slot],owned=state.ownedGear.filter(key=>GEAR[key].slot===slot);
 openModal('<span class="eyebrow">ЭКИПИРОВКА · '+SLOTS[slot].toUpperCase()+'</span><h2 id="modalTitle">'+(GEAR[current]?.name||'Пустой слот')+'</h2>'+(current?'<p>'+GEAR[current].desc+'<br><small>'+ (window.ItemInfo79?.gearSource(current)||'')+'</small>'+(slot==='weapon'?' Урон '+weaponDamage()+' · точность '+Math.round(weaponAccuracy()*100)+'% · клин '+Math.round(weaponJamChance()*100)+'%.':'')+'</p>':'<p>В этом слоте сейчас ничего не надето.</p>')+owned.map(key=>'<button class="gear-choice" id="gear-'+key+'"><span>'+itemIcon(key)+'</span><div><b>'+GEAR[key].name+'</b><small>'+GEAR[key].desc+'<br>'+(window.ItemInfo79?.gearSource(key)||'')+'</small></div><strong>'+(current===key?'НАДЕТО':'НАДЕТЬ')+'</strong></button>').join('')+(!owned.length?'<p>Подходящего снаряжения пока нет.</p>':'')+(current?'<button class="secondary" id="unequip" style="width:100%;margin-top:15px">Снять</button>':''));
 if(returnToPlayer)modalReturn=openPlayer;
 for(const key of owned)bind('gear-'+key,()=>{if(slot==='back'){if(!setBackEquipment(key))return;}else state.equipment[slot]=key;AudioFX.play('equip');save();render();openEquipment(slot);});
 bind('unequip',()=>{if(slot==='back'){if(!setBackEquipment(null))return;}else state.equipment[slot]=null;AudioFX.play('equip');save();render();openEquipment(slot);});
}
function openModal(html,openingSound='open'){pauseReload48();if(state.routeEnd&&!html.includes('id="route-end-return"'))return false;if(event?.detained&&!html.includes('id="patrol-bribe"'))return false;playerModalVisible=false;modalReturn=null;barShopProduct=null;guideTarget=null;if($('modalBackdrop').hidden&&!exhaustionOpen)AudioFX.play(openingSound);$('closeModal').hidden=exhaustionOpen;$('modalBody').innerHTML=html;$('modalBackdrop').hidden=false;document.body.style.overflow='hidden';$('closeModal').focus();}
function closeModal(){pauseReload48();if(state.routeEnd||exhaustionOpen||event?.detained)return;playerModalVisible=false;if(state.defeat){state.defeat=null;save();}modalReturn=null;barShopProduct=null;if(visitResultOpen){visitResultOpen=false;state.visitAftermath=null;save();}guideTarget=null;if(!$('modalBackdrop').hidden)AudioFX.play('close'); $('closeModal').hidden=false;$('modalBackdrop').hidden=true;document.body.style.overflow='';modalNpc=null;renderTab();}
function openNPC(i){if(state.mode!=='base')return;modalNpc=i;tab='characters';if(i===0)openBartender();else if(i===1)openBuyerInventory();else openTech();modalReturn=openPeople;renderTab();}

function openBuyerInventory(){
 if(state.mode!=='base')return;
 const found=Object.entries(ITEMS).filter(([key])=>state.items[key]>0);
 openModal('<span class="eyebrow">СКУПЩИК · ТВОЙ ИНВЕНТАРЬ</span><h2 id="modalTitle">Продать находки</h2><p class="buyer-hint">Нажми на предмет и выбери количество ползунком.</p><div class="inventory-grid buyer-grid">'+found.map(([key,item])=>'<button class="item-card sale-card" id="sell-'+key+'" aria-label="Продать '+item.name+' за '+salePrice(item.price)+' рублей"><span class="qty">×'+state.items[key]+'</span><span class="item-icon">'+itemIcon(key)+'</span><b>'+item.name+'</b><span class="sale-price">'+salePrice(item.price)+' ₽ <small>/ шт.</small></span></button>').join('')+'</div>'+(!found.length?'<div class="buyer-empty">Рюкзак пуст.<br><small>Найди что-нибудь на вылазке и возвращайся.</small></div>':'')+dungeonOfferHTML()+'<div class="buyer-balance"><span>Твой баланс</span><b>'+state.money+' ₽</b></div>');
 modalNpc=1;window.Hubs62?.decorate(1);modalReturn=openPeople;bind('dungeon-start',startDungeon);
 for(const [key]of found)bind('sell-'+key,()=>sellItem(key));
}
function questItemUses(key){
 const names=(state.activeQuests||[]).filter(q=>q.type==='fetch'&&q.item===key).map(q=>q.title);
 if(state.quest==='active'&&key==='scrap'&&!names.includes('Первый сигнал'))names.push('Первый сигнал');
 return names.length?names:['scrap','circuit','cloth','tail','fang','artifact','tarpaulin','radioParts','weaponParts'].includes(key)?['поручения бармена']:[];
}
function selectQuantity(key,max,title,confirm,back,unitPrice=salePrice(ITEMS[key].price)){
 max=Math.max(0,Math.floor(max));if(!max){toast('Нет места или предметов для перемещения.');return false;}
 openModal('<span class="eyebrow">'+title+'</span><h2 id="modalTitle">'+ITEMS[key].name+'</h2><div class="quantity-picker">'+itemIcon(key)+'<label for="item-quantity">Количество: <b id="quantity-value">1</b> / '+max+'</label><input id="item-quantity" type="range" min="1" max="'+max+'" value="1" step="1"><p id="quantity-total"></p></div><button class="primary" id="quantity-confirm">'+title+'</button><button class="secondary" id="quantity-back">Назад</button>');
 $('item-quantity').value='1';$('item-quantity').oninput=()=>{$('quantity-value').textContent=$('item-quantity').value;if(title==='Продать')$('quantity-total').textContent='За продажу: '+unitPrice*Number($('item-quantity').value)+' ₽';};$('item-quantity').oninput();
 bind('quantity-confirm',()=>{const n=Number($('item-quantity').value);if(Number.isInteger(n)&&n>=1&&n<=max)confirm(n);});bind('quantity-back',back);return true;
}
function sellItem(key,amount=null,confirmed=false){
 if(state.mode!=='base'||modalNpc!==1||!Object.hasOwn(ITEMS,key)||state.items[key]<=0)return false;
 if(amount===null)return selectQuantity(key,state.items[key],'Продать',n=>sellItem(key,n),openBuyerInventory);
 if(!Number.isInteger(amount)||amount<1||amount>state.items[key])return false;
 const uses=questItemUses(key);
 if(uses.length&&!confirmed){
  openModal('<span class="eyebrow">КВЕСТОВЫЙ ПРЕДМЕТ</span><h2 id="modalTitle">ВЫ УВЕРЕНЫ?</h2><p>'+ITEMS[key].name+' ×'+amount+' используется для квеста: '+uses.join(', ')+'. После продажи предметов может не хватить для сдачи задания.</p><button class="primary" id="quest-sale-confirm">Всё равно продать</button><button class="secondary" id="quest-sale-cancel">Отмена</button>');
  bind('quest-sale-confirm',()=>sellItem(key,amount,true));bind('quest-sale-cancel',openBuyerInventory);return false;
 }
 state.items[key]-=amount;const price=salePrice(ITEMS[key].price)*amount;state.money+=price;
 save();render();openBuyerInventory();AudioFX.play('coin');toast(ITEMS[key].name+' ×'+amount+' продано: +'+price+' ₽');return true;
}
function unlocked(i){return Number.isInteger(i)&&i>=0&&i<LOCATIONS.length&&level()>=LOCATIONS[i].level&&(i===0||Array.from({length:i},(_,n)=>n).every(cleared));}
function emblem(i){return '<span class="location-picture" style="background-position:'+((i%3)*50)+'% '+(Math.floor(i/3)*100)+'%" aria-hidden="true"></span>';}
function mapLocationHTML(l,i,position){
 const locked=!unlocked(i),current=state.location===i;
 const marker=locked?'<img class="map-lock-marker" src="assets/map-v37/chains-lock.webp" alt="" aria-hidden="true">':current?'<img class="map-player-marker" src="assets/map-v37/red-soldier.webp" alt="" aria-hidden="true">':cleared(i)?'<span class="map-node-status">'+uiIcon('check')+'</span>':'';
 return '<button class="map-node '+(locked?'locked ':'')+(current?'current ':'')+(cleared(i)?'cleared':'')+'" id="location'+i+'" style="left:'+position.x+'%;top:'+position.y+'%" aria-disabled="'+locked+'"'+(current?' aria-current="location"':'')+' aria-label="'+l.name+(locked?', закрыто':current?', текущая позиция':'')+'"><span class="map-emblem">'+emblem(i)+marker+'</span><b>'+l.name+'</b><span class="map-feedback" id="mapFeedback'+i+'" role="status" aria-live="polite" aria-atomic="true"></span></button>';
}
function showMapLocked(i){
 const feedback=$('mapFeedback'+i);if(!feedback)return;
 clearTimeout(feedback.popupTimer);
 feedback.innerHTML='<span class="map-locked-popup">Закрыто</span>';
 feedback.popupTimer=setTimeout(()=>{feedback.innerHTML='';},900);
}
function openMap(){
 if(!topUIAvailable())return false;
 const positions=[{x:28,y:86},{x:72,y:67},{x:31,y:47},{x:72,y:28},{x:31,y:9}];
 openModal('<span class="eyebrow">АТЛАС ЗОНЫ</span><h2 id="modalTitle">'+REGION_NAME+'</h2><div class="map-scroll" id="mapScroll"><div class="zone-map"><img class="map-terrain" src="assets/zone-map-v6.png" alt="" aria-hidden="true"><svg class="map-route" viewBox="0 0 360 860" preserveAspectRatio="none" aria-hidden="true"><path d="M101 740 C108 674 238 651 259 576 S149 475 111 404 S184 307 259 240 S167 124 111 77" stroke="#d6c59b" stroke-width="7" opacity=".2" fill="none"/><path d="M101 740 C108 674 238 651 259 576 S149 475 111 404 S184 307 259 240 S167 124 111 77" stroke="#402d25" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="4 10" fill="none"/></svg>'+LOCATIONS.map((l,i)=>mapLocationHTML(l,i,positions[i])).join('')+'</div></div>','map');
 $('mapScroll').scrollTop=Math.max(0,positions[state.location].y*8.6-145);
 LOCATIONS.forEach((l,i)=>bind('location'+i,()=>{if(!unlocked(i)){showMapLocked(i);return;}if(state.mode!=='base'){toast('Смена локации доступна на базе.');return;}if(i===state.location){closeModal();return;}openGuide(i);}));
}
function startExpedition(route=null){if(state.mode!=='base')return;if(sickSeconds()){toast('Нужно отлежаться: ещё '+sickSeconds()+' сек.');return;}if(route==='boss'&&(!LOCATIONS[state.location].boss||cleared(state.location)))return;if(state.energy<staminaCost(8)){toast('Отдохни на базе: для вылазки нужно хотя бы '+staminaCost(8)+' выносливости.');return;}closeModal();state.energyDrinkUsed=false;state.routeEnd=false;exhaustionOpen=false;exhaustionPending=null;grantRest();state.mode='expedition';state.expeditionSerial=Math.max(0,Math.floor(Number(state.expeditionSerial)||0))+1;AudioFX.play('depart');state.expeditionTurns=0;round=0;bag=shuffle(['crate','monster','fork','anomaly']);walk(route==='boss'?'boss':null,'depart');log(route==='boss'?'Идём к логову босса. Проверь оружие.':'База осталась позади. Смотри по сторонам.');}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function walk(forced=null,motionKind=null){if(window.Emission52?.sheltered60())return;if(state.routeEnd||state.mode!=='expedition')return;const motionSource={event,walkStarted};travelMotion=null;if(!['crate','monster','fork','anomaly','boss'].includes(forced))forced=null;if(exhaustionOpen)return;if(expeditionLimitReached()&&!window.Storm56?.active()){finishExpeditionRoute();return;}if(dungeonActive()&&Date.now()>=state.dungeon.endsAt){finishDungeon();return;}if(dungeonActive())forced='laboratory';if(!spend(dungeonActive()?2:event47TravelCost(),()=>walk(forced,motionKind)))return;if(!dungeonActive())event47TravelUsed();event=null;stick.active=false;stickDown=false;dragPointer=null;round++;state.steps++;if(!dungeonActive())state.expeditionTurns=expeditionTurns()+1;walkStarted=performance.now();nextWalkAt=walkStarted+(dungeonActive()?2600:4200);walk.forced=forced;save();render();if(motionKind)beginTravelMotion(motionKind,motionSource);}
function encounter(){travelMotion=null;if(window.Storm56?.encounter())return;if(dungeonActive()&&Date.now()>=state.dungeon.endsAt){finishDungeon();return;}let type=window.Storm56?.active()?window.Storm56.roll():dungeonActive()?rollLaboratoryEncounter():walk.forced;if(!type&&!firstCrate)type=rareContinuation()||continuation47()||(window.Economy51?window.Economy51.roll():rollRareEvent()||rollEvent47());if(!type){if(firstCrate){type='crate';firstCrate=false;}else{type=rollRoadEvent();if(!type){if(!bag.length)bag=shuffle(['crate','monster','fork','anomaly']);type=bag.pop();}}}walk.forced=null;const hunt=type==='huntAlpha',chupa=type==='chupacabra',boss=type==='boss'&&!!LOCATIONS[state.location].boss;if(type==='boss'||chupa||hunt)type='monster';const maxHp=hunt?65:chupa?100:boss?LOCATIONS[state.location].boss.hp:30;event={type,enemy:hunt?'huntAlpha':chupa?'chupacabra':null,boss,maxHp,attack:hunt?10:chupa?12:boss?LOCATIONS[state.location].boss.attack:7,resolved:false,created:performance.now(),hasLoot:Math.random()<lootChance(),hp:maxHp,progress:0,scanning:false,hasArtifact:Math.random()<artifactChance(),flash:0};if(type==='monster'&&!boss&&!chupa&&!hunt)event.enemy=rollEnemyKind();if(hunt){event.rareCombat=true;state.rare.hunt=null;}if(type==='anomaly'){stick.x=450;stick.y=600;}if(!isNewEnemy())AudioFX.play(chupa?'chupacabra':boss?(state.location===3?'echoHowl':'boss'):type==='monster'?'dog':type==='anomaly'?'danger':'click');if(!isNewEnemy())log(chupa?'Из темноты лаборатории вышла чупакабра.':dungeonActive()?'Ящик в сыром коридоре. Внутри могут быть редкие детали.':boss?'Впереди '+LOCATIONS[state.location].boss.name+'. Отступление не засчитывает победу.':{crate:'Ящик у дороги. Ржавый замок уже сорван.',monster:'Из травы выскочил слепой пёс. Приготовь оружие.',fork:'На развилке слышен треск детектора справа.',anomaly:'Аномалия фонит: радиация +2 в секунду. Не задерживайся.'}[type]||'Встреча на дороге.');if(type==='anomaly')window.Progression72?.prepareAnomaly();prepareRoadEvent();prepareRareEvent();prepareNewEnemy();window.Economy51?.apply(event);if(window.Economy51||isRareEvent()||isNewEnemy())save();render();}
function searchCrate(){if(!event||event.type!=='crate'||event.searching||event.resolved)return;event.searching=true;event.searchStart=performance.now();AudioFX.play('crate');renderAction();}
function finishSearch(){
 if(dungeonActive()&&Date.now()>=state.dungeon.endsAt){finishDungeon();return;}
 if(!event||event.type!=='crate'||event.resolved)return;
 state.cratesSearched++;const loot={};let overflow=0;const limited=[];
 if(event.hasLoot){
  const found=dungeonActive()?dungeonLoot():{scrap:1+Math.floor(Math.random()*3)};
  if(!dungeonActive()){if(Math.random()<.05)found.medkit=1;if(Math.random()<.04)found.vodka=1;if(Math.random()<.02)found.energy=1;
  if(Math.random()<.6)found.circuit=1;if(Math.random()<.65)found.cloth=1+Math.floor(Math.random()*2);}
  for(const [key,n]of Object.entries(found)){loot[key]=addItem(key,n);overflow+=n-loot[key];if(loot[key]<n)limited.push(ITEMS[key].name);}
  addXP(8);resolve('',limited.length?'Достигнут лимит: '+limited.join(', ')+'.':'',loot);
  AudioFX.play('loot');log('Ящик обыскан. '+(overflow?'Не всё поместилось: '+overflow+' шт. осталось.':'Добыча сохранена.'));
 }else{addXP(3);resolve('','Ничего не найдено.');log('Пустой ящик. В следующий раз повезёт.');}
 save();renderTab();
}
function totalLoot(loot){return Object.values(loot).reduce((n,value)=>n+value,0);}
function resolve(title,text,loot={}){if(!event||event.resolved)return;event.resolved=true;event.resumeAt=performance.now()+2400;event.resultTitle=title;event.resultText=text;event.loot=loot;stick.active=false;stickDown=false;save();renderAction();renderTab();updateVitals();}
function shoot(){startCombat();}
function returnToBase(message='Вернулись на базу. Добыча сохранена.'){if(window.Emission52?.sheltered60()&&Date.now()<event.shelterUntil)return false;state.emission56=null;if(state.events47){state.events47.rainWear=0;state.events47.guideSteps=0;}state.routeEnd=false;clearActionFeedback();travelMotion=null;if(state.mode==='expedition')state.guideVisit=null;exhaustionOpen=false;exhaustionPending=null;closeModal();state.dungeon=null;state.mode='base';state.expeditionTurns=0;refreshQuests(true);AudioFX.play('return');event=null;stick.active=false;stickDown=false;dragPointer=null;nextWalkAt=0;state.lastUpdate=Date.now();save();render();log(message);toast(message);}
function artifactPosition(t){return{x:450+Math.sin(t*.0011)*112,y:451+Math.cos(t*.0015)*35};}
function catchArtifact(){
 if(window.Progression72?.catchArtifact())return;
 if(!event||event.type!=='anomaly'||event.resolved)return false;
 const key=event.artifactKind||'artifact',accepted=addItem(key,1);
 if(accepted){state.artifactsCaught++;state.rep+=3;addXP(15);AudioFX.play('loot');resolve('','',{[key]:1});log(ITEMS[key].name+' в инвентаре. '+(key==='artifactX'?sparkDetails():artifactDetails())+'.');}
 else{addXP(4);resolve('','');}
 event.resumeAt=performance.now()+2400;save();renderTab();
}
function canvasPoint(e){const r=canvas.getBoundingClientRect(),s=Math.max(r.width/900,r.height/800);return{x:(e.clientX-r.left-(r.width-900*s)/2)/s,y:(e.clientY-r.top-(r.height-800*s)/2)/s};}
canvas.addEventListener('pointerdown',handleScenePointer);
canvas.addEventListener('keydown',e=>{if(window.Hubs62?.key(e))return;if(window.Storm56?.key(e))return;if(window.Loners53?.key(e))return;if(event?.type==='fork'&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();chooseForkRoute(e.key==='ArrowLeft'?'left':'right');return;}if(e.key==='Enter'||e.key===' '){e.preventDefault();activateScene();}});
canvas.addEventListener('pointermove',e=>{window.Hubs62?.move(e);window.Storm56?.move(e);window.Loners53?.move(e);if(exhaustionOpen||!stick.active||event?.resolved)return;if(e.pointerType==='mouse'||stickDown){aimStick(e);}});
function releaseStick(e){if(e.pointerId===dragPointer){stickDown=false;dragPointer=null;}canvas.style.touchAction=stick.active?'none':'auto';}
canvas.addEventListener('pointerup',e=>{window.Hubs62?.pointerUp(e);window.Storm56?.pointerUp(e);window.Loners53?.pointerUp(e);releaseStick(e);});canvas.addEventListener('pointercancel',e=>{window.Hubs62?.cancel();window.Storm56?.cancel();window.Loners53?.cancel();releaseStick(e);});
canvas.addEventListener('pointerleave',()=>{window.Hubs62?.leave();window.Loners53?.leave();});
$('inventoryTab').onclick=openPlayer;$('mapButton').onclick=openMap;$('questsButton').onclick=openQuests;$('perksButton').onclick=openPerks;$('closeModal').onclick=dismissModal;$('modalBackdrop').onclick=e=>{if(e.target===$('modalBackdrop'))dismissModal();};document.addEventListener('keydown',e=>{if(e.key==='Escape')dismissModal();});document.addEventListener('pointerdown',()=>AudioFX.unlock(sound),{once:true});$('sound').onclick=()=>{sound=!sound;AudioFX.setEnabled(sound);$('soundState').textContent=sound?'on':'off';$('soundIcon').innerHTML=uiIcon(sound?'sound':'muted');$('sound').setAttribute('aria-label',sound?'Выключить звук':'Включить звук');AudioFX.play('click');};document.addEventListener('visibilitychange',()=>{window.Hubs62?.cancel();window.Storm56?.cancel();window.Loners53?.cancel();lastFrame=performance.now();pauseReload48();pauseTravelMotion();pauseRareMinigame(document.hidden);pauseActionFeedback();if(document.hidden){save();AudioFX.suspend();}else AudioFX.unlock(sound);});window.addEventListener('pagehide',save);
document.addEventListener('click',e=>{
 const button=e.target.closest?.('button');
 if(!button||button.disabled)return;
 const id=button.id;
 if(['inventoryTab','sound','mapButton','closeModal','questClose','depart','bossRoute','return','search','shoot','useMedkit','combatHeal','field-medkit','field-vodka','field-energy','tiredDrink','tiredReturn','upgrade','craft','unequip'].includes(id)||/^(npc|slot-|gear-|buy-|sell-|bag-)/.test(id))return;
 AudioFX.play('click');
},true);
document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')AudioFX.unlock(sound);},true);
// Original canvas illustration: layered scenery, walking perspective and event animations.
function path(c,points,fill,stroke=null,lw=1){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function ellipse(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
function line(c,x1,y1,x2,y2,color,w=2){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=w;c.stroke();}
function rand(seed){const v=Math.sin(seed*12.9898+78.233)*43758.5453;return v-Math.floor(v);}
function tree(c,x,y,s,color,pine=true){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#394a3a';c.fillRect(-5,-10,10,115);if(pine){for(let i=0;i<4;i++)path(c,[[0,-140+i*34],[-48-i*10,-55+i*40],[48+i*10,-55+i*40]],color);}else{ellipse(c,0,-45,65,80,color);ellipse(c,-42,-20,44,54,color);ellipse(c,42,-20,44,54,color);}c.restore();}
function windowBox(c,x,y,w,h,color='#9accbf'){c.fillStyle='#263f43';c.fillRect(x,y,w,h);c.fillStyle=color;c.fillRect(x+4,y+4,w-8,h-8);line(c,x+w/2,y,x+w/2,y+h,'#304548',5);line(c,x,y+h/2,x+w,y+h/2,'#304548',5);}
function building(c,x,y,s,type=0){c.save();c.translate(x,y);c.scale(s,s);ellipse(c,110,180,210,20,'#263f4044');if(type===0){path(c,[[0,5],[205,5],[205,170],[0,170]],'#c5ae83','#3f5150',4);path(c,[[205,5],[263,-20],[263,138],[205,170]],'#8c9273','#3f5150',4);path(c,[[-24,10],[85,-70],[285,-25],[215,15]],'#496869','#304849',5);line(c,16,-12,204,5,'#88a19c',3);windowBox(c,20,36,48,47,'#edc573');windowBox(c,147,36,37,45,'#b0bc96');c.fillStyle='#415758';c.fillRect(82,45,49,125);c.fillStyle='#22393e';c.fillRect(88,52,37,118);c.fillStyle='#a78f64';c.fillRect(85,113,42,8);c.fillStyle='#c0ad7b';c.fillRect(75,30,62,17);c.fillStyle='#375153';c.font='bold 12px monospace';c.fillText('КОРДОН',78,43);for(let yy=90;yy<165;yy+=18)line(c,8,yy,68,yy+3,'#8e947a66');c.fillStyle='#486562';c.fillRect(230,-115,14,110);c.fillStyle='#59746c';c.fillRect(220,-120,35,13);line(c,44,-38,96,-60,'#7d9690',2);}else{c.fillStyle='#596d6a';c.fillRect(0,0,260,145);path(c,[[260,0],[305,-30],[305,127],[260,145]],'#435f60');path(c,[[-10,0],[55,-30],[310,-30],[262,8]],'#8a9484');for(let i=0;i<5;i++)windowBox(c,16+i*49,26,31,49,i%2?'#839384':'#405858');c.fillStyle='#334b4e';c.fillRect(115,93,45,52);for(let i=0;i<3;i++){c.fillStyle='#b39b73';c.fillRect(25+i*85,111,49,7);}c.fillStyle='#727d70';c.fillRect(181,-115,28,95);c.fillStyle='#485e5b';c.fillRect(177,-122,35,13);for(let i=0;i<5;i++){c.fillStyle='#344c4e';c.fillRect(181,-106+i*18,28,5);}}c.restore();}
function fire(c,x,y,t,s=1){c.save();c.translate(x,y);c.scale(s,s);const glow=c.createRadialGradient(0,-17,3,0,-17,80);glow.addColorStop(0,'#ffaf6255');glow.addColorStop(1,'#e4a24700');c.fillStyle=glow;c.fillRect(-90,-100,180,180);ellipse(c,0,14,48,15,'#1d3d38');for(let i=0;i<7;i++)ellipse(c,Math.cos(i)*36,10+Math.sin(i)*9,10,7,'#87927a');line(c,-31,12,30,-3,'#5d5543',10);line(c,-26,-6,28,16,'#735f43',9);const h=12*Math.sin(t*.011);path(c,[[-23,7],[-29,-14],[-13,-35],[0,-66+h],[11,-32],[23,-16],[19,8]],'#f4a852');path(c,[[-12,8],[-9,-15],[3,-40-h/2],[13,-6],[6,10]],'#fce7a1');for(let i=0;i<5;i++){const yy=(t*.04+i*25)%170;ellipse(c,Math.sin(t*.001+i)*16,10-yy,2,3,'#f6c780');}for(let i=0;i<5;i++){const yy=(t*.013+i*38)%220;ellipse(c,Math.sin(t*.001+i)*22,-35-yy,10+yy/10,8+yy/20,'#e3d8b319');}c.restore();}
function person(c,x,y,s,type,t=0){c.save();c.translate(x,y+Math.sin(t*.001+type)*1.5);c.scale(s,s);ellipse(c,0,96,33,9,'#153a3d55');c.fillStyle='#283f46';c.fillRect(-19,51,15,46);c.fillRect(5,51,15,46);ellipse(c,-14,96,17,7,'#1c3037');ellipse(c,13,96,17,7,'#1c3037');path(c,[[-28,-10],[28,-10],[32,57],[-32,57]],['#bd8055','#6b9485','#8095b2'][type],'#344a46',3);line(c,-29,1,-39,43,'#9f8d70',14);line(c,28,0,34,41,'#9f8d70',14);ellipse(c,-38,45,7,8,'#d9b288');ellipse(c,35,44,7,8,'#d9b288');c.fillStyle='#374e4d';c.fillRect(-25,42,51,10);c.fillStyle='#cfb680';c.fillRect(-3,43,9,9);ellipse(c,0,-30,24,30,'#d8ad83');ellipse(c,0,-25,20,25,'#d8ad83');if(type===0){path(c,[[-21,-25],[-20,4],[0,17],[21,1],[21,-25],[10,-5],[-10,-5]],'#615d4f');c.fillStyle='#77634e';c.fillRect(-27,-56,54,19);ellipse(c,0,-54,26,11,'#7b6b53');}else if(type===1){path(c,[[-27,-15],[-30,-45],[-16,-68],[13,-68],[29,-41],[27,-15],[18,-49],[-14,-49]],'#557e70');c.fillStyle='#364c46';c.fillRect(-26,-51,52,9);line(c,-19,-30,-4,-30,'#273e3e',4);line(c,4,-30,19,-30,'#273e3e',4);}else{c.fillStyle='#667f90';c.fillRect(-30,-54,60,12);ellipse(c,0,-58,25,15,'#738d9f');path(c,[[-17,-44],[20,-44],[14,-34],[-17,-34]],'#394f5e');line(c,-19,-27,-3,-27,'#253c3b',6);line(c,3,-27,20,-27,'#253c3b',6);}line(c,-4,-21,-4,-14,'#aa825f',2);line(c,-8,-6,9,-6,'#6e5545',2);if(type===2){line(c,-40,36,-16,17,'#bdc4ac',6);ellipse(c,-41,38,8,9,'#bac6b0');}if(type===1){path(c,[[15,2],[36,5],[31,42],[11,38]],'#45594f');}c.restore();}
function car(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);ellipse(c,0,49,90,15,'#28454155');path(c,[[-88,12],[-62,-13],[-17,-30],[38,-21],[62,2],[85,12],[87,46],[-87,46]],'#7d9d8c','#354e4b',3);path(c,[[-52,-10],[-16,-23],[28,-17],[47,1],[-57,1]],'#476568');line(c,-11,-20,-13,5,'#a0b29b',4);ellipse(c,-56,45,18,20,'#2b3e3b');ellipse(c,-56,45,8,10,'#7b8c7a');ellipse(c,53,45,18,20,'#2b3e3b');ellipse(c,53,45,8,10,'#7b8c7a');c.fillStyle='#d2c7a0';c.fillRect(-84,16,12,9);c.fillStyle='#a28962';c.fillRect(12,17,20,6);c.restore();}
function background(t,walking){if(drawPatchedBackground(t,walking))return;const c=ctx,W=900,H=800,loc=state.location,motionTime=event?event.created:t;let sky=c.createLinearGradient(0,0,0,500);sky.addColorStop(0,['#74aaa3','#748eaa','#679aa5','#8588a7','#b18c7c'][loc]);sky.addColorStop(.55,['#b5c8a5','#ceb89e','#b5c8a5','#bdabc2','#d2b09b'][loc]);sky.addColorStop(1,'#e6ce92');c.fillStyle=sky;c.fillRect(0,0,W,H);const sun=c.createRadialGradient(691,143,0,691,143,155);sun.addColorStop(0,'#f9e4ad');sun.addColorStop(.22,'#f4db9abb');sun.addColorStop(1,'#f5df9200');c.fillStyle=sun;c.fillRect(530,0,330,340);ellipse(c,691,143,37,37,'#fae2a7');for(let i=0;i<7;i++){const x=((i*170+t*.003)%1100)-100,y=80+i%3*39;ellipse(c,x,y,95,13,'#edf2d42a');ellipse(c,x+30,y-9,50,19,'#edf2d421');}path(c,[[0,275],[93,251],[153,275],[215,222],[307,257],[385,244],[453,279],[542,242],[607,257],[735,223],[824,249],[900,223],[900,460],[0,460]],'#7b9691');for(let i=0;i<22;i++)tree(c,i*46+10,335,.35+rand(i)*.4,'#587d78');c.fillStyle='#a9b49d44';c.fillRect(0,303,900,70);if(loc!==2){building(c,380,305,.62,1);c.fillStyle='#536e71';c.fillRect(653,218,7,150);line(c,657,220,657,178,'#536e71',4);line(c,612,216,696,216,'#536e71',4);line(c,634,197,678,197,'#536e71',3);line(c,665,237,620,278,'#536e71',2);}path(c,[[0,365],[260,342],[490,390],[690,347],[900,368],[900,800],[0,800]],loc===2?'#657e74':'#7d9766');path(c,[[0,494],[167,444],[271,476],[344,550],[260,704],[0,765]],'#93a370');path(c,[[900,434],[712,421],[600,502],[658,672],[900,733]],'#6c895f');for(let i=0;i<36;i++){const x=rand(i+100)*W,y=400+rand(i+120)*380;ellipse(c,x,y,12+rand(i)*30,4+rand(i+4)*10,i%2?'#43694d28':'#e1cd7920');}if(walking){path(c,[[433,367],[464,367],[654,800],[164,800]],'#b5b186');path(c,[[435,367],[446,367],[355,800],[222,800]],'#dbce9b33');path(c,[[457,370],[474,410],[562,800],[520,800]],'#7d94715c');for(let i=0;i<12;i++){const p=((motionTime*.00017+i/12)%1),yy=370+p*p*430,xx=448+(rand(i)*2-1)*p*155;ellipse(c,xx,yy,3+p*13,1+p*5,'#777f614f');}const travel=motionTime*.0002;for(let side=0;side<2;side++)for(let i=0;i<6;i++){const p=(travel+i/6+side*.04)%1,s=.13+p*p*1.8,y=366+p*p*470,x=450+(side?1:-1)*(49+p*p*440);tree(c,x,y,s,i%2?'#3d7260':'#4c8062');}if(loc===1){building(c,70,350,.6,1);car(c,740,515,.6);}else if(loc===2){ellipse(c,168,535,130,32,'#638e9060');ellipse(c,746,578,130,35,'#7ca4a966');}else{car(c,701,467,.59);line(c,32,419,293,386,'#879a76',9);for(let i=0;i<5;i++)line(c,36+i*61,375-i*6,36+i*61,471-i*11,'#68765d',9);}}else{path(c,[[443,379],[479,390],[426,482],[494,596],[434,800],[651,800],[626,605],[522,484]],'#c8b58a');building(c,157,322,1.45,0);car(c,705,483,.78);tree(c,72,418,1.25,'#49785e');tree(c,854,435,1.5,'#517e66');for(let i=0;i<7;i++)line(c,630+i*37,424,630+i*37,539,'#627354',7);line(c,630,462,895,462,'#a4a47e',8);line(c,630,512,895,512,'#a4a47e',8);person(c,357,575,.76,0,t);person(c,535,566,.76,1,t);person(c,710,575,.76,2,t);fire(c,449,626,t,1.1);c.fillStyle='#7e8b67';c.fillRect(249,600,64,20);line(c,259,620,250,664,'#435d4b',6);line(c,298,620,302,664,'#435d4b',6);line(c,332,225,635,254,'#2f5355',2);line(c,635,254,900,188,'#2f5355',2);for(let i=0;i<6;i++){const x=378+i*46,y=233+i*4;line(c,x,y,x,y+11,'#3f5951',1);ellipse(c,x,y+14,4,6,'#ffe29b');}}
if(loc===3)drawRadioTower(c,walking?650:756,walking?371:330,.75);if(loc===4){building(c,walking?54:48,walking?338:349,.78,1);building(c,walking?670:684,walking?365:381,.6,1);}
// Foreground foliage and airborne motes.
for(let i=0;i<33;i++){const x=rand(i+231)*900,y=630+rand(i+254)*180,s=.6+rand(i+271);line(c,x,y,x-12*s,y-24*s,'#4d7055',2);line(c,x,y,x+9*s,y-33*s,'#668656',2);if(i%4===0){ellipse(c,x+9*s,y-33*s,3,3,'#e4c87f');}}for(let i=0;i<14;i++){const x=(rand(i+33)*900+Math.sin(t*.0003+i)*25),y=(rand(i+83)*700+t*.008)%740;ellipse(c,x,y,1.2,1.2,'#f4e7a67b');}
}
function drawCrate(t){if(drawPatchedCrate(t))return;const c=ctx;const open=event.searching||event.resolved;const p=event.searching?Math.min(1,(t-event.searchStart)/2200):event.resolved?1:0;c.save();c.translate(450,555);const arrival=Math.min(1,(t-event.created)/700);c.scale(.5+arrival*.5,.5+arrival*.5);ellipse(c,0,90,151,28,'#243f3b66');path(c,[[-129,-10],[106,-10],[135,12],[134,105],[-127,105]],'#8d865f','#3a4c3b',5);path(c,[[106,-10],[135,12],[135,105],[105,82]],'#6b7151','#3a4c3b',4);c.fillStyle='#676b4b';c.fillRect(-107,16,183,69);for(let i=0;i<4;i++)line(c,-100,26+i*17,75,26+i*17,'#a8a175',3);c.fillStyle='#c2b87c';c.fillRect(-87,-9,16,115);c.fillRect(45,-9,16,115);if(open){c.save();c.translate(-130,-10);c.scale(1,1-p*1.05);path(c,[[0,0],[238,0],[265,23],[0,23]],'#b1a77c','#3e5042',4);c.restore();if(p>.35){c.fillStyle='#24342c';c.fillRect(-109,-9,208,26);path(c,[[-130,-12],[-133,-74*p],[106,-90*p],[106,-12]],'#969267','#3f4e3c',4);line(c,-110,-50*p,86,-63*p,'#c8bc89',3);if(event.hasLoot){const glow=c.createRadialGradient(0,-8,3,0,-8,110);glow.addColorStop(0,'#ffe78d50');glow.addColorStop(1,'#ffca4400');c.fillStyle=glow;c.fillRect(-120,-105,240,175);ellipse(c,-37,-1,30,8,'#ddbe74');path(c,[[18,-15],[49,-14],[51,4],[20,4]],'#8bbcb3');}}}else path(c,[[-130,-12],[106,-12],[135,12],[-128,12]],'#b5a573','#435541',4);c.fillStyle='#455442';c.fillRect(-6,17,20,22);c.fillStyle='#b5b494';c.fillRect(0,22,7,11);c.restore();}
function drawHand(c,x,y,s,angle=0){c.save();c.translate(x,y);c.rotate(angle);c.scale(s,s);path(c,[[-20,125],[24,125],[19,29],[-18,28]],'#486571','#243f43',3);path(c,[[-15,33],[-21,9],[-14,-18],[-5,-22],[0,-5],[4,-25],[12,-26],[16,-6],[21,-23],[28,-20],[27,4],[33,-10],[39,-5],[33,17],[24,33]],'#c6a681','#4d6250',3);c.fillStyle='#68848a';c.fillRect(-19,32,42,13);c.restore();}
function drawMonster(t){if(drawPatchedDog(t))return;const c=ctx;const arrival=Math.min(1,(t-event.created)/650);c.save();c.translate(454,562+Math.sin(t*.005)*3);c.scale(.5+arrival*.6,.5+arrival*.6);ellipse(c,0,81,125,18,'#263d3c66');if(event.resolved){c.globalAlpha=.4;}path(c,[[-117,1],[-96,-36],[-19,-61],[62,-42],[76,23],[59,78],[34,78],[37,31],[-39,25],[-52,81],[-79,81],[-75,16]],'#968270','#374c41',5);path(c,[[49,-51],[79,-93],[86,-36],[124,-71],[131,-7],[102,37],[65,24],[48,-10]],'#b19a7d','#3a4c42',5);path(c,[[76,16],[112,15],[101,34],[77,33]],'#485047');for(let i=0;i<4;i++)path(c,[[79+i*7,16],[84+i*7,16],[82+i*7,26]],'#eee2b1');line(c,74,-15,84,-20,'#f4cb79',6);line(c,106,-13,116,-9,'#f4cb79',6);ellipse(c,93,6,11,7,'#3c4d44');line(c,-106,-27,-136,-81+Math.sin(t*.004)*12,'#7b6e5c',12);line(c,-35,-32,32,-18,'#b9a37f',3);for(let i=0;i<3;i++)line(c,-25+i*15,-36,-38+i*14,-18,'#6c6855',3);if(t-event.flash<160){c.fillStyle='#ffc873';path(c,[[-26,13],[-64,-14],[-46,29],[-80,44],[-41,48],[-38,80],[-13,50],[17,70],[4,33],[28,7]],'#ffde92');}c.restore();}
function drawFork(t){drawPatchedFork(t);}
function drawAnomaly(t){if(window.Progression72?.drawAnomaly(t))return;const c=ctx;const x=450,y=506;if(event.resolved){if(event.loot.artifact||event.loot.artifactX){const k=event.loot.artifactX?'artifactX':'artifact';if(artReady(k))c.drawImage(WORLD_ART[k],406,413,88,88);else ellipse(c,450,457,28,40,'#a4f3d8');return;}}const glow=c.createRadialGradient(x,y,10,x,y,188);glow.addColorStop(0,'#85eddb99');glow.addColorStop(.35,'#6ae8d940');glow.addColorStop(1,'#42d0ba00');c.fillStyle=glow;c.fillRect(220,280,460,410);for(let i=0;i<5;i++){c.save();c.translate(x,y-10);c.rotate(Math.sin(t*.001+i)*.18);c.beginPath();c.ellipse(0,0,81+i*17,16+i*12,0,0,Math.PI*2);c.strokeStyle=i%2?'#bbf6d88c':'#5edecd75';c.lineWidth=2;c.stroke();c.restore();}for(let i=0;i<10;i++){const a=t*.001+i*.64,r=54+i%3*22;ellipse(c,x+Math.cos(a)*r,y-30+Math.sin(a)*r*.7,2+i%3,3,'#befce49c');}if(event.scanning&&event.hasArtifact&&t-event.scanStart>1400){const a=artifactPosition(t);const g=c.createRadialGradient(a.x,a.y,0,a.x,a.y,40);g.addColorStop(0,'#fff9c4');g.addColorStop(.35,'#c8ffc599');g.addColorStop(1,'#f0d37000');c.fillStyle=g;c.fillRect(a.x-45,a.y-45,90,90);c.save();c.translate(a.x,a.y);c.rotate(t*.0007);const k=event.artifactKind||'artifact';if(artReady(k))c.drawImage(WORLD_ART[k],-34,-34,68,68);else path(c,[[0,-20],[12,-4],[9,15],[-6,20],[-13,2]],'#e6f6a2','#ffffffaa',2);c.restore();c.beginPath();c.arc(a.x,a.y,39,0,Math.PI*2);c.setLineDash([3,7]);c.strokeStyle='#d4ffd680';c.lineWidth=1;c.stroke();c.setLineDash([]);}if(stick.active){const sx=Math.max(30,Math.min(870,stick.x)),sy=Math.max(170,Math.min(740,stick.y));line(c,726,807,sx+5,sy+7,'#2a423b',15);line(c,725,806,sx,sy,'#b9a077',10);line(c,722,805,sx-2,sy-1,'#e3c699',3);const length=Math.hypot(726-sx,807-sy);for(let i=1;i<4;i++){const p=i/5;ellipse(c,726+(sx-726)*p,807+(sy-807)*p,4,3,'#756a4c');}c.beginPath();c.arc(sx,sy,18,0,Math.PI*2);c.strokeStyle='#f8e6b0aa';c.lineWidth=2;c.stroke();drawHand(c,697,742,.85,-.75);}}
function syncSceneResolution65(){
 const rect=canvas.getBoundingClientRect(),dpr=Math.max(1,Math.min(3,Number(window.devicePixelRatio)||1));
 const scale=Math.max(1,Math.min(2.5,Math.max(rect.width/900,rect.height/800)*dpr));
 const width=Math.round(900*scale),height=Math.round(800*scale);
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
 ctx.setTransform(width/900,0,0,height/800,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
}
function drawWorld(t){syncSceneResolution65();if(exhaustionOpen)t=exhaustionAt;ctx.save();if(window.Hubs62?.draw(t)){ctx.restore();drawNightOverlay();drawActionFeedback();return;}window.Storm56?.shake(t);if(state.mode==='expedition'&&!event&&!travelMotion){ctx.translate(Math.sin(t*.004)*4,Math.cos(t*.008)*3);ctx.scale(1.01,1.01);}if(!drawMotionBackground(t)&&!drawRareBackground(t)&&!drawDungeon(t)&&(!(state.mode==='camp'||event?.type==='camp')||!drawCamp(t)))background(t,state.mode==='expedition');drawRoadSprite(t);if(event){if(event.type==='crate')drawCrate(t);else if(isCombatEncounter()){if(!window.Refresh77?.monster(t)&&!drawRaider48(t)&&!drawNewEnemy(t)){if(event.enemy==='chupacabra')drawChupacabra(t);else if(event.boss)drawBoss(t);else if(event.enemy!=='raider'&&!drawRareMonster(t))drawMonster(t);}}else if(event.type==='fork')drawFork(t);else if(event.type==='anomaly')drawAnomaly(t);}if(!consumableBusy())drawWeapon(t);drawRaiderBurst(t);ctx.restore();if(dungeonActive())drawLaboratoryLight();else drawNightOverlay();window.Emission52?.drawDark60();drawActionFeedback();window.Storm56?.overlay();}
function tick(t){if(window.SvalkerFront81?.paused){lastFrame=t;state.lastUpdate=Date.now();requestAnimationFrame(tick);return;}window.Weather71?.update();if(document.hidden||exhaustionOpen||!$('modalBackdrop').hidden||window.Alcohol?.active())pauseReload48();if(window.Alcohol?.active()){window.Alcohol.sync();lastFrame=t;requestAnimationFrame(tick);return;}updateActionFeedback(t);window.Hubs62?.update(t);
 const elapsed=Math.max(0,(t-lastFrame)/1000);lastFrame=t;updateTravelMotion(t);const now=Date.now();syncWorldClock();if(state.routeEnd){state.lastUpdate=now;updateVitals();if(t-lastSave>2000){save();lastSave=t;}requestAnimationFrame(tick);return;}if(dungeonActive()&&now>=state.dungeon.endsAt)finishDungeon();
 window.Progression72?.update(Math.min(elapsed,.25));
 const rested=restActive();if(tick.restState!==rested){tick.restState=rested;if(state.mode==='expedition')renderAction();}
 if(!document.hidden&&!exhaustionOpen){if(!safeZone())updateRadiation(Math.min(elapsed,.25));updateCombat(t);}
 window.Storm56?.update();updateRoadEvents(t);updateRareEvent(t);
 if(!document.hidden&&state.mode==='expedition'&&!exhaustionOpen&&event?.resolved&&!isRareEvent()&&t>=event.resumeAt)walk();
 if(state.mode==='expedition'&&!exhaustionOpen&&state.energy<=0&&!(event?.resolved&&expeditionLimitReached())&&!travelMotion&&!isRareEvent()&&!event?.combat&&!window.RadioEchoV45?.busy()&&!['camp','pump','well','patrol','stalkers'].includes(event?.type))showExhaustion();
 if(safeZone()){
  const dt=Math.max(0,now-state.lastUpdate);state.energy=sickSeconds()?0:Math.min(100,state.energy+Math.max(0,now-Math.max(state.lastUpdate,state.diarrheaUntil))/600*staminaRecoveryMultiplier());state.hp=Math.min(window.Progression72?.maxHealth()||100,state.hp+dt/1000*healthRegenRate());state.radiation=Math.max(0,state.radiation-dt/1000*2);state.bleeding=Math.max(0,state.bleeding-dt/1000);state.lastUpdate=now;if($('depart'))$('depart').disabled=state.energy<staminaCost(8)||!!sickSeconds();if($('bossRoute'))$('bossRoute').disabled=state.energy<staminaCost(8)||!!sickSeconds();if(state.mode==='camp'&&$('camp-depart'))$('camp-depart').disabled=!expeditionLimitReached()&&(state.energy<staminaCost(8)||!!sickSeconds());
 }else{
  if(!document.hidden&&!exhaustionOpen&&restActive())state.hp=Math.min(window.Progression72?.maxHealth()||100,state.hp+Math.min(elapsed,.25)*healthRegenRate());
  state.lastUpdate=now;
  if(!exhaustionOpen&&!document.hidden){
   if(state.mode==='expedition'&&!event&&!travelMotion&&t>=nextWalkAt)encounter();
   if(state.mode==='expedition'&&!event&&(!travelMotion||travelMotion.elapsed>=CAMERA_TURN_MS)&&t-lastStepSound>650){AudioFX.play('step',{surface:dungeonActive()||[1,4].includes(state.location)?'concrete':state.location===2?'mud':'grass'});lastStepSound=t;}
   if(event?.searching&&!event.resolved){const p=Math.min(1,(t-event.searchStart)/2200);if($('searchPercent'))$('searchPercent').textContent=Math.floor(p*100)+'%';if(p>=1)finishSearch();}
   if(event?.type==='anomaly'&&!event.resolved){
    if(t-lastDetectorSound>Math.max(220,1000-state.radiation*7)){AudioFX.play('danger');lastDetectorSound=t;}
    if(event.scanning){canvas.style.touchAction='none';if(!event.hasArtifact&&t-event.scanStart>1200){addXP(4);resolve('','Пусто');event.resumeAt=performance.now()+1200;log('Аномалию проверили, но внутри ничего не нашлось.');}else if(event.hasArtifact&&t-event.scanStart>1400){const a=artifactPosition(t),dist=Math.hypot(stick.x-a.x,stick.y-a.y);const dt=Math.min(elapsed,.08);if(dist<48&&stick.active){event.progress=Math.min(1,event.progress+dt/1.65);}else event.progress=Math.max(0,event.progress-dt*.17);updateArtifactLootRing(event.progress);if(event.progress>=1)catchArtifact();}}
   }
  }
 }
 if((!stick.active||exhaustionOpen)&&!window.RadioEcho?.healing())canvas.style.touchAction='auto';updateVitals();drawWorld(t);if(t-lastSave>2000){save();lastSave=t;}requestAnimationFrame(tick);
}
if(dungeonActive()){walkStarted=performance.now();nextWalkAt=walkStarted+2600;walk.forced='laboratory';restoreLabCombat();}
restoreRareEvent(loadedRaw);restorePatrolChoice(loadedRaw);restoreRouteEnd();window.Storm56?.restore(loadedRaw);if(state.mode==='base'){state.events47.rainWear=0;state.events47.guideSteps=0;}render();if(state.routeEnd)showRouteEnd();else if(event?.detained)capturePatrol();else if(state.defeat)showDefeat();else if(state.gopStop52)window.Emission52?.showStop();else if(state.visitAftermath)showVisitAftermath();save();requestAnimationFrame(t=>{lastFrame=t;tick(t);});
function drawBoss(t){
 const c=ctx,marsh=state.location===2||state.location===3;c.save();if(event.defeated){ellipse(c,450,694,175,25,'#050a0c77');c.translate(450,670);if(marsh){c.rotate(Math.PI/2);c.scale(.55,1);}else{c.rotate(-.12);c.scale(1,.4);}}else{c.translate(450,547+Math.sin(t*.003)*3);const arrival=Math.min(1,(t-event.created)/800);c.scale(.6+arrival*.5,.6+arrival*.5);ellipse(c,0,105,163,27,'#203a3d77');if(event.resolved)c.globalAlpha=.35;}
 const glow=c.createRadialGradient(0,-5,12,0,-5,190);glow.addColorStop(0,marsh?'#8fe9d14d':'#e89e5440');glow.addColorStop(1,'#ffb85400');c.fillStyle=glow;c.fillRect(-200,-200,400,330);
 if(!marsh){
  path(c,[[-138,-6],[-126,-61],[-77,-92],[6,-101],[93,-59],[111,12],[75,76],[67,108],[34,108],[29,51],[-50,49],[-65,106],[-98,106],[-102,45]],'#746b56','#2e4542',5);
  path(c,[[-99,-59],[-60,-90],[0,-94],[61,-70],[19,-36],[-75,-19]],'#94947a','#354b44',4);
  for(let i=0;i<6;i++)path(c,[[-99+i*28,-71],[-101+i*28,-113-i%2*17],[-82+i*28,-83]],'#bdac82','#455747',2);
  path(c,[[44,-73],[111,-92],[157,-44],[140,29],[76,37],[35,-10]],'#9d8566','#354b42',5);ellipse(c,135,5,31,25,'#615d4e');ellipse(c,147,5,6,8,'#293e3c');ellipse(c,127,5,6,8,'#293e3c');line(c,77,-41,99,-46,'#ffda78',7);
  path(c,[[98,26],[77,12],[68,-17],[74,39],[95,52]],'#f0ddab','#485a48',2);path(c,[[137,27],[158,8],[162,-19],[168,36],[151,52]],'#f0ddab','#485a48',2);line(c,-132,-30,-170,-53,'#625f4f',12);
 }else{
  path(c,[[-87,100],[-70,41],[-92,-23],[-47,-74],[42,-71],[92,-16],[71,50],[91,100],[44,110],[22,70],[-27,69],[-47,109]],'#5e8272','#264947',5);
  path(c,[[-56,-59],[-80,-105],[-39,-94],[-21,-135],[2,-105],[31,-128],[41,-86],[82,-102],[58,-61]],'#9bbd8b','#35564b',4);ellipse(c,0,-46,51,43,'#789983');ellipse(c,-20,-48,10,9,'#d9f6aa');ellipse(c,21,-48,10,9,'#d9f6aa');ellipse(c,-20,-48,4,6,'#254a44');ellipse(c,21,-48,4,6,'#254a44');path(c,[[-24,-22],[24,-21],[16,-7],[-15,-7]],'#305148');
  line(c,-77,-6,-127,62,'#638978',23);line(c,79,-4,128,62,'#638978',23);for(let i=0;i<3;i++){line(c,-125+i*7,62,-141+i*11,94,'#a8cc94',4);line(c,122+i*6,62,118+i*12,94,'#a8cc94',4);}for(let i=0;i<5;i++)line(c,-35+i*16,5,-47+i*18,45,'#99b98b',3);
 }
 if(t-event.flash<160)ellipse(c,0,4,35,42,'#ffd393aa');c.restore();
}
function dismissModal(){if(state.routeEnd||exhaustionOpen||event?.detained)return;if(modalReturn){const back=modalReturn;modalReturn=null;barShopProduct=null;AudioFX.play('close');back();}else closeModal();}
function barShopHTML(){return '<div class="bar-shop"><div class="section-heading"><h3>Припасы торговца</h3><span>'+state.money+' ₽</span></div><div class="inventory-grid bar-products">'+Object.keys(SHOP).map(key=>'<button class="item-card shop-item" id="buy-'+key+'" aria-label="Открыть '+ITEMS[key].name+'"><span class="item-icon">'+itemIcon(key)+'</span><b>'+ITEMS[key].name+'</b><span class="sale-price">'+servicePrice(SHOP[key].price)+' ₽</span></button>').join('')+'</div></div>';}
function bindBarShop(){for(const key of Object.keys(SHOP))bind('buy-'+key,()=>openBarProduct(key));}
function openBarProduct(key){
 if(state.mode!=='base'||modalNpc!==0||!Object.hasOwn(SHOP,key)||document.hidden)return false;
 const price=servicePrice(SHOP[key].price),full=state.items[key]>=capacity(),poor=state.money<price;
 openModal('<div class="product-detail-icon">'+itemIcon(key)+'</div><h2 id="modalTitle">'+ITEMS[key].name+'</h2><p>'+SHOP[key].effect+'</p>'+(full?'<p>Нет места для этого предмета.</p>':poor?'<p>Недостаточно денег.</p>':'')+'<button class="primary" id="confirm-bar-buy" '+(full||poor?'disabled':'')+'>Купить · '+price+' ₽</button>');
 modalNpc=0;barShopProduct=key;modalReturn=()=>openBartender();bind('confirm-bar-buy',()=>purchaseBarProduct(key));return true;
}
function purchaseBarProduct(key){
 if(state.mode!=='base'||modalNpc!==0||barShopProduct!==key||$('modalBackdrop').hidden||document.hidden||!Object.hasOwn(SHOP,key))return false;
 const price=servicePrice(SHOP[key].price);if(state.money<price||state.items[key]>=capacity()||addItem(key,1)!==1)return false;
 state.money-=price;save();render();openBarProduct(key);AudioFX.play('coin');toast(ITEMS[key].name+' добавлен в рюкзак.');return true;
}

function showExhaustion(resume=null){
 if(state.mode!=='expedition'||exhaustionOpen)return;
 exhaustionOpen=true;exhaustionAt=performance.now();exhaustionPending=typeof resume==='function'?resume:null;stickDown=false;AudioFX.play('tired');
 openModal(statusImage('exhaustion','Персонаж выбился из сил')+'<span class="eyebrow">НУЖНА ПЕРЕДЫШКА</span><h2 id="modalTitle">Выносливость кончилась</h2><p>Осталось '+Math.floor(state.energy)+' / 100. Вернись на базу или восстанови 50 выносливости энергетиком.</p><div class="tired-energy">'+itemIcon('energy')+'<span>В рюкзаке: '+state.items.energy+'<small>'+(state.energyDrinkUsed?'Энергетик уже использован в этой вылазке.':'Можно использовать один раз за вылазку.')+'</small></span></div><button class="primary" id="tiredDrink" '+(state.items.energy<=0||state.energyDrinkUsed?'disabled':'')+'>Выпить энергетик · +50 выносливости</button><button class="secondary tired-return" id="tiredReturn">'+uiIcon('return')+' Вернуться на базу</button>'+(state.items.energy<=0?'<p class="action-note">Энергетик продаётся у торговца за '+SHOP.energy.price+' ₽.</p>':''));
 bind('tiredDrink',useEnergy);bind('tiredReturn',escapeExpedition);$(state.items.energy>0&&!state.energyDrinkUsed?'tiredDrink':'tiredReturn').focus();
}
function useEnergy(){
 if(consumableBusy()||event?.detained)return false;
 if(sickSeconds()){toast('Нужно отлежаться. Энергетик сейчас не поможет.');return false;}
 if(state.mode!=='expedition'){toast('Энергетик пригодится на вылазке. На базе можно отдохнуть.');return false;}
 if(state.energyDrinkUsed){toast('Энергетик уже использован в этой вылазке.');return false;}
 if(state.items.energy<=0){toast('В рюкзаке нет энергетика.');return false;}
 if(state.energy>=100)return false;
 state.items.energy--;state.energy=Math.min(100,state.energy+50);state.energyDrinkUsed=true;
 const wasPaused=exhaustionOpen,pending=exhaustionPending;
 if(wasPaused){const dt=performance.now()-exhaustionAt;nextWalkAt+=dt;if(event){for(const key of ['created','searchStart','scanStart','resumeAt','weaponUntil','shotAt','jamAt','attackAt','playerHitAt'])if(typeof event[key]==='number')event[key]+=dt;if(event.combat)event.combat.nextAt+=dt;}exhaustionOpen=false;exhaustionPending=null;closeModal();}
 startConsumableMotion('energy');toast('Энергетик: +50 выносливости.');save();render();if(pending)pending();return true;
}
function useVodka(){if(consumableBusy()||event?.detained||state.blackoutUntil>Date.now())return false;if(state.items.vodka<=0){toast('В рюкзаке нет водки.');return false;}state.items.vodka--;applyAlcoholDose();state.radiation=Math.max(0,state.radiation-40);startConsumableMotion('vodka');toast(state.blackoutUntil>Date.now()?'Алкаш!':alcoholName()+' · точность −'+Math.round(alcoholPenalty()*100)+'% · радиация −40.');save();updateVitals();return true;}
function renderSupplies(){
 const panel=$('fieldSupplies');panel.hidden=state.mode!=='expedition';
 if(panel.hidden){panel.innerHTML='';return;}
 panel.innerHTML=[['medkit','Аптечка'],['vodka','Водка'],['energy','Энергетик']].map(([key,name])=>'<button id="field-'+key+'">'+itemIcon(key)+'<span>'+name+'<small id="count-'+key+'">×'+state.items[key]+'</small></span></button>').join('');
 bind('field-medkit',()=>{useMedkit();renderAction();updateVitals();});bind('field-vodka',()=>{useVodka();updateVitals();});bind('field-energy',useEnergy);updateRadiationUI();
}
function updateRadiationUI(){
 $('radiationLabel').textContent=Math.floor(state.radiation);updateVitalGauge('radiation',state.radiation);$('radiationFill').classList.toggle('danger',state.radiation>=50);
 for(const key of ['medkit','vodka','energy']){const button=$('field-'+key),count=$('count-'+key);if(count)count.textContent='×'+state.items[key];if(button)button.disabled=consumableBusy()||!!event?.detained||state.items[key]<=0||(key==='medkit'&&state.hp>=(window.Progression72?.maxHealth()||100)&&state.bleeding<=0)||(key==='energy'&&(state.energyDrinkUsed||state.energy>=100));}
}
function updateRadiation(dt){
 if(exhaustionOpen||document.hidden||!Number.isFinite(dt)||dt<=0)return;
 if(safeZone()){
  state.radiation=Math.max(0,state.radiation-dt*2);
  state.bleeding=Math.max(0,state.bleeding-dt);
  return;
 }
 state.radiation=Math.min(100,state.radiation+dt*radiationRate());
 const radiationDamage=state.radiation>=50?dt*(.5+(state.radiation-50)/50):0;
 state.hp=Math.max(0,state.hp-radiationDamage);if(state.hp<=0){defeatPlayer('radiation');return;}
 const bleedingDamage=Math.min(dt,state.bleeding);state.bleeding=Math.max(0,state.bleeding-dt);state.hp=Math.max(0,state.hp-bleedingDamage);
 if(state.hp<=0)defeatPlayer('bleeding');
}
function bypassMonster(){if(!isMonsterEnemy()||event.boss||event.resolved||event.combat)return;if(spend(10,bypassMonster)){resolve('Тихо прошли мимо','Пёс потерял след. Обход не засчитывается как убийство.');log('Обошли мутанта стороной.');}}
function drawRadioTower(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);path(c,[[-51,145],[0,-122],[55,145]],null,'#526271',7);for(let i=0;i<6;i++){const y=-85+i*39,w=(y+122)/267*48;line(c,-w,y,w,y,'#6c7c80',4);if(i<5){line(c,-w,y,w+8,y+39,'#738284',2);line(c,w,y,-w-8,y+39,'#738284',2);}}line(c,0,-123,0,-170,'#5e6d75',4);line(c,-33,-132,33,-132,'#85938e',4);ellipse(c,0,-172,5,5,'#e6b776');c.restore();}

function raiderMuzzle(t=performance.now()){return raiderPose48(t)?.muzzle||{x:545,y:290};}

function drawRaiderBurst(t){
 if(event?.enemy!=='raider'||event.resolved||t-(event.attackAt||-10000)>85)return;
 const muzzle=raiderMuzzle(t);ctx.save();ctx.fillStyle='#ffe5a5';ctx.shadowColor='#ffb941';ctx.shadowBlur=25;
 ctx.beginPath();for(let i=0;i<12;i++){const a=i*Math.PI/6,r=i%2?10:34,x=muzzle.x+Math.cos(a)*r,y=muzzle.y+Math.sin(a)*r;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.closePath();ctx.fill();
 ctx.strokeStyle='#eaba6999';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(muzzle.x,muzzle.y);ctx.lineTo(450,800);ctx.stroke();ctx.restore();
}
