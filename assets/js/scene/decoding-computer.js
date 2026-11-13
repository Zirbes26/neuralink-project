import * as T from '../../vendor/three/three.module.js';

// A generic external computer. This is not a Neuralink-branded product or surgical robot.
export function createDecodingComputer(canvas=document.createElement('canvas')){
  const group=new T.Group();group.position.set(1.15,0,0);group.rotation.y=-.08;
  canvas.width=1200;canvas.height=750;
  const ctx=canvas.getContext('2d'),texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  const metal=new T.MeshStandardMaterial({color:0xb9c3bf,metalness:.65,roughness:.36});
  const dark=new T.MeshStandardMaterial({color:0x293531,metalness:.2,roughness:.55});
  const keys=new T.MeshStandardMaterial({color:0x48524d,roughness:.7});
  function roundedBox(w,h,d,r){const x=-w/2,y=-h/2,s=new T.Shape();s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:8});g.translate(0,0,-d/2);return g;}
  const lid=new T.Group();lid.position.set(0,.33,0);lid.rotation.x=-.10;group.add(lid);
  lid.add(new T.Mesh(roundedBox(3.95,2.64,.13,.13),metal));
  const bezel=new T.Mesh(roundedBox(3.78,2.48,.04,.08),dark);bezel.position.z=.08;lid.add(bezel);
  const screen=new T.Mesh(new T.PlaneGeometry(3.56,2.225),new T.MeshBasicMaterial({map:texture}));screen.position.set(0,.015,.108);lid.add(screen);
  const webcam=new T.Mesh(new T.SphereGeometry(.023,12,8),dark);webcam.position.set(0,1.25,.115);lid.add(webcam);
  const hinge=new T.Mesh(new T.CylinderGeometry(.085,.085,3.65,24),dark);hinge.rotation.z=Math.PI/2;hinge.position.set(0,-1.0,.12);group.add(hinge);
  const deck=new T.Mesh(roundedBox(4.04,1.95,.12,.13),metal);deck.rotation.x=-Math.PI/2;deck.position.set(0,-1.02,1.02);group.add(deck);
  const keyboard=new T.InstancedMesh(new T.BoxGeometry(.235,.026,.16),keys,65);
  for(let row=0;row<5;row++)for(let col=0;col<13;col++)keyboard.setMatrixAt(row*13+col,new T.Matrix4().makeTranslation((col-6)*.265,-.944,.43+row*.205));group.add(keyboard);
  const space=new T.Mesh(new T.BoxGeometry(1.15,.027,.16),keys);space.position.set(0,-.944,1.45);group.add(space);
  const pad=new T.Mesh(new T.BoxGeometry(1.13,.008,.35),new T.MeshStandardMaterial({color:0x8f9e97,metalness:.3,roughness:.5}));pad.position.set(0,-.953,1.72);group.add(pad);
  const indicator=new T.Mesh(new T.SphereGeometry(.024,10,8),new T.MeshBasicMaterial({color:0x75b89b}));indicator.position.set(1.75,-1.015,2);group.add(indicator);
  const receiver=new T.Group();receiver.position.set(-2.14,.52,.22);group.add(receiver);
  receiver.add(new T.Mesh(new T.SphereGeometry(.04,12,8),new T.MeshBasicMaterial({color:0x81af9a})));
  const radio=[];
  for(let i=0;i<3;i++){const wave=new T.Mesh(new T.TorusGeometry(.14+i*.10,.011,8,36,Math.PI*.85),new T.MeshBasicMaterial({color:0x86b09d,transparent:true,opacity:.6}));wave.rotation.z=Math.PI*.58;receiver.add(wave);radio.push(wave);}
  const drawRound=(x,y,w,h,r,fill)=>{ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();};
  let signature='';
  function update({stage=0,text='',fraction=0,playing=false,speaking=false,reducedMotion=false,time=0}={}){
    const pulse=reducedMotion?0:Math.floor((speaking?time/110:fraction*22));
    const t=value=>window.siteI18n?.t(value)||value;
    const key=[stage,text,pulse,playing,speaking,window.siteI18n?.locale].join('|');
    radio.forEach((m,i)=>{m.material.opacity=stage===1&&playing&&!reducedMotion?.35+.4*Math.abs(Math.sin(fraction*25-i)):.35;});
    if(signature===key)return;signature=key;
    ctx.fillStyle='#14231f';ctx.fillRect(0,0,1200,750);
    ctx.fillStyle='#bcd1c5';ctx.font='24px sans-serif';ctx.fillText(t('EXTERNAL COMPUTER / DECODING SOFTWARE'),42,52);
    ctx.fillStyle='#88a999';ctx.font='20px sans-serif';ctx.fillText(t('Conceptual interface · Public research replay'),42,90);
    drawRound(38,127,1124,500,18,'#20372e');
    ctx.fillStyle='#8cbaa3';ctx.font='19px sans-serif';ctx.fillText(t('SIGNAL → MODEL → WORDS'),70,170);
    // The small network belongs inside the software interface; it is not a machine casing.
    for(let l=0;l<3;l++)for(let n=0;n<4;n++){
      const x=93+l*70,y=235+n*60;
      if(l<2){ctx.strokeStyle='#426655';ctx.lineWidth=1;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+70,235+k*60);ctx.stroke();}}
      ctx.fillStyle=stage===1&&playing&&(n+l+pulse)%3===0?'#e3ba80':'#78a88f';ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();
    }
    ctx.fillStyle='#a9c4b4';ctx.font='17px sans-serif';ctx.fillText(t('Decoding illustration'),65,493);
    const status=['WAITING FOR TRANSMISSION','RECORDED PREDICTION','FINAL RECORDED RESULT','SYNTHETIC SPEECH OUTPUT'][stage];
    ctx.fillStyle='#a9c4b4';ctx.font='22px sans-serif';ctx.fillText(t(status),350,225);
    const message=t(stage===0?'Ready to receive':text.startsWith('Waiting')?'Waiting for the first prediction…':text);
    ctx.fillStyle='#f0f2e7';ctx.font=stage===0||message.startsWith('Waiting')?'42px Georgia':'58px Georgia';
    let line='',y=322;
    for(const word of message.split(' ')){if(ctx.measureText(line+word).width>750&&line){ctx.fillText(line,350,y);line='';y+=72;}line+=word+' ';}ctx.fillText(line,350,y);
    ctx.fillStyle='#8da996';ctx.font='20px sans-serif';ctx.fillText(t(stage===3?(speaking?'Speaking…':'Choose Play synthetic voice'):stage===0?'Press Play signal capture to begin':'Recorded output · Not live model inference'),350,570);
    ctx.strokeStyle='#80b69a';ctx.lineWidth=3;ctx.beginPath();
    for(let i=0;i<=100;i++){const x=43+i*11.1,amp=stage===3&&speaking?18:stage===1&&playing?8:2;const y=684+amp*Math.sin(i*.65+pulse*.7)*Math.sin(i*.23);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();texture.needsUpdate=true;
  }
  update();
  return {group,texture,screen,update,getReceiverPosition(){group.updateMatrixWorld(true);return receiver.getWorldPosition(new T.Vector3());}};
}
