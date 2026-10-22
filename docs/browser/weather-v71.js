'use strict';
// Cosmetic only: no HP, stamina, radiation, encounters or rewards are changed.
window.Weather71=(()=>{
 const root=$('gameRoot'),scene=$('sceneSection'),rain=$('weatherRain71'),drops=$('weatherDrops71'),fog=$('weatherFog71'),flash=$('weatherFlash71'),bolt=$('weatherBolt71');
 const KEY='svalker-weather71',rand=(a,b)=>a+Math.random()*(b-a);
 let weather={kind:'clear',storm:false,until:Date.now()+rand(20000,45000)},nextThunder=0,thunderAt=0,flashAt=-Infinity;
 try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&['clear','rain','fog'].includes(saved.kind)&&Number.isFinite(saved.until)&&saved.until>Date.now()&&saved.until<Date.now()+180000)weather=saved;}catch{}
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(weather));}catch{}}
 function set(kind,storm=false){if(!['clear','rain','fog'].includes(kind))return false;weather={kind,storm:kind==='rain'&&!!storm,until:Date.now()+(kind==='clear'?rand(75000,150000):kind==='rain'?rand(60000,110000):rand(45000,80000))};nextThunder=Date.now()+rand(8000,18000);thunderAt=0;persist();return true;}
 function outside(){if(document.hidden||state.routeEnd||state.defeat||window.Alcohol?.active()||dungeonActive()||window.Emission52?.sheltered60())return false;return state.mode!=='base'||!state.hub62||['yard','medyard'].includes(state.hub62.view);}
 function media(video,active){if(!video)return;if(active){if(video.paused)video.play()?.catch(()=>{});}else if(!video.paused)video.pause();}
 function update(){
  const now=Date.now();if(now>=weather.until){if(weather.kind==='clear')set(Math.random()<.6?'rain':'fog',Math.random()<.45);else set('clear');}
  const visible=outside(),raining=weather.kind==='rain'&&visible,foggy=weather.kind==='fog'&&visible&&state.mode==='expedition';
  scene.classList.toggle('weather-rain71',raining);root.classList.toggle('weather-wet71',raining);scene.classList.toggle('weather-fog71',foggy);media(rain,raining);media(drops,raining);
  AudioFX.setWeather?.(weather.kind==='rain'&&!document.hidden&&!state.routeEnd,!visible);
  if(!raining){thunderAt=0;flashAt=-Infinity;nextThunder=Math.max(nextThunder,now+8000);}
  if(raining&&weather.storm&&now>=nextThunder){flashAt=now;thunderAt=now+rand(400,1100);nextThunder=now+rand(18000,38000);bolt.style.left=rand(30,65)+'%';bolt.style.transform='translateX(-50%) rotate('+rand(-9,9)+'deg)';}
  const age=now-flashAt,intensity=age<70?.65:age<130?.08:age<220?.4:age<500?.18*(1-(age-220)/280):0;
  flash.style.opacity=String(intensity);bolt.style.opacity=age<240?String(intensity*1.5):'0';
  if(thunderAt&&now>=thunderAt){thunderAt=0;AudioFX.play('weather-thunder71');}
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden){media(rain,false);media(drops,false);thunderAt=0;flashAt=-Infinity;}else update();});
 return{update,set,status:()=>({...weather}),outside};
})();
