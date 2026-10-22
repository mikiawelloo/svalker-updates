'use strict';
const CONSUMABLE_ANIMATIONS={
 medkit:{duration:2400,frames:[0,1,2,3],height:440,cues:[[130,'bandageWrap'],[950,'bandageWrap'],[1700,'bandageWrap']]},
 vodka:{duration:2200,frames:[0,0,2,2],height:445,cues:[[850,'bottleUnscrew'],[1350,'gulp'],[1750,'gulp']]},
 energy:{duration:2500,frames:[0,1,2,3],height:440,cues:[[1250,'canOpenFizz'],[1930,'gulp'],[2200,'gulp']]}
};
const CONSUMABLE_ART={};
for(const key of Object.keys(CONSUMABLE_ANIMATIONS)){const img=new Image();img.src='assets/feedback-v33/'+key+'.webp';CONSUMABLE_ART[key]=img;}
let consumableMotion=null,feedbackAt=0,popupSerial=0;
const combatPopups=[];
function consumableBusy(){return !!consumableMotion||state.routeEnd;}
function startConsumableMotion(kind){
 if(!Object.hasOwn(CONSUMABLE_ANIMATIONS,kind)||consumableBusy())return false;
 if(!$('modalBackdrop').hidden&&!exhaustionOpen)closeModal();
 consumableMotion={kind,elapsed:0,cue:0};feedbackAt=performance.now();updateRadiationUI();return true;
}
function spawnCombatPopup(text,kind='hit',target='enemy'){
 const colours={hit:'#ffe4a0',hurt:'#ff8372',miss:'#e3dfcc',jam:'#ffc562',heal:'#acdca3',energy:'#a6deef',radiation:'#b9d69e'};
 const serial=popupSerial++,x=450+(serial%3-1)*58,y=target==='enemy'?325:650;
 combatPopups.push({text:String(text),colour:colours[kind]||colours.hit,x,y,elapsed:0});
 if(combatPopups.length>12)combatPopups.shift();
}
function clearActionFeedback(){consumableMotion=null;combatPopups.length=0;feedbackAt=performance.now();}
function pauseActionFeedback(){feedbackAt=performance.now();}
function updateActionFeedback(t){
 const dt=Math.max(0,t-feedbackAt);feedbackAt=t;if(document.hidden)return;
 for(let i=combatPopups.length-1;i>=0;i--){combatPopups[i].elapsed+=dt;if(combatPopups[i].elapsed>=900)combatPopups.splice(i,1);}
 if(!consumableMotion)return;
 const motion=consumableMotion,spec=CONSUMABLE_ANIMATIONS[motion.kind];motion.elapsed+=dt;
 if(motion.elapsed>=spec.duration){consumableMotion=null;updateRadiationUI();return;}
 while(motion.cue<spec.cues.length&&motion.elapsed>=spec.cues[motion.cue][0])AudioFX.play(spec.cues[motion.cue++][1]);
}

function drawActionFeedback(){
 if(consumableMotion){
  const motion=consumableMotion,spec=CONSUMABLE_ANIMATIONS[motion.kind],img=CONSUMABLE_ART[motion.kind];
  if(img.complete&&img.naturalWidth){
   const sw=Math.floor(img.naturalWidth/2),sh=Math.floor(img.naturalHeight/2),phase=Math.min(3,Math.floor(motion.elapsed/(spec.duration/4))),cell=spec.frames[phase];
   const enter=Math.min(1,motion.elapsed/260),exit=Math.min(1,(spec.duration-motion.elapsed)/300),ease=v=>v*v*(3-2*v),visible=ease(Math.min(enter,exit));
   const zoom=motion.kind==='medkit'?1:1+Math.max(0,(motion.elapsed/spec.duration-.45))*(motion.kind==='vodka'?.45:.16),h=spec.height*zoom,w=h*sw/sh;
   const bob=Math.sin(motion.elapsed*.009)*3;
   ctx.save();ctx.globalAlpha=Math.min(1,visible*2);ctx.drawImage(img,(cell%2)*sw,Math.floor(cell/2)*sh,sw,sh,(900-w)/2,800-h+(1-visible)*h+bob,w,h);ctx.restore();
  }
 }
 ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 43px monospace';ctx.lineJoin='round';ctx.lineWidth=6;
 for(const popup of combatPopups){
  const p=popup.elapsed/900,y=popup.y-70*(1-Math.pow(1-p,2));ctx.globalAlpha=Math.min(1,(1-p)/.42);ctx.strokeStyle='#14191ee8';ctx.fillStyle=popup.colour;ctx.strokeText(popup.text,popup.x,y);ctx.fillText(popup.text,popup.x,y);
 }
 ctx.restore();
}
