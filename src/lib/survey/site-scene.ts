import * as THREE from "three";
import { FINDER_HFOV, verticalFovDeg } from "./optics";
import type { Point } from "./types";

export interface LaserHit {
  sd: number;
  label: string;
  code: string;
  n: number;
  e: number;
  z: number;
  kind: "prism" | "pole" | "ground" | "feature";
}

interface Origin {
  n: number;
  e: number;
}

function rng(seed: number) {
  return function next() {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class SiteScene {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  private readonly raycaster = new THREE.Raycaster();
  private readonly disposables: Array<{ dispose: () => void }> = [];
  private readonly mats: Record<string, THREE.Material> = {};
  private readonly origin: Origin;
  private readonly groundY: number;
  private readonly targets = new THREE.Group();
  private readonly clouds = new THREE.Group();
  private pointKey = "";
  private sun!: THREE.Mesh;
  private sunGlow!: THREE.Mesh;
  private t = 0;
  private hfov = FINDER_HFOV;
  private readonly marks: Array<{ label: string; code: string; n: number; e: number; z: number }> = [];
  private jobMarks: Array<{ label: string; code: string; n: number; e: number; z: number }> = [];
  private beam!: THREE.Line;
  private beamLife = 0;
  lastHit: LaserHit | null = null;

  constructor(canvas: HTMLCanvasElement, origin: Origin, groundY: number) {
    this.origin = origin;
    this.groundY = groundY;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = false;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xb7c0ae, 380, 2600);
    this.scene.background = new THREE.Color(0x87a0b2);

    this.camera = new THREE.PerspectiveCamera(28, 1, 0.35, 5000);
    this.scene.add(this.camera);

    this.buildSky();
    this.buildLights();
    this.buildTerrain();
    this.buildHills();
    this.buildHorizon();
    this.buildForest();
    this.buildLot();
    this.scene.add(this.targets);
    this.scene.add(this.clouds);
    this.buildClouds();
    this.seedMarks();
    const beamMat = new THREE.LineBasicMaterial({
      color: 0xff3b2f,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.beam = new THREE.Line(new THREE.BufferGeometry(), beamMat);
    this.beam.visible = false;
    this.beam.frustumCulled = false;
    this.scene.add(this.beam);
    this.disposables.push(beamMat);
  }

  toVec(n: number, e: number, z: number, out = new THREE.Vector3()) {
    return out.set(e - this.origin.e, z, -(n - this.origin.n));
  }

  fromVec(v: THREE.Vector3): { n: number; e: number; z: number } {
    return { n: this.origin.n - v.z, e: this.origin.e + v.x, z: v.y };
  }

  resize(w: number, h: number) {
    if (w < 2 || h < 2) return;
    this.renderer.setSize(w, h, false);
    this.setHfov(this.hfov, w / h);
  }

  setHfov(hFovDeg: number, aspect: number) {
    this.hfov = hFovDeg;
    this.camera.aspect = aspect;
    this.camera.fov = verticalFovDeg(hFovDeg, aspect);
    this.camera.updateProjectionMatrix();
  }

  setView(azDeg: number, zaDeg: number, rollDeg: number, n: number, e: number, z: number) {
    const pos = this.toVec(n, e, z);
    this.camera.position.copy(pos);

    const az = (azDeg * Math.PI) / 180;
    const za = (zaDeg * Math.PI) / 180;
    const forward = new THREE.Vector3(Math.sin(az) * Math.sin(za), Math.cos(za), -Math.cos(az) * Math.sin(za)).normalize();
    const worldUp = new THREE.Vector3(0, 1, 0);
    const xAxis = new THREE.Vector3().crossVectors(forward, worldUp);
    if (xAxis.lengthSq() < 1e-8) xAxis.set(1, 0, 0);
    else xAxis.normalize();
    const yAxis = new THREE.Vector3().crossVectors(xAxis, forward).normalize();
    const m = new THREE.Matrix4();
    m.makeBasis(xAxis, yAxis, forward.clone().negate());
    this.camera.quaternion.setFromRotationMatrix(m);
    if (Math.abs(rollDeg) > 0.05) {
      this.camera.rotateZ((-rollDeg * Math.PI) / 180);
    }
    this.sun.position.copy(pos).add(new THREE.Vector3(820, 340, 180));
    this.sun.lookAt(pos);
    this.sunGlow.position.copy(this.sun.position);
    this.sunGlow.lookAt(pos);
  }

  syncPoints(points: Point[], occupiedId: string | null) {
    const key = points.map((p) => `${p.id}:${p.n}:${p.e}:${p.z}:${p.code}:${p.name}`).join("|") + occupiedId;
    if (key === this.pointKey) return;
    this.pointKey = key;
    while (this.targets.children.length) {
      const ch = this.targets.children.pop()!;
      ch.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry && mesh.userData.ownGeo) mesh.geometry.dispose();
      });
      this.targets.remove(ch);
    }
    for (const p of points) {
      if (p.id === occupiedId) continue;
      this.targets.add(this.makeTarget(p));
    }
    this.jobMarks = points
      .filter((p) => p.id !== occupiedId)
      .map((p) => ({
        label: p.name,
        code: p.code,
        n: p.n,
        e: p.e,
        z: p.z + (p.code === "PIN" || p.code === "CP" || p.code === "FS" || p.code === "MON" ? 5 : 2),
      }));
  }

  range(): LaserHit | null {
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    this.raycaster.far = 2500;
    const hits = this.raycaster.intersectObjects(this.scene.children, true);
    const wp = new THREE.Vector3();
    for (const h of hits) {
      if (!h.object.userData.target) continue;
      const label = String(h.object.userData.label ?? "ground");
      const code = String(h.object.userData.code ?? "TP");
      const kind =
        (h.object.userData.kind as LaserHit["kind"] | undefined) ??
        (label === "ground" ? "ground" : "feature");

      if (kind === "prism") {
        const g = h.object.parent;
        if (g) {
          g.getWorldPosition(wp);
          wp.y += 5;
        } else {
          h.object.getWorldPosition(wp);
        }
        const sd = this.camera.position.distanceTo(wp);
      if (sd > 0.5) {
          const nez = this.fromVec(wp);
          this.lastHit = { sd, label, code, n: nez.n, e: nez.e, z: nez.z, kind };
          return this.lastHit;
        }
        continue;
      }

      let sd = h.distance;
      if (kind !== "ground") {
        h.object.getWorldPosition(wp);
        sd = this.camera.position.distanceTo(wp);
      }
      if (!(sd > 0.5)) continue;
      const world = kind === "ground" ? h.point : wp;
      const nez = this.fromVec(world);
      this.lastHit = { sd, label, code, n: nez.n, e: nez.e, z: nez.z, kind };
      return this.lastHit;
    }
    this.lastHit = null;
    return null;
  }

  fire(): LaserHit | null {
    const hit = this.range();
    if (!hit) {
      this.beam.visible = false;
      return null;
    }
    const from = this.camera.position.clone();
    const to = this.toVec(hit.n, hit.e, hit.z);
    this.beam.geometry.dispose();
    this.beam.geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
    const mat = this.beam.material as THREE.LineBasicMaterial;
    mat.opacity = 1;
    this.beam.visible = true;
    this.beamLife = 0.38;
    return hit;
  }

  nearest(azDeg: number, zaDeg: number, maxDeg: number): { label: string; dAz: number; dZa: number; sd: number } | null {
    let best: { label: string; dAz: number; dZa: number; sd: number } | null = null;
    let bestAng = maxDeg;
    const cam = this.camera.position;
    const all = this.marks.concat(this.jobMarks);
    for (const m of all) {
      const p = this.toVec(m.n, m.e, m.z);
      const dN = m.n - this.fromVec(cam).n;
      const dE = m.e - this.fromVec(cam).e;
      const dZ = m.z - cam.y;
      const hd = Math.hypot(dN, dE);
      const sd = Math.hypot(hd, dZ);
      if (sd < 2) continue;
      const az = ((Math.atan2(dE, dN) * 180) / Math.PI + 360) % 360;
      const za = (Math.atan2(hd, dZ) * 180) / Math.PI;
      let dAz = az - azDeg;
      while (dAz > 180) dAz -= 360;
      while (dAz < -180) dAz += 360;
      const dZa = za - zaDeg;
      const ang = Math.hypot(dAz, dZa);
      if (ang < bestAng) {
        bestAng = ang;
        best = { label: m.label, dAz, dZa, sd };
      }
    }
    return best;
  }

  tick(dt: number) {
    this.t += dt;
    this.clouds.position.x = Math.sin(this.t * 0.012) * 40;
    this.clouds.position.z = Math.cos(this.t * 0.008) * 18;
    if (this.beamLife > 0) {
      this.beamLife -= dt;
      const mat = this.beam.material as THREE.LineBasicMaterial;
      mat.opacity = Math.max(0, this.beamLife / 0.38);
      this.beam.visible = this.beamLife > 0;
    }
    this.renderer.render(this.scene, this.camera);
  }

  private seedMarks() {
    const o = this.origin;
    const g = this.groundY;
    const add = (label: string, code: string, n: number, e: number, z: number) => {
      this.marks.push({ label, code, n, e, z });
    };
    add("FS", "FS", o.n - 16, o.e + 82, g + 5);
    add("house", "BLDG", o.n - 145, o.e + 200, g + 10);
    add("barn", "BLDG", o.n - 118, o.e + 310, g + 8);
    add("silo", "BLDG", o.n + 18, o.e + 620, g + 18);
    add("mailbox", "TP", o.n - 238, o.e + 8, g + 4);
    add("gate", "FENCE", o.n - 18, o.e + 348, g + 3);
    add("shed", "BLDG", o.n - 110, o.e + 290, g + 6);
    add("tree", "TREE", o.n - 48, o.e + 92, g + 12);
    add("hydrant", "FH", o.n - 120, o.e + 180, g + 2.5);
    add("power pole", "POLE", o.n - 75, o.e - 112, g + 20);
  }

  dispose() {
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
    });
    for (const m of Object.values(this.mats)) m.dispose();
    for (const d of this.disposables) d.dispose();
    this.renderer.dispose();
  }

  private track<T extends THREE.Material>(name: string, m: T): T {
    const existing = this.mats[name];
    if (existing) {
      m.dispose();
      return existing as T;
    }
    this.mats[name] = m;
    return m;
  }

  private loadTex(url: string, apply: (tex: THREE.Texture) => void) {
    const loader = new THREE.TextureLoader();
    loader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      this.disposables.push(tex);
      apply(tex);
    });
  }

  private buildLights() {
    const hemi = new THREE.HemisphereLight(0xc4d2e0, 0x4a5340, 1.05);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffe6c4, 1.55);
    sun.position.set(480, 260, 80);
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight(0x7e93a6, 0.32);
    fill.position.set(-160, 90, -160);
    this.scene.add(fill);
  }

  private buildSky() {
    const c = document.createElement("canvas");
    c.width = 8;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#2f5070");
    g.addColorStop(0.38, "#7ea0b8");
    g.addColorStop(0.5, "#e4d2ae");
    g.addColorStop(0.56, "#b7bea8");
    g.addColorStop(1, "#6a7564");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 8, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.disposables.push(tex);
    const mat = this.track(
      "sky",
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false }),
    );
    const sky = new THREE.Mesh(new THREE.SphereGeometry(3200, 24, 16), mat);
    sky.renderOrder = -10;
    sky.frustumCulled = false;
    this.scene.add(sky);

    const sunGeo = new THREE.CircleGeometry(10, 24);
    const sunMat = this.track(
      "sun",
      new THREE.MeshBasicMaterial({ color: 0xf2e4b8, fog: false, transparent: true, opacity: 0.95 }),
    );
    this.sun = new THREE.Mesh(sunGeo, sunMat);
    this.sun.position.set(-900, 420, 380);
    this.scene.add(this.sun);
    const glowMat = this.track(
      "sunGlow",
      new THREE.MeshBasicMaterial({
        color: 0xf7e0a8,
        fog: false,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      }),
    );
    this.sunGlow = new THREE.Mesh(new THREE.CircleGeometry(42, 24), glowMat);
    this.sunGlow.position.copy(this.sun.position);
    this.scene.add(this.sunGlow);
  }

  private sidingTexture() {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#d4ccbe";
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = "rgba(90,82,70,0.28)";
    ctx.lineWidth = 1;
    for (let y = 8; y < 128; y += 10) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(128, y);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 4);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.disposables.push(tex);
    return tex;
  }

  private poleTexture() {
    const c = document.createElement("canvas");
    c.width = 32;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#c24f22" : "#f3efe6";
      ctx.fillRect(0, i * 32, 32, 32);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.disposables.push(tex);
    return tex;
  }

  private buildTerrain() {
    const grass = this.track("grass", new THREE.MeshLambertMaterial({ color: 0x9aab88 }));
    const ground = new THREE.Mesh(new THREE.CircleGeometry(2200, 64), grass);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = this.groundY;
    ground.userData = { target: true, label: "ground", code: "TP", kind: "ground" };
    this.scene.add(ground);
    this.loadTex("/site/grass.jpg", (tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(22, 22);
      grass.map = tex;
      grass.color.set(0xffffff);
      grass.needsUpdate = true;
    });

    const dirt = this.track("dirt", new THREE.MeshLambertMaterial({ color: 0x6a5c48 }));
    const pad = new THREE.Mesh(new THREE.CircleGeometry(6, 20), dirt);
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = this.groundY + 0.04;
    this.scene.add(pad);

    const tracks = this.track("tracks", new THREE.MeshLambertMaterial({ color: 0x6e6354 }));
    for (const nOff of [-1.1, 1.1]) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(320, 0.05, 0.7), tracks);
      strip.position.copy(this.toVec(this.origin.n + nOff, this.origin.e + 170, this.groundY + 0.03));
      this.scene.add(strip);
    }
  }

  private buildHills() {
    const hill = this.track("hill", new THREE.MeshLambertMaterial({ color: 0x5c6854 }));
    const far = this.track("farHill", new THREE.MeshLambertMaterial({ color: 0x6e7a68 }));
    const rnd = rng(4);
    for (let i = 0; i < 14; i++) {
      const az = (i / 14) * Math.PI * 2 + rnd() * 0.3;
      const dist = 900 + rnd() * 700;
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(180 + rnd() * 160, 10, 8), i % 2 ? hill : far);
      mesh.scale.y = 0.22 + rnd() * 0.12;
      mesh.position.set(Math.sin(az) * dist, this.groundY + 10, -Math.cos(az) * dist);
      this.scene.add(mesh);
    }
  }

  private buildHorizon() {
    const mat = this.track(
      "treeline",
      new THREE.MeshBasicMaterial({
        color: 0xd4dcc8,
        transparent: true,
        opacity: 0.95,
        side: THREE.BackSide,
        depthWrite: false,
        fog: true,
      }),
    );
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(1480, 1480, 240, 48, 1, true), mat);
    mesh.position.y = this.groundY + 95;
    mesh.renderOrder = -6;
    mesh.frustumCulled = false;
    this.scene.add(mesh);
    this.loadTex("/site/treeline.png", (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(4, 1);
      mat.map = tex;
      mat.color.set(0xffffff);
      mat.needsUpdate = true;
    });
  }

  private buildForest() {
    const trunkMat = this.track("trunk", new THREE.MeshLambertMaterial({ color: 0x4a3b2c }));
    const leafMat = this.track("leaf", new THREE.MeshLambertMaterial({ color: 0x3f5a3c }));
    const leaf2 = this.track("leaf2", new THREE.MeshLambertMaterial({ color: 0x4e6a44 }));
    const trunkGeo = new THREE.CylinderGeometry(0.32, 0.55, 14, 6);
    const crownGeo = new THREE.ConeGeometry(3.6, 16, 7);
    const crownGeo2 = new THREE.ConeGeometry(2.6, 11, 7);
    const roundGeo = new THREE.SphereGeometry(4.4, 7, 5);
    const rnd = rng(11);
    const count = 140;
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
    const crowns = new THREE.InstancedMesh(crownGeo, leafMat, count);
    const crowns2 = new THREE.InstancedMesh(crownGeo2, leaf2, count);
    const rounds = new THREE.InstancedMesh(roundGeo, leaf2, 50);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    let i = 0;
    let r = 0;
    while (i < count) {
      const az = rnd() * Math.PI * 2;
      const dist = 90 + rnd() * 980;
      const nOff = Math.cos(az) * dist;
      const eOff = Math.sin(az) * dist;
      if (Math.abs(eOff) < 420 && nOff < 50 && nOff > -300) {
        if (rnd() > 0.08) continue;
      }
      if (Math.abs(nOff) < 18 && eOff > 10 && eOff < 700) continue;
      const scale = 0.85 + rnd() * 1.15;
      p.set(eOff, this.groundY + 7 * scale, -nOff);
      s.set(scale, scale, scale);
      q.identity();
      m.compose(p, q, s);
      trunks.setMatrixAt(i, m);
      if (rnd() > 0.62 && r < 50) {
        p.y = this.groundY + 12 * scale;
        s.set(scale * 1.1, scale * 0.9, scale * 1.1);
        m.compose(p, q, s);
        rounds.setMatrixAt(r, m);
        r++;
        s.set(0, 0, 0);
        m.compose(p, q, s);
        crowns.setMatrixAt(i, m);
        crowns2.setMatrixAt(i, m);
      } else {
        p.y = this.groundY + 16 * scale;
        s.set(scale, scale, scale);
        m.compose(p, q, s);
        crowns.setMatrixAt(i, m);
        p.y = this.groundY + 22 * scale;
        s.set(scale * 0.78, scale * 0.85, scale * 0.78);
        m.compose(p, q, s);
        crowns2.setMatrixAt(i, m);
      }
      i++;
    }
    rounds.count = r;
    this.scene.add(trunks, crowns, crowns2, rounds);
  }

  private buildLot() {
    const wood = this.track("fence", new THREE.MeshLambertMaterial({ color: 0x7a6a52 }));
    const railMat = this.track("rail", new THREE.MeshLambertMaterial({ color: 0x6d604c }));
    const posts = [
      [0, 350],
      [-240, 350],
      [-240, -380],
      [0, -380],
    ];
    const loop = [...posts, posts[0]];
    for (let i = 0; i < loop.length - 1; i++) {
      const a = loop[i];
      const b = loop[i + 1];
      const len = Math.hypot(b[1] - a[1], b[0] - a[0]);
      const segs = Math.max(2, Math.round(len / 8));
      const keep: Array<[number, number]> = [];
      for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const n = a[0] + (b[0] - a[0]) * t;
        const e = a[1] + (b[1] - a[1]) * t;
        if (n * n + e * e < 22 * 22) continue;
        keep.push([n, e]);
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.33, 4.5, 0.33), wood);
        const v = this.toVec(this.origin.n + n, this.origin.e + e, this.groundY + 2.25);
        post.position.copy(v);
        post.userData = { target: true, label: "fence", code: "FENCE", kind: "feature" };
        this.scene.add(post);
      }
      if (keep.length >= 2) {
        const first = keep[0];
        const last = keep[keep.length - 1];
        const span = Math.hypot(last[1] - first[1], last[0] - first[0]);
        if (span > 10) {
          for (const railY of [1.5, 3.15]) {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(span, 0.12, 0.08), railMat);
            const mid = this.toVec(
              this.origin.n + (first[0] + last[0]) / 2,
              this.origin.e + (first[1] + last[1]) / 2,
              this.groundY + railY,
            );
            rail.position.copy(mid);
            rail.rotation.y = Math.atan2(last[1] - first[1], -(last[0] - first[0]));
            this.scene.add(rail);
          }
        }
      }
    }

    this.buildHouse(this.origin.n - 145, this.origin.e + 200, this.groundY);
    this.buildDriveway();
    this.buildShed(this.origin.n - 110, this.origin.e + 290, this.groundY);
    this.buildMailbox(this.origin.n - 238, this.origin.e + 8, this.groundY);
    this.buildYardTrees();
    this.buildForesight();
    this.buildSilo();
    this.buildGate();
  }

  private addGable(
    cx: number,
    cy: number,
    cz: number,
    width: number,
    depth: number,
    rise: number,
    mat: THREE.Material,
    userData?: Record<string, unknown>,
  ) {
    const len = Math.hypot(width / 2, rise);
    const tilt = Math.atan2(rise, width / 2);
    for (const side of [-1, 1] as const) {
      const plane = new THREE.Mesh(new THREE.BoxGeometry(len, 0.28, depth + 0.6), mat);
      plane.position.set(cx + side * (width / 4), cy + rise / 2, cz);
      plane.rotation.z = -side * tilt;
      if (userData) plane.userData = userData;
      this.scene.add(plane);
    }
  }

  private buildHouse(n: number, e: number, z: number) {
    const siding = this.track(
      "siding",
      new THREE.MeshLambertMaterial({ map: this.sidingTexture(), color: 0xd8d0c2 }),
    );
    const roof = this.track("roof", new THREE.MeshLambertMaterial({ color: 0x4c4944 }));
    const trim = this.track("trim", new THREE.MeshLambertMaterial({ color: 0xe7e2d6 }));
    const dark = this.track("win", new THREE.MeshLambertMaterial({ color: 0x2e3538 }));
    const brick = this.track("brick", new THREE.MeshLambertMaterial({ color: 0x6a5346 }));
    const body = new THREE.Mesh(new THREE.BoxGeometry(42, 10, 28), siding);
    const p = this.toVec(n, e, z + 5);
    body.position.copy(p);
    body.userData = { target: true, label: "house", code: "BLDG", kind: "feature" };
    this.scene.add(body);

    this.addGable(p.x, z + 10, p.z, 42, 28, 6.5, roof, { target: true, label: "roof", code: "BLDG", kind: "feature" });

    const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.2, 1.6), brick);
    chimney.position.set(p.x + 10, z + 14.5, p.z - 4);
    this.scene.add(chimney);

    const porch = new THREE.Mesh(new THREE.BoxGeometry(8, 0.28, 6), trim);
    porch.position.set(p.x, z + 0.22, p.z + 17);
    this.scene.add(porch);
    const door = new THREE.Mesh(new THREE.BoxGeometry(3.2, 6.8, 0.18), dark);
    door.position.set(p.x, z + 3.6, p.z + 14.1);
    this.scene.add(door);

    for (const ox of [-12, 12]) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(3.4, 4.0, 0.12), trim);
      frame.position.set(p.x + ox, z + 6.2, p.z + 14.06);
      this.scene.add(frame);
      const w = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.2, 0.1), dark);
      w.position.set(p.x + ox, z + 6.2, p.z + 14.14);
      this.scene.add(w);
    }

    const invis = this.track("invis", new THREE.MeshBasicMaterial({ visible: false }));
    const corners: Array<[number, number, string]> = [
      [n + 14, e + 21, "NE house"],
      [n + 14, e - 21, "NW house"],
      [n - 14, e + 21, "SE house"],
      [n - 14, e - 21, "SW house"],
    ];
    for (const [cn, ce, label] of corners) {
      const hit = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 10, 8), invis);
      hit.position.copy(this.toVec(cn, ce, z + 5));
      hit.userData = { target: true, label, code: "BLDG", kind: "feature" };
      this.scene.add(hit);
    }
  }

  private buildDriveway() {
    const gravel = this.track("gravel", new THREE.MeshLambertMaterial({ color: 0x6e675c }));
    const drive = new THREE.Mesh(new THREE.BoxGeometry(10, 0.06, 120), gravel);
    drive.position.copy(this.toVec(this.origin.n - 80, this.origin.e + 200, this.groundY + 0.05));
    drive.userData = { target: true, label: "driveway", code: "CL", kind: "feature" };
    this.scene.add(drive);
  }

  private buildShed(n: number, e: number, z: number) {
    const mat = this.track("shed", new THREE.MeshLambertMaterial({ color: 0x6b5a44 }));
    const roof = this.track("shedRoof", new THREE.MeshLambertMaterial({ color: 0x3f3c38 }));
    const body = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 16), mat);
    const p = this.toVec(n, e, z + 4);
    body.position.copy(p);
    body.userData = { target: true, label: "shed", code: "BLDG", kind: "feature" };
    this.scene.add(body);
    this.addGable(p.x, z + 8, p.z, 12, 16, 3.2, roof, body.userData);
  }

  private buildMailbox(n: number, e: number, z: number) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 4, 6),
      this.track("mbpost", new THREE.MeshLambertMaterial({ color: 0x3a3a38 })),
    );
    post.position.copy(this.toVec(n, e, z + 2));
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.9, 0.7),
      this.track("mb", new THREE.MeshLambertMaterial({ color: 0x4a5560 })),
    );
    box.position.copy(this.toVec(n, e, z + 4.1));
    box.userData = { target: true, label: "mailbox", code: "TP", kind: "feature" };
    post.userData = box.userData;
    this.scene.add(post, box);
  }

  private makeTarget(p: Point): THREE.Group {
    const g = new THREE.Group();
    const base = this.toVec(p.n, p.e, p.z);
    g.position.copy(base);
    const code = p.code;
    if (code === "FH") g.add(this.hydrant(p.name));
    else if (code === "POLE") g.add(this.powerPole(p.name));
    else if (code === "TREE") g.add(this.singleTree());
    else if (code === "PIN" || code === "CP" || code === "MON" || code === "COR") g.add(this.rangePole(p.name, code));
    else g.add(this.hubStake(p.name, code));
    return g;
  }

  private hydrant(name: string) {
    const g = new THREE.Group();
    const red = this.track("hydrant", new THREE.MeshLambertMaterial({ color: 0x8b3a32 }));
    const silver = this.track("cap", new THREE.MeshLambertMaterial({ color: 0x8a8f8c }));
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 2.5, 10), red);
    barrel.position.y = 1.25;
    barrel.userData = { target: true, label: name, code: "FH", kind: "feature" };
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), silver);
    cap.position.y = 2.6;
    cap.userData = barrel.userData;
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.1, 8), red);
    arm.rotation.z = Math.PI / 2;
    arm.position.y = 1.7;
    arm.userData = barrel.userData;
    g.add(barrel, cap, arm);
    const spr = this.labelSprite(name);
    spr.position.y = 3.4;
    g.add(spr);
    return g;
  }

  private powerPole(name: string) {
    const g = new THREE.Group();
    const wood = this.track("ppole", new THREE.MeshLambertMaterial({ color: 0x5a4634 }));
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 38, 8), wood);
    pole.position.y = 19;
    pole.userData = { target: true, label: name, code: "POLE", kind: "feature" };
    const arm = new THREE.Mesh(new THREE.BoxGeometry(10, 0.28, 0.28), wood);
    arm.position.y = 36;
    arm.userData = pole.userData;
    g.add(pole, arm);
    const ins = this.track("ins", new THREE.MeshLambertMaterial({ color: 0xcfc8b8 }));
    for (const x of [-4.2, 0, 4.2]) {
      const i = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.4, 6), ins);
      i.position.set(x, 36.35, 0);
      g.add(i);
    }
    const tag = this.labelSprite(name);
    tag.position.y = 39.2;
    g.add(tag);
    return g;
  }

  private singleTree() {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.55, 12, 6),
      this.mats.trunk ?? this.track("trunk", new THREE.MeshLambertMaterial({ color: 0x4a3b2c })),
    );
    trunk.position.y = 6;
    trunk.userData = { target: true, label: "tree", code: "TREE", kind: "feature" };
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(4.4, 16, 7),
      this.mats.leaf ?? this.track("leaf", new THREE.MeshLambertMaterial({ color: 0x3f5a3c })),
    );
    crown.position.y = 16;
    crown.userData = trunk.userData;
    g.add(trunk, crown);
    return g;
  }

  private rangePole(name: string, code: string) {
    const g = new THREE.Group();
    const h = 8.2;
    const poleMat =
      (this.mats.poleTex as THREE.MeshLambertMaterial | undefined) ??
      this.track("poleTex", new THREE.MeshLambertMaterial({ map: this.poleTexture() }));
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, h, 12), poleMat);
    pole.position.y = h / 2;
    pole.userData = { target: true, label: name, code, kind: "pole" };
    g.add(pole);

    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.28, 0.14, 8),
      this.track("hub", new THREE.MeshLambertMaterial({ color: 0xcfc6b0 })),
    );
    hub.position.y = 0.07;
    hub.userData = pole.userData;
    g.add(hub);

    const can = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.32, 16),
      this.track("prismCan", new THREE.MeshLambertMaterial({ color: 0xe08928, emissive: 0x4a2208, emissiveIntensity: 0.35 })),
    );
    can.position.y = 5.0;
    can.userData = { target: true, label: name, code, kind: "prism" };
    g.add(can);
    const glassMat = this.track(
      "prismGlass",
      new THREE.MeshPhongMaterial({
        color: 0xcfe8ee,
        shininess: 140,
        transparent: true,
        opacity: 0.82,
        specular: 0xffffff,
      }),
    );
    for (let i = 0; i < 8; i++) {
      const cube = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.1), glassMat);
      const a = (i / 8) * Math.PI * 2;
      cube.position.set(Math.cos(a) * 0.16, 5.0, Math.sin(a) * 0.16);
      cube.rotation.y = a;
      cube.userData = can.userData;
      g.add(cube);
    }

    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 1.5),
      this.track("flag", new THREE.MeshLambertMaterial({ color: 0xe25a1a, side: THREE.DoubleSide, emissive: 0x5a1808, emissiveIntensity: 0.25 })),
    );
    flag.position.set(1.2, 7.35, 0);
    flag.userData = pole.userData;
    g.add(flag);

    const tag = this.labelSprite(name);
    tag.position.y = 8.6;
    g.add(tag);

    const hit = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.2, h + 2, 8),
      this.track("hit", new THREE.MeshBasicMaterial({ visible: false })),
    );
    hit.position.y = h / 2;
    hit.userData = { target: true, label: name, code, kind: "prism" };
    g.add(hit);
    return g;
  }

  private hubStake(name: string, code: string) {
    const g = new THREE.Group();
    const wood = this.track("lath", new THREE.MeshLambertMaterial({ color: 0xbca57a }));
    const lath = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4.2, 0.28), wood);
    lath.position.y = 2.1;
    lath.userData = { target: true, label: name, code, kind: "feature" };
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.24, 0.14, 8),
      this.track("hub2", new THREE.MeshLambertMaterial({ color: 0xd8d0bc })),
    );
    hub.position.y = 0.07;
    hub.userData = lath.userData;
    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 1.1),
      this.track("flag", new THREE.MeshLambertMaterial({ color: 0xe25a1a, side: THREE.DoubleSide, emissive: 0x5a1808, emissiveIntensity: 0.25 })),
    );
    flag.position.set(0.95, 3.9, 0);
    flag.userData = lath.userData;
    const label = this.labelSprite(name);
    label.position.y = 5.1;
    g.add(lath, hub, flag, label);
    const hit = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.4, 5, 8),
      this.track("hit", new THREE.MeshBasicMaterial({ visible: false })),
    );
    hit.position.y = 2.2;
    hit.userData = lath.userData;
    g.add(hit);
    return g;
  }

  private labelSprite(text: string) {
    const c = document.createElement("canvas");
    c.width = 384;
    c.height = 96;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, 384, 96);
    ctx.fillStyle = "rgba(11,13,12,0.88)";
    ctx.fillRect(8, 12, 368, 72);
    ctx.strokeStyle = "#e25a1a";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 14, 364, 68);
    ctx.fillStyle = "#f4f1ea";
    ctx.font = "700 52px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 192, 50);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.disposables.push(tex);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true, sizeAttenuation: true });
    this.disposables.push(mat);
    const s = new THREE.Sprite(mat);
    s.scale.set(8.5, 2.15, 1);
    s.center.set(0.5, 0);
    s.raycast = () => undefined;
    return s;
  }

  private buildForesight() {
    const pole = this.rangePole("FS", "FS");
    pole.position.copy(this.toVec(this.origin.n - 16, this.origin.e + 82, this.groundY));
    this.scene.add(pole);
    const barn = this.track("barn", new THREE.MeshLambertMaterial({ color: 0x8a5a40 }));
    const roof = this.track("barnRoof", new THREE.MeshLambertMaterial({ color: 0x3a3834 }));
    const body = new THREE.Mesh(new THREE.BoxGeometry(48, 16, 32), barn);
    const p = this.toVec(this.origin.n - 118, this.origin.e + 310, this.groundY + 8);
    body.position.copy(p);
    body.userData = { target: true, label: "barn", code: "BLDG", kind: "feature" };
    this.scene.add(body);
    this.addGable(p.x, this.groundY + 16, p.z, 48, 32, 10, roof, body.userData);
  }

  private buildSilo() {
    const metal = this.track("silo", new THREE.MeshLambertMaterial({ color: 0x8a9094 }));
    const cap = this.track("siloCap", new THREE.MeshLambertMaterial({ color: 0x6a6e70 }));
    const body = new THREE.Mesh(new THREE.CylinderGeometry(8, 8.4, 36, 14), metal);
    const p = this.toVec(this.origin.n + 18, this.origin.e + 620, this.groundY + 18);
    body.position.copy(p);
    body.userData = { target: true, label: "silo", code: "BLDG", kind: "feature" };
    const roof = new THREE.Mesh(new THREE.ConeGeometry(8.8, 6, 14), cap);
    roof.position.set(p.x, this.groundY + 39, p.z);
    roof.userData = body.userData;
    this.scene.add(body, roof);
  }

  private buildGate() {
    const steel = this.track("gate", new THREE.MeshLambertMaterial({ color: 0x5c5a56 }));
    const n = this.origin.n - 18;
    const e = this.origin.e + 348;
    const postL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 5.2, 0.28), steel);
    postL.position.copy(this.toVec(n - 6, e, this.groundY + 2.6));
    const postR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 5.2, 0.28), steel);
    postR.position.copy(this.toVec(n + 6, e, this.groundY + 2.6));
    const rail = new THREE.Mesh(new THREE.BoxGeometry(12, 0.12, 0.12), steel);
    rail.position.copy(this.toVec(n, e, this.groundY + 4.4));
    for (const obj of [postL, postR, rail]) {
      obj.userData = { target: true, label: "gate", code: "FENCE", kind: "feature" };
      this.scene.add(obj);
    }
    for (let i = 0; i < 6; i++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.2, 0.08), steel);
      bar.position.copy(this.toVec(n - 5 + i * 2, e, this.groundY + 2.2));
      bar.userData = { target: true, label: "gate", code: "FENCE", kind: "feature" };
      this.scene.add(bar);
    }
  }

  private buildYardTrees() {
    const spots: Array<[number, number]> = [
      [this.origin.n - 48, this.origin.e + 92],
      [this.origin.n - 78, this.origin.e - 150],
      [this.origin.n - 190, this.origin.e + 130],
      [this.origin.n - 30, this.origin.e - 250],
    ];
    for (const [n, e] of spots) {
      const t = this.singleTree();
      t.position.copy(this.toVec(n, e, this.groundY));
      this.scene.add(t);
    }
  }

  private buildClouds() {
    const mat = this.track(
      "cloud",
      new THREE.MeshLambertMaterial({ color: 0xe7e4dc, transparent: true, opacity: 0.55 }),
    );
    const rnd = rng(21);
    for (let i = 0; i < 8; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(40 + rnd() * 50, 8, 6), mat);
      puff.scale.y = 0.28;
      puff.position.set((rnd() - 0.5) * 1400, this.groundY + 220 + rnd() * 80, (rnd() - 0.5) * 1400);
      this.clouds.add(puff);
    }
  }
}
