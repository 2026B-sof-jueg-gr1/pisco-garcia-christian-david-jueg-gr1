/* UMBRAL: infiltración, línea de visión y extracción. Phaser 3. */
(()=>{
 const $=id=>document.getElementById(id),R=HeistRules;let scene,action,muted=true,ac;
 const touch={left:false,right:false,up:false,down:false};
 function tone(f){if(muted)return;try{ac??=new AudioContext();ac.resume();const o=ac.createOscillator(),g=ac.createGain();o.connect(g);g.connect(ac.destination);o.frequency.value=f;g.gain.setValueAtTime(.06,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.15);o.start();o.stop(ac.currentTime+.15);}catch{}}
 function menu(title,copy,label,fn){$('menu').hidden=false;$('title').textContent=title;$('copy').textContent=copy;$('play').textContent=label;$('play').disabled=false;action=fn;$('play').focus();}
 class Heist extends Phaser.Scene{
  constructor(){super('heist');}
  create(){scene=this;EcoArt.textures(this);this.mode='menu';this.level=0;this.deaths=0;this.clock=0;this.art=this.add.graphics();this.fx=this.add.graphics().setDepth(4);this.labels=[];
   this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,SHIFT,P,ESC,R');
   this.input.keyboard.on('keydown',e=>{if(e.repeat||e.target instanceof HTMLButtonElement)return;if(e.code==='Space')this.dash();if(e.code==='KeyP'||e.code==='Escape')this.pause();if(e.code==='KeyR'&&this.mode==='play')this.startMission(this.level);});
   this.drawTitle();menu('UMBRAL','Entra. Roba el núcleo. Sal con vida.','JUGAR',()=>{this.deaths=0;this.startMission(0);});
  }
  drawTitle(){this.art.clear().fillStyle(0x09121b).fillRect(0,0,960,576);this.art.lineStyle(1,0x263c47,.6);for(let x=0;x<960;x+=48)this.art.lineBetween(x,0,x,576);for(let y=0;y<576;y+=48)this.art.lineBetween(0,y,960,y);
   this.art.fillStyle(0xe9b559,.07).fillTriangle(760,270,400,80,450,500);this.art.lineStyle(2,0xe9b559,.4).strokeCircle(760,270,90).strokeCircle(760,270,140);this.art.fillStyle(0xf2c572).fillPoints([{x:760,y:235},{x:785,y:270},{x:760,y:305},{x:735,y:270}],true);
  }
  startMission(n){this.level=n;this.m=R.missions[n];this.walls=R.walls(this.m);this.mode='play';this.t=0;this.alarm=0;this.carry=false;this.remaining=this.m.time;this.cool=0;this.burst=0;this.dir={x:1,y:0};this.player={x:120,y:288};Object.keys(touch).forEach(k=>touch[k]=false);
   this.actor?.destroy();this.core?.destroy();this.guards?.forEach(g=>g.sprite.destroy());this.labels.forEach(l=>l.destroy());this.labels=[];
   this.actor=this.add.image(120,288,'operator').setDepth(5).setScale(.85);this.core=this.add.image(this.m.core[0]*48+24,this.m.core[1]*48+24,'shard').setDepth(3);
   this.guards=this.m.guards.map(([x,y,tx,ty],i)=>({x:x*48+24,y:y*48+24,from:{x:x*48+24,y:y*48+24},to:{x:tx*48+24,y:ty*48+24},angle:0,sprite:this.add.image(x*48+24,y*48+24,'drone').setDepth(3),phase:i*.9}));
   this.art.clear().fillStyle(0x09121b).fillRect(0,0,960,576);for(let y=1;y<11;y++)for(let x=1;x<19;x++){this.art.fillStyle((x+y)%2?0x12222c:0x14252e).fillRect(x*48+1,y*48+1,46,46);if((x+y*7)%13===0)this.art.fillStyle(0x314b52).fillRect(x*48+10,y*48+10,3,3);}
   this.walls.forEach(w=>{this.art.fillStyle(0x040a10,.5).fillRect(w.x+6,w.y+8,w.w,w.h);this.art.fillStyle(0x34464f).fillRoundedRect(w.x,w.y,w.w,w.h,3);this.art.fillStyle(0x596b70).fillRect(w.x+2,w.y+2,w.w-4,4);for(let y=w.y+16;y<w.y+w.h;y+=24)this.art.lineStyle(1,0x71817d,.2).lineBetween(w.x+8,y,w.x+w.w-8,y);});
   this.art.lineStyle(3,0x334a54).strokeRect(48,48,864,480);this.art.lineStyle(2,0x70d9bd).strokeRoundedRect(93,260,54,56,8);
   this.labels.push(this.add.text(120,329,'SALIDA',{fontFamily:'monospace',fontSize:'10px',color:'#70d9bd'}).setOrigin(.5));
   $('menu').hidden=true;$('hud').hidden=false;$('controls').hidden=false;$('room').textContent=String(n+1).padStart(2,'0')+' / '+this.m.name;$('objective').textContent='◆ ROBA EL NÚCLEO';$('game').focus();this.hud();
  }
  dash(){if(this.mode!=='play'||this.cool>0)return;this.burst=.16;this.cool=2.3;tone(480);}
  pause(){if(this.mode==='pause'){this.mode='play';$('menu').hidden=true;$('game').focus();return;}if(this.mode!=='play')return;this.mode='pause';menu('PAUSA','WASD mover · ESPACIO impulso · SHIFT caminar','CONTINUAR',()=>this.pause());}
  fail(reason){if(this.mode!=='play')return;this.mode='lost';this.deaths++;tone(110);menu('DETECTADO',reason,'REINTENTAR',()=>this.startMission(this.level));}
  hud(){$('alarm').style.width=(this.alarm*100)+'%';$('charge').style.width=(100-this.cool/2.3*100)+'%';$('timer').textContent=this.carry?Math.ceil(this.remaining)+'s':'—';$('dash').disabled=this.cool>0;}
  win(){this.mode='win';tone(900);if(this.level===4)menu('GOLPE PERFECTO','5 sectores recuperados · '+this.deaths+' reintentos','VOLVER AL INICIO',()=>{this.mode='menu';this.actor.destroy();this.core.destroy();this.guards.forEach(g=>g.sprite.destroy());this.labels.forEach(l=>l.destroy());this.fx.clear();this.drawTitle();$('hud').hidden=true;$('controls').hidden=true;menu('UMBRAL','Entra. Roba el núcleo. Sal con vida.','JUGAR',()=>{this.deaths=0;this.startMission(0);});});else menu('SECTOR LIMPIO','La vigilancia aumenta.','SIGUIENTE',()=>this.startMission(this.level+1));}
  update(_,delta){if(this.mode!=='play')return;const dt=Math.min(delta/1000,.04);this.t+=dt;this.cool=Math.max(0,this.cool-dt);this.burst=Math.max(0,this.burst-dt);
   const k=this.keys,dx=+(k.D.isDown||k.RIGHT.isDown||touch.right)-+(k.A.isDown||k.LEFT.isDown||touch.left),dy=+(k.S.isDown||k.DOWN.isDown||touch.down)-+(k.W.isDown||k.UP.isDown||touch.up),len=Math.hypot(dx,dy);if(len)this.dir={x:dx/len,y:dy/len};
   const slow=k.SHIFT.isDown,speed=this.burst>0?480:slow?90:172;const vx=this.burst>0?this.dir.x:len?dx/len:0,vy=this.burst>0?this.dir.y:len?dy/len:0;
   // Subpasos impiden atravesar muros durante el impulso.
   const steps=Math.max(1,Math.ceil(speed*dt/5));for(let i=0;i<steps;i++){const x=this.player.x+vx*speed*dt/steps,y=this.player.y+vy*speed*dt/steps;if(!R.blocked(x,this.player.y,this.walls,11))this.player.x=x;if(!R.blocked(this.player.x,y,this.walls,11))this.player.y=y;}
   this.actor.setPosition(this.player.x,this.player.y);if(dx)this.actor.setFlipX(dx<0);this.fx.clear();let seen=false;
   this.guards.forEach((g,i)=>{const distance=Math.hypot(g.to.x-g.from.x,g.to.y-g.from.y);g.travel=(g.travel??g.phase*distance)+dt*(this.carry?110:76+this.level*5);const phase=(g.travel/distance)%2,u=phase<1?phase:2-phase;
    g.x=g.from.x+(g.to.x-g.from.x)*u;g.y=g.from.y+(g.to.y-g.from.y)*u;g.angle=Math.atan2(g.to.y-g.from.y,g.to.x-g.from.x)+(phase<1?0:Math.PI);g.sprite.setPosition(g.x,g.y).setRotation(g.angle);
    const range=this.carry?220:185;const points=[{x:g.x,y:g.y}];for(let a=g.angle-.52;a<=g.angle+.53;a+=.065){let r=0;while(r<range&&!R.blocked(g.x+Math.cos(a)*r,g.y+Math.sin(a)*r,this.walls))r+=6;points.push({x:g.x+Math.cos(a)*r,y:g.y+Math.sin(a)*r});}this.fx.fillStyle(0xf1b459,.13).fillPoints(points,true);this.fx.lineStyle(1,0xf1b459,.15).strokePoints(points,true);
    if(R.sees(g,this.player,this.walls,range))seen=true;if(Math.hypot(g.x-this.player.x,g.y-this.player.y)<24)this.fail('Te interceptó un guardia.');
   });
   this.alarm=Math.max(0,Math.min(1,this.alarm+dt*(seen?(slow?1.05:1.7):-1.1)));if(this.alarm>=1)this.fail('Permaneciste demasiado tiempo en un cono de visión.');
   this.m.lasers.forEach(([x,y,length,vertical,offset])=>{const phase=(this.t+offset)%3.8,on=phase<2.05,warning=phase>3.15,ax=x*48,ay=y*48+24,bx=ax+(vertical?0:length*48),by=ay+(vertical?length*48:0);
    this.fx.lineStyle(on?4:1,on?0xfa6862:0xf2be64,on?.85:warning?.7:.15).lineBetween(ax,ay,bx,by);this.fx.fillStyle(0xf2be64).fillCircle(ax,ay,4).fillCircle(bx,by,4);
    if(on&&this.player.x>ax-9&&this.player.x<bx+9&&Math.abs(this.player.y-ay)<12)this.fail('El láser estaba activo. Espera a que se apague.');
   });
   if(this.mode!=='play')return;
   if(this.burst>0)this.fx.lineStyle(3,0x70d9bd,.6).lineBetween(this.player.x,this.player.y,this.player.x-this.dir.x*35,this.player.y-this.dir.y*35);
   if(!this.carry&&Math.hypot(this.player.x-this.core.x,this.player.y-this.core.y)<28){this.carry=true;this.core.setVisible(false);$('objective').textContent='↙ REGRESA A LA SALIDA';tone(700);}
   if(this.carry){this.remaining-=dt;this.fx.lineStyle(2,0x70d9bd,.5+Math.sin(this.t*5)*.3).strokeCircle(120,288,34);if(this.remaining<=0)this.fail('Se cerró la extracción.');if(this.mode==='play'&&Math.hypot(this.player.x-120,this.player.y-288)<28)this.win();}
   this.hud();
  }
 }
 $('play').onclick=()=>action?.();$('pause').onclick=()=>scene?.pause();$('dash').onclick=()=>{scene?.dash();$('game').focus();};$('sound').onclick=()=>{muted=!muted;$('sound').textContent=muted?'♪ OFF':'♪ ON';tone(440);};
 document.querySelectorAll('[data-dir]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();touch[b.dataset.dir]=true;b.setPointerCapture(e.pointerId);};for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>touch[b.dataset.dir]=false);});
 window.addEventListener('blur',()=>{Object.keys(touch).forEach(k=>touch[k]=false);if(scene?.mode==='play')scene.pause();});
 new Phaser.Game({type:Phaser.AUTO,parent:'game',width:960,height:576,backgroundColor:'#09121b',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[Heist],audio:{noAudio:true},banner:false});
})();

