'use strict';
(() => {
 const pool=['crate','fork','anomaly','trappedCache','anomalyFog'];
 const active=()=>state.mode==='expedition'&&!!state.emission56;
 const door=()=>active()&&event?.type==='emission'&&event.emission52?.stage==='door';
 const usable=()=>door()&&!document.hidden&&!exhaustionOpen&&$('modalBackdrop').hidden;
 let down=null,pending=null,lit=false;
 const image=new Image();image.src='assets/emission-v56/shelter-door.png';WORLD_ART['shelter56']=image;
 function begin(e){state.emission56={version:1,deadlineAt:e.deadlineAt,target:e.emission52.shelterSection,sections:0,seed:JSON.parse(JSON.stringify(e.emission52)),started:false};}
 function start(){if(!active()||document.hidden||exhaustionOpen||!$('modalBackdrop').hidden||event?.type!=='emission'||event.emission52.stage!=='run')return false;if(Date.now()>=state.emission56.deadlineAt)return fail();state.emission56.started=true;walk();return true;}
 function encounter(){
  if(!active())return false;if(Date.now()>=state.emission56.deadlineAt){fail();return true;}
  const s=state.emission56;s.sections++;
  if(s.sections>=s.target){event={type:'emission',phase:'choice',resolved:false,created:performance.now(),deadlineAt:s.deadlineAt,emission52:{...s.seed,stage:'door'}};walk.forced=null;save();render();return true;}
  return false;
 }
 function roll(){return pool[Math.floor(Math.random()*pool.length)];}
 function persist(){if(!active())return;const s=state.emission56;s.snapshot=event?JSON.parse(JSON.stringify(event)):null;s.walkLeft=!event?Math.max(0,nextWalkAt-performance.now()):0;s.savedAt=Date.now();}
 function restore(raw){
  if(raw?.mode!=='expedition'){state.emission56=null;return;}
  const s=state.emission56;
  if(!s){if(event?.type==='emission'&&event.emission52?.stage==='run')begin(event);return;}
  if(s.version!==1||!Number.isFinite(s.deadlineAt)||s.deadlineAt>Date.now()+45000||!Number.isInteger(s.target)||s.target<1||s.target>10||!Number.isInteger(s.sections)||s.sections<0||s.sections>10||!s.seed){state.emission56=null;return;}
  state.mode='expedition';state.routeEnd=false;
  if(!event&&s.snapshot&&[...pool,'emission'].includes(s.snapshot.type)){event={...s.snapshot,created:performance.now(),searching:false,scanning:false};if(event.resolved)event.resumeAt=performance.now()+2400;}
  if(!event){walkStarted=performance.now();nextWalkAt=walkStarted+Math.max(0,Math.min(4200,s.walkLeft||0)-Math.max(0,Date.now()-(s.savedAt||Date.now())));}
 }
 function fail(){
  if(!active())return false;const s=state.emission56;state.emission56=null;pending=null;down=null;travelMotion=null;closeModal();exhaustionOpen=false;
  event={type:'emission',phase:'choice',resolved:false,created:performance.now(),deadlineAt:s.deadlineAt,emission52:{...s.seed,stage:'run'}};
  window.Emission52.update();save();render();return true;
 }
 function update(){
  syncTimer();
  if(!active()){pending=null;return;}
  if(Date.now()>=state.emission56.deadlineAt){fail();return;}
  if(pending&&usable()&&performance.now()-pending.at>=280){pending=null;state.emission56=null;event.emission52.stage='run';event.emission52.sections=event.emission52.shelterSection-1;event.emission52.nextSectionAt=0;window.Emission52.run();save();}
 }
 function actions(){
  syncTimer();
  if(!active())return;const b=$('escape');if(b){b.disabled=true;b.textContent='Выброс · ищи укрытие';}
  if(event&&event.type!=='emission'&&!travelMotion){const panel=$('actionPanel'),markup='<button class="primary" id="storm56-next">Бежать дальше</button>';if(panel.insertAdjacentHTML)panel.insertAdjacentHTML('beforeend',markup);else panel.innerHTML+=markup;bind('storm56-next',()=>{if(active()&&!door()&&!document.hidden&&!exhaustionOpen&&$('modalBackdrop').hidden)walk();});}
 }
 function renderDoor(){if(!door())return false;setSceneInteraction('','<h3>Вход в убежище</h3><p>Нажми на дверь, чтобы укрыться от Выброса.</p>');buttons('');canvas.setAttribute('role','button');canvas.setAttribute('aria-label','Открыть дверь убежища');canvas.style.cursor='pointer';return true;}
 function frame(){const scale=Math.min(900/image.naturalWidth,800/image.naturalHeight);return {scale,x:(900-image.naturalWidth*scale)/2,y:(800-image.naturalHeight*scale)/2};}
 function hit(p){const f=frame(),x=(p.x-f.x)/f.scale/image.naturalWidth,y=(p.y-f.y)/f.scale/image.naturalHeight;return x>.36&&x<.65&&y>.13&&y<.73;}
 function select(){if(!usable()||pending)return false;pending={at:performance.now()};AudioFX.play('click');return true;}
 function pointerDown(e){if(!door())return false;down=null;if(usable()&&e.isPrimary!==false&&(!('button' in e)||e.button===0)&&hit(canvasPoint(e)))down={id:e.pointerId,x:e.clientX,y:e.clientY};return true;}
 function pointerUp(e){const d=down;down=null;if(d&&d.id===e.pointerId&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<=10&&hit(canvasPoint(e)))return select();return false;}
 function move(e){if(door())lit=usable()&&hit(canvasPoint(e));}
 function key(e){if(!door())return false;if(['Enter',' '].includes(e.key)){e.preventDefault();if(!e.repeat)select();}return true;}
 function draw(){
  if(!door()||!artReady('shelter56'))return false;const f=frame(),w=image.naturalWidth*f.scale,h=image.naturalHeight*f.scale;
  ctx.fillStyle='#171e1f';ctx.fillRect(-30,-30,960,860);ctx.drawImage(image,f.x,f.y,w,h);
  const pulse=pending?Math.sin(Math.PI*Math.min(1,(performance.now()-pending.at)/440)):0;
  if(pulse>0||lit){const x=image.naturalWidth*.36,y=image.naturalHeight*.13,cw=image.naturalWidth*.29,ch=image.naturalHeight*.6,z=1+pulse*.04;
   ctx.save();ctx.filter='brightness('+(1+pulse*.4+(lit?.12:0))+')';ctx.drawImage(image,x,y,cw,ch,f.x+x*f.scale-cw*f.scale*(z-1)/2,f.y+y*f.scale-ch*f.scale*(z-1)/2,cw*f.scale*z,ch*f.scale*z);ctx.restore();}
  return true;
 }
 function strength(){return active()?Math.max(0,Math.min(1,1-(state.emission56.deadlineAt-Date.now())/45000)):0;}
 function shake(t){if(!active())return;const a=1+strength()**2*15;ctx.translate(Math.sin(t*.053)*a,Math.cos(t*.071)*a*.65);ctx.translate(450,400);ctx.scale(1.05,1.05);ctx.translate(-450,-400);}
 function syncTimer(){const el=$('stormTimer57');if(!el)return;const inside=window.Emission52?.sheltered60();el.hidden=!active()&&!inside;if(el.hidden)return;const end=inside?event.shelterUntil:state.emission56.deadlineAt,seconds=Math.max(0,Math.ceil((end-Date.now())/1000));const text=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');if(el.textContent!==text){el.textContent=text;el.setAttribute('aria-label',(inside?'До выхода: ':'До Выброса: ')+seconds+' сек.');}el.classList.toggle('urgent',!inside&&seconds<=10);el.style.left='calc(50% + '+((($('dayPhase')?.offsetWidth||100)/2)+8)+'px)';}
 function overlay(){syncTimer();if(!active())return;const p=strength();ctx.save();ctx.fillStyle='rgba(165,0,0,'+(.22+p*.25)+')';ctx.fillRect(0,0,900,800);ctx.restore();}
 window.Storm56={active,door,begin,start,encounter,roll,persist,restore,update,actions,renderDoor,draw,shake,overlay,strength,pointerDown,pointerUp,move,key,cancel:()=>{down=null;lit=false;},locked:active};
})();
