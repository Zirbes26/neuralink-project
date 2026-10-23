import * as T from './vendor/three.module.js';
import {createImplantDevice} from './implant-device.js';

// Optional conceptual close-ups use a separate device; assembly stays untouched.
export function createPartExplorer(){
  const device=createImplantDevice(),group=device.group;
  for(const key of ['electronics','battery','enclosure'])device.fit(key);
  device.update(1,true);group.visible=false;
  const copy={
    battery:{title:'Power without a plug',text:'An external inductive charger replenishes the implant battery wirelessly.'},
    electronics:{title:'A wireless journey',text:'Implant electronics process neural signals and send data wirelessly to an external application.'},
    threads:{title:'Tiny recording contacts',text:'Electrodes along flexible threads record nearby neural activity; their size and number here are illustrative.'}
  };
  let selected='battery';
  const focus=new T.Vector3(),anchors={};
  for(const key of Object.keys(copy)){
    const object=device.parts[key].objects[0];object.userData.explorePart=key;
    if(key==='threads'){
      const hit=new T.Mesh(new T.BoxGeometry(.65,.9,.65),new T.MeshBasicMaterial({visible:false}));hit.position.set(.85,-.45,0);object.add(hit);
    }
  }
  const effects=new T.Group();group.add(effects);
  const purple=new T.MeshBasicMaterial({color:0x7868d3,transparent:true,opacity:.65});
  const coral=new T.MeshBasicMaterial({color:0xcf6a52,transparent:true,opacity:.9});
  const charger=new T.Group();effects.add(charger);
  for(let i=0;i<3;i++){const coil=new T.Mesh(new T.TorusGeometry(.43+i*.09,.018,8,64),purple.clone());coil.rotation.x=Math.PI/2;coil.position.y=.88+i*.1;charger.add(coil);}
  const radio=new T.Group();effects.add(radio);
  for(let i=0;i<3;i++){const arc=new T.Mesh(new T.TorusGeometry(.22+i*.15,.018,8,40,Math.PI),purple.clone());arc.rotation.z=-Math.PI/2;arc.position.set(1.02+i*.18,-.35,0);radio.add(arc);}
  const pulses=[];
  for(let i=0;i<6;i++){const dot=new T.Mesh(new T.SphereGeometry(.035,10,8),coral.clone());effects.add(dot);pulses.push(dot);}
  function select(key){if(!copy[key])return null;selected=key;device.select(key);return copy[key];}
  function update(delta,time,reduced){
    device.update(delta,true);
    device.parts.enclosure.objects[0].position.y=1.3;device.parts.enclosure.objects[1].position.y=-1.6;
    device.parts.battery.objects[0].position.y=.45;device.parts.electronics.objects[0].position.y=-.35;
    device.parts.threads.objects[0].position.y=-.75;
    anchors.battery=new T.Vector3(.9,.50,0);anchors.electronics=new T.Vector3(.95,-.30,0);anchors.threads=new T.Vector3(1.12,-1.20,0);
    focus.set(selected==='threads'?.85:0,selected==='battery'?.65:selected==='electronics'?-.35:-1.1,0);
    charger.visible=selected==='battery';radio.visible=selected==='electronics';
    charger.children.forEach((o,i)=>o.material.opacity=reduced?.65:.28+.5*(.5+.5*Math.sin(time*.003-i)));
    radio.children.forEach((o,i)=>o.material.opacity=reduced?.65:.25+.55*(.5+.5*Math.sin(time*.004-i)));
    pulses.forEach((dot,i)=>{const t=reduced?i/6:(time*.0003+i/6)%1;dot.visible=true;
      if(selected==='battery')dot.position.set(Math.cos(i)*.4,.85-t*.38,Math.sin(i)*.4);
      else if(selected==='electronics')dot.position.set(.7+t*1.5,-.35+Math.sin(t*Math.PI)*.12,0);
      else dot.position.set(.87+Math.sin(i)*.08,-1.1-t*.45,(i-2.5)*.04);
    });
    for(const [key,part] of Object.entries(device.parts))part.objects.forEach(object=>object.visible=key===selected);
    group.updateMatrixWorld(true);
  }
  return {group,device,copy,anchors,focus,select,update,get selected(){return selected;},pickables(){return [device.parts[selected].objects[0]];}};
}
