/* showcase3d.js — Scroll-driven spice 3D showcase | cinematic PBR lighting */
import * as THREE from 'three';
import { GLTFLoader }               from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment }          from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { EffectComposer }           from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }               from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass }          from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass }               from 'three/addons/postprocessing/OutputPass.js';

RectAreaLightUniformsLib.init();

/* ── Config ─────────────────────────────────── */
const SPICES  = [
  { file:'cardamom.glb',    name:'Cardamom',     origin:'Kerala, India'  },
  { file:'cinnimom.glb',    name:'Cinnamon',     origin:'Sri Lanka'      },
  { file:'cloves.glb',      name:'Cloves',       origin:'Zanzibar'       },
  { file:'blackpepper.glb', name:'Black Pepper', origin:'Malabar Coast'  },
];
const WINDOWS  = [[-0.15,0.38],[0.18,0.62],[0.45,0.82],[0.68,1.10]];
const CALLOUTS  = [
  {
    tag:'Premium Export', headline:'Green Gold of Kerala',
    desc:'Hand-selected pods at peak ripeness, bold aroma, high essential oil content.',
    specs:[['Moisture','≤ 12%'],['Grade','AGMARK'],['Form','Whole Green Pods']]
  },
  {
    tag:'True Ceylon', headline:'Single-Origin Cinnamon',
    desc:'Delicate quills prized for low coumarin content, sweet warmth, and floral depth.',
    specs:[['Type','C. verum'],['Quill Grade','C4–C5'],['Coumarin','< 0.05%']]
  },
  {
    tag:'Dual-Origin', headline:'Whole Aromatic Cloves',
    desc:'Sun-dried cloves with high eugenol content, FSSAI and APEDA certified.',
    specs:[['Oil Content','≥ 15%'],['Moisture','≤ 12%'],['Cert','FSSAI + APEDA']]
  },
  {
    tag:'Malabar Coast', headline:'Bold Black Pepper',
    desc:'Pungent whole peppercorns from India's pepper coast — globally trusted since antiquity.',
    specs:[['Bold Grade','≥ 4.5 mm'],['Piperine','≥ 5%'],['Moisture','≤ 12%']]
  },
];

const lerp  = (a,b,t) => a+(b-a)*t;
const easeO = t => 1-Math.pow(1-t,3);
const easeI = t => t*t*t;
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const map   = (v,a,b) => clamp((v-a)/(b-a),0,1);

const canvas  = document.getElementById('showcase3d');
const section = document.getElementById('spice-showcase');
if (!canvas||!section) throw new Error('Missing DOM');

/* ── Renderer ───────────────────────────────── */
const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.VSMShadowMap;   // variance soft shadows
renderer.toneMapping       = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
renderer.outputColorSpace  = THREE.SRGBColorSpace;

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
camera.position.set(0, 0, 8);

/* ── HDR Room Environment (studio-quality reflections) ── */
const pmrem  = new THREE.PMREMGenerator(renderer);
const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environment    = envMap;   // all PBR materials pick this up automatically
scene.environmentIntensity = 1.8;
pmrem.dispose();

/* ── Resize ─────────────────────────────────── */
let W = section.offsetWidth, H = window.innerHeight;
function resize() {
  W = section.offsetWidth; H = window.innerHeight;
  renderer.setSize(W, H, false);
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  composer.setSize(W, H);
  bloomPass.resolution.set(W, H);
}

/* ── Lights ─────────────────────────────────── */

// Key light — warm studio overhead softbox
const key = new THREE.RectAreaLight(0xFFF4E0, 10, 5, 7);
key.position.set(0, 7, 4);
key.lookAt(0, 0, 0);
scene.add(key);

// Fill — cool-blue left panel
const fillL = new THREE.RectAreaLight(0xC8E0FF, 5, 4, 6);
fillL.position.set(-6, 2, 3);
fillL.lookAt(0, 0, 0);
scene.add(fillL);

// Rim — warm amber right
const rimR = new THREE.RectAreaLight(0xFFAA44, 7, 4, 6);
rimR.position.set(6, 1, -2);
rimR.lookAt(0, 0, 0);
scene.add(rimR);

// Bottom bounce
const bounce = new THREE.RectAreaLight(0xFFEEDD, 3, 6, 4);
bounce.position.set(0, -4, 2);
bounce.lookAt(0, 0, 0);
scene.add(bounce);

// Subtle point for specular pop
const specPt = new THREE.PointLight(0xFFFFFF, 2, 20);
specPt.position.set(3, 6, 5);
scene.add(specPt);

/* ── Post-processing ────────────────────────── */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(W, H),
  0.35,   // strength  — subtle glow on bright highlights
  0.5,    // radius
  0.82    // threshold — only brightest surfaces glow
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());   // correct color space output

/* ── Now resize (needs composer) ────────────── */
resize();
window.addEventListener('resize', resize);

/* ── Load GLB models ────────────────────────── */
const loader   = new GLTFLoader();
const pivots   = Array(SPICES.length).fill(null);
const statusEl = document.getElementById('showcaseStatus');

let pending = SPICES.length;
function onDone() {
  if (--pending === 0 && statusEl) statusEl.textContent = 'scroll to explore';
}

function makeFallback(i) {
  const g = new THREE.Group();
  const colors = [0x3D7A4F, 0x8B3A0F, 0x3D1C02, 0x1A0A00];
  g.add(new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.4, 3),
    new THREE.MeshStandardMaterial({ color:colors[i], roughness:0.4, metalness:0.2, envMapIntensity:2 })
  ));
  g.visible = false; scene.add(g); pivots[i] = g; onDone();
}

