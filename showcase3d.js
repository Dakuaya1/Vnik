/* showcase3d.js — Scroll-driven spice 3D showcase */
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

const SPICES = [
  { file:'cardommom.fbx',      name:'Cardamom',     origin:'Kerala, India'  },
  { file:'cinnimon.fbx',       name:'Cinnamon',     origin:'Sri Lanka'      },
  { file:'cloves.fbx',         name:'Cloves',       origin:'Zanzibar'       },
  { file:'black%20pepper.fbx', name:'Black Pepper', origin:'Malabar Coast'  },
];
/* Per-model scroll window [lo, hi] — model 0 starts visible (lo < 0) */
const WINDOWS = [[-0.15,0.38],[0.18,0.62],[0.45,0.82],[0.68,1.10]];
const COLORS  = [0x3D6B47, 0x8B3A0F, 0x2C1A0E, 0x100503];

const lerp  = (a,b,t) => a+(b-a)*t;
const easeO = t => 1-Math.pow(1-t,3);
const easeI = t => t*t*t;
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const map   = (v,a,b) => clamp((v-a)/(b-a),0,1);

const canvas  = document.getElementById('showcase3d');
const section = document.getElementById('spice-showcase');
if (!canvas||!section) throw new Error('Missing elements');

/* ── Renderer ─────────────────── */
const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.8;

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45,1,0.1,200);
camera.position.set(0,0,8);

function resize(){
  const w=section.offsetWidth, h=window.innerHeight;
  renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
}
resize(); window.addEventListener('resize',resize);

/* ── Lights ───────────────────── */
scene.add(new THREE.AmbientLight(0xFFF5E4,1.0));
const key=new THREE.DirectionalLight(0xFFE8C0,3.5); key.position.set(5,8,6); key.castShadow=true; scene.add(key);
const fill=new THREE.DirectionalLight(0xD4893A,1.4); fill.position.set(-6,-4,3); scene.add(fill);
const rim=new THREE.DirectionalLight(0x2E7D6B,1.2);  rim.position.set(0,2,-6);  scene.add(rim);

/* ── Load FBX ─────────────────── */
const loader=new FBXLoader();
const pivots=Array(SPICES.length).fill(null);
const statusEl=document.getElementById('showcaseStatus');

let pending=SPICES.length;
function done(){ if(--pending===0 && statusEl) statusEl.textContent=''; }

function makeFallback(i){
  const g=new THREE.Group();
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.4,2),
    new THREE.MeshStandardMaterial({color:COLORS[i],roughness:0.6,metalness:0.15})));
  g.visible=false; scene.add(g); pivots[i]=g; done();
}

SPICES.forEach((sp,i)=>{
  if(statusEl) statusEl.textContent=`Loading ${sp.name}…`;
  loader.load(sp.file,(fbx)=>{
    /* normalise to 3 units tall */
    let box=new THREE.Box3().setFromObject(fbx);
    let sz=box.getSize(new THREE.Vector3());
    fbx.scale.setScalar(3/Math.max(sz.x,sz.y,sz.z,0.001));
    box=new THREE.Box3().setFromObject(fbx);
    fbx.position.sub(box.getCenter(new THREE.Vector3()));
    /* force solid material — FBX textures are absolute local paths (404) */
    fbx.traverse(c=>{
      if(!c.isMesh) return;
      c.castShadow=c.receiveShadow=true;
      c.material=new THREE.MeshStandardMaterial({color:COLORS[i],roughness:0.65,metalness:0.12});
    });
    const p=new THREE.Group(); p.add(fbx); p.visible=false; scene.add(p); pivots[i]=p; done();
  },undefined,()=>makeFallback(i));
});

/* ── UI ───────────────────────── */
const nameEl  =document.getElementById('showcaseSpiceName');
const originEl=document.getElementById('showcaseSpiceOrigin');
const dots    =[...document.querySelectorAll('#showcaseDots .dot')];
let lastLabel=-1;
function setLabel(i){
  if(i===lastLabel) return; lastLabel=i;
  if(nameEl)   nameEl.textContent  =SPICES[i].name;
  if(originEl) originEl.textContent=SPICES[i].origin;
  dots.forEach((d,j)=>d.classList.toggle('active',j===i));
}

/* ── Smooth lerp state ────────── */
const sX=Array(4).fill(12), sRY=Array(4).fill(0), sOp=Array(4).fill(0);
const clock=new THREE.Clock();

(function animate(){
  requestAnimationFrame(animate);
  const t=clock.getElapsedTime();

  /* scroll progress 0→1 through section */
  const rect=section.getBoundingClientRect();
  const maxS=Math.max(section.offsetHeight-window.innerHeight,1);
  const prog=clamp(-rect.top/maxS,0,1);

  let bestI=0, bestOp=0;

  SPICES.forEach((_,i)=>{
    const [lo,hi]=WINDOWS[i];
    const lp=map(prog,lo,hi);        // 0→1 within this model's window

    let tX,tRY,tOp;
    if(lp<0.28){
      const p=easeO(lp/0.28);
      tX=lerp(12,0,p); tRY=0; tOp=p;
    } else if(lp<0.72){
      const p=(lp-0.28)/0.44;
      tX=0; tRY=p*Math.PI*2; tOp=1;
    } else {
      const p=easeI((lp-0.72)/0.28);
      tX=lerp(0,-12,p); tRY=Math.PI*2; tOp=1-p;
    }

    /* silky lerp */
    sX[i] +=(tX -sX[i]) *0.12;
    sRY[i]+=(tRY-sRY[i])*0.12;
    sOp[i]+=(tOp-sOp[i])*0.12;

    const pivot=pivots[i];
    if(!pivot) return;
    pivot.visible=sOp[i]>0.01;
    if(pivot.visible){
      const child=pivot.children[0];
      if(child){
        child.position.x=sX[i];
        child.rotation.y=sRY[i];
        child.position.y=Math.sin(t*0.7+i)*0.2;
      }
      pivot.traverse(m=>{
        if(m.isMesh&&m.material){ m.material.transparent=true; m.material.opacity=clamp(sOp[i],0,1); }
      });
    }
    if(sOp[i]>bestOp){ bestOp=sOp[i]; bestI=i; }
  });

  if(bestOp>0.3) setLabel(bestI);
  renderer.render(scene,camera);
})();
