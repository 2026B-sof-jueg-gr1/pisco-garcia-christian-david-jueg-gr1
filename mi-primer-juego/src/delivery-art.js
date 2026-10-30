window.DeliveryArt={
 textures(s){const g=s.make.graphics({x:0,y:0,add:false});const save=(key,w,h)=>{g.generateTexture(key,w,h);g.clear();};
  // Moto mirando hacia la derecha: ruedas, chasis, cajas, piloto y casco.
  g.fillStyle(0x332e29,.25).fillEllipse(35,27,61,23);g.fillStyle(0x292c2c).fillRoundedRect(1,15,19,12,5).fillRoundedRect(45,15,21,12,5);g.lineStyle(2,0xd3d0ba).lineBetween(5,21,60,21);g.fillStyle(0xc45e40).fillRoundedRect(12,11,37,20,6);g.lineStyle(2,0x34382f).strokeRoundedRect(12,11,37,20,6);g.fillStyle(0xbe9059).fillRoundedRect(6,8,19,26,2);g.lineStyle(2,0x725537).strokeRect(6,8,19,26).lineBetween(15,8,15,34);g.fillStyle(0x376d62).fillEllipse(32,21,22,23);g.lineStyle(3,0x365e54).lineBetween(35,13,49,9).lineBetween(35,29,49,33);g.lineStyle(3,0x373e37).lineBetween(50,8,50,34);g.fillStyle(0xf6e7bd).fillCircle(39,21,9);g.lineStyle(2,0x3f4439).strokeCircle(39,21,9);g.fillStyle(0x4a6766).fillRoundedRect(42,15,5,12,2);g.fillStyle(0xffe8a2).fillRect(60,17,4,8);save('moto',70,43);
  [0x769b9b,0xc77754,0xd8b862].forEach((c,i)=>{g.fillStyle(0x242a2a).fillRoundedRect(10,0,17,7,2).fillRoundedRect(10,35,17,7,2).fillRoundedRect(48,0,17,7,2).fillRoundedRect(48,35,17,7,2);g.fillStyle(c).fillRoundedRect(2,5,76,32,9);g.lineStyle(2,0x384340).strokeRoundedRect(2,5,76,32,9);g.fillStyle(0xacc7be).fillRoundedRect(28,8,30,26,5);g.fillStyle(c).fillRect(35,8,15,26);g.fillStyle(0xffe4a3).fillRect(72,8,5,7).fillRect(72,27,5,7);save('car'+i,82,43);});g.destroy();
 },
 city(s){const g=s.add.graphics().setDepth(0),R=DeliveryRules;g.fillStyle(0xb9b797).fillRect(0,0,1280,960);
  // Bordes de papel y aceras con adoquines.
  g.fillStyle(0xdad3b4).fillRoundedRect(40,40,1200,880,18);R.roadsX.forEach(x=>g.fillStyle(0x777e79).fillRect(x-52,40,104,880));R.roadsY.forEach(y=>g.fillStyle(0x777e79).fillRect(40,y-52,1200,104));
  g.lineStyle(2,0xe8ddb5,.6);R.roadsX.forEach(x=>{for(let y=55;y<910;y+=38)if(!R.roadsY.some(ry=>Math.abs(ry-y)<75))g.lineBetween(x,y,x,y+17);});R.roadsY.forEach(y=>{for(let x=55;x<1230;x+=38)if(!R.roadsX.some(rx=>Math.abs(rx-x)<75))g.lineBetween(x,y,x+17,y);});
  R.roadsX.forEach(x=>R.roadsY.forEach(y=>{for(let n=-34;n<40;n+=12){g.fillStyle(0xece1bc,.7).fillRect(x+n,y-70,7,17).fillRect(x+n,y+53,7,17);}}));
  const colors=[0xb97658,0xc5a365,0x7e9e8e,0xd49471,0x8d9c9a,0xbf9062];R.blocks.forEach((b,i)=>{g.fillStyle(0x443e32,.2).fillRoundedRect(b.x+10,b.y+12,b.w,b.h,4);g.fillStyle(colors[i]).fillRoundedRect(b.x,b.y,b.w,b.h,5);g.lineStyle(3,0x655c48).strokeRoundedRect(b.x,b.y,b.w,b.h,5);g.fillStyle(0xe1c5a0).fillRect(b.x+7,b.y+7,b.w-14,12);g.lineStyle(1,0x6c5946,.35);for(let y=b.y+30;y<b.y+b.h-5;y+=15)g.lineBetween(b.x+8,y,b.x+b.w-8,y);
   g.fillStyle(0x5e716a).fillRoundedRect(b.x+24,b.y+35,47,32,3);g.lineStyle(3,0xe2c9a5).strokeRect(b.x+24,b.y+35,47,32);g.fillStyle(0xd6c6a2).fillRect(b.x+108,b.y+45,30,25);g.fillStyle(0x8a8d77).fillCircle(b.x+123,b.y+57,10);g.lineStyle(2,0x5f6d60).strokeCircle(b.x+123,b.y+57,6);
   const label=s.add.text(b.x+b.w/2,b.y+118,['MERCADO','BOTICA','CASA ROSA','PAN Y CAFÉ','BICICLETAS','PAPELERÍA'][i],{fontFamily:'Georgia',fontStyle:'bold',fontSize:'12px',color:'#f9e3b3',backgroundColor:'#69594a',padding:{x:8,y:5}}).setOrigin(.5).setDepth(1);
  });
  for(let i=0;i<32;i++){const x=65+(i*173)%1140,y=65+(i*113)%820;if(R.roadsX.some(rx=>Math.abs(rx-x)<78)||R.roadsY.some(ry=>Math.abs(ry-y)<78)||R.collision({x,y},25))continue;g.fillStyle(0x304638,.17).fillEllipse(x+7,y+10,40,26);g.fillStyle(0x657d51).fillCircle(x,y,17);g.fillStyle(0x8e9c62).fillCircle(x-6,y-5,12);g.lineStyle(2,0x536344).strokeCircle(x,y,17);}
  // Calles, postes y huellas discretas dan escala al barrio.
  ['CALLE DEL SOL','AV. DEL MERCADO','CALLE DE LOS TALLERES'].forEach((name,i)=>s.add.text(610,R.roadsY[i]+31,name,{fontFamily:'monospace',fontSize:'10px',color:'#eee1b3'}).setAlpha(.65).setDepth(1));
  for(let i=0;i<160;i++){const x=50+(i*137)%1180,y=50+(i*83)%860;g.fillStyle(0x504c3b,.07).fillRect(x,y,2,2);}
  g.fillStyle(0xf1d69a).fillRoundedRect(80,840,160,44,5);s.add.text(160,860,'EL ÚLTIMO REPARTO',{fontFamily:'Georgia',fontStyle:'bold',fontSize:'11px',color:'#70533c'}).setOrigin(.5);
 }
};
