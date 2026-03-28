// ═════════════════════════════════════════════════════════════════════════════
// NeuroOps 3D Premium — Spline.Design Inspired Interactive Dashboard
// Ray-traced 3D graphs, glassmorphism UI, premium animations
// ═════════════════════════════════════════════════════════════════════════════

// Auto-detect API endpoint based on deployment environment
let API_BASE;
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Local development
    API_BASE = 'http://localhost:3001/api';
} else if (window.location.protocol === 'https:') {
    // Production HTTPS - use relative path
    API_BASE = `/api`;
} else {
    // Production HTTP fallback - use relative path
    API_BASE = `/api`;
}

const SERVICES = [
    { id: 'gateway', name: 'API Gateway', icon: '⬡', port: 3000, deps: ['auth', 'products', 'orders'], bLat: 45, bRps: 850, bErr: 0.2, color: 0x64b5f6, emissive: 0x2563eb },
    { id: 'auth', name: 'Auth Service', icon: '🔐', port: 3001, deps: [], bLat: 28, bRps: 320, bErr: 0.1, color: 0x81c784, emissive: 0x059669 },
    { id: 'products', name: 'Product Catalog', icon: '📦', port: 3002, deps: ['postgres'], bLat: 62, bRps: 410, bErr: 0.3, color: 0xb39ddb, emissive: 0x7c3aed },
    { id: 'orders', name: 'Order Manager', icon: '🧾', port: 3003, deps: ['postgres', 'payment'], bLat: 95, bRps: 180, bErr: 0.2, color: 0x64b5f6, emissive: 0x0284c7 },
    { id: 'payment', name: 'Payment Engine', icon: '💳', port: 3004, deps: [], bLat: 210, bRps: 95, bErr: 0.4, color: 0xff6b6b, emissive: 0xdc2626 },
    { id: 'inventory', name: 'Inventory Sync', icon: '🗄', port: 3005, deps: ['redis'], bLat: 35, bRps: 260, bErr: 0.2, color: 0x81c784, emissive: 0x16a34a },
    { id: 'notification', name: 'Notifications', icon: '🔔', port: 3006, deps: ['rabbitmq'], bLat: 55, bRps: 140, bErr: 0.1, color: 0xffd54f, emissive: 0xf59e0b },
    { id: 'postgres', name: 'PostgreSQL', icon: '🐘', port: 5432, deps: [], bLat: 8, bRps: 1200, bErr: 0.05, color: 0x64b5f6, emissive: 0x0ea5e9 },
    { id: 'redis', name: 'Redis Cache', icon: '⚡', port: 6379, deps: [], bLat: 2, bRps: 3200, bErr: 0.02, color: 0x81c784, emissive: 0x22c55e },
    { id: 'rabbitmq', name: 'RabbitMQ', icon: '🐇', port: 5672, deps: [], bLat: 12, bRps: 680, bErr: 0.05, color: 0xb39ddb, emissive: 0xa855f7 },
    { id: 'monitoring', name: 'Monitoring', icon: '📊', port: 9090, deps: [], bLat: 15, bRps: 500, bErr: 0.1, color: 0x64b5f6, emissive: 0x06b6d4 },
];

const INCIDENTS = [
    { id: 'payment_crash', label: '💳 Payment Crash', target: 'payment', sev: 'critical', cascades: ['orders', 'gateway'] },
    { id: 'checkout_timeout', label: '🛒 Checkout Timeout', target: 'orders', sev: 'high', cascades: ['payment', 'inventory'] },
    { id: 'db_slowdown', label: '🐘 DB Saturation', target: 'postgres', sev: 'high', cascades: ['products', 'orders'] },
];

// ═════════════════════════════════════════════════════════════════════════════
// GLOBAL SCENE STATE
// ═════════════════════════════════════════════════════════════════════════════

