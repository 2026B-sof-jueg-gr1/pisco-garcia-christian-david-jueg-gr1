(function(root){
 const R={
  blocked(x,y,walls,r=0){return x-r<48||x+r>912||y-r<48||y+r>528||walls.some(w=>x+r>w.x&&x-r<w.x+w.w&&y+r>w.y&&y-r<w.y+w.h);},
  visible(a,b,walls){const n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/6);for(let i=1;i<n;i++)if(this.blocked(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,walls))return false;return true;},
  sees(g,p,walls,range){const angle=Math.atan2(p.y-g.y,p.x-g.x);const diff=Math.atan2(Math.sin(angle-g.angle),Math.cos(angle-g.angle));return Math.hypot(p.x-g.x,p.y-g.y)<range&&Math.abs(diff)<.52&&this.visible(g,p,walls);},
  missions:[
   {name:'ADUANA',time:42,walls:[[6,2,1,3],[6,7,1,3],[12,4,1,4]],guards:[[9,2,9,9],[15,3,15,9]],lasers:[[10,5,2,0,0]],core:[17,3]},
   {name:'CIRCUITO',time:40,walls:[[5,3,3,1],[5,7,3,1],[12,2,1,3],[12,7,1,3]],guards:[[9,2,9,9],[14,6,17,6],[3,5,8,5]],lasers:[[13,5,4,0,1],[9,8,2,0,2]],core:[17,9]},
   {name:'ANGULO MUERTO',time:38,walls:[[5,2,1,5],[10,5,1,5],[14,2,1,5]],guards:[[7,3,7,9],[12,2,12,8],[16,3,16,9]],lasers:[[6,8,4,0,1],[11,3,3,0,0]],core:[17,2]},
   {name:'CAJA FUERTE',time:35,walls:[[5,3,1,6],[9,2,1,5],[13,5,1,5]],guards:[[7,2,7,9],[11,3,11,9],[15,2,17,2],[15,7,17,7]],lasers:[[6,2,3,0,2],[10,8,3,0,0],[14,4,4,0,1]],core:[17,9]},
   {name:'PROTOCOLO CERO',time:32,walls:[[5,2,1,5],[9,5,1,5],[13,2,1,5]],guards:[[7,2,7,9],[11,2,11,9],[15,3,18,3],[15,8,18,8]],lasers:[[6,8,3,0,0],[10,3,3,0,1],[14,6,4,0,2]],core:[17,5]}
  ],
  walls(m){return m.walls.map(([x,y,w,h])=>({x:x*48,y:y*48,w:w*48,h:h*48}));}
 };
 root.HeistRules=R;if(typeof module!=='undefined')module.exports=R;
})(globalThis);
