/* Arte vectorial original: texturas generadas en Phaser, sin assets remotos. */
window.EcoArt = {
  colors: { mint: 0xb3edcd, orange: 0xf2ac87, floor: 0x172823, wall: 0x35473b },
  textures(scene) {
    if (scene.textures.exists('operator')) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const save = (key, w, h) => { g.generateTexture(key, w, h); g.clear(); };
    g.fillStyle(0x000000, .25).fillEllipse(20, 36, 30, 12);
    g.fillStyle(0x718e78).fillRoundedRect(7, 15, 26, 22, 8);
    g.fillStyle(0xe8ebd8).fillRoundedRect(6, 4, 28, 27, 11);
    g.fillStyle(0x284b43).fillRoundedRect(10, 13, 20, 9, 4);
    g.fillStyle(0xb3edcd).fillRect(13, 15, 5, 3);
    g.fillStyle(0xffffff, .6).fillRoundedRect(11, 7, 13, 3, 2);
    g.fillStyle(0xe8ebd8).fillRoundedRect(3, 24, 6, 9, 3).fillRoundedRect(31, 24, 6, 9, 3);
    save('operator', 40, 44);
    g.fillStyle(0xb3edcd, .15).fillCircle(20, 22, 19);
    g.lineStyle(2, 0xb3edcd, .9).strokeRoundedRect(7, 5, 26, 30, 10);
    g.fillStyle(0xb3edcd, .3).fillRoundedRect(7, 5, 26, 30, 10);
    g.fillStyle(0xe6ffeb).fillRoundedRect(12, 14, 16, 5, 2);
    save('echo', 40, 44);
    g.fillStyle(0xf2ac87, .08).fillCircle(24, 24, 24);
    g.fillStyle(0x3c342c).fillCircle(24, 24, 15);
    g.lineStyle(2, 0xf2ac87).strokeCircle(24, 24, 15);
    g.fillStyle(0xf2ac87).fillTriangle(17, 20, 31, 20, 24, 30);
    g.lineStyle(2, 0x8e6e52).lineBetween(2, 24, 10, 24).lineBetween(38, 24, 46, 24);
    save('drone', 48, 48);
    g.fillStyle(0xf2cc8f, .12).fillCircle(20, 20, 20);
    g.fillStyle(0xf2cc8f).fillPoints([{x:20,y:6},{x:29,y:20},{x:20,y:34},{x:11,y:20}],true);
    g.fillStyle(0xfff0cf).fillTriangle(20, 6, 20, 20, 11, 20);
    g.lineStyle(1, 0xffefc4).strokePoints([{x:20,y:6},{x:29,y:20},{x:20,y:34},{x:11,y:20}],true);
    save('shard', 40, 40);
    g.fillStyle(0xffffff).fillRect(0,0,48,48); save('solid',48,48);
    g.fillStyle(0xb3edcd).fillCircle(3,3,3); save('spark',6,6);
    g.destroy();
  },
  room(scene, level) {
    const g = scene.add.graphics().setDepth(0);
    g.fillStyle(0x101c19).fillRect(0,0,960,576);
    for(let y=1;y<11;y++) for(let x=1;x<19;x++) {
      const v = ((x*13+y*7)%5);
      g.fillStyle([0x1a2b25,0x1c2e27,0x1b2c26,0x1d2e28,0x1b2d26][v]).fillRect(x*48+1,y*48+1,46,46);
      g.lineStyle(1,0x9fbd8b,.035).lineBetween(x*48+8,y*48+47,x*48+40,y*48+47);
      if((x*7+y*11)%17===0){g.fillStyle(0x7e9b70,.18).fillCircle(x*48+12,y*48+14,2).fillCircle(x*48+18,y*48+11,1);}
    }
    const wallTiles = [...level.walls];
    for(let x=0;x<20;x++) wallTiles.push([x,0],[x,11]);
    for(let y=1;y<11;y++) wallTiles.push([0,y],[19,y]);
    wallTiles.forEach(([x,y])=>{
      g.fillStyle(0x080f0c,.4).fillRect(x*48+4,y*48+9,48,44);
      g.fillStyle(0x34473b).fillRoundedRect(x*48+1,y*48+1,46,43,3);
      g.fillStyle(0x425347).fillRect(x*48+3,y*48+2,42,4);
      g.fillStyle(0x293b30).fillRect(x*48+3,y*48+35,42,8);
      g.fillStyle(0x7d9275,.2).fillRect(x*48+8,y*48+12,3,3).fillRect(x*48+37,y*48+12,3,3);
    });
    // Conductos que conectan físicamente cada interruptor con su puerta.
    level.gates.forEach(gate=> gate.needs.forEach(id=>{
      const plate=level.plates.find(p=>p.id===id), x=plate.at[0]*48+24,y=plate.at[1]*48+24, gx=gate.at[0]*48+24,gy=gate.at[1]*48+48;
      g.lineStyle(3,0x9db582,.17).beginPath().moveTo(x,y).lineTo(x,gy).lineTo(gx,gy).strokePath();
      g.lineStyle(1,0xc1dab0,.15).beginPath().moveTo(x+5,y).lineTo(x+5,gy+5).lineTo(gx,gy+5).strokePath();
    }));
    for(const x of [2,6,14,17]){
      g.fillStyle(0xb3edcd,.05).fillEllipse(x*48+24,52,95,85);
      g.fillStyle(0xb3edcd,.65).fillRoundedRect(x*48+10,39,28,3,1);
    }
    scene.add.text(68, 19, 'E C O   /   ARCHIVO DE INSTANTES', {fontFamily:'Courier New',fontSize:'10px',color:'#a4b798'});
    scene.add.text(893, 19, String(scene.levelIndex+1).padStart(2,'0')+' / 05', {fontFamily:'Courier New',fontSize:'10px',color:'#a4b798'}).setOrigin(1,0);
    return wallTiles;
  }
};
