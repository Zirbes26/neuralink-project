import {characters} from './characters.js';
import * as T from '../../vendor/three/three.module.js';
import {OrbitControls} from '../../vendor/three/controls/OrbitControls.js';
import {createImplantDevice} from './implant-device.js';
import {startPartDrag,movePartDrag,nearProjectedSlot} from './drag-space.js';
import {createDecodingComputer} from './decoding-computer.js';
import {loadFaceAvatar} from './rocketbox-avatar.js';
import {createPatientChair} from './patient-chair.js';
import {addRoomDetails} from './room-details.js';
import {createNarrativeSpeech} from './narrative-speech.js';

const $=s=>document.querySelector(s),world=$('#world'),loading=$('#loading');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.localClippingEnabled=true;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;world.append(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color('#fff1e5');scene.fog=new T.Fog('#fff1e5',15,35);
const camera=new T.PerspectiveCamera(40,innerWidth/innerHeight,.05,80);camera.position.set(5,3.5,10);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=2;controls.maxDistance=17;controls.maxPolarAngle=Math.PI*.49;controls.target.set(0,.1,0);
scene.add(new T.HemisphereLight('#fff4e9','#b8a6a1',2.2));
const sun=new T.DirectionalLight('#fff4dc',3.3);sun.position.set(-3,7,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-9;sun.shadow.camera.right=9;sun.shadow.camera.top=8;sun.shadow.camera.bottom=-8;sun.shadow.normalBias=.025;scene.add(sun);
const fill=new T.DirectionalLight('#e6deef',.7);fill.position.set(5,3,-4);scene.add(fill);
const hemi=scene.children.find(o=>o.isHemisphereLight);
function applySceneTheme(){const dark=document.documentElement.dataset.theme==='dark';scene.background.set(dark?'#211d30':'#fff1e5');scene.fog.color.copy(scene.background);sun.intensity=dark?2.2:3.3;if(hemi)hemi.intensity=dark?1.8:2.2;}
const themeObserver=new MutationObserver(applySceneTheme);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});applySceneTheme();
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
const patientBody=createPatientChair();scene.add(patientBody.group);
const desk=new T.Group();desk.position.set(3.1,0,.2);scene.add(desk);box(3.2,.14,1.7,wood,desk,0,-.57,0);for(const x of [-1.25,1.25])for(const z of [-.55,.55])box(.06,1,.06,indigo,desk,x,-1.1,z);
const computer=createDecodingComputer();computer.group.position.set(3.1,.06,-.25);computer.group.scale.setScalar(.48);scene.add(computer.group);
const plant=new T.Group();plant.position.set(-4,-1.65,-3);scene.add(plant);mesh(new T.CylinderGeometry(.30,.22,.5,32),peach,plant,0,.25,0);for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const leaf=mesh(new T.SphereGeometry(1,12,8),mat('#829982'),plant,Math.sin(a)*.2,.8+(i%3)*.15,Math.cos(a)*.2);leaf.scale.set(.13,.5,.06);leaf.rotation.z=Math.sin(a)*.6;}
addRoomDetails(scene);
const implant=createImplantDevice();implant.group.position.set(-2.9,.2,1);implant.group.scale.setScalar(.47);scene.add(implant.group);
const marker=mesh(new T.TorusGeometry(.25,.018,12,64),new T.MeshBasicMaterial({color:'#7868ca',transparent:true,opacity:.8,depthTest:false}),scene,0,1.62,-.6);marker.rotation.x=Math.PI/2;marker.renderOrder=5;marker.visible=false;
const embedded=new T.Vector3(0,1.22,-.6),dropTarget=new T.Vector3(0,1.62,-.6),deviceTray=new T.Vector3(-1.05,1.2,.15);
const route=new T.CatmullRomCurve3([embedded.clone(),new T.Vector3(.8,1.7,-.35),new T.Vector3(2,1.5,-.1),new T.Vector3(2.4,.5,-.1)]);
const line=new T.Line(new T.BufferGeometry().setFromPoints(route.getPoints(80)),new T.LineDashedMaterial({color:'#7868ca',dashSize:.07,gapSize:.08,transparent:true,opacity:.55}));line.computeLineDistances();scene.add(line);line.visible=false;
const dots=[];for(let i=0;i<8;i++)dots.push(mesh(new T.SphereGeometry(.025,10,8),new T.MeshBasicMaterial({color:'#ce6c52'})));
let playbackDuration=0;
let voiceRun=0,missionShown=false;
let avatar=null,data=null,phase='meet',fraction=0,trialIndex=0,placed=false,seating=0,paused=false,view='room',cameraTween=true,correct=false,dragged=null,dragState=null,pointerId=null;
const ray=new T.Raycaster(),pointer=new T.Vector2(),look=new T.Vector3(),destination=new T.Vector3(),clock=new T.Clock();
const order=['electronics','battery','enclosure'],names={electronics:'electronics',battery:'battery',enclosure:'cover'};
const states=['meet','listening','respond','explaining','build','prepare','place','connect','signal','words','voice'];
const normalization=text=>text.toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();
const characterId = new URL(import.meta.url).searchParams.get('character') || 'blue-uniform';
const selectedCharacter = characters.find(character => character.id === characterId);
const dialogue=createNarrativeSpeech({voiceGender:selectedCharacter?.voiceGender,onLine:(text,kind)=>{$('#dialogue-line').textContent=text;$('#dialogue-speaker').textContent=kind==='patient'?'ALEX':'YOU';},onSpeaking:value=>document.body.dataset.patientSpeaking=String(value),onFallback:()=>{$('#status').textContent='Audio is unavailable here. Follow the subtitles, or skip the dialogue.';}});
function cancelVoice(){voiceRun++;dialogue.cancel();if('speechSynthesis' in window)speechSynthesis.cancel();document.body.dataset.speaking='false';}
async function patientOpening(){
 setPhase('listening');
 const done=await dialogue.play([{text:'I want to tell you something.'}],'patient');
 if(done&&phase==='listening')setPhase('respond');
}
async function yourReply(){
 setPhase('explaining');
 const done=await dialogue.play([{text:'Let’s explore how it works.'}],'guide');
 if(done&&phase==='explaining')setPhase('build');
}


