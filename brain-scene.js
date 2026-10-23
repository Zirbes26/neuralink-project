import * as T from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import {createImplantDevice} from './implant-device.js';
import {createDecodingComputer} from './decoding-computer.js';

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
  const study=new T.Group();scene.add(study);
  const implant=createImplantDevice();scene.add(implant.group);
  scene.add(new T.HemisphereLight(0xfff4df,0x627d76,2.5));
  const key=new T.DirectionalLight(0xffe5ca,3.8);key.position.set(-4,6,7);scene.add(key);
  const rim=new T.DirectionalLight(0x8dc8bc,3);rim.position.set(2,3,-5);scene.add(rim);
  const fill=new T.DirectionalLight(0xffffff,1.3);fill.position.set(5,1,5);scene.add(fill);
  const skin=new T.MeshStandardMaterial({color:0xddbda1,roughness:.72,metalness:.04});
  const jade=new T.MeshStandardMaterial({color:0x367e71,roughness:.35,metalness:.35});
  const glow=new T.MeshStandardMaterial({color:0xf3ba79,emissive:0xd48139,emissiveIntensity:.6,roughness:.25});
  const person=new T.Group();person.position.set(-3.6,0,0);person.rotation.y=-.3;study.add(person);
  // Generic-head local coordinates only: positive X is the person's left side.
  // Anterior is +Z; 6v is posterior to area 44 in this schematic.
  const siteDefinitions=[
    {region:'6v',name:'6v dorsal',point:new T.Vector3(.72,1.03,-.10),active:true},
    {region:'6v',name:'6v ventral',point:new T.Vector3(.72,.87,-.04),active:true},
    {region:'44',name:'44 superior',point:new T.Vector3(.70,.89,.30),active:false},
    {region:'44',name:'44 inferior',point:new T.Vector3(.70,.73,.36),active:false}
  ];
  const recordingSites=new T.Group();person.add(recordingSites);
  const siteMeshes=[],activeAnchors=[];
  const secondaryMaterial=new T.MeshStandardMaterial({color:0x947eae,roughness:.6});
  function buildRecordingSites(){
    recordingSites.clear();siteMeshes.length=0;activeAnchors.length=0;
    for(const def of siteDefinitions){
      const group=new T.Group();group.position.copy(def.point);
      const patch=new T.Mesh(new T.BoxGeometry(.025,.105,.105),def.active?jade:secondaryMaterial);group.add(patch);
      const contacts=new T.InstancedMesh(new T.SphereGeometry(.0038,5,4),def.active?glow:secondaryMaterial,64);
      for(let row=0;row<8;row++)for(let col=0;col<8;col++){
        contacts.setMatrixAt(row*8+col,new T.Matrix4().makeTranslation(.018,(row-3.5)*.011,(col-3.5)*.011));
      }
      group.add(contacts);
      group.userData={region:def.region,name:def.name,usedForDecoding:def.active};
      recordingSites.add(group);siteMeshes.push(group);if(def.active)activeAnchors.push(def.point.clone());
    }
    halos.forEach((h,i)=>{h.position.copy(activeAnchors[i]);h.position.x+=.03;recordingSites.add(h);});
    recordingSites.visible=true;
  }
  let head;
  new GLTFLoader().load('./models/head.glb',g=>{
    g.scene.traverse(o=>{if(o.isMesh&&!head)head=new T.Mesh(o.geometry,skin);});
    if(!head){loading.textContent='The head model could not be read. The guided recording is still available.';return;}
    head.geometry.computeBoundingBox();const box=head.geometry.boundingBox;
    const scale=3.5/(box.max.y-box.min.y);head.scale.setScalar(scale);
    const center=box.getCenter(new T.Vector3());head.position.copy(center).multiplyScalar(-scale);
    // Locate the lateral scalp surface on this generic mesh, then move the markers
    // slightly inward. This is not a registration to T12's MRI or an exact cortical map.
    head.updateMatrixWorld(true);
    const ray=new T.Raycaster();
    for(const def of siteDefinitions){
      ray.set(new T.Vector3(2,def.point.y,def.point.z),new T.Vector3(-1,0,0));
      const hit=ray.intersectObject(head,false)[0];
      if(hit)def.point.x=hit.point.x-.065;
    }
    person.add(head);buildRecordingSites();updateSignalRoutes();loading.hidden=true;
  },undefined,()=>{loading.textContent='The 3D head could not load. Open this page with Live Server and refresh.';});
  // Four local microelectrode arrays: two 6v, two 44. No whole-head fibers.
  const haloMaterial=new T.MeshBasicMaterial({color:0xf3ba79,transparent:true,opacity:.38,depthWrite:false});
  const halos=[];
  for(let i=0;i<2;i++){
    const halo=new T.Mesh(new T.RingGeometry(.075,.09,32),haloMaterial);
    halo.rotation.y=Math.PI/2;recordingSites.add(halo);halos.push(halo);
  }
  const base=new T.Mesh(new T.CylinderGeometry(1.38,1.5,.12,64),new T.MeshStandardMaterial({color:0xbac7b8,roughness:.9}));
  base.position.set(-3.6,-1.82,0);study.add(base);
  const computer=createDecodingComputer();study.add(computer.group);
  let lastStage=-1;
  const waves=new T.Group();waves.position.set(4.1,.3,.3);study.add(waves);
  for(let i=0;i<4;i++){const wave=new T.Mesh(new T.TorusGeometry(.24+i*.15,.018,8,48,Math.PI*1.35),glow);wave.rotation.z=-Math.PI*.675;wave.rotation.y=.35;wave.position.x=i*.13;waves.add(wave);}
  const source=new T.Vector3();
  let signalPath,signalTube;
  const capturePaths=[];
  const routeMaterial=new T.LineDashedMaterial({color:0x86a89a,transparent:true,opacity:.6,dashSize:.07,gapSize:.07});
  function updateSignalRoutes(){
    person.updateMatrixWorld(true);
    const anchors=(activeAnchors.length?activeAnchors:siteDefinitions.filter(d=>d.active).map(d=>d.point)).map(p=>person.localToWorld(p.clone()));
    source.copy(anchors[0]).add(anchors[1]).multiplyScalar(.5);
    const outlet=source.clone().add(new T.Vector3(.27,.10,.20));
    signalPath=new T.CatmullRomCurve3([source.clone(),outlet,new T.Vector3(-1.65,1.15,.55),computer.getReceiverPosition()]);
    if(signalTube){signalTube.geometry.dispose();study.remove(signalTube);}
    signalTube=new T.Line(new T.BufferGeometry().setFromPoints(signalPath.getPoints(64)),routeMaterial);signalTube.computeLineDistances();study.add(signalTube);
    capturePaths.length=0;
    anchors.forEach(a=>capturePaths.push(new T.QuadraticBezierCurve3(a.clone().add(new T.Vector3(-.025,0,-.025)),a.clone(),outlet)));
  }
  updateSignalRoutes();
  const particles=[];
  for(let i=0;i<24;i++){const m=new T.Mesh(new T.SphereGeometry(i<16?.04:.025,8,8),glow);study.add(m);particles.push(m);}
  const focusLabels=['01 / Record near the electrodes','02 / Send data to the computer','03 / Read the predicted sentence','04 / Hear the decoded words'];
  const poses=[[-3.1,.3,7.8],[-.9,1.15,12],[1.15,.7,7.3],[1.9,.7,8.3]];
  const targets=[[-3.25,.15,0],[-.75,.2,0],[1.15,.2,.3],[1.8,.2,.3]];
  let yaw=0,pitch=0,drag=null,cutaway=false,headZoom=false,visible=true,animation=0;
  const target=new T.Vector3(),aim=new T.Vector3(-3.25,.15,0);camera.position.set(-3.1,.3,7.8);
  function rotate(v){yaw=T.MathUtils.clamp(yaw+v,-.8,.8);}
  document.querySelector('#view-left').onclick=()=>rotate(-.16);
  document.querySelector('#view-right').onclick=()=>rotate(.16);
  function setHeadZoom(value){headZoom=value;const b=document.querySelector('#view-head');b.setAttribute('aria-pressed',String(value));b.textContent=value?'Return to journey':'Enlarge head';}
  document.querySelector('#view-head').onclick=()=>{setHeadZoom(!headZoom);yaw=0;pitch=0;};
  let cameraStage=Number(shell.dataset.stage||0);
  const stageObserver=new MutationObserver(()=>{const s=Number(shell.dataset.stage||0);if(s!==cameraStage){cameraStage=s;setHeadZoom(false);yaw=0;pitch=0;document.querySelector('#scene-focus').textContent=focusLabels[s];}});
  stageObserver.observe(shell,{attributes:true,attributeFilter:['data-stage']});
  document.querySelector('#view-reset').onclick=()=>{yaw=0;pitch=0;setHeadZoom(false);};
  document.querySelector('#view-implant').onclick=()=>window.dispatchEvent(new Event('request-implant-mode'));
  document.querySelectorAll('[data-implant-part]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.implantPart,info=implant.select(key);
    document.querySelectorAll('[data-implant-part]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    document.querySelector('#part-title').textContent=info.title;
    document.querySelector('#part-description').textContent=info.text;
  }));
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
    const hardware=shell.dataset.mode!=='recording';
    study.visible=!hardware;implant.group.visible=hardware;implant.update(delta,reduced.matches);
    document.querySelector('#scene-focus').textContent=hardware?'Inside the implant':focusLabels[s];
    document.querySelector('.scene-caption > span').textContent=hardware?'NEURALINK · HARDWARE SCHEMATIC':'RESEARCH REPLAY · SIGNAL TO TEXT';
    if(s!==lastStage){setHeadZoom(false);yaw=0;pitch=0;document.querySelector('#scene-focus').textContent=focusLabels[s];}
    const txt=s===0?'':document.querySelector('#partial-text').textContent;
    computer.update({stage:s,text:txt,fraction:f,playing:active,speaking,reducedMotion:reduced.matches,time:now});lastStage=s;
    target.fromArray(targets[s]);
    if(camera.aspect<1&&s===1)target.set(-3.1+4.25*f,.2,0);
    if(headZoom)target.set(-3.6,.65,0);
    if(hardware)target.set(.2,-.1,0);
    aim.lerp(target,reduced.matches?1:1-Math.exp(-delta*4));
    const p=poses[s],distance=p[2]*(camera.aspect<1?1.55:1);
    const dest=new T.Vector3(p[0]+Math.sin(yaw)*distance,p[1]+pitch*distance,Math.cos(yaw)*distance);
    if(camera.aspect<1&&s===1)dest.set(target.x+Math.sin(yaw)*11,.5+pitch*11,Math.cos(yaw)*11);
    if(camera.aspect<1&&s>=2){const d=Math.max(s===3?9.2:8.5,4.8/camera.aspect);dest.set(target.x+Math.sin(yaw)*d,1.1+pitch*d,Math.cos(yaw)*d);}
    if(headZoom){const d=camera.aspect<1?9.2:5.2;dest.set(-3.6+Math.sin(yaw)*d,.65+pitch*d,Math.cos(yaw)*d);}
    if(hardware){const d=camera.aspect<1?10.5:6.5;dest.set(Math.sin(yaw)*d,3.5+pitch*4,Math.cos(yaw)*d);}
    camera.position.lerp(dest,reduced.matches?1:1-Math.exp(-delta*4));camera.lookAt(aim);
    halos.forEach(h=>{h.visible=cutaway||active&&s===0;h.scale.setScalar(active&&s===0&&!reduced.matches?1+.15*Math.sin(f*40):1);});
    particles.forEach((m,i)=>{m.visible=active&&s<=1;if(!m.visible)return;const t=(f*2+i/24)%1;if(s===0){m.position.copy(capturePaths[i%2].getPoint(t));}else m.position.copy(signalPath.getPointAt((f*2+i/24)%1));if(reduced.matches)m.visible=false;});
    waves.visible=s===3;waves.children.forEach((w,i)=>{w.scale.setScalar(speaking&&!reduced.matches?1+.15*Math.sin(now*.008-i):1);});
    renderer.render(scene,camera);
  }
  animation=requestAnimationFrame(frameLoop);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();loading.hidden=false;loading.textContent='The 3D view was interrupted. Refresh to restore it. The recording controls remain available.';});
  window.addEventListener('pagehide',event=>{if(event.persisted)return;cancelAnimationFrame(animation);ro.disconnect();io.disconnect();stageObserver.disconnect();scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of [].concat(o.material))m.dispose();}});computer.texture.dispose();renderer.dispose();});
}
