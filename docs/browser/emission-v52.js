'use strict';
(() => {
 const legacyRiddles=[
  {q:'Новенький заходит в хату. На столе шахматы и нарды. С чего начнёшь?',a:['С приветствия','С шахмат','С дележа ставок'],ok:0,why:'Сперва поздоровайся, потом за стол садись.'},
  {q:'На стол положили нож и хлеб. Говорят: «Бери что хочешь». А ты сыт. Что возьмёшь первым?',a:['Нож','Хлеб','Ничего: я не голоден'],ok:2,why:'Не обязан хватать то, что тебе навязывают.'},
  {q:'В камере четыре угла. В каждом сидит человек. Каждый видит троих. Сколько людей в камере?',a:['Двенадцать','Четыре','Шестнадцать'],ok:1,why:'Всего четверо: каждый видит остальных троих.'},
  {q:'В хате погас свет. Есть свеча, керосинка и одна спичка. Что зажжёшь первым?',a:['Керосинку','Спичку','Свечу'],ok:1,why:'Без спички ни свечу, ни керосинку не зажечь.'},
  {q:'У решётки висит замок. Ключ у тебя, но дверь уже открыта. Как выйдешь?',a:['Через открытую дверь','Сначала сломаю замок','Буду искать отмычку'],ok:0,why:'Не ищи подвох там, где проход уже открыт.'},
  {q:'Два конвоира ведут двоих арестантов. Всего у них восемь ног. Сколько людей идёт?',a:['Шесть','Восемь','Четыре'],ok:2,why:'Два конвоира и двое арестантов — четверо.'}
 ];
 const riddles=[
  {
    "q": "Заходишь в хату. Братва молча смотрит. Первые слова?",
    "a": [
      "Здорово, мужики. Куда вещи поставить?",
      "Ну что, кто тут главный?",
      "Подвиньтесь, хозяин пришёл"
    ],
    "ok": 0,
    "why": "«Сначала поздоровался — уже не совсем потерянный», — хмыкает главарь."
  },
  {
    "q": "«Вилкой в глаз или в жопу раз?» — лыбится бандит. Твой ответ?",
    "a": [
      "Давай вилку",
      "Давай второе",
      "Свою вилку сам и испытывай"
    ],
    "ok": 2,
    "why": "«Ха! Не стал выбирать из двух подстав. Ладно, живи»."
  },
  {
    "q": "При входе тебе под ноги кидают полотенце. Что делаешь?",
    "a": [
      "Подниму и вытру ботинки",
      "Перешагну и поздороваюсь",
      "Брошусь стирать"
    ],
    "ok": 1,
    "why": "«Не нанимался ты нам полы мыть. Проходи», — бандит убирает тряпку."
  },
  {
    "q": "«Ты по жизни кто?» — спрашивают с порога.",
    "a": [
      "Сталкер. От выброса укрыться пришёл",
      "Кем скажете, тем и буду",
      "Начальник вашей помойки"
    ],
    "ok": 0,
    "why": "«За себя ответил и цирк не устроил. Пойдёт»."
  },
  {
    "q": "Бандит суёт грязную кружку: «Помоешь за мной, новенький?»",
    "a": [
      "За всеми сразу помою",
      "Свою помою, твою — ты сам",
      "Разобью об стену"
    ],
    "ok": 1,
    "why": "«Своё от чужого отличаешь. Уже хорошо»."
  },
  {
    "q": "«На нары полезешь или под нары?» — предлагают выбрать.",
    "a": [
      "Сразу под нары",
      "На самые верхние, с разбега",
      "Сперва спрошу, где свободно"
    ],
    "ok": 2,
    "why": "«А то разлёгся бы на чужом месте. Садись вон на ящик»."
  },
  {
    "q": "Тебе протягивают руку, но ладонь вымазана сажей. «Жми, брат!»",
    "a": [
      "Поздороваюсь словами, сажу оставь себе",
      "Пожму и вытру о лицо",
      "Лизну, чтобы проверить"
    ],
    "ok": 0,
    "why": "«Не купился! Сажа от печки, а ты уже перепугался?» — ржёт братва."
  },
  {
    "q": "«За базар отвечаешь?» — спрашивает здоровяк.",
    "a": [
      "За весь ваш базар",
      "Только за свои слова",
      "Я вообще немой"
    ],
    "ok": 1,
    "why": "«Вот и не подписывайся за чужие языки»."
  },
  {
    "q": "На табуретке лежит шапка. «Садись, место свободно!»",
    "a": [
      "Сяду прямо на шапку",
      "Швырну шапку в печку",
      "Спрошу, чья шапка и можно ли убрать"
    ],
    "ok": 2,
    "why": "«Глазами пользуешься. А мы уж думали, жопой думаешь»."
  },
  {
    "q": "«Чай будешь? Сахар свой или наш?» А сахара у тебя нет.",
    "a": [
      "Скажу: своего нет, сколько ваш стоит?",
      "Скажу: мой, конечно",
      "Заберу всю сахарницу"
    ],
    "ok": 0,
    "why": "«Без вранья и халявы. Держи кусок, за счёт заведения»."
  },
  {
    "q": "На полу купюра. Бандит: «Ничья, подбирай».",
    "a": [
      "Схвачу и спрячу",
      "Сначала спрошу у всех, кто обронил",
      "Прижму ботинком и станцую"
    ],
    "ok": 1,
    "why": "«Ага, ничья. Только что из моего кармана. Не жадный — зачёт»."
  },
  {
    "q": "«Ты крыса или петух?» — опять предлагают два варианта.",
    "a": [
      "Крыса, она хоть мелкая",
      "Петух, он поёт",
      "Сталкер. Ваш зверинец без меня"
    ],
    "ok": 2,
    "why": "«Свой ответ нашёл. Ладно, зоопарк закрываем»."
  },
  {
    "q": "Бандит кладёт хлеб на грязный сапог: «Будешь уважать?»",
    "a": [
      "Хлеб уважаю. Сапог убери",
      "Съем вместе с грязью",
      "Растопчу хлеб"
    ],
    "ok": 0,
    "why": "«Хлеб от сапога отделил. А то некоторые и шнурки жуют»."
  },
  {
    "q": "«Дверь за собой закрой. Только руками не трогай!»",
    "a": [
      "Ударю ногой со всей силы",
      "Спрошу: ручкой можно?",
      "Так и останусь в дверях"
    ],
    "ok": 1,
    "why": "«Ручкой можно, артист. Проверяли, думаешь ли»."
  },
  {
    "q": "«Заходи как домой!» — зовут бандиты.",
    "a": [
      "Сразу лягу на чужую койку",
      "Начну искать, что у них поесть",
      "Поздороваюсь и спрошу, куда сесть"
    ],
    "ok": 2,
    "why": "«Гость ты пока, а не хозяин. Верно понял»."
  },
  {
    "q": "Бандит протягивает ложку с дыркой: «Суп хлебать будешь?»",
    "a": [
      "Буду. Но ложку дай целую",
      "Буду через дырку высасывать",
      "Спрячу ложку как артефакт"
    ],
    "ok": 0,
    "why": "«Не стал под дырявую ложку приспосабливаться. На, держи нормальную»."
  },
  {
    "q": "«У нас всё общее. Выкладывай рюкзак!» Но никто свой не открыл.",
    "a": [
      "Выверну всё до последнего бинта",
      "Начните со своих, посмотрим на это общее",
      "Отдам ещё и ботинки"
    ],
    "ok": 1,
    "why": "«Общий тут только сквозняк», — хохочет главарь. «Рюкзак оставь»."
  },
  {
    "q": "На пороге мелом черта: «Перешагнёшь — должен, не перешагнёшь — тоже должен».",
    "a": [
      "Запишу два долга",
      "Лягу поперёк черты",
      "Кому и за что? Мел ваш — долг ваш"
    ],
    "ok": 2,
    "why": "«Бухгалтер выискался! Ладно, долг списан вместе с мелом»."
  }
];
 const questionBank=d=>d.riddleBank===2?riddles:legacyRiddles;
 const stories=[
  'Седой, сидящий у ящика: «На Старом заводе я слышал Ржавую пасть раньше, чем увидел. Скрежет шёл из цеха, где давно нет электричества. Не беги на звук: там железо само будто дышит».',
  'Март, у стены: «У радиоузла пропала группа военных. До этого они сняли у одиночек все припасы и выгнали раненого с поста. Ночью из леса пошли их позывные. Только голос был один на всех. Говорят, Радиоэхо запоминает тех, кто подходит слишком близко».',
  'Шило, перебирающий сумку: «В лаборатории встретил чупакабру. Фонарь мигнул — и она уже рядом. После удара её раны затянулись. С тех пор батарейки проверяю раньше, чем патроны».',
  'Седой: «Болотный страж не любит шума. Один умник полез через камыш с жестяными банками на рюкзаке. Назад приплыл только рюкзак. Банки всё ещё звенели».',
  'Март: «В Забытом районе военные согнали людей под стену: искали артефакты. Кто-то крикнул, что идёт Смотритель. Солдаты заперлись в машине, а людей бросили снаружи. Выжившие теперь на форму даже не смотрят».',
  'Шило: «Пепельный вожак идёт не на запах мяса, а по старым меткам. Видишь чёрную смолу на стенах — думай, кто и зачем оставил её перед тобой».'
 ];
 for(const name of ['emission','empty','loners','bandits']){const im=new Image();im.src='assets/emission-v52/'+name+'.png';WORLD_ART['emission52-'+name]=im;}
 const active=()=>state.mode==='expedition'&&event?.type==='emission'&&!event.resolved&&!!event.emission52;
 const sheltered60=()=>active()&&event.phase==='sheltered';
 const ready=()=>active()&&!document.hidden&&!exhaustionOpen&&$('modalBackdrop').hidden;
 function prepare(e){
  const shelterSection=1+Math.floor(Math.random()*10),found=true,roll=Math.random(),occupants=roll<.5?'empty':roll<.75?'loners':'bandits';
  e.emission52={version:1,riddleBank:2,found,occupants,shelterSection,sections:0,nextSectionAt:0,stage:'run',questions:shuffle(riddles.map((_,i)=>i)).slice(0,3),answers:[],feedback:null,story:0,text:'',trades:[],selected:null};window.Storm56?.begin(e);
 }
 // Legacy unopened events get a stable route without rerolling their occupants or quiz.
 function route(d){if(d.shelterSection===undefined){d.shelterSection=d.found?1:10;d.sections=0;d.nextSectionAt=0;d.found=true;}return d;}
 function fail(){if(!active()||event.emission52.stage!=='run')return false;if(!rareDamage(30,20))return true;return rareFinish('Выброс настиг','Укрытие не найдено. Фронт выброса: −30 HP, +20 радиации.',{},5);}
 function run(){
  if(window.Storm56?.active())return window.Storm56.start();
  if(!ready()||event.emission52.stage!=='run')return false;
  if(Date.now()>=event.deadlineAt)return fail();
  const d=route(event.emission52);if(Date.now()<d.nextSectionAt)return false;
  d.sections++;d.nextSectionAt=Date.now()+2000;
  if(d.sections<d.shelterSection){AudioFX.play('click');save();renderAction();return true;}
  d.stage=d.occupants;event.phase='sheltered';event.shelterStartedAt60=Date.now();event.shelterUntil=event.shelterStartedAt60+90000;event.shelterVersion60=1;
  AudioFX.play('shelter-door60');if(d.stage==='bandits')AudioFX.play('bandit-hail52');save();renderAction();return true;
 }
 function finishShelter60(...args){const d=event.emission52;d.finish60={args};d.stage='waiting';save();renderAction();return true;}
 function stop60(){for(const key of Object.keys(state.items))state.items[key]=0;state.hp=50;state.bleeding=0;state.gopStop52=true;AudioFX.play('bandit-stop52');returnToBase('Гоп-стоп! Бандиты забрали весь лут. На базе: 50 HP.');save();showStop();return true;}
 function depart(){
  if(!ready())return false;const d=event.emission52;
  if(!['empty','loners','waiting'].includes(d.stage))return false;
  if(Date.now()<event.shelterUntil){toast('Выброс ещё гремит снаружи.');return false;}
  AudioFX.play('shelter-door60');
  if(d.finish60?.stop)return stop60();
  if(d.finish60?.args)return rareFinish(...d.finish60.args);
  return rareFinish('Выброс прошёл','Переждали в подвале. Можно продолжать путь.',{},10);
 }
 function talk(){if(!ready()||event.emission52.stage!=='loners')return false;const d=event.emission52;d.text=stories[d.story%stories.length];d.story++;save();renderAction();return true;}
 const offers=[{take:'cloth',n:3,give:'circuit',m:2},{take:'scrap',n:2,give:'cloth',m:3}];
 function trade(i){
  if(!ready()||event.emission52.stage!=='loners'||!Number.isInteger(i)||!offers[i])return false;
  const d=event.emission52,o=offers[i];if(d.trades.includes(i)||state.items[o.take]<o.n||capacity()-state.items[o.give]<o.m)return false;
  state.items[o.take]-=o.n;state.items[o.give]+=o.m;d.trades.push(i);d.text='Шило: «По рукам. Ещё встретимся». Обмен завершён.';AudioFX.play('inventory');save();renderAction();updateVitals();return true;
 }
 function trader(){
  if(!active()||event.emission52.stage!=='loners')return false;
  openModal('<h2 id="modalTitle">Март · скупщик</h2><p>Покупает находки на 25% дороже обычного скупщика.</p><div class="inventory-grid">'+Object.keys(ITEMS).filter(k=>state.items[k]>0).map(k=>'<button class="item-card" id="b52-sell-'+k+'">'+itemIcon(k)+'<b>'+ITEMS[k].name+'</b><small>×'+state.items[k]+' · '+price(k)+' ₽/шт.</small></button>').join('')+'</div>'+(window.Loners53?'<button class="secondary" id="npc53-trader-back">К диалогу с Мартом</button>':''));modalNpc=null;bind('npc53-trader-back',()=>window.Loners53?.dialogue('mart'));
  for(const k of Object.keys(ITEMS))bind('b52-sell-'+k,()=>selectQuantity(k,state.items[k],'Продать',n=>sell(k,n),trader,price(k)));return true;
 }
 const price=k=>Math.ceil(salePrice(ITEMS[k].price)*1.25);
 function sell(key,n,confirmed=false){
  if(!active()||event.emission52.stage!=='loners'||!ITEMS[key]||!Number.isInteger(n)||n<=0||n>state.items[key])return false;
  const uses=questItemUses(key);if(uses.length&&!confirmed){openModal('<h2 id="modalTitle">Вы уверены?</h2><p>'+ITEMS[key].name+' используется для квеста: '+uses.join(', ')+'. Продать ×'+n+'?</p><button class="primary" id="b52-confirm">Продать</button><button class="secondary" id="b52-cancel">Отмена</button>');bind('b52-confirm',()=>sell(key,n,true));bind('b52-cancel',trader);return false;}
  state.items[key]-=n;state.money+=price(key)*n;AudioFX.play('coin');save();updateVitals();trader();return true;
 }
 function answer(i){
  if(!ready()||event.emission52.stage!=='bandits'||!Number.isInteger(i)||i<0||i>2)return false;
  const d=event.emission52;if(d.feedback!==null||d.answers.length>=3)return false;
  const q=questionBank(d)[d.questions[d.answers.length]],ok=i===q.ok;d.answers.push({choice:i,ok});d.feedback={choice:i,ok,why:q.why};
  AudioFX.play(ok?'bandit-yes52':'bandit-no52');save();renderAction();return true;
 }
 function next(){
  if(!ready()||event.emission52.stage!=='bandits'||event.emission52.feedback===null)return false;
  const d=event.emission52;d.feedback=null;if(d.answers.length<3){save();renderAction();return true;}
  const score=d.answers.filter(a=>a.ok).length;d.score=score;
  if(score===3){state.money+=500;return finishShelter60('Красава · 3/3','Ответил на все загадки. Бандиты отдали 500 ₽ и деталь оружия.',{weaponParts:1},30,3);}
  if(score===2)return finishShelter60('Свободен · 2/3','«Ладно, сталкер, иди с миром». Отпустили без платы.',{},10);
  if(score===1){d.stage='tribute';save();renderAction();return true;}
  d.finish60={stop:true};d.stage='waiting';save();renderAction();return true;
 }
 function select(key){if(!ready()||event.emission52.stage!=='tribute'||!ITEMS[key]||!state.items[key])return false;event.emission52.selected=key;save();renderAction();return true;}
 function pay(){
  if(!ready()||event.emission52.stage!=='tribute')return false;const key=event.emission52.selected;
  if(!key||!state.items[key])return false;const n=state.items[key];state.items[key]=0;return finishShelter60('Откупился · 1/3','Отдали всю категорию: '+ITEMS[key].name+' ×'+n+'. Бандиты выпустили тебя.',{},5);
 }
 function showStop(){if(!state.gopStop52||state.mode!=='base')return false;openModal('<div class="status-illustration"><img src="assets/emission-v52/bandits.png" alt="Бандиты в подвале"></div><h2 id="modalTitle">Гоп-стоп!</h2><p>0/3. Весь лут забрали. Ты вернулся на базу с 50 HP. Деньги и экипировка сохранены.</p><button class="primary" id="b52-stop-ok">На базу</button>','danger');bind('b52-stop-ok',()=>{state.gopStop52=false;save();closeModal();});return true;}
 function render(){
  if(window.Storm56?.renderDoor())return true;
  if(!active())return false;const d=route(event.emission52),actions=[];let title='Выброс',desc='',mini='';
  const add=(id,text,fn,disabled=false,cls='')=>actions.push({id,fn,html:'<button class="secondary '+cls+'" id="'+id+'" '+(disabled?'disabled':'')+'>'+text+'</button>'});
  if(d.stage==='run'){desc=window.Storm56?'Начинается Выброс. Ищи вход в убежище на дороге.':'Небо краснеет. Беги через участки — где-то впереди подвал. Пройдено: '+d.sections+' / 10.';mini='<div class="rare-countdown"><b id="rareTimer">'+Math.max(0,Math.ceil((event.deadlineAt-Date.now())/1000))+'</b><span>сек.</span></div>';if(window.Storm56)mini='';add('b52-run',Date.now()<d.nextSectionAt?'Бежишь…':'Бежать',run,Date.now()<d.nextSectionAt);}
  else if(d.stage==='empty'){title='Пустой подвал';desc='Никого. Тяжёлая дверь держит удар, с потолка сыплется пыль.';add('b52-leave','Дождаться конца и выйти',depart,Date.now()<event.shelterUntil);}
  else if(d.stage==='loners'&&window.Loners53){title='Одиночки в подвале';desc='Нажми на сталкера, чтобы поговорить. Седой — истории, Март — торговля, Шило — обмен.';add('b52-leave','Выйти после Выброса',depart,Date.now()<event.shelterUntil);}
  else if(d.stage==='loners'){title='Одиночки в подвале';desc=d.text||'Седой сидит у ящика. Март стоит у стены. Шило проверяет сумку. Здесь можно переждать, поговорить и поторговать.';add('b52-talk','Послушать сталкерские истории',talk);offers.forEach((o,i)=>add('b52-trade-'+i,ITEMS[o.take].name+' ×'+o.n+' → '+ITEMS[o.give].name+' ×'+o.m,()=>trade(i),d.trades.includes(i)||state.items[o.take]<o.n||capacity()-state.items[o.give]<o.m));add('b52-trader','Продать находки Марту',trader);add('b52-leave','Выйти после Выброса',depart,Date.now()<event.shelterUntil);}
  else if(d.stage==='waiting'){title='Пережидаем Выброс';desc=d.finish60?.stop?'Бандиты не выпускают наружу, пока гремит Выброс.':(d.finish60?.args?.[1]||'Осталось дождаться конца Выброса.');add('b52-leave','Выйти после Выброса',depart,Date.now()<event.shelterUntil);}
  else if(d.stage==='bandits'){
   title='Разговор по понятиям';const index=d.feedback?d.answers.length-1:d.answers.length,q=questionBank(d)[d.questions[Math.min(2,index)]];desc='Загадка '+(index+1)+' / 3. '+q.q;
   if(d.feedback){mini='<p class="bandit-feedback52 '+(d.feedback.ok?'correct':'wrong')+'">'+(d.feedback.ok?'Верно. ':'Мимо. ')+d.feedback.why+'</p>';q.a.forEach((a,i)=>add('b52-answer-'+i,a,()=>false,true,i===d.feedback.choice?'choice-selected52 '+(d.feedback.ok?'correct':'wrong'):''));add('b52-next',d.answers.length===3?'Узнать результат':'Следующая загадка',next);}
   else q.a.forEach((a,i)=>add('b52-answer-'+i,a,()=>answer(i)));
  }else if(d.stage==='tribute'){
   title='Откуп · 1/3';desc='Отдай одну категорию лута целиком. Выбери, с чем расстанешься.';const keys=Object.keys(ITEMS).filter(k=>state.items[k]>0);
   if(!keys.length)add('b52-empty','Показать пустой рюкзак',()=>finishShelter60('Нечего взять','Бандиты обыскали пустой рюкзак и вытолкнули тебя наружу.',{},0));
   for(const key of keys)add('b52-category-'+key,ITEMS[key].name+' · всё ×'+state.items[key],()=>select(key),false,d.selected===key?'choice-selected52':'');
   if(d.selected&&state.items[d.selected])add('b52-pay','Отдать '+ITEMS[d.selected].name+' ×'+state.items[d.selected],pay);
  }
  if(event.phase==='sheltered')mini+='<p class="shelter-wait60" id="shelterWait60">'+waitText60()+'</p>';
  const npcScene=d.stage==='loners'&&!!window.Loners53;
  setSceneInteraction('',npcScene?'':'<h3>'+title+'</h3><p>'+desc+'</p>');
  if(npcScene){mini+='<p class="npc53-hint">Нажми на сталкера, чтобы поговорить</p>';canvas.setAttribute('role','application');canvas.setAttribute('aria-label','Седой слева, Март у стены, Шило справа. Нажми на персонажа. Клавиатура: стрелки выбирают, Enter открывает диалог.');}
  buttons(mini+'<div class="rare-options event52-options">'+actions.map(a=>a.html).join('')+'</div>');for(const a of actions)bind(a.id,a.fn);return true;
 }
 function update(){horror60();window.Loners53?.update();if(!active()||document.hidden)return;if(sheltered60()&&$('shelterWait60'))$('shelterWait60').textContent=waitText60();if(event.emission52.stage==='run'){if($('rareTimer'))$('rareTimer').textContent=Math.max(0,Math.ceil((event.deadlineAt-Date.now())/1000));if(Date.now()>=event.deadlineAt)fail();else if($('b52-run')&&$('b52-run').disabled&&Date.now()>=route(event.emission52).nextSectionAt)renderAction();}else if(['empty','loners','waiting'].includes(event.emission52.stage)&&$('b52-leave'))$('b52-leave').disabled=Date.now()<event.shelterUntil;}
 function draw(t){
  if(window.Storm56?.draw(t))return true;
  if(window.Loners53?.draw(t))return true;
  if(event?.type!=='emission'||!event.emission52)return false;const d=event.emission52,name=d.stage==='run'?'emission':d.stage==='empty'?'empty':d.stage==='loners'?'loners':'bandits',key='emission52-'+name;
  if(!artReady(key))return false;const im=WORLD_ART[key],scale=Math.max(900/im.naturalWidth,800/im.naturalHeight),w=im.naturalWidth*scale,h=im.naturalHeight*scale;
  if(name==='loners'||name==='bandits'){
   // Keep all three NPCs in view instead of cropping the people at the edges.
   ctx.save();ctx.filter='blur(14px) brightness(.35)';ctx.drawImage(im,(900-w)/2,(800-h)/2,w,h);ctx.restore();
   const fit=Math.min(900/im.naturalWidth,800/im.naturalHeight),fw=im.naturalWidth*fit,fh=im.naturalHeight*fit;ctx.drawImage(im,(900-fw)/2,(800-fh)/2,fw,fh);
  }else ctx.drawImage(im,(900-w)/2,(800-h)/2,w,h);return true;
 }
 function waitText60(){const seconds=Math.max(0,Math.ceil((event.shelterUntil-Date.now())/1000));return seconds?'До выхода: '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0'):'Выброс стих. Можно выйти.';}
 const horrorCues60=[{at:4,length:15.13,key:'horror-creepy60'},{at:21,length:4.71,key:'horror-knock61'},{at:28,length:9.8,key:'horror-stuck61'},{at:40,length:5.1,key:'horror-voice60'},{at:47,length:3.39,key:'horror-thump61'},{at:52,length:3.04,key:'horror-ghost61'},{at:57,length:6.46,key:'horror-figure61'},{at:65,length:3.12,key:'horror-slam60'},{at:70,length:18.87,key:'horror-rage60'}];
 function horror60(){
  if(!sheltered60()||event.emission52.stage!=='empty'||document.hidden)return;
  const d=event.emission52,elapsed=(Date.now()-(event.shelterStartedAt60??event.shelterUntil-90000))/1000;d.horrorPlayedKeys61??=(d.horrorPlayed60||[]).map(i=>['horror-creepy60','horror-stuck61','horror-voice60','horror-slam60','horror-rage60'][i]).filter(Boolean);
  for(let i=0;i<horrorCues60.length;i++){const cue=horrorCues60[i];if(elapsed>=cue.at&&!d.horrorPlayedKeys61.includes(cue.key)){d.horrorPlayedKeys61.push(cue.key);if(elapsed<cue.at+cue.length)AudioFX.play(cue.key);save();}}
 }
 function drawDark60(){
  if(!sheltered60()||event.emission52.stage!=='empty')return false;
  const p=Math.max(0,Math.min(1,(Date.now()-(event.shelterStartedAt60??event.shelterUntil-90000))/90000)),radius=730-560*p;
  const gradient=ctx.createRadialGradient(450,430,radius*.2,450,430,radius);gradient.addColorStop(0,'rgba(0,0,0,0)');gradient.addColorStop(.6,'rgba(0,0,0,'+(.15+p*.35)+')');gradient.addColorStop(1,'rgba(0,0,0,'+(.4+p*.58)+')');
  ctx.save();ctx.fillStyle=gradient;ctx.fillRect(0,0,900,800);ctx.restore();return true;
 }
 function validate(e){const d=e.emission52;if(d)route(d);if(d&&e.phase==='sheltered'&&Number.isFinite(e.shelterUntil)&&!e.shelterVersion60){e.shelterStartedAt60=e.shelterUntil-8000;e.shelterUntil=e.shelterStartedAt60+90000;e.shelterVersion60=1;}return !!d&&d.version===1&&typeof d.found==='boolean'&&Number.isInteger(d.shelterSection)&&d.shelterSection>=1&&d.shelterSection<=10&&Number.isInteger(d.sections)&&d.sections>=0&&d.sections<=d.shelterSection&&Number.isFinite(d.nextSectionAt)&&['empty','loners','bandits'].includes(d.occupants)&&['run','door','empty','loners','bandits','tribute','waiting'].includes(d.stage)&&Array.isArray(d.questions)&&d.questions.length===3&&new Set(d.questions).size===3&&d.questions.every(i=>Number.isInteger(i)&&questionBank(d)[i])&&Array.isArray(d.answers)&&d.answers.length<=3&&d.answers.every(a=>a&&typeof a.ok==='boolean'&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<=2)&&Array.isArray(d.trades)&&d.trades.every(i=>i===0||i===1)&&(d.feedback===null||d.feedback&&typeof d.feedback.ok==='boolean')&&(e.phase!=='sheltered'||Number.isFinite(e.shelterUntil));}
 window.Emission52={sheltered60,drawDark60,active,prepare,run,render,update,draw,validate,depart,talk,trade,trader,sell,answer,next,select,pay,showStop,riddles,stories,locked:()=>active()};
})();
