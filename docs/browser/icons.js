'use strict';
// Generated PNG atlases stay intact; CSS selects an evenly sized cell.
const ITEM_CELLS={scrap:[0,0],circuit:[1,0],cloth:[2,0],artifact:[3,0],medkit:[0,1],vodka:[1,1],energy:[2,1],pistol:[3,1],jacket:[0,2],boots:[1,2],pack:[2,2],helmet:[3,2]};
const EQUIPMENT_CELLS={stalkerPack:[0,0],gasmask:[1,0],headlamp:[0,1],container:[1,1]};
const GENERATED_ITEMS=['tarpaulin','radioParts','weaponParts','pistolMk2','armorMk2','bootsMk2','packMk2','maskMk2','lampMk2','anomalousComponent','visor','artifactX'];
function itemIcon(key){const standalone77=window.Refresh77?.itemIcon(key);if(standalone77)return standalone77;
 const icon72=window.Progression72?.itemIcon(key);if(icon72)return icon72;
 if(['ratTail','ratRear','junkWatch','junkRing','junkChain'].includes(key))return '<span class="drawn-icon enemy-item-icon '+(key.startsWith('junk')?'jewelry-icon':'')+'" data-item="'+key+'"><img src="assets/enemies-v24/'+key+'.webp" alt="" aria-hidden="true" decoding="async"></span>';
 if(key==='alphaFang')return '<span class="drawn-icon alpha-trophy" style="background-image:url(assets/rare-v23/alphaFang.webp)" aria-hidden="true"></span>';
 if(GENERATED_ITEMS.includes(key))return '<span class="drawn-icon generated-item-icon '+(['tarpaulin','radioParts','weaponParts'].includes(key)?'material-icon':'')+'" data-item="'+key+'"><img src="assets/anomaly-v11/'+key+'.webp" alt="" aria-hidden="true" decoding="async">'+(key.endsWith('Mk2')?'<small class="gear-tier">II</small>':'')+'</span>';
 if(['tail','fang','collar'].includes(key))return '<span class="drawn-icon trophy-icon" data-item="'+key+'" style="background-position:'+(['tail','fang','collar'].indexOf(key)*50)+'% 50%" aria-hidden="true"></span>';
 if(key==='artifact')return '<span class="drawn-icon artifact-icon" data-item="artifact" aria-hidden="true"></span>';
 if(Object.hasOwn(EQUIPMENT_CELLS,key)){const [x,y]=EQUIPMENT_CELLS[key];return '<span class="drawn-icon new-equipment-icon" data-item="'+key+'" style="background-position:'+x*100+'% '+y*100+'%" aria-hidden="true"></span>';}
 const [x,y]=ITEM_CELLS[key]||ITEM_CELLS.pack;
 return '<span class="drawn-icon" data-item="'+(Object.hasOwn(ITEM_CELLS,key)?key:'pack')+'" style="background-position:'+(x/3*100)+'% '+(y/2*100)+'%" aria-hidden="true"></span>';
}
function portraitArt(index){
 const local=window.Hubs62?.portrait(index);if(local)return '<img class="npc-photo npc-photo62" src="'+local+'" alt="" aria-hidden="true" decoding="async">';
 const photos={0:"trader-v1.jpg",1:"buyer-v1.jpg",2:"technician-v1.jpg"};
 if(Object.hasOwn(photos,index))return '<img class="npc-photo" src="assets/'+photos[index]+'" alt="" aria-hidden="true" decoding="async">';
 const cell=Math.max(0,Math.min(3,index));
 return '<span class="portrait-art" data-portrait="'+cell+'" style="background-position:'+(cell%2*100)+'% '+(Math.floor(cell/2)*100)+'%" aria-hidden="true"></span>';
}
// Functional controls use exact vectors to remain legible at small sizes.
const UI_PATHS={
 alcohol1:'<circle cx="12" cy="12" r="9"/><path d="M8 9.5h.1m7.8 0h.1M7.7 14c1.6 2.7 7 2.7 8.6 0"/>',
 alcohol2:'<circle cx="12" cy="12" r="9"/><path d="M6.8 9.7q1.6-2.2 3.1 0m4.2 0q1.6-2.2 3.1 0M6.8 13h10.4c-.6 6.5-9.8 6.5-10.4 0Z"/>',
 alcohol3:'<g transform="rotate(-10 10 14)"><circle cx="10" cy="14" r="7.5"/><path d="m5.8 11.5 2.8.7m2.8-.7 2.8.7M5.8 15.6q4.2 5.2 8.4 0"/></g><circle cx="18" cy="4" r="2.1"/><circle cx="21" cy="9.5" r="1.2"/><circle cx="12.5" cy="2" r=".7"/>',
 alcohol4:'<circle cx="10" cy="14" r="7.5"/><path d="m5.5 11 3 2-3 1m9-3-3 2 3 1M6 17q2-2 4 0t4 0m-4 0v3"/><circle cx="18.3" cy="3.8" r="2.1"/><circle cx="21.5" cy="9.5" r="1.1"/>',
 alcohol5:'<circle cx="10.5" cy="13.5" r="8"/><path d="m5 10 3 2m-3 0 3-2m5 0 3 2m-3 0 3-2M6.5 17q4-3 8 0M20 4c-1.2 2-2 2.7-2 4a2 2 0 0 0 4 0c0-1.3-.8-2-2-4Z"/>',

 person:'<circle cx="12" cy="6" r="4"/><path d="M4 22v-4a8 8 0 0 1 16 0v4M8 22v-5m8 5v-5"/>',
 rest:'<path d="M2 16h20v5M2 12v9M6 12h13a3 3 0 0 1 3 3v1H2v-4Z"/><path d="M6 12V8h5v4M14 3h5l-5 5h5"/>',
 illness:'<path d="M9 3v6c-5-1-7 2-6 6 1 5 6 7 10 6 6-1 9-7 6-11-2-3-5-1-6-3V3"/><path d="m8 13 3 3m0-3-3 3"/>',
 warehouse:'<path d="M3 9 12 3l9 6v12H3Z"/><path d="M6 11h12v10M6 14h12M6 17h12"/>',
 dungeon:'<path d="M3 3h18v5H7v5h7v5h7v3H3Z"/><path d="m10 6 3 3 3-3M13 2v7"/>',
 tarpaulin:'<path d="m3 4 15-2 4 15-15 5Z"/><path d="m6 7 10-2 2 10-10 3Zm-3-3 4 3m11-5-2 3m6 12-4-2M7 22l1-4"/>',
 radioParts:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 9h8v7H8ZM8 1v4m4-4v4m4-4v4M8 20v3m4-3v3m4-3v3M1 9h3m-3 6h3m16-6h3m-3 6h3"/>',
 weaponParts:'<path d="m3 5 12-2 6 5-2 5-11 1-2 7-4-1 2-8Z"/><path d="m8 7 10-1M7 14l7-1 2 4-5 2M17 10h3"/>',
 star:'<path d="m12 2 3 6.1 6.7 1-4.9 4.8 1.2 6.7-6-3.2-6 3.2 1.2-6.7-4.9-4.8 6.7-1Z"/>',
 headlamp:'<path d="M3 9h18v6H3zM7 9V6h10v3M7 15v3h10v-3"/><circle cx="12" cy="12" r="4"/><path d="m20 4 2-2M12 3V1M4 4 2 2"/>',
 gasmask:'<path d="M5 4c3-3 11-3 14 0l2 10-6 8H9l-6-8Z"/><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M8 15h8v5H8zM10 15v5m4-5v5M3 15H1v5h4"/>',
 stalkerPack:'<path d="M9 5V2h6v3M7 5h10a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z"/><path d="M4 10h16M8 14h8v5H8zM12 15v3M9 16.5h6M2 9v9m20-9v9"/>',
 container:'<rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 5V2h8v3M4 11h16M9 11v3h6v-3M8 18h8"/>',
 bleeding:'<path d="M12 2C10 6 4 11 4 16a8 8 0 0 0 16 0c0-5-6-10-8-14Z"/><path d="M8 15c-1 2 0 4 2 4"/>',
 radiation:'<circle cx="12" cy="12" r="2"/><path d="M10 8.5 6 2.7a10 10 0 0 1 12 0l-4 5.8M15.5 12.5l6.9-.5a10 10 0 0 1-6 10l-3-6.3M10.5 15.7l-3 6.3a10 10 0 0 1-6-10l6.9.5"/>',
 sound:'<path d="M3 9h4l5-4v14l-5-4H3Z"/><path d="M16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
 muted:'<path d="M3 9h4l5-4v14l-5-4H3Z"/><path d="m17 9 5 6m0-6-5 6"/>',
 energy:'<path d="m14 2-9 12h7l-2 8 9-12h-7Z"/>',
 heart:'<path d="M12 21 3.5 12.5C-2 7 5 0 12 7c7-7 14 0 8.5 5.5Z"/>',
 people:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6m1 5a5 5 0 0 1 3 5"/>',
 backpack:'<path d="M9 5V2h6v3M7 5h10a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z"/><path d="M8 14h8v5H8Zm-4-4h16M8 10v3m8-3v3"/>',
 map:'<path d="m2 5 7-3 6 3 7-3v17l-7 3-6-3-7 3Zm7-3v17m6-14v17"/>',
 quest:'<rect x="4" y="3" width="16" height="19" rx="2"/><path d="M8 2h8v4H8Zm0 9 2 2 3-4M8 17h8"/>',
 walk:'<path d="m4 21 7-8-3-3 4-5 4 5h5M12 13l5 8M5 11l3-4"/><circle cx="15" cy="3" r="2"/>',
 right:'<path d="M3 12h18m-7-7 7 7-7 7"/>',
 return:'<path d="m9 4-6 6 6 6M3 10h10a7 7 0 0 1 7 7v3"/>',
 left:'<path d="m16 20-1-9H4m0 0 7-7m-7 7 7 7"/>',
 branch:'<path d="M8 21V11h12m0 0-7-7m7 7-7 7"/>',
 search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 7 7"/>',
 weapon:'<path d="m4 3 13 13m3 4-3-3m-7-4 5-5m-9 3 5-5M20 3 7 16m-3 4 3-3m7-4-5-5m9 3-5-5"/>',
 shield:'<path d="m12 2 9 4v7c0 5-9 9-9 9s-9-4-9-9V6Zm-5 10 3 3 7-7"/>',
 check:'<path d="m4 12 5 5L20 6"/>',
 plus:'<path d="M12 4v16M4 12h16"/>',
 close:'<path d="m5 5 14 14M19 5 5 19"/>',
 stick:'<path d="m5 22 11-20m-4 8 6-1M8 15l-4-1"/>'
};
function uiIcon(key){return '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(UI_PATHS[key]||UI_PATHS.plus)+'</svg>';}
for(const el of document.querySelectorAll('[data-ui]'))el.innerHTML=uiIcon(el.dataset.ui);
