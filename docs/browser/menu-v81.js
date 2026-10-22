'use strict';
// Loaded before the game: the simulation waits for PLAY, while the menu can fade in.
window.SvalkerFront81=(()=>{
 const byId=id=>document.getElementById(id),root=byId('front81'),back=byId('frontSheetBack81');
 const videos=[byId('frontRain81'),byId('frontDrops81')],flash=byId('frontFlash81'),bolt=byId('frontBolt81'),after=byId('frontAfter81');
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 let active=true,nativePaused=false,leaving=false,lastFocus=null,thunderAt=0,flashAt=-Infinity,nextStrike=performance.now()+4500,raf=0;
 let intensity=true;try{intensity=localStorage.getItem('svalker-lightning81')!=='off';}catch{}
 const gear='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 3 1-1h4l1 3 3 1 2-1 2 3-2 2v4l2 2-2 3-3-1-2 2-1 2h-4l-1-3-3-1-2 1-2-3 2-2v-4L2 8l2-3 3 1 2-1Z"/><circle cx="12" cy="12" r="3.4"/></svg>';
 const info='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/></svg>';
 for(const id of ['frontSettings81','gameSettings81'])byId(id).innerHTML=gear;
 for(const id of ['frontCredits81','gameCredits81'])byId(id).innerHTML=info;
 function audioAllowed(){return AudioFX.settings().enabled;}
 function media(){for(const video of videos){if(!video)continue;if(active&&!nativePaused&&!document.hidden){video.play()?.catch(()=>{});}else video.pause();}}
 function clearStorm(){thunderAt=0;flashAt=-Infinity;flash.style.opacity='0';bolt.style.opacity='0';after.style.opacity='0';}
 function frame(t){if(!active||nativePaused||document.hidden){raf=0;return;}
  if(intensity&&!reduced){if(t>=nextStrike){flashAt=t;nextStrike=t+16000+Math.random()*17000;thunderAt=t+450+Math.random()*400;bolt.style.left=45+Math.random()*30+'%';}
   const age=t-flashAt;const v=age<75?.58:age<140?.04:age<225?.33:age<500?.13*(1-(age-225)/275):0;
   flash.style.opacity=String(v);bolt.style.opacity=age<240?String(v*1.6):'0';after.style.opacity=age>=500&&age<1700?String(.30*(1-(age-500)/1200)):'0';
   if(thunderAt&&t>=thunderAt){thunderAt=0;AudioFX.play('weather-thunder71');}
  }else clearStorm();raf=requestAnimationFrame(frame);
 }
 function resumeMenu(){media();if(active&&!document.hidden&&!nativePaused){if(!raf)raf=requestAnimationFrame(frame);if(audioAllowed())AudioFX.unlock(true);}}
 function refreshAudioHint(){byId('frontAudioHint81').textContent=audioAllowed()?'Коснись экрана, чтобы услышать Зону':'Звук выключен';}
 function syncSoundToggle(){if(typeof sound!=='undefined')sound=audioAllowed();const icon=byId('soundIcon');if(icon&&typeof uiIcon==='function')icon.innerHTML=uiIcon(audioAllowed()?'sound':'muted');const state=byId('soundState');if(state)state.textContent=audioAllowed()?'on':'off';refreshAudioHint();}
 function openPanel(kind,trigger){lastFocus=trigger||document.activeElement;back.hidden=false;byId('frontSettingsPanel81').hidden=kind!=='settings';byId('frontCreditsPanel81').hidden=kind!=='credits';
  const settings=AudioFX.settings();for(const input of back.querySelectorAll('[data-volume81]')){const k=input.dataset.volume81;input.value=String(Math.round(settings[k]*100));byId('volume-'+k+'81').textContent=input.value+'%';}
  byId('frontMute81').checked=!settings.enabled;byId('frontLightning81').checked=intensity;byId('frontSheetClose81').focus();
 }
 function closePanel(){if(back.hidden)return false;back.hidden=true;lastFocus?.focus();return true;}
 function play(){if(leaving)return;leaving=true;AudioFX.unlock(audioAllowed());AudioFX.play('click');root.classList.add('leaving81');
  setTimeout(()=>{active=false;root.hidden=true;document.body.classList.remove('front-open81');byId('gameRoot').inert=false;byId('gameRoot').removeAttribute('aria-hidden');media();clearStorm();if(raf)cancelAnimationFrame(raf);raf=0;AudioFX.setMenu(false);if(typeof syncAudioScene==='function')syncAudioScene();if(typeof lastFrame!=='undefined')lastFrame=performance.now();if(typeof state!=='undefined')state.lastUpdate=Date.now();byId('scene')?.focus({preventScroll:true});},reduced?150:700);
 }
 for(const id of ['frontSettings81','gameSettings81'])byId(id).onclick=()=>{AudioFX.unlock(audioAllowed());openPanel('settings',byId(id));};
 for(const id of ['frontCredits81','gameCredits81'])byId(id).onclick=()=>{AudioFX.unlock(audioAllowed());openPanel('credits',byId(id));};
 byId('frontFullCredits81').onclick=async e=>{e.preventDefault();const out=byId('frontFullCreditsText81');out.hidden=false;out.textContent='Загрузка титров…';try{const result=await fetch('assets/menu-v81/CREDITS.txt');if(!result.ok)throw Error('credits');out.textContent=await result.text();}catch{out.textContent='Титры находятся в локальном файле assets/menu-v81/CREDITS.txt.';}};
 byId('frontPlay81').onclick=play;byId('frontSheetClose81').onclick=closePanel;back.onclick=e=>{if(e.target===back)closePanel();};
 for(const input of back.querySelectorAll('[data-volume81]'))input.oninput=()=>{const k=input.dataset.volume81;AudioFX.setVolume(k,Number(input.value)/100);byId('volume-'+k+'81').textContent=input.value+'%';};
 byId('frontMute81').onchange=e=>{AudioFX.setEnabled(!e.target.checked);syncSoundToggle();};
 byId('frontLightning81').onchange=e=>{intensity=e.target.checked;try{localStorage.setItem('svalker-lightning81',intensity?'on':'off');}catch{}clearStorm();};
 document.addEventListener('pointerdown',()=>{if(active&&audioAllowed()){AudioFX.unlock(true);byId('frontAudioHint81').textContent='';}},{capture:true});
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!back.hidden){e.preventDefault();e.stopImmediatePropagation();closePanel();return;}
  if(e.key==='Tab'&&!back.hidden){const focusable=[...back.querySelectorAll('button,input,a[href]')].filter(el=>!el.closest('[hidden]')&&!el.disabled);const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
 },true);
 document.addEventListener('visibilitychange',()=>{media();if(document.hidden){clearStorm();AudioFX.suspend();}else{nextStrike=performance.now()+5000;resumeMenu();}});
 for(const video of videos)video?.addEventListener('error',()=>{byId('frontFallbackRain81').hidden=false;});
 document.body.classList.add('front-open81');byId('gameRoot').inert=true;byId('gameRoot').setAttribute('aria-hidden','true');AudioFX.setMenu(true);refreshAudioHint();media();raf=requestAnimationFrame(frame);
 const art=byId('frontArt81');function reveal(){requestAnimationFrame(()=>root.classList.add('ready81'));}if(art.complete)reveal();else{art.addEventListener('load',reveal,{once:true});art.addEventListener('error',reveal,{once:true});}setTimeout(reveal,2200);
 return{get paused(){return active||nativePaused;},get active(){return active;},closePanel,back(){if(closePanel())return true;if(!active&&typeof dismissModal==='function'&&!byId('modalBackdrop').hidden){dismissModal();return true;}return false;},nativePause(){nativePaused=true;media();clearStorm();AudioFX.suspend();if(typeof save==='function')save();},nativeResume(){nativePaused=false;if(typeof lastFrame!=='undefined')lastFrame=performance.now();if(typeof state!=='undefined')state.lastUpdate=Date.now();media();if(active)resumeMenu();else AudioFX.unlock(audioAllowed());}};
})();
