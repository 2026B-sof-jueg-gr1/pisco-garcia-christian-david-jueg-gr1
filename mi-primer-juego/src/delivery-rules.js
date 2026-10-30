(function(root){
 const roadsX=[160,480,800,1120],roadsY=[160,480,800];
 const blocks=[];for(let y=0;y<2;y++)for(let x=0;x<3;x++)blocks.push({x:roadsX[x]+78,y:roadsY[y]+78,w:164,h:164});
 const stops=[{x:420,y:160,name:'PANADERÍA LUZ',color:0xe4ad50},{x:800,y:420,name:'FARMACIA SOL',color:0x589c86},{x:1120,y:740,name:'CASA DE ROSA',color:0xda785e},{x:540,y:800,name:'TALLER PINO',color:0x6595ae},{x:160,y:540,name:'CAFÉ CENTRAL',color:0xc78762},{x:1060,y:160,name:'LIBRERÍA SUR',color:0x8e8baf},{x:740,y:480,name:'FLORERÍA ANA',color:0x899c60}];
 const R={roadsX,roadsY,blocks,stops,depot:{x:160,y:800},
  contract(n){return {count:n,time:n===3?100:n===5?120:140,maxSpeed:255-n*13,turn:2.65-n*.12};},
  step(v,input,dt,load){const top=255-load*13;let speed=v.speed;if(input.gas)speed+=130*dt;else speed*=Math.exp(-.55*dt);if(input.brake)speed=(Math.sign(speed)*Math.max(0,Math.abs(speed)-210*dt))||0;if(input.reverse&&!input.brake)speed-=(speed>0?210:100)*dt;speed=Math.max(-65,Math.min(top,speed));if(!input.gas&&!input.brake&&!input.reverse&&Math.abs(speed)<2)speed=0;const steer=(input.right?1:0)-(input.left?1:0);const angle=v.angle+steer*(2.65-load*.12)*Math.min(1,Math.abs(speed)/65)*Math.sign(speed)*dt;return {...v,speed,angle,x:v.x+Math.cos(angle)*speed*dt,y:v.y+Math.sin(angle)*speed*dt};},
  collision(p,r=15){if(p.x<45+r||p.x>1235-r||p.y<45+r||p.y>915-r)return true;return blocks.some(b=>Math.hypot(p.x-Math.max(b.x,Math.min(b.x+b.w,p.x)),p.y-Math.max(b.y,Math.min(b.y+b.h,p.y)))<r);},
  canDeliver(v,target){return Math.hypot(v.x-target.x,v.y-target.y)<52&&Math.abs(v.speed)<32;},
  score(time,health,count){return Math.max(0,Math.round(count*300+time*6+health*10));}
 };root.DeliveryRules=R;if(typeof module!=='undefined')module.exports=R;
})(globalThis);


