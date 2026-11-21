import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { ChessKind, ChessPiece, ChessScene, Square } from "../lessons/chessTypes";
import { boardIsDark, clampCameraAngle, clampCameraDistance, squareToWorld } from "../lib/chess3d";

type Props = {
  pieces: ChessPiece[];
  scene: ChessScene;
  selected?: Square|null;
  onSquare?: (square:Square)=>void;
  onUnavailable: ()=>void;
  view: "angled"|"top";
  resetId: number;
};

const white="#fff1d2", black="#44385d";
function cartoonPiece(kind: ChessKind,color:"white"|"black"): THREE.Group {
  const group=new THREE.Group();
  const paint=new THREE.MeshStandardMaterial({color:color==="white"?white:black,roughness:.38,metalness:.06});
  const trim=new THREE.MeshStandardMaterial({color:color==="white"?"#e6a846":"#b29cf2",roughness:.42});
  const eyes=new THREE.MeshStandardMaterial({color:color==="white"?"#5b4771":"#fdf5df"});
  const add=(geometry:THREE.BufferGeometry,material:THREE.Material,x:number,y:number,z:number,rx=0,ry=0,rz=0)=>{
    const mesh=new THREE.Mesh(geometry,material);
    mesh.position.set(x,y,z);mesh.rotation.set(rx,ry,rz);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
    return mesh;
  };
  const cylinder=(r1:number,r2:number,h:number,x:number,y:number,z:number,m=paint)=>{
    add(new THREE.CylinderGeometry(r1,r2,h,20),m,x,y,z);
  };
  const ball=(r:number,x:number,y:number,z:number,m=paint)=>add(new THREE.SphereGeometry(r,16,12),m,x,y,z);
  const cone=(r:number,h:number,x:number,y:number,z:number,m=paint)=>add(new THREE.ConeGeometry(r,h,16),m,x,y,z);
  cylinder(.37,.39,.13,0,.10,0);
  cylinder(.28,.34,.11,0,.22,0,trim);
  cylinder(.20,.27,.40,0,.47,0);
  cylinder(.28,.22,.10,0,.69,0);
  if(kind==="P"){
    ball(.235,0,.93,0);
  } else if(kind==="R"){
    cylinder(.29,.28,.24,0,.86,0);
    cylinder(.35,.30,.09,0,1.01,0,trim);
    for(const [x,z] of [[-.24,-.24],[-.24,.24],[.24,-.24],[.24,.24]])
      add(new THREE.BoxGeometry(.16,.18,.16),paint,x,1.12,z);
  } else if(kind==="B"){
    ball(.22,0,.84,0,trim);
    cone(.29,.43,0,1.11,0);
    ball(.085,0,1.37,0,trim);
  } else if(kind==="N"){
    // A cheerful horse silhouette, oriented towards the opponent (negative z).
    add(new THREE.CylinderGeometry(.15,.27,.63,10),paint,0,.90,0,-.45,0,0);
    const head=ball(.25,0,1.23,-.20);
    head.scale.set(.9,.9,1.25);
    const muzzle=ball(.16,0,1.17,-.43,trim);
    muzzle.scale.set(1,.75,1.35);
    cone(.105,.32,-.13,1.47,-.10);
    cone(.105,.32,.13,1.47,-.10);
    ball(.045,-.19,1.28,-.36,eyes);ball(.045,.19,1.28,-.36,eyes);
  } else if(kind==="Q"){
    cylinder(.30,.26,.18,0,.83,0,trim);
    cone(.34,.35,0,1.08,0);
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ball(.105,Math.sin(a)*.3,1.25,Math.cos(a)*.3,trim);}
    ball(.14,0,1.33,0,trim);
  } else {
    cylinder(.29,.23,.27,0,.87,0,trim);
    ball(.23,0,1.09,0);
    add(new THREE.BoxGeometry(.14,.43,.14),trim,0,1.39,0);
    add(new THREE.BoxGeometry(.39,.13,.15),trim,0,1.43,0);
  }
  group.userData.kind=kind;
  return group;
}
function disposeTree(root:THREE.Object3D){
  root.traverse(o=>{
    if(o instanceof THREE.Mesh){
      o.geometry.dispose();
      const materials=Array.isArray(o.material)?o.material:[o.material];
      for(const m of materials)m.dispose();
    }
  });
}

