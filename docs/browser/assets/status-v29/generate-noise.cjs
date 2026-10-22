// Reproduce the original seamless white-noise tile. Requires sharp.
const sharp=require('sharp'),path=require('path');
const pixels=Buffer.alloc(128*128*4);let seed=29137;
for(let i=0;i<pixels.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=seed>>>24;pixels[i]=pixels[i+1]=pixels[i+2]=255;pixels[i+3]=v<120?0:Math.round((v-120)*1.6);}
sharp(pixels,{raw:{width:128,height:128,channels:4}}).webp({lossless:true}).toFile(path.join(__dirname,'radiation-noise.webp'));
