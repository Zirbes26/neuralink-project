import * as T from './vendor/three.module.js';
export function createPatientChair(){
 const group=new T.Group();group.position.z=-.6;group.name='Upholstered patient chair';
 const fabric=new T.MeshStandardMaterial({color:'#9caaa1',roughness:.95}),wood=new T.MeshStandardMaterial({color:'#b98b69',roughness:.8});
 function box(w,h,d,x,y,z,m=fabric){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);return o;}
 box(1.25,.12,1.15,0,-.64,.15);box(1.25,1.12,.13,0,-.12,-.53);
 for(const side of [-1,1])for(const z of [-.32,.6])box(.065,.96,.065,side*.51,-1.15,z,wood);
 return {group};
}
