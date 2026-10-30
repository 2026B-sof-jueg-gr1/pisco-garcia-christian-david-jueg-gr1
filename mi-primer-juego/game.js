/* ECO — Phaser 3. La lógica de salas está en src/levels.js y el arte en src/visuals.js. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const TILE = 48, SPEED = 165, MAX_RECORD = 8;
  const center = ([x,y]) => ({x:x*TILE+24,y:y*TILE+24});
  const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
  const formatTime = t => `${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;
  const touch = {left:false,right:false,up:false,down:false};
  let activeScene, muted = true, audioContext, toastTimer, primaryAction, secondaryAction;
  let run = { time:0, hits:0, recordings:0, startLevel:0 };
  const storage = {
    get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key,JSON.stringify(value)); } catch { /* El modo privado no impide jugar. */ } }
  };
  const sound = (frequency=440,duration=.09) => {
    if(muted) return;
    try {
      audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
      if(audioContext.state==='suspended') audioContext.resume();
      const oscillator=audioContext.createOscillator(), gain=audioContext.createGain();
      oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(frequency*.65,audioContext.currentTime+duration);
      gain.gain.setValueAtTime(.08,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);
      oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+duration);
    } catch { /* Audio opcional. */ }
  };
  function toast(message) { clearTimeout(toastTimer);$('toast').textContent=message;$('toast').classList.add('visible');toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),4200); }
  function modal({kicker,title,copy,primary,action,secondary,second,note='',intro=false}) {
    $('modal-kicker').textContent=kicker;$('modal-title').innerHTML=title;$('modal-copy').textContent=copy;
    $('primary').textContent=primary;$('primary').disabled=false;primaryAction=action;
    $('secondary').hidden=!secondary;$('secondary').textContent=secondary||'';secondaryAction=second;
    $('modal-note').textContent=note;$('overlay').classList.toggle('compact',!intro);$('overlay').hidden=false;
    $('primary').focus({preventScroll:true});
  }
  function hideModal() { $('overlay').hidden=true;$('game').focus({preventScroll:true}); }
  function setControls(enabled) { for(const id of ['pause','record','undo']) $(id).disabled=!enabled; }
  function resetTouch() { Object.keys(touch).forEach(key=>touch[key]=false); }

  class Archive extends Phaser.Scene {
    constructor(){super('Archive');}
    init(data){this.levelIndex=data.levelIndex||0;this.autoStart=!!data.autoStart;}
    preload(){EcoArt.textures(this);}
    create(){
      activeScene=this;this.level=ECO_LEVELS[this.levelIndex];this.mode='intro';this.elapsed=0;this.roomTime=0;this.health=3;
      this.collected=0;this.echoes=[];this.recording=null;this.invulnerable=0;this.exitHint=0;resetTouch();
      const walls=EcoArt.room(this,this.level);
      this.walls=this.physics.add.staticGroup();
      walls.forEach(([x,y])=>this.walls.create(x*TILE+24,y*TILE+24,'solid').setVisible(false));
      this.plates=this.level.plates.map(data=>{
        const p=center(data.at),graphic=this.add.graphics().setDepth(2);
        const label=this.add.text(p.x,p.y+29,data.id,{fontFamily:'Courier New',fontSize:'11px',color:'#b3edcd'}).setOrigin(.5).setDepth(3);
        return {...data,...p,graphic,label,active:false};
      });
      this.gates=this.level.gates.map(data=>{
        const p={x:(data.at[0]+data.size[0]/2)*TILE,y:(data.at[1]+data.size[1]/2)*TILE};
        const body=this.physics.add.staticImage(p.x,p.y,'solid').setDisplaySize(data.size[0]*TILE,data.size[1]*TILE).setVisible(false).refreshBody();
        const graphic=this.add.graphics().setDepth(4);
        return {...data,...p,body,graphic,open:false};
      });
      const ep=center(this.level.exit);this.exit={...ep,graphic:this.add.graphics().setDepth(2)};
      this.add.text(ep.x,ep.y+39,'SORTIE / SALIDA',{fontFamily:'Courier New',fontSize:'8px',color:'#b3c7ae'}).setOrigin(.5).setDepth(2);
      this.shards=this.level.shards.map(at=>{const p=center(at);return this.add.image(p.x,p.y,'shard').setDepth(3).setData('baseY',p.y);});
      this.drones=this.level.drones.map(data=>{
        const from=center(data.from),to=center(data.to),track=this.add.graphics().setDepth(1);
        track.lineStyle(1,0xf2ac87,.2).lineBetween(from.x,from.y,to.x,to.y);
        return {...data,from,to,sprite:this.add.image(from.x,from.y,'drone').setDepth(5),length:distance(from,to)};
      });
      this.trail=this.add.graphics().setDepth(2);
      const sp=center(this.level.spawn);this.player=this.physics.add.sprite(sp.x,sp.y,'operator').setDepth(6);
      this.player.body.setSize(22,22).setOffset(9,12);this.player.setCollideWorldBounds(true);
      this.physics.add.collider(this.player,this.walls);
      this.gates.forEach(g=>this.physics.add.collider(this.player,g.body));
      this.cameras.main.setBounds(0,0,960,576);this.physics.world.setBounds(48,48,864,480);
      this.cursors=this.input.keyboard.createCursorKeys();this.keys=this.input.keyboard.addKeys('W,A,S,D,SPACE,Q,R,P,ESC,M,ENTER');
      const onKey = e => {
        if(e.repeat || e.target instanceof HTMLButtonElement) return;
        if(e.code==='KeyM') toggleSound();
        if(e.code==='KeyP'||e.code==='Escape') this.togglePause();
        if(this.mode==='playing'){
          if(e.code==='Space') this.toggleRecord();
          if(e.code==='KeyQ') this.undo();
          if(e.code==='KeyR') this.restartRoom();
        }else if(e.code==='Enter' && primaryAction) primaryAction();
      };
      this.input.keyboard.on('keydown',onKey);
      this.events.once('shutdown',()=>{this.input.keyboard.off('keydown',onKey);resetTouch();});
      this.physics.pause();this.updateHUD();this.drawDevices();
      if(this.autoStart) this.start(); else this.showIntro();
    }
    showIntro(){
      const saved=storage.get('eco-progress-v2',0);
      modal({kicker:'ARCHIVO DE INSTANTES',title:'ECO<span>.</span>',copy:'Traza un recorrido. Libera tu eco. Corre antes de que las puertas pierdan la carga.',primary:'Entrar al archivo ↗',action:()=>{run={time:0,hits:0,recordings:0,startLevel:0};storage.set('eco-progress-v2',0);this.start();},secondary:Number.isInteger(saved)&&saved>0&&saved<5?`Continuar en sala ${saved+1}`:undefined,second:()=>{run={time:0,hits:0,recordings:0,startLevel:saved};this.scene.restart({levelIndex:saved,autoStart:true});},note:'WASD · Mover     ESPACIO · Grabar     P · Pausa',intro:true});
    }
    start(){this.mode='playing';hideModal();this.physics.resume();setControls(true);$('pause').textContent='Ⅱ';$('pause').setAttribute('aria-label','Pausar');toast('ESPACIO: graba una ruta que cruce los sensores. Vuelve a pulsar para soltar el eco.');}
    restartRoom(){sound(240);this.scene.restart({levelIndex:this.levelIndex,autoStart:true});}
    togglePause(){
      if(this.mode==='paused'){this.start();return;}
      if(this.mode!=='playing')return;
      this.mode='paused';this.player.setVelocity(0);this.physics.pause();resetTouch();setControls(false);$('pause').disabled=false;$('pause').textContent='▷';$('pause').setAttribute('aria-label','Continuar');
      modal({kicker:`SALA ${this.levelIndex+1} / PAUSA`,title:'Un momento<br>para pensar<span>.</span>',copy:this.level.hint,primary:'Continuar ↗',action:()=>this.start(),secondary:'Necesito una pista',second:()=>{$('modal-copy').textContent=this.level.solution;$('secondary').textContent='Reiniciar esta sala';secondaryAction=()=>this.restartRoom();},note:'Tus ecos y el tiempo también están en pausa.'});
    }
    toggleRecord(){
      if(this.mode!=='playing')return;
      if(this.recording){this.finishRecord();return;}
      if(this.echoes.length>=this.level.limit){toast(`Tienes ${this.level.limit} ${this.level.limit===1?'eco disponible':'ecos disponibles'} en esta sala. Pulsa Q para borrar el último.`);sound(170);return;}
      this.recording={time:0,samples:[{t:0,x:this.player.x,y:this.player.y}]};run.recordings++;sound(520);toast('Cruza un sensor mientras te mueves. ESPACIO libera el eco.');this.updateHUD();
    }
    finishRecord(){
      const r=this.recording;if(!r)return;
      r.samples.push({t:r.time,x:this.player.x,y:this.player.y});
      const length=r.samples.reduce((sum,p,i)=>sum+(i?distance(p,r.samples[i-1]):0),0);
      if(r.time<1.2||length<120){
        if(r.time>=MAX_RECORD)this.recording=null;
        toast('El eco necesita un recorrido: muévete al menos tres casillas.');this.updateHUD();return;
      }
      const first=r.samples[0],sprite=this.add.image(first.x,first.y,'echo').setDepth(5);
      const label=this.add.text(first.x,first.y-28,`ECO ${this.echoes.length+1}`,{fontFamily:'Courier New',fontSize:'8px',color:'#b3edcd'}).setOrigin(.5).setDepth(5);
      this.echoes.push({...r,sprite,label,playhead:0,index:0});this.recording=null;sound(750);toast('Eco creado. Recorre tu ruta de ida y vuelta. Cruza cuando se cargue la puerta.');this.updateHUD();
    }
    undo(){
      if(this.mode!=='playing')return;
      if(this.recording){this.recording=null;toast('Grabación cancelada.');}
      else{const echo=this.echoes.pop();if(echo){echo.sprite.destroy();echo.label.destroy();toast('Último eco borrado.');}else toast('Todavía no hay ecos para borrar.');}
      sound(260);this.updateHUD();
    }
    updateHUD(){
      $('room-number').textContent=String(this.levelIndex+1).padStart(2,'0');$('room-name').textContent=this.level.name;
      $('fragments').textContent=`${this.collected} / ${this.shards.length}`;$('health').textContent='● '.repeat(this.health)+'○ '.repeat(3-this.health);$('health').setAttribute('aria-label',`${this.health} de 3`);
      $('timer').textContent=formatTime(this.roomTime);$('record-label').textContent=this.recording?'Terminar eco':'Grabar eco';
      document.querySelector('.record-bar').classList.toggle('recording',!!this.recording);
      $('record-time').textContent=`${(this.recording?.time||0).toFixed(1)} / 8 s`;$('tape-fill').style.width=`${(this.recording?.time||0)/MAX_RECORD*100}%`;
      [...$('echo-slots').querySelectorAll('i')].forEach((slot,i)=>{slot.classList.toggle('active',i<this.echoes.length);slot.style.display=i<this.level.limit?'':'none';});
      document.querySelectorAll('.progress b').forEach((el,i)=>{el.classList.toggle('current',i===this.levelIndex);el.classList.toggle('done',i<this.levelIndex);});
    }
    drawDevices(){
      this.plates.forEach(p=>{
        const g=p.graphic;g.clear();g.fillStyle(p.active?0x6eac83:0x253f32).fillRoundedRect(p.x-20,p.y-16,40,32,7);
        g.lineStyle(2,p.active?0xd4f3b9:0x839c71).strokeRoundedRect(p.x-20,p.y-16,40,32,7);
        g.lineStyle(1,0xc9e6ae,p.active?1:.45).strokeCircle(p.x,p.y,10);g.fillStyle(0xd4f3b9,p.active?.9:.25).fillCircle(p.x,p.y,4);
        if(p.charge)g.fillStyle(0xb3edcd).fillRect(p.x-20,p.y+20,40*p.charge/4.5,3);
      });
      this.gates.forEach(gate=>{
        const g=gate.graphic,x=gate.at[0]*48,y=gate.at[1]*48,w=gate.size[0]*48,h=gate.size[1]*48;
        g.clear();g.fillStyle(gate.open?0x9bcc9e:0xf2ac87,gate.open?.06:.12).fillRect(x+4,y,w-8,h);
        g.lineStyle(3,gate.open?0xb3edcd:0xf2ac87,gate.open?.3:.9);
        for(let i=9;i<w;i+=10)g.lineBetween(x+i,y+4,x+i,y+h-4);
        if(gate.open){g.clear();g.lineStyle(2,0xb3edcd,.7).lineBetween(x+5,y+3,x+w-5,y+3).lineBetween(x+5,y+h-3,x+w-5,y+h-3);}
        g.fillStyle(gate.open?0xb3edcd:0xf2ac87).fillRect(x,y,5,8).fillRect(x+w-5,y+h-8,5,8);
      });
      const e=this.exit,g=e.graphic,ready=this.collected===this.shards.length;g.clear();
      g.fillStyle(0xb3edcd,ready?.15:.025).fillCircle(e.x,e.y,38);
      g.lineStyle(2,ready?0xb3edcd:0x687d69).strokeRoundedRect(e.x-23,e.y-27,46,54,7);
      g.lineStyle(1,0xb3edcd,ready?.6:.2).strokeRoundedRect(e.x-16,e.y-20,32,40,4);
      g.lineStyle(2,ready?0xe3f6c9:0x687d69).beginPath().moveTo(e.x-8,e.y).lineTo(e.x+8,e.y).moveTo(e.x+2,e.y-6).lineTo(e.x+8,e.y).lineTo(e.x+2,e.y+6).strokePath();
    }
    damage(){
      if(this.invulnerable>0||this.mode!=='playing')return;
      this.health--;run.hits++;this.invulnerable=2;this.recording=null;this.player.setVelocity(0);
      const sp=center(this.level.spawn);this.player.body.reset(sp.x,sp.y);sound(110,.25);
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches)this.cameras.main.shake(150,.004);
      this.updateHUD();
      if(this.health<=0){
        this.mode='lost';this.physics.pause();setControls(false);
        modal({kicker:'SEÑAL INTERRUMPIDA',title:'Aún queda<br>otro intento<span>.</span>',copy:'Los drones siguen rutas fijas. Observa su recorrido y cruza detrás de ellos. Tus ecos no reciben daño.',primary:'Reintentar sala ↗',action:()=>this.restartRoom(),secondary:'Ver una pista',second:()=>{$('modal-copy').textContent=this.level.solution;},note:'Reinicias solo esta sala, no todo el archivo.'});
      }else toast('Interferencia. Vuelves al inicio; tus ecos y fragmentos se conservan.');
    }
    complete(){
      this.mode='won';this.player.setVelocity(0);this.physics.pause();setControls(false);sound(880,.3);
      storage.set('eco-progress-v2',Math.min(4,this.levelIndex+1));
      const final=this.levelIndex===ECO_LEVELS.length-1;
      const rating=run.hits===0?'Memoria impecable':run.hits<5?'Señal estable':'Persistencia temporal';
      if(final){const best=storage.get('eco-best',null);if(run.startLevel===0&&(best===null||run.time<best))storage.set('eco-best',Math.round(run.time));storage.set('eco-progress-v2',0);}
      const best=storage.get('eco-best',null);
      modal({kicker:final?'ARCHIVO RESTAURADO':`SALA ${this.levelIndex+1} / RECUPERADA`,title:final?'Nunca estuviste<br>solo<span>.</span>':'Un recuerdo<br>más cerca<span>.</span>',copy:final?`Llegaste al final del archivo. Tiempo de esta sesión: ${formatTime(run.time)}. Ecos creados: ${run.recordings}. Interferencias: ${run.hits}.`:`${this.level.name} completada en ${formatTime(this.roomTime)}. La siguiente sala: ${ECO_LEVELS[this.levelIndex+1].name}.`,primary:final?'Volver a jugar ↗':'Siguiente sala ↗',action:()=>{if(final)run={time:0,hits:0,recordings:0,startLevel:0};this.scene.restart({levelIndex:final?0:this.levelIndex+1,autoStart:true});},note:final?`${rating}${best!==null?' · Mejor partida completa: '+formatTime(best):' · Juega desde el inicio para registrar un récord.'}`:'Tus dos versiones están aprendiendo a colaborar.'});
    }
    update(_,delta){
      if(this.mode!=='playing')return;
      const dt=Math.min(delta/1000,.05);this.elapsed+=dt;this.roomTime+=dt;run.time+=dt;this.invulnerable=Math.max(0,this.invulnerable-dt);
      const dx=Number(this.cursors.right.isDown||this.keys.D.isDown||touch.right)-Number(this.cursors.left.isDown||this.keys.A.isDown||touch.left);
      const dy=Number(this.cursors.down.isDown||this.keys.S.isDown||touch.down)-Number(this.cursors.up.isDown||this.keys.W.isDown||touch.up);
      const norm=Math.hypot(dx,dy)||1;this.player.setVelocity(dx/norm*SPEED,dy/norm*SPEED);if(dx)this.player.setFlipX(dx<0);
      this.player.setAlpha(this.invulnerable>0?(.4+.6*Math.abs(Math.sin(this.elapsed*15))):1);
      if(this.recording){
        this.recording.time+=dt;this.recording.samples.push({t:this.recording.time,x:this.player.x,y:this.player.y});
        if(this.recording.time>=MAX_RECORD)this.finishRecord();
      }
      this.trail.clear();
      this.echoes.forEach(e=>{
        e.clock=(e.clock||0)+dt;
        const phase=e.clock%(e.time*2);
        e.playhead=phase<=e.time?phase:e.time*2-phase;
        e.index=0;
        const previous={x:e.sprite.x,y:e.sprite.y};
        while(e.index<e.samples.length-2&&e.samples[e.index+1].t<=e.playhead)e.index++;
        const a=e.samples[e.index],b=e.samples[Math.min(e.index+1,e.samples.length-1)],t=b.t>a.t?Phaser.Math.Clamp((e.playhead-a.t)/(b.t-a.t),0,1):1;
        e.sprite.setPosition(Phaser.Math.Linear(a.x,b.x,t),Phaser.Math.Linear(a.y,b.y,t));e.label.setPosition(e.sprite.x,e.sprite.y-28);e.moving=distance(previous,e.sprite)>dt*35;
        this.trail.lineStyle(1,0xb3edcd,.18).beginPath().moveTo(e.samples[0].x,e.samples[0].y);
        e.samples.forEach((p,i)=>{if(i%6===0||i===e.samples.length-1)this.trail.lineTo(p.x,p.y);});this.trail.strokePath();
      });
      if(this.recording){this.trail.lineStyle(2,0xf2ac87,.5).beginPath();this.recording.samples.forEach((p,i)=>i===0?this.trail.moveTo(p.x,p.y):this.trail.lineTo(p.x,p.y));this.trail.strokePath();}
      this.plates.forEach(p=>{
        const triggered=this.echoes.some(e=>e.moving&&distance(p,e.sprite)<27);
        p.charge=triggered?4.5:Math.max(0,(p.charge||0)-dt);
        p.active=p.charge>0;
        p.label.setText(p.id+(p.active?' '+p.charge.toFixed(1)+'s':''));
      });
      this.gates.forEach(g=>{
        let open=g.needs.every(id=>this.plates.find(p=>p.id===id).active);
        // No cerrar una puerta sobre el jugador: permite terminar el cruce.
        if(!open&&g.open&&Math.abs(this.player.x-g.x)<g.size[0]*24+14&&Math.abs(this.player.y-g.y)<g.size[1]*24+14)open=true;
        if(open!==g.open){g.open=open;g.body.body.enable=!open;if(open)sound(360);}
      });
      this.shards.forEach((s,i)=>{
        if(!s.active)return;s.y=s.getData('baseY')+Math.sin(this.elapsed*2.5+i)*3;
        if(distance(s,this.player)<27){s.setActive(false).setVisible(false);this.collected++;sound(640+this.collected*100);toast(this.collected===this.shards.length?'Todos los fragmentos recuperados. Busca la salida.':`Fragmento ${this.collected} de ${this.shards.length}`);}
      });
      this.drones.forEach(d=>{
        const phase=(this.elapsed*d.speed/d.length)%2,t=phase<=1?phase:2-phase;
        d.sprite.setPosition(Phaser.Math.Linear(d.from.x,d.to.x,t),Phaser.Math.Linear(d.from.y,d.to.y,t));d.sprite.rotation=Math.sin(this.elapsed*2)*.15;
        if(distance(d.sprite,this.player)<29)this.damage();
      });
      if(this.mode!=='playing')return;
      if(distance(this.exit,this.player)<27){
        if(this.collected===this.shards.length)this.complete();
        else if(this.elapsed>this.exitHint){toast('La salida necesita todos los fragmentos de esta sala.');this.exitHint=this.elapsed+5;}
      }
      this.drawDevices();this.updateHUD();
    }
  }
  $('primary').addEventListener('click',()=>primaryAction?.());$('secondary').addEventListener('click',()=>secondaryAction?.());
  $('record').addEventListener('click',()=>{activeScene?.toggleRecord();$('game').focus({preventScroll:true});});
  $('undo').addEventListener('click',()=>{activeScene?.undo();$('game').focus({preventScroll:true});});
  $('pause').addEventListener('click',()=>activeScene?.togglePause());$('touch-restart').addEventListener('click',()=>{if(activeScene?.mode==='playing')activeScene.restartRoom();});
  function toggleSound(){muted=!muted;$('sound').setAttribute('aria-pressed',String(!muted));$('sound').setAttribute('aria-label',muted?'Activar sonido':'Silenciar');$('sound').textContent=muted?'♪':'♫';sound(440);}
  $('sound').addEventListener('click',toggleSound);
  $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.console').requestFullscreen();}catch{toast('Tu navegador no permite pantalla completa.');}});
  document.querySelectorAll('[data-dir]').forEach(button=>{
    button.addEventListener('pointerdown',event=>{event.preventDefault();touch[button.dataset.dir]=true;button.setPointerCapture(event.pointerId);});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,()=>touch[button.dataset.dir]=false);
  });
  const autoPause=()=>{resetTouch();if(activeScene?.mode==='playing')activeScene.togglePause();};
  window.addEventListener('blur',autoPause);document.addEventListener('visibilitychange',()=>{if(document.hidden)autoPause();});
  new Phaser.Game({type:Phaser.AUTO,parent:'game',width:960,height:576,backgroundColor:'#101c19',antialias:true,
    scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'arcade',arcade:{debug:false}},
    input:{activePointers:3},scene:[Archive],audio:{noAudio:true},banner:false});
})();
