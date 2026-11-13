import * as T from '../../vendor/three/three.module.js';

// A screen-parallel plane through the part preserves the pointer's grab offset.
// Snapping uses the projected centre, so hidden depth cannot prevent a drop.
export function startPartDrag(ray,camera,group,localPosition){
  group.updateWorldMatrix(true,false);
  const centre=group.localToWorld(localPosition.clone());
  const plane=new T.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new T.Vector3()),centre);
  const hit=ray.intersectPlane(plane,new T.Vector3());
  return hit?{plane,offset:centre.sub(hit)}:null;
}
export function movePartDrag(ray,state,group){
  const hit=ray.intersectPlane(state.plane,new T.Vector3());
  return hit?group.worldToLocal(hit.add(state.offset)):null;
}
export function nearProjectedSlot(camera,group,position,slot,width,height){
  const a=group.localToWorld(position.clone()).project(camera);
  const b=group.localToWorld(slot.clone()).project(camera);
  const distance=Math.hypot((a.x-b.x)*width/2,(a.y-b.y)*height/2);
  return distance<=Math.max(24,Math.min(width,height)*.09);
}