let scene, camera, renderer, controls, composer, bloomPass;
let serviceNodes = new Map();
let connectionLines = new Map();
let graphVisualization = null;
let particleSystem;
let metricsCache = {};
let selectedNode = null;
let autoRotate = false;
let globalTime = 0;
let cameraViewIndex = 0;

// ═════════════════════════════════════════════════════════════════════════════
// API INTEGRATION
// ═════════════════════════════════════════════════════════════════════════════

async function fetchLiveData() {
    try {
        const metricsRes = await fetch(`${API_BASE}/metrics`);
        const metricsData = await metricsRes.json();
        if (metricsData.metrics) {
            metricsData.metrics.forEach(m => {
                metricsCache[m.service_id] = m;
            });
        }
        
        SERVICES.forEach(service => {
            if (metricsCache[service.id]) {
                const metric = metricsCache[service.id];
                service.bLat = Math.round(metric.latency);
                service.bRps = Math.round(metric.rps);
                service.bErr = Math.min(metric.error_rate / 100, 1);
            }
        });
        return true;
    } catch (error) {
        console.warn('⚠ Could not fetch live data:', error.message);
        return false;
    }
}

async function checkBackendHealth() {
    try {
        // Construct health endpoint URL based on API_BASE
        const baseUrl = API_BASE.replace('/api', '');
        const response = await fetch(`${baseUrl}/health`);
        return response.ok;
    } catch {
        console.warn('⚠ Backend health check failed');
        return false;
    }
}

function startLiveDataPolling() {
    setInterval(async () => {
        try {
            const metricsRes = await fetch(`${API_BASE}/metrics`);
            const metricsData = await metricsRes.json();
            
            if (metricsData.metrics) {
                metricsData.metrics.forEach(m => {
                    const service = SERVICES.find(s => s.id === m.service_id);
                    if (service) {
                        service.bLat = Math.round(m.latency);
                        service.bRps = Math.round(m.rps);
                        service.bErr = Math.min(m.error_rate / 100, 1);
                    }
                });
            }
            
            updateStats();
            update3DGraphs();
        } catch (error) {
            console.warn('⚠ Failed to update metrics');
        }
    }, 3000);
}

// ═════════════════════════════════════════════════════════════════════════════
// THREE.JS PREMIUM SETUP
// ═════════════════════════════════════════════════════════════════════════════

function initThreeJS() {
    const container = document.getElementById('canvas-container');
    
    // Scene with premium gradient background
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050a1f);
    scene.fog = new THREE.Fog(0x050a1f, 300, 600);
    
    // Camera
    camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.1, 2000);
    camera.position.set(0, 40, 60);
    camera.lookAt(0, 0, 0);
    
    // Renderer with post-processing
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    
    // Post-processing with bloom
    composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(container.clientWidth, container.clientHeight),
        1.5, 0.4, 0.85
    );
    composer.addPass(bloomPass);
    
    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 2;
    controls.enableZoom = true;
    controls.minDistance = 30;
    controls.maxDistance = 250;
    
    // Premium lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(80, 100, 80);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    scene.add(directionalLight);
    
    // Colored point lights for premium ambiance
    const lights = [
        { pos: [60, 50, 60], color: 0x64b5f6, intensity: 0.8 },
        { pos: [-60, 40, -60], color: 0xb39ddb, intensity: 0.6 },
        { pos: [0, 80, 0], color: 0x81c784, intensity: 0.5 },
    ];
    
    lights.forEach(light => {
        const pointLight = new THREE.PointLight(light.color, light.intensity, 200);
        pointLight.position.set(...light.pos);
        pointLight.castShadow = true;
        scene.add(pointLight);
    });
    
    addPremiumBackground();
    createServiceNodes();
    createConnections();
    create3DGraphVisualization();
    createParticleSystem();
    
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onCanvasClick);
    document.addEventListener('keydown', onKeyDown);
    
    animate();
}

