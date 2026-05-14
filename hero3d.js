/* hero3d.js — Real FBX spice models in Three.js hero */
(function () {
  'use strict';

  function init() {
    const canvas = document.getElementById('hero3d');
    const hero   = document.getElementById('hero');
    if (!canvas || !hero || typeof THREE === 'undefined' || typeof THREE.FBXLoader === 'undefined') {
      console.warn('hero3d: waiting on deps…');
      return;
    }

    /* ── Renderer ─────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;

    if (location.protocol === 'file:') {
      console.warn('hero3d: FBX files cannot load over file:// (CORS). Run: python3 -m http.server 8080');
    }

    /* ── Scene & Camera ───────────────────────────────────── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500);
    camera.position.set(0, 0, 9);

    function resize() {
      const w = hero.offsetWidth, h = hero.offsetHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    /* ── Lights ───────────────────────────────────────────── */
    scene.add(new THREE.AmbientLight(0xFFF5E4, 0.7));

    const sun = new THREE.DirectionalLight(0xFFE8C0, 2.5);
    sun.position.set(6, 10, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xD4893A, 1.0);
    fill.position.set(-6, -3, 4);
    scene.add(fill);

    const teal = new THREE.PointLight(0x2E7D6B, 1.8, 30);
    teal.position.set(-3, -6, 4);
    scene.add(teal);

    const amber = new THREE.PointLight(0xD4893A, 1.4, 26);
    amber.position.set(5, 5, 3);
    scene.add(amber);

    /* ── Spice group (tilts with mouse) ───────────────────── */
    const group = new THREE.Group();
    scene.add(group);

    /* ── FBX model configs ────────────────────────────────── */
    /* position, scale, rotation (initial), floatAmp, pDepth  */
    const models = [
      {
        file   : 'cardommom.fbx',
        pos    : [-3.2, 0.8, -1.0],
        scale  : 0.018,
        rot    : [0.3, 0.5, 0.2],
        floatSpeed: 0.85, floatAmp: 0.30,
        ry: 0.006, rx: 0.003,
        pDepth : 1.1
      },
      {
        file   : 'cinnimon.fbx',
        pos    : [3.0, 1.0, -1.6],
        scale  : 0.016,
        rot    : [-0.4, 0.6, 0.2],
        floatSpeed: 0.72, floatAmp: 0.28,
        ry: 0.005, rx: 0.002,
        pDepth : 1.4
      },
      {
        file   : 'cloves.fbx',
        pos    : [-2.4, -1.6, -0.6],
        scale  : 0.015,
        rot    : [0.4, 0.8, -0.4],
        floatSpeed: 1.0,  floatAmp: 0.36,
        ry: 0.007, rx: -0.003,
        pDepth : 0.9
      },
      {
        file   : 'black pepper.fbx',
        pos    : [2.8, -1.4, -0.8],
        scale  : 0.014,
        rot    : [0.2, -0.5, 0.3],
        floatSpeed: 0.90, floatAmp: 0.32,
        ry: 0.004, rx: 0.005,
        pDepth : 1.2
      }
    ];

    /* ── Load FBX models ──────────────────────────────────── */
    const loader   = new THREE.FBXLoader();
    const floaters = [];
    let   loaded   = 0;

    models.forEach((cfg) => {
      loader.load(
        cfg.file,
        (fbx) => {
          /* Normalise scale — FBX files often arrive in wildly different units */
          const box = new THREE.Box3().setFromObject(fbx);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const normalise = cfg.scale / (maxDim || 1) * 100;
          fbx.scale.setScalar(normalise);

          /* Position & initial rotation */
          fbx.position.set(...cfg.pos);
          fbx.rotation.set(...cfg.rot);

          /* Apply lighting to all child meshes */
          fbx.traverse((child) => {
            if (child.isMesh) {
              child.castShadow    = true;
              child.receiveShadow = true;
              /* Keep original texture if present, otherwise add warm material */
              if (!child.material || !child.material.map) {
                child.material = new THREE.MeshStandardMaterial({
                  color     : child.material ? child.material.color : 0xCCAA77,
                  roughness : 0.70,
                  metalness : 0.10,
                });
              } else {
                child.material.roughness = 0.65;
                child.material.metalness = 0.08;
              }
              child.material.needsUpdate = true;
            }
          });

          group.add(fbx);
          floaters.push({
            mesh       : fbx,
            bx         : cfg.pos[0],
            by         : cfg.pos[1],
            bz         : cfg.pos[2],
            floatSpeed : cfg.floatSpeed,
            floatAmp   : cfg.floatAmp,
            ry         : cfg.ry,
            rx         : cfg.rx,
            pDepth     : cfg.pDepth,
            idx        : loaded
          });
          loaded++;
        },
        undefined,
        (err) => {
          console.error('FBX load error:', cfg.file, err);
          // Fallback: show a simple placeholder mesh so scene is not empty
          const fallback = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 10, 10),
            new THREE.MeshStandardMaterial({ color: 0xD4893A, roughness: 0.7 })
          );
          fallback.position.set(...cfg.pos);
          group.add(fallback);
        }
      );
    });

    /* ── Dust particles ───────────────────────────────────── */
    const dustPos = new Float32Array(270);
    for (let i = 0; i < 270; i += 3) {
      dustPos[i]   = (Math.random()-0.5)*16;
      dustPos[i+1] = (Math.random()-0.5)*12;
      dustPos[i+2] = (Math.random()-0.5)*7 - 2;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(dustGeo,
      new THREE.PointsMaterial({ color:0xD4893A, size:0.045, transparent:true, opacity:0.45 }));
    scene.add(dust);

    /* ── Smooth state ─────────────────────────────────────── */
    let tiltX = 0, tiltY = 0, groupX = 0, groupY = 0, camZ = 9;
    const clock = new THREE.Clock();

    function scrollP() {
      return Math.min(Math.max(window.scrollY / (hero.offsetHeight||1), 0), 1);
    }

    /* ── Render loop ──────────────────────────────────────── */
    (function animate() {
      requestAnimationFrame(animate);
      const t  = clock.getElapsedTime();
      const sp = scrollP();
      const mx = typeof mouseNX !== 'undefined' ? mouseNX : 0;
      const my = typeof mouseNY !== 'undefined' ? mouseNY : 0;

      /* Camera forward on scroll */
      camZ += (9 - sp * 5 - camZ) * 0.065;
      camera.position.z = camZ;

      /* Scene-wide tilt (aggressive + silky) */
      tiltY += (mx * 1.4  - tiltY) * 0.032;
      tiltX += (my * 0.85 - tiltX) * 0.032;
      group.rotation.y = tiltY;
      group.rotation.x = tiltX;

      /* Whole-group sweep with mouse */
      groupX += (mx * 0.9 - groupX) * 0.030;
      groupY += (my * 0.5 - groupY) * 0.030;
      group.position.x = groupX;
      group.position.y = groupY;
      group.position.z = sp * 2.8;

      /* Per-model: float + self-rotate + depth parallax */
      floaters.forEach(({ mesh, bx, by, bz, floatSpeed, floatAmp, ry, rx, pDepth, idx }) => {
        mesh.rotation.y += ry;
        mesh.rotation.x += rx;
        mesh.position.y  = by + Math.sin(t * floatSpeed + idx * 1.3) * floatAmp;
        mesh.position.x  = bx + mx * pDepth * 0.55;
        mesh.position.z  = bz + my * pDepth * 0.25;
      });

      dust.rotation.y = t * 0.025;
      dust.rotation.x = t * 0.010;

      renderer.render(scene, camera);
    })();
  }

  /* ── Boot: wait for both Three.js core + FBXLoader ─────── */
  function tryInit() {
    if (typeof THREE !== 'undefined' && typeof THREE.FBXLoader !== 'undefined') {
      init();
    } else {
      setTimeout(tryInit, 80);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
})();