type Actor={mesh:THREE.Group;square:Square;kind:ChessKind;from:THREE.Vector3;to:THREE.Vector3;start:number;duration:number};
function targetPosition(square:Square):THREE.Vector3{
  const {x,z}=squareToWorld(square);return new THREE.Vector3(x,0,z);
}
export default function CartoonChessBoard3D({pieces,scene,selected,onSquare,onUnavailable,view,resetId}:Props){
  const hostRef=useRef<HTMLDivElement>(null);
  const liveRef=useRef({pieces,scene,selected,onSquare,onUnavailable});
  liveRef.current={pieces,scene,selected,onSquare,onUnavailable};
  const engineRef=useRef<{
    actors:Map<string,Actor>;
    board:THREE.Mesh[];
    scene:THREE.Scene;
    camera:THREE.PerspectiveCamera;
    setView:(v:"angled"|"top")=>void;
  }|null>(null);
  useEffect(()=>{
    const host=hostRef.current;
    if(!host)return;
    let renderer:THREE.WebGLRenderer;
    try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"default"});}
    catch{liveRef.current.onUnavailable();return;}
    if(!renderer.getContext()){renderer.dispose();liveRef.current.onUnavailable();return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.setClearColor(0xffffff,0);
    renderer.domElement.setAttribute("aria-label","Échiquier 3D. Utilise la souris pour tourner la caméra et clique sur une case.");
    renderer.domElement.style.touchAction="none";
    host.appendChild(renderer.domElement);

    const world=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(40,1,.1,100);
    const ambient=new THREE.HemisphereLight("#e8f1ff","#967d90",2.2);world.add(ambient);
    const sunlight=new THREE.DirectionalLight("#fff9ea",3.1);
    sunlight.position.set(-4,11,7);sunlight.castShadow=true;
    sunlight.shadow.mapSize.set(1024,1024);
    sunlight.shadow.camera.near=.1;sunlight.shadow.camera.far=32;
    sunlight.shadow.camera.left=-8;sunlight.shadow.camera.right=8;
    sunlight.shadow.camera.top=8;sunlight.shadow.camera.bottom=-8;
    world.add(sunlight);

    const platform=new THREE.Mesh(
      new THREE.BoxGeometry(8.75,.45,8.75),
      new THREE.MeshStandardMaterial({color:"#7866ba",roughness:.72})
    );
    platform.position.y=-.25;platform.receiveShadow=true;world.add(platform);
    const lip=new THREE.Mesh(new THREE.BoxGeometry(8.25,.12,8.25),new THREE.MeshStandardMaterial({color:"#e9c57b",roughness:.4}));
    lip.position.y=.015;world.add(lip);
    const board:THREE.Mesh[]=[];
    for(let f=0;f<8;f++)for(let rank=1;rank<=8;rank++){
      const square="abcdefgh"[f]+rank;
      const {x,z}=squareToWorld(square);
      const material=new THREE.MeshStandardMaterial({color:boardIsDark(f,rank)?"#a58bd5":"#fff0cd",roughness:.85});
      const tile=new THREE.Mesh(new THREE.BoxGeometry(.995,.095,.995),material);
      tile.position.set(x,.105,z);tile.receiveShadow=true;
      tile.userData.square=square;world.add(tile);board.push(tile);
    }
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.ShadowMaterial({opacity:.17}));
    ground.rotation.x=-Math.PI/2;ground.position.y=-.52;ground.receiveShadow=true;world.add(ground);

    const actors=new Map<string,Actor>();
    let azimuth=0,elevation=.76,radius=14,frame=0,closed=false;
    const adjustCamera=()=>{camera.position.set(
      Math.sin(azimuth)*Math.cos(elevation)*radius,
      Math.sin(elevation)*radius,
      Math.cos(azimuth)*Math.cos(elevation)*radius
    );camera.lookAt(0,.1,0)};
    const setView=(preset:"angled"|"top")=>{
      azimuth=0;elevation=preset==="top"?1.29:.76;
      radius=preset==="top"?12.8:14;adjustCamera();
    };
    setView(view);
    engineRef.current={actors,board,scene:world,camera,setView};
    const ray=new THREE.Raycaster();
    const point=new THREE.Vector2();
    let pointer:{x:number;y:number;azimuth:number;elevation:number;dragged:boolean}|null=null;
    const down=(event:PointerEvent)=>{
      if(event.button!==0)return;
      pointer={x:event.clientX,y:event.clientY,azimuth,elevation,dragged:false};
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const move=(event:PointerEvent)=>{
      if(!pointer)return;
      const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
      if(Math.abs(dx)+Math.abs(dy)>5)pointer.dragged=true;
      if(!pointer.dragged)return;
      azimuth=Math.max(-1.05,Math.min(1.05,pointer.azimuth-dx*.008));
      elevation=clampCameraAngle(pointer.elevation+dy*.006);
      adjustCamera();
    };
    const up=(event:PointerEvent)=>{
      if(!pointer)return;
      const dragged=pointer.dragged;pointer=null;
      if(dragged||!liveRef.current.onSquare)return;
      const rect=renderer.domElement.getBoundingClientRect();
      point.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
      ray.setFromCamera(point,camera);
      const hit=ray.intersectObjects(board,false)[0];
      const square=hit?.object.userData.square as string|undefined;
      if(square)liveRef.current.onSquare(square);
    };
    const wheel=(event:WheelEvent)=>{event.preventDefault();radius=clampCameraDistance(radius+Math.sign(event.deltaY)*.65);adjustCamera();};
    const lost=(event:Event)=>{event.preventDefault();liveRef.current.onUnavailable();};
    renderer.domElement.addEventListener("pointerdown",down);
    renderer.domElement.addEventListener("pointermove",move);
    renderer.domElement.addEventListener("pointerup",up);
    renderer.domElement.addEventListener("wheel",wheel,{passive:false});
    renderer.domElement.addEventListener("webglcontextlost",lost);

    const resize=()=>{
      const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
      camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
    };
    const observer=new ResizeObserver(resize);observer.observe(host);resize();
    let last=0;
    const animate=(now:number)=>{
      if(closed)return;
      const dt=Math.min(.06,(now-last)/1000||.016);last=now;
      for(const actor of actors.values()){
        const t=Math.min(1,(now-actor.start)/actor.duration);
        const eased=t*t*(3-2*t);
        actor.mesh.position.lerpVectors(actor.from,actor.to,eased);
        actor.mesh.position.y=(actor.kind==="N"?Math.sin(Math.PI*t)*.85:Math.sin(Math.PI*t)*.12);
        // Cheerful idle breathing, but not while pieces are in flight.
        if(t>=1)actor.mesh.position.y=Math.sin(now*.0019+actor.to.x)*.017;
      }
      camera.updateProjectionMatrix();renderer.render(world,camera);frame=requestAnimationFrame(animate);
      void dt;
    };
    frame=requestAnimationFrame(animate);
    return ()=>{
      closed=true;cancelAnimationFrame(frame);observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown",down);
      renderer.domElement.removeEventListener("pointermove",move);
      renderer.domElement.removeEventListener("pointerup",up);
      renderer.domElement.removeEventListener("wheel",wheel);
      renderer.domElement.removeEventListener("webglcontextlost",lost);
      for(const actor of actors.values())disposeTree(actor.mesh);
      for(const tile of board)disposeTree(tile);
      disposeTree(platform);disposeTree(lip);disposeTree(ground);
      renderer.dispose();renderer.domElement.remove();
      engineRef.current=null;
    };
    // WebGL initialized once; prop updates handled by effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  useEffect(()=>{
    const engine=engineRef.current;if(!engine)return;
    const now=performance.now();
    const incoming=new Set(pieces.map(p=>p.id));
    for(const [id,actor] of engine.actors){
      if(incoming.has(id))continue;
      engine.scene.remove(actor.mesh);disposeTree(actor.mesh);engine.actors.delete(id);
    }
    for(const piece of pieces){
      const target=targetPosition(piece.square);
      let actor=engine.actors.get(piece.id);
      if(actor && actor.kind!==piece.kind){
        engine.scene.remove(actor.mesh);disposeTree(actor.mesh);engine.actors.delete(piece.id);actor=undefined;
      }
      if(!actor){
        const mesh=cartoonPiece(piece.kind,piece.color);mesh.position.copy(target);
        engine.scene.add(mesh);
        actor={mesh,square:piece.square,kind:piece.kind,from:target.clone(),to:target.clone(),start:now-1000,duration:900};
        engine.actors.set(piece.id,actor);
      }else if(actor.square!==piece.square){
        actor.from=actor.mesh.position.clone();actor.from.y=0;
        actor.to=target;actor.square=piece.square;actor.start=now;actor.duration=1000;
      }
    }
  },[pieces]);
  useEffect(()=>{
    const engine=engineRef.current;if(!engine)return;
    for(const tile of engine.board){
      const square=tile.userData.square as Square;
      const f=square.charCodeAt(0)-97,rank=Number(square[1]);
      const base=boardIsDark(f,rank)?"#a58bd5":"#fff0cd";
      const marked=scene.highlight?.includes(square)||selected===square;
      const target=scene.challenge?.validTargets.includes(square);
      (tile.material as THREE.MeshStandardMaterial).color.set(
        selected===square?"#80e8b9":marked?"#ffe579":target&&onSquare?"#c6f7d1":base
      );
    }
  },[scene,selected,onSquare]);
  useEffect(()=>engineRef.current?.setView(view),[view,resetId]);
  return <div className="cartoon-3d-viewport" ref={hostRef} role="group" aria-label="Échiquier cartoon en 3D"/>;
}