function addPremiumBackground() {
    // Grid floor
    const gridHelper = new THREE.GridHelper(200, 40, 0x2a3f7f, 0x1a2545);
    gridHelper.position.y = -30;
    scene.add(gridHelper);
    
    // Stars
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 150;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 400;
        positions[i + 1] = (Math.random() - 0.5) * 400;
        positions[i + 2] = (Math.random() - 0.5) * 400;
        
        const hue = Math.random() * 360;
        const color = new THREE.Color().setHSL(hue / 360, 0.7, 0.6);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const starsMaterial = new THREE.PointsMaterial({ size: 0.3, transparent: true, opacity: 0.8, vertexColors: true });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

// ═════════════════════════════════════════════════════════════════════════════
// 3D SERVICE NODES - PREMIUM STYLING
// ═════════════════════════════════════════════════════════════════════════════

function createServiceNodes() {
    const positions = generateFibonacciSphere(SERVICES.length);
    
    SERVICES.forEach((service, index) => {
        const pos = positions[index];
        
        // Main node geometry (rounded cube for Spline aesthetic)
        const geometry = new THREE.IcosahedronGeometry(2.5, 5);
        const material = new THREE.MeshStandardMaterial({
            color: service.color,
            emissive: service.emissive,
            emissiveIntensity: 0.4,
            metalness: 0.5,
            roughness: 0.3,
            envMapIntensity: 1.2,
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(pos.x, pos.y, pos.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { serviceId: service.id, service: service, originalPosition: pos };
        
        // Glow layer
        const glowGeometry = new THREE.IcosahedronGeometry(2.8, 5);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: service.color,
            transparent: true,
            opacity: 0.15,
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        mesh.add(glow);
        
        // Orbit ring
        const ringGeometry = new THREE.BufferGeometry();
        const ringPoints = [];
        for (let i = 0; i < 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            ringPoints.push(new THREE.Vector3(Math.cos(angle) * 3.5, 0, Math.sin(angle) * 3.5));
        }
        ringGeometry.setFromPoints(ringPoints);
        const ringMaterial = new THREE.LineBasicMaterial({ color: service.color, transparent: true, opacity: 0.6, linewidth: 2 });
        const ring = new THREE.Line(ringGeometry, ringMaterial);
        mesh.add(ring);
        
        addServiceLabel(mesh, service);
        
        scene.add(mesh);
        serviceNodes.set(service.id, { mesh, service, worldPos: pos });
    });
}

function addServiceLabel(mesh, service) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'rgba(5, 10, 31, 0.95)';
    ctx.fillRect(0, 0, 256, 256);
    
    ctx.strokeStyle = `#${service.color.toString(16).padStart(6, '0')}`;
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, 248, 248);
    
    ctx.fillStyle = '#f0f4ff';
    ctx.font = 'bold 48px Poppins';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(service.icon, 128, 80);
    
    ctx.font = '20px Inter';
    ctx.fillStyle = `#${service.color.toString(16).padStart(6, '0')}`;
    const lines = service.name.split(' ');
    let y = 160;
    lines.forEach(line => {
        ctx.fillText(line, 128, y);
        y += 40;
    });
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, sizeAttenuation: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(8, 8, 1);
    sprite.position.z = 4;
    mesh.add(sprite);
}

function generateFibonacciSphere(count) {
    const positions = [];
    const phi = (1 + Math.sqrt(5)) / 2;
    
    for (let i = 0; i < count; i++) {
        const theta = 2 * Math.PI * i / phi;
        const y = 1 - (2 * i + 1) / count;
        const radius = Math.sqrt(1 - y * y);
        const scale = 30;
        
        positions.push({
            x: Math.cos(theta) * radius * scale,
            y: y * scale,
            z: Math.sin(theta) * radius * scale,
        });
    }
    
    return positions;
}

// ═════════════════════════════════════════════════════════════════════════════
// 3D GRAPHS VISUALIZATION
// ═════════════════════════════════════════════════════════════════════════════

function create3DGraphVisualization() {
    const graphGroup = new THREE.Group();
    graphGroup.position.set(-60, 0, -40);
    
    // 3D Bar chart for latency
    createBarChart(graphGroup, 'Latency (ms)', 0, 0, 0, SERVICES.map(s => s.bLat), 200, 0x64b5f6);
    
    // 3D Bar chart for RPS
    createBarChart(graphGroup, 'RPS', 0, 0, 25, SERVICES.map(s => Math.min(s.bRps / 100, 50)), 200, 0x81c784);
    
    // 3D Line graph for error rates
    create3DLineGraph(graphGroup, 'Error Rate', 0, -15, 0, SERVICES.map(s => s.bErr * 100), 200, 0xef5350);
    
    scene.add(graphGroup);
    graphVisualization = graphGroup;
}

function createBarChart(parent, label, x, y, z, values, maxVal, color) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    
    // Label
    const labelCanvas = createTextTexture(label, 24, color);
    const labelMaterial = new THREE.SpriteMaterial({ map: labelCanvas });
    const labelSprite = new THREE.Sprite(labelMaterial);
    labelSprite.position.set(0, 20, 0);
    labelSprite.scale.set(12, 3, 1);
    group.add(labelSprite);
    
    // Bars
    const barWidth = 1.5;
    const barDepth = 1;
    const spacing = 2.2;
    
    values.forEach((value, index) => {
        const height = (value / maxVal) * 15;
        const geometry = new THREE.BoxGeometry(barWidth, height, barDepth);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.3,
            metalness: 0.3,
            roughness: 0.4,
        });
        
        const bar = new THREE.Mesh(geometry, material);
        bar.position.set((index - values.length / 2) * spacing, height / 2 - 8, 0);
        bar.castShadow = true;
        group.add(bar);
    });
    
    parent.add(group);
}

