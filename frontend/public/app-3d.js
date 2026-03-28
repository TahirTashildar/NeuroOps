// ─────────────────────────────────────────────────────────────────────────────
// NeuroOps 3D — Advanced Interactive Causal AI Observability Dashboard
// Enhanced Three.js visualization with rich interactions, animations, and effects
// ─────────────────────────────────────────────────────────────────────────────

const API_HOST = window.location.hostname;
const API_PORT = 3001;
const API_BASE = `http://${API_HOST}:${API_PORT}/api`;

let SERVICES = [
    { id: 'gateway', name: 'API Gateway', icon: '⬡', port: 3000, deps: ['auth', 'products', 'orders', 'payment', 'inventory', 'notification'], bLat: 45, bRps: 850, bErr: 0.2, color: 0x64b5f6 },
    { id: 'auth', name: 'Auth Service', icon: '🔐', port: 3001, deps: [], bLat: 28, bRps: 320, bErr: 0.1, color: 0x81c784 },
    { id: 'products', name: 'Product Catalog', icon: '📦', port: 3002, deps: ['postgres'], bLat: 62, bRps: 410, bErr: 0.3, color: 0xb39ddb },
    { id: 'orders', name: 'Order Manager', icon: '🧾', port: 3003, deps: ['postgres', 'payment', 'inventory'], bLat: 95, bRps: 180, bErr: 0.2, color: 0x64b5f6 },
    { id: 'payment', name: 'Payment Engine', icon: '💳', port: 3004, deps: [], bLat: 210, bRps: 95, bErr: 0.4, color: 0xef5350 },
    { id: 'inventory', name: 'Inventory Sync', icon: '🗄', port: 3005, deps: ['redis'], bLat: 35, bRps: 260, bErr: 0.2, color: 0x81c784 },
    { id: 'notification', name: 'Notifications', icon: '🔔', port: 3006, deps: ['rabbitmq'], bLat: 55, bRps: 140, bErr: 0.1, color: 0xffd54f },
    { id: 'postgres', name: 'PostgreSQL', icon: '🐘', port: 5432, deps: [], bLat: 8, bRps: 1200, bErr: 0.05, color: 0x64b5f6 },
    { id: 'redis', name: 'Redis Cache', icon: '⚡', port: 6379, deps: [], bLat: 2, bRps: 3200, bErr: 0.02, color: 0x81c784 },
    { id: 'rabbitmq', name: 'RabbitMQ', icon: '🐇', port: 5672, deps: [], bLat: 12, bRps: 680, bErr: 0.05, color: 0xb39ddb },
    { id: 'monitoring', name: 'Monitoring', icon: '📊', port: 9090, deps: [], bLat: 15, bRps: 500, bErr: 0.1, color: 0x64b5f6 },
];

const INCIDENTS = [
    { id: 'payment_crash', label: '💳 Payment Crash', target: 'payment', sev: 'critical', cascades: ['orders', 'gateway'] },
    { id: 'checkout_timeout', label: '🛒 Checkout Timeout', target: 'orders', sev: 'high', cascades: ['payment', 'inventory'] },
    { id: 'db_slowdown', label: '🐘 DB Saturation', target: 'postgres', sev: 'high', cascades: ['products', 'orders'] },
];

let metricsCache = {};
let servicesCache = {};
let incidentsCache = [];

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED INTERACTIVE STATE
// ─────────────────────────────────────────────────────────────────────────────

let scene, camera, renderer, controls, composer, effectFXAA, bloomPass;
let xrSession = null;
let controllers = [];
let controllerGrips = [];
let raycasterGroup = [];
let xrRenderer = null;
let serviceNodes = new Map();
let connectionLines = new Map();
let particleSystem;
let flowParticles;
let autoRotate = false;
let hoveredNode = null;
let selectedNode = null;
let showDependencies = false;
let globalTime = 0;
let audioContext = null;
let ambientOscillator = null;
let isAudioEnabled = false;
let timelineEnabled = false;
let timelinePlayhead = 0;
let timelineStartTime = 0;
let timelineAnimationId = null;
let timelineIncidents = []; // sorted incidents with timestamps

// ─────────────────────────────────────────────────────────────────────────────
// API INTEGRATION
// ─────────────────────────────────────────────────────────────────────────────

