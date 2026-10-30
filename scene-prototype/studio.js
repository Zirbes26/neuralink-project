import * as T from './vendor/three.module.js';
import {OrbitControls} from './vendor/controls/OrbitControls.js';
import {createImplantDevice} from './implant-device.js';
import {startPartDrag,movePartDrag,nearProjectedSlot} from './drag-space.js';
import {createDecodingComputer} from './decoding-computer.js';
import {loadFaceAvatar} from './face-avatar.js';

const $=s=>document.querySelector(s),world=$('#world'),loading=$('#loading');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;world.append(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color('#fff1e5');scene.fog=new T.Fog('#fff1e5',15,35);
const camera=new T.PerspectiveCamera(40,innerWidth/innerHeight,.05,80);camera.position.set(5,3.5,10);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=2;controls.maxDistance=17;controls.maxPolarAngle=Math.PI*.49;controls.target.set(0,.1,0);
scene.add(new T.HemisphereLight('#fff4e9','#b8a6a1',2.2));
const sun=new T.DirectionalLight('#fff4dc',3.3);sun.position.set(-3,7,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-9;sun.shadow.camera.right=9;sun.shadow.camera.top=8;sun.shadow.camera.bottom=-8;sun.shadow.normalBias=.025;scene.add(sun);
const fill=new T.DirectionalLight('#e6deef',.7);fill.position.set(5,3,-4);scene.add(fill);
const mat=(color,roughness=.7)=>new T.MeshStandardMaterial({color,roughness});
const cream=mat('#f5dfc9'),wood=mat('#d3a886'),indigo=mat('#5b528c'),lilac=mat('#d7c9e7'),peach=mat('#dfad98'),fabric=mat('#778b89'),pants=mat('#42415c');
function mesh(geometry,material,parent=scene,x=0,y=0,z=0){const o=new T.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(w,h,d,material,parent,x,y,z){return mesh(new T.BoxGeometry(w,h,d),material,parent,x,y,z);}
const floor=mesh(new T.PlaneGeometry(100,100),cream,scene,0,-1.65,0);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
const rug=mesh(new T.CylinderGeometry(3.8,3.8,.012,96),mat('#e2d5e7'),scene,0,-1.636,-.5);rug.scale.z=.7;
// A warm studio, with room to move around each object.
const wall=box(30,7,.2,mat('#f1dfd4'),scene,0,1.8,-4.5);wall.castShadow=false;
for(let i=0;i<5;i++)box(.055,4.4,.08,wood,scene,3+i*.3,.6,-4.32);
const windowPanel=box(3.5,2.8,.08,mat('#e9e8f4'),scene,-3.5,1.8,-4.32);windowPanel.castShadow=false;
box(3.65,.09,.15,wood,scene,-3.5,.38,-4.22);box(.07,2.9,.13,wood,scene,-3.5,1.8,-4.21);
const bench=new T.Group();bench.position.set(-2.9,0,1);scene.add(bench);
box(2.9,.16,1.7,wood,bench,0,-.66,0);for(const x of [-1.15,1.15])for(const z of [-.55,.55])box(.075,.9,.075,indigo,bench,x,-1.15,z);
const tray=box(2.4,.025,1.25,lilac,bench,0,-.56,0);tray.receiveShadow=true;
const chair=new T.Group();chair.position.set(0,0,-.6);scene.add(chair);box(1.28,.18,1.2,peach,chair,0,-.73,0);box(1.3,1.45,.16,peach,chair,0,-.13,-.45);for(const x of [-.5,.5])for(const z of [-.4,.4])box(.06,.8,.06,indigo,chair,x,-1.22,z);
// A clothed, seated body supports the original face without modifying its eyes.
const body=new T.Group();body.position.set(0,0,-.6);scene.add(body);
mesh(new T.SphereGeometry(1,40,24),fabric,body,0,-.16,0).scale.set(.68,.63,.34);
mesh(new T.CylinderGeometry(.16,.20,.28,24),mat('#d9b19b'),body,0,.44,0);
for(const side of [-1,1]){
 const arm=mesh(new T.CapsuleGeometry(.15,.57,8,16),fabric,body,side*.57,-.18,.03);arm.rotation.z=side*.12;
 mesh(new T.SphereGeometry(1,20,12),mat('#d9b19b'),body,side*.58,-.62,.08).scale.set(.11,.15,.09);
 const thigh=mesh(new T.CapsuleGeometry(.17,.35,8,16),pants,body,side*.24,-.70,.26);thigh.rotation.x=Math.PI/2;
 const leg=mesh(new T.CapsuleGeometry(.16,.65,8,16),pants,body,side*.24,-1.05,.32);leg.rotation.x=.12;
 mesh(new T.SphereGeometry(1,20,12),pants,body,side*.24,-1.5,.48).scale.set(.19,.10,.30);
}
const desk=new T.Group();desk.position.set(3.1,0,.2);scene.add(desk);box(3.2,.14,1.7,wood,desk,0,-.57,0);for(const x of [-1.25,1.25])for(const z of [-.55,.55])box(.06,1,.06,indigo,desk,x,-1.1,z);
const computer=createDecodingComputer();computer.group.position.set(3.1,.06,-.25);computer.group.scale.setScalar(.48);scene.add(computer.group);
const plant=new T.Group();plant.position.set(-4,-1.65,-3);scene.add(plant);mesh(new T.CylinderGeometry(.30,.22,.5,32),peach,plant,0,.25,0);for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const leaf=mesh(new T.SphereGeometry(1,12,8),mat('#829982'),plant,Math.sin(a)*.2,.8+(i%3)*.15,Math.cos(a)*.2);leaf.scale.set(.13,.5,.06);leaf.rotation.z=Math.sin(a)*.6;}
const implant=createImplantDevice();implant.group.position.set(-2.9,.2,1);implant.group.scale.setScalar(.47);scene.add(implant.group);
const marker=mesh(new T.TorusGeometry(.25,.018,12,64),new T.MeshBasicMaterial({color:'#7868ca',transparent:true,opacity:.8,depthTest:false}),scene,0,1.62,-.6);marker.rotation.x=Math.PI/2;marker.renderOrder=5;marker.visible=false;
const embedded=new T.Vector3(0,1.45,-.6),dropTarget=new T.Vector3(0,1.62,-.6),deviceTray=new T.Vector3(-1.05,1.2,.15);
const route=new T.CatmullRomCurve3([embedded.clone(),new T.Vector3(.8,1.7,-.35),new T.Vector3(2,1.5,-.1),new T.Vector3(2.4,.5,-.1)]);
const line=new T.Line(new T.BufferGeometry().setFromPoints(route.getPoints(80)),new T.LineDashedMaterial({color:'#7868ca',dashSize:.07,gapSize:.08,transparent:true,opacity:.55}));line.computeLineDistances();scene.add(line);line.visible=false;
const dots=[];for(let i=0;i<8;i++)dots.push(mesh(new T.SphereGeometry(.025,10,8),new T.MeshBasicMaterial({color:'#ce6c52'})));
let avatar=null,data=null,phase='build',fraction=0,trialIndex=0,placed=false,seating=0,paused=false,view='room',cameraTween=true,correct=false,dragged=null,dragState=null,pointerId=null;
const ray=new T.Raycaster(),pointer=new T.Vector2(),look=new T.Vector3(),destination=new T.Vector3(),clock=new T.Clock();
const order=['electronics','battery','enclosure'],names={electronics:'electronics',battery:'battery',enclosure:'cover'};
const states=['build','place','connect','signal','decode','words','voice'];
const normalization=text=>text.toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();
function cancelVoice(){if('speechSynthesis' in window)speechSynthesis.cancel();}
function record(){return data?.records[trialIndex];}
function setPhase(next){if(!states.includes(next))return;cancelVoice();phase=next;fraction=0;cameraTween=true;view='room';updateUI();}
function updateUI(message=''){
 document.body.dataset.phase=phase;document.body.dataset.view=view;$('#status').textContent=message;$('#view-room').setAttribute('aria-pressed',String(view==='room'));$('#view-face').setAttribute('aria-pressed',String(view==='face'));
 $('#recording-choice').hidden=!['signal','decode','words','voice'].includes(phase);$('#signal-controls').hidden=!['signal','decode'].includes(phase);
 $('#signal-range').value=Math.round(fraction*1000);$('#signal-percent').textContent=Math.round(fraction*100)+'%';$('#decoded').hidden=!['decode','words','voice'].includes(phase);$('#comparison').hidden=!['words','voice'].includes(phase);
 $('#source-label').textContent=['signal','decode','words','voice'].includes(phase)?'PUBLIC STANFORD RECORDING · SEPARATE FROM NEURALINK':'NEURALINK-INSPIRED HARDWARE · SCHEMATIC';
 for(const li of document.querySelectorAll('#steps li')){li.removeAttribute('aria-current');if(li.dataset.step===(phase==='words'?'decode':phase))li.setAttribute('aria-current','step');}
 const r=record(),next=implant.nextPart(),button=$('#action');button.disabled=false;
 if(phase==='build'){$('#task-title').textContent='Build a path to a voice.';$('#task-copy').textContent=next?`Drag the ${names[next]} onto the ring on the workbench.`:'Three parts. One connection waiting to happen.';button.textContent=next?`Place ${names[next]}`:'Position the implant →';}
 if(phase==='place'){$('#task-title').textContent=placed?'Quietly beneath the surface.':'A small device. A closer connection.';$('#task-copy').textContent=placed?'The housing sits beneath the scalp. Threads extend inward; position and size are illustrative.':'Drag the assembled device onto the marker on the head.';button.textContent=placed?'Connect to the computer →':seating?'Seating the implant…':'Place at the marker';button.disabled=seating>0&&!placed;}
 if(phase==='connect'){$('#task-title').textContent='Make the connection.';$('#task-copy').textContent='Click the computer to pair the illustrated wireless link.';button.textContent='Pair computer';}
 if(phase==='signal'){$('#task-title').textContent='You guide the signal.';$('#task-copy').textContent='Now switch to a separate public research trial. Move the slider to inspect its recorded signal.';$('#signal-label').textContent='Collect the recorded signal';button.textContent='Send it to the decoder →';button.disabled=fraction<1;}
 if(phase==='decode'){$('#task-title').textContent='A prediction takes shape.';$('#task-copy').textContent='Move through the study’s recorded predictions. The model is not running live.';$('#signal-label').textContent='Move through decoding';button.textContent='Reveal the result →';button.disabled=fraction<1;let text='…';for(const p of r.partial)if(p.ms<=fraction*r.durationMs)text=p.text;$('#decoded').textContent=text;}
 if(phase==='words'||phase==='voice'){correct=normalization(r.target)===normalization(r.decoded);$('#decoded').textContent=r.decoded;$('#comparison').textContent=`Prompt: “${r.target}” · ${correct?'Matched the prompt.':'The prediction differs.'}`;$('#task-title').textContent=phase==='voice'?'Let the computer say it.':'Did the words arrive?';$('#task-copy').textContent=phase==='voice'?'The person stays silent. The computer reads the recorded prediction in a synthetic voice.':'The avatar’s response is illustrative, not the participant’s recorded reaction.';button.textContent=phase==='voice'?'Play computer voice':'Give it a voice →';}
 button.disabled ||= !avatar||(!data&&['connect','signal','decode','words','voice'].includes(phase));
}
function startSeating(){placed=false;seating=.001;marker.visible=false;updateUI();}
$('#action').addEventListener('click',()=>{
 if(phase==='build'){const next=implant.nextPart();if(next)implant.fit(next);else{setPhase('place');implant.group.position.copy(deviceTray);}updateUI();}
 else if(phase==='place'){if(placed)setPhase('connect');else startSeating();}
 else if(phase==='connect')setPhase('signal');
 else if(phase==='signal'&&fraction===1)setPhase('decode');
 else if(phase==='decode'&&fraction===1)setPhase('words');
 else if(phase==='words')setPhase('voice');
 else if(phase==='voice'){cancelVoice();if(!('speechSynthesis' in window)){updateUI('Speech synthesis is unavailable in this browser.');return;}const u=new SpeechSynthesisUtterance(record().decoded);u.lang='en-US';u.onstart=()=>document.body.dataset.speaking='true';u.onend=()=>document.body.dataset.speaking='false';speechSynthesis.speak(u);updateUI('Audio comes from the computer; the avatar has no lip animation.');}
});
$('#signal-range').addEventListener('input',e=>{fraction=Number(e.target.value)/1000;updateUI();});
$('#trial').addEventListener('change',e=>{trialIndex=Number(e.target.value);setPhase('signal');});
$('#motion').addEventListener('click',()=>{paused=!paused;$('#motion').textContent=paused?'Resume movement':'Pause movement';$('#motion').setAttribute('aria-pressed',String(paused));});
for(const key of ['room','face'])$('#view-'+key).addEventListener('click',()=>{view=key;cameraTween=true;updateUI();});
$('#restart').addEventListener('click',()=>{if(pointerId!==null)endDrag({pointerId},true);implant.resetAssembly();implant.group.position.set(-2.9,.2,1);implant.group.scale.setScalar(.47);placed=false;seating=0;correct=false;document.body.dataset.speaking='false';setPhase('build');});
$('#sources-open').onclick=()=>$('#sources').showModal();$('#sources-close').onclick=()=>$('#sources').close();
function pointerRay(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);camera.updateMatrixWorld(true);implant.group.updateMatrixWorld(true);ray.setFromCamera(pointer,camera);}
function pick(){
 if(phase==='build'){let o=ray.intersectObjects(implant.pickables(),true)[0]?.object;while(o&&!o.userData.assemblyPart)o=o.parent;return o?.userData.assemblyPart||null;}
 if(phase==='place'&&!placed&&!seating)return ray.intersectObject(implant.group,true).length?'device':null;
 if(phase==='connect')return ray.intersectObject(computer.group,true).length?'computer':null;
 return null;
}
renderer.domElement.addEventListener('pointerdown',e=>{
 if(pointerId!==null||e.button!==0)return;pointerRay(e);const key=pick();
 if(key==='computer'){setPhase('signal');return;}
 if(!key){cameraTween=false;return;}
 const whole=key==='device';dragState=startPartDrag(ray.ray,camera,whole?scene:implant.group,whole?implant.group.position:implant.parts[key].objects[0].position);
 if(!dragState)return;dragged=key;pointerId=e.pointerId;controls.enabled=false;if(!whole)implant.beginDrag(key);renderer.domElement.setPointerCapture(e.pointerId);e.stopImmediatePropagation();
},true);
renderer.domElement.addEventListener('pointermove',e=>{
 if(pointerId!==null&&pointerId!==e.pointerId)return;pointerRay(e);
 if(!dragged){renderer.domElement.style.cursor=pick()?'grab':'default';return;}
 const whole=dragged==='device',p=movePartDrag(ray.ray,dragState,whole?scene:implant.group);if(p){if(whole)implant.group.position.copy(p);else implant.move(dragged,p);}renderer.domElement.style.cursor='grabbing';
});
function endDrag(e,cancelled=false){
 if(pointerId!==e.pointerId)return;const key=dragged;if(key){const whole=key==='device',near=nearProjectedSlot(camera,whole?scene:implant.group,whole?implant.group.position:implant.parts[key].objects[0].position,whole?dropTarget:implant.slots[key],innerWidth,innerHeight);let accepted=false;
 if(!cancelled){if(whole&&near){startSeating();accepted=true;}else if(!whole)accepted=implant.release(key,near);}implant.cancelDrag();updateUI(accepted?'Placed.':cancelled?'Drag cancelled.':'Move closer to the ring, then release.');}
 dragged=null;dragState=null;const id=pointerId;pointerId=null;controls.enabled=true;if(renderer.domElement.hasPointerCapture(id))renderer.domElement.releasePointerCapture(id);renderer.domElement.style.cursor='default';
}
renderer.domElement.addEventListener('pointerup',e=>endDrag(e));renderer.domElement.addEventListener('pointercancel',e=>endDrag(e,true));renderer.domElement.addEventListener('lostpointercapture',e=>endDrag(e,true));
const cameraPoses={build:[1.8,3.1,9.8,-1,.1,.3],place:[3,2.2,6,0,.7,-.3],connect:[5,2.5,7,1.2,.2,0],signal:[4,2.8,8,1,.3,0],decode:[4.5,1.8,5.2,2.2,.3,0],words:[3.7,2,6.5,1.5,.4,0],voice:[3,1.7,6.6,.7,.6,-.3]};
function frame(){requestAnimationFrame(frame);const delta=Math.min(clock.getDelta(),.05),time=clock.elapsedTime,rate=reduced.matches?1:1-Math.exp(-delta*4);implant.update(delta,reduced.matches);
 marker.visible=phase==='place'&&!placed&&!seating;
 if(phase==='place'&&!placed&&!seating&&!dragged){implant.group.scale.lerp(new T.Vector3().setScalar(.23),rate);implant.group.position.lerp(deviceTray,rate);}
 if(seating>0&&!placed){seating=Math.min(1,seating+(reduced.matches?1:delta/1.2));implant.group.scale.lerp(new T.Vector3().setScalar(.075),rate);implant.group.position.lerp(embedded,rate);if(seating===1){placed=true;updateUI();}}
 const faceHappy=phase==='voice'&&correct;avatar?.update(delta,{happy:faceHappy,paused,reduced:reduced.matches});document.body.dataset.expression=faceHappy?'happy':'neutral';
 line.visible=['signal','decode','words','voice'].includes(phase);
 dots.forEach((o,i)=>{o.visible=['signal','decode'].includes(phase);o.position.copy(route.getPointAt(Math.min(1,Math.max(0,fraction-i*.027))));});
 const r=record();let text='';if(phase==='decode')for(const p of r?.partial||[])if(p.ms<=fraction*r.durationMs)text=p.text;if(['words','voice'].includes(phase))text=r?.decoded||'';
 computer.update({stage:phase==='voice'?3:phase==='words'?2:['decode','signal'].includes(phase)?1:0,text,fraction,playing:false,speaking:document.body.dataset.speaking==='true',reducedMotion:reduced.matches,time:time*1000});
 if(cameraTween&&!dragged){let p=cameraPoses[phase];if(view==='face')p=[.15,1.05,2.9,0,1,-.6];destination.set(p[0],p[1],p[2]);look.set(p[3],p[4],p[5]);if(innerWidth<700){if(view==='face'){destination.z=3.7;look.y=.8;}else{if(phase==='build'){destination.set(-2.7,2.1,7.5);look.set(-2.9,.15,1);}else if(phase==='place'){destination.set(1,2,6);look.set(0,.5,-.3);}else if(phase==='decode'||phase==='words'){destination.set(3.5,1.7,6);look.set(3,.2,0);}else{destination.set(p[3]+.5,2.5,9);look.y=.2;}}}
 camera.position.lerp(destination,rate);controls.target.lerp(look,rate);}
 controls.update();renderer.render(scene,camera);
}
frame();
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);cameraTween=true;});
Promise.allSettled([loadFaceAvatar(renderer).then(a=>{avatar=a;scene.add(a.group);}),fetch('./data/trials.json').then(r=>{if(!r.ok)throw Error('Recording data could not load');return r.json();}).then(d=>{data=d;d.records.forEach((r,i)=>{const o=document.createElement('option');o.value=i;o.textContent=r.id+' · '+r.target;$('#trial').append(o);});})]).then(results=>{
 const errors=results.filter(r=>r.status==='rejected');if(errors.length){loading.textContent='A studio asset could not load. Open with Live Server and refresh.';console.error(errors.map(r=>r.reason));}else loading.hidden=true;updateUI();
});
window.addEventListener('pagehide',()=>{cancelVoice();avatar?.dispose();});
updateUI();