function create3DLineGraph(parent, label, x, y, z, values, maxVal, color) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    
    // Label
    const labelCanvas = createTextTexture(label, 24, color);
    const labelMaterial = new THREE.SpriteMaterial({ map: labelCanvas });
    const labelSprite = new THREE.Sprite(labelMaterial);
    labelSprite.position.set(0, 20, 0);
    labelSprite.scale.set(12, 3, 1);
    group.add(labelSprite);
    
    // Create curve from values
    const curve = new THREE.CatmullRomCurve3(
        values.map((val, idx) => {
            const t = idx / values.length;
            return new THREE.Vector3(
                (t - 0.5) * 25,
                (val / maxVal) * 14 - 8,
                0
            );
        })
    );
    
    const points = curve.getPoints(values.length * 4);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: color,
        linewidth: 3,
        transparent: true,
        opacity: 0.9,
    });
    
    const line = new THREE.Line(geometry, material);
    group.add(line);
    
    parent.add(group);
}

function createTextTexture(text, size, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'rgba(5, 10, 31, 0.8)';
    ctx.fillRect(0, 0, 512, 128);
    
    ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    ctx.font = `bold ${size}px Poppins`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);
    
    return new THREE.CanvasTexture(canvas);
}

function update3DGraphs() {
    // Update graph values (called every 3 seconds with new metrics)
    if (graphVisualization) {
        scene.remove(graphVisualization);
        graphVisualization = null;
    }
    create3DGraphVisualization();
}

// ═════════════════════════════════════════════════════════════════════════════
// CONNECTIONS & INTERACTIONS
// ═════════════════════════════════════════════════════════════════════════════

function createConnections() {
    SERVICES.forEach(service => {
        const fromNode = serviceNodes.get(service.id);
        if (!fromNode) return;
        
        service.deps.forEach(depId => {
            const toNode = serviceNodes.get(depId);
            if (!toNode) return;
            
            const curve = new THREE.CatmullRomCurve3([
                fromNode.mesh.position,
                fromNode.mesh.position.clone().add(new THREE.Vector3(0, 5, 0)),
                toNode.mesh.position.clone().add(new THREE.Vector3(0, 5, 0)),
                toNode.mesh.position,
            ]);
            
            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0x2a3f7f,
                transparent: true,
                opacity: 0.4,
                linewidth: 2,
            });
            
            const line = new THREE.Line(geometry, material);
            line.userData = { from: service.id, to: depId, originalOpacity: 0.4 };
            scene.add(line);
            
            connectionLines.set(`${service.id}-${depId}`, { line, from: service.id, to: depId });
        });
    });
}

