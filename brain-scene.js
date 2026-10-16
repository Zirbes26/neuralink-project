import * as T from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const host=document.querySelector('#brain-viewport'), shell=document.querySelector('.webgl-scene');
const loading=document.querySelector('#scene-loading');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try { renderer=new T.WebGLRenderer({antialias:true,alpha:true}); }
catch { loading.textContent='3D rendering is unavailable in this browser. The guided recording and text below remain available.'; }
if(renderer) init();

function init(){
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
  host.append(renderer.domElement);
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,1,.1,100);
  scene.add(new T.HemisphereLight(0xfff4df,0x627d76,2.5));
  const key=new T.DirectionalLight(0xffe5ca,3.8);key.position.set(-4,6,7);scene.add(key);
  const rim=new T.DirectionalLight(0x8dc8bc,3);rim.position.set(2,3,-5);scene.add(rim);
  const fill=new T.DirectionalLight(0xffffff,1.3);fill.position.set(5,1,5);scene.add(fill);
  const skin=new T.MeshStandardMaterial({color:0xddbda1,roughness:.72,metalness:.04});
  const jade=new T.MeshStandardMaterial({color:0x367e71,roughness:.35,metalness:.35});
  const glow=new T.MeshStandardMaterial({color:0xf3ba79,emissive:0xd48139,emissiveIntensity:.6,roughness:.25});
  const person=new T.Group();person.position.set(-3.6,0,0);person.rotation.y=.22;scene.add(person);
  let head;
  new GLTFLoader().load('./models/head.glb',g=>{
    g.scene.traverse(o=>{if(o.isMesh&&!head)head=new T.Mesh(o.geometry,skin);});
    if(!head){loading.textContent='The head model could not be read. The guided recording is still available.';return;}
    head.geometry.computeBoundingBox();const box=head.geometry.boundingBox;
    const scale=3.5/(box.max.y-box.min.y);head.scale.setScalar(scale);
    const center=box.getCenter(new T.Vector3());head.position.copy(center).multiplyScalar(-scale);
    person.add(head);loading.hidden=true;
  },undefined,()=>{loading.textContent='The 3D head could not load. Open this page with Live Server and refresh.';});
  // Placement is deliberately illustrative, not a surgical or anatomical reconstruction.
  const implant=new T.Mesh(new T.CylinderGeometry(.22,.22,.10,40),jade);
  implant.position.set(.47,1.23,.42);implant.rotation.z=-.48;person.add(implant);
  const implantLight=new T.Mesh(new T.TorusGeometry(.23,.025,12,48),glow);
  implantLight.rotation.x=Math.PI/2;implant.add(implantLight);
  const internal=new T.Group();person.add(internal);
  for(let i=0;i<14;i++){
    const end=new T.Vector3(Math.sin(i*2.4)*.62,.35+Math.cos(i*1.7)*.45,Math.cos(i*2.4)*.43);
    const curve=new T.QuadraticBezierCurve3(implant.position.clone(),new T.Vector3(end.x,1,end.z),end);
    internal.add(new T.Mesh(new T.TubeGeometry(curve,20,.012,5,false),glow));
    const dot=new T.Mesh(new T.SphereGeometry(.032,8,8),glow);dot.position.copy(end);internal.add(dot);
  }
  internal.visible=false;
  const base=new T.Mesh(new T.CylinderGeometry(1.38,1.5,.12,64),new T.MeshStandardMaterial({color:0xbac7b8,roughness:.9}));
  base.position.set(-3.6,-1.82,0);scene.add(base);
  const decoder=new T.Group();decoder.position.set(.05,.1,0);scene.add(decoder);
  const vertices=[];
  for(let layer=0;layer<4;layer++)for(let i=0;i<6;i++){
    const p=new T.Vector3((layer-1.5)*.38,(i%3-1)*.49,(Math.floor(i/3)-.5)*.7);
    const dot=new T.Mesh(new T.SphereGeometry(.085,16,12),jade);dot.position.copy(p);decoder.add(dot);vertices.push(p);
  }
  const edgePositions=[];
  for(let l=0;l<3;l++)for(let a=0;a<6;a++)for(let b=0;b<6;b++)edgePositions.push(...vertices[l*6+a].toArray(),...vertices[(l+1)*6+b].toArray());
  const edges=new T.BufferGeometry();edges.setAttribute('position',new T.Float32BufferAttribute(edgePositions,3));
  decoder.add(new T.LineSegments(edges,new T.LineBasicMaterial({color:0x659c8a,transparent:true,opacity:.32})));
  const cage=new T.Mesh(new T.BoxGeometry(1.7,1.7,1.3),new T.MeshPhysicalMaterial({color:0x86b5a5,transparent:true,opacity:.07,roughness:.2,depthWrite:false}));decoder.add(cage);
  const frame=new T.LineSegments(new T.EdgesGeometry(cage.geometry),new T.LineBasicMaterial({color:0x568c7a,transparent:true,opacity:.4}));decoder.add(frame);
  const labelCanvas=document.createElement('canvas');labelCanvas.width=768;labelCanvas.height=96;
  const lc=labelCanvas.getContext('2d');lc.fillStyle='#e7eee5';lc.fillRect(0,0,768,96);lc.fillStyle='#2e594a';lc.font='25px sans-serif';lc.textAlign='center';lc.fillText('DECODER · RNN + LANGUAGE MODEL',384,57);
  const labelTexture=new T.CanvasTexture(labelCanvas);labelTexture.colorSpace=T.SRGBColorSpace;
  const decoderLabel=new T.Sprite(new T.SpriteMaterial({map:labelTexture}));decoderLabel.position.set(.05,-1.12,.1);decoderLabel.scale.set(2.3,.29,1);scene.add(decoderLabel);
  const textCanvas=document.createElement('canvas');textCanvas.width=1024;textCanvas.height=512;
  const texture=new T.CanvasTexture(textCanvas);texture.colorSpace=T.SRGBColorSpace;
  const panel=new T.Mesh(new T.PlaneGeometry(3.1,1.55),new T.MeshBasicMaterial({map:texture,side:T.DoubleSide}));panel.position.set(3.25,.15,.2);scene.add(panel);
  const panelBack=new T.Mesh(new T.BoxGeometry(3.2,1.65,.13),new T.MeshStandardMaterial({color:0xb7c6b9,roughness:.75}));panelBack.position.copy(panel.position);panelBack.position.z-=.09;scene.add(panelBack);
  let lastText='',lastStage=-1;
  function paintText(text,s){const c=textCanvas.getContext('2d');c.fillStyle='#f8f4ec';c.fillRect(0,0,1024,512);c.fillStyle='#547363';c.font='24px sans-serif';c.fillText(s===0?'WAITING FOR THE SIGNAL':s===1?'RECORDED DECODER PREDICTION':'DECODED WORDS',60,75);c.fillStyle='#243d35';c.font='56px Georgia';let line='',y=225;for(const word of text.split(' ')){if(c.measureText(line+word).width>900){c.fillText(line,60,y);line='';y+=76;}line+=word+' ';}c.fillText(line,60,y);c.font='22px sans-serif';c.fillStyle='#718176';c.fillText(s===3?'Ready for synthetic speech':'Research recording · T12',60,450);texture.needsUpdate=true;}
  const waves=new T.Group();waves.position.set(5.5,.15,.2);scene.add(waves);
  for(let i=0;i<4;i++){const wave=new T.Mesh(new T.TorusGeometry(.24+i*.15,.018,8,48,Math.PI*1.35),glow);wave.rotation.z=-Math.PI*.675;wave.rotation.y=.35;wave.position.x=i*.13;waves.add(wave);}
  const source=new T.Vector3(-3.05,1.25,.45);
  const signalPath=new T.CatmullRomCurve3([source,new T.Vector3(-2.4,1.5,.55),new T.Vector3(-1.4,.3,.4),new T.Vector3(-.8,.1,0)]);
  const wordPath=new T.CatmullRomCurve3([new T.Vector3(.9,.1,0),new T.Vector3(1.25,.3,.3),new T.Vector3(1.68,.15,.25)]);
  [signalPath,wordPath].forEach(path=>scene.add(new T.Mesh(new T.TubeGeometry(path,60,.012,6,false),new T.MeshBasicMaterial({color:0x86a89a,transparent:true,opacity:.4}))));
  const particles=[];
  for(let i=0;i<24;i++){const m=new T.Mesh(new T.SphereGeometry(i<16?.04:.025,8,8),glow);scene.add(m);particles.push(m);}
  const focusLabels=['01 / The person behind the signal','02 / From neural activity to a prediction','03 / A sentence takes shape','04 / The words become audible'];
  const poses=[[-3.1,.3,7.8],[-.7,.65,12],[2.8,.4,8],[3.8,.5,8.8]];
  const targets=[[-3.25,.15,0],[-.8,.3,0],[2.65,.15,0],[3.55,.15,0]];
  let yaw=0,pitch=0,drag=null,cutaway=false,visible=true,animation=0;
  const target=new T.Vector3(),aim=new T.Vector3(-3.25,.15,0);camera.position.set(-3.1,.3,7.8);
  function rotate(v){yaw=T.MathUtils.clamp(yaw+v,-.8,.8);}
  document.querySelector('#view-left').onclick=()=>rotate(-.16);
  document.querySelector('#view-right').onclick=()=>rotate(.16);
  document.querySelector('#view-reset').onclick=()=>{yaw=0;pitch=0;};
  document.querySelector('#view-implant').onclick=e=>{cutaway=!cutaway;skin.transparent=cutaway;skin.opacity=cutaway?.2:1;skin.depthWrite=!cutaway;skin.needsUpdate=true;internal.visible=cutaway;e.currentTarget.setAttribute('aria-pressed',String(cutaway));e.currentTarget.textContent=cutaway?'Hide implant':'Show implant';};
  renderer.domElement.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);});
  renderer.domElement.addEventListener('pointermove',e=>{if(!drag)return;rotate((e.clientX-drag.x)*.004);pitch=T.MathUtils.clamp(pitch+(e.clientY-drag.y)*.003,-.35,.35);drag={x:e.clientX,y:e.clientY};});
  renderer.domElement.addEventListener('pointerup',()=>drag=null);renderer.domElement.addEventListener('pointercancel',()=>drag=null);
  function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  const ro=new ResizeObserver(resize);ro.observe(host);resize();
  const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});io.observe(host);
  let previous=0;
  function frameLoop(now){animation=requestAnimationFrame(frameLoop);if(!visible||document.hidden){previous=now;return;}const delta=Math.min((now-previous)/1000,.05);previous=now;
    const s=Number(shell.dataset.stage||0),active=shell.dataset.playing==='true',speaking=shell.dataset.speaking==='true';
    const f=Number(document.querySelector('#stage-progress').value||0);
    if(s!==lastStage){yaw=0;pitch=0;document.querySelector('#scene-focus').textContent=focusLabels[s];}
    const txt=s===0?'…':document.querySelector('#partial-text').textContent;
    if(txt!==lastText||s!==lastStage){paintText(txt,s);lastText=txt;lastStage=s;}
    target.fromArray(targets[s]);
    if(camera.aspect<1&&s===1)target.set(-3.1+5.7*f,.2,0);
    aim.lerp(target,reduced.matches?1:1-Math.exp(-delta*4));
    const p=poses[s],distance=p[2]*(camera.aspect<1?1.55:1);
    const dest=new T.Vector3(p[0]+Math.sin(yaw)*distance,p[1]+pitch*distance,Math.cos(yaw)*distance);
    if(camera.aspect<1&&s===1)dest.set(target.x+Math.sin(yaw)*11,.5+pitch*11,Math.cos(yaw)*11);
    camera.position.lerp(dest,reduced.matches?1:1-Math.exp(-delta*4));camera.lookAt(aim);
    decoder.rotation.y=reduced.matches?0:(s===1?f*.65:.15);decoder.rotation.x=.12;
    implantLight.scale.setScalar(active&&s===0&&!reduced.matches?1+.2*Math.sin(f*40):1);
    particles.forEach((m,i)=>{m.visible=active&&s<=1;if(!m.visible)return;const t=(f*2+i/24)%1;if(s===0){m.position.copy(source).add(new T.Vector3(Math.sin(i*2.4)*(.9*(1-t)),(t-1)*.9,Math.cos(i*2.4)*.5*(1-t)));}else m.position.copy((i<16?signalPath:wordPath).getPointAt((f*2+i/16)%1));if(reduced.matches)m.visible=false;});
    waves.visible=s===3;waves.children.forEach((w,i)=>{w.scale.setScalar(speaking&&!reduced.matches?1+.15*Math.sin(now*.008-i):1);});
    renderer.render(scene,camera);
  }
  animation=requestAnimationFrame(frameLoop);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();loading.hidden=false;loading.textContent='The 3D view was interrupted. Refresh to restore it. The recording controls remain available.';});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(animation);ro.disconnect();io.disconnect();scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of [].concat(o.material))m.dispose();}});texture.dispose();labelTexture.dispose();renderer.dispose();},{once:true});
}
