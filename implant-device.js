import * as T from './vendor/three.module.js';

// Original educational geometry based on the four components described by Neuralink.
// Deliberately not a CAD replica, a surgical map, or an actual electrode/thread count.
export function createImplantDevice(){
  const group=new T.Group();group.rotation.y=-.25;
  const parts={};
  const data={
    enclosure:{title:'Biocompatible enclosure',text:'A sealed protective housing separates the electronics from the body’s environment. The transparent cover here is a visual aid.'},
    battery:{title:'Battery',text:'A small internal battery powers the implant. An external inductive charger replenishes it wirelessly.'},
    electronics:{title:'Chips and electronics',text:'Low-power electronics process recorded neural signals and send them wirelessly to the Neuralink Application on an external device.'},
    threads:{title:'Electrode threads',text:'Flexible, ultra-thin threads carry recording electrodes into cortex. Only a few representative threads are drawn; their paths are not anatomical coordinates.'}
  };
  const mat=(color,metalness=.2,roughness=.5)=>new T.MeshStandardMaterial({color,metalness,roughness});
  const pale=mat(0xe2e6e0,.05,.28),dark=mat(0x363d3d,.55,.38),gold=mat(0xc1a36b,.6,.35),board=mat(0x416c61,.3,.45),black=mat(0x262b2b,.25,.38);
  const lidMaterial=new T.MeshPhysicalMaterial({color:0xe8eee7,transparent:true,opacity:.67,roughness:.22,metalness:.08,depthWrite:false});
  const add=(parent,geometry,material,x=0,y=0,z=0)=>{const m=new T.Mesh(geometry,material.clone());m.position.set(x,y,z);parent.add(m);return m;};
  const lid=new T.Group();group.add(lid);parts.enclosure={objects:[lid],y:1.25};
  add(lid,new T.CylinderGeometry(.85,.85,.11,64),lidMaterial);
  add(lid,new T.TorusGeometry(.81,.025,10,64),pale,0,-.065).rotation.x=Math.PI/2;
  for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,x=Math.cos(a)*.85,z=Math.sin(a)*.85;
    const lug=add(lid,new T.TorusGeometry(.10,.035,8,28),pale,x,0,z);lug.rotation.x=Math.PI/2;
  }
  const lower=new T.Group();group.add(lower);parts.enclosure.objects.push(lower);lower.userData.lowerCover=true;
  add(lower,new T.CylinderGeometry(.84,.78,.10,64),lidMaterial);
  const battery=new T.Group();group.add(battery);parts.battery={objects:[battery],y:.50};
  add(battery,new T.CylinderGeometry(.72,.72,.30,64),dark);
  add(battery,new T.CylinderGeometry(.66,.66,.018,64),black,0,.16);
  add(battery,new T.TorusGeometry(.70,.018,8,64),gold,0,.17).rotation.x=Math.PI/2;
  const electronics=new T.Group();group.add(electronics);parts.electronics={objects:[electronics],y:-.22};
  add(electronics,new T.CylinderGeometry(.77,.77,.05,64),board);
  const traces=[];
  for(let i=0;i<9;i++){
    const x=(i%3-1)*.32,z=(Math.floor(i/3)-1)*.30;
    add(electronics,new T.BoxGeometry(.19,.07,.17),black,x,.06,z);
    for(let n=0;n<4;n++)add(electronics,new T.BoxGeometry(.016,.015,.036),gold,x+(n-1.5)*.044,.048,z+.105);
    traces.push(x,.031,z,x,.031,.62);
  }
  const traceGeometry=new T.BufferGeometry();traceGeometry.setAttribute('position',new T.Float32BufferAttribute(traces,3));
  electronics.add(new T.LineSegments(traceGeometry,new T.LineBasicMaterial({color:0xbdaa73})));
  const threads=new T.Group();group.add(threads);parts.threads={objects:[threads],y:-.95};
  const ribbonCurve=new T.CatmullRomCurve3([new T.Vector3(.58,.14,0),new T.Vector3(.9,.02,0),new T.Vector3(1.03,-.17,0),new T.Vector3(.92,-.35,0)]);
  const ribbon=add(threads,new T.TubeGeometry(ribbonCurve,24,.055,5,false),pale);ribbon.scale.z=3.4;
  for(let i=0;i<12;i++){
    const z=(i-5.5)*.038;
    const curve=new T.CatmullRomCurve3([new T.Vector3(.92,-.35,z),new T.Vector3(.83,-.53,z*1.3),new T.Vector3(.8+Math.sin(i*.7)*.12,-.82,z*1.5)]);
    add(threads,new T.TubeGeometry(curve,24,.007,5,false),gold);
    for(let e=0;e<3;e++){const p=curve.getPoint(.68+e*.11);add(threads,new T.SphereGeometry(.012,6,5),gold,p.x,p.y,p.z);}
  }
  lower.position.y=-1.55;
  let selected='enclosure';
  function select(key){if(!parts[key])return;selected=key;
    for(const [name,part] of Object.entries(parts))part.objects.forEach(o=>o.traverse(m=>{if(m.material?.emissive){m.material.emissive.set(name===key?0x285e50:0x000000);m.material.emissiveIntensity=name===key?.25:0;}}));
    return data[key];
  }
  function update(delta,reduced=false){
    for(const [name,part] of Object.entries(parts))for(const obj of part.objects){
      const y=obj.userData.lowerCover?-1.55:part.y;
      obj.position.y=T.MathUtils.lerp(obj.position.y,y+(name===selected&&!obj.userData.lowerCover?.07:0),reduced?1:1-Math.exp(-delta*5));
    }
  }
  select(selected);
  return {group,parts,data,select,update};
}
