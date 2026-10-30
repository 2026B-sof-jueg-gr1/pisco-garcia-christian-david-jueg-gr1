const test = require('node:test');
const assert = require('node:assert/strict');
const levels = require('../mi-primer-juego/src/levels.js');
const key = ([x,y]) => `${x},${y}`;
function reachable(level, active) {
  const blocked = new Set(level.walls.map(key));
  for (const gate of level.gates) if (!gate.needs.every(id => active.includes(id))) {
    for(let dx=0;dx<gate.size[0];dx++) for(let dy=0;dy<gate.size[1];dy++) blocked.add(key([gate.at[0]+dx,gate.at[1]+dy]));
  }
  const queue=[level.spawn], visited=new Set([key(level.spawn)]);
  for(let i=0;i<queue.length;i++) {
    const [x,y]=queue[i];
    for(const p of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]) {
      if(p[0]<1||p[0]>18||p[1]<1||p[1]>10||blocked.has(key(p))||visited.has(key(p)))continue;
      visited.add(key(p));queue.push(p);
    }
  }
  return visited;
}
for (const [i,level] of levels.entries()) {
  test(`Sala ${i+1}: objetos válidos, rutas y puzle resoluble con ${level.limit} eco(s)`,()=>{
    const walls=new Set(level.walls.map(key));
    for(const p of [level.spawn,level.exit,...level.shards,...level.plates.map(p=>p.at)]) {
      assert.ok(p[0]>0&&p[0]<19&&p[1]>0&&p[1]<11,`Fuera del mapa: ${p}`);
      assert.ok(!walls.has(key(p)),`Objeto dentro de muro: ${p}`);
    }
    assert.ok(!reachable(level,[]).has(key(level.exit)), 'La salida debe requerir resolver una puerta');
    const solve=(active)=>{
      const cells=reachable(level,active);
      if([level.exit,...level.shards].every(p=>cells.has(key(p))))return true;
      if(active.length===level.limit)return false;
      return level.plates.some(p=>!active.includes(p.id)&&cells.has(key(p.at))&&solve([...active,p.id]));
    };
    assert.ok(solve([]),'No hay solución con los ecos disponibles');
    for(const gate of level.gates)for(const id of gate.needs)assert.ok(level.plates.some(p=>p.id===id));
    for(const drone of level.drones){
      const [x,y]=drone.from,[tx,ty]=drone.to;
      assert.ok(x===tx||y===ty,'La patrulla debe ser recta');
      for(let a=Math.min(x,tx);a<=Math.max(x,tx);a++)for(let b=Math.min(y,ty);b<=Math.max(y,ty);b++)assert.ok(!walls.has(key([a,b])),'Un dron atraviesa un muro');
    }
  });
}
