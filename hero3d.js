/* hero3d.js — Three.js 3D spice models for the Vnik hero */
(function () {
  'use strict';

  function init() {
    const canvas = document.getElementById('hero3d');
    const hero   = document.getElementById('hero');
    if (!canvas || !hero || typeof THREE === 'undefined') return;

    /* ── Renderer ────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    /* ── Scene & Camera ──────────────────────────────────── */
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

    /* ── Lights ──────────────────────────────────────────── */
    scene.add(new THREE.AmbientLight(0xFFF5E4, 0.6));

    const sun = new THREE.DirectionalLight(0xFFE8C0, 2.2);
    sun.position.set(6, 10, 6);
    sun.castShadow = true;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xD4893A, 0.9);
    fill.position.set(-6, -3, 4);
    scene.add(fill);

    scene.add(Object.assign(new THREE.PointLight(0x2E7D6B, 1.6, 25), { position: { x: -2, y: -5, z: 3 } }));
    const tealPt = new THREE.PointLight(0x2E7D6B, 1.6, 25);
    tealPt.position.set(-2, -5, 3);
    scene.add(tealPt);

    const amberPt = new THREE.PointLight(0xD4893A, 1.1, 22);
    amberPt.position.set(4, 4, 2);
    scene.add(amberPt);

    /* ── Materials ───────────────────────────────────────── */
    const mat = (color, roughness, metalness) =>
      new THREE.MeshStandardMaterial({ color, roughness, metalness });

    const mCardamom = mat(0x3D6B47, 0.65, 0.05);
    const mCinnamon = mat(0x8B3A0F, 0.85, 0.00);
    const mClove    = mat(0x3D1C02, 0.60, 0.15);
    const mPepper   = mat(0x100503, 0.90, 0.05);
    const mFoxnut   = mat(0xF2E0B6, 0.50, 0.00);

    /* ── Spice Group (tilts with mouse) ──────────────────── */
    const group = new THREE.Group();
    scene.add(group);

    const floaters = [];
    function add(mesh, baseY, floatSpeed, floatAmp, ry, rx) {
      floaters.push({ mesh, baseY, floatSpeed, floatAmp, ry, rx });
    }

    /* 1 — CARDAMOM pods */
    const capGeo = new THREE.CapsuleGeometry(0.28, 0.75, 10, 22);
    const c1 = new THREE.Mesh(capGeo, mCardamom);
    c1.position.set(-3.4, 0.8, -1.2);
    c1.rotation.set(0.3, 0.5, 0.4);
    c1.castShadow = true;
    group.add(c1);
    add(c1, 0.8, 0.9, 0.18, 0.007, 0.004);

    const c2 = c1.clone();
    c2.position.set(-2.9, 0.0, -0.6);
    c2.rotation.set(-0.2, 1.2, -0.6);
    c2.scale.setScalar(0.72);
    group.add(c2);
    add(c2, 0.0, 1.1, 0.12, -0.005, 0.003);

    /* 2 — CINNAMON curl (partial torus) */
    const cinGeo = new THREE.TorusGeometry(0.52, 0.13, 10, 40, Math.PI * 1.65);
    const cin = new THREE.Mesh(cinGeo, mCinnamon);
    cin.position.set(3.2, 1.0, -1.8);
    cin.rotation.set(-0.5, 0.4, 0.3);
    cin.castShadow = true;
    group.add(cin);
    add(cin, 1.0, 0.72, 0.15, 0.006, 0.003);

    /* 3 — CLOVE (sphere + cylinder) */
    const clvG = new THREE.Group();
    const clvHead = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), mClove);
    clvHead.position.y = 0.58;
    const clvStem = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.09, 0.88, 10), mClove);
    [clvHead, clvStem].forEach(m => { m.castShadow = true; clvG.add(m); });
    clvG.position.set(-2.6, -1.6, -0.8);
    clvG.rotation.set(0.3, 0.8, -0.5);
    group.add(clvG);
    add(clvG, -1.6, 1.05, 0.20, 0.008, -0.003);

    /* 4 — BLACK PEPPER cluster */
    const pepG = new THREE.Group();
    [[-0.28,0.18,0.05],[0.22,-0.12,0.08],[0.02,0.35,-0.12],[-0.15,-0.28,0.18],[0.30,0.22,-0.06]]
      .forEach(([x,y,z]) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.20 + Math.random()*0.09, 12, 12), mPepper);
        m.position.set(x, y, z);
        m.castShadow = true;
        pepG.add(m);
      });
    pepG.position.set(2.9, -1.4, -1.0);
    group.add(pepG);
    add(pepG, -1.4, 0.85, 0.16, 0.005, 0.006);

    /* 5 — FOXNUT disc */
    const foxGeo = new THREE.SphereGeometry(0.55, 18, 18);
    const fox = new THREE.Mesh(foxGeo, mFoxnut);
    fox.scale.set(1, 0.52, 1);
    fox.position.set(0.8, 2.0, -2.2);
    fox.castShadow = true;
    group.add(fox);
    add(fox, 2.0, 0.76, 0.13, 0.004, 0.002);

    /* ── Ambient dust particles ──────────────────────────── */
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(180);
    for (let i = 0; i < 180; i += 3) {
      dustPos[i]   = (Math.random() - 0.5) * 14;
      dustPos[i+1] = (Math.random() - 0.5) * 10;
      dustPos[i+2] = (Math.random() - 0.5) * 6 - 2;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(dustGeo,
      new THREE.PointsMaterial({ color: 0xD4893A, size: 0.04, transparent: true, opacity: 0.45 }));
    scene.add(dust);

    /* ── State ───────────────────────────────────────────── */
    let tiltX = 0, tiltY = 0, camZ = 9;
    const clock = new THREE.Clock();

    function getScrollP() {
      return Math.min(Math.max(window.scrollY / (hero.offsetHeight || 1), 0), 1);
    }

    /* ── Render loop ─────────────────────────────────────── */
    (function animate() {
      requestAnimationFrame(animate);
      const t  = clock.getElapsedTime();
      const sp = getScrollP();

      /* Camera flies forward with scroll */
      camZ += (9 - sp * 4 - camZ) * 0.07;
      camera.position.z = camZ;

      /* Scene tilts with mouse */
      const mx = typeof mouseNX !== 'undefined' ? mouseNX : 0;
      const my = typeof mouseNY !== 'undefined' ? mouseNY : 0;
      tiltY += (mx * 0.28 - tiltY) * 0.06;
      tiltX += (my * 0.20 - tiltX) * 0.06;
      group.rotation.y = tiltY;
      group.rotation.x = tiltX;

      /* Scroll pulls objects forward */
      group.position.z = sp * 2.5;

      /* Float + self-rotate each spice */
      floaters.forEach(({ mesh, baseY, floatSpeed, floatAmp, ry, rx }) => {
        mesh.rotation.y += ry;
        mesh.rotation.x += rx;
        mesh.position.y = baseY + Math.sin(t * floatSpeed) * floatAmp;
      });

      /* Dust drifts */
      dust.rotation.y = t * 0.03;

      renderer.render(scene, camera);
    })();
  }

  /* Wait for Three.js to load */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
