import * as T from './vendor/three.module.js';

export function createSeatedPerson(){
 const group=new T.Group();group.position.set(0,0,-.6);
 const add=(geometry,material,parent=group,x=0,y=0,z=0)=>{const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 function cloth(color){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,128,128);ctx.strokeStyle='#ffffff12';ctx.lineWidth=.7;for(let i=0;i<128;i+=3){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,128);ctx.moveTo(0,i);ctx.lineTo(128,i);ctx.stroke();}const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(3,3);return new T.MeshStandardMaterial({color:0xffffff,map,roughness:.95});}
 const knit=cloth('#66837d'),rib=new T.MeshStandardMaterial({color:'#526f69',roughness:.95}),denim=cloth('#454e68'),seam=new T.MeshStandardMaterial({color:'#69718a',roughness:1}),skin=new T.MeshStandardMaterial({color:'#e7c2aa',roughness:.78}),shoe=new T.MeshStandardMaterial({color:'#e4d7c6',roughness:.86}),sole=new T.MeshStandardMaterial({color:'#b8aa98',roughness:.9}),wood=new T.MeshStandardMaterial({color:'#b98e6e',roughness:.7}),upholstery=cloth('#cfaa96');
 // A continuous tailored torso, not a scaled sphere; all measurements are local.
 function loft(rings,material){const verts=[],uv=[],indices=[],n=48;for(let j=0;j<rings.length;j++){const [y,rx,rz,cz=0]=rings[j];for(let i=0;i<=n;i++){const a=i/n*Math.PI*2;verts.push(Math.cos(a)*rx,y,Math.sin(a)*rz+cz);uv.push(i/n,j/(rings.length-1));if(j<rings.length-1&&i<n){const k=j*(n+1)+i;indices.push(k,k+n+1,k+1,k+1,k+n+1,k+n+2);}}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return add(g,material);}
 const torso=loft([[-.61,.47,.27,.015],[-.52,.48,.28,.005],[-.32,.46,.27,0],[-.06,.51,.29,0],[.17,.57,.27,0],[.26,.55,.25,0],[.34,.36,.21,0],[.39,.20,.17,0]],knit);torso.name='sweater-torso';
 const hem=loft([[-.63,.47,.27,.015],[-.60,.48,.28,.015],[-.54,.48,.28,.015]],rib);hem.name='sweater-hem';
 const neck=add(new T.CylinderGeometry(.145,.17,.20,32),skin,group,0,.43,0);neck.name='neck';
 const collar=add(new T.TorusGeometry(.185,.035,12,48),rib,group,0,.385,0);collar.rotation.x=Math.PI/2;
 function tube(points,radius,material,segments=36){return add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),segments,radius,12,false),material);}
 function tapered(points,radii,material){
  const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),segments=64,g=new T.TubeGeometry(path,segments,1,16,false),a=g.attributes.position;
  for(let ring=0;ring<=segments;ring++){const t=ring/segments,centre=path.getPointAt(t),f=t*(radii.length-1),lo=Math.floor(f),radius=T.MathUtils.lerp(radii[lo],radii[Math.min(lo+1,radii.length-1)],f-lo);for(let k=0;k<=16;k++){const i=ring*17+k,v=new T.Vector3().fromBufferAttribute(a,i).sub(centre).multiplyScalar(radius).add(centre);a.setXYZ(i,v.x,v.y,v.z);}}
  a.needsUpdate=true;g.computeVertexNormals();return add(g,material);
 }
 const curve=(pts,material=seam,r=.006)=>tube(pts,r,material,24);
 for(const side of [-1,1]){
  const arm=tapered([[side*.45,.22,0],[side*.59,.10,.025],[side*.66,-.18,.16],[side*.55,-.36,.36],[side*.43,-.43,.48]],[.155,.15,.13,.115,.095],knit);arm.name=side<0?'left-sleeve':'right-sleeve';
  add(new T.SphereGeometry(.155,24,16),knit,group,side*.47,.20,.015);
  tube([[side*.43,-.43,.48],[side*.42,-.45,.55]],.072,skin,12);
  const cuff=add(new T.TorusGeometry(.095,.018,12,36),rib,group,side*.43,-.43,.48);cuff.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),new T.Vector3(-side*.12,-.07,.12).normalize());
  const palm=add(new T.SphereGeometry(1,24,16),skin,group,side*.405,-.46,.57);palm.scale.set(.10,.043,.13);palm.name='resting-palm';
  for(let i=0;i<4;i++){const x=side*(.337+i*.044),z=.65,tip=.76-Math.abs(i-1.5)*.018;tube([[x,-.465,z],[x,-.48,z+.06],[x,-.50,tip]],.019,skin,14);add(new T.SphereGeometry(.021,12,8),skin,group,x,-.49,tip);}
  tube([[side*.49,-.46,.55],[side*.53,-.48,.59],[side*.51,-.49,.65]],.028,skin,16);
  const leg=tapered([[side*.23,-.51,0],[side*.26,-.51,.28],[side*.29,-.63,.62],[side*.29,-1.01,.70],[side*.27,-1.43,.72]],[.19,.18,.16,.14,.115],denim);leg.name='continuous-trouser-leg';
  curve([[side*.41,-.61,.51],[side*.43,-.72,.64],[side*.42,-1.01,.71],[side*.39,-1.39,.72]]);
  for(let i=0;i<2;i++)curve([[side*.21,-.69-i*.027,.76],[side*.28,-.70-i*.027,.78],[side*.34,-.68-i*.027,.76]],seam,.004);
  const foot=add(new T.SphereGeometry(1,32,16),shoe,group,side*.27,-1.52,.86);foot.scale.set(.17,.105,.30);foot.name='shoe-upper';
  const outsole=add(new T.SphereGeometry(1,32,16),sole,group,side*.27,-1.606,.86);outsole.scale.set(.175,.027,.305);outsole.name='shoe-sole';
  for(let i=0;i<4;i++)curve([[side*.27-.055,-1.437,.80+i*.045],[side*.27,-1.423,.82+i*.045],[side*.27+.055,-1.437,.80+i*.045]],shoe,.008);
 }
 // Upholstered chair follows the seated pose with clearance behind the sweater.
 const chair=new T.Group();group.add(chair);chair.name='chair';
 function rounded(w,h,d){const sh=new T.Shape(),x=-w/2,y=-h/2,rr=.09;sh.moveTo(x+rr,y);sh.lineTo(x+w-rr,y);sh.quadraticCurveTo(x+w,y,x+w,y+rr);sh.lineTo(x+w,y+h-rr);sh.quadraticCurveTo(x+w,y+h,x+w-rr,y+h);sh.lineTo(x+rr,y+h);sh.quadraticCurveTo(x,y+h,x,y+h-rr);sh.lineTo(x,y+rr);sh.quadraticCurveTo(x,y,x+rr,y);const g=new T.ExtrudeGeometry(sh,{depth:d,bevelEnabled:true,bevelThickness:.018,bevelSize:.018,bevelSegments:3,steps:1,curveSegments:10});g.translate(0,0,-d/2);return g;}
 const cushion=add(rounded(1.22,.82,.16).rotateX(-Math.PI/2),upholstery,chair,0,-.82,.04);cushion.name='seat-cushion';
 const back=add(rounded(1.23,1.35,.16),upholstery,chair,0,-.02,-.43);back.rotation.x=-.07;back.name='chair-back';
 for(const side of [-1,1]){for(const z of [-.25,.57])add(new T.CylinderGeometry(.04,.045,.79,16),wood,chair,side*.48,-1.25,z);const armrest=add(new T.BoxGeometry(.11,.08,.75),wood,chair,side*.70,-.30,.10);armrest.name='chair-armrest';for(const z of [-.17,.39])add(new T.CylinderGeometry(.025,.025,.40,12),wood,chair,side*.70,-.54,z);}
 return {group,torso,chair};
}
