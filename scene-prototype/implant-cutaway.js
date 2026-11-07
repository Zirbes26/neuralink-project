import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
// MRI-derived surface, fitted to a fictional avatar. Placement remains illustrative.
export function createImplantCutaway(scene){
 const group=new T.Group();group.name='MRI-derived brain';group.position.set(-.03,1.29,-.57);scene.add(group);group.visible=false;
 const reveal={value:0},materials=new Set();let previous=null,previousAvatar=null,brain=null;
 async function load(){
  const gltf=await new GLTFLoader().loadAsync(new URL('./models/brain/brain.glb',import.meta.url).href);
  const root=gltf.scene;root.rotation.y=Math.PI;root.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(root),size=bounds.getSize(new T.Vector3()),centre=bounds.getCenter(new T.Vector3()),scale=.34/size.x;
  const fit=new T.Group();fit.add(root);root.position.sub(centre);fit.scale.setScalar(scale);fit.scale.z*=.88;group.add(fit);
  const cortex=new T.MeshStandardMaterial({name:'MRI cortical surface',color:'#ca9e98',roughness:.88,metalness:0,side:T.DoubleSide});
  root.traverse(o=>{if(o.isMesh){o.material=cortex;o.castShadow=false;o.receiveShadow=true;}});brain=root;return root;
 }
 function attach(avatar){
  for(const m of avatar.morphs.flatMap(mesh=>[].concat(mesh.material))){
   if(materials.has(m)||!['Skin','Hair and lashes'].includes(m.name))continue;
   materials.add(m);const hair=m.name==='Hair and lashes';m.transparent=true;m.depthWrite=true;
   m.onBeforeCompile=shader=>{
    shader.uniforms.uBrainReveal=reveal;
    shader.vertexShader='varying float vRevealHeight;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvRevealHeight = (modelMatrix * vec4(transformed, 1.0)).y;');
    shader.fragmentShader='uniform float uBrainReveal; varying float vRevealHeight;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','diffuseColor.a *= 1.0 - uBrainReveal * '+(hair?'1.0':'smoothstep(1.18, 1.27, vRevealHeight) * 0.88')+';\n#include <opaque_fragment>');
   };
   m.customProgramCacheKey=()=>hair?'brain-reveal-hair-v1':'brain-reveal-skin-v1';m.needsUpdate=true;
  }
 }
 function show(value,avatar){
  if(avatar&&avatar!==previousAvatar){attach(avatar);previousAvatar=avatar;previous=null;}
  if(previous===value)return;previous=value;group.visible=value;reveal.value=value?1:0;
  // Restore opaque skin outside the explanatory view, including its original depth behavior.
  for(const m of materials){m.transparent=value;m.depthWrite=true;m.needsUpdate=true;}
 }
 return {group,load,show,get brain(){return brain;}};
}