function createParticleSystem() {
    const geometry = new THREE.BufferGeometry();
    const count = 1000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 200;
        positions[i + 1] = (Math.random() - 0.5) * 200;
        positions[i + 2] = (Math.random() - 0.5) * 200;
        
        const hue = Math.random();
        const color = new THREE.Color().setHSL(hue, 0.7, 0.6);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.5,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true,
        vertexColors: true,
    });
    
    particleSystem = new THREE.Points(geometry, material);
    particleSystem.userData = { visible: false };
}

// ═════════════════════════════════════════════════════════════════════════════
// USER INTERACTIONS
// ═════════════════════════════════════════════════════════════════════════════

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const meshes = Array.from(serviceNodes.values()).map(n => n.mesh);
    const intersects = raycaster.intersectObjects(meshes);
    
    if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object;
        highlightNode(hoveredMesh);
        showTooltip(event, hoveredMesh);
    } else {
        hideTooltip();
    }
}

function onCanvasClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const meshes = Array.from(serviceNodes.values()).map(n => n.mesh);
    const intersects = raycaster.intersectObjects(meshes);
    
    if (intersects.length > 0) {
        selectNode(intersects[0].object);
    }
}

function onKeyDown(event) {
    switch(event.key.toLowerCase()) {
        case 'r': resetView(); break;
        case 'd': toggleDependencies(); break;
        case 'p': showParticles(); break;
        case 'a': autoRotateToggle(); break;
        case 'c': cycleCameraView(); break;
        case 'i': triggerIncident(); break;
    }
}

function highlightNode(mesh) {
    const nodeData = serviceNodes.get(mesh.userData.serviceId);
    if (nodeData) {
        mesh.material.emissiveIntensity = 0.8;
        mesh.scale.set(1.15, 1.15, 1.15);
    }
}

function resetNodeAppearance(mesh) {
    const nodeData = serviceNodes.get(mesh.userData.serviceId);
    if (nodeData) {
        mesh.material.emissiveIntensity = 0.4;
        mesh.scale.set(1, 1, 1);
    }
}

function selectNode(mesh) {
    if (selectedNode && selectedNode !== mesh) {
        resetNodeAppearance(selectedNode);
    }
    
    selectedNode = mesh;
    mesh.material.emissiveIntensity = 1;
    mesh.scale.set(1.3, 1.3, 1.3);
    
    const service = serviceNodes.get(mesh.userData.serviceId).service;
    showInfoPanel(service);
    animateCameraToNode(mesh);
}

function showTooltip(event, mesh) {
    const tooltip = document.getElementById('tooltip');
    const service = serviceNodes.get(mesh.userData.serviceId).service;
    
    const healthColor = service.bErr < 0.05 ? '🟢' : service.bErr < 0.2 ? '🟡' : '🔴';
    
    tooltip.innerHTML = `
        <div class="tooltip-name">${service.icon} ${service.name}</div>
        <div class="tooltip-stat">Health: ${healthColor} ${(100 - service.bErr * 100).toFixed(1)}%</div>
        <div class="tooltip-stat">Latency: <strong>${service.bLat}ms</strong></div>
        <div class="tooltip-stat">Throughput: <strong>${service.bRps.toLocaleString()} req/s</strong></div>
        <div class="tooltip-stat">Error Rate: <strong>${(service.bErr * 100).toFixed(2)}%</strong></div>
    `;
    
    tooltip.style.display = 'block';
    tooltip.style.left = (event.clientX + 15) + 'px';
    tooltip.style.top = (event.clientY + 15) + 'px';
}

