'use strict';
// The deadline uses wall time and a separate durable key, so reloading does not clear it.
(() => {
 const KEY='svalker-test-blackout-until',overlay=$('alcoholBlackout');
 let blocked=false,pausedAt=0,wasHidden=false;
 try{const stored=Number(localStorage.getItem(KEY));if(Number.isFinite(stored)&&stored>Date.now())state.blackoutUntil=Math.max(Number(state.blackoutUntil)||0,stored);}catch{}
 const active=()=>Number(state.blackoutUntil)>Date.now();
 function sync(){
  const next=active();overlay.hidden=!next;
  if(next&&!blocked){blocked=true;pausedAt=performance.now();wasHidden=document.hidden;AudioFX.setScene?.('blackout');overlay.focus();}
  if(!next&&blocked){
   blocked=false;const shift=Math.max(0,performance.now()-pausedAt);
   // Preserve gameplay deadlines while the player cannot interact.
   for(const key of ['nextWalkAt','walkStarted']){if(key==='nextWalkAt'&&Number.isFinite(nextWalkAt))nextWalkAt+=shift;else if(key==='walkStarted')walkStarted+=shift;}
   if(event){for(const k of ['created','searchStart','scanStart','approachEnd','deadline','resumeAt'])if(Number.isFinite(event[k]))event[k]+=shift;if(event.combat)event.combat.nextAt=Math.max(performance.now()+250,event.combat.nextAt+shift);if(event.echo)event.echo.lastAt=performance.now();if(event.echoAttack)event.echoAttack.lastAt=performance.now();}
   const special=event?.echoSpecial;if(special){special.lastAt=performance.now();if(special.antenna)special.antenna.lastAt=performance.now();if(special.combat)special.combat.nextAt+=shift;if(special.attack)special.attack.lastAt+=shift;}
   if(travelMotion)travelMotion.lastAt=performance.now();
   pauseRareMinigame(false);pauseActionFeedback();
   state.blackoutUntil=0;state.alcoholDoses=0;state.alcoholAt=0;
   try{localStorage.removeItem(KEY);}catch{}
   lastFrame=performance.now();state.lastUpdate=Date.now();syncAudioScene();save();render();canvas.focus();
  }
  return next;
 }
 const originalTick=tick;
 tick=function(t){
  if(sync()){
   lastFrame=t;state.lastUpdate=Date.now();consumableMotion=null;
   AudioFX.setScene?.('blackout');
   if(document.hidden!==wasHidden){wasHidden=document.hidden;if(!wasHidden)AudioFX.unlock(sound);}
   pauseRareMinigame(true);pauseActionFeedback();
   requestAnimationFrame(tick);return;
  }
  return originalTick(t);
 };
 function block(e){if(!active())return;if(e.type==='pointerdown'){AudioFX.setScene?.('blackout');AudioFX.unlock(sound);}e.preventDefault();e.stopImmediatePropagation();}
 for(const type of ['pointerdown','pointerup','pointermove','click','keydown','touchstart','touchmove','wheel'])document.addEventListener(type,block,{capture:true,passive:false});
 window.Alcohol={active,sync};sync();
})();
