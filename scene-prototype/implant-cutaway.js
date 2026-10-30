import * as T from './vendor/three.module.js';
// An abstract explanatory cutaway, not an anatomical or surgical placement map.
export function createImplantCutaway(scene){
 const group=new T.Group();group.position.set(0,1.25,-.6);scene.add(group);group.visible=false;
 const cortex=new T.MeshStandardMaterial({color:'#a79bc6',roughness:.9,transparent:true,opacity:.9});
 const brain=new T.Mesh(new T.SphereGeometry(1,40,24),cortex);brain.scale.set(.34,.235,.32);group.add(brain);
 const foldmat=new T.MeshStandardMaterial({color:'#897cac',roughness:.9});
 for(let i=0;i<11;i++){const points=[];for(let j=0;j<30;j++){const t=j/29*Math.PI;const x=(i-5)*.054,y=Math.sin(t)*.21+.006*Math.sin(t*14+i),z=Math.cos(t)*Math.sqrt(Math.max(0,1-(x/.35)**2))*.31;points.push(new T.Vector3(x+.008*Math.sin(t*15),y,z));}group.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),36,.008,6,false),foldmat));}
 const rim=new T.Mesh(new T.TorusGeometry(.35,.018,12,64),new T.MeshStandardMaterial({color:'#efe0be',roughness:.8}));rim.rotation.x=Math.PI/2;rim.position.y=.03;group.add(rim);
 const scalp=new T.Mesh(new T.SphereGeometry(1,40,16,0,Math.PI*2,0,Math.PI*.49),new T.MeshStandardMaterial({color:'#dbb29a',transparent:true,opacity:.13,side:T.DoubleSide,depthWrite:false}));scalp.scale.set(.40,.30,.38);scalp.position.y=.02;group.add(scalp);
 const clip=new T.Plane(new T.Vector3(0,-1,0),1.27);
 let previous=null,previousAvatar=null;
 function show(value,avatar){if(previous===value&&previousAvatar===avatar)return;previous=value;previousAvatar=avatar;group.visible=value;if(!avatar)return;const material=avatar.face.material;material.clippingPlanes=value?[clip]:null;material.clipShadows=value;material.needsUpdate=true;}
 return {group,show};
}
