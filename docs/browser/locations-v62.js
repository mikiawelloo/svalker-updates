'use strict';
(() => {
 const roles=['bar','buyer','tech'],files={bar:'bartender',buyer:'buyer',tech:'technician'},ids={bar:0,buyer:1,tech:2};
 const profiles=[
  {names:['Бармен','Скупщик','Техник'],places:['Старый бар','Торговый дом','Мастерская за стеной']},
  {names:['Уголь','Фома','Рыжий'],places:['Заводская столовая','Склад скупщика','Гараж']},
  {names:['Налим','Камыш','Паяльник'],places:['Бар в лодочной','Навес торговца','Радиомастерская']},
  {names:['Очкарик','Седан','Шплинт'],places:['Столовая связистов','Склад снабжения','Мастерская связистов']},
  {names:['Мартын','Архив','Домкрат'],places:['Уцелевшее кафе','Бывший магазин','Оружейная мастерская']}
 ];
 let loadedLocation=-1,signature='',down=null,pending=null,selected=null,hover=null,focused=null,turn=null,lastMode=null;
 const active=()=>state.mode==='base',usable=()=>active()&&!document.hidden&&!exhaustionOpen&&$('modalBackdrop').hidden&&!turn;
 const info=()=>window.LocationAssets62?.[state.location]||{};
 const key=(kind,l=state.location)=>'location62-'+l+'-'+kind;
 const replacements64={2:['bartender','technician','road'],3:['technician'],4:['bartender','technician']};
 function assetPath(kind,l=state.location){if(['buyer','technician'].includes(kind))return 'assets/refresh-v77/'+(l===0?'original78-'+(kind==='buyer'?'buyer':'tech'):(kind==='buyer'?'buyer':'tech')+'-'+l)+'.webp';if(kind==='hub')return 'assets/panorama-v74/'+l+'-yard'+(l===0?'-v82':'')+'.webp';const version=l>0&&['bartender','buyer','technician'].includes(kind)?65:replacements64[l]?.includes(kind)?64:l>0&&['bartender','buyer','technician'].includes(kind)?63:62;return 'assets/locations-v'+version+'/'+l+'/'+kind+'.webp';}
 function ensure(){
  if(!state.hub62||state.hub62.location!==state.location||!['yard','medyard',...roles,'doctor','scientist'].includes(state.hub62.view))state.hub62={location:state.location,view:'yard'};
  if(loadedLocation===state.location)return;
  for(const name of ['hub','road','interior','bartender','buyer','technician']){
   if(loadedLocation>=0)delete WORLD_ART[key(name,loadedLocation)];
   const im=new Image();im.src=assetPath(name);WORLD_ART[key(name)]=im;
  }
  loadedLocation=state.location;down=pending=selected=hover=focused=turn=null;signature='';
 }
 function view(){ensure();return state.hub62.view;}
 function profile(){return profiles[state.location]||profiles[0];}
 function sync(){
  window.Settlement82?.sync(active()&&state.location===0&&['yard','medyard'].includes(view()));
  const root=$('gameRoot'),scene=$('sceneSection');
  scene.classList.toggle('hub-scene62',active());
  const currentView=active()?view():null;
  root?.classList.toggle('hub-room62',!!currentView&&['bar','buyer','tech','doctor','scientist'].includes(currentView));
  root?.classList.toggle('hub-yard62',!!currentView&&['yard','medyard'].includes(currentView));
  const nav=$('hubNav62'),label=$('hubLabel62');if(!nav||!label)return;
  if(!active()){nav.hidden=label.hidden=true;down=pending=hover=turn=null;lastMode=state.mode;return;}
  ensure();if(lastMode&&lastMode!=='base')state.hub62.view='yard';lastMode=state.mode;
  const v=view(),sig=state.location+':'+v;label.hidden=false;
  label.textContent=LOCATIONS[state.location].name+' · '+(v==='yard'?'Поселение':v==='medyard'?'Медпункт · двор':(['doctor','scientist'].includes(v)?v==='doctor'?'Медпункт':'Полевая лаборатория':profile().places[roles.indexOf(v)]));
  nav.hidden=false;
  if(sig!==signature){signature=sig;focused=v==='yard'?'barDoor':v==='medyard'?'medicalDoor72':'npc';canvas.style.cursor='default';
   nav.innerHTML=(v==='yard'?'<button id="hubPanRight74" class="hub-nav-button62">Медпункт →</button>':v==='medyard'?'<button id="hubPanLeft74" class="hub-nav-button62">← Поселение</button>':'')+(['yard','medyard'].includes(v)?'':'<button id="hubBack62" class="hub-nav-button62" aria-label="Выйти на улицу">'+uiIcon('return')+' На улицу</button>')+(v==='tech'?'<button id="hubLeft62" class="hub-nav-button62" aria-label="Повернуться к скупщику">← Скупщик</button>':'')+(v==='doctor'?'<button id="hubRight72" class="hub-nav-button62" aria-label="Повернуться к учёному">Учёный →</button>':v==='scientist'?'<button id="hubLeft72" class="hub-nav-button62" aria-label="Повернуться к медику">← Медик</button>':'')+(v==='buyer'?'<button id="hubRight62" class="hub-nav-button62" aria-label="Повернуться к технику">Техник →</button>':'');
   bind('hubPanRight74',()=>go('medyard',true));bind('hubPanLeft74',()=>go('yard',true));bind('hubRight72',()=>go('scientist',true));bind('hubLeft72',()=>go('doctor',true));bind('hubBack62',()=>go(['doctor','scientist'].includes(view())?'medyard':'yard'));bind('hubLeft62',()=>go('buyer',true));bind('hubRight62',()=>go('tech',true));
  }
  canvas.setAttribute('role','application');canvas.setAttribute('aria-label',v==='medyard'?'Медпункт. Нажми на вход, Enter открывает, стрелка влево возвращает в поселение.':v==='yard'?'Поселение. Бар и торговля — слева; поверни вправо к медпункту. Стрелки выбирают вход, Enter открывает.':(['doctor','scientist'].includes(v)?v==='doctor'?'Медик':'Учёный':profile().places[roles.indexOf(v)])+'. Нажми на персонажа. Enter открывает услуги. Стрелки поворачивают к соседнему помещению.');
 }
 function go(next,pan=false){
  if(!usable()||!['yard','medyard',...roles,'doctor','scientist'].includes(next)||next===view())return false;
  const prev=view();state.hub62.view=next;down=pending=hover=selected=null;
  if(pan&&(['yard','medyard'].includes(prev)&&['yard','medyard'].includes(next)||['buyer','tech'].includes(prev)&&['buyer','tech'].includes(next)||['doctor','scientist'].includes(prev)&&['doctor','scientist'].includes(next)))turn={from:prev,to:next,at:performance.now()};
  save();render();return true;
 }
 function people(){if(!active()||exhaustionOpen)return false;closeModal();render();if(view()==='yard')toast('Нажми на здание: слева бар, справа скупщик и техник.');return true;}
 function decorate(i){if(!active())return;const title=$('modalTitle');if(title){const role=['Бармен','Скупщик','Техник'][i],name=profile().names[i];title.textContent=name===role?role:role+' · '+name;}}
 function portrait(i){return Number.isInteger(i)&&i>=0&&i<3?assetPath(files[roles[i]]):null;}
 function backgroundKey(original){ensure();const k=key(original==='base'?'hub':'road');return artReady(k)?k:original;}
 function fit(im){const s=Math.max(900/im.naturalWidth,800/im.naturalHeight);return{s,x:(900-im.naturalWidth*s)/2,y:(800-im.naturalHeight*s)/2,w:im.naturalWidth*s,h:im.naturalHeight*s};}
 function houseBoxes(){return view()==='medyard'?[{key:'medicalDoor72',view:'doctor',box:[.20,.25,.66,.65]}]:[{key:'barDoor',view:'bar',box:[.02,.22,.49,.66]},{key:'buyerDoor',view:'buyer',box:[.52,.22,.46,.66]}];}
 function actorPose(role,t=performance.now()){
  const im=WORLD_ART[key(files[role])],meta=info().actors?.[role];if(!im||!meta)return null;
  const [sx,sy,sw,sh]=meta.source,maxW=role==='buyer'?530:760,maxH=680,s=Math.min(maxW/sw,maxH/sh),w=sw*s,h=sh*s;
  const pulse=selected?.location===state.location&&selected.view===view()&&selected.key==='npc'?Math.sin(Math.PI*Math.min(1,Math.max(0,(t-selected.at)/440))):0;
  const lit=usable()&&(hover==='npc'||focused==='npc'),z=1+.055*pulse+(lit?.006:0);
  return {im,meta,sx,sy,sw,sh,x:450-w*z/2,y:782-h*z,w:w*z,h:h*z,brightness:1+pulse*.4+(lit?.08:0)};
 }
 function hit(p){
  if(!active()||!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return null;const v=view();
  if(v==='yard'||v==='medyard'){
   const im=WORLD_ART[key('hub')];if(!artReady(key('hub')))return null;const f={x:0,y:0,w:900,h:800},x=(p.x-f.x)/f.w,y=(p.y-f.y)/f.h;
   return houseBoxes().find(o=>{const [bx,by,bw,bh]=o.box;return x>=bx&&x<=bx+bw&&y>=by&&y<=by+bh;})?.key||null;
  }
  if(['buyer','tech','doctor','scientist'].includes(v))return p.x>=175&&p.x<=725&&p.y>=120&&p.y<=790?'npc':null;
  if(!artReady(key(files[v])))return null;const a=actorPose(v);if(!a)return null;const x=(p.x-a.x)/a.w,y=(p.y-a.y)/a.h;if(x<0||x>=1||y<0||y>=1)return null;
  const row=a.meta.mask[Math.min(a.meta.mask.length-1,Math.floor(y*a.meta.mask.length))];return row?.[Math.floor(x*row.length)]==='1'?'npc':null;
 }
 function select(k){if(!usable()||pending||!k)return false;pending={key:k,at:performance.now(),location:state.location,view:view()};selected={...pending};focused=k;AudioFX.play('click');return true;}
 function point(e){const r=canvas.getBoundingClientRect(),s=Math.max(r.width/900,r.height/800);return{x:(e.clientX-r.left-(r.width-900*s)/2)/s,y:(e.clientY-r.top-(r.height-800*s)/2)/s};}
 function pointerDown(e){
  if(!active())return false;down=null;if(!usable()||pending||e.isPrimary===false||typeof e.button==='number'&&e.button!==0)return true;
  const k=hit(point(e));if(k){down={key:k,id:e.pointerId,x:e.clientX,y:e.clientY,location:state.location,view:view()};try{canvas.setPointerCapture(e.pointerId);}catch{}}return true;
 }
 function pointerUp(e){const d=down;down=null;if(!d||e.pointerId!==d.id||!usable()||d.location!==state.location||d.view!==view()||Math.hypot(e.clientX-d.x,e.clientY-d.y)>10||hit(point(e))!==d.key)return false;return select(d.key);}
 function move(e){if(!active())return;if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>10)down=null;if(e.pointerType==='mouse'){hover=usable()?hit(point(e)):null;canvas.style.cursor=hover?'pointer':'default';}}
 function cancel(){down=pending=hover=null;}
 function leave(){down=hover=null;}
 function keyboard(e){
  if(!usable()||!['Enter',' ','ArrowLeft','ArrowRight','Escape'].includes(e.key))return false;e.preventDefault();if(e.repeat)return true;
  if(e.key==='Escape'){if(view()!=='yard')go(['doctor','scientist'].includes(view())?'medyard':'yard');return true;}
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
   if(view()==='medyard'&&e.key==='ArrowLeft'){go('yard',true);return true;}if(view()==='yard'&&e.key==='ArrowRight'){go('medyard',true);return true;}if(view()==='yard'||view()==='medyard'){const choices=houseBoxes().map(h=>h.key);focused=choices[(choices.indexOf(focused)+(e.key==='ArrowRight'?1:choices.length-1))%choices.length];}else if(view()==='buyer'&&e.key==='ArrowRight')go('tech',true);else if(view()==='tech'&&e.key==='ArrowLeft')go('buyer',true);if(view()==='doctor'&&e.key==='ArrowRight')go('scientist',true);else if(view()==='scientist'&&e.key==='ArrowLeft')go('doctor',true);return true;
  }
  return select(['yard','medyard'].includes(view())?(focused||houseBoxes()[0].key):'npc');
 }
 function update(t){
  if(!active()){cancel();return;}
  if(turn&&t-turn.at>=650)turn=null;
  if(!usable()){down=pending=hover=null;return;}
  if(pending&&(pending.location!==state.location||pending.view!==view()))pending=null;
  if(pending&&t-pending.at>=280){const k=pending.key;pending=null;if(k==='npc'){if(view()==='doctor')window.Progression72?.openMedic();else if(view()==='scientist')window.Progression72?.openScientist();else{openNPC(ids[view()]);decorate(ids[view()]);}}else go(houseBoxes().find(h=>h.key===k)?.view);}
 }
 function backdrop(role,t){const im=WORLD_ART[key('interior')];if(!artReady(key('interior')))return false;
  let col=roles.indexOf(role);if(turn){const p=Math.max(0,Math.min(1,(t-turn.at)/650)),ease=p*p*(3-2*p);col=roles.indexOf(turn.from)+(roles.indexOf(turn.to)-roles.indexOf(turn.from))*ease;}
  const sw=im.naturalWidth/3,sh=Math.min(im.naturalHeight,sw*800/900);ctx.save();ctx.filter='brightness(.62) saturate(.65)';ctx.drawImage(im,col*sw,(im.naturalHeight-sh)/2,sw,sh,0,0,900,800);ctx.restore();return true;
 }
 function drawActor(role,t,alpha=1){if(!artReady(key(files[role])))return;const a=actorPose(role,t);if(!a)return;ctx.save();ctx.globalAlpha=alpha;ctx.filter='brightness('+(a.brightness*.82)+') saturate(.78)';ctx.drawImage(a.im,a.sx,a.sy,a.sw,a.sh,a.x,a.y,a.w,a.h);ctx.restore();}
 function drawPanorama74(im,target,t){let pos=target;if(turn&&['yard','medyard'].includes(turn.from)&&['yard','medyard'].includes(turn.to)){const p=Math.max(0,Math.min(1,(t-turn.at)/650)),e=p*p*(3-2*p);pos=(turn.from==='medyard'?1:0)*(1-e)+(turn.to==='medyard'?1:0)*e;}const sw=im.naturalWidth/2,sh=Math.min(im.naturalHeight,sw*800/900);ctx.drawImage(im,pos*sw,state.location===0?0:(im.naturalHeight-sh)/2,sw,sh,0,0,900,800);if(state.location===0)window.Settlement82?.draw(im,pos);}
 function draw(t){
  if(!active())return false;ensure();const v=view();ctx.fillStyle='#182124';ctx.fillRect(-30,-30,960,860);
  if(v==='yard'||v==='medyard'){
   const im=WORLD_ART[key('hub')];if(!artReady(key('hub'))){loading('Загрузка поселения…');return true;}const f={x:0,y:0,w:900,h:800,s:900/(im.naturalWidth/2)};drawPanorama74(im,v==='medyard'?1:0,t);
   if(!turn)for(const h of houseBoxes()){const [x,y,w,hh]=h.box,cx=f.x+(x+w/2)*f.w,cy=f.y+(y+hh)*f.h-20,width=h.key==='barDoor'?114:186;
    // Keep building names above the location title and the on-screen movement buttons.
    const labelY=Math.max(150,Math.min(550,cy-150));
    ctx.save();ctx.fillStyle='#10191ce9';ctx.fillRect(cx-width/2,labelY-23,width,38);
    ctx.strokeStyle='#b6bc9755';ctx.strokeRect(cx-width/2+.5,labelY-22.5,width-1,37);
    ctx.fillStyle='#e5dec8';ctx.font='22px sans-serif';ctx.textAlign='center';
    ctx.fillText(h.key==='barDoor'?'Бар':h.key==='medicalDoor72'?'Медпункт':'Торговля',cx,labelY+3);ctx.restore();}
  }else if(['doctor','scientist'].includes(v)){window.Progression72?.drawMedical(v,t,turn);
  }else if(['buyer','tech'].includes(v)){if(!window.Refresh77?.trade(v,t,turn))loading('Загрузка помещения…');
  }else{
   if(!backdrop(v,t)){loading('Загрузка помещения…');return true;}
   if(turn){const p=Math.min(1,(t-turn.at)/650);if(p<.5)drawActor(turn.from,t,1-p*2);else drawActor(turn.to,t,(p-.5)*2);}else drawActor(v,t);
   const shade=ctx.createRadialGradient(450,370,180,450,400,620);shade.addColorStop(0,'#05090900');shade.addColorStop(1,'#030708a6');ctx.fillStyle=shade;ctx.fillRect(0,0,900,800);
   if(!artReady(key(files[v])))loading('Загрузка персонажа…');
  }return true;
 }
 function loading(text){ctx.save();ctx.fillStyle='#dedcc6';ctx.textAlign='center';ctx.font='20px sans-serif';ctx.fillText(text,450,450);ctx.restore();}
 window.Hubs62={hint:()=>view()==='medyard'?'Нажми на вход в медпункт; слева — поселение':view()==='yard'?'Бар и торговля — слева; поверни вправо к медпункту':'Нажми на персонажа, чтобы открыть услуги',active,usable,view,sync,go,people,decorate,portrait,backgroundKey,point,draw,update,pointerDown,pointerUp,move,key:keyboard,cancel,leave,hit,select,actorPose,profiles,assetPath};
})();
