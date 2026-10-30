// Pruebas de la lógica real de la escena con dobles mínimos de render/audio.
// La física y el render se verifican además en el navegador.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const levels=require('../mi-primer-juego/src/levels.js');
function setup(index=0){
  const elements=new Map(),saved=new Map();let Scene;
  const element=()=>({textContent:'',style:{},classList:{toggle(){},add(){},remove(){}},setAttribute(){},focus(){},addEventListener(){},querySelectorAll(){return [];}});
  const document={getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);},querySelector:()=>element(),querySelectorAll:()=>[],addEventListener(){}};
  const sandbox={window:{addEventListener(){}},document,HTMLButtonElement:class{},Phaser:{Scene:class{},Game:class{constructor(c){Scene=c.scene[0];}},AUTO:0,Scale:{FIT:0,CENTER_BOTH:0},Math:{Clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),Linear:(a,b,t)=>a+(b-a)*t}},ECO_LEVELS:levels,localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},setTimeout:()=>0,clearTimeout(){},matchMedia:()=>({matches:true})};
  vm.runInNewContext(fs.readFileSync('mi-primer-juego/game.js','utf8'),sandbox);
  const sprite=(x=0,y=0)=>({x,y,active:true,setDepth(){return this;},setOrigin(){return this;},setPosition(x,y){this.x=x;this.y=y;return this;},destroy(){this.destroyed=true;},setVelocity(x,y){this.vx=x;this.vy=y;return this;},setFlipX(){},setAlpha(){}});
  const graphic=new Proxy({}, {get:()=>()=>graphic});
  const scene=new Scene();scene.init({levelIndex:index});
  Object.assign(scene,{mode:'playing',level:levels[index],echoes:[],recording:null,player:sprite(120,120),add:{image:sprite,text:sprite},elapsed:0,roomTime:0,health:3,collected:0,shards:[],plates:[],gates:[],drones:[],invulnerable:0,exit:{x:9999,y:9999},trail:graphic,physics:{pause(){},resume(){}},scene:{restart(data){scene.restarted=data;}},cursors:Object.fromEntries(['left','right','up','down'].map(k=>[k,{isDown:false}])),keys:Object.fromEntries(['W','A','S','D'].map(k=>[k,{isDown:false}]))});
  scene.player.body={reset(x,y){scene.player.setPosition(x,y);}};scene.drawDevices=()=>{};
  return {scene,elements,saved};
}

function route(s){s.toggleRecord();for(let i=0;i<40;i++){s.player.x+=4;s.update(0,50);}s.finishRecord();}
test('Stationary double press cannot create an echo',()=>{const {scene:s}=setup();s.toggleRecord();s.finishRecord();assert.equal(s.echoes.length,0);for(let i=0;i<165;i++)s.update(0,50);assert.equal(s.recording,null);assert.equal(s.echoes.length,0);});
test('Echo reverses its route',()=>{const {scene:s}=setup();route(s);assert.equal(s.echoes.length,1);for(let i=0;i<40;i++)s.update(0,50);const end=s.echoes[0].sprite.x;for(let i=0;i<20;i++)s.update(0,50);assert.ok(s.echoes[0].sprite.x<end-50);});
test('Moving echoes charge sensors; player cannot; charge expires',()=>{const {scene:s}=setup();route(s);const p={id:'A',x:200,y:120,label:{setText(){}}};s.plates=[p];s.player.x=200;s.update(0,50);assert.equal(p.active,false);for(let i=0;i<20;i++)s.update(0,50);assert.equal(p.active,true);s.undo();for(let i=0;i<95;i++)s.update(0,50);assert.equal(p.active,false);});
test('Pause freezes recording',()=>{const {scene:s}=setup();s.toggleRecord();s.update(0,50);s.togglePause();const time=s.roomTime;s.update(0,50);assert.equal(s.roomTime,time);s.togglePause();assert.equal(s.mode,'playing');});
test('Damage retains echoes and loss retries same room',()=>{const {scene:s}=setup(2);route(s);s.damage();assert.equal(s.health,2);assert.equal(s.echoes.length,1);s.damage();assert.equal(s.health,2);s.invulnerable=0;s.damage();s.invulnerable=0;s.damage();assert.equal(s.mode,'lost');s.restartRoom();assert.equal(s.restarted.levelIndex,2);});
test('Final victory saves new campaign progress',()=>{const {scene:s,saved}=setup(4);s.complete();assert.equal(s.mode,'won');assert.equal(saved.get('eco-progress-v2'),'0');});
