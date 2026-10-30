import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {KTX2Loader} from './vendor/loaders/KTX2Loader.js';
import {MeshoptDecoder} from './vendor/libs/meshopt_decoder.module.js';

export async function loadFaceAvatar(renderer){
 const ktx=new KTX2Loader().setTranscoderPath(new URL('./vendor/libs/basis/',import.meta.url).href).detectSupport(renderer);
 const loader=new GLTFLoader().setKTX2Loader(ktx).setMeshoptDecoder(MeshoptDecoder);
 const gltf=await loader.loadAsync(new URL('./models/facecap.glb',import.meta.url).href);
 const root=gltf.scene,holder=new T.Group();let face;const morphs=[];
 root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.morphTargetInfluences){o.morphTargetInfluences.fill(0);morphs.push(o);if(o.morphTargetDictionary?.eyeBlink_L!==undefined)face=o;}if(o.material){o.material.roughness=.7;o.material.metalness=0;}}});
 if(!face)throw Error('The face has no native eye morphs.');
 face.material=face.material.clone();face.material.color.set('#e2b69d');
 // Keep the complete original scene, including its real eyeballs, lids and teeth.
 // Do not start AnimationMixer: the source clip contains talking motion.
 root.updateMatrixWorld(true);const box=new T.Box3().setFromObject(root,true),size=box.getSize(new T.Vector3()),centre=box.getCenter(new T.Vector3());
 const scale=1.16/size.y;root.scale.multiplyScalar(scale);root.position.copy(centre).multiplyScalar(-scale);holder.add(root);
 holder.position.set(0,.95,-.6);
 let elapsed=0,nextBlink=2.5,blinkStart=-20,mood=0,wasHappy=false,nod=10;
 const allowed=new Set(['eyeBlink_L','eyeBlink_R','eyeSquint_L','eyeSquint_R','browInnerUp','browOuterUp_L','browOuterUp_R']);
 function put(key,value){for(const mesh of morphs){const index=mesh.morphTargetDictionary[key];if(index!==undefined)mesh.morphTargetInfluences[index]=value;}}
 function update(delta,{happy=false,paused=false,reduced=false,talking=0}={}){
  elapsed+=delta;if(happy&&!wasHappy)nod=0;wasHappy=happy;
  // Mouth channels are enabled only by the scripted patient dialogue, never computer speech.
  for(const mesh of morphs)for(const [key,index] of Object.entries(mesh.morphTargetDictionary))if(!allowed.has(key))mesh.morphTargetInfluences[index]=0;
  if(paused||reduced){nextBlink=elapsed+3;blinkStart=-20;}
  else if(elapsed>=nextBlink){blinkStart=elapsed;nextBlink=elapsed+3.2+(Math.sin(elapsed)+1)*.6;}
  const t=(elapsed-blinkStart)/.17,blink=t>=0&&t<1?Math.sin(t*Math.PI):0;
  mood=T.MathUtils.lerp(mood,happy?1:0,1-Math.exp(-delta*4));
  put('eyeBlink_L',.12+.88*blink);put('eyeBlink_R',.12+.88*blink);put('eyeSquint_L',.12+mood*.20);put('eyeSquint_R',.12+mood*.20);put('browInnerUp',mood*.07);put('browOuterUp_L',mood*.10);put('browOuterUp_R',mood*.10);
  if(talking>0&&!paused&&!reduced){put('jawOpen',Math.min(.23,talking*.60));put('mouthFunnel',Math.min(.07,talking*.18));put('mouthPucker',Math.min(.035,talking*.08));}
  if(!paused&&!reduced&&nod<1.6){nod+=delta;holder.rotation.x=Math.sin(nod/1.6*Math.PI*2)*.022*Math.sin(nod/1.6*Math.PI);}else holder.rotation.x=0;
 }
 return {group:holder,root,face,morphs,update,dispose:()=>ktx.dispose(),allowed};
}
