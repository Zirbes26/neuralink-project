import * as T from '../../vendor/three/three.module.js';
export function addRoomDetails(scene){
 const group=new T.Group();scene.add(group);
 const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.85});const wood=mat('#b28d71'),cream=mat('#f3e4d4'),metal=mat('#9c8164'),green=mat('#657e73');
 function add(g,m,x,y,z){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);return o;}
 const box=(w,h,d,m,x,y,z)=>add(new T.BoxGeometry(w,h,d),m,x,y,z);
 // Floorboard seams and a layered woven rug give depth without a busy UI.
 for(let i=-12;i<=12;i++){const seam=box(.009,.003,22,mat('#c7ab9225'.slice(0,7)),i*.72,-1.646,1);seam.castShadow=false;}
 for(const x of [-5.4,-1.6]){const g=new T.PlaneGeometry(.72,3.4,24,24),p=g.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*35)*.07);g.computeVertexNormals();const curtain=add(g,new T.MeshStandardMaterial({color:'#d7c8b7',roughness:1,side:T.DoubleSide}),x,1.8,-4.12);curtain.castShadow=false;}
 const rail=add(new T.CylinderGeometry(.025,.025,4.8,16),metal,-3.5,3.55,-4.05);rail.rotation.z=Math.PI/2;
 // Bookcase: staggered books, storage, framed print and ceramics.
 box(2.3,.09,.44,wood,3.65,-1.12,-3.95);box(2.3,.09,.44,wood,3.65,-.24,-3.95);box(2.3,.09,.44,wood,3.65,.64,-3.95);
 for(const x of [2.48,4.82])box(.08,2.65,.48,wood,x,-.3,-3.95);
 const colors=['#b8a6c8','#d3a892','#8daba0','#d7c8aa','#7b829a'];
 for(let i=0;i<10;i++){const h=.32+(i%3)*.08;const b=box(.10,h,.27,mat(colors[i%5]),2.75+i*.13,-.20+h/2,-3.87);b.rotation.z=i===8?-.12:0;}
 for(let i=0;i<5;i++)box(.45,.065,.30,mat(colors[i]),4.25,-1.02+i*.065,-3.9);
 const vase=add(new T.LatheGeometry([new T.Vector2(.07,0),new T.Vector2(.15,.06),new T.Vector2(.15,.20),new T.Vector2(.07,.29),new T.Vector2(.06,.34)],36),cream,3.0,.70,-3.94);
 // Floor lamp, with warm light aimed toward the conversation area.
 add(new T.CylinderGeometry(.25,.27,.035,48),metal,1.65,-1.625,-2.1);add(new T.CylinderGeometry(.018,.018,2.65,16),metal,1.65,-.3,-2.1);add(new T.CylinderGeometry(.25,.43,.48,40,1,true),new T.MeshStandardMaterial({color:'#f8e5c7',side:T.DoubleSide,emissive:'#f2c994',emissiveIntensity:.15}),1.65,1.22,-2.1);
 const lamp=new T.PointLight('#ffd6a1',1.5,5,2);lamp.position.set(1.65,1.05,-2.1);group.add(lamp);
 function print(text,w,h){const c=document.createElement('canvas');c.width=720;c.height=480;const x=c.getContext('2d');x.fillStyle='#efe3d5';x.fillRect(0,0,720,480);x.strokeStyle='#bb8971';x.lineWidth=5;x.beginPath();x.arc(370,170,75,0,Math.PI*2);x.stroke();x.font='30px Georgia';x.textAlign='center';x.fillStyle='#574b67';text.split('|').forEach((t,i)=>x.fillText(t,360,300+i*42));const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;return new T.MeshBasicMaterial({map:texture});}
 box(1.85,1.28,.07,wood,.2,1.55,-4.28);add(new T.PlaneGeometry(1.72,1.14),print('Communication begins|with listening.'),.2,1.55,-4.235);
 // Everyday objects around the computer, not an operating theatre.
 box(.48,.035,.35,mat('#d2b89d'),4.1,-.46,.55);box(.46,.012,.33,cream,4.1,-.434,.55);
 const pen=add(new T.CylinderGeometry(.012,.012,.34,12),mat('#5d587b'),4.12,-.417,.54);pen.rotation.z=Math.PI/2-.25;
 add(new T.CylinderGeometry(.09,.07,.19,32),cream,3.95,-.39,-.25);const handle=add(new T.TorusGeometry(.06,.015,8,24),cream,4.04,-.38,-.25);handle.rotation.y=Math.PI/2;
 const water=new T.MeshPhysicalMaterial({color:'#d6e8e5',transparent:true,opacity:.32,roughness:.08,transmission:.1});add(new T.CylinderGeometry(.07,.06,.20,24),water,-3.94,-.47,.8);
 return group;
}