async function fetchLiveData() {
    try {
        const servicesRes = await fetch(`${API_BASE}/services`);
        const servicesData = await servicesRes.json();
        servicesCache = servicesData;
        
        const metricsRes = await fetch(`${API_BASE}/metrics`);
        const metricsData = await metricsRes.json();
        if (metricsData.metrics) {
            metricsData.metrics.forEach(m => {
                metricsCache[m.service_id] = m;
            });
        }
        
        const incidentsRes = await fetch(`${API_BASE}/incidents`);
        const incidentsData = await incidentsRes.json();
        incidentsCache = incidentsData.incidents || [];
        
        // Update timeline incidents
        timelineIncidents = incidentsCache.map(inc => ({
            ...inc,
            timestamp: new Date(inc.created_at || Date.now()).getTime()
        })).sort((a, b) => a.timestamp - b.timestamp);
        
        updateTimelineUI();
        
        SERVICES.forEach(service => {
            if (metricsCache[service.id]) {
                const metric = metricsCache[service.id];
                service.bLat = Math.round(metric.latency);
                service.bRps = Math.round(metric.rps);
                service.bErr = metric.error_rate / 100;
            }
        });
        
        return true;
    } catch (error) {
        console.warn('⚠ Could not fetch live data, using defaults:', error.message);
        return false;
    }
}

async function checkBackendHealth() {
    try {
        const response = await fetch(`http://${API_HOST}:${API_PORT}/health`);
        return response.ok;
    } catch {
        return false;
    }
}

function startLiveDataPoling() {
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
                        service.bErr = m.error_rate / 100;
                    }
                });
            }
            
            updateStats();
        } catch (error) {
            console.warn('⚠ Failed to update metrics');
        }
    }, 3000);
}

// ─────────────────────────────────────────────────────────────────────────────
// THREE.JS INITIALIZATION WITH ENHANCED FEATURES
// ─────────────────────────────────────────────────────────────────────────────

function initThreeJS() {
    const container = document.getElementById('canvas-container');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    scene.fog = new THREE.Fog(0x0a0e27, 200, 500);
    
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 30, 40);
    camera.lookAt(0, 0, 0);
    
renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
renderer.xr.enabled = true;
    
    // Post-processing setup
    composer = new THREE.EffectComposer(renderer);
    effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / container.clientWidth, 1 / container.clientHeight);
    composer.addPass(effectFXAA);
    
    bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0;
    bloomPass.strength = 1.2;
    bloomPass.radius = 0.5;
    composer.addPass(bloomPass);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    container.appendChild(renderer.domElement);
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 3;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.minDistance = 20;
controls.maxDistance = 200;
    
    // VR Setup
    initVR();
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);
    
    const pointLight1 = new THREE.PointLight(0x64b5f6, 0.6, 120);
    pointLight1.position.set(30, 30, 30);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xb39ddb, 0.5, 100);
    pointLight2.position.set(-30, 20, -30);
    scene.add(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0x81c784, 0.4, 80);
    pointLight3.position.set(0, 40, 0);
    scene.add(pointLight3);
    
    // Init audio
    initAudio();
    
    addGridBackground();
    createServiceNodes();
    createConnections();
    createParticleSystem();
    createFlowParticles();
    
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onCanvasClick);
    document.addEventListener('keydown', onKeyDown);
    
    animate();
}

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // Ambient low hum
        ambientOscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        ambientOscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        ambientOscillator.frequency.setValueAtTime(55, audioContext.currentTime); // Low B1
        gainNode.gain.setValueAtTime(0.02, audioContext.currentTime); // Quiet
        ambientOscillator.start();
        isAudioEnabled = true;
        console.log('🔊 Ambient audio initialized (toggle with M key)');
    } catch (e) {
        console.warn('Audio not supported');
    }
}

function toggleAudio() {
    if (!audioContext) return;
    isAudioEnabled = !isAudioEnabled;
    if (isAudioEnabled) {
        audioContext.resume();
        playSound(440, 0.1, 0.1); // Toggle on sound
    } else {
        audioContext.suspend();
        playSound(220, 0.05, 0.3); // Toggle off
    }
}

