import * as THREE from "three";

const $ = (selector) => document.querySelector(selector);
const canvasHost = $("#game-canvas");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9aafc2);
scene.fog = new THREE.FogExp2(0x9aafc2, 0.016);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 350);
camera.position.set(9, 8, 18);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
canvasHost.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xd9eeff, 0x2f3b39, 2.7));
const sun = new THREE.DirectionalLight(0xffffff, 3.5);
sun.position.set(-12, 18, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(1536, 1536);
Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24 });
scene.add(sun);

const materials = {
  platform: new THREE.MeshStandardMaterial({ color: 0x202528, roughness: 0.72, metalness: 0.08 }),
  top: new THREE.MeshStandardMaterial({ color: 0xd8ff43, roughness: 0.52 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x090909, roughness: 0.38, metalness: 0.2 }),
  white: new THREE.MeshStandardMaterial({ color: 0xeae9e4, roughness: 0.7 })
};
const platforms = [];
const shards = [];

function createPlatform(x, y, z, width = 5, depth = 4, moving = false) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(width, 1.1, depth), materials.platform);
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);
  const top = new THREE.Mesh(new THREE.BoxGeometry(width * 0.96, 0.08, depth * 0.96), materials.top);
  top.position.y = 0.59;
  top.receiveShadow = true;
  group.add(top);
  group.position.set(x, y, z);
  group.userData = { width, depth, baseX: x, moving, phase: Math.random() * Math.PI * 2 };
  platforms.push(group);
  scene.add(group);
}

[
  [0, 0, 0, 7, 5, false], [0, 1.1, -7, 4.2, 3.3, false], [3.3, 2.2, -13, 3.6, 3.5, true],
  [-1.8, 3.4, -19, 5, 3.2, false], [-5.2, 4.8, -25, 3.7, 3.7, true], [-1, 6.1, -31, 4.6, 3.3, false],
  [4.2, 7.5, -37, 4, 3.4, true], [1, 9, -44, 7, 5, false]
].forEach((entry) => createPlatform(...entry));

platforms.slice(1).forEach((platform, index) => {
  const shard = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.38, 0),
    new THREE.MeshStandardMaterial({ color: 0xd9ff43, emissive: 0x577a00, emissiveIntensity: 1.8, metalness: 0.35, roughness: 0.18 })
  );
  shard.position.copy(platform.position);
  shard.position.y += 1.8;
  shard.userData = { collected: false, platform, index };
  shard.castShadow = true;
  shards.push(shard);
  scene.add(shard);
});

const player = new THREE.Group();
const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.64, 1), materials.white);
body.scale.y = 1.25;
body.castShadow = true;
player.add(body);
const visor = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.18, 0.38), materials.dark);
visor.position.set(0, 0.13, -0.54);
visor.rotation.x = -0.12;
player.add(visor);
const playerLight = new THREE.PointLight(0xd9ff43, 2.3, 7);
playerLight.position.set(0, 0.5, 0);
player.add(playerLight);
scene.add(player);

const ringGeometry = new THREE.TorusGeometry(18, 0.035, 8, 120);
for (let i = 0; i < 5; i += 1) {
  const ring = new THREE.Mesh(ringGeometry, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 }));
  ring.rotation.x = Math.PI / 2;
  ring.position.set((i % 2) * 7 - 3, -5 + i * 3.5, -15 - i * 11);
  ring.scale.setScalar(0.7 + i * 0.25);
  scene.add(ring);
}

const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(900);
for (let i = 0; i < particlePositions.length; i += 3) {
  particlePositions[i] = (Math.random() - 0.5) * 90;
  particlePositions[i + 1] = Math.random() * 34 - 8;
  particlePositions[i + 2] = Math.random() * -110 + 20;
}
particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
scene.add(new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.09, transparent: true, opacity: 0.55 })));