function hideTooltip() {
    document.getElementById('tooltip').style.display = 'none';
}

function showInfoPanel(service) {
    const panel = document.getElementById('info-panel');
    const healthIcon = service.bErr < 0.05 ? '🟢' : service.bErr < 0.2 ? '🟡' : '🔴';
    
    document.getElementById('info-service-name').textContent = `${service.icon} ${service.name}`;
    document.getElementById('info-status').innerHTML = `
        <div class="panel-item">
            <div class="item-label">STATUS</div>
            <div class="item-value">${healthIcon} ${(100 - service.bErr * 100).toFixed(1)}% Healthy</div>
        </div>
        <div class="panel-item">
            <div class="item-label">LATENCY P95</div>
            <div class="item-value">${service.bLat}ms</div>
        </div>
        <div class="panel-item">
            <div class="item-label">THROUGHPUT</div>
            <div class="item-value">${service.bRps.toLocaleString()} req/s</div>
        </div>
        <div class="panel-item">
            <div class="item-label">ERROR RATE</div>
            <div class="item-value" style="color: ${service.bErr > 0.2 ? '#ff4757' : service.bErr > 0.05 ? '#ffa502' : '#2ed573'};">
                ${(service.bErr * 100).toFixed(2)}%
            </div>
        </div>
        <div class="panel-item">
            <div class="item-label">PORT</div>
            <div class="item-value">${service.port}</div>
        </div>
        <div class="panel-item">
            <div class="item-label">DEPENDENCIES</div>
            <div class="item-value">${service.deps.length > 0 ? service.deps.join(', ') : 'None'}</div>
        </div>
    `;
}

function animateCameraToNode(mesh) {
    const targetPos = mesh.position;
    const direction = targetPos.clone().normalize();
    const newPos = direction.multiplyScalar(25).add(targetPos);
    
    const startPos = camera.position.clone();
    const startTime = Date.now();
    const duration = 1200;
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // Ease out
        
        camera.position.lerpVectors(startPos, newPos, eased);
        camera.lookAt(targetPos);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    animate();
}

function toggleDependencies() {
    connectionLines.forEach(connData => {
        const opacity = connData.line.material.opacity = connData.line.material.opacity < 0.5 ? 0.8 : 0.2;
    });
}

function showParticles() {
    if (particleSystem.userData.visible) {
        scene.remove(particleSystem);
        particleSystem.userData.visible = false;
    } else {
        scene.add(particleSystem);
        particleSystem.userData.visible = true;
    }
}

function resetView() {
    controls.reset();
    camera.position.set(0, 40, 60);
    if (selectedNode) {
        resetNodeAppearance(selectedNode);
        selectedNode = null;
    }
    hideTooltip();
}

const cameraViews = [
    { pos: { x: 0, y: 40, z: 60 }, target: { x: 0, y: 0, z: 0 } },
    { pos: { x: 80, y: 40, z: 50 }, target: { x: 0, y: 0, z: 0 } },
    { pos: { x: -80, y: 40, z: 50 }, target: { x: 0, y: 0, z: 0 } },
    { pos: { x: 0, y: 100, z: 10 }, target: { x: 0, y: 0, z: 0 } },
];

function cycleCameraView() {
    cameraViewIndex = (cameraViewIndex + 1) % cameraViews.length;
    const view = cameraViews[cameraViewIndex];
    
    const startPos = camera.position.clone();
    const endPos = new THREE.Vector3(view.pos.x, view.pos.y, view.pos.z);
    const startTime = Date.now();
    const duration = 1000;
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        
        camera.position.lerpVectors(startPos, endPos, eased);
        camera.lookAt(view.target.x, view.target.y, view.target.z);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    animate();
}

function autoRotateToggle() {
    autoRotate = !autoRotate;
    controls.autoRotate = autoRotate;
}