function playSound(freq, duration = 0.1, volume = 0.1) {
    if (!isAudioEnabled || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function addGridBackground() {
    const gridHelper = new THREE.GridHelper(100, 20, 0x303f9f, 0x1a1f3a);
    gridHelper.position.y = -25;
    scene.add(gridHelper);
    
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 100;
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 200;
        positions[i + 1] = (Math.random() - 0.5) * 200;
        positions[i + 2] = (Math.random() - 0.5) * 200;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0x64b5f6, size: 0.2, transparent: true, opacity: 0.3 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

function createServiceNodes() {
    const positions = generateNodePositions(SERVICES.length);
    
    SERVICES.forEach((service, index) => {
        const pos = positions[index];
        
        const geometry = new THREE.IcosahedronGeometry(1.5, 4);
        const material = new THREE.MeshStandardMaterial({
            color: service.color,
            emissive: service.color,
            emissiveIntensity: 0.3,
            metalness: 0.6,
            roughness: 0.4,
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(pos.x, pos.y, pos.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { serviceId: service.id, service: service, originalPosition: pos, rotation: 0 };
        
        const glowGeometry = new THREE.IcosahedronGeometry(1.7, 4);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: service.color,
            transparent: true,
            opacity: 0.2,
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.userData = { isGlow: true, parent: service.id };
        mesh.add(glow);
        
        const ringGeometry = new THREE.BufferGeometry();
        const ringPoints = [];
        for (let i = 0; i < 32; i++) {
            const angle = (i / 32) * Math.PI * 2;
            ringPoints.push(new THREE.Vector3(Math.cos(angle) * 2.2, 0, Math.sin(angle) * 2.2));
        }
        ringGeometry.setFromPoints(ringPoints);
        const ringMaterial = new THREE.LineBasicMaterial({ color: service.color, transparent: true, opacity: 0.4 });
        const ring = new THREE.Line(ringGeometry, ringMaterial);
        mesh.add(ring);
        
        addNodeLabel(mesh, service);
        
        scene.add(mesh);
        serviceNodes.set(service.id, { mesh, service, originalColor: service.color, worldPos: pos });
    });
}

function addNodeLabel(mesh, service) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'rgba(10, 14, 39, 0.9)';
    ctx.fillRect(0, 0, 128, 128);
    
    ctx.strokeStyle = '#64b5f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, 124, 124);
    
    ctx.fillStyle = '#e8eaf6';
    ctx.font = 'bold 16px Poppins';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(service.icon, 64, 40);
    
    ctx.font = '10px Inter';
    ctx.fillStyle = '#64b5f6';
    const lines = service.name.split(' ');
    let y = 70;
    lines.forEach(line => {
        ctx.fillText(line, 64, y);
        y += 14;
    });
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(4, 4, 1);
    sprite.position.z = 2;
    mesh.add(sprite);
}

function generateNodePositions(count) {
    const positions = [];
    const phi = (1 + Math.sqrt(5)) / 2;
    
    for (let i = 0; i < count; i++) {
        const theta = 2 * Math.PI * i / phi;
        const y = 1 - (2 * i + 1) / count;
        const radius = Math.sqrt(1 - y * y);
        const scale = 20;
        
        positions.push({
            x: Math.cos(theta) * radius * scale,
            y: y * scale,
            z: Math.sin(theta) * radius * scale,
        });
    }
    
    return positions;
}

function createConnections() {
    SERVICES.forEach(service => {
        const fromNode = serviceNodes.get(service.id);
        if (!fromNode) return;
        
        service.deps.forEach(depId => {
            const toNode = serviceNodes.get(depId);
            if (!toNode) return;
            
            const points = [fromNode.mesh.position, toNode.mesh.position];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            
            const material = new THREE.LineBasicMaterial({
                color: 0x303f9f,
                transparent: true,
                opacity: 0.3,
                linewidth: 2,
            });
            
            const line = new THREE.Line(geometry, material);
            line.userData = { isConnection: true, from: service.id, to: depId, originalOpacity: 0.3 };
            scene.add(line);
            
            connectionLines.set(`${service.id}-${depId}`, { line, from: service.id, to: depId });
        });
    });
}

function createParticleSystem() {
    const particleCount = 800;
    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 150;
        positions[i + 1] = (Math.random() - 0.5) * 150;
        positions[i + 2] = (Math.random() - 0.5) * 150;
        
        velocities[i] = (Math.random() - 0.5) * 0.3;
        velocities[i + 1] = (Math.random() - 0.5) * 0.3;
        velocities[i + 2] = (Math.random() - 0.5) * 0.3;
        
        const hue = Math.random();
        const color = new THREE.Color().setHSL(hue, 1, 0.6);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.4,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
        vertexColors: true,
    });
    
    particleSystem = new THREE.Points(geometry, material);
    particleSystem.userData = { velocities, visible: false };
    scene.add(particleSystem);
}

function createFlowParticles() {
    const geometry = new THREE.BufferGeometry();
    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 100;
        positions[i + 1] = (Math.random() - 0.5) * 100;
        positions[i + 2] = (Math.random() - 0.5) * 100;
        
        colors[i] = 0.4 + Math.random() * 0.3;
        colors[i + 1] = 0.7 + Math.random() * 0.3;
        colors[i + 2] = 1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.2,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
        vertexColors: true,
    });
    
    flowParticles = new THREE.Points(geometry, material);
    flowParticles.userData = { visible: false, time: 0 };
    scene.add(flowParticles);
}

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / (window.innerHeight - 80)) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const meshes = Array.from(serviceNodes.values()).map(n => n.mesh);
    const intersects = raycaster.intersectObjects(meshes);
    
    if (hoveredNode && hoveredNode !== selectedNode) {
        resetNodeAppearance(hoveredNode);
    }
    
    if (intersects.length > 0) {
        hoveredNode = intersects[0].object;
        highlightNode(hoveredNode);
        highlightDependencies(hoveredNode);
        showTooltip(event, hoveredNode);
    } else {
        hoveredNode = null;
        resetAllConnections();
        hideTooltip();
    }
}

function onCanvasClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / (window.innerHeight - 80)) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const meshes = Array.from(serviceNodes.values()).map(n => n.mesh);
    const intersects = raycaster.intersectObjects(meshes);
    
    if (intersects.length > 0) {
        const node = intersects[0].object;
        selectNode(node);
    } else {
        deselectNode();
    }
}

function onKeyDown(event) {
    switch(event.key.toLowerCase()) {
        case 'r':
            resetView();
            playSound(800, 0.1, 0.1); // reset ping
            break;
        case 'd':
            toggleDependencies();
            playSound(600, 0.05, 0.2);
            break;
        case 'p':
            showParticles();
            playSound(1000, 0.08, 0.15);
            break;
        case 'a':
            autoRotateToggle();
            playSound(700, 0.06, 0.18);
            break;
        case 'c':
            cycleCameraView();
            playSound(900, 0.07, 0.12);
            break;
        case 'i':
            triggerIncident();
            playSound(300, 0.3, 0.5); // alarm
            break;
        case 'm':
            toggleAudio();
            break;
    }
}

function highlightNode(mesh) {
    const nodeData = serviceNodes.get(mesh.userData.serviceId);
    if (nodeData) {
        mesh.material.emissiveIntensity = 0.8;
        mesh.scale.set(1.2, 1.2, 1.2);
        
        mesh.children.forEach(child => {
            if (child.userData.isGlow) {
                child.material.opacity = 0.4;
            }
        });
    }
}

function resetNodeAppearance(mesh) {
    const nodeData = serviceNodes.get(mesh.userData.serviceId);
    if (nodeData) {
        mesh.material.emissiveIntensity = 0.3;
        mesh.scale.set(1, 1, 1);
        mesh.children.forEach(child => {
            if (child.userData.isGlow) {
                child.material.opacity = 0.2;
            }
        });
    }
}

function selectNode(mesh) {
    if (selectedNode && selectedNode !== mesh) {
        resetNodeAppearance(selectedNode);
    }
    
    selectedNode = mesh;
    mesh.material.emissiveIntensity = 1;
    mesh.scale.set(1.4, 1.4, 1.4);
    
    highlightDependencies(mesh);
    showInfoPanel(serviceNodes.get(mesh.userData.serviceId).service);
    animateCameraToNode(mesh);
}

function deselectNode() {
    if (selectedNode) {
        resetNodeAppearance(selectedNode);
        selectedNode = null;
    }
    resetAllConnections();
    document.getElementById('info-panel').style.display = 'none';
}

function highlightDependencies(mesh) {
    resetAllConnections();
    
    const serviceId = mesh.userData.serviceId;
    const service = SERVICES.find(s => s.id === serviceId);
    
    if (service) {
        service.deps.forEach(depId => {
            const key = `${serviceId}-${depId}`;
            const connData = connectionLines.get(key);
            if (connData) {
                connData.line.material.opacity = 0.8;
                connData.line.material.color.setHex(0x64b5f6);
                connData.line.material.linewidth = 3;
            }
        });
        
        SERVICES.forEach(s => {
            if (s.deps.includes(serviceId)) {
                const key = `${s.id}-${serviceId}`;
                const connData = connectionLines.get(key);
                if (connData) {
                    connData.line.material.opacity = 0.6;
                    connData.line.material.color.setHex(0xb39ddb);
                }
            }
        });
    }
}

