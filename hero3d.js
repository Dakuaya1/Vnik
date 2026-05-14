/* hero3d.js — Three.js 3D spice models | aggressive mouse parallax */
(function () {
  'use strict';

  function init() {
    const canvas = document.getElementById('hero3d');
    const hero   = document.getElementById('hero');
    if (!canvas || !hero || typeof THREE === 'undefined') return;

    /* ── Renderer ─────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;

    /* ── Scene & Camera ───────────────────────────────────── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
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
    scene.add(new THREE.AmbientLight(0xFFF5E4, 0.65));

    const sun = new THREE.DirectionalLight(0xFFE8C0, 2.4);
    sun.position.set(6, 10, 6);
    sun.castShadow = true;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xD4893A, 1.0);
    fill.position.set(-6, -3, 4);
    scene.add(fill);

    const tealPt = new THREE.PointLight(0x2E7D6B, 1.8, 28);
    tealPt.position.set(-2, -5, 3);
    scene.add(tealPt);

    const amberPt = new THREE.PointLight(0xD4893A, 1.3, 24);
    amberPt.position.set(4, 4, 2);
    scene.add(amberPt);

    /* ── Materials ────────────────────────────────────────── */
    const mat = (c, r, m) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
    const mCard = mat(0x3D6B47, 0.65, 0.05);
    const mCin  = mat(0x8B3A0F, 0.85, 0.00);
    const mClv  = mat(0x3D1C02, 0.60, 0.15);
    const mPep  = mat(0x100503, 0.90, 0.05);
    const mFox  = mat(0xF2E0B6, 0.50, 0.00);

    /* ── Spice group ──────────────────────────────────────── */
    const group = new THREE.Group();
    scene.add(group);

    /* floaters: { mesh, bx, by, bz, floatSpeed, floatAmp, ry, rx, pDepth }
       pDepth = parallax depth multiplier (how much it moves with mouse)
       higher pDepth = "closer" to viewer = moves more                      */
    const floaters = [];

    function addSpice(mesh, bx, by, bz, floatSpeed, floatAmp, ry, rx, pDepth) {
      mesh.position.set(bx, by, bz);
      mesh.castShadow = true;
      group.add(mesh);
      floaters.push({ mesh, bx, by, bz, floatSpeed, floatAmp, ry, rx, pDepth });
    }

    /* 1 — CARDAMOM pods */
    const capGeo = new THREE.CapsuleGeometry(0.30, 0.80, 10, 22);
    const card1  = new THREE.Mesh(capGeo, mCard);
    card1.rotation.set(0.3, 0.5, 0.4);
    addSpice(card1, -3.5, 1.0, -1.2, 0.9, 0.38, 0.007, 0.004, 1.1);

    const card2  = new THREE.Mesh(capGeo, mCard.clone());
    card2.rotation.set(-0.2, 1.2, -0.6);
    card2.scale.setScalar(0.72);
    addSpice(card2, -2.9, 0.1, -0.6, 1.1, 0.28, -0.005, 0.003, 0.7);

    /* 2 — CINNAMON curl */
    const cinGeo = new THREE.TorusGeometry(0.54, 0.14, 10, 40, Math.PI * 1.65);
    const cin    = new THREE.Mesh(cinGeo, mCin);
    cin.rotation.set(-0.5, 0.4, 0.3);
    addSpice(cin, 3.3, 1.1, -1.8, 0.72, 0.32, 0.006, 0.003, 1.4);

    /* 3 — CLOVE */
    const clvG    = new THREE.Group();
    const clvHead = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 14), mClv);
    clvHead.position.y = 0.58;
    const clvStem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.10, 0.90, 10), mClv);
    clvHead.castShadow = clvStem.castShadow = true;
    clvG.add(clvHead, clvStem);
    clvG.rotation.set(0.3, 0.8, -0.5);
    addSpice(clvG, -2.7, -1.7, -0.8, 1.05, 0.42, 0.008, -0.003, 0.9);

    /* 4 — BLACK PEPPER cluster */
    const pepG = new THREE.Group();
    [[-0.28,0.18,0.05],[0.22,-0.12,0.08],[0.02,0.35,-0.12],[-0.15,-0.28,0.18],[0.30,0.22,-0.06]]
      .forEach(([x,y,z]) => {
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.20+Math.random()*0.09,12,12), mPep);
        p.position.set(x, y, z); p.castShadow = true; pepG.add(p);
      });
    addSpice(pepG, 3.0, -1.5, -1.0, 0.85, 0.35, 0.005, 0.006, 1.2);

    /* 5 — FOXNUT disc */
    const fox = new THREE.Mesh(new THREE.SphereGeometry(0.58, 18, 18), mFox);
    fox.scale.set(1, 0.52, 1);
    addSpice(fox, 0.9, 2.1, -2.2, 0.76, 0.30, 0.004, 0.002, 0.6);

    /* ── Dust particles ───────────────────────────────────── */
    const dustPos = new Float32Array(240);
    for (let i = 0; i < 240; i += 3) {
      dustPos[i]   = (Math.random()-0.5)*16;
      dustPos[i+1] = (Math.random()-0.5)*12;
      dustPos[i+2] = (Math.random()-0.5)*7 - 2;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(dustGeo,
      new THREE.PointsMaterial({ color:0xD4893A, size:0.045, transparent:true, opacity:0.5 }));
    scene.add(dust);

    /* ── Smooth state (lerped each frame) ─────────────────── */
    let tiltX = 0, tiltY = 0;   // group tilt
    let groupX = 0, groupY = 0; // group position offset
    let camZ   = 9;

    const clock = new THREE.Clock();

    function scrollP() {
      return Math.min(Math.max(window.scrollY / (hero.offsetHeight||1), 0), 1);
    }

    /* ── Render loop ──────────────────────────────────────── */
    (function animate() {
      requestAnimationFrame(animate);
      const t  = clock.getElapsedTime();
      const sp = scrollP();

      /* Raw mouse (normalised -1..1) */
      const mx = typeof mouseNX !== 'undefined' ? mouseNX : 0;
      const my = typeof mouseNY !== 'undefined' ? mouseNY : 0;

      /* ── Camera forward on scroll ── */
      camZ += (9 - sp * 5 - camZ) * 0.065;
      camera.position.z = camZ;

      /* ── Scene-level tilt (aggressive, silky smooth) ──
         Large targets → big movement.
         Small lerp factor (0.032) → silky lag that feels fluid, not snappy. */
      tiltY += (mx * 1.4  - tiltY) * 0.032;
      tiltX += (my * 0.85 - tiltX) * 0.032;
      group.rotation.y = tiltY;
      group.rotation.x = tiltX;

      /* ── Group position drifts with mouse (world-space sweep) ── */
      groupX += (mx * 0.9 - groupX) * 0.03;
      groupY += (my * 0.5 - groupY) * 0.03;
      group.position.x = groupX;
      group.position.y = groupY;

      /* ── Scroll pulls group forward ── */
      group.position.z = sp * 2.8;

      /* ── Per-object: float + self-rotate + depth parallax ── */
      floaters.forEach(({ mesh, bx, by, bz, floatSpeed, floatAmp, ry, rx, pDepth }, i) => {
        /* self rotation */
        mesh.rotation.y += ry;
        mesh.rotation.x += rx;

        /* floating */
        mesh.position.y = by + Math.sin(t * floatSpeed + i * 1.3) * floatAmp;

        /* depth-layered parallax — objects at different "depths"
           move by different amounts when mouse moves.
           This creates the sense of genuine 3D separation.          */
        mesh.position.x = bx + mx * pDepth * 0.55;
        mesh.position.z = bz + my * pDepth * 0.25;
      });

      /* dust drifts slowly */
      dust.rotation.y = t * 0.025;
      dust.rotation.x = t * 0.010;

      renderer.render(scene, camera);
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
