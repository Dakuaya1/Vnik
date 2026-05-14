/* showcase3d.js — Scroll-driven spice 3D showcase */
(function () {
  'use strict';

  const SPICES = [
    { file: 'cardommom.fbx',  name: 'Cardamom',     origin: 'Kerala, India'      },
    { file: 'cinnimon.fbx',   name: 'Cinnamon',     origin: 'Sri Lanka'          },
    { file: 'cloves.fbx',     name: 'Cloves',       origin: 'Zanzibar'           },
    { file: 'black pepper.fbx', name: 'Black Pepper', origin: 'Malabar Coast'   },
  ];

  const lerp  = (a,b,t) => a+(b-a)*t;
  const easeO = t => 1-Math.pow(1-t,3);
  const easeI = t => t*t*t;
  const clamp = (v,lo,hi) => Math.max(lo,Math.min(hi,v));
  const map   = (v,a,b) => clamp((v-a)/(b-a),0,1);

  function tryInit() {
    if (typeof THREE==='undefined' || typeof THREE.FBXLoader==='undefined') {
      setTimeout(tryInit,80); return;
    }
    init();
  }

  function init() {
    const canvas  = document.getElementById('showcase3d');
    const section = document.getElementById('spice-showcase');
    if (!canvas || !section) return;

    /* show notice if file:// */
    if (location.protocol==='file:') {
      const n = document.getElementById('showcaseNotice');
      if (n) n.style.display='flex';
    }

    /* ── Renderer ────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45,1,0.1,200);
    camera.position.set(0,0,8);

    function resize() {
      const w = canvas.clientWidth || section.offsetWidth;
      const h = window.innerHeight;
      renderer.setSize(w,h,false);
      camera.aspect = w/h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize',resize);

    /* ── Lights ──────────────────────────────── */
    scene.add(new THREE.AmbientLight(0xFFF5E4,0.8));
    const key = new THREE.DirectionalLight(0xFFE8C0,3.0);
    key.position.set(5,8,6); key.castShadow=true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xD4893A,1.2);
    fill.position.set(-6,-4,3); scene.add(fill);
    const rim = new THREE.DirectionalLight(0x2E7D6B,1.0);
    rim.position.set(0,0,-8); scene.add(rim);

    /* ── Load FBX models ─────────────────────── */
    const loader = new THREE.FBXLoader();
    const pivots = new Array(SPICES.length).fill(null);

    function makeFallback(i) {
      const g = new THREE.Group();
      const m = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.4,1),
        new THREE.MeshStandardMaterial({color:0xC4893A,roughness:0.6,metalness:0.2})
      );
      g.add(m); g.visible=false; scene.add(g);
      pivots[i]=g;
    }

    SPICES.forEach((sp,i) => {
      loader.load(sp.file, (fbx) => {
        const box = new THREE.Box3().setFromObject(fbx);
        const size = box.getSize(new THREE.Vector3());
        const maxD = Math.max(size.x,size.y,size.z)||1;
        fbx.scale.setScalar(3.5/maxD);
        box.setFromObject(fbx);
        fbx.position.sub(box.getCenter(new THREE.Vector3()));
        fbx.traverse(c => {
          if (!c.isMesh) return;
          c.castShadow=c.receiveShadow=true;
          if (!c.material?.map) {
            c.material=new THREE.MeshStandardMaterial({color:0xCCAA77,roughness:0.65,metalness:0.12});
          } else { c.material.roughness=0.6; c.material.metalness=0.1; c.material.needsUpdate=true; }
        });
        const p=new THREE.Group(); p.add(fbx); p.visible=false; scene.add(p); pivots[i]=p;
      }, undefined, ()=>makeFallback(i));
    });

    /* ── UI ──────────────────────────────────── */
    const nameEl   = document.getElementById('showcaseSpiceName');
    const originEl = document.getElementById('showcaseSpiceOrigin');
    const dots     = document.querySelectorAll('#showcaseDots .dot');
    let lastLabel  = -1;
    function updateLabel(i) {
      if (i===lastLabel) return; lastLabel=i;
      if (nameEl)   nameEl.textContent   = SPICES[i].name;
      if (originEl) originEl.textContent = SPICES[i].origin;
      dots.forEach((d,j)=>d.classList.toggle('active',j===i));
    }

    /* ── Smooth state ────────────────────────── */
    const sX   = new Array(SPICES.length).fill(14);
    const sRY  = new Array(SPICES.length).fill(0);
    const sOp  = new Array(SPICES.length).fill(0);
    const clock = new THREE.Clock();

    /* ── Render loop ─────────────────────────── */
    (function animate() {
      requestAnimationFrame(animate);
      const t   = clock.getElapsedTime();
      const N   = SPICES.length;
      const sec = section.getBoundingClientRect();
      const progress = clamp(-sec.top/(section.offsetHeight-window.innerHeight),0,1);

      SPICES.forEach((_,i) => {
        const lp = map(progress, i/N, (i+1)/N);

        /* 3 phases per model */
        let tX, tRY, tOp;
        if (lp<0.25)      { const p=easeO(lp/0.25);      tX=lerp(14,0,p); tRY=0;            tOp=p;     }
        else if (lp<0.75) { const p=(lp-0.25)/0.5;        tX=0;            tRY=p*Math.PI*2;  tOp=1;     }
        else               { const p=easeI((lp-0.75)/0.25); tX=lerp(0,-14,p); tRY=Math.PI*2;  tOp=1-p; }

        /* silky lerp */
        sX[i]  += (tX  - sX[i])  * 0.09;
        sRY[i] += (tRY - sRY[i]) * 0.09;
        sOp[i] += (tOp - sOp[i]) * 0.09;

        const pivot = pivots[i];
        if (!pivot) return;
        pivot.visible = sOp[i] > 0.01;
        if (pivot.visible) {
          const child = pivot.children[0];
          if (child) {
            child.position.x = sX[i];
            child.rotation.y = sRY[i];
            child.position.y = Math.sin(t*0.6+i)*0.18;
          }
          pivot.traverse(m=>{
            if (m.isMesh&&m.material) {
              m.material.transparent=true;
              m.material.opacity=clamp(sOp[i],0,1);
            }
          });
        }
        if (sOp[i]>0.5) updateLabel(i);
      });

      renderer.render(scene,camera);
    })();
  }

  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',tryInit)
    : tryInit();
})();
