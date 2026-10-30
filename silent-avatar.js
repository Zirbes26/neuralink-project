import * as T from './vendor/three.module.js';

// Silent visual avatar: no jaw, lip, phoneme or speech-synthesis input is used.
export function createSilentAvatar(head,parent){
  const geometry=head.geometry.clone();head.geometry=geometry;
  const position=geometry.attributes.position,rest=position.array.slice();
  const brows=[];const sampleRay=new T.Raycaster();head.updateMatrixWorld(true);
  for(let i=0;i<position.count;i++){
    const x=rest[i*3]*head.scale.x+head.position.x,y=rest[i*3+1]*head.scale.y+head.position.y,z=rest[i*3+2]*head.scale.z+head.position.z;
    // A compact brow-only mask leaves the entire mouth and lower face immutable.
    if(y>.87&&y<1.12&&z>.60&&Math.abs(Math.abs(x)-.32)<.23){
      const w=Math.sin((y-.87)/.25*Math.PI)*Math.max(0,1-Math.abs(Math.abs(x)-.32)/.23);brows.push({index:i,weight:w});
    }
  }
  function surface(x,y){parent.updateWorldMatrix(true,true);sampleRay.set(parent.localToWorld(new T.Vector3(x,y,3)),new T.Vector3(0,0,-1).transformDirection(parent.matrixWorld));const hit=sampleRay.intersectObject(head,false)[0];return hit?parent.worldToLocal(hit.point).z:.72;}
  const eyes=[];
  const whites=new T.MeshStandardMaterial({color:0xc9c2ac,roughness:.75});
  const irisMaterial=new T.MeshStandardMaterial({color:0x4a4739,roughness:.7});
  const pupilMaterial=new T.MeshStandardMaterial({color:0x252821,roughness:.6});
  for(const side of [-1,1]){
    const cx=side*.32,cy=.745,eye=new T.Group();eye.position.set(cx,cy,0);parent.add(eye);
    const vertices=[],indices=[];const steps=24;
    for(let i=0;i<=steps;i++){
      const u=i/steps*2-1,x=cx+u*.15,curve=.025*u*u,opening=.045*Math.sqrt(Math.max(0,1-u*u));
      for(const v of [-1,1]){const y=cy+curve+v*opening;vertices.push(x-cx,y-cy,surface(x,y)+.009);}
      if(i<steps){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
    const white=new T.Mesh(geo,whites);eye.add(white);
    const iris=new T.Mesh(new T.SphereGeometry(.032,20,12),irisMaterial);iris.scale.set(1,1,.22);iris.position.set(0,.002,surface(cx,cy)+.018);eye.add(iris);
    const pupil=new T.Mesh(new T.SphereGeometry(.015,16,10),pupilMaterial);pupil.scale.z=.25;pupil.position.copy(iris.position);pupil.position.z+=.009;eye.add(pupil);
    eyes.push(eye);
  }
  let elapsed=0,nextBlink=2.8,blinkStart=-10,mood=0,previousCorrect=false,nodTime=10;
  function update(delta,{enabled=true,reduced=false,correct=false,visible=true}={}){
    // Hidden/inactive scenes cannot consume a reaction or blink timer.
    if(!visible)return {blink:0,happy:mood};
    elapsed+=delta;
    if(correct&&!previousCorrect)nodTime=0;previousCorrect=correct;
    if(!enabled||reduced){blinkStart=-10;nextBlink=elapsed+3;}
    else if(elapsed>=nextBlink){blinkStart=elapsed;nextBlink=elapsed+3.2+(Math.sin(elapsed*1.7)+1)*.8;}
    const t=(elapsed-blinkStart)/.18;
    const blink=enabled&&!reduced&&t>=0&&t<1?Math.sin(t*Math.PI):0;
    mood=T.MathUtils.lerp(mood,correct?1:0,1-Math.exp(-delta*4));
    eyes.forEach(eye=>eye.scale.y=Math.max(.015,(1-blink)*(1-mood*.32)));
    for(const {index,weight} of brows)position.array[index*3+1]=rest[index*3+1]+weight*mood*.025/head.scale.y;
    position.needsUpdate=true;
    if(enabled&&!reduced&&nodTime<1.6){nodTime+=delta;parent.rotation.x=Math.sin(nodTime/1.6*Math.PI*2)*.025*Math.sin(nodTime/1.6*Math.PI);}
    else parent.rotation.x=0;
    return {blink,happy:mood};
  }
  function reset(){mood=0;previousCorrect=false;nodTime=10;elapsed=0;nextBlink=2.8;blinkStart=-10;parent.rotation.x=0;position.array.set(rest);position.needsUpdate=true;eyes.forEach(eye=>eye.scale.y=1);}
  return {update,reset,eyes,rest,geometry};
}