function record(){return data?.records[trialIndex];}
function setPhase(next){if(!states.includes(next))return;cancelVoice();phase=next;fraction=0;playbackDuration=0;cameraTween=true;view='room';updateUI();}
function updateUI(message=''){
 document.body.dataset.phase=phase;document.body.dataset.view=view;
 $('#placement-open').hidden=!['prepare','place'].includes(phase);
 const conversational=['meet','listening','respond','explaining'].includes(phase);$('#dialogue').hidden=!conversational;$('#skip-conversation').hidden=!conversational;$('#clinical-note').hidden=conversational;
 if(phase==='meet'){$('#dialogue-speaker').textContent='MEET ALEX';$('#dialogue-line').textContent='A fictional person living with ALS who can still speak with difficulty.';}$('#status').textContent=message;$('#view-face').setAttribute('aria-pressed',String(view==='face'));
 $('#recording-choice').hidden=!['signal','words','voice'].includes(phase);$('#signal-controls').hidden=!['signal'].includes(phase);
 $('#signal-progress').value=fraction;$('#decoded').hidden=!['signal','words','voice'].includes(phase);$('#comparison').hidden=!['words','voice'].includes(phase);
 $('#source-label').textContent=['signal','words','voice'].includes(phase)?'PUBLIC STANFORD RECORDING · SEPARATE FROM NEURALINK':conversational?'FICTIONAL CONVERSATION · ONE EXPERIENCE OF ALS':'INVESTIGATIONAL BCI · EDUCATIONAL SCHEMATIC';
 const r=record(),next=implant.nextPart(),button=$('#action');button.disabled=false;
 if(conversational){
  $('#task-title').textContent=phase==='meet'?'A conversation starts with listening.':phase==='respond'?'There is time to listen.':'Stay in the conversation.';
  $('#task-copy').textContent=phase==='meet'?'Alex has something to say. Take a moment to listen.':phase==='respond'?'Choose your reply.':'Use the subtitles to follow the exchange. Audio and mouth movements are synthetic.';
  button.textContent=phase==='meet'?'Listen to Alex':phase==='respond'?'Let’s explore how it works.':'Speaking…';
  button.disabled=['listening','explaining'].includes(phase);
 }
 if(phase==='prepare'){$('#task-title').textContent='Where does it connect?';$('#task-copy').textContent='Open the placement diagram to explore the speech motor cortex, then position the implant on the head.';button.textContent='Position the implant →';}
 if(phase==='build'){$('#task-title').textContent='Build a path to a voice.';$('#task-copy').textContent=next?`Drag the ${names[next]} onto the ring on the workbench.`:'Three parts. One connection waiting to happen.';button.textContent=next?`Place ${names[next]}`:'Reveal the placement schematic →';}
 if(phase==='place'){$('#task-title').textContent=placed?'Quietly beneath the surface.':'A small device. A closer connection.';$('#task-copy').textContent=placed?'The housing sits beneath the scalp. Threads extend inward; position and size are illustrative.':'Drag the assembled device onto the marker on the head.';button.textContent=placed?'Connect to the computer →':seating?'Seating the implant…':'Place at the marker';button.disabled=seating>0&&!placed;}
 if(phase==='connect'){$('#task-title').textContent='Make the connection.';$('#task-copy').textContent='Click the computer to pair the illustrated wireless link.';button.textContent='Pair computer';}
 if(phase==='signal'){$('#task-title').textContent='From signal to words.';$('#task-copy').textContent='Send the recorded signal to the computer and watch the prediction appear.';button.textContent=playbackDuration?'Turning signals into words…':'Send signal → Reveal words';button.disabled=playbackDuration>0;}
 if(phase==='words'||phase==='voice'){correct=normalization(r.target)===normalization(r.decoded);$('#decoded').textContent=r.decoded;$('#comparison').textContent=`Prompt: “${r.target}” · ${correct?'Matched the prompt.':'The prediction differs.'}`;$('#task-title').textContent=phase==='voice'?'Let the computer say it.':'Did the words arrive?';$('#task-copy').textContent=phase==='voice'?'The person stays silent. The computer reads the recorded prediction in a synthetic voice.':'The avatar’s response is illustrative, not the participant’s recorded reaction.';button.textContent=phase==='voice'?'Play computer voice':'Give it a voice →';}
 button.disabled ||= !avatar||(!data&&['connect','signal','words','voice'].includes(phase));
}
function startSeating(){implant.group.visible=true;placed=false;seating=.001;marker.visible=false;updateUI();}
$('#action').addEventListener('click',()=>{
 if(phase==='meet'){patientOpening();return;}
 if(phase==='respond'){yourReply();return;}
 if(phase==='prepare'){setPhase('place');implant.group.position.copy(deviceTray);return;}
 if(phase==='build'){const next=implant.nextPart();if(next)implant.fit(next);else{setPhase('prepare');}updateUI();}
 else if(phase==='place'){if(placed)setPhase('connect');else startSeating();}
 else if(phase==='connect')setPhase('signal');
 else if(phase==='signal'){
  if(reduced.matches){setPhase('words');return;}
  playbackDuration=2.4;
  updateUI();
 }
 else if(phase==='words')setPhase('voice');
 else if(phase==='voice'){cancelVoice();if(!('speechSynthesis' in window)){updateUI('Speech synthesis is unavailable in this browser.');return;}const u=new SpeechSynthesisUtterance(record().decoded);u.lang='en-US';u.onstart=()=>document.body.dataset.speaking='true';const run=voiceRun;u.onend=()=>{document.body.dataset.speaking='false';if(run===voiceRun&&phase==='voice')celebrate();};u.onerror=()=>{document.body.dataset.speaking='false';if(run===voiceRun&&phase==='voice')updateUI('Speech synthesis is unavailable in this browser.');};speechSynthesis.speak(u);updateUI('Audio comes from the computer; the avatar has no lip animation.');}
});
$('#trial').addEventListener('change',e=>{missionShown=false;trialIndex=Number(e.target.value);setPhase('signal');});
$('#skip-conversation').addEventListener('click',()=>{cancelVoice();setPhase('build');});
$('#view-face').addEventListener('click',()=>{view='face';cameraTween=true;updateUI();});
$('#restart').addEventListener('click',()=>{if(pointerId!==null)endDrag({pointerId},true);implant.resetAssembly();implant.group.visible=true;implant.group.position.set(-2.9,.2,1);implant.group.scale.setScalar(.47);placed=false;seating=0;correct=false;missionShown=false;document.body.dataset.speaking='false';setPhase('meet');});
function celebrate(){
 if(missionShown)return;
 missionShown=true;
 const holder=$('.confetti');holder.replaceChildren();
 if(!reduced.matches){
  for(let i=0;i<28;i++){
   const piece=document.createElement('i');
   piece.style.setProperty('--x',`${(i*37)%100}%`);
   piece.style.setProperty('--delay',`${(i%7)*.07}s`);
   piece.style.setProperty('--turn',`${i*47}deg`);
   piece.style.background=['#c0b5ff','#ee9879','#dfb559','#82b49b'][i%4];
   holder.append(piece);
  }
 }
 $('#mission-complete').showModal();
}
$('#mission-close').onclick=()=>$('#mission-complete').close();
$('#placement-open').onclick=()=>$('#placement-diagram').showModal();
$('#placement-close').onclick=()=>$('#placement-diagram').close();
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
const cameraPoses={meet:[1.4,1.2,4.9,0,.6,-.45],listening:[.25,1.08,3.6,0,.90,-.6],respond:[.6,1.15,4.2,0,.7,-.6],explaining:[.8,1.15,4.4,0,.7,-.6],prepare:[1.1,1.7,4.3,0,.95,-.6],build:[1.8,3.1,9.8,-1,.1,.3],place:[3,2.2,6,0,.7,-.3],connect:[5,2.5,7,1.2,.2,0],signal:[4,2.8,8,1,.3,0],words:[3.7,2,6.5,1.5,.4,0],voice:[3,1.7,6.6,.7,.6,-.3]};
function frame(){requestAnimationFrame(frame);if(document.hidden||document.body.dataset.entry==='intro'&&document.body.dataset.sceneReady==='true'){clock.getDelta();return;}const delta=Math.min(clock.getDelta(),.05),time=clock.elapsedTime,rate=reduced.matches?1:1-Math.exp(-delta*4);implant.update(delta,reduced.matches);
 if(playbackDuration>0){
  fraction=reduced.matches?1:Math.min(1,fraction+delta/playbackDuration);
  $('#signal-progress').value=fraction;
  if(fraction===1)setPhase('words');
 }
 marker.visible=phase==='place'&&!placed&&!seating;
 if(phase==='place'&&!placed&&!seating&&!dragged){implant.group.scale.lerp(new T.Vector3().setScalar(.23),rate);implant.group.position.lerp(deviceTray,rate);}
 if(seating>0&&!placed){seating=Math.min(1,seating+(reduced.matches?1:delta/1.2));implant.group.scale.lerp(new T.Vector3().setScalar(.035),rate);implant.group.position.lerp(embedded,rate);if(seating===1){implant.group.position.copy(embedded);implant.group.visible=false;placed=true;updateUI();}}
 const faceHappy=phase==='voice'&&correct;avatar?.update(delta,{happy:faceHappy,paused,reduced:reduced.matches,talking:dialogue.amount(performance.now())});
 document.body.dataset.expression=faceHappy?'happy':'neutral';
 line.visible=['signal','words','voice'].includes(phase);
 dots.forEach((o,i)=>{o.visible=['signal'].includes(phase);o.position.copy(route.getPointAt(Math.min(1,Math.max(0,fraction/.35-i*.027))));});
 const r=record();let text='';
 if(phase==='signal'){
  const predictionFraction=Math.max(0,(fraction-.3)/.7);
  for(const partial of r?.partial||[])if(partial.ms<=predictionFraction*r.durationMs)text=partial.text;
  $('#decoded').textContent=text||'…';
 }
 if(['words','voice'].includes(phase))text=r?.decoded||'';
 computer.update({stage:phase==='voice'?3:phase==='words'?2:['signal'].includes(phase)?1:0,text,fraction,playing:playbackDuration>0,speaking:document.body.dataset.speaking==='true',reducedMotion:reduced.matches,time:time*1000});
 if(cameraTween&&!dragged){let p=cameraPoses[phase];if(view==='face')p=[.15,1.05,2.9,0,1,-.6];if(view==='wide')p=[4,3.3,11.5,0,0,-.1];destination.set(p[0],p[1],p[2]);look.set(p[3],p[4],p[5]);if(innerWidth<700){if(view==='wide'){destination.set(3,4,17);look.set(0,0,0);}else if(view==='face'){destination.z=3.7;look.y=.8;}else{if(phase==='build'){destination.set(-2.7,2.1,7.5);look.set(-2.9,.15,1);}else if(['meet','listening','respond','explaining'].includes(phase)){destination.set(.12,1.4,5.3);look.set(0,.80,-.6);}else if(phase==='prepare'){destination.set(.2,2.0,3.6);look.set(0,1.18,-.6);}else if(phase==='place'){destination.set(1,2,6);look.set(0,.5,-.3);}else if(phase==='words'){destination.set(3.5,1.7,6);look.set(3,.2,0);}else{destination.set(p[3]+.5,2.5,9);look.y=.2;}}}
 camera.position.lerp(destination,rate);controls.target.lerp(look,rate);}
 controls.update();renderer.render(scene,camera);
}
frame();
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);cameraTween=true;});
Promise.allSettled([loadFaceAvatar(characterId).then(a=>{avatar=a;scene.add(a.group);}),fetch(new URL('../../data/trials.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Recording data could not load');return r.json();}).then(d=>{data=d;d.records.forEach((r,i)=>{const o=document.createElement('option');o.value=i;o.textContent=r.id+' · '+r.target;$('#trial').append(o);});})]).then(async results=>{
 const errors=results.filter(r=>r.status==='rejected');
 if(errors.length){loading.textContent='A studio asset could not load. Open with Live Server and refresh.';console.error(errors.map(r=>r.reason));window.dispatchEvent(new Event('studio-error'));}
 else{try{if(renderer.compileAsync)await renderer.compileAsync(scene,camera);else renderer.compile(scene,camera);renderer.render(scene,camera);loading.hidden=true;document.body.dataset.sceneReady='true';window.dispatchEvent(new Event('studio-ready'));}catch(error){console.error(error);window.dispatchEvent(new Event('studio-error'));}}
 updateUI();
});
window.addEventListener('studio-intro-open',()=>{cancelVoice();if(['listening','respond','explaining'].includes(phase))setPhase('meet');});
window.addEventListener('pagehide',()=>{cancelVoice();avatar?.dispose();themeObserver.disconnect();});
updateUI();
