'use strict';
let playerModalVisible=false;
const DEFEAT_TYPES={bleeding:{title:'Поражение от кровотечения',image:'defeat-bleeding'},radiation:{title:'Поражение от радиации',image:'defeat-radiation'},monster:{title:'Поражение от монстра',image:'defeat-monster'},human:{title:'Поражение от человека',image:'defeat-human'}};
function statusImage(key,alt){return '<div class="status-illustration"><img src="assets/status-v29/'+key+'.webp" alt="'+alt+'" decoding="async"></div>';}
function npcGridHTML(){return '<div class="npc-grid">'+[{id:0,name:'Бармен'},{id:2,name:'Техник'},{id:1,name:'Скупщик'}].map(n=>'<button class="npc-card" id="npc'+n.id+'"><div class="npc-art">'+portraitArt(n.id)+'</div><div class="npc-label"><b>'+n.name+'</b></div></button>').join('')+'</div>';}
function openPeople(){
 if(window.Hubs62?.active())return window.Hubs62.people();
 if(state.mode!=='base'||exhaustionOpen)return false;tab='characters';openModal('<h2 id="modalTitle">Персонажи</h2>'+npcGridHTML());modalNpc=null;for(let i=0;i<3;i++)bind('npc'+i,()=>openNPC(i));renderTab();return true;
}
function openPlayer(){
 if(!['base','camp'].includes(state.mode)||exhaustionOpen)return false;tab='inventory';openModal('<h2 id="modalTitle">Персонаж</h2><div id="playerContent"></div>');modalNpc=null;playerModalVisible=true;renderTab();return true;
}
function initDefeatState(){if(loadedRaw?.mode==='expedition'||loadedRaw?.mode==='camp'||state.mode!=='base'||!state.defeat||!Object.hasOwn(DEFEAT_TYPES,state.defeat.cause))state.defeat=null;else state.defeat={cause:state.defeat.cause,lost:state.defeat.lost||{}};}
function defeatPlayer(cause){
 if(state.mode!=='expedition'||!Object.hasOwn(DEFEAT_TYPES,cause))return false;
 const lost=window.Economy51?.loss()||{};state.hp=15;state.bleeding=0;returnToBase('Поражение. Вернулись на базу.');state.defeat={cause,lost};save();showDefeat();return true;
}
function showDefeat(){
 const def=DEFEAT_TYPES[state.defeat?.cause];if(!def||state.mode!=='base')return false;
 openModal(statusImage(def.image,def.title)+'<h2 id="modalTitle">'+def.title+'</h2><p>Ты вернулся на базу с 15 здоровья. Восстановись перед новой вылазкой.</p>'+((Object.keys(state.defeat?.lost||{}).length)?'<p>Потеряно 30% ресурсов рюкзака: '+Object.entries(state.defeat.lost).map(([k,n])=>(ITEMS[k]?.name||k)+' ×'+n).join(', ')+'.</p>':'')+'<button class="primary" id="defeat-continue">На базу</button>','danger');modalNpc=null;bind('defeat-continue',closeModal);return true;
}
function updateDamageOverlays(){
 const radiation=Math.max(0,Math.min(100,Number(state.radiation)||0)),blood=state.bleeding>0;
 $('radiationNoise').hidden=radiation<=0;$('radiationNoise').style.opacity=String(.55*Math.pow(radiation/100,1.5));$('radiationNoise').style.animationPlayState=document.hidden?'paused':'running';
 $('bleedingVeil').hidden=!blood;$('bleedingVeil').style.opacity=blood?String(safeZone()?.25:.35+(1-Math.max(0,Math.min(100,state.hp))/100)*.45):'0';
}
