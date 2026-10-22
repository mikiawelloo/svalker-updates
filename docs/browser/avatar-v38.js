'use strict';
// One fixed pose and anchor system for every layer of the equipped character.
function avatarBack(c,key){
 if(!key)return;
 if(key==='container'){
  path(c,[[-32,-15],[-54,-11],[-56,53],[-33,61]],'#667276','#1e2a2b',3);
  path(c,[[-53,-7],[-43,-5],[-45,48],[-55,50]],'#39484b');
  line(c,-50,0,-49,42,'#a1abad',2);line(c,-55,10,-34,9,'#263237',4);line(c,-55,39,-34,38,'#263237',4);
  path(c,[[-48,15],[-38,15],[-38,29],[-48,29]],'#b5a965');ellipse(c,-43,22,2,3,'#333a30');
  return;
 }
 const advanced=key==='packMk2',shielded=key==='stalkerPack'||advanced;
 const fabric=advanced?'#536360':shielded?'#65715a':'#84734f',edge='#263835';
 path(c,[[-34,-28],[-53,-16],[-56,49],[-40,65],[-29,58],[-28,-18]],fabric,edge,3);
 path(c,[[32,-24],[44,-16],[48,46],[33,60]],fabric,edge,3);
 line(c,-47,-12,-49,45,advanced?'#8b9991':'#ad9f79',2);
 path(c,[[-55,3],[-39,1],[-38,27],[-56,28]],advanced?'#344b4d':'#57604b',edge,2);
 line(c,-55,9,-39,8,'#a4a78a',2);
 if(shielded){
  path(c,[[-55,35],[-37,33],[-36,55],[-53,58]],advanced?'#8a999b':'#7e8780',edge,2);
  line(c,-53,39,-37,37,'#c1c7b7',2);ellipse(c,-45,48,3,3,'#c4b577');
 }
 if(advanced){
  path(c,[[-50,-28],[-38,-32],[-28,-22],[-32,-13],[-51,-14]],'#384d4e',edge,2);
  line(c,-53,32,-38,30,'#c0b584',3);line(c,36,-8,42,35,'#a9b9b2',3);
 }
}
function avatarBoots(c,key){
 for(const x of [-18,20]){
  if(!key){ellipse(c,x,112,17,8,'#c5a17f');line(c,x-10,116,x+10,116,'#8c7159',1);continue;}
  const advanced=key==='bootsMk2';
  path(c,[[x-11,86],[x+11,86],[x+12,106],[x+20,111],[x+19,119],[x-15,119],[x-17,112]],advanced?'#485757':'#333c39','#1b282a',2);
  line(c,x-14,119,x+18,119,advanced?'#a4ada4':'#7c8174',3);
  for(let y=92;y<107;y+=5)line(c,x-6,y,x+6,y,advanced?'#b2b7a1':'#a09273',1.5);
  if(advanced){path(c,[[x-10,83],[x+10,83],[x+12,94],[x-12,94]],'#66746c','#263737',1.5);line(c,x-11,91,x+11,91,'#b3bba8',2);}
 }
}
function avatarClothes(c,key){
 const armored=key==='armorMk2',jacket=key==='jacket';
 const coat=armored?'#53675e':jacket?'#8b947e':'#6c7774';
 // A plain undershirt remains when the outer clothing slot is empty.
 line(c,-24,-10,-37,47,coat,17);line(c,25,-10,39,47,coat,17);
 path(c,[[-29,-23],[28,-23],[33,45],[-33,45]],coat,'#263c39',3);
 if(jacket){
  line(c,0,-20,0,36,'#4c6257',2);
  path(c,[[-27,-22],[-12,-6],[0,-21],[13,-6],[27,-22]],'#617664','#344b43',1.5);
  for(const x of [-24,8]){c.fillStyle='#5e735f';c.fillRect(x,3,17,17);line(c,x,8,x+17,8,'#b7b799',2);}
  line(c,-38,28,-28,30,'#b6b797',3);line(c,30,30,41,28,'#b6b797',3);
 }else if(armored){
  path(c,[[-27,-16],[27,-16],[24,30],[12,39],[-15,39],[-26,28]],'#364c49','#a2ada0',2);
  path(c,[[-20,-11],[20,-11],[17,15],[-18,15]],'#6e8276','#293e3a',2);
  line(c,-15,-3,15,-3,'#a7b3a2',2);line(c,-14,6,14,6,'#344e48',2);
  for(const x of [-34,32]){path(c,[[x-9,-19],[x+9,-19],[x+11,-4],[x-10,0]],'#6c7d6c','#2a3b36',2);ellipse(c,x,28,9,11,'#344846');}
  for(const x of [-22,-6,10]){c.fillStyle='#7d8060';c.fillRect(x,21,12,15);line(c,x,25,x+12,25,'#b1b18d',1.5);}
 }else{
  path(c,[[-12,-22],[0,-15],[12,-22]],null,'#b3b7a4',2);line(c,0,-14,0,38,'#505f5e',1);
 }
 c.fillStyle='#384d43';c.fillRect(-31,37,63,8);c.fillStyle='#b4a774';c.fillRect(-5,36,11,10);
}
function avatarHarness(c,key){
 if(!key)return;
 for(const side of [-1,1]){
  line(c,side*21,-22,side*25,30,key==='container'?'#344145':'#394f43',5);
  c.fillStyle=key==='packMk2'?'#a2b1aa':'#a59b77';c.fillRect(side*23-3,-3,6,9);
 }
 if(key==='stalkerPack'||key==='packMk2')line(c,-23,13,23,13,'#89937c',3);
}
function avatarFace(c,key){
 ellipse(c,0,-52,23,29,'#c7a283');
 path(c,[[-23,-58],[-22,-76],[-7,-85],[13,-80],[24,-63],[16,-63],[-14,-67]],'#48524a','#263a37',2);
 line(c,-17,-55,-7,-55,'#2f403a',2);line(c,7,-55,17,-55,'#2f403a',2);
 line(c,-2,-48,-4,-39,'#957658',2);line(c,-8,-31,8,-31,'#6c554a',2);
 if(key==='visor'){
  line(c,-24,-58,24,-58,'#293c3e',7);
  path(c,[[-23,-61],[23,-61],[20,-43],[-20,-43]],'#568f98','#203436',2);
  path(c,[[-18,-58],[-4,-58],[-13,-46],[-19,-46]],'#b6d6d1');line(c,3,-57,17,-57,'#c9e4d7',2);
 }else if(key==='gasmask'||key==='maskMk2'){
  const advanced=key==='maskMk2';
  path(c,[[-22,-63],[22,-63],[23,-40],[16,-24],[-16,-24],[-23,-40]],advanced?'#3c5050':'#67705b','#1a2c2c',2);
  if(advanced){
   path(c,[[-20,-61],[20,-61],[17,-45],[-17,-45]],'#658e91','#182c2d',2);line(c,-14,-56,12,-56,'#a8c7c1',2);
   for(const x of [-22,22]){ellipse(c,x,-33,8,11,'#87948a');line(c,x-4,-38,x+4,-38,'#334744',2);line(c,x-4,-32,x+4,-32,'#334744',2);}
   ellipse(c,0,-33,6,5,'#1e3434');
  }else{
   for(const x of [-11,11]){ellipse(c,x,-54,9,8,'#213637');ellipse(c,x-2,-56,3,2,'#7c9c94');}
   ellipse(c,12,-28,10,9,'#35473d');ellipse(c,12,-28,6,5,'#83927d');line(c,-8,-38,7,-38,'#33493e',3);
  }
 }
}
function avatarHeadgear(c,key){
 if(!key)return;
 const advanced=key==='lampMk2';line(c,-24,-67,24,-67,advanced?'#2f4545':'#303c32',7);
 c.fillStyle=advanced?'#7d908b':'#8b8b66';c.fillRect(advanced?-15:-10,-76,advanced?30:20,17);
 if(advanced){for(const x of [-7,7]){ellipse(c,x,-68,5,6,'#c2e4dd');ellipse(c,x,-68,2,3,'#f1fff0');}c.fillStyle='#506765';c.fillRect(22,-74,7,15);}
 else{ellipse(c,0,-68,7,7,'#333f36');ellipse(c,0,-68,4,5,'#e5d9a6');}
}
function avatarWeapon(c,key){
 if(key){
  c.save();c.translate(41,46);c.rotate(.42);
  const advanced=key==='pistolMk2';
  path(c,[[-7,-14],[advanced?43:31,-14],[advanced?43:31,-5],[10,-5],[11,17],[-2,17]],advanced?'#65777b':'#344542','#202e2f',2);
  line(c,-2,-11,advanced?38:27,-11,advanced?'#bbc5bc':'#8b998a',2);
  path(c,[[1,0],[8,0],[10,15],[0,15]],'#46524a');
  if(advanced){c.fillStyle='#344749';c.fillRect(24,-5,11,6);line(c,41,-13,41,-6,'#c7c7a3',2);}
  c.restore();
 }
 // Fingers cover the grip, so the weapon stays held when changing its model.
 ellipse(c,-37,51,8,10,'#c5a17f');ellipse(c,39,51,7,9,'#c5a17f');
 if(key)line(c,35,47,43,50,'#8a725c',2);
}
function drawSurvivor(c){if(window.Progression72?.drawPlayer(c))return;
 const bg=c.createLinearGradient(0,0,0,380);bg.addColorStop(0,'#394b48');bg.addColorStop(1,'#202d32');c.fillStyle=bg;c.fillRect(0,0,260,380);
 for(let y=30;y<380;y+=32)line(c,16,y,244,y,'#a4af8c15',1);
 for(let x=34;x<260;x+=32)line(c,x,16,x,364,'#a4af8c10',1);
 ellipse(c,130,341,69,12,'#111d20');c.save();c.translate(130,166);c.scale(1.42,1.42);
 const eq=state.equipment;
 avatarBack(c,eq.back);
 c.fillStyle='#384a4b';c.fillRect(-23,36,20,73);c.fillRect(6,36,20,73);
 for(const x of [-14,15]){ellipse(c,x,73,8,11,'#52665e');line(c,x-7,82,x+7,82,'#243b39',2);}
 avatarBoots(c,eq.feet);ellipse(c,0,-22,12,16,'#b18c70');
 avatarClothes(c,eq.body);avatarHarness(c,eq.back);avatarFace(c,eq.mask);avatarHeadgear(c,eq.head);avatarWeapon(c,eq.weapon);
 c.restore();
 $('survivor').setAttribute('aria-label','Персонаж: '+Object.values(eq).filter(Boolean).map(key=>GEAR[key]?.name).filter(Boolean).join(', '));
}
