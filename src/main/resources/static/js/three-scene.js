// ==========================================================
// JustBuy — Three.js 3D Visuals (react-three-fiber aesthetic)
// ==========================================================

export class ThreeHeroScene {
  constructor(containerId = 'hero-3d-canvas') {
    this.canvas = document.getElementById(containerId);
    if (!this.canvas || typeof THREE === 'undefined') return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.objects = [];
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.clock = new THREE.Clock();
    this.rafId = null;

    this.init();
  }

  init() {
    const width = this.canvas.clientWidth || 600;
    const height = this.canvas.clientHeight || 500;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 7);

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xfffdf9, 1.4);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xF26B1D, 2.8); // Brand warm orange
    dirLight1.position.set(5, 5, 4);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xFFE4D6, 1.8); // Soft warm fill
    dirLight2.position.set(-5, -3, 2);
    this.scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xC2532D, 3.0, 10);
    pointLight.position.set(0, 1, 3);
    this.scene.add(pointLight);

    // 4. Create 3D Hero Geometric Meshes (Modern 2026 3D Aesthetic)
    this.createHeroMeshes();

    // 5. Mouse Parallax Listeners
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      this.mouse.targetX = (e.clientX - centerX) / (window.innerWidth / 2);
      this.mouse.targetY = (e.clientY - centerY) / (window.innerHeight / 2);
    });

    window.addEventListener('resize', () => this.onResize());

    this.animate();
  }

  createHeroMeshes() {
    // 1. Centerpiece: Metallic Satin Orange Torus Knot
    const knotGeo = new THREE.TorusKnotGeometry(1.2, 0.38, 128, 32, 2, 3);
    const knotMat = new THREE.MeshPhysicalMaterial({
      color: 0xF26B1D,
      emissive: 0x3d1405,
      metalness: 0.85,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    knotMesh.position.set(0.2, 0, 0);
    this.scene.add(knotMesh);
    this.objects.push({
      mesh: knotMesh,
      rotSpeedX: 0.004,
      rotSpeedY: 0.007,
      floatSpeed: 1.2,
      baseY: 0,
      amp: 0.15
    });

    // 2. Floating Frosted Glass Icosahedron (Liquid Glass UI vibe)
    const glassGeo = new THREE.IcosahedronGeometry(0.7, 1);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFFDF9,
      transmission: 0.9,
      opacity: 0.85,
      transparent: true,
      roughness: 0.15,
      ior: 1.5,
      thickness: 0.8,
      specularIntensity: 1.0
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.set(-2.2, 1.3, 0.8);
    this.scene.add(glassMesh);
    this.objects.push({
      mesh: glassMesh,
      rotSpeedX: -0.008,
      rotSpeedY: 0.010,
      floatSpeed: 1.8,
      baseY: 1.3,
      amp: 0.22
    });

    // 3. Floating Metallic Terracotta Sphere
    const sphereGeo = new THREE.SphereGeometry(0.55, 48, 48);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xC2532D,
      metalness: 0.7,
      roughness: 0.25
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereMesh.position.set(2.4, -1.2, 0.5);
    this.scene.add(sphereMesh);
    this.objects.push({
      mesh: sphereMesh,
      rotSpeedX: 0.006,
      rotSpeedY: -0.005,
      floatSpeed: 1.5,
      baseY: -1.2,
      amp: 0.18
    });

    // 4. Micro Floating Capsule / Orbit Ring
    const ringGeo = new THREE.TorusGeometry(0.9, 0.06, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xE9E0D3,
      metalness: 0.9,
      roughness: 0.1
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(-1.8, -1.5, 0.2);
    ringMesh.rotation.x = Math.PI / 3;
    this.scene.add(ringMesh);
    this.objects.push({
      mesh: ringMesh,
      rotSpeedX: 0.012,
      rotSpeedY: 0.008,
      floatSpeed: 2.0,
      baseY: -1.5,
      amp: 0.12
    });
  }

  onResize() {
    if (!this.canvas) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    if (width === 0 || height === 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  animate() {
    this.rafId = requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    // Smooth mouse follow
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.04;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.04;

    // Parallax camera tilt
    this.camera.position.x = this.mouse.x * 0.8;
    this.camera.position.y = -this.mouse.y * 0.6;
    this.camera.lookAt(0, 0, 0);

    // Animate meshes
    this.objects.forEach(item => {
      item.mesh.rotation.x += item.rotSpeedX;
      item.mesh.rotation.y += item.rotSpeedY;
      item.mesh.position.y = item.baseY + Math.sin(elapsedTime * item.floatSpeed) * item.amp;
    });

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.renderer) this.renderer.dispose();
  }
}

// ── Interactive 3D Product Inspector (For Product Detail Screen) ──
export class ThreeProductViewer {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas || typeof THREE === 'undefined') return;

    this.options = options;
    this.isDragging = false;
    this.prevMouse = { x: 0, y: 0 };
    this.modelGroup = new THREE.Group();
    this.autoRotate = true;

    this.init();
  }

  init() {
    const width = this.canvas.clientWidth || 450;
    const height = this.canvas.clientHeight || 450;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    this.camera.position.set(0, 0, 4.8);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Studio Lights
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 5, 4);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xF26B1D, 1.8);
    rimLight.position.set(-4, -2, -3);
    this.scene.add(rimLight);

    const softAmbient = new THREE.AmbientLight(0xfffdf9, 1.2);
    this.scene.add(softAmbient);

    // Build stylish procedural 3D headset / gadget
    this.buildModel();
    this.scene.add(this.modelGroup);

    // Orbit controls via drag
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.autoRotate = false;
      this.prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.prevMouse.x;
      const deltaY = e.clientY - this.prevMouse.y;
      this.modelGroup.rotation.y += deltaX * 0.008;
      this.modelGroup.rotation.x += deltaY * 0.008;
      this.prevMouse = { x: e.clientX, y: e.clientY };
    });

    this.animate();
  }

  buildModel() {
    // Headband arc
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-1.2, -0.4, 0),
      new THREE.Vector3(0, 1.5, 0),
      new THREE.Vector3(1.2, -0.4, 0)
    );
    const bandGeo = new THREE.TubeGeometry(curve, 40, 0.12, 16, false);
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0x1A1A1A,
      roughness: 0.4,
      metalness: 0.6
    });
    const band = new THREE.Mesh(bandGeo, bandMat);
    this.modelGroup.add(band);

    // Earcups
    const cupMat = new THREE.MeshPhysicalMaterial({
      color: 0xF26B1D,
      metalness: 0.8,
      roughness: 0.2,
      clearcoat: 0.8
    });
    const cupGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.35, 32);

    const leftCup = new THREE.Mesh(cupGeo, cupMat);
    leftCup.position.set(-1.2, -0.4, 0);
    leftCup.rotation.z = Math.PI / 2;
    this.modelGroup.add(leftCup);

    const rightCup = new THREE.Mesh(cupGeo, cupMat);
    rightCup.position.set(1.2, -0.4, 0);
    rightCup.rotation.z = Math.PI / 2;
    this.modelGroup.add(rightCup);

    // Cushion rings (soft warm cream)
    const cushionGeo = new THREE.TorusGeometry(0.48, 0.12, 16, 32);
    const cushionMat = new THREE.MeshStandardMaterial({
      color: 0xE9E0D3,
      roughness: 0.8
    });
    const leftCushion = new THREE.Mesh(cushionGeo, cushionMat);
    leftCushion.position.set(-1.05, -0.4, 0);
    leftCushion.rotation.y = Math.PI / 2;
    this.modelGroup.add(leftCushion);

    const rightCushion = new THREE.Mesh(cushionGeo, cushionMat);
    rightCushion.position.set(1.05, -0.4, 0);
    rightCushion.rotation.y = Math.PI / 2;
    this.modelGroup.add(rightCushion);
  }

  setColor(hexColor) {
    this.modelGroup.traverse(child => {
      if (child.isMesh && child.material.clearcoat !== undefined) {
        child.material.color.set(hexColor);
      }
    });
  }

  animate() {
    this.rafId = requestAnimationFrame(() => this.animate());
    if (this.autoRotate) {
      this.modelGroup.rotation.y += 0.006;
    }
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.renderer) this.renderer.dispose();
  }
}
