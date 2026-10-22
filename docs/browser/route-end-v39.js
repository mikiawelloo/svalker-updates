'use strict';
function prepareRouteEnd(){
 clearActionFeedback();travelMotion=null;event=null;nextWalkAt=Infinity;walk.forced=null;
 stick.active=false;stickDown=false;dragPointer=null;state.mode='expedition';state.lastUpdate=Date.now();
}
function finishExpeditionRoute(){
 if(!['expedition','camp'].includes(state.mode)||dungeonActive()||exhaustionOpen||event?.detained)return false;
 if(!state.routeEnd){state.routeEnd=true;prepareRouteEnd();save();render();}
 showRouteEnd();return true;
}
function showRouteEnd(){
 if(!state.routeEnd)return false;
 openModal('<div class="route-end-art"><img src="assets/route-end-v39.webp" alt="Разрушенный мост преграждает дорогу"></div><h2 id="modalTitle">Дальше не пройти</h2><div class="route-end-dialogue"><div><small>Ты · по рации</small><p>Дорога обрывается. Обхода не видно.</p></div><div><small>База</small><p>Принял. Возвращайся, на сегодня хватит.</p></div></div><button class="primary route-end-return" id="route-end-return">Вернуться на базу</button>');
 $('closeModal').hidden=true;bind('route-end-return',confirmRouteReturn);$('route-end-return').focus();updateTopActions();return true;
}
function confirmRouteReturn(){
 if(!state.routeEnd)return false;
 returnToBase('Вернулись с края маршрута. Добыча сохранена.');return true;
}
function restoreRouteEnd(){
 if(!state.routeEnd)return false;
 if(dungeonActive()){state.routeEnd=false;return false;}
 prepareRouteEnd();return true;
}