function resetAllConnections() {
    connectionLines.forEach(connData => {
        connData.line.material.opacity = 0.3;
        connData.line.material.color.setHex(0x303f9f);
        connData.line.material.linewidth = 2;
    });
}

function toggleDependencies() {
    showDependencies = !showDependencies;
    if (showDependencies && selectedNode) {
        highlightDependencies(selectedNode);
    } else {
        resetAllConnections();
    }
}

function showTooltip(event, mesh) {
    const nodeData = serviceNodes.get(mesh.userData.serviceId);
    const tooltip = document.getElementById('tooltip');
    
    const service = nodeData.service;
    const healthColor = service.bErr < 0.05 ? '🟢' : service.bErr < 0.2 ? '🟡' : '🔴';
    
    tooltip.innerHTML = `
        <div class="tooltip-name">${service.icon} ${service.name}</div>
        <div class="tooltip-stat">Health: ${healthColor} ${(100 - service.bErr * 100).toFixed(1)}%</div>
        <div class="tooltip-stat">Latency: ${service.bLat}ms</div>
        <div class="tooltip-stat">RPS: ${service.bRps}</div>
        <div class="tooltip-stat">Error Rate: ${(service.bErr * 100).toFixed(2)}%</div>
        <div class="tooltip-stat" style="margin-top: 6px; border-top: 1px solid rgba(100, 181, 246, 0.2); padding-top: 6px; font-size: 9px; color: #9fa8da;">
            Port: ${service.port} | Deps: ${service.deps.length}
        </div>
    `;
    
    tooltip.style.display = 'block';
    tooltip.style.left = (event.clientX + 10) + 'px';
    tooltip.style.top = (event.clientY + 10) + 'px';
}

function hideTooltip() {
    document.getElementById('tooltip').style.display = 'none';
}

function showInfoPanel(service) {
    const panel = document.getElementById('info-panel');
    const depsText = service.deps.length > 0 ? service.deps.join(', ') : 'None';
    const healthIcon = service.bErr < 0.05 ? '🟢' : service.bErr < 0.2 ? '🟡' : '🔴';
    
    document.getElementById('info-service-name').textContent = `${service.icon} ${service.name}`;
    document.getElementById('info-status').innerHTML = `
        <div class="info-label">Status</div>
        <div class="info-value">${healthIcon} ${(100 - service.bErr * 100).toFixed(1)}% Healthy</div>
        <div class="info-item" style="border-bottom: 1px solid rgba(48, 63, 159, 0.3);">
            <div class="info-label">Latency P95</div>
            <div class="info-value">${service.bLat}ms</div>
        </div>
        <div class="info-item" style="border-bottom: 1px solid rgba(48, 63, 159, 0.3);">
            <div class="info-label">Throughput</div>
            <div class="info-value">${service.bRps.toLocaleString()} req/s</div>
        </div>
        <div class="info-item" style="border-bottom: 1px solid rgba(48, 63, 159, 0.3);">
            <div class="info-label">Error Rate</div>
            <div class="info-value" style="color: ${service.bErr > 0.2 ? '#ef5350' : service.bErr > 0.05 ? '#ffd54f' : '#81c784'};">
                ${(service.bErr * 100).toFixed(2)}%
            </div>
        </div>
        <div class="info-item">
            <div class="info-label">Dependencies</div>
            <div class="info-value">${depsText}</div>
        </div>
        <div class="info-item" style="margin-top: 8px; border-top: 1px solid rgba(48, 63, 159, 0.3); padding-top: 8px;">
            <div class="info-label">💡 Keyboard Shortcuts</div>
            <div class="info-value" style="font-size: 9px; line-height: 1.6;">
                <strong>R</strong> Reset | <strong>D</strong> Dependencies<br/>
                <strong>P</strong> Particles | <strong>A</strong> Auto-Rotate<br/>
                <strong>C</strong> Camera Views | <strong>I</strong> Incident
            </div>
        </div>
    `;
    
    panel.style.display = 'block';
    panel.classList.add('fade-in');
}

