'use strict';
// Base progression and durable wall-clock timers; all inventory transfers are atomic.
const dungeonTexture=new Image();dungeonTexture.src='assets/dungeon-v10.webp';WORLD_ART.dungeon=dungeonTexture;
const RARE_ITEMS={tarpaulin:{name:'Брезент',price:300},radioParts:{name:'Радиодетали',price:650},weaponParts:{name:'Детали оружия',price:1000}};
const MOD_KEYS=['damage','accuracy','reliability','pack','armor','boots','mask','lamp'];
const DUNGEON_MS=5*60*1000,DUNGEON_COOLDOWN_MS=45*60*1000,QUEST_REFRESH_MS=5*60*1000,WAREHOUSE_STACK=100;
const ADVANCED_GEAR={
 pistolMk2:{slot:'weapon',name:'Пистолет «Вектор»',desc:'Снаряжение II. +6 урона, +3% точности и меньше клинов.'},
 armorMk2:{slot:'body',name:'Бронекостюм «Рубеж»',armor:8,desc:'Снаряжение II. Усиленная защита и сохранённые модификации.'},
 bootsMk2:{slot:'feet',name:'Берцы разведчика',desc:'Снаряжение II. Дополнительно снижают расход сил на 10%.'},
 packMk2:{slot:'back',name:'Ранец «Ковчег»',desc:'Снаряжение II. Защита от артефактов, ещё +50 к вместимости.'},
 maskMk2:{slot:'mask',name:'Противогаз «Фильтр-М»',desc:'Снаряжение II. Блокирует 90% излучения аномалий.'},
 lampMk2:{slot:'head',name:'Фонарь «Луч»',desc:'Снаряжение II. Свет в темноте, +5% к шансу добычи ночью.'}
};
const ADVANCED_RECIPES={
 pistolMk2:{base:['pistol'],money:6000,materials:{weaponParts:6,radioParts:3,tarpaulin:1}},
 armorMk2:{base:['jacket'],money:5000,materials:{cloth:12,tarpaulin:8,radioParts:2,weaponParts:3}},
 bootsMk2:{base:['boots'],money:3000,materials:{tarpaulin:5,weaponParts:2}},
 packMk2:{base:['stalkerPack'],money:5500,materials:{tarpaulin:7,radioParts:4,weaponParts:2}},
 maskMk2:{base:['gasmask'],money:4000,materials:{tarpaulin:3,radioParts:5,weaponParts:2}},
 lampMk2:{base:['headlamp'],money:3500,materials:{radioParts:6,weaponParts:2}}
};
function baseLevel(){return Math.min(10,Math.floor(Math.max(0,Number(state.rep)||0)/100));}
function servicePrice(price){return Math.max(1,Math.ceil(price*(1-baseLevel()*.05)));}
function salePrice(price){return Math.max(1,Math.floor(price*(1+baseLevel()*.02)));}
function techChance(chance){return Math.min(.95,chance+(baseLevel()>0?.05:0));}
function questLimit(){return baseLevel()>=10?2:1;}
function dungeonActive(){return !!state.dungeon&&state.mode==='expedition';}
function dungeonSeconds(){return dungeonActive()?Math.max(0,Math.ceil((state.dungeon.endsAt-Date.now())/1000)):0;}
function dungeonCooldown(){return Math.max(0,Math.ceil(((state.dungeonReadyAt||0)-Date.now())/1000));}
function timeLabel(seconds){return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');}
function fullyModified(){return MOD_KEYS.every(k=>state.upgrades[k]>=10);}
function initProgression(raw){
 state.rep=Math.max(0,Math.floor(Number(state.rep)||0));
 for(const k of ['boots','mask','lamp'])state.upgrades[k]=clampUpgrade(state.upgrades[k]);
 state.warehouse=Array.from({length:5},(_,i)=>{const s=state.warehouse?.[i];return s&&ITEMS[s.key]&&Number(s.count)>0?{key:s.key,count:Math.min(WAREHOUSE_STACK,Math.floor(s.count))}:null;});
 state.dungeonReadyAt=Math.max(0,Number(state.dungeonReadyAt)||0);
 state.questSerial=Math.max(0,Math.floor(Number(state.questSerial)||0));
 const valid=q=>q&&typeof q.id==='string'&&['fetch','kill'].includes(q.type)&&Number.isInteger(q.count)&&q.count>0&&q.count<=30&&(q.type==='kill'||ITEMS[q.item]);
 state.activeQuests=Array.isArray(state.activeQuests)?state.activeQuests.filter(valid).slice(0,2):[];
 for(const q of state.activeQuests)q.progress=Math.max(0,Math.min(q.count,Number(q.progress)||0));
 if(!Array.isArray(raw?.activeQuests)&&state.quest==='active')state.activeQuests.push({id:'legacy-signal',type:'fetch',item:'scrap',count:3,title:'Первый сигнал',money:80,rep:10,xp:25,progress:0});
 state.questOffers=Array.isArray(state.questOffers)?state.questOffers.filter(valid).slice(0,2):[];
 for(const q of [...state.activeQuests,...state.questOffers]){q.money=Math.max(0,Math.floor(Number(q.money)||0));q.rep=Math.max(0,Math.floor(Number(q.rep)||0));q.xp=Math.max(0,Math.floor(Number(q.xp)||0));}
 state.questsRefreshAt=Math.max(0,Number(state.questsRefreshAt)||0);
 const now=Date.now(),delta=raw?Math.max(0,now-(Number(raw.clockAt)||Number(raw.lastUpdate)||now))/1000:0;
 state.playTime=(state.playTime+delta)%480;state.clockAt=now;
 if(raw&&['base','camp'].includes(raw.mode))recoverOffline(raw,now);
 const d=state.dungeon;
 if(d&&Number.isFinite(d.endsAt)&&d.endsAt>now&&d.endsAt<=now+DUNGEON_MS&&baseLevel()>=10){state.mode='expedition';state.dungeon={endsAt:d.endsAt,location:state.location,combatSave:d.combatSave||null};}
 else state.dungeon=null;
 window.Economy51?.init(raw);refreshQuests();
}
function recoverOffline(raw,now){
 const elapsed=Math.max(0,now-(Number(raw.lastUpdate)||now))/1000;
 state.hp=Math.min(window.Progression72?.maxHealth()||100,state.hp+elapsed*.5);state.radiation=Math.max(0,state.radiation-elapsed*2);state.bleeding=Math.max(0,state.bleeding-elapsed);
 const start=Math.max(Number(raw.lastUpdate)||now,Number(state.diarrheaUntil)||0);
 state.energy=state.diarrheaUntil>now?0:Math.min(100,state.energy+Math.max(0,now-start)/600*staminaRecoveryMultiplier());
}
function syncWorldClock(){
 const now=Date.now(),dt=Math.max(0,(now-(state.clockAt||now))/1000);state.clockAt=now;
 if(!dt)return;
 if(document.hidden){state.playTime=(state.playTime+dt)%480;return;}
 advanceDayClock(dt);
}
function newQuest(){
 const kill=Math.random()<.4,items=baseLevel()>=10?['scrap','circuit','cloth','tail','fang','artifact','tarpaulin','radioParts','weaponParts']:['scrap','circuit','cloth','tail','fang','artifact'];
 const item=items[Math.floor(Math.random()*items.length)],count=kill?4+Math.floor(Math.random()*5):item==='artifact'||Object.hasOwn(RARE_ITEMS,item)?2:4+Math.floor(Math.random()*5);
 return {id:'bar-'+(++state.questSerial),type:kill?'kill':'fetch',item:kill?null:item,count,progress:0,title:kill?'Убрать стаю':{scrap:'Металл для кордона',circuit:'Починить связь',cloth:'Перевязочный запас',tail:'Следы стаи',fang:'Клыки на обмен',artifact:'Заказ на «Искру»',tarpaulin:'Крыша для лагеря',radioParts:'Запчасти для связи',weaponParts:'Запас для оружейной'}[item],money:kill?350:Math.max(150,Math.ceil(ITEMS[item].price*count*1.3)),rep:kill?30:25,xp:kill?30:20};
}
function refreshQuests(force=false){
 if(force||Date.now()>=state.questsRefreshAt){state.questOffers=[];state.questsRefreshAt=Date.now()+QUEST_REFRESH_MS;}
 const slots=Math.max(0,questLimit()-state.activeQuests.length);
 state.questOffers=state.questOffers.slice(0,slots);
 while(state.questOffers.length<slots)state.questOffers.push(newQuest());
}
function questProgress(q){return q.type==='kill'?q.progress:Math.min(q.count,state.items[q.item]||0);}
function questDescription(q){return q.type==='kill'?'Уничтожить '+q.count+' монстров после принятия задания.':'Принести '+ITEMS[q.item].name.toLowerCase()+' ×'+q.count+'.';}
function questCard(q,active){const progress=questProgress(q);return '<div class="quest contract"><span class="eyebrow">'+(active?'ЗАДАНИЕ ПРИНЯТО':'НОВОЕ ПОРУЧЕНИЕ')+'</span><b>'+q.title+'</b><p>'+questDescription(q)+(active?' · '+progress+'/'+q.count:'')+'</p><small>'+q.money+' ₽ · '+q.rep+' репутации · '+q.xp+' опыта</small><button class="'+(active?'secondary':'primary')+'" id="'+(active?'claim-':'accept-')+q.id+'" '+(active&&progress<q.count?'disabled':'')+'>'+(active?'Сдать задание':'Взять задание')+'</button></div>';}
function baseBenefitsHTML(){const n=baseLevel();return '<div class="base-rank"><div><span class="eyebrow">РЕПУТАЦИЯ БАЗЫ</span><b>Уровень '+n+' / 10</b></div><strong>'+state.rep+' реп.</strong><div class="rank-track"><i style="width:'+(n===10?100:state.rep%100)+'%"></i></div><small>'+(n===10?'Два задания · подвал · склад':(100-state.rep%100)+' репутации до следующего уровня')+'</small><p>Услуги и покупки −'+(n*5)+'% · продажа +'+(n*2)+'%'+(n?' · успех у техника +5 п.п.':'')+'</p></div>';}
function openBartender(){
 if(state.mode!=='base')return false;refreshQuests();
 openModal('<span class="eyebrow">ЛЮДИ КОРДОНА</span><h2 id="modalTitle">Бармен</h2><p>«У базы всегда есть работа. Принеси припасы или разберись со стаей».</p>'+baseBenefitsHTML()+'<h3>Поручения · '+state.activeQuests.length+' / '+questLimit()+'</h3>'+state.activeQuests.map(q=>questCard(q,true)).join('')+state.questOffers.map(q=>questCard(q,false)).join('')+(state.activeQuests.length>=questLimit()?'<p class="inventory-help">Заверши принятое поручение, чтобы взять следующее.</p>':'<p class="inventory-help">Свободные поручения меняются каждые 5 минут и после возвращения. Принятые остаются.</p>')+barShopHTML());
 modalNpc=0;window.Hubs62?.decorate(0);modalReturn=openPeople;bindBarShop();for(const q of state.questOffers)bind('accept-'+q.id,()=>acceptQuest(q.id));for(const q of state.activeQuests)bind('claim-'+q.id,()=>claimQuest(q.id));save();return true;
}
function acceptQuest(id){
 if(state.mode!=='base'||modalNpc!==0||state.activeQuests.length>=questLimit())return false;
 const q=state.questOffers.find(q=>q.id===id);if(!q)return false;
 state.activeQuests.push({...q,progress:0});state.questOffers=state.questOffers.filter(q=>q.id!==id);state.quest='active';save();render();openBartender();AudioFX.play('click');return true;
}
function claimQuest(id){
 if(state.mode!=='base'||modalNpc!==0)return false;const q=state.activeQuests.find(q=>q.id===id);if(!q||questProgress(q)<q.count)return false;
 const before=baseLevel();if(q.type==='fetch')state.items[q.item]-=q.count;
 state.activeQuests=state.activeQuests.filter(q=>q.id!==id);state.money+=q.money;state.rep+=q.rep;addXP(q.xp);state.quest=state.activeQuests.length?'active':'done';refreshQuests();save();render();openBartender();
 AudioFX.play('coin');toast(baseLevel()>before?'База выросла до уровня '+baseLevel()+'!':'Задание выполнено: +'+q.rep+' репутации.');return true;
}
function recordQuestKill(){for(const q of state.activeQuests)if(q.type==='kill')q.progress=Math.min(q.count,q.progress+1);}
function activeQuestHTML(){return state.activeQuests.map(q=>'<div class="story-quest"><span class="eyebrow">ПОРУЧЕНИЕ БАРМЕНА</span><div class="expedition-quest-heading"><b>'+q.title+'</b><span>'+questProgress(q)+' / '+q.count+'</span></div><p>'+questDescription(q)+'</p></div>').join('');}
function dungeonOfferHTML(){if(baseLevel()<10)return '<div class="quest"><b>'+uiIcon('dungeon')+' Подземная лаборатория</b><p>Откроется на 10-м уровне базы · 1000 репутации.</p></div>';const seconds=dungeonCooldown();return '<div class="quest dungeon-offer"><span class="eyebrow">ПОРУЧЕНИЕ СКУПЩИКА</span><b>'+uiIcon('dungeon')+' Спуститься в лабораторию</b><p>5 минут на поиск. Меньше находок, редкие детали не гарантированы. В темноте встречаются чупакабры. Брезент, радиодетали и детали оружия для снаряжения II.</p><small>Новый спуск раз в 45 минут. При смерти теряется 30% ресурсов рюкзака.</small><button class="primary" id="dungeon-start" '+(seconds||sickSeconds()||state.energy<staminaCost(8)?'disabled':'')+'>'+(seconds?'Доступно через '+timeLabel(seconds):'Взять задание и спуститься')+'</button></div>';}
function startDungeon(){
 if(state.mode!=='base'||modalNpc!==1||baseLevel()<10||dungeonCooldown()||sickSeconds()||state.energy<staminaCost(8))return false;
 const now=Date.now();state.dungeon={endsAt:now+DUNGEON_MS,location:state.location};state.dungeonReadyAt=now+DUNGEON_COOLDOWN_MS;state.energyDrinkUsed=false;grantRest();closeModal();state.mode='expedition';state.expeditionSerial=Math.max(0,Math.floor(Number(state.expeditionSerial)||0))+1;AudioFX.play('depart');state.expeditionTurns=0;round=0;walk('crate');save();toast('Лаборатория: 5 минут. Время идёт даже с закрытой игрой.');return true;
}
function finishDungeon(){if(!dungeonActive())return false;state.dungeon=null;returnToBase('Время в лаборатории вышло. Вернулись на базу с добычей.');return true;}
function dungeonLoot(){
 const found={scrap:1+Math.floor(Math.random()*2)};
 if(Math.random()<.45)found.circuit=1;if(Math.random()<.40)found.cloth=1;
 if(Math.random()<.10){const rare=Object.keys(RARE_ITEMS);found[rare[Math.floor(Math.random()*rare.length)]]=1;}
 if(Math.random()<.04)found.medkit=1;if(Math.random()<.03)found.vodka=1;if(Math.random()<.02)found.energy=1;
 return found;
}
function updateProgressionUI(){
 const base=state.mode==='base',n=baseLevel();if(updateProgressionUI.rank!==undefined&&n>updateProgressionUI.rank){AudioFX.play('levelUp');toast('База выросла до уровня '+n+'!');}updateProgressionUI.rank=n;const storage=$('warehouseButton'),timer=$('dungeonTimer');
 if(storage){storage.hidden=!base||n<10;storage.onclick=openWarehouse;}
 if(timer){timer.hidden=!dungeonActive();timer.textContent='ЛАБОРАТОРИЯ · '+timeLabel(dungeonSeconds());}
 if(dungeonActive()&&Date.now()>=state.dungeon.endsAt)finishDungeon();
 if(base&&modalNpc===0&&Date.now()>=state.questsRefreshAt)openBartender();
 if(base&&modalNpc===1&&$('dungeon-start')){const s=dungeonCooldown();$('dungeon-start').disabled=!!s||!!sickSeconds()||state.energy<staminaCost(8);$('dungeon-start').textContent=s?'Доступно через '+timeLabel(s):'Взять задание и спуститься';}
}
function openWarehouse(){
 if(state.mode!=='base'||baseLevel()<10)return false;
 openModal('<span class="eyebrow">БАЗА · ХРАНИЛИЩЕ</span><h2 id="modalTitle">Склад</h2><p>5 ячеек. Каждая хранит до '+WAREHOUSE_STACK+' предметов одного вида. Склад доступен только на базе; вещи здесь не облучают.</p><div class="warehouse-grid">'+state.warehouse.map((s,i)=>'<button class="warehouse-slot '+(s?'filled':'')+'" id="warehouse-'+i+'"><small>Ячейка '+(i+1)+'</small>'+(s?itemIcon(s.key)+'<b>'+ITEMS[s.key].name+'</b><strong>×'+s.count+'</strong>':uiIcon('plus')+'<b>Пусто</b>')+'</button>').join('')+'</div>','inventory');modalNpc=null;
 for(let i=0;i<5;i++)bind('warehouse-'+i,()=>openWarehouseSlot(i));return true;
}
function openWarehouseSlot(i){
 if(state.mode!=='base'||baseLevel()<10||!Number.isInteger(i)||i<0||i>=5)return false;
 const s=state.warehouse[i];
 openModal('<span class="eyebrow">СКЛАД · ЯЧЕЙКА '+(i+1)+'</span><h2 id="modalTitle">'+(s?ITEMS[s.key].name:'Сложить предметы')+'</h2>'+(s?'<div class="storage-item">'+itemIcon(s.key)+'<b>×'+s.count+'</b></div><div class="action-row"><button class="secondary" id="take-one">Забрать…</button></div>':'')+'<p>Нажми на предмет и выбери количество ползунком (до '+WAREHOUSE_STACK+' шт.).</p><div class="inventory-grid">'+Object.keys(ITEMS).filter(k=>state.items[k]>0&&(!s||s.key===k)).map(k=>'<button class="item-card" id="store-'+k+'">'+itemIcon(k)+'<b>'+ITEMS[k].name+'</b><small>В рюкзаке ×'+state.items[k]+'</small></button>').join('')+'</div><button class="secondary storage-back" id="storage-back">К складу</button>','inventory');modalNpc=null;
 bind('storage-back',openWarehouse);bind('take-one',()=>chooseWarehouseQuantity(i,s.key,false));bind('take-all',()=>chooseWarehouseQuantity(i,s.key,false));for(const k of Object.keys(ITEMS))bind('store-'+k,()=>chooseWarehouseQuantity(i,k,true));return true;
}
function chooseWarehouseQuantity(i,key,deposit){
 if(state.mode!=='base'||baseLevel()<10)return false;
 const slot=state.warehouse[i];
 const max=deposit?Math.min(state.items[key]||0,WAREHOUSE_STACK-(slot?.count||0)):Math.min(slot?.count||0,Math.max(0,capacity()-(state.items[key]||0)));
 return selectQuantity(key,max,deposit?'На склад':'В рюкзак',n=>transferWarehouse(i,key,deposit?n:-n),()=>openWarehouseSlot(i));
}
function transferWarehouse(i,key,amount){
 if(state.mode!=='base'||baseLevel()<10||!Number.isInteger(i)||i<0||i>=5||!Number.isInteger(amount)||!amount)return false;
 const s=state.warehouse[i];let n=0;
 if(amount>0){if(!Object.hasOwn(ITEMS,key)||s&&s.key!==key)return false;n=Math.min(amount,state.items[key],WAREHOUSE_STACK-(s?.count||0));if(n<=0)return false;state.items[key]-=n;state.warehouse[i]={key,count:(s?.count||0)+n};}
 else{if(!s)return false;n=Math.min(-amount,s.count,Math.max(0,capacity()-state.items[s.key]));if(n<=0){toast('В рюкзаке нет места.');return false;}state.items[s.key]+=n;s.count-=n;if(!s.count)state.warehouse[i]=null;}
 AudioFX.play('inventory');save();render();openWarehouseSlot(i);return true;
}
function advancedRecipesHTML(){if(state.location!==0)return '';const ready=baseLevel()>=10&&fullyModified();return '<h3 class="recipe-heading">Снаряжение II</h3><p>Нужны 10-й уровень базы и все модификации 10/10. Уровни модификаций сохраняются при переходе.</p><div class="mod-checklist">'+MOD_KEYS.map(k=>'<span class="'+(state.upgrades[k]>=10?'complete':'')+'">'+TECH_OPTIONS[k].name+': '+state.upgrades[k]+'/10</span>').join('')+'</div>'+Object.entries(ADVANCED_RECIPES).map(([key,r])=>'<div class="tech-upgrade"><b class="tech-name">'+itemIcon(key)+' '+GEAR[key].name+'</b><p>'+GEAR[key].desc+'</p>'+(state.ownedGear.includes(key)?'<small>СОБРАН</small>':'<p class="upgrade-cost">'+servicePrice(r.money)+' ₽ · '+r.base.map(k=>GEAR[k].name).concat(Object.entries(r.materials).map(([k,n])=>ITEMS[k].name+' ×'+n)).join(' + ')+'</p><span class="upgrade-odds">Шанс успеха '+Math.round(techChance(.8)*100)+'%</span><button class="secondary" id="advanced-'+key+'" '+(!ready||!canCraftAdvanced(key)?'disabled':'')+'>Создать снаряжение II</button>')+'</div>').join('');}
function canCraftAdvanced(key){const r=ADVANCED_RECIPES[key];return state.location===0&&!!r&&baseLevel()>=10&&fullyModified()&&!state.ownedGear.includes(key)&&r.base.every(k=>state.ownedGear.includes(k))&&state.money>=servicePrice(r.money)&&Object.entries(r.materials).every(([k,n])=>state.items[k]>=n);}
function craftAdvanced(key){
 if(state.mode!=='base'||modalNpc!==2||!canCraftAdvanced(key))return false;
 const r=ADVANCED_RECIPES[key];state.money-=servicePrice(r.money);for(const [k,n]of Object.entries(r.materials))state.items[k]-=n;
 const success=Math.random()<techChance(.8);
 if(success){state.ownedGear=state.ownedGear.filter(k=>!r.base.includes(k));state.ownedGear.push(key);window.Gear78?.reset(key);const slot=GEAR[key].slot;if(r.base.includes(state.equipment[slot]))state.equipment[slot]=key;}
 AudioFX.play(success?'craft':'upgradeFail');save();render();openTech('equipment');toast(success?GEAR[key].name+' готово. Модификации сохранены.':'Неудача. Оплата и материалы потрачены, снаряжение сохранено.');return success;
}
function drawDungeon(t){
 if(!dungeonActive())return false;
 if(artReady('dungeon')){const img=WORLD_ART.dungeon,p=event?Math.min(1,(event.created-walkStarted)/2600):Math.min(1,(t-walkStarted)/2600),z=1.02+p*.1;const scale=Math.max(900/img.naturalWidth,800/img.naturalHeight)*z,w=img.naturalWidth*scale,h=img.naturalHeight*scale;ctx.drawImage(img,(900-w)/2,(800-h)/2,w,h);return true;}
 ctx.fillStyle='#161b1d';ctx.fillRect(0,0,900,800);
 const depth=event?0:((t-walkStarted)%4200)/4200;
 for(let i=0;i<=5;i++){const p=(i+depth)/6,s=.16+(1-p)*.84,x=450-420*s,y=350-280*s;ctx.fillStyle=i%2?'#242a29':'#303533';ctx.fillRect(x,y,840*s,650*s);ctx.strokeStyle='#101619';ctx.lineWidth=6*s;ctx.strokeRect(x,y,840*s,650*s);for(let j=1;j<6;j++){line(ctx,x,y+j*110*s,x+840*s,y+j*110*s,'#18201f',3*s);line(ctx,x+(j%2?210:420)*s,y+(j-1)*110*s,x+(j%2?210:420)*s,y+j*110*s,'#18201f',3*s);}}
 ctx.fillStyle='#0a1011';ctx.fillRect(375,282,150,240);
 path(ctx,[[0,800],[340,520],[560,520],[900,800]],'#333935');
 for(let i=0;i<7;i++)line(ctx,330-i*54,550+i*39,570+i*54,550+i*39,'#1a2220',3);
 line(ctx,90,100,90,730,'#4f554b',18);line(ctx,93,100,93,730,'#747567',3);
 const glow=ctx.createRadialGradient(450,170,5,450,200,340);glow.addColorStop(0,'#bcad6938');glow.addColorStop(1,'#a8944c00');ctx.fillStyle=glow;ctx.fillRect(90,0,720,640);ellipse(ctx,450,150,15,7,'#b8a96e');return true;
}
