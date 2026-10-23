import * as T from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import {startPartDrag,movePartDrag,nearProjectedSlot} from './drag-space.js';
import {createImplantPlacement} from './implant-placement.js';
import {createPartExplorer} from './part-explorer.js';
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
  const placement=createImplantPlacement();scene.add(placement.group);
  const explorer=createPartExplorer();scene.add(explorer.group);let exploring=false;
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
    // Find the crown on the generic mesh, independently of Stanford's lateral arrays.
    const crownRay=new T.Raycaster(new T.Vector3(.35,3,.15),new T.Vector3(0,-1,0));
    const crownHit=crownRay.intersectObject(head,false)[0];
    person.add(head);person.updateMatrixWorld(true);
    if(crownHit)placement.setTarget(person.localToWorld(crownHit.point.clone().add(new T.Vector3(0,.15,0))));
    buildRecordingSites();updateSignalRoutes();loading.hidden=true;syncBuild();
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
  function chooseExploration(key){
    const info=explorer.select(key);if(!info)return;
    document.querySelector('#explorer-title').textContent=info.title;document.querySelector('#explorer-text').textContent=info.text;
    document.querySelectorAll('[data-explore-part]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.explorePart===key)));
    yaw=0;pitch=0;
  }
  function setExploring(value){
    if(activePointer!==null)finishDrag({pointerId:activePointer},true);
    exploring=value;document.querySelector('#part-explorer').hidden=!value;
    document.querySelector('#explore-open').setAttribute('aria-expanded',String(value));
    shell.dataset.exploring=String(value);yaw=0;pitch=0;
    if(value){chooseExploration(explorer.selected);document.querySelector('[data-explore-part="'+explorer.selected+'"]').focus({preventScroll:true});}
    else document.querySelector('#explore-open').focus({preventScroll:true});
  }
  document.querySelector('#explore-open').addEventListener('click',()=>setExploring(!exploring));
  document.querySelector('#explore-close').addEventListener('click',()=>setExploring(false));
  document.querySelectorAll('[data-explore-part]').forEach(b=>b.addEventListener('click',()=>chooseExploration(b.dataset.explorePart)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&exploring)setExploring(false);});
  document.querySelectorAll('[data-implant-part]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.implantPart,info=implant.select(key);
    document.querySelectorAll('[data-implant-part]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    document.querySelector('#part-title').textContent=info.title;
    document.querySelector('#part-description').textContent=info.text;
  }));
  const raycaster=new T.Raycaster(),pointer=new T.Vector2();
  let movingPart=null,partDrag=null,activePointer=null,inside=false,previousPlacement='build';
  const buildStatus=document.querySelector('#assembly-status');
  const names={electronics:'electronics',battery:'battery',enclosure:'cover'};
  function syncBuild(message=''){
    const next=implant.nextPart(),done=!next;
    if(buildStatus)buildStatus.textContent=message||(placement.phase==='seating'?'Seating the implant beneath the scalp…':placement.phase==='connected'?'Connected. Continue to a separately sourced research recording.':placement.phase==='link'?'Click the computer to pair the wireless connection.':placement.phase==='placed'?'Implant seated beneath the scalp. See inside, or connect to the computer.':placement.phase==='place'?'Drag the assembled implant onto the purple marker on the head.':done?(placement.ready?'Assembly complete! Continue to position the implant.':'Assembly complete. Waiting for the head model…'):`${implant.count}/3 assembled · Drag the ${names[next]} onto the purple ring.`);
    const place=document.querySelector('#assembly-place');if(place){place.disabled=['seating','placed','connected'].includes(placement.phase)||done&&!placement.ready;place.textContent=placement.phase==='link'?'Pair computer':['seating','placed','connected'].includes(placement.phase)?'Implant seated':placement.phase==='place'?'Place at marker':done?'Continue → Position implant':`Place ${names[next]}`;}
    const replay=document.querySelector('#assembly-replay');if(replay){replay.hidden=!['placed','connected'].includes(placement.phase);replay.textContent=placement.phase==='connected'?'Open separate research replay →':'Connect to computer →';}
    const inspect=document.querySelector('#view-inside');inspect.hidden=!['seating','placed','link','connected'].includes(placement.phase);
    document.querySelector('#placement-note').hidden=placement.phase==='build';
    if(done){document.querySelector('#part-title').textContent=['seating','placed','link','connected'].includes(placement.phase)?'Inside the head':placement.phase==='place'?'Find the marked spot':'Your implant is assembled';document.querySelector('#part-description').textContent=['seating','placed','link','connected'].includes(placement.phase)?'The housing sits beneath the scalp; fine electrode threads extend inward. Use See inside to inspect the schematic.':placement.phase==='place'?'Move the complete device onto the purple ring.':'Next, position the complete implant on a generic head.';}
    if(next){const info=implant.select(next);document.querySelector('#part-title').textContent=info.title;document.querySelector('#part-description').textContent={electronics:'Processes recorded neural signals.',battery:'Powers the implant and recharges wirelessly.',enclosure:'Protects the components inside a sealed housing.'}[next];}
    document.querySelectorAll('[data-implant-part]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.implantPart===next)));
  }
  document.querySelector('#assembly-place')?.addEventListener('click',()=>{
    const key=implant.nextPart();
    if(key)implant.fit(key);
    else if(placement.phase==='build'){if(placement.begin(implant.count===3)){yaw=0;pitch=0;implant.group.position.copy(placement.tray);}}
    else if(placement.phase==='place')placement.drop(true);
    else if(placement.phase==='link')placement.connect();
    syncBuild();
  });
  document.querySelector('#assembly-replay')?.addEventListener('click',()=>{
    if(placement.phase==='placed'){placement.beginLink();yaw=0;pitch=0;}
    else if(placement.phase==='connected')document.querySelector('#mode-recording').click();
    syncBuild();
  });
  document.querySelector('#view-inside').addEventListener('click',()=>{inside=!inside;document.querySelector('#view-inside').setAttribute('aria-pressed',String(inside));document.querySelector('#view-inside').textContent=inside?'Hide inside':'See inside';});
  document.querySelector('#assembly-reset')?.addEventListener('click',()=>{if(activePointer!==null)finishDrag({pointerId:activePointer},true);movingPart=null;partDrag=null;placement.reset();inside=false;document.querySelector('#view-inside').setAttribute('aria-pressed','false');document.querySelector('#view-inside').textContent='See inside';implant.group.position.set(0,0,0);implant.group.scale.setScalar(1);implant.resetAssembly();yaw=0;pitch=0;syncBuild();});
  function pointerRay(e){const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);camera.updateMatrixWorld(true);implant.group.updateMatrixWorld(true);explorer.group.updateMatrixWorld(true);raycaster.setFromCamera(pointer,camera);}
  function pickPart(){
    if(exploring){
      let object=raycaster.intersectObjects(explorer.pickables(),true)[0]?.object;
      while(object&&!object.userData.explorePart)object=object.parent;
      return object?'explore-'+object.userData.explorePart:null;
    }
    if(shell.dataset.mode==='recording')return null;
    if(['seating','placed','connected'].includes(placement.phase))return null;
    if(placement.phase==='link')return raycaster.intersectObject(computer.group,true).length?'pair-computer':null;
    if(placement.phase==='place')return raycaster.intersectObject(implant.group,true).length?'whole-implant':null;
    const hit=raycaster.intersectObjects(implant.pickables(),true)[0];
    let object=hit?.object;
    while(object&&!object.userData.assemblyPart)object=object.parent;
    return object?.userData.assemblyPart||null;
  }
  renderer.domElement.style.touchAction='none';
  renderer.domElement.addEventListener('pointerdown',e=>{
    if(activePointer!==null||e.button!==0)return;
    pointerRay(e);const key=pickPart();
    if(key?.startsWith('explore-')){chooseExploration(key.slice(8));return;}
    if(key==='pair-computer'){placement.connect();syncBuild();return;}
    if(key){
      const whole=key==='whole-implant';
      partDrag=startPartDrag(raycaster.ray,camera,whole?scene:implant.group,whole?implant.group.position:implant.parts[key].objects[0].position);
      if(partDrag&&(whole?placement.startDrag():implant.beginDrag(key))){movingPart=key;renderer.domElement.style.cursor='grabbing';}
    }else drag={x:e.clientX,y:e.clientY};
    activePointer=e.pointerId;renderer.domElement.setPointerCapture(e.pointerId);e.preventDefault();
  });
  renderer.domElement.addEventListener('pointermove',e=>{
    if(activePointer!==null&&activePointer!==e.pointerId)return;
    pointerRay(e);
    if(movingPart){const whole=movingPart==='whole-implant';const point=movePartDrag(raycaster.ray,partDrag,whole?scene:implant.group);if(point){if(whole)implant.group.position.copy(point);else implant.move(movingPart,point);}return;}
    if(!drag){renderer.domElement.style.cursor=pickPart()?'grab':'default';return;}
    rotate((e.clientX-drag.x)*.004);pitch=T.MathUtils.clamp(pitch+(e.clientY-drag.y)*.003,-.35,.35);drag={x:e.clientX,y:e.clientY};
  });
  function finishDrag(e,cancelled=false){
    if(activePointer!==e.pointerId)return;
    if(movingPart){
      const key=movingPart,next=implant.nextPart(),rect=renderer.domElement.getBoundingClientRect();
      const whole=key==='whole-implant';
      const near=nearProjectedSlot(camera,whole?scene:implant.group,whole?implant.group.position:implant.parts[key].objects[0].position,whole?placement.target:implant.slots[key],rect.width,rect.height);
      const fitted=!cancelled&&(whole?placement.drop(near):implant.release(key,near));
      placement.cancel();implant.cancelDrag();movingPart=null;partDrag=null;
      syncBuild(cancelled?'Drag cancelled. Try again.':fitted?'':whole?'Move the complete device closer to the head marker.':key!==next?`First place the ${names[next]}. Loose parts return to the tray.`:'Move the centre of the component onto the purple ring.');
    }
    drag=null;activePointer=null;renderer.domElement.style.cursor='default';
    if(renderer.domElement.hasPointerCapture(e.pointerId))renderer.domElement.releasePointerCapture(e.pointerId);
  }
  renderer.domElement.addEventListener('pointerup',e=>finishDrag(e));
  renderer.domElement.addEventListener('pointercancel',e=>finishDrag(e,true));
  renderer.domElement.addEventListener('lostpointercapture',e=>finishDrag(e,true));
  new MutationObserver(()=>{if(shell.dataset.mode==='recording'&&exploring)setExploring(false);if(shell.dataset.mode==='recording'&&activePointer!==null)finishDrag({pointerId:activePointer},true);}).observe(shell,{attributes:true,attributeFilter:['data-mode']});
  syncBuild();
  function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  const ro=new ResizeObserver(resize);ro.observe(host);resize();
  const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});io.observe(host);
  let previous=0;
  function frameLoop(now){animation=requestAnimationFrame(frameLoop);if(!visible||document.hidden){previous=now;return;}const delta=Math.min((now-previous)/1000,.05);previous=now;
    const s=Number(shell.dataset.stage||0),active=shell.dataset.playing==='true',speaking=shell.dataset.speaking==='true';
    const f=Number(document.querySelector('#stage-progress').value||0);
    const hardware=shell.dataset.mode!=='recording';
    const positioning=hardware&&placement.phase!=='build';
    study.visible=!hardware||positioning;person.visible=true;computer.group.visible=!hardware||['link','connected'].includes(placement.phase);base.visible=true;recordingSites.visible=!hardware;
    implant.group.visible=hardware;implant.update(delta,reduced.matches);placement.update(implant.group,delta,reduced.matches);
    if(previousPlacement!==placement.phase){previousPlacement=placement.phase;syncBuild();}
    const transparentHead=hardware&&inside&&placement.phase!=='build';
    if(skin.transparent!==transparentHead){skin.transparent=transparentHead;skin.depthWrite=!transparentHead;skin.needsUpdate=true;}skin.opacity=transparentHead?.12:1;
    const linking=positioning&&['link','connected'].includes(placement.phase);
    placement.group.visible=positioning&&placement.phase==='place';
    if(signalTube)signalTube.visible=!hardware;
    document.querySelector('.scene-hint').textContent=positioning?(placement.phase!=='place'?'Drag empty space to rotate · Housing beneath the scalp':'Drag the complete implant onto the purple marker'):'Drag a component to build · Drag empty space to rotate';
    shell.dataset.workbench=placement.phase;
    document.querySelector('#scene-focus').textContent=hardware?(placement.phase==='build'?'01 / Build the implant':placement.phase==='place'?'02 / Position the implant':placement.phase==='link'?'03 / Click the computer':placement.phase==='connected'?'Wireless connection ready':'Implant beneath the scalp'):focusLabels[s];
    document.querySelector('.scene-caption > span').textContent=hardware?'NEURALINK · HARDWARE SCHEMATIC':'RESEARCH REPLAY · SIGNAL TO TEXT';
    if(s!==lastStage){setHeadZoom(false);yaw=0;pitch=0;document.querySelector('#scene-focus').textContent=focusLabels[s];}
    const txt=s===0?'':document.querySelector('#partial-text').textContent;
    computer.update({stage:s,text:txt,fraction:f,playing:active,speaking,reducedMotion:reduced.matches,time:now});lastStage=s;
    target.fromArray(targets[s]);
    if(camera.aspect<1&&s===1)target.set(-3.1+4.25*f,.2,0);
    if(headZoom)target.set(-3.6,.65,0);
    if(hardware)target.set(linking?-1.1:positioning?-2.7:.2,positioning?.35:-.1,0);
    aim.lerp(target,reduced.matches?1:1-Math.exp(-delta*4));
    const p=poses[s],distance=p[2]*(camera.aspect<1?1.55:1);
    const dest=new T.Vector3(p[0]+Math.sin(yaw)*distance,p[1]+pitch*distance,Math.cos(yaw)*distance);
    if(camera.aspect<1&&s===1)dest.set(target.x+Math.sin(yaw)*11,.5+pitch*11,Math.cos(yaw)*11);
    if(camera.aspect<1&&s>=2){const d=Math.max(s===3?9.2:8.5,4.8/camera.aspect);dest.set(target.x+Math.sin(yaw)*d,1.1+pitch*d,Math.cos(yaw)*d);}
    if(headZoom){const d=camera.aspect<1?9.2:5.2;dest.set(-3.6+Math.sin(yaw)*d,.65+pitch*d,Math.cos(yaw)*d);}
    if(hardware){const d=linking?(camera.aspect<1?Math.max(12,8/camera.aspect):11):positioning?(camera.aspect<1?Math.max(10,5.5/camera.aspect):8):(camera.aspect<1?10.5:6.5);dest.set((linking?-1.1:positioning?-2.7:0)+Math.sin(yaw)*d,(positioning?3:3.5)+pitch*4,Math.cos(yaw)*d);}
    if(!movingPart&&!exploring){camera.position.lerp(dest,reduced.matches?1:1-Math.exp(-delta*4));camera.lookAt(aim);}
    halos.forEach(h=>{h.visible=cutaway||active&&s===0;h.scale.setScalar(active&&s===0&&!reduced.matches?1+.15*Math.sin(f*40):1);});
    particles.forEach((m,i)=>{m.visible=!hardware&&active&&s<=1;if(!m.visible)return;const t=(f*2+i/24)%1;if(s===0){m.position.copy(capturePaths[i%2].getPoint(t));}else m.position.copy(signalPath.getPointAt((f*2+i/24)%1));if(reduced.matches)m.visible=false;});
    waves.visible=!hardware&&s===3;waves.children.forEach((w,i)=>{w.scale.setScalar(speaking&&!reduced.matches?1+.15*Math.sin(now*.008-i):1);});
    document.querySelector('#explore-open').hidden=!hardware;
    explorer.group.visible=exploring&&hardware;
    if(exploring&&hardware){
      study.visible=false;implant.group.visible=false;placement.group.visible=false;
      explorer.update(delta,now,reduced.matches);
      const look=explorer.group.localToWorld(explorer.focus.clone());
      const d=camera.aspect<1?Math.max(6.5,3.5/camera.aspect):4.8;
      const destination=new T.Vector3(look.x+Math.sin(yaw)*d,look.y+1.8+pitch*3,Math.cos(yaw)*d);
      camera.position.lerp(destination,reduced.matches?1:1-Math.exp(-delta*5));camera.lookAt(look);camera.updateMatrixWorld(true);
      document.querySelector('#scene-focus').textContent='Tap a part. Discover its role.';
      document.querySelector('.scene-caption > span').textContent='IMPLANT EXPLORER';
      document.querySelectorAll('[data-explore-part]').forEach((button,index)=>{
        // A stable label rail stays tappable while the camera moves between parts.
        button.style.left=Math.max(8,host.clientWidth-116)+'px';
        button.style.top=((camera.aspect<1?145:105)+index*38)+'px';
      });
    }
    renderer.render(scene,camera);
  }
  animation=requestAnimationFrame(frameLoop);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();loading.hidden=false;loading.textContent='The 3D view was interrupted. Refresh to restore it. The recording controls remain available.';});
  window.addEventListener('pagehide',event=>{if(event.persisted)return;cancelAnimationFrame(animation);ro.disconnect();io.disconnect();stageObserver.disconnect();scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of [].concat(o.material))m.dispose();}});computer.texture.dispose();renderer.dispose();});
}