SPICES.forEach((sp, i) => {
  if (statusEl) statusEl.textContent = `Loading ${sp.name}…`;
  loader.load(sp.file, (gltf) => {
    const model = gltf.scene;

    // Normalise size to 3 units
    const box  = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.scale.setScalar(3 / Math.max(size.x, size.y, size.z, 0.001));

    // Centre on pivot
    const box2 = new THREE.Box3().setFromObject(model);
    model.position.sub(box2.getCenter(new THREE.Vector3()));

    // Boost material quality — keep GLB textures, amplify env reflections
    model.traverse(c => {
      if (!c.isMesh) return;
      c.castShadow = c.receiveShadow = true;
      const mats = Array.isArray(c.material) ? c.material : [c.material];
      mats.forEach(m => {
        m.envMapIntensity = 2.2;   // environment reflections
        m.needsUpdate = true;
      });
    });

    const pivot = new THREE.Group();
    pivot.add(model);
    pivot.visible = false;
    scene.add(pivot);
    pivots[i] = pivot;
    onDone();
  }, undefined, () => makeFallback(i));
});

/* ── UI ─────────────────────────────────────── */
const nameEl   = document.getElementById('showcaseSpiceName');
const originEl = document.getElementById('showcaseSpiceOrigin');
const dots     = [...document.querySelectorAll('#showcaseDots .dot')];

/* Callout DOM */
const calloutL  = document.getElementById('calloutLeft');
const calloutR  = document.getElementById('calloutRight');
const coTag     = document.getElementById('calloutTag');
const coHead    = document.getElementById('calloutHeadline');
const coDesc    = document.getElementById('calloutDesc');
const coSpecs   = document.getElementById('calloutSpecs');

let lastCallout = -1;
function showCallout(i) {
  if (i === lastCallout) return;
  lastCallout = i;
  const c = CALLOUTS[i];
  if (coTag)  coTag.textContent  = c.tag;
  if (coHead) coHead.textContent = c.headline;
  if (coDesc) coDesc.textContent = c.desc;
  if (coSpecs) {
    coSpecs.innerHTML = c.specs.map(([l,v]) =>
      `<li><span class="spec-label">${l}</span><span class="spec-val">${v}</span></li>`
    ).join('');
  }
  calloutL?.classList.add('visible');
  calloutR?.classList.add('visible');
}
function hideCallout() {
  calloutL?.classList.remove('visible');
  calloutR?.classList.remove('visible');
  lastCallout = -1;
}
let lastLabel  = -1;
function setLabel(i) {
  if (i === lastLabel) return; lastLabel = i;
  if (nameEl)   nameEl.textContent   = SPICES[i].name;
  if (originEl) originEl.textContent = SPICES[i].origin;
  dots.forEach((d,j) => d.classList.toggle('active', j===i));
}

/* ── Smooth lerp state ──────────────────────── */
const sX  = Array(4).fill(12);
const sRY = Array(4).fill(0);
const sOp = Array(4).fill(0);
const clock = new THREE.Clock();

/* ── Render loop ────────────────────────────── */
(function animate() {
  requestAnimationFrame(animate);
  const t    = clock.getElapsedTime();
  const rect = section.getBoundingClientRect();
  const maxS = Math.max(section.offsetHeight - window.innerHeight, 1);
  const prog = clamp(-rect.top / maxS, 0, 1);

  let bestI = 0, bestOp = 0;

  SPICES.forEach((_, i) => {
    const [lo, hi] = WINDOWS[i];
    const lp = map(prog, lo, hi);

    let tX, tRY, tOp;
    if (lp < 0.28) {
      const p = easeO(lp / 0.28);
      tX = lerp(12, 0, p); tRY = 0; tOp = p;
    } else if (lp < 0.72) {
      const p = (lp - 0.28) / 0.44;
      tX = 0; tRY = p * Math.PI * 2; tOp = 1;
    } else {
      const p = easeI((lp - 0.72) / 0.28);
      tX = lerp(0, -12, p); tRY = Math.PI * 2; tOp = 1 - p;
    }

    sX[i]  += (tX  - sX[i])  * 0.12;
    sRY[i] += (tRY - sRY[i]) * 0.12;
    sOp[i] += (tOp - sOp[i]) * 0.12;

    const pivot = pivots[i];
    if (!pivot) return;
    pivot.visible = sOp[i] > 0.01;

    if (pivot.visible) {
      const child = pivot.children[0];
      if (child) {
        child.position.x = sX[i];
        child.rotation.y = sRY[i];
        child.position.y = Math.sin(t * 0.7 + i) * 0.2;
      }
      pivot.traverse(m => {
        if (m.isMesh && m.material) {
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          mats.forEach(mat => { mat.transparent = true; mat.opacity = clamp(sOp[i], 0, 1); });
        }
      });
    }
    if (sOp[i] > bestOp) { bestOp = sOp[i]; bestI = i; }
  });

  if (bestOp > 0.3) setLabel(bestI);

  /* Callout: show during spin phase, hide when entering/exiting */
  const [blo, bhi] = WINDOWS[bestI];
  const blp = map(prog, blo, bhi);
  const isSpinning = blp >= 0.26 && blp <= 0.74 && bestOp > 0.75;
  if (isSpinning) showCallout(bestI);
  else            hideCallout();

  // Specular point light follows the camera slightly for dynamic highlights
  specPt.position.set(3 + Math.sin(t*0.3)*2, 6, 5 + Math.cos(t*0.2));

  composer.render();   // post-processed render (bloom + colour correct)
})();