function triggerIncident() {
    const incident = INCIDENTS[Math.floor(Math.random() * INCIDENTS.length)];
    const targetNode = serviceNodes.get(incident.target);
    
    if (targetNode) {
        const originalColor = targetNode.mesh.material.color.getHex();
        targetNode.mesh.material.color.setHex(0xff4757);
        targetNode.mesh.material.emissiveIntensity = 1.5;
        
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            flashCount++;
            if (flashCount % 2 === 0) {
                targetNode.mesh.material.color.setHex(originalColor);
            } else {
                targetNode.mesh.material.color.setHex(0xff4757);
            }
            
            if (flashCount > 6) {
                clearInterval(flashInterval);
                targetNode.mesh.material.color.setHex(originalColor);
                targetNode.mesh.material.emissiveIntensity = 0.4;
            }
        }, 200);
        
        alert(`⚠️ ${incident.label}\n\nCascading to: ${incident.cascades.join(', ')}`);
    }
}

function updateStats() {
    const avgLatency = Math.round(SERVICES.reduce((acc, s) => acc + s.bLat, 0) / SERVICES.length);
    const healthScore = Math.round((1 - SERVICES.reduce((acc, s) => acc + s.bErr, 0) / SERVICES.length) * 100);
    
    document.getElementById('stat-services').textContent = SERVICES.length;
    document.getElementById('stat-health').textContent = healthScore + '%';
    document.getElementById('stat-latency').textContent = avgLatency + 'ms';
}

// ═════════════════════════════════════════════════════════════════════════════
// ANIMATION LOOP
// ═════════════════════════════════════════════════════════════════════════════

function animate() {
    requestAnimationFrame(animate);
    
    globalTime += 0.016;
    controls.update();
    
    serviceNodes.forEach((nodeData, id) => {
        const theta = globalTime * 0.4 + nodeData.service.bRps * 0.0002;
        const orbitScale = 0.4;
        nodeData.mesh.position.x = nodeData.worldPos.x + Math.sin(theta * 0.5) * orbitScale;
        nodeData.mesh.position.z = nodeData.worldPos.z + Math.cos(theta * 0.5) * orbitScale;
        nodeData.mesh.rotation.x += 0.003;
        nodeData.mesh.rotation.y += 0.005;
    });
    
    if (particleSystem.userData.visible) {
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += (Math.random() - 0.5) * 0.2;
            positions[i + 1] += (Math.random() - 0.5) * 0.2;
            positions[i + 2] += (Math.random() - 0.5) * 0.2;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }
    
    composer.render();
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    composer.setSize(width, height);
}

// ═════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═════════════════════════════════════════════════════════════════════════════

window.addEventListener('DOMContentLoaded', async () => {
    const isHealthy = await checkBackendHealth();
    await fetchLiveData();
    initThreeJS();
    updateStats();
    startLiveDataPolling();
    
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║   🧠 NeuroOps 3D Premium Dashboard · Spline Inspired Style  ║
║          Advanced Analytics & Real-Time Observability        ║
╠═══════════════════════════════════════════════════════════════╣
║  PREMIUM FEATURES:                                           ║
║  ✦ 3D Service Topology with Bloom Post-Processing           ║
║  ✦ Real-Time 3D Graphs (Latency, RPS, Error Rates)         ║
║  ✦ Glassmorphism UI with Premium Animations                 ║
║  ✦ Large, Bold Typography (Poppins + Inter)                 ║
║  ✦ Enhanced Lighting & Shadows                               ║
║  ✦ Smooth Camera Animations & Multiple Views                ║
║                                                              ║
║  KEYBOARD SHORTCUTS:                                         ║
║  R - Reset  |  D - Dependencies  |  P - Particles           ║
║  A - Auto-Rotate  |  C - Camera Views  |  I - Incident      ║
╚═══════════════════════════════════════════════════════════════╝
    `);
});

window.resetView = resetView;
window.autoRotateToggle = autoRotateToggle;
window.showParticles = showParticles;
window.triggerIncident = triggerIncident;
window.toggleDependencies = toggleDependencies;
window.cycleCameraView = cycleCameraView;