function animateCameraToNode(mesh) {
    const targetPos = mesh.position;
    const direction = targetPos.clone().normalize();
    const newPos = direction.multiplyScalar(15).add(targetPos);
    
    const startPos = camera.position.clone();
    const startTime = Date.now();
    const duration = 1000;
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        camera.position.lerpVectors(startPos, newPos, progress);
        camera.lookAt(targetPos);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    animate();
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLS & FEATURES
// ─────────────────────────────────────────────────────────────────────────────

let cameraViewIndex = 0;
const cameraViews = [
    { pos: { x: 0, y: 30, z: 40 }, target: { x: 0, y: 0, z: 0 } },
    { pos: { x: 50, y: 25, z: 30 }, target: { x: 0, y: 0, z: 0 } },
    { pos: { x: -50, y: 25, z: 30 }, target: { x: 0, y: 0, z: 0 } },
    { pos: { x: 0, y: 60, z: 5 }, target: { x: 0, y: 0, z: 0 } },
];

function resetView() {
    controls.reset();
    camera.position.set(0, 30, 40);
    deselectNode();
    hideTooltip();
}

function cycleCameraView() {
    cameraViewIndex = (cameraViewIndex + 1) % cameraViews.length;
    const view = cameraViews[cameraViewIndex];
    
    const startPos = camera.position.clone();
    const endPos = new THREE.Vector3(view.pos.x, view.pos.y, view.pos.z);
    const startTime = Date.now();
    const duration = 800;
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        camera.position.lerpVectors(startPos, endPos, progress);
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

function showParticles() {
    if (particleSystem.userData.visible) {
        particleSystem.userData.visible = false;
        scene.remove(particleSystem);
    } else {
        particleSystem.userData.visible = true;
        scene.add(particleSystem);
    }
}

function triggerIncident() {
    const incident = INCIDENTS[Math.floor(Math.random() * INCIDENTS.length)];
    const targetNode = serviceNodes.get(incident.target);
    
    if (targetNode) {
        const originalColor = targetNode.service.color;
        targetNode.mesh.material.color.setHex(0xef5350);
        targetNode.mesh.material.emissive.setHex(0xef5350);
        targetNode.mesh.material.emissiveIntensity = 1.2;
        
        const flashDuration = 200;
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            flashCount++;
            if (flashCount % 2 === 0) {
                targetNode.mesh.material.color.setHex(originalColor);
            } else {
                targetNode.mesh.material.color.setHex(0xef5350);
            }
            
            if (flashCount > 6) {
                clearInterval(flashInterval);
                targetNode.mesh.material.color.setHex(originalColor);
                targetNode.mesh.material.emissiveIntensity = 0.3;
            }
        }, flashDuration);
        
        incident.cascades.forEach(depId => {
            const depNode = serviceNodes.get(depId);
            if (depNode) {
                const depOriginalColor = depNode.service.color;
                setTimeout(() => {
                    depNode.mesh.material.emissive.setHex(0xef5350);
                    depNode.mesh.material.emissiveIntensity = 0.6;
                    
                    setTimeout(() => {
                        depNode.mesh.material.emissiveIntensity = 0.3;
                    }, 600);
                }, 300);
            }
        });
        
        fetch(`${API_BASE}/incidents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: incident.label,
                description: `Simulated ${incident.sev} incident triggered`,
                severity: incident.sev,
                target_service: incident.target,
                cascading_services: incident.cascades
            })
        }).catch(err => console.warn('Could not create incident on backend:', err));
        
        alert(`⚠️ ${incident.label}\n\nTarget: ${incident.target.toUpperCase()}\nIncident created!\n\nPress 'D' key to see dependencies.`);
    }
}

function updateStats() {
    const avgLatency = Math.round(SERVICES.reduce((acc, s) => acc + s.bLat, 0) / SERVICES.length);
    const healthScore = Math.round((1 - SERVICES.reduce((acc, s) => acc + s.bErr, 0) / SERVICES.length) * 100);
    
    document.getElementById('stat-services').textContent = SERVICES.length;
    document.getElementById('stat-health').textContent = healthScore + '%';
    document.getElementById('stat-latency').textContent = avgLatency + 'ms';
}

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED ANIMATION LOOP
// ─────────────────────────────────────────────────────────────────────────────

function animate() {
    renderer.setAnimationLoop(render);
    
    globalTime += 0.016;
    if (!renderer.xr.isPresenting) {
        controls.update();
    }
    
    serviceNodes.forEach((nodeData, id) => {
        nodeData.mesh.userData.rotation += 0.01;
        
        const theta = globalTime * 0.3 + nodeData.service.bRps * 0.0001;
        const orbitScale = 0.3;
        nodeData.mesh.position.x = nodeData.worldPos.x + Math.sin(theta * 0.5) * orbitScale;
        nodeData.mesh.position.z = nodeData.worldPos.z + Math.cos(theta * 0.5) * orbitScale;
        
        nodeData.mesh.children.forEach(child => {
            if (child.userData.isGlow) {
                const pulse = 0.2 + Math.sin(globalTime * 3 + nodeData.service.bRps * 0.001) * 0.1;
                child.material.opacity = pulse;
            }
        });
    });
    
    if (particleSystem.userData.visible) {
        const positions = particleSystem.geometry.attributes.position.array;
        const velocities = particleSystem.userData.velocities;
        
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];
            
            if (Math.abs(positions[i]) > 80) velocities[i] *= -1;
            if (Math.abs(positions[i + 1]) > 80) velocities[i + 1] *= -1;
            if (Math.abs(positions[i + 2]) > 80) velocities[i + 2] *= -1;
        }
        
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }
    
    if (renderer.xr.isPresenting) {
        composer.renderToScreen();
    } else {
        composer.render();
    }
}

function render() {
    if (!renderer.xr.isPresenting) {
        animate(); // Legacy desktop loop
    }
    // VR updates here (controllers etc.)
    updateControllers();
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

// ─────────────────────────────────────────────────────────────────────────────
// INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', async () => {
    const isHealthy = await checkBackendHealth();
    await fetchLiveData();
    initThreeJS();
    updateStats();
    startLiveDataPoling();
    
    if (isHealthy) {
        console.log('🚀 NeuroOps 3D Dashboard initialized with live data');
    } else {
        console.log('🚀 NeuroOps 3D Dashboard initialized with mock data');
    }
    
    console.log(`
╔════════════════════════════════════════════════════╗
║     🎮 NeuroOps 3D Interactive Dashboard         ║
╠════════════════════════════════════════════════════╣
║  KEYBOARD SHORTCUTS:                             ║
║  R - Reset View          D - Toggle Dependencies  ║
║  P - Toggle Particles    A - Auto-Rotate         ║
║  C - Cycle Cameras       I - Incident Trigger    ║
║                                                  ║
║  MOUSE:                                          ║
║  Drag - Rotate  |  Scroll - Zoom  |  Click - Select
╚════════════════════════════════════════════════════╝
    `);
});

window.resetView = resetView;
window.autoRotateToggle = autoRotateToggle;
window.showParticles = showParticles;
window.triggerIncident = triggerIncident;
window.toggleDependencies = toggleDependencies;
window.cycleCameraView = cycleCameraView;
window.toggleTimeline = toggleTimeline;
window.updateTimelineUI = updateTimelineUI;
window.toggleVR = toggleVR;

// VR functions
function initVR() {
    // Add VR button to controls panel
    const vrBtn = document.querySelector('.control-btn[onclick="toggleVR()"]');
    if (vrBtn) {
        vrBtn.textContent = '🆚 Enter VR';
    }
    
    // VR controllers setup
    const controllerModelFactory = new THREE.Group();
    scene.add(controllerModelFactory);
    
    for (let i = 0; i < 2; ++i) {
        const controller = renderer.xr.getController(i);
        controller.addEventListener('selectstart', onSelectStart);
        controller.addEventListener('selectend', onSelectEnd);
        scene.add(controller);
        controllers.push(controller);
        
        const grip = renderer.xr.getControllerGrip(i);
        controllerGrips.push(grip);
        scene.add(grip);
        
        const raycaster = new THREE.Raycaster();
        raycasterGroup.push({ controller, raycaster });
    }
    
    // Temp geometry for controller visualization
    const geometry = new THREE.CylinderGeometry(0.01, 0.02, 0.3);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const lineVisual = new THREE.Mesh(geometry, material);
    controllerModelFactory.add(lineVisual);
}

function toggleVR() {
    if (renderer.xr.isPresenting) {
        renderer.xr.getSession()?.end();
    } else {
        navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor'] }).then(onSessionStarted);
    }
}

function onSessionStarted(session) {
    xrSession = session;
    renderer.xr.setSession(session);
    document.body.style.cursor = 'none';
    console.log('🆚 VR Session started');
}

function onSelectStart(event) {
    const controller = event.target;
    const intersections = getIntersections(controller);
    if (intersections.length > 0) {
        const node = intersections[0].object;
        selectNode(node);
        playSound(800, 0.1, 0.3);
    }
}

function onSelectEnd(event) {
    // Reset on release
}

function getIntersections(controller) {
    const tempMatrix = new THREE.Matrix4();
    controller.updateMatrixWorld();
    
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    
    const meshes = Array.from(serviceNodes.values()).map(n => n.mesh);
    return raycaster.intersectObjects(meshes);
}

function updateControllers() {
    for (let i = 0; i < controllers.length; i++) {
        const controller = controllers[i];
        const grip = controllerGrips[i];
        const group = raycasterGroup[i];
        
        // Update grip visibility or model
        grip.visible = controller.visible;
        
        // Raycast visualization
        const intersections = getIntersections(controller);
        if (intersections.length > 0) {
            highlightNode(intersections[0].object);
        }
    }
}

// Timeline functions
function updateTimelineUI() {
    const slider = document.getElementById('timeline-slider');
    const timeDisplay = document.getElementById('timeline-time');
    const playBtn = document.getElementById('timeline-play');
    const pauseBtn = document.getElementById('timeline-pause');
    const badge = document.getElementById('incidents-badge');
    
    if (timelineIncidents.length === 0) {
        timeDisplay.textContent = 'No incidents';
        slider.max = 0;
        slider.value = 0;
        badge.textContent = '0';
        return;
    }
    
    slider.max = 100;
    const duration = timelineIncidents[timelineIncidents.length - 1].timestamp - timelineIncidents[0].timestamp;
    const currentTime = timelineIncidents[0].timestamp + (timelinePlayhead / 100) * duration;
    const formattedTime = new Date(currentTime).toLocaleTimeString();
    timeDisplay.textContent = `${formattedTime} / ${new Date(timelineIncidents[timelineIncidents.length - 1].timestamp).toLocaleTimeString()}`;
    badge.textContent = timelineIncidents.length;
    
    slider.oninput = (e) => {
        timelinePlayhead = parseFloat(e.target.value);
        scrubTimeline(timelinePlayhead);
        if (timelineAnimationId) {
            cancelAnimationFrame(timelineAnimationId);
        }
    };
    
    playBtn.onclick = () => startTimelinePlayback();
    pauseBtn.onclick = () => stopTimelinePlayback();
}

function toggleTimeline() {
    timelineEnabled = !timelineEnabled;
    const scrubber = document.getElementById('timeline-scrubber');
    scrubber.classList.toggle('active', timelineEnabled);
    updateTimelineUI();
    if (timelineEnabled) {
        playSound(1200, 0.15, 0.2);
    }
}

function scrubTimeline(playhead) {
    if (timelineIncidents.length === 0) return;
    
    const duration = timelineIncidents[timelineIncidents.length - 1].timestamp - timelineIncidents[0].timestamp;
    const currentTime = timelineIncidents[0].timestamp + (playhead / 100) * duration;
    
    // Find active incidents at this time
    const activeIncidents = timelineIncidents.filter(inc => 
        currentTime >= inc.timestamp && 
        currentTime <= inc.timestamp + 30000 // 30s incident duration
    );
    
    // Animate affected nodes based on playhead
    serviceNodes.forEach((nodeData) => {
        const incident = activeIncidents.find(inc => inc.target_service === nodeData.service.id || inc.cascading_services?.includes(nodeData.service.id));
        if (incident) {
            nodeData.mesh.material.emissiveIntensity = 1.0 + Math.sin(currentTime * 0.01) * 0.5;
            nodeData.mesh.material.color.setHex(0xff4444);
        } else {
            nodeData.mesh.material.emissiveIntensity = 0.3;
            nodeData.mesh.material.color.setHex(nodeData.service.color);
        }
        updateStats(); // Refresh service metrics
    });
}

function startTimelinePlayback() {
    if (timelineIncidents.length === 0) return;
    
    stopTimelinePlayback();
    timelineStartTime = Date.now() - (timelinePlayhead / 100) * 30000; // Assume 30s playback
    
    function playLoop() {
        const elapsed = (Date.now() - timelineStartTime) / 30000; // Normalized 0-1
        timelinePlayhead = Math.min(elapsed * 100, 100);
        document.getElementById('timeline-slider').value = timelinePlayhead;
        scrubTimeline(timelinePlayhead);
        
        if (timelinePlayhead < 100) {
            timelineAnimationId = requestAnimationFrame(playLoop);
        } else {
            stopTimelinePlayback();
        }
    }
    
    playLoop();
}

function stopTimelinePlayback() {
    if (timelineAnimationId) {
        cancelAnimationFrame(timelineAnimationId);
        timelineAnimationId = null;
    }
}
