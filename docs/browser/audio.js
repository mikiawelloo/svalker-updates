'use strict';
// Locally hosted licensed recordings/music, decoded once and reused. See CREDITS.txt.
const AudioFX=(()=>{
 const names=['click-1','click-2','click-3','latch','metal-click','cloth-1','cloth-2','cloth-3','book-open','book-close','page','belt','coins-1','coins-2','creak','wood','grass-1','grass-2','grass-3','concrete-1','concrete-2','concrete-3','glass-1','glass-2','can','heavy','hit','zipper','heartbeat','bottle-open','swallow','shot','forest','dog-growl','dog-bark','reload','rooster','wolves'];
 names.push('campfire','water','camp-guitar','combat-dark-v9','level-up','night-v9','patrol-fail-v9');
 const files=Object.fromEntries(names.map(n=>[n,'assets/audio/'+n+(['forest','combat-dark-v9','night-v9'].includes(n)?'.mp3':'.wav')]));
 names.push('radio-base69','swamp-base69');files['radio-base69']='assets/camp-radio-v67/radio.mp3';files['swamp-base69']='assets/audio-v69/swamp-base.mp3';
 const rareSounds=['wounded','tripwire','radio-static','emission-siren','anomaly-fog','rival-loot','night-shadow','mutant-tracks','mini-success','mini-fail','radio-loop','emission-rumble'];
 for(const n of rareSounds){names.push(n);files[n]='assets/rare-v23/audio/'+n+'.wav';}
 for(const n of ['rat-voice','rat-attack','rat-down','bum-babble-1','bum-babble-2','bum-attack','bum-down']){names.push(n);files[n]='assets/enemies-v24/audio/'+n+'.wav';}
 for(const n of ['bandage-wrap','bottle-unscrew','can-open-fizz']){names.push(n);files[n]='assets/feedback-v33/'+n+'.wav';}
 names.push('echo-glass');files['echo-glass']='assets/echo-v3/echo-glass.wav';
 const echoFiles={'echo-main':'background-main','echo-overlay-2':'background-2','echo-overlay-2-1':'background-2-1','echo-overlay-2-2':'background-2-2','echo-windup':'windup','echo-attack':'attack','echo-death':'death'};
 for(const [name,file]of Object.entries(echoFiles)){names.push(name);files[name]='assets/echo-user-v1/'+file+'.mp3';}
 names.push('snore');files.snore='assets/echo-v45/snore.mp3';
 for(const name of ['zombie-roar','zombie-attack','zombie-death']){names.push(name);files[name]='assets/echo-v45/'+name+'.wav';}
 const event47Sounds=['cart','rain','lift','reeds','backpack','guide','caravan','marks'].map(k=>'event47-'+k);
 for(const n of event47Sounds){names.push(n);files[n]='assets/events-v47/audio/'+n.slice(8)+'.mp3';}
 names.push('diarrhea52');files.diarrhea52='assets/emission-v52/diarrhea.mp3';
 files['emission-siren']='assets/emission-v60/siren-loop.ogg';
 const shelterFiles60={'shelter-door60':'shelter-door','horror-creepy60':'creepy','horror-voice60':'voice','horror-slam60':'slam','horror-rage60':'rage'};
 for(const [name,file]of Object.entries(shelterFiles60)){names.push(name);files[name]='assets/emission-v60/'+file+'.mp3';}
 const shelterFiles61={'horror-stuck61':'door-stuck','horror-figure61':'figure','horror-knock61':'knock','horror-thump61':'thump','horror-ghost61':'ghost'};
 for(const [name,file]of Object.entries(shelterFiles61)){shelterFiles60[name]=file;names.push(name);files[name]='assets/emission-v61/'+file+'.mp3';}
 for(let loc=0;loc<5;loc++){const name='travel64-'+loc;names.push(name);files[name]='assets/locations-v64/audio/'+loc+'.mp3';}
 names.push('mud-step64');files['mud-step64']='assets/locations-v64/audio/mud-step.wav';
 names.push('travel68');files.travel68='assets/audio-v68/travel.mp3';
 files.tripwire='assets/audio-v68/metal.mp3';files['mutant-tracks']='assets/audio-v68/grass.mp3';
 files['event47-marks']='assets/audio-v68/grass.mp3';files['event47-cart']='assets/audio-v68/bag.mp3';
 names.push('swamp-travel70');files['swamp-travel70']='assets/audio-v70/swamp-travel.mp3';
 for(const name of ['district-base71','district-travel71','weather-rain71','weather-thunder71']){names.push(name);files[name]='assets/weather-v71/'+({'district-base71':'base','district-travel71':'travel','weather-rain71':'rain','weather-thunder71':'thunder'}[name])+'.mp3';}
 for(const name of ['menu-music81','first-music81','first-ambient81']){names.push(name);files[name]='assets/menu-v81/'+({'menu-music81':'menu','first-music81':'silent-walls','first-ambient81':'broken-systems'}[name])+'.mp3';}
 const raw=new Map(),decoded=new Map(),voices=new Set(),lastPlayed=new Map(),lastVariant=new Map();
 let context=null,master=null,enabled=true,generation=0,currentScene='road',currentLocation=null,currentEncounter=false,weatherRain=false,weatherInside=false;
 const layers=new Map(),lanes=new Map();
 const MIXER_KEY='svalker-audio81',levels={master:1,music:1,ambient:1,sfx:1},buses={};let menuMode=false;
 try{const saved=JSON.parse(localStorage.getItem(MIXER_KEY));if(saved){for(const k of Object.keys(levels))if(typeof saved[k]==='number'&&Number.isFinite(saved[k]))levels[k]=Math.max(0,Math.min(1,saved[k]));if(typeof saved.enabled==='boolean')enabled=saved.enabled;}}catch{}
 const musicNames=new Set(['menu-music81','first-music81','travel68','swamp-travel70','district-travel71','combat-dark-v9','night-v9','camp-guitar','radio-base69','swamp-base69','district-base71','radio-loop',...Object.keys(echoFiles).filter(n=>n==='echo-main'||n.startsWith('echo-overlay'))]);
 function channel(name,loop=false){return musicNames.has(name)?'music':(loop&&name!=='snore'||name==='weather-thunder71')?'ambient':'sfx';}
 function output(name,loop=false){return buses[channel(name,loop)]||master;}
 function settings(){return{...levels,enabled};}
 function persistMixer(){try{localStorage.setItem(MIXER_KEY,JSON.stringify(settings()));}catch{}}
 function setVolume(kind,value){if(!Object.hasOwn(levels,kind)||typeof value!=='number'||!Number.isFinite(value))return false;levels[kind]=Math.max(0,Math.min(1,value));persistMixer();if(context){const node=kind==='master'?master:buses[kind];node?.gain.setTargetAtTime(kind==='master'?(enabled?.7*levels.master:0):levels[kind],context.currentTime,.04);}return true;}
 const SCENES={dungeon:{'night-v9':.19},road:{travel68:.28},'road-night':{travel68:.28},base:{campfire:.24,'camp-guitar':.19},camp:{campfire:.3,forest:.065},combat:{'combat-dark-v9':.32,forest:.035},'combat-night':{'combat-dark-v9':.32,'night-v9':.055}};
 Object.assign(SCENES,{'rare-emission':{'emission-siren':.45,'emission-rumble':.08},'rare-shelter':{'emission-siren':.075,'emission-rumble':.04},'rare-fog':{'anomaly-fog':.12,'night-v9':.06},'rare-radio':{'radio-loop':.09,forest:.06},'rare-shadow':{'night-v9':.20}});
 for(const n of event47Sounds)SCENES[n]={travel68:.28};
 const echoBackground={'echo-main':.55,'echo-overlay-2':.10,'echo-overlay-2-1':.020,'echo-overlay-2-2':.10};
 Object.assign(SCENES,{'echo-tower':echoBackground,'echo-combat':echoBackground,'echo-dead':{},'blackout':{snore:.8}});
 const hidden=()=>typeof document!=='undefined'&&document.hidden;
 const now=()=>typeof performance!=='undefined'?performance.now():Date.now();
 function fetchSample(name){
  if(!files[name]||typeof fetch!=='function')return Promise.resolve(null);
  if(!raw.has(name))raw.set(name,fetch(files[name]).then(r=>{if(!r.ok)throw Error('audio '+r.status);return r.arrayBuffer();}).catch(()=>{raw.delete(name);return null;}));
  return raw.get(name);
 }
 // Fetch before the first gesture; AudioContext is created only when unlocked.
 function preload(){return Promise.allSettled(names.map(fetchSample));}
 function ensure(){
  try{
   if(!enabled||hidden())return false;
   const Type=window.AudioContext||window.webkitAudioContext;if(!Type)return false;
   if(!context){
    context=new Type();master=context.createGain();master.gain.value=.7*levels.master;
    for(const kind of ['music','ambient','sfx']){buses[kind]=context.createGain();buses[kind].gain.value=levels[kind];buses[kind].connect(master);}
    const limiter=context.createDynamicsCompressor();
    limiter.threshold.value=-12;limiter.knee.value=12;limiter.ratio.value=5;limiter.attack.value=.003;limiter.release.value=.18;
    master.connect(limiter);limiter.connect(context.destination);
   }
   if(context.state==='suspended')context.resume().catch(()=>{});
   return true;
  }catch{return false;}
 }
 async function buffer(name){
  if(!decoded.has(name))decoded.set(name,(async()=>{const data=await fetchSample(name);if(!data||!context)return null;try{return await context.decodeAudioData(data.slice(0));}catch{return null;}})());
  const result=await decoded.get(name);if(!result)decoded.delete(name);return result;
 }
 function stopVoices(){
  for(const voice of voices){try{voice.stop();}catch{}}
  voices.clear();layers.clear();lanes.clear();
 }
 function choose(group){
  if(!Array.isArray(group))return group;
  const prev=lastVariant.get(group.join());const options=group.filter(n=>n!==prev);
  const pick=options[Math.floor(Math.random()*options.length)]||group[0];lastVariant.set(group.join(),pick);return pick;
 }
 function stopLane(name){
  const lane=lanes.get(name);lanes.delete(name);
  if(lane?.source){try{if(name==='shelter-horror60'&&lane.gain){lane.gain.gain.setTargetAtTime(0,context.currentTime,.3);lane.source.stop(context.currentTime+1.1);}else lane.source.stop();}catch{}}
 }
 async function voice(group,volume=.3,delay=0,rate=1,laneName=null){
  if(!enabled||hidden()||!ensure())return;
  const lane=laneName?{source:null}:null;
  if(laneName){stopLane(laneName);lanes.set(laneName,lane);}
  const name=choose(group),token=generation,requested=now();
  const sample=await buffer(name);
  // Never play a stale click after a slow network load, mute, or tab switch.
  if(!sample||!enabled||hidden()||token!==generation||now()-requested>1200||laneName&&lanes.get(laneName)!==lane)return;
  const source=context.createBufferSource(),gain=context.createGain();
  if(lane)lane.source=source;
  source.buffer=sample;source.playbackRate.value=laneName==='echo-boss'?rate:rate*(.97+Math.random()*.06);gain.gain.value=laneName==='echo-boss'?volume:volume*(.95+Math.random()*.1);
  source.connect(gain);gain.connect(output(name));voices.add(source);
  source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect();if(laneName&&lanes.get(laneName)===lane)lanes.delete(laneName);};
  source.start(context.currentTime+delay);
 }
 async function fadedVoice60(name,volume=.08){
  if(!shelterFiles60[name]||!enabled||hidden()||!ensure())return;
  const horror=name!=='shelter-door60',laneName=horror?'shelter-horror60':'shelter-door60';
  const lane={source:null,gain:null},token=generation;stopLane(laneName);lanes.set(laneName,lane);
  const sample=await buffer(name);
  if(!sample||!enabled||hidden()||token!==generation||lanes.get(laneName)!==lane||horror&&currentScene!=='rare-shelter')return;
  const source=context.createBufferSource(),gain=context.createGain(),t=context.currentTime,d=sample.duration;
  lane.source=source;lane.gain=gain;source.buffer=sample;source.playbackRate.value=1;
  const fadeIn=Math.min(horror?1.2:.3,d*.25),fadeOut=Math.min(horror?1.8:.5,d*.3);
  gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+fadeIn);gain.gain.setValueAtTime(volume,t+Math.max(fadeIn,d-fadeOut));gain.gain.linearRampToValueAtTime(0,t+d);
  source.connect(gain);gain.connect(output(name));voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect();if(lanes.get(laneName)===lane)lanes.delete(laneName);};source.start(t);source.stop(t+d);
 }
 function desiredLayers(){
  if(menuMode)return{'menu-music81':.25,'weather-rain71':.22};
  const desired={...(SCENES[currentScene]||SCENES.road)};
  delete desired['camp-crowd'];
  if(currentScene==='base'&&currentLocation!==null&&currentLocation!==0)delete desired['camp-guitar'];
  if(currentScene==='base'&&currentLocation===0){delete desired['camp-guitar'];desired['first-music81']=.20;}
  if(currentScene==='base'&&[2,3,4].includes(currentLocation)){delete desired['camp-guitar'];desired[currentLocation===2?'swamp-base69':currentLocation===4?'district-base71':'radio-base69']=.19;}
  const travelScene=['road','road-night','camp','combat','combat-night','rare-fog','rare-radio','rare-shadow','rare-emission'].includes(currentScene)||currentScene.startsWith('event47-');
  if(travelScene&&(currentLocation!==null||currentScene.startsWith('event47-'))){
   delete desired.travel68;delete desired.forest;delete desired['night-v9'];if(currentScene==='rare-radio')delete desired['radio-loop'];
   const quiet=currentEncounter||!['road','road-night'].includes(currentScene);
   if(currentLocation===0){desired['first-music81']=quiet?.11:.28;desired['first-ambient81']=quiet?.035:.075;}
   else desired[currentLocation===2?'swamp-travel70':currentLocation===4?'district-travel71':'travel68']=quiet?.11:.28;
  }
  if(weatherRain&&!['blackout','echo-dead'].includes(currentScene))desired['weather-rain71']=weatherInside?.035:.26;
  if(typeof sickSeconds==='function'&&sickSeconds()>0&&currentScene!=='blackout')desired.diarrhea52=.55;
  return desired;
 }
 function stopLayer(name,immediate=false){
  const layer=layers.get(name);if(!layer)return;layers.delete(name);
  if(layer.source){try{if(!immediate)layer.gain.gain.setTargetAtTime(0,context.currentTime,name==='emission-siren'?.8:['camp-guitar','radio-base69','swamp-base69','district-base71','weather-rain71'].includes(name)?.5:.10);layer.source.stop(immediate?0:context.currentTime+(name==='emission-siren'?3:['camp-guitar','radio-base69','swamp-base69','district-base71','weather-rain71'].includes(name)?2:.35));}catch{}}
 }
 async function startLayer(name,volume){
  if(layers.has(name)||!context||!enabled||hidden())return;
  const layer={token:generation,source:null,gain:null,volume};layers.set(name,layer);
  try{
   const sample=await buffer(name);
   // Scene changes invalidate pending decode, including a quick exit and re-entry.
   if(!sample||layers.get(name)!==layer||!enabled||hidden()||layer.token!==generation||!Object.hasOwn(desiredLayers(),name))return;
   const source=context.createBufferSource(),gain=context.createGain();layer.source=source;layer.gain=gain;
   source.buffer=sample;source.loop=true;gain.gain.setValueAtTime(0,context.currentTime);gain.gain.linearRampToValueAtTime(desiredLayers()[name],context.currentTime+(name==='emission-siren'?2.5:['camp-guitar','radio-base69','swamp-base69','district-base71','weather-rain71'].includes(name)?2:.7));
   source.connect(gain);gain.connect(output(name,true));voices.add(source);
   source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect();if(layers.get(name)===layer)layers.delete(name);};source.start();
  }finally{if(!layer.source&&layers.get(name)===layer)layers.delete(name);}
 }
 function syncLayers(){
  const desired=desiredLayers();
  for(const name of layers.keys())if(!Object.hasOwn(desired,name))stopLayer(name,currentScene==='echo-dead');
  if(!context||!enabled||hidden())return;
  for(const [name,volume]of Object.entries(desired)){
   const layer=layers.get(name);if(layer?.gain){if(layer.volume!==volume){layer.gain.gain.setTargetAtTime(volume,context.currentTime,name==='emission-siren'?.65:.2);layer.volume=volume;}}
   else if(!layer)startLayer(name,volume);
  }
 }
 function setScene(scene,location=null,encounter=false){
  currentEncounter=!!encounter;
  currentLocation=Number.isInteger(location)&&location>=0&&location<5?location:null;
  const next=Object.hasOwn(SCENES,scene)?scene:'road';
  if(next!==currentScene){
   if(currentScene==='rare-shelter')stopLane('shelter-horror60');
   if(currentScene.startsWith('event47-'))stopLane('event47');
   if(next==='blackout'||currentScene==='blackout'||next.startsWith('echo-')&&!currentScene.startsWith('echo-')){generation++;stopVoices();}
   else{stopLane('echo-boss');stopLane('echo-glass');stopLane('zombie');}
  }
  currentScene=next;syncLayers();
 }
 function setCamp(value){setScene(value?'camp':'road');}
 function play(kind,options={}){
  if(!enabled||hidden()||menuMode&&!['click','weather-thunder71'].includes(kind))return;
  if(shelterFiles60[kind]){fadedVoice60(kind,kind==='shelter-door60'?.3:kind==='horror-rage60'?.14:.18);return;}
  if(kind==='weather-thunder71'){voice(kind,.46,0,1,'weather-thunder71');return;}
  if(kind==='emission-siren')return; // The uploaded siren is the single continuous emission layer.
  if(currentScene.startsWith('echo-')&&['wolves','dawn'].includes(kind))return;
  const time=now(),gap=kind==='danger'?170:kind==='step'?300:35;
  if(time-(lastPlayed.get(kind)??-Infinity)<gap)return;lastPlayed.set(kind,time);
  if(kind in banditLines52){speak52(banditLines52[kind]);return;}
  if(event47Sounds.includes(kind)){voice(kind,['event47-cart','event47-marks'].includes(kind)?.18:kind==='event47-rain'?.36:.42,0,1,'event47');return;}
  if(rareSounds.includes(kind)){voice(kind,kind==='emission-siren'?.24:kind==='anomaly-fog'?.18:.32);return;}
  switch(kind){
   case 'click':voice(['click-1','click-2','click-3'],.2);break;
   case 'switch':voice('cloth-2',.2);voice('metal-click',.15,.035);break;
   case 'inventory':voice('zipper',.45);voice('cloth-1',.24,.1);break;
   case 'open':voice('cloth-3',.22);voice('latch',.18,.035);break;
   case 'close':voice('book-close',.24);break;
   case 'map':voice('book-open',.35);voice('page',.2,.13);break;
   case 'equip':voice('belt',.3);voice('latch',.2,.1);break;
   case 'craft':voice('metal-click',.35);voice('wood',.25,.16);voice('metal-click',.25,.3);break;
   case 'depart':voice('belt',.3);voice('grass-1',.22,.18);break;
   case 'return':voice('cloth-1',.25);voice('book-close',.22,.1);break;
   case 'step':voice(options.surface==='mud'?'mud-step64':options.surface==='concrete'?['concrete-1','concrete-2','concrete-3']:['grass-1','grass-2','grass-3'],.28);break;
   case 'shot':voice('shot',.8);voice('metal-click',.12,.1);break;
   case 'jam':voice('metal-click',.38);break;
   case 'reload':voice('reload',.35);break;
   case 'chupacabra':voice('dog-growl',.58,0,.68);voice('heavy',.30,.08,.62);break;
   case 'dog':voice('dog-growl',.65);break;
   case 'dogAttack':voice('dog-bark',.5);voice('dog-growl',.4,.15);break;
   case 'ratVoice':voice('rat-voice',.38);break;
   case 'ratAttack':voice('rat-attack',.4);break;
   case 'ratDown':voice('rat-down',.35);break;
   case 'bumVoice':voice(['bum-babble-1','bum-babble-2'],.55);break;
   case 'bumAttack':voice('bum-attack',.48);break;
   case 'bumDown':voice('bum-down',.45);break;
   case 'upgradeFail':voice('heavy',.32);voice('metal-click',.25,.16);break;
   case 'hit':voice('hit',.35);break;
   case 'search':voice('cloth-2',.22);voice('wood',.15,.12);break;
   case 'crate':voice('creak',.35);voice('wood',.23,.18);voice('cloth-2',.3,.43);break;
   case 'zombieRoar':voice('zombie-roar',.42,0,1,'zombie');break;
   case 'zombieAttack':voice('zombie-attack',.45,0,1,'zombie');break;
   case 'zombieDeath':voice('zombie-death',.5,0,1,'zombie');break;
   case 'echoGlass':voice('echo-glass',.45,0,1,'echo-glass');break;
   // Legacy ambient calls are silent; no rotating howl/whine/crowd playlist.
   case 'echoHowl':case 'echoWhine':case 'echoBroadcast':case 'echoStatic':break;
   case 'echoWindup':voice('echo-windup',.16,.30,1,'echo-boss');break;
   case 'echoAttack':voice('echo-attack',.48,0,1,'echo-boss');break;
   case 'echoDeath':voice('echo-death',.60,0,1,'echo-boss');break;
   case 'loot':voice(['glass-1','glass-2'],.28);voice('cloth-1',.2,.12);break;
   case 'coin':voice(['coins-1','coins-2'],.4);break;
   case 'bandageWrap':voice('bandage-wrap',.5);break;
   case 'bottleUnscrew':voice('bottle-unscrew',.4);break;
   case 'canOpenFizz':voice('can-open-fizz',.55);break;
   case 'gulp':voice('swallow',.35);break;
   case 'energy':voice('can',.35);voice('swallow',.35,.2);break;
   case 'vodka':case 'drink':voice('bottle-open',.3);voice('swallow',.35,.23);break;
   case 'heal':voice('latch',.25);voice('cloth-3',.4,.1);break;
   case 'levelUp':voice('level-up',.48);break;
   case 'tired':voice('heartbeat',.38);break;
   case 'water':voice('water',.38);voice('swallow',.35,.5);break;
   case 'rest':voice('cloth-1',.3);voice('wood',.2,.15);break;
   case 'patrol':voice('heavy',.32);voice('belt',.28,.18);break;
   case 'failure':voice('patrol-fail-v9',.5);break;
   case 'dawn':voice('rooster',.4);break;
   case 'wolves':voice('wolves',.28);break;
   case 'danger':voice('metal-click',.09,0,1.55);break;
   case 'boss':voice('heavy',.45,0,.65);voice('heartbeat',.3,.15);break;
   default:voice('click-1',.18);
  }
 }
 const banditLines52={'bandit-hail52':'Опа, сталкер. Не спеши. Три загадки, и разойдёмся.','bandit-yes52':'Сечёшь, бродяга. Уважаем.','bandit-no52':'Не угадал. Думай головой, сталкер.','bandit-stop52':'Гоп стоп. Рюкзак оставляй и проваливай.'};
 function speak52(text){if(!enabled||hidden()||!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;try{window.speechSynthesis.cancel();const u=new window.SpeechSynthesisUtterance(text);u.lang='ru-RU';u.rate=.9;u.pitch=.72;u.volume=.65*levels.master*levels.sfx;const voices=window.speechSynthesis.getVoices().filter(v=>v.lang.startsWith('ru'));u.voice=voices.find(v=>/pavel|yuri|dmit|male|муж/i.test(v.name))||voices[0]||null;window.speechSynthesis.speak(u);}catch{}}
 function setEnabled(value){
  enabled=!!value;persistMixer();generation++;if(!enabled)window.speechSynthesis?.cancel();
  if(!enabled){if(master)master.gain.setTargetAtTime(0,context.currentTime,.025);stopVoices();}
  else if(ensure()){master.gain.setTargetAtTime(.7*levels.master,context.currentTime,.025);syncLayers();}
 }
 preload();
 return{settings,setVolume,setMenu(value){const next=!!value;if(menuMode===next)return;menuMode=next;generation++;stopVoices();syncLayers();},setWeather(rain,inside=false){if(weatherRain===!!rain&&weatherInside===!!inside)return;weatherRain=!!rain;weatherInside=!!inside;syncLayers();},play,preload,setEnabled,setCamp,setScene,unlock(value=true){enabled=!!value;if(enabled&&ensure()){master.gain.setTargetAtTime(.7*levels.master,context.currentTime,.025);syncLayers();}},suspend(){window.speechSynthesis?.cancel();generation++;stopVoices();if(context?.state==='running')context.suspend().catch(()=>{});}};
})();
