import * as T from './vendor/three.module.js';

// A deliberately generic crown marker, never a clinical recording-site map.
export function createImplantPlacement(){
  const group=new T.Group();
  const material=new T.MeshBasicMaterial({color:0x7664c9,transparent:true,opacity:.85,depthTest:false});
  const ring=new T.Mesh(new T.TorusGeometry(.38,.026,12,64),material);ring.rotation.x=Math.PI/2;ring.renderOrder=4;group.add(ring);
  const dot=new T.Mesh(new T.SphereGeometry(.045,12,8),material.clone());dot.position.y=.05;dot.renderOrder=4;group.add(dot);
  group.visible=false;
  const target=new T.Vector3();const tray=new T.Vector3(-1.45,.35,.7);
  let phase='build',ready=false,dragging=false,seating=0;
  const embedded=new T.Vector3();
  function setTarget(position){target.copy(position);embedded.copy(position).add(new T.Vector3(0,-.30,0));group.position.copy(position);ready=true;}
  function begin(assembled){if(!assembled||!ready||phase!=='build')return false;phase='place';return true;}
  function startDrag(){if(phase!=='place')return false;dragging=true;return true;}
  function drop(near){dragging=false;if(phase!=='place'||!ready||!near)return false;phase='seating';seating=0;return true;}
  function cancel(){dragging=false;}
  function beginLink(){if(phase!=='placed')return false;phase='link';return true;}
  function connect(){if(phase!=='link')return false;phase='connected';return true;}
  function reset(){seating=0;phase='build';dragging=false;group.visible=false;}
  function update(device,delta,reduced=false){
    if(phase==='build')return;
    const rate=reduced?1:1-Math.exp(-delta*7);
    if(phase==='seating'){seating=Math.min(1,seating+(reduced?1:delta/1.2));if(seating===1)phase='placed';}
    const inset=['seating','placed','link','connected'].includes(phase);
    device.scale.lerp(new T.Vector3().setScalar(inset?.14:.38),rate);
    if(!dragging)device.position.lerp(inset?embedded:tray,rate);
  }
  return {group,target,tray,setTarget,begin,startDrag,drop,cancel,reset,update,beginLink,connect,get phase(){return phase;},get ready(){return ready;}};
}