const state = { active: false, won: false, grounded: true, velocity: new THREE.Vector3(), keys: { left: false, right: false }, shards: 0, sound: false };
let audioContext;
function tone(frequency, duration = 0.08) {
  if (!state.sound) return;
  audioContext ||= new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.055, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function updateHud() {
  $("#shard-count").textContent = `${String(state.shards).padStart(2, "0")} / 07`;
  $("#distance-count").textContent = `${String(Math.max(0, Math.round(-player.position.z))).padStart(3, "0")}m`;
}
function resetGame() {
  player.position.set(0, 1.35, 0.8);
  player.rotation.set(0, 0, 0);
  state.velocity.set(0, 0, 0);
  state.grounded = false;
  state.won = false;
  state.shards = 0;
  shards.forEach((shard) => { shard.visible = true; shard.userData.collected = false; });
  $("#game-message").hidden = true;
  updateHud();
}
function startGame() {
  document.body.classList.add("game-active");
  state.active = true;
  $("#game-hud").hidden = false;
  $("#touch-controls").hidden = false;
  $("#top").scrollIntoView({ behavior: "smooth" });
  resetGame();
  tone(440, 0.15);
}
function jump() {
  if (!state.active || !state.grounded || state.won) return;
  state.velocity.y = 8.5;
  state.grounded = false;
  tone(280, 0.1);
}
function nearestLanding(previousY) {
  if (state.velocity.y > 0) return null;
  return platforms.find((platform) => {
    const top = platform.position.y + 0.55;
    const wasAbove = previousY - 0.8 >= top - 0.15;
    const withinX = Math.abs(player.position.x - platform.position.x) < platform.userData.width / 2 + 0.35;
    const withinZ = Math.abs(player.position.z - platform.position.z) < platform.userData.depth / 2 + 0.35;
    return wasAbove && player.position.y - 0.8 <= top + 0.15 && withinX && withinZ;
  });
}

function updateGame(delta, elapsed) {
  platforms.forEach((platform, index) => {
    if (platform.userData.moving) platform.position.x = platform.userData.baseX + Math.sin(elapsed * 0.75 + platform.userData.phase) * 2.1;
    if (index > 0) platform.rotation.y = Math.sin(elapsed * 0.18 + index) * 0.035;
  });
  shards.forEach((shard) => {
    shard.position.x = shard.userData.platform.position.x;
    shard.position.z = shard.userData.platform.position.z;
    shard.rotation.y += delta * 2;
    shard.rotation.x = Math.sin(elapsed * 2 + shard.userData.index) * 0.25;
    shard.position.y = shard.userData.platform.position.y + 1.7 + Math.sin(elapsed * 2 + shard.userData.index) * 0.16;
  });
  if (!state.active || state.won) return;
  const previousY = player.position.y;
  const direction = (state.keys.right ? 1 : 0) - (state.keys.left ? 1 : 0);
  state.velocity.x += direction * 20 * delta;
  state.velocity.x *= Math.pow(0.012, delta);
  state.velocity.z = Math.max(state.velocity.z - 9.3 * delta, -5.2);
  state.velocity.y -= 20 * delta;
  player.position.addScaledVector(state.velocity, delta);
  player.rotation.z = THREE.MathUtils.lerp(player.rotation.z, -state.velocity.x * 0.06, 1 - Math.pow(0.003, delta));
  player.rotation.x += delta * Math.min(4, Math.abs(state.velocity.z) * 0.5);
  const landing = nearestLanding(previousY);
  if (landing) {
    player.position.y = landing.position.y + 1.35;
    state.velocity.y = 0;
    state.grounded = true;
  } else if (state.velocity.y < -0.2) state.grounded = false;
  shards.forEach((shard) => {
    if (!shard.userData.collected && player.position.distanceTo(shard.position) < 1.3) {
      shard.userData.collected = true;
      shard.visible = false;
      state.shards += 1;
      tone(620 + state.shards * 45, 0.14);
    }
  });
  if (player.position.z < -42.2 && Math.abs(player.position.x - platforms.at(-1).position.x) < 4 && player.position.y > 8) {
    state.won = true;
    $("#game-message").hidden = false;
    tone(880, 0.45);
  }
  if (player.position.y < -12) resetGame();
  updateHud();
}

const clock = new THREE.Clock();
const cameraTarget = new THREE.Vector3();
function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.035);
  const elapsed = clock.elapsedTime;
  updateGame(delta, elapsed);
  const targetZ = state.active ? player.position.z + 15 : 18;
  const targetX = state.active ? player.position.x + 7 : 9 + Math.sin(elapsed * 0.08) * 2;
  const targetY = state.active ? Math.max(player.position.y + 6, 7) : 8 + Math.sin(elapsed * 0.12);
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.035);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.035);
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.035);
  cameraTarget.set(player.position.x, state.active ? player.position.y : 2, state.active ? player.position.z - 7 : -10);
  camera.lookAt(cameraTarget);
  renderer.render(scene, camera);
}
function resize() {
  const width = canvasHost.clientWidth;
  const height = canvasHost.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();
resetGame();
animate();

function setKey(key, pressed) {
  if (["ArrowLeft", "a", "A"].includes(key)) state.keys.left = pressed;
  if (["ArrowRight", "d", "D"].includes(key)) state.keys.right = pressed;
}
window.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", " "].includes(event.key) && state.active) event.preventDefault();
  setKey(event.key, true);
  if (event.key === " ") jump();
  if (["r", "R"].includes(event.key) && state.active) resetGame();
});
window.addEventListener("keyup", (event) => setKey(event.key, false));
document.querySelectorAll("[data-key]").forEach((button) => {
  const action = button.dataset.key;
  const press = (event) => { event.preventDefault(); if (action === "jump") jump(); else state.keys[action] = true; };
  const release = (event) => { event.preventDefault(); if (action !== "jump") state.keys[action] = false; };
  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
});
[$("#play-button"), $("#footer-play-button")].forEach((button) => button.addEventListener("click", startGame));
[$("#restart-button"), $("#play-again-button")].forEach((button) => button.addEventListener("click", resetGame));
$("#sound-toggle").addEventListener("click", (event) => {
  state.sound = !state.sound;
  event.currentTarget.setAttribute("aria-pressed", String(state.sound));
  event.currentTarget.querySelector("span:last-child").textContent = state.sound ? "Sound on" : "Sound off";
  tone(520, 0.1);
});

$("#load-progress").style.transform = "scaleX(.55)";
window.setTimeout(() => { $("#load-progress").style.transform = "scaleX(1)"; }, 150);
window.setTimeout(() => $("#loader").classList.add("is-done"), 650);
