import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
// A complete Microsoft Rocketbox character; no separate head or generated limbs.
export async function loadFaceAvatar(){
 const base=new URL('./models/rocketbox/',import.meta.url);
 const [gltf,clipData]=await Promise.all([new GLTFLoader().loadAsync(new URL('medical-male-02.glb',base).href),fetch(new URL('m_sit_chair_breathe_01.json',base)).then(r=>{if(!r.ok)throw Error('Seated motion could not load');return r.json();})]);
 const root=gltf.scene,group=new T.Group(),morphs=[];let face;
 root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;if(o.morphTargetInfluences){o.morphTargetInfluences.fill(0);morphs.push(o);face=o;}}});
 if(!face)throw Error('Character facial controls are missing');
 group.name='Rocketbox complete patient';group.add(root);root.scale.setScalar(.021);group.position.set(0,-1.65,-.6);
 const mixer=new T.AnimationMixer(root),clip=T.AnimationClip.parse(clipData);mixer.clipAction(clip).play();mixer.setTime(.3);group.updateMatrixWorld(true);
 let elapsed=0,nextBlink=2.5,blinkStart=-20,mood=0;
 function put(suffix,value){for(const m of morphs){const key=Object.keys(m.morphTargetDictionary).find(k=>k.endsWith(suffix));if(key!==undefined)m.morphTargetInfluences[m.morphTargetDictionary[key]]=value;}}
 function update(delta,{happy=false,paused=false,reduced=false,talking=0}={}){
  if(!paused&&!reduced)mixer.update(delta);elapsed+=delta;
  for(const m of morphs)m.morphTargetInfluences.fill(0);
  if(paused||reduced){nextBlink=elapsed+3;blinkStart=-20;}else if(elapsed>=nextBlink){blinkStart=elapsed;nextBlink=elapsed+3.2+(Math.sin(elapsed)+1)*.6;}
  const t=(elapsed-blinkStart)/.20,blink=t>=0&&t<1?Math.sin(t*Math.PI):0;
  mood=T.MathUtils.lerp(mood,happy?1:0,1-Math.exp(-delta*4));
  put('AK_09_EyeBlinkLeft',blink);put('AK_10_EyeBlinkRight',blink);put('AK_19_EyeSquintLeft',mood*.16);put('AK_20_EyeSquintRight',mood*.16);put('AK_03_BrowInnerUp',mood*.08);put('AK_04_BrowOuterUpLeft',mood*.08);put('AK_05_BrowOuterUpRight',mood*.08);
  // Only the scripted patient's dialogue controls the mouth, never computer audio.
  if(talking>0&&!paused&&!reduced){put('AK_25_JawOpen',Math.min(.24,talking*.60));put('AK_32_MouthFunnel',Math.min(.055,talking*.16));put('AK_38_MouthPucker',Math.min(.03,talking*.08));}
 }
 return {group,root,face,morphs,update,mixer,dispose(){mixer.stopAllAction();root.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of [].concat(o.material)){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();}}});}};
}
