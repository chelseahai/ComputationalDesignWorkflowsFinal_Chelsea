// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// 2D Canvas Implementation with P5.js
class Canvas2D {
    constructor() {
        this.staticSketch = null;
        this.interactiveSketch = null;
        this.currentStyle = 'minimal';
        this.isPlaying = false;
        this.speed = 1;
        
        this.init();
    }

    init() {
        // Initialize static canvas
        this.staticSketch = new p5(this.createStaticSketch.bind(this), 'canvas2d-static');
        
        // Initialize interactive canvas
        this.interactiveSketch = new p5(this.createInteractiveSketch.bind(this), 'canvas2d-interactive');
        
        // Controls for static canvas (kaleidoscope)
        document.getElementById('regenerate2d').addEventListener('click', () => {
            this.staticSketch.regenerate();
        });
        
        document.getElementById('export2d').addEventListener('click', () => {
            this.staticSketch.toggleSegments();
        });
        
        // Controls for interactive canvas
        const play2dBtn = document.getElementById('play2d');
        const pause2dBtn = document.getElementById('pause2d');
        const reset2dBtn = document.getElementById('reset2d');
        
        if (play2dBtn) {
            play2dBtn.addEventListener('click', () => {
                this.isPlaying = true;
                this.interactiveSketch.setPlaying(true);
                this.interactiveSketch.regenerate();
            });
        }
        
        if (pause2dBtn) {
            pause2dBtn.addEventListener('click', () => {
                this.isPlaying = false;
                this.interactiveSketch.setPlaying(false);
            });
        }
        
        if (reset2dBtn) {
            reset2dBtn.addEventListener('click', () => {
                this.interactiveSketch.togglePattern();
            });
        }
    }

    createStaticSketch(p) {
        let segments = 12;
        let time = 0;
        let drawing = false;
        let points = [];
        
        p.setup = () => {
            p.createCanvas(800, 500);
            p.colorMode(p.RGB, 255, 255, 255, 1);
            p.regenerate = () => {
                points = [];
                drawing = false;
            };
            p.toggleSegments = () => {
                segments = segments === 12 ? 8 : segments === 8 ? 16 : 12;
            };
            p.clearCanvas = () => {
                points = [];
                drawing = false;
            };
        };
        
        p.draw = () => {
            // Check if canvas is visible before drawing
            const canvas = p.canvas;
            const rect = canvas.getBoundingClientRect();
            if (rect.top > window.innerHeight || rect.bottom < 0) {
                return;
            }
            
            time += 0.02;
            
            // Create elegant black and white gradient background
            for (let i = 0; i <= p.height; i++) {
                let inter = p.map(i, 0, p.height, 0, 1);
                let c = p.lerpColor(p.color('#ffffff'), p.color('#f0f0f0'), inter);
                p.stroke(c);
                p.line(0, i, p.width, i);
            }
            
            // Draw kaleidoscope pattern
            p.push();
            p.translate(p.width / 2, p.height / 2);
            
            for (let i = 0; i < segments; i++) {
                p.rotate(p.TWO_PI / segments);
                
                // Draw mirrored lines when drawing
                if (drawing && p.mouseIsPressed) {
                    p.stroke('#000000');
                    p.strokeWeight(2);
                    p.line(p.mouseX - p.width / 2, p.mouseY - p.height / 2, 
                           p.pmouseX - p.width / 2, p.pmouseY - p.height / 2);
                }
                
                // Draw existing points
                points.forEach(point => {
                    p.fill('#000000');
                    p.noStroke();
                    p.circle(point.x, point.y, point.size);
                    
                    // Add subtle glow
                    p.drawingContext.shadowColor = p.color('#000000');
                    p.drawingContext.shadowBlur = 3;
                    p.circle(point.x, point.y, point.size);
                    p.drawingContext.shadowBlur = 0;
                });
            }
            
            p.pop();
            
            // Add automatic animated elements when not drawing
            if (!drawing) {
                p.push();
                p.translate(p.width / 2, p.height / 2);
                
                for (let i = 0; i < segments; i++) {
                    p.rotate(p.TWO_PI / segments);
                    
                    // Animated circles
                    let x = p.cos(time + i * 0.5) * 100;
                    let y = p.sin(time * 0.8 + i * 0.3) * 80;
                    let size = p.map(p.sin(time + i), -1, 1, 3, 8);
                    
                    p.fill('#000000');
                    p.noStroke();
                    p.circle(x, y, size);
                    
                    // Connecting lines
                    if (i < segments - 1) {
                        let nextX = p.cos(time + (i + 1) * 0.5) * 100;
                        let nextY = p.sin(time * 0.8 + (i + 1) * 0.3) * 80;
                        
                        p.stroke('#000000');
                        p.strokeWeight(1);
                        p.line(x, y, nextX, nextY);
                    }
                }
                
                p.pop();
            }
        };
        
        p.mousePressed = () => {
            drawing = true;
            points = [];
        };
        
        p.mouseReleased = () => {
            drawing = false;
        };
    }

    createInteractiveSketch(p) {
        let noiseScale = 0.02;
        let noiseOffset = 0;
        let time = 0;
        let isPlaying = true;
        let mouseGridX, mouseGridY;
        let rippleEffects = [];
        let noiseSpeed = 0.01;
        let noiseDetail = 0.02;
        
        p.setup = () => {
            p.createCanvas(800, 500);
            p.colorMode(p.RGB, 255, 255, 255, 1);
            p.noiseDetail(8, 0.5);
            
            // Add keyboard controls
            p.keyPressed = () => {
                if (p.key === 'r' || p.key === 'R') {
                    // R resets noise offset
                    noiseOffset = 0;
                } else if (p.key === 's' || p.key === 'S') {
                    // S toggles animation speed
                    noiseSpeed = noiseSpeed === 0.01 ? 0.005 : 0.01;
                } else if (p.key === 'd' || p.key === 'D') {
                    // D changes noise detail
                    noiseDetail = noiseDetail === 0.02 ? 0.01 : 0.02;
                }
            };
        };
        
        p.draw = () => {
            if (!isPlaying) return;
            
            // Check if canvas is visible before drawing
            const canvas = p.canvas;
            const rect = canvas.getBoundingClientRect();
            if (rect.top > window.innerHeight || rect.bottom < 0) {
                return;
            }
            
            time += 0.02;
            noiseOffset += noiseSpeed;
            
            // Create elegant black and white gradient background
            for (let i = 0; i <= p.height; i++) {
                let inter = p.map(i, 0, p.height, 0, 1);
                let c = p.lerpColor(p.color('#ffffff'), p.color('#f0f0f0'), inter);
                p.stroke(c);
                p.line(0, i, p.width, i);
            }
            
            // Update mouse position
            mouseGridX = p.mouseX;
            mouseGridY = p.mouseY;
            
            // Update ripple effects
            updateRippleEffects();
            
            // Draw noise composition
            drawNoiseComposition();
            
            // Add interactive effects
            if (p.mouseIsPressed) {
                addRippleEffect();
            }
        };
        
        p.setPlaying = (playing) => {
            isPlaying = playing;
        };
        
        p.setSpeed = (newSpeed) => {
            noiseSpeed = newSpeed * 0.01;
        };
        
        p.reset = () => {
            time = 0;
            noiseOffset = 0;
            rippleEffects = [];
        };
        
        p.regenerate = () => {
            noiseOffset = 0;
        };
        
        p.togglePattern = () => {
            noiseDetail = noiseDetail === 0.02 ? 0.01 : 0.02;
        };
        
        function drawNoiseComposition() {
            // Draw optimized noise-based composition
            let spacing = 16; // Increased spacing for better performance
            
            for (let x = 0; x < p.width; x += spacing) {
                for (let y = 0; y < p.height; y += spacing) {
                    // Calculate noise value based on position and time
                    let noiseVal = p.noise(x * noiseDetail, y * noiseDetail, noiseOffset);
                    
                    // Map noise to size and opacity - smaller sizes for higher resolution
                    let size = p.map(noiseVal, 0, 1, 1, 6); // Reduced from 2-15 to 1-6
                    let opacity = p.map(noiseVal, 0, 1, 0.15, 0.8); // Slightly reduced opacity range
                    
                    // Calculate mouse proximity effect
                    let mouseDist = p.dist(x, y, mouseGridX, mouseGridY);
                    let mouseInfluence = p.map(mouseDist, 0, 80, 1.8, 1, true); // Increased influence range
                    
                    // Calculate ripple influence
                    let rippleInfluence = getRippleInfluence(x / spacing, y / spacing);
                    
                    // Apply pulse animation
                    let pulse = p.sin(time * 2 + x * 0.05 + y * 0.05) * 0.15 + 1; // Reduced pulse intensity
                    
                    // Calculate final opacity
                    let finalOpacity = opacity * mouseInfluence * rippleInfluence * pulse;
                    
                    // Only draw if opacity is significant enough
                    if (finalOpacity > 0.1) {
                                            // Draw circle with elegant styling
                    p.fill('#000000');
                    p.noStroke();
                    p.circle(x, y, size * mouseInfluence);
                    
                    // Add subtle glow effect - reduced for smaller elements
                    p.drawingContext.shadowColor = p.color('#000000');
                    p.drawingContext.shadowBlur = 3; // Reduced from 5 to 3
                    p.circle(x, y, size * mouseInfluence);
                    p.drawingContext.shadowBlur = 0;
                    }
                    
                    // Add connecting lines for sophisticated look - more selective
                    if (x < p.width - spacing && y < p.height - spacing && noiseVal > 0.7) {
                        let nextNoise = p.noise((x + spacing) * noiseDetail, (y + spacing) * noiseDetail, noiseOffset);
                        let lineOpacity = p.map(p.abs(noiseVal - nextNoise), 0, 1, 0.05, 0.2); // Further reduced opacity
                        
                        if (lineOpacity > 0.15) {
                            p.stroke('#000000');
                            p.strokeWeight(0.5);
                            p.stroke(0, 0, 0, lineOpacity * 255);
                            p.line(x, y, x + spacing, y + spacing);
                        }
                    }
                }
            }
        }
        
        function drawPixelComposition() {
            for (let y = 0; y < gridHeight; y++) {
                for (let x = 0; x < gridWidth; x++) {
                    let pixel = pixelGrid[y][x];
                    if (pixel.active) {
                        // Calculate ripple effect
                        let rippleInfluence = getRippleInfluence(x, y);
                        
                        // Calculate mouse proximity effect
                        let mouseDist = p.dist(x, y, mouseGridX, mouseGridY);
                        let mouseInfluence = p.map(mouseDist, 0, 10, 1.5, 1, true);
                        
                        // Apply pulse animation
                        let pulse = p.sin(time * 2 + pixel.pulse) * 0.2 + 1;
                        
                        // Calculate final opacity
                        let finalOpacity = pixel.opacity * pulse * mouseInfluence * rippleInfluence;
                        
                        // Draw pixel
                        p.fill(pixel.color.levels[0], pixel.color.levels[1], pixel.color.levels[2], finalOpacity * 255);
                        p.noStroke();
                        
                        if (pixel.type === 'filled') {
                            p.rect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                        } else {
                            p.rect(x * pixelSize + 1, y * pixelSize + 1, pixelSize - 2, pixelSize - 2);
                        }
                        
                        // Add subtle glow
                        p.drawingContext.shadowColor = p.color('#000000');
                        p.drawingContext.shadowBlur = 3;
                        if (pixel.type === 'filled') {
                            p.rect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                        } else {
                            p.rect(x * pixelSize + 1, y * pixelSize + 1, pixelSize - 2, pixelSize - 2);
                        }
                        p.drawingContext.shadowBlur = 0;
                    }
                }
            }
        }
        
        function addRippleEffect() {
            rippleEffects.push({
                x: mouseGridX,
                y: mouseGridY,
                radius: 0,
                maxRadius: 50,
                speed: 3,
                opacity: 1
            });
        }
        
        function updateRippleEffects() {
            for (let i = rippleEffects.length - 1; i >= 0; i--) {
                let ripple = rippleEffects[i];
                ripple.radius += ripple.speed;
                ripple.opacity = p.map(ripple.radius, 0, ripple.maxRadius, 1, 0);
                
                if (ripple.radius > ripple.maxRadius) {
                    rippleEffects.splice(i, 1);
                }
            }
        }
        
        function getRippleInfluence(x, y) {
            let influence = 1;
            rippleEffects.forEach(ripple => {
                let dist = p.dist(x * 8, y * 8, ripple.x, ripple.y); // Updated to match new spacing
                if (p.abs(dist - ripple.radius) < 15) { // Increased range for higher resolution
                    influence *= (1 + ripple.opacity * 0.4); // Slightly increased influence
                }
            });
            return influence;
        }
    }
}

// 3D Canvas Implementation
class Canvas3D {
    constructor() {
        console.log('Canvas3D constructor called');
        this.container = document.getElementById('canvas3d');
        console.log('Canvas3D container element:', this.container);
        
        if (!this.container) {
            console.error('canvas3d element not found!');
            return;
        }
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.objects = [];
        this.time = 0;
        this.isAnimating = true;
        
        this.init();
    }

    init() {
        console.log('Canvas3D init started');
        
        // Check if Three.js is available
        if (typeof THREE === 'undefined') {
            console.error('Three.js is not loaded!');
            this.container.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Error: Three.js library not loaded</p>';
            return;
        }

        try {
            // Scene setup with white background
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0xffffff);
            
            // Camera setup with orbiting capability
            this.camera = new THREE.PerspectiveCamera(
                75,
                800 / 500,
                0.1,
                1000
            );
            this.camera.position.set(0, 0, 8);
            
            // Renderer setup with balanced performance
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: false, // Disable antialiasing for performance
                alpha: true,
                preserveDrawingBuffer: false // Disable for performance
            });
            this.renderer.setSize(800, 500);
            this.renderer.shadowMap.enabled = false; // Disable shadows for performance
            this.renderer.setClearColor(0xffffff, 1); // Fixed: Set proper background
            this.container.appendChild(this.renderer.domElement);
            
            // Simple lighting setup
            this.setupLighting();
            
            // Create simple initial composition
            this.createSimpleInitialComposition();
            
            // Controls
            console.log('Setting up Canvas3D event listeners');
            
            const addCubeBtn = document.getElementById('addCube');
            const addSphereBtn = document.getElementById('addSphere');
            const clearBtn = document.getElementById('clear3d');
            
            console.log('Found Canvas3D buttons:', { addCubeBtn, addSphereBtn, clearBtn });
            
            if (addCubeBtn) addCubeBtn.addEventListener('click', this.addSimpleCube.bind(this));
            if (addSphereBtn) addSphereBtn.addEventListener('click', this.addDiverseElements.bind(this));
            if (clearBtn) clearBtn.addEventListener('click', this.clear.bind(this));
            
            console.log('Event listeners set up for Canvas3D');
            
            // Animation loop
            this.animate();
            
            // Handle window resize
            window.addEventListener('resize', () => this.onWindowResize());
            
            console.log('Canvas3D initialized successfully');
        } catch (error) {
            console.error('Error initializing Canvas3D:', error);
            this.container.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Error initializing 3D canvas</p>';
        }
    }

    setupLighting() {
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Main directional light (no shadows for performance)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
        
        // Dramatic point light
        const pointLight = new THREE.PointLight(0x000000, 0.3, 10);
        pointLight.position.set(-3, 2, 3);
        this.scene.add(pointLight);
        
        // Rim lighting
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
        rimLight.position.set(-5, 0, -5);
        this.scene.add(rimLight);
    }

    createProceduralGeometry() {
        // Create complex procedural geometry inspired by mathematical forms
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        
        // Generate vertices in a mathematical spiral pattern
        for (let i = 0; i < 120; i++) {
            const angle = i * 0.1;
            const radius = 2 + Math.sin(angle * 3) * 0.8;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle * 2) * 0.8;
            const z = Math.sin(angle) * radius;
            
            vertices.push(x, y, z);
        }
        
        // Create triangular faces
        for (let i = 0; i < vertices.length / 3 - 3; i++) {
            indices.push(i, i + 1, i + 2);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        return geometry;
    }

    createSimpleInitialComposition() {
        // Add a simple cube to start
        this.addSimpleCube();
    }

    addSimpleCube() {
        console.log('addSimpleCube called');
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.8
        });
        const cube = new THREE.Mesh(geometry, material);
        
        // Random position within a reasonable range
        cube.position.set(
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6
        );
        
        cube.userData = { type: 'cube', rotationSpeed: 0.01 };
        this.scene.add(cube);
        this.objects.push(cube);
        console.log('Added cube to scene at position:', cube.position);
    }

    addSimpleSphere() {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.8
        });
        const sphere = new THREE.Mesh(geometry, material);
        
        // Random position within a reasonable range
        sphere.position.set(
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6
        );
        
        sphere.userData = { type: 'sphere', rotationSpeed: 0.01 };
        this.scene.add(sphere);
        this.objects.push(sphere);
        console.log('Added sphere to scene at position:', sphere.position);
    }

    addDiverseElements() {
        console.log('addDiverseElements called');
        
        // Array of different geometric shapes
        const geometries = [
            { type: 'sphere', geometry: new THREE.SphereGeometry(0.4, 32, 32) },
            { type: 'torus', geometry: new THREE.TorusGeometry(0.3, 0.1, 16, 32) },
            { type: 'octahedron', geometry: new THREE.OctahedronGeometry(0.3) },
            { type: 'tetrahedron', geometry: new THREE.TetrahedronGeometry(0.4) },
            { type: 'icosahedron', geometry: new THREE.IcosahedronGeometry(0.25) },
            { type: 'dodecahedron', geometry: new THREE.DodecahedronGeometry(0.3) },
            { type: 'cylinder', geometry: new THREE.CylinderGeometry(0.2, 0.2, 0.8, 16) },
            { type: 'cone', geometry: new THREE.ConeGeometry(0.25, 0.8, 16) }
        ];
        
        // Pick a random geometry
        const randomGeo = geometries[Math.floor(Math.random() * geometries.length)];
        
        const material = new THREE.MeshPhongMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.6 + Math.random() * 0.3,
            wireframe: Math.random() > 0.7
        });
        
        const mesh = new THREE.Mesh(randomGeo.geometry, material);
        
        // Random position within a reasonable range
        mesh.position.set(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
        );
        
        mesh.userData = { 
            type: randomGeo.type, 
            rotationSpeed: Math.random() * 0.02 + 0.005 
        };
        
        this.scene.add(mesh);
        this.objects.push(mesh);
        console.log(`Added ${randomGeo.type} to scene at position:`, mesh.position);
    }

    addProceduralGeometry() {
        const geometry = this.createProceduralGeometry();
        
        // Create sophisticated material
        const material = new THREE.MeshPhongMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.8,
            shininess: 100,
            specular: 0x444444,
            wireframe: Math.random() > 0.7
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4
        );
        // Removed shadows for performance
        mesh.userData = { type: 'procedural', rotationSpeed: 0.01 };
        
        this.scene.add(mesh);
        this.objects.push(mesh);
    }

    addFloatingElements() {
        // Create diverse geometric elements
        const geometries = [
            new THREE.TorusGeometry(0.4, 0.15, 16, 32),
            new THREE.OctahedronGeometry(0.3),
            new THREE.TetrahedronGeometry(0.4),
            new THREE.IcosahedronGeometry(0.25),
            new THREE.DodecahedronGeometry(0.3)
        ];
        
        for (let i = 0; i < 6; i++) { // Reduced from 12 to 6 for better performance
            const geometry = geometries[i % geometries.length];
            const material = new THREE.MeshPhongMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.7 + Math.random() * 0.2,
                wireframe: Math.random() > 0.7,
                shininess: 30 + Math.random() * 30
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8
            );
            
            // Removed shadows for performance
            
            // Store animation properties
            mesh.userData = {
                type: 'floating',
                rotationSpeed: Math.random() * 0.02 + 0.005,
                floatSpeed: Math.random() * 0.01 + 0.003,
                floatOffset: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.02 + 0.01
            };
            
            this.scene.add(mesh);
            this.objects.push(mesh);
        }
    }

    clear() {
        this.objects.forEach(obj => {
            this.scene.remove(obj);
        });
        this.objects = [];
        this.createInitialComposition();
    }

    animate() {
        // Check if canvas is visible before animating
        if (!this.isVisible()) {
            requestAnimationFrame(this.animate.bind(this));
            return;
        }
        
        requestAnimationFrame(this.animate.bind(this));
        
        this.time += 0.016;
        
        // Simple camera movement
        this.camera.position.x = Math.cos(this.time * 0.3) * 5;
        this.camera.position.z = Math.sin(this.time * 0.3) * 5;
        this.camera.lookAt(0, 0, 0);
        
        // Simple object animation
        this.objects.forEach((obj) => {
            if (obj.userData && obj.userData.rotationSpeed) {
                obj.rotation.x += obj.userData.rotationSpeed;
                obj.rotation.y += obj.userData.rotationSpeed;
            }
        });
        
        // Render the scene
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    isVisible() {
        const rect = this.container.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    onWindowResize() {
        this.camera.aspect = 800 / 500;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(800, 500);
    }
}

// Solar System 3D Canvas Implementation
class Canvas3DAdvanced {
    constructor() {
        console.log('Canvas3DAdvanced constructor called');
        this.container = document.getElementById('canvas3d-advanced');
        console.log('Canvas3DAdvanced container element:', this.container);
        
        if (!this.container) {
            console.error('canvas3d-advanced element not found!');
            return;
        }
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.sun = null;
        this.planets = [];
        this.time = 0;
        this.isPlaying = true;
        this.speed = 1.0;
        
        this.init();
    }

    init() {
        console.log('Canvas3DAdvanced init started');
        
        // Check if Three.js is available
        if (typeof THREE === 'undefined') {
            console.error('Three.js is not loaded!');
            this.container.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Error: Three.js library not loaded</p>';
            return;
        }

        try {
            // Scene setup with space background
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x000011); // Dark blue space background
            
            // Camera setup
            this.camera = new THREE.PerspectiveCamera(75, 800 / 500, 0.1, 1000);
            this.camera.position.set(0, 5, 15);
            this.camera.lookAt(0, 0, 0);
            
            // Renderer setup
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true,
                alpha: true,
                preserveDrawingBuffer: false
            });
            this.renderer.setSize(800, 500);
            this.renderer.setClearColor(0x000011, 1);
            this.container.appendChild(this.renderer.domElement);
            
            // Create solar system
            this.createSolarSystem();
            
            // Setup controls
            this.setupControls();
            
            // Animation loop
            this.animate();
            
            // Handle window resize
            window.addEventListener('resize', () => this.onWindowResize());
            
            console.log('Solar System initialized successfully');
        } catch (error) {
            console.error('Error initializing Solar System:', error);
            this.container.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Error initializing solar system</p>';
        }
    }

    createSolarSystem() {
        // Create starfield background
        this.createStarfield();
        
        // Create the sun
        this.createSun();
        
        // Create planets
        this.createPlanets();
        
        // Add ambient lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
    }

    createStarfield() {
        // Create a large sphere for the starfield
        const starGeometry = new THREE.SphereGeometry(50, 64, 64);
        const starMaterial = new THREE.MeshBasicMaterial({
            color: 0x000011,
            side: THREE.BackSide
        });
        
        const starfield = new THREE.Mesh(starGeometry, starMaterial);
        this.scene.add(starfield);
        
        // Add individual stars
        for (let i = 0; i < 200; i++) {
            const starGeometry = new THREE.SphereGeometry(0.02 + Math.random() * 0.03, 8, 8);
            const starMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.3 + Math.random() * 0.7
            });
            
            const star = new THREE.Mesh(starGeometry, starMaterial);
            
            // Random position on a large sphere
            const radius = 30 + Math.random() * 20;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            
            star.position.x = radius * Math.sin(phi) * Math.cos(theta);
            star.position.y = radius * Math.sin(phi) * Math.sin(theta);
            star.position.z = radius * Math.cos(phi);
            
            star.userData = {
                type: 'star',
                twinkleSpeed: 0.02 + Math.random() * 0.03,
                originalOpacity: starMaterial.opacity
            };
            
            this.scene.add(star);
        }
    }

    createSun() {
        // Sun geometry
        const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
        
        // Sun material with monochromatic glow effect
        const sunMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0xcccccc,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });
        
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.userData = {
            type: 'sun',
            pulseSpeed: 0.05,
            jumpSpeed: 0.03,
            originalY: 0
        };
        
        this.scene.add(this.sun);
        
        // Add monochromatic sun glow
        const sunGlow = new THREE.PointLight(0xffffff, 1, 20);
        sunGlow.position.copy(this.sun.position);
        this.scene.add(sunGlow);
    }

    createPlanets() {
        const planetData = [
            { name: 'Mercury', radius: 0.3, distance: 4, speed: 0.8, color: 0x333333 },
            { name: 'Venus', radius: 0.5, distance: 6, speed: 0.6, color: 0x666666 },
            { name: 'Earth', radius: 0.6, distance: 8, speed: 0.5, color: 0x999999 },
            { name: 'Mars', radius: 0.4, distance: 10, speed: 0.4, color: 0xcccccc },
            { name: 'Jupiter', radius: 1.2, distance: 13, speed: 0.3, color: 0xdddddd },
            { name: 'Saturn', radius: 1.0, distance: 16, speed: 0.25, color: 0xeeeeee }
        ];
        
        planetData.forEach((data, index) => {
            const planet = this.createPlanet(data, index);
            this.planets.push(planet);
        });
    }

    createPlanet(data, index) {
        const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: data.color,
            shininess: 30
        });
        
        const planet = new THREE.Mesh(geometry, material);
        
        // Position planet in orbit
        const angle = (index / 6) * Math.PI * 2;
        planet.position.x = Math.cos(angle) * data.distance;
        planet.position.z = Math.sin(angle) * data.distance;
        
        planet.userData = {
            type: 'planet',
            name: data.name,
            orbitRadius: data.distance,
            orbitSpeed: data.speed,
            orbitAngle: angle,
            rotationSpeed: 0.02
        };
        
        this.scene.add(planet);
        return planet;
    }

    setupControls() {
        console.log('Setting up Solar System controls');
        
        const playBtn = document.getElementById('playSolar');
        const pauseBtn = document.getElementById('pauseSolar');
        const resetBtn = document.getElementById('resetSolar');
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        
        console.log('Found Solar System controls:', { playBtn, pauseBtn, resetBtn, speedSlider, speedValue });
        
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.isPlaying = true;
                console.log('Solar System play');
            });
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.isPlaying = false;
                console.log('Solar System pause');
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.time = 0;
                this.resetPlanets();
                console.log('Solar System reset');
            });
        }
        
        if (speedSlider && speedValue) {
            speedSlider.addEventListener('input', (e) => {
                this.speed = parseFloat(e.target.value);
                speedValue.textContent = this.speed.toFixed(1) + 'x';
                console.log('Solar System speed:', this.speed);
            });
        }
        
        console.log('Solar System controls set up');
    }

    resetPlanets() {
        this.planets.forEach((planet, index) => {
            const angle = (index / 6) * Math.PI * 2;
            planet.position.x = Math.cos(angle) * planet.userData.orbitRadius;
            planet.position.z = Math.sin(angle) * planet.userData.orbitRadius;
            planet.userData.orbitAngle = angle;
        });
    }

    createMaterial(materialType) {
        const materials = {
            'metallic': new THREE.MeshPhongMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.9,
                shininess: 100,
                specular: 0x666666,
                reflectivity: 0.8
            }),
            'glass': new THREE.MeshPhongMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.3,
                shininess: 200,
                specular: 0xffffff,
                reflectivity: 1.0
            }),
            'wireframe': new THREE.MeshPhongMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.8,
                wireframe: true,
                shininess: 50
            }),
            'matte': new THREE.MeshPhongMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.7,
                shininess: 10,
                specular: 0x111111
            })
        };
        
        return materials[materialType] || materials['metallic'];
    }

    createInitialMaterialComposition() {
        // Create a central sphere with glass material
        const sphereGeometry = new THREE.SphereGeometry(1.5, 64, 64);
        const glassMaterial = this.createMaterial('glass');
        const sphere = new THREE.Mesh(sphereGeometry, glassMaterial);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        sphere.userData = { type: 'central', rotationSpeed: 0.005 };
        this.scene.add(sphere);
        this.objects.push(sphere);
        
        // Add metallic torus
        const torusGeometry = new THREE.TorusGeometry(2, 0.3, 32, 64);
        const metallicMaterial = this.createMaterial('metallic');
        const torus = new THREE.Mesh(torusGeometry, metallicMaterial);
        torus.castShadow = true;
        torus.receiveShadow = true;
        torus.userData = { type: 'torus', rotationSpeed: 0.01 };
        this.scene.add(torus);
        this.objects.push(torus);
        
        // Add wireframe elements
        this.addWireframeElements();
    }

    addMaterialObject() {
        const geometries = [
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.SphereGeometry(0.8, 32, 32),
            new THREE.CylinderGeometry(0.5, 0.5, 2, 32),
            new THREE.OctahedronGeometry(0.8)
        ];
        
        const materialTypes = ['metallic', 'glass', 'wireframe', 'matte'];
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const materialType = materialTypes[this.materialIndex % materialTypes.length];
        const material = this.createMaterial(materialType);
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6
        );
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { 
            type: 'material', 
            rotationSpeed: 0.01 + Math.random() * 0.02,
            materialType: materialType
        };
        
        this.scene.add(mesh);
        this.objects.push(mesh);
        this.materialIndex++;
    }

    addWireframeElements() {
        for (let i = 0; i < 4; i++) { // Reduced from 8 to 4 for better performance
            const geometry = new THREE.IcosahedronGeometry(0.3);
            const material = this.createMaterial('wireframe');
            const mesh = new THREE.Mesh(geometry, material);
            
            mesh.position.set(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4
            );
            
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData = {
                type: 'wireframe',
                rotationSpeed: Math.random() * 0.02 + 0.005,
                floatSpeed: Math.random() * 0.01 + 0.003,
                floatOffset: Math.random() * Math.PI * 2
            };
            
            this.scene.add(mesh);
            this.objects.push(mesh);
        }
    }

    addDynamicLight() {
        const light = new THREE.PointLight(0x000000, 0.5, 8);
        light.position.set(
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6
        );
        
        light.userData = {
            type: 'dynamic',
            speed: Math.random() * 0.02 + 0.01,
            offset: Math.random() * Math.PI * 2
        };
        
        this.scene.add(light);
        this.lights.push(light);
    }

    clear() {
        this.objects.forEach(obj => {
            this.scene.remove(obj);
        });
        this.objects = [];
        
        this.lights.forEach(light => {
            if (light.userData && light.userData.type === 'dynamic') {
                this.scene.remove(light);
            }
        });
        this.lights = this.lights.filter(light => !light.userData || light.userData.type !== 'dynamic');
        
        this.createInitialMaterialComposition();
    }

    animate() {
        // Check if canvas is visible before animating
        if (!this.isVisible()) {
            requestAnimationFrame(this.animate.bind(this));
            return;
        }
        
        requestAnimationFrame(this.animate.bind(this));
        
        if (this.isPlaying) {
            this.time += 0.016 * this.speed;
        }
        
        // Animate sun
        if (this.sun) {
            // Sun pulse effect
            const pulse = Math.sin(this.time * this.sun.userData.pulseSpeed) * 0.1;
            this.sun.scale.setScalar(1 + pulse);
            
            // Sun jump effect
            const jump = Math.sin(this.time * this.sun.userData.jumpSpeed) * 0.3;
            this.sun.position.y = this.sun.userData.originalY + jump;
            
            // Sun rotation
            this.sun.rotation.y += 0.005;
        }
        
        // Animate planets
        this.planets.forEach(planet => {
            if (planet.userData.type === 'planet') {
                // Update orbit angle
                planet.userData.orbitAngle += planet.userData.orbitSpeed * this.speed * 0.01;
                
                // Update position
                planet.position.x = Math.cos(planet.userData.orbitAngle) * planet.userData.orbitRadius;
                planet.position.z = Math.sin(planet.userData.orbitAngle) * planet.userData.orbitRadius;
                
                // Planet rotation
                planet.rotation.y += planet.userData.rotationSpeed;
            }
        });
        
        // Animate stars (twinkling effect)
        this.scene.children.forEach(child => {
            if (child.userData && child.userData.type === 'star') {
                const twinkle = Math.sin(this.time * child.userData.twinkleSpeed) * 0.3 + 0.7;
                child.material.opacity = child.userData.originalOpacity * twinkle;
            }
        });
        
        // Render the scene
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    isVisible() {
        const rect = this.container.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    onWindowResize() {
        this.camera.aspect = 800 / 500;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(800, 500);
    }
}

// Temporal Structure Implementation with D3.js
class TemporalVisualization {
    constructor() {
        console.log('TemporalVisualization constructor called');
        this.container = document.getElementById('temporalVisualization');
        console.log('Container element:', this.container);
        
        if (!this.container) {
            console.error('temporalVisualization element not found!');
            return;
        }
        
        this.width = 800;
        this.height = 500;
        this.margin = { top: 80, right: 150, bottom: 100, left: 150 };
        this.climateData = null;
        this.datasets = [];
        this.isPlaying = false;
        this.currentYear = 2023; // Start with all data visible
        this.animationId = null;
        this.yearRange = { min: 1880, max: 2023 };
        this.speed = 1;
        this.cellSize = 12;
        this.cellPadding = 1;
        
        this.init();
    }

    async init() {
        // Check if D3.js is available
        if (typeof d3 === 'undefined') {
            console.error('D3.js is not loaded!');
            this.container.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Error: D3.js library not loaded</p>';
            return;
        }

        try {
            await this.loadClimateData();
            this.setupSVG();
            this.setupScales();
            this.setupAxes();
            this.setupEventListeners();
            this.draw();
            
            console.log('TemporalVisualization initialized successfully');
            console.log('Datasets loaded:', this.datasets.length);
        } catch (error) {
            console.error('Error initializing TemporalVisualization:', error);
            this.container.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Error initializing temporal visualization</p>';
        }
    }

    async loadClimateData() {
        try {
            const response = await fetch('climate_data.json');
            this.climateData = await response.json();
            
            // Create datasets from climate data
            Object.keys(this.climateData.datasets).forEach(key => {
                const dataset = this.climateData.datasets[key];
                this.datasets.push({
                    name: dataset.name,
                    data: dataset.data,
                    color: dataset.color,
                    unit: dataset.unit,
                    visible: true
                });
            });
            console.log('Climate data loaded successfully');
        } catch (error) {
            console.error('Error loading climate data:', error);
            // Fallback to generated data if file not found
            this.generateFallbackData();
            console.log('Using fallback data');
        }
        
        // Ensure we have data
        if (this.datasets.length === 0) {
            this.generateFallbackData();
            console.log('Generated fallback data');
        }
    }

    generateFallbackData() {
        const datasetTypes = [
            { name: 'Temperature Anomaly', color: '#ff6b6b', unit: '°C' },
            { name: 'Atmospheric CO2', color: '#4ecdc4', unit: 'ppm' },
            { name: 'Global Sea Level Rise', color: '#45b7d1', unit: 'mm' }
        ];

        datasetTypes.forEach((dataset, index) => {
            const data = [];
            for (let year = 1880; year <= 2023; year++) {
                let value;
                if (dataset.name === 'Temperature Anomaly') {
                    // Temperature: start negative, trend upward
                    value = -0.5 + (year - 1880) * 0.012;
                } else if (dataset.name === 'Atmospheric CO2') {
                    // CO2: start at 315, trend upward
                    value = 315 + (year - 1959) * 1.5;
                } else if (dataset.name === 'Global Sea Level Rise') {
                    // Sea Level: start at 0, trend upward
                    value = (year - 1993) * 2.1;
                }
                
                data.push({
                    year: year,
                    value: value
                });
            }
            
            this.datasets.push({
                name: dataset.name,
                data: data,
                color: dataset.color,
                unit: dataset.unit,
                visible: true
            });
        });
        
        console.log('Fallback data generated:', this.datasets.length, 'datasets');
    }

    setupSVG() {
        // Clear any existing content
        d3.select(this.container).selectAll('*').remove();
        
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('background', '#ffffff');

        this.g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
            
        console.log('SVG setup complete, grid dimensions:', this.gridWidth, 'x', this.gridHeight);
    }

    setupScales() {
        // Calculate grid dimensions
        const years = this.yearRange.max - this.yearRange.min + 1;
        const numDatasets = this.datasets.length;
        
        this.gridWidth = (this.width - this.margin.left - this.margin.right);
        this.gridHeight = (this.height - this.margin.top - this.margin.bottom);
        
        // Scale for years (x-axis)
        this.xScale = d3.scaleLinear()
            .domain([this.yearRange.min, this.yearRange.max])
            .range([0, this.gridWidth]);
            
        // Scale for datasets (y-axis)
        this.yScale = d3.scaleBand()
            .domain(this.datasets.map(d => d.name))
            .range([0, this.gridHeight])
            .padding(0.1);
            
        // Color scales for each dataset
        this.colorScales = {};
        this.datasets.forEach(dataset => {
            const values = dataset.data.map(d => d.value);
            const min = Math.min(...values);
            const max = Math.max(...values);
            
            console.log(`Color scale for ${dataset.name}: min=${min}, max=${max}`);
            
            if (dataset.name.includes('Temperature')) {
                // Temperature: red scale (cool to warm)
                this.colorScales[dataset.name] = d3.scaleSequential()
                    .domain([min, max])
                    .interpolator(d3.interpolateReds);
            } else if (dataset.name.includes('CO2')) {
                // CO2: blue scale
                this.colorScales[dataset.name] = d3.scaleSequential()
                    .domain([min, max])
                    .interpolator(d3.interpolateBlues);
            } else {
                // Sea Level: blue scale
                this.colorScales[dataset.name] = d3.scaleSequential()
                    .domain([min, max])
                    .interpolator(d3.interpolateBlues);
            }
        });
    }

    setupAxes() {
        // X-axis (years)
        this.g.append('g')
            .attr('transform', `translate(0, ${this.gridHeight})`)
            .call(d3.axisBottom(this.xScale).tickFormat(d3.format('d')).ticks(8))
            .style('font-family', 'Poppins, sans-serif')
            .style('font-size', '9px')
            .style('color', '#000');

        // Y-axis (dataset names)
        this.g.append('g')
            .call(d3.axisLeft(this.yScale))
            .style('font-family', 'Poppins, sans-serif')
            .style('font-size', '10px')
            .style('color', '#000');

        // Labels
        this.g.append('text')
            .attr('x', this.gridWidth / 2)
            .attr('y', this.gridHeight + 25)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Poppins, sans-serif')
            .style('font-size', '12px')
            .style('font-weight', '300')
            .style('fill', '#000')
            .text('Year');

        this.g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -this.gridHeight / 2)
            .attr('y', -30)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Poppins, sans-serif')
            .style('font-size', '12px')
            .style('font-weight', '300')
            .style('fill', '#000')
            .text('Climate Variables');

        // Title
        this.g.append('text')
            .attr('x', this.gridWidth / 2)
            .attr('y', -15)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Poppins, sans-serif')
            .style('font-size', '14px')
            .style('font-weight', '300')
            .style('fill', '#000')
            .text('Temporal Climate Heatmap');
    }

    setupEventListeners() {
        console.log('Setting up TemporalVisualization event listeners');
        
        const playBtn = document.getElementById('playTemporal');
        const pauseBtn = document.getElementById('pauseTemporal');
        const resetBtn = document.getElementById('resetTemporal');
        const addStreamBtn = document.getElementById('addStream');
        
        console.log('Found buttons:', { playBtn, pauseBtn, resetBtn, addStreamBtn });
        
        if (playBtn) playBtn.addEventListener('click', this.play.bind(this));
        if (pauseBtn) pauseBtn.addEventListener('click', this.pause.bind(this));
        if (resetBtn) resetBtn.addEventListener('click', this.reset.bind(this));
        if (addStreamBtn) addStreamBtn.addEventListener('click', this.addStream.bind(this));
        
        console.log('Event listeners set up for TemporalVisualization');
    }

    draw() {
        // Clear previous content
        this.g.selectAll('.heatmap-cell').remove();
        this.g.selectAll('.time-indicator').remove();
        this.g.selectAll('.legend').remove();

        // Calculate cell dimensions
        const cellWidth = this.gridWidth / (this.yearRange.max - this.yearRange.min + 1);
        const cellHeight = this.yScale.bandwidth();
        
        console.log('Drawing heatmap with cell dimensions:', cellWidth, 'x', cellHeight);
        console.log('Number of datasets:', this.datasets.length);

        // Draw heatmap cells
        this.datasets.forEach((dataset, datasetIndex) => {
            const y = this.yScale(dataset.name);
            console.log(`Drawing dataset: ${dataset.name} at y=${y}, cellHeight=${cellHeight}`);
            
            let cellsCreated = 0;
            dataset.data.forEach(d => {
                const x = this.xScale(d.year);
                const color = this.colorScales[dataset.name](d.value);
                
                // Only show cells up to current year during animation
                if (d.year <= this.currentYear) {
                    const cell = this.g.append('rect')
                        .attr('class', 'heatmap-cell')
                        .attr('x', x)
                        .attr('y', y)
                        .attr('width', Math.max(1, cellWidth - this.cellPadding))
                        .attr('height', Math.max(1, cellHeight - this.cellPadding))
                        .attr('fill', color)
                        .attr('stroke', '#fff')
                        .attr('stroke-width', 0.5)
                        .style('opacity', 0.9);
                    
                    // Add tooltip for debugging
                    cell.append('title')
                        .text(`${dataset.name}: ${d.year} = ${d.value.toFixed(2)}`);
                    
                    cellsCreated++;
                }
            });
            console.log(`Created ${cellsCreated} cells for ${dataset.name}`);
        });

        // Draw time indicator
        this.g.append('line')
            .attr('class', 'time-indicator')
            .attr('x1', this.xScale(this.currentYear))
            .attr('x2', this.xScale(this.currentYear))
            .attr('y1', 0)
            .attr('y2', this.gridHeight)
            .attr('stroke', '#000')
            .attr('stroke-width', 2)
            .style('opacity', 0.8);

        // Year label
        this.g.append('text')
            .attr('class', 'time-indicator')
            .attr('x', this.xScale(this.currentYear) + 3)
            .attr('y', 12)
            .attr('text-anchor', 'start')
            .style('font-family', 'Poppins, sans-serif')
            .style('font-size', '10px')
            .style('font-weight', '300')
            .style('fill', '#000')
            .text(this.currentYear);

        // Add legend
        this.datasets.forEach((dataset, index) => {
            const legendY = 10 + index * 25;
            
            // Color gradient for legend
            const legendWidth = 60;
            const legendHeight = 10;
            const legendX = this.gridWidth - legendWidth - 5;
            
            // Create gradient
            const gradient = this.svg.append('defs')
                .append('linearGradient')
                .attr('id', `gradient-${index}`)
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '0%');
                
            const values = dataset.data.map(d => d.value);
            const min = Math.min(...values);
            const max = Math.max(...values);
            
            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', this.colorScales[dataset.name](min));
                
            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', this.colorScales[dataset.name](max));

            // Legend bar
            this.g.append('rect')
                .attr('class', 'legend')
                .attr('x', legendX)
                .attr('y', legendY)
                .attr('width', legendWidth)
                .attr('height', legendHeight)
                .attr('fill', `url(#gradient-${index})`)
                .attr('stroke', '#000')
                .attr('stroke-width', 0.5);

            // Legend text
            this.g.append('text')
                .attr('class', 'legend')
                .attr('x', legendX)
                .attr('y', legendY + legendHeight + 8)
                .attr('text-anchor', 'start')
                .style('font-family', 'Poppins, sans-serif')
                .style('font-size', '8px')
                .style('font-weight', '300')
                .style('fill', '#000')
                .text(`${dataset.name} (${dataset.unit})`);
        });
    }

    play() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.animate();
        }
    }

    pause() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    reset() {
        this.currentYear = this.yearRange.max; // Show all data
        this.draw();
    }

    animate() {
        if (!this.isPlaying) return;
        
        this.currentYear += this.speed;
        if (this.currentYear > this.yearRange.max) {
            this.currentYear = this.yearRange.min;
        }
        
        this.draw();
        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }

    addStream() {
        // Show heatmap information
        const info = `
Temporal Heatmap Structure

This visualization represents climate data as a spatial-temporal matrix:

Structure:
- X-axis: Time (1880-2023)
- Y-axis: Climate Variables (Temperature, CO2, Sea Level)
- Cells: Color intensity represents measurement magnitude

Color Encoding:
- Temperature: Red scale (cool to warm)
- CO2 Levels: Blue scale (low to high)
- Sea Level: Blue scale (low to high)

Temporal Patterns:
- Horizontal progression shows time evolution
- Vertical comparison reveals variable relationships
- Color gradients reveal trends and anomalies

This structure transforms linear time series into a spatial-temporal matrix, revealing patterns that emerge when viewing climate data as a unified temporal structure rather than separate graphs.
        `;
        
        alert(info);
    }
}

// Relational Structure Implementation
class RelationalVisualization {
    constructor() {
        console.log('RelationalVisualization constructor called');
        this.container = document.getElementById('relationalVisualization');
        console.log('Container element:', this.container);
        
        if (!this.container) {
            console.error('relationalVisualization element not found!');
            return;
        }
        
        this.width = 800;
        this.height = 500;
        this.nodes = [];
        this.links = [];
        this.simulation = null;
        this.svg = null;
        this.g = null;
        this.tooltip = null;
        this.zoom = null;
        
        this.init();
    }

    async init() {
        // Check if D3.js is available
        if (typeof d3 === 'undefined') {
            console.error('D3.js is not loaded!');
            this.container.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Error: D3.js library not loaded</p>';
            return;
        }

        try {
            await this.loadData();
            this.setupSVG();
            this.setupSimulation();
            this.setupEventListeners();
            this.draw();
            
            console.log('RelationalVisualization initialized successfully');
        } catch (error) {
            console.error('Error initializing RelationalVisualization:', error);
            this.container.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Error initializing relational visualization</p>';
        }
    }

    async loadData() {
        try {
            // Load nodes and links from CSV files
            const [nodesData, linksData] = await Promise.all([
                d3.csv('nodes.csv'),
                d3.csv('edges.csv')
            ]);
            
            this.nodes = nodesData.map(d => ({
                ...d,
                id: +d.id,
                size: +d.size
            }));
            
            this.links = linksData.map(d => ({
                ...d,
                source: +d.source,
                target: +d.target,
                weight: +d.weight
            }));
            
            console.log('Network data loaded:', this.nodes.length, 'nodes,', this.links.length, 'links');
        } catch (error) {
            console.error('Error loading network data:', error);
            this.generateFallbackData();
        }
    }

    generateFallbackData() {
        // Generate fallback data if CSV files not found
        this.nodes = [
            { id: 1, name: 'Alice Chen', type: 'Person', group: 'Design', size: 8 },
            { id: 2, name: 'Bob Rodriguez', type: 'Person', group: 'Technology', size: 6 },
            { id: 3, name: 'Carol Johnson', type: 'Person', group: 'Research', size: 7 },
            { id: 4, name: 'TechCorp', type: 'Organization', group: 'Technology', size: 15 },
            { id: 5, name: 'Design Studio', type: 'Organization', group: 'Design', size: 10 },
            { id: 6, name: 'AI Development', type: 'Topic', group: 'Technology', size: 8 },
            { id: 7, name: 'Sustainable Design', type: 'Topic', group: 'Design', size: 9 }
        ];
        
        this.links = [
            { source: 1, target: 5, weight: 4, type: 'Works' },
            { source: 2, target: 4, weight: 5, type: 'Works' },
            { source: 3, target: 6, weight: 5, type: 'Specializes' },
            { source: 1, target: 7, weight: 5, type: 'Specializes' },
            { source: 2, target: 6, weight: 6, type: 'Specializes' },
            { source: 4, target: 6, weight: 5, type: 'Funds' },
            { source: 5, target: 7, weight: 4, type: 'Specializes' }
        ];
        
        console.log('Fallback network data generated');
    }

    setupSVG() {
        // Clear any existing content
        d3.select(this.container).selectAll('*').remove();
        
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('background', '#ffffff');

        // Setup zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            });

        this.svg.call(this.zoom);

        this.g = this.svg.append('g');
        
        // Create tooltip
        this.tooltip = d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);
    }

    setupSimulation() {
        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', d3.forceLink(this.links).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide().radius(d => d.size + 5));
    }

    setupEventListeners() {
        const resetZoomBtn = document.getElementById('resetZoom');
        const addNodeBtn = document.getElementById('addNode');
        const clearBtn = document.getElementById('clearNetwork');
        const infoBtn = document.getElementById('networkInfo');
        
        console.log('Setting up relational event listeners...');
        console.log('resetZoomBtn:', resetZoomBtn);
        console.log('addNodeBtn:', addNodeBtn);
        console.log('clearBtn:', clearBtn);
        console.log('infoBtn:', infoBtn);
        
        if (resetZoomBtn) {
            resetZoomBtn.addEventListener('click', this.resetZoom.bind(this));
            console.log('Reset zoom button listener added');
        } else {
            console.error('resetZoom button not found!');
        }
        
        if (addNodeBtn) {
            addNodeBtn.addEventListener('click', this.addNode.bind(this));
            console.log('Add node button listener added');
        } else {
            console.error('addNode button not found!');
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', this.clear.bind(this));
            console.log('Clear button listener added');
        } else {
            console.error('clearNetwork button not found!');
        }
        
        if (infoBtn) {
            infoBtn.addEventListener('click', this.showInfo.bind(this));
            console.log('Info button listener added');
        } else {
            console.error('networkInfo button not found!');
        }
    }

    draw() {
        // Color scale for node groups
        const color = d3.scaleOrdinal()
            .domain(['Design', 'Technology', 'Research', 'Education'])
            .range(['#000000', '#333333', '#666666', '#999999']);

        // Draw links
        const link = this.g.append('g')
            .selectAll('line')
            .data(this.links)
            .enter().append('line')
            .attr('class', 'link')
            .attr('stroke-width', d => Math.sqrt(d.weight) * 2);

        // Draw nodes
        const node = this.g.append('g')
            .selectAll('circle')
            .data(this.nodes)
            .enter().append('circle')
            .attr('class', 'node')
            .attr('r', d => d.size)
            .attr('fill', d => color(d.group))
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .call(d3.drag()
                .on('start', this.dragstarted.bind(this))
                .on('drag', this.dragged.bind(this))
                .on('end', this.dragended.bind(this)))
            .on('mouseover', this.showTooltip.bind(this))
            .on('mouseout', this.hideTooltip.bind(this));

        // Add node labels
        const label = this.g.append('g')
            .selectAll('text')
            .data(this.nodes)
            .enter().append('text')
            .attr('class', 'node-label')
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .style('font-family', 'Poppins, sans-serif')
            .style('font-size', '10px')
            .style('font-weight', '300')
            .style('fill', '#000')
            .style('pointer-events', 'none')
            .text(d => d.name);

        // Update positions on simulation tick
        this.simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

            label
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        });
    }

    dragstarted(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    dragended(event, d) {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    showTooltip(event, d) {
        this.tooltip.transition()
            .duration(200)
            .style('opacity', .9);
        
        this.tooltip.html(`
            <strong>${d.name}</strong><br/>
            Type: ${d.type}<br/>
            Group: ${d.group}<br/>
            Size: ${d.size}
        `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
    }

    hideTooltip() {
        this.tooltip.transition()
            .duration(500)
            .style('opacity', 0);
    }

    resetZoom() {
        this.svg.transition().duration(750).call(
            this.zoom.transform,
            d3.zoomIdentity
        );
    }

    addNode() {
        const nodeTypes = ['Person', 'Organization', 'Topic'];
        const groups = ['Design', 'Technology', 'Research'];
        const names = ['New Person', 'New Org', 'New Topic'];
        
        const type = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
        const group = groups[Math.floor(Math.random() * groups.length)];
        const name = names[nodeTypes.indexOf(type)];
        
        const newNode = {
            id: this.nodes.length + 1,
            name: name,
            type: type,
            group: group,
            size: Math.random() * 5 + 5
        };
        
        this.nodes.push(newNode);
        this.simulation.nodes(this.nodes);
        this.draw();
    }

    clear() {
        this.nodes = [];
        this.links = [];
        this.simulation.nodes(this.nodes);
        this.simulation.force('link').links(this.links);
        this.draw();
    }

    showInfo() {
        const info = `
Social Network Analysis

This visualization shows relationships in a creative technology ecosystem:

Node Types:
- People: Individuals in the network
- Organizations: Companies, institutions, agencies
- Topics: Areas of expertise and interest

Relationship Types:
- Works: Employment or collaboration
- Specializes: Area of expertise
- Collaborates: Partnership or joint work
- Funds: Financial support
- Related: Conceptual connections

Features:
- Drag nodes to reposition
- Zoom and pan to explore
- Hover for detailed information
- Reset view to center
        `;
        
        alert(info);
    }
}

// Geospatial Structure Implementation
class GeospatialMap {
    constructor() {
        console.log('GeospatialMap constructor called');
        this.container = document.getElementById('mapContainer');
        console.log('Container element:', this.container);
        
        if (!this.container) {
            console.error('mapContainer element not found!');
            return;
        }
        
        this.map = null;
        this.geojsonData = null;
        this.layers = {
            recent: null,
            older: null,
            all: null
        };
        this.layerVisibility = {
            recent: true,
            older: true,
            all: true
        };
        
        this.init();
    }

    async init() {
        // Check if Mapbox GL JS is available
        if (typeof mapboxgl === 'undefined') {
            console.error('Mapbox GL JS is not loaded!');
            this.container.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Error: Mapbox GL JS library not loaded</p>';
            return;
        }

        try {
            // Set your Mapbox access token here
            mapboxgl.accessToken = 'pk.eyJ1IjoiY2hlbHNlYWpoYWkiLCJhIjoiY21kYWhqZDJmMGJncjJpcjJsbXQ4bzlhayJ9.o_c0WoASGhPDvlgoNpAj1w';
            
            await this.loadGeoJSONData();
            this.setupMap();
            this.setupLayers();
            this.setupEventListeners();
            
            console.log('GeospatialMap initialized successfully');
        } catch (error) {
            console.error('Error initializing GeospatialMap:', error);
            this.container.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Error initializing geospatial map. Please check your Mapbox access token.</p>';
        }
    }

    async loadGeoJSONData() {
        try {
            const response = await fetch('VZV_Leading Pedestrian Intervals_20250808.geojson');
            this.geojsonData = await response.json();
            console.log('LPI data loaded:', this.geojsonData.features.length, 'intersections');
        } catch (error) {
            console.error('Error loading LPI data:', error);
            this.generateFallbackData();
        }
    }

    generateFallbackData() {
        // Generate fallback data if GeoJSON file not found
        this.geojsonData = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {
                        name: 'Central Park',
                        type: 'park',
                        area: 843,
                        description: 'Iconic urban park in Manhattan'
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [-73.9654, 40.7829]
                    }
                },
                {
                    type: 'Feature',
                    properties: {
                        name: 'The Metropolitan Museum of Art',
                        type: 'culture',
                        visitors: 6500000,
                        description: 'World-renowned art museum'
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [-73.9632, 40.7794]
                    }
                },
                {
                    type: 'Feature',
                    properties: {
                        name: 'Grand Central Terminal',
                        type: 'transport',
                        daily_riders: 750000,
                        description: 'Historic transportation hub'
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [-73.9762, 40.7527]
                    }
                }
            ]
        };
        
        console.log('Fallback GeoJSON data generated');
    }

    setupMap() {
        this.map = new mapboxgl.Map({
            container: this.container,
            style: 'mapbox://styles/mapbox/light-v11',
            center: [-73.935242, 40.730610], // New York City
            zoom: 10,
            attributionControl: false
        });

        // Add navigation controls
        this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Add fullscreen control
        this.map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    }

    setupLayers() {
        this.map.on('load', () => {
            // Add GeoJSON source
            this.map.addSource('lpi-data', {
                type: 'geojson',
                data: this.geojsonData
            });

            // Recent installations (2020)
            this.map.addLayer({
                id: 'recent-layer',
                type: 'circle',
                source: 'lpi-data',
                filter: ['==', ['get', 'install_da'], '2020/06/04'],
                paint: {
                    'circle-radius': 6,
                    'circle-color': '#000000',
                    'circle-opacity': 0.8,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#333333'
                }
            });

            // Older installations (pre-2020)
            this.map.addLayer({
                id: 'older-layer',
                type: 'circle',
                source: 'lpi-data',
                filter: ['!=', ['get', 'install_da'], '2020/06/04'],
                paint: {
                    'circle-radius': 6,
                    'circle-color': '#666666',
                    'circle-opacity': 0.8,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#999999'
                }
            });

            // Store layer references
            this.layers.recent = 'recent-layer';
            this.layers.older = 'older-layer';
            this.layers.all = 'all-layer';

            // Initially show all layers
            this.showAllLayers();

            // Add popup on click
            this.map.on('click', (e) => {
                const features = this.map.queryRenderedFeatures(e.point, {
                    layers: ['recent-layer', 'older-layer']
                });

                if (features.length > 0) {
                    const feature = features[0];
                    const properties = feature.properties;
                    
                    const popupContent = `
                        <h3 style="margin: 0 0 8px 0; font-family: 'Poppins', sans-serif; font-weight: 400;">LPI Intersection</h3>
                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;"><strong>Main Street:</strong> ${properties.main_street}</p>
                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;"><strong>Cross Street:</strong> ${properties.cross_stree}</p>
                        <p style="margin: 0; font-size: 12px; color: #000;"><strong>Installation Date:</strong> ${properties.install_da}</p>
                    `;

                    new mapboxgl.Popup()
                        .setLngLat(feature.geometry.coordinates)
                        .setHTML(popupContent)
                        .addTo(this.map);
                }
            });

            // Change cursor on hover
            this.map.on('mouseenter', ['recent-layer', 'older-layer'], () => {
                this.map.getCanvas().style.cursor = 'pointer';
            });

            this.map.on('mouseleave', ['recent-layer', 'older-layer'], () => {
                this.map.getCanvas().style.cursor = '';
            });
        });
    }

    setupEventListeners() {
        const toggleRecentBtn = document.getElementById('toggleRecent');
        const toggleOlderBtn = document.getElementById('toggleOlder');
        const toggleAllBtn = document.getElementById('toggleAll');
        const resetMapBtn = document.getElementById('resetMap');
        
        console.log('Setting up geospatial event listeners...');
        console.log('toggleRecentBtn:', toggleRecentBtn);
        console.log('toggleOlderBtn:', toggleOlderBtn);
        console.log('toggleAllBtn:', toggleAllBtn);
        console.log('resetMapBtn:', resetMapBtn);
        
        if (toggleRecentBtn) {
            toggleRecentBtn.addEventListener('click', this.toggleRecent.bind(this));
            console.log('Recent button listener added');
        } else {
            console.error('toggleRecent button not found!');
        }
        
        if (toggleOlderBtn) {
            toggleOlderBtn.addEventListener('click', this.toggleOlder.bind(this));
            console.log('Older button listener added');
        } else {
            console.error('toggleOlder button not found!');
        }
        
        if (toggleAllBtn) {
            toggleAllBtn.addEventListener('click', this.toggleAll.bind(this));
            console.log('All button listener added');
        } else {
            console.error('toggleAll button not found!');
        }
        
        if (resetMapBtn) {
            resetMapBtn.addEventListener('click', this.resetMap.bind(this));
            console.log('Reset button listener added');
        } else {
            console.error('resetMap button not found!');
        }
    }

    toggleRecent() {
        console.log('toggleRecent called');
        this.layerVisibility.recent = !this.layerVisibility.recent;
        const visibility = this.layerVisibility.recent ? 'visible' : 'none';
        console.log('Setting recent layer visibility to:', visibility);
        this.map.setLayoutProperty(this.layers.recent, 'visibility', visibility);
        
        const button = document.getElementById('toggleRecent');
        if (button) {
            button.style.background = this.layerVisibility.recent ? 
                'linear-gradient(45deg, #000000, #333333)' : 
                'linear-gradient(45deg, #9E9E9E, #757575)';
            console.log('Recent button background updated');
        }
    }

    toggleOlder() {
        console.log('toggleOlder called');
        this.layerVisibility.older = !this.layerVisibility.older;
        const visibility = this.layerVisibility.older ? 'visible' : 'none';
        console.log('Setting older layer visibility to:', visibility);
        this.map.setLayoutProperty(this.layers.older, 'visibility', visibility);
        
        const button = document.getElementById('toggleOlder');
        if (button) {
            button.style.background = this.layerVisibility.older ? 
                'linear-gradient(45deg, #666666, #999999)' : 
                'linear-gradient(45deg, #9E9E9E, #757575)';
            console.log('Older button background updated');
        }
    }

    toggleAll() {
        console.log('toggleAll called');
        // Show all layers
        this.showAllLayers();
        
        // Update button states
        const recentBtn = document.getElementById('toggleRecent');
        const olderBtn = document.getElementById('toggleOlder');
        const allBtn = document.getElementById('toggleAll');
        
        if (recentBtn) recentBtn.style.background = 'linear-gradient(45deg, #000000, #333333)';
        if (olderBtn) olderBtn.style.background = 'linear-gradient(45deg, #666666, #999999)';
        if (allBtn) allBtn.style.background = 'linear-gradient(45deg, #000000, #333333)';
        console.log('All layers shown and button states updated');
    }

    showAllLayers() {
        this.layerVisibility.recent = true;
        this.layerVisibility.older = true;
        
        this.map.setLayoutProperty(this.layers.recent, 'visibility', 'visible');
        this.map.setLayoutProperty(this.layers.older, 'visibility', 'visible');
    }

    resetMap() {
        this.map.flyTo({
            center: [-73.935242, 40.730610],
            zoom: 10,
            duration: 2000
        });
    }
}

// Engagement Component Implementation - Poll System
class PollComponent {
    constructor() {
        this.selectedOption = null;
        this.pollData = {
            generative: 0,
            parametric: 0,
            dataDriven: 0,
            interactive: 0
        };
        this.totalVotes = 0;
        this.hasVoted = false;
        this.db = null;
        
        this.init();
    }

    async init() {
        console.log('Initializing Poll Component...');
        
        // Initialize Firebase
        await this.initializeFirebase();
        
        // Load existing poll data
        await this.loadPollData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update display
        this.updateDisplay();
    }

    async initializeFirebase() {
        try {
            // Firebase configuration - you'll need to replace with your own config
            const firebaseConfig = {
                apiKey: "AIzaSyBxVOsFEzXHxqXqXqXqXqXqXqXqXqXqXqXq",
                authDomain: "cdw-poll.firebaseapp.com",
                projectId: "cdw-poll",
                storageBucket: "cdw-poll.appspot.com",
                messagingSenderId: "123456789",
                appId: "1:123456789:web:abcdef123456"
            };

            // Initialize Firebase
            firebase.initializeApp(firebaseConfig);
            this.db = firebase.firestore();
            
            console.log('Firebase initialized successfully');
        } catch (error) {
            console.error('Firebase initialization failed:', error);
            // Fallback to local storage if Firebase fails
            this.useLocalStorage = true;
        }
    }

    async loadPollData() {
        try {
            if (this.db) {
                const doc = await this.db.collection('polls').doc('design-preferences').get();
                if (doc.exists) {
                    this.pollData = doc.data();
                    this.totalVotes = this.pollData.generative + this.pollData.parametric + 
                                    this.pollData.dataDriven + this.pollData.interactive;
                }
            } else if (this.useLocalStorage) {
                const savedData = localStorage.getItem('pollData');
                if (savedData) {
                    this.pollData = JSON.parse(savedData);
                    this.totalVotes = this.pollData.generative + this.pollData.parametric + 
                                    this.pollData.dataDriven + this.pollData.interactive;
                }
            }
        } catch (error) {
            console.error('Error loading poll data:', error);
        }
    }

    async savePollData() {
        try {
            if (this.db) {
                await this.db.collection('polls').doc('design-preferences').set(this.pollData);
            } else if (this.useLocalStorage) {
                localStorage.setItem('pollData', JSON.stringify(this.pollData));
            }
        } catch (error) {
            console.error('Error saving poll data:', error);
        }
    }

    setupEventListeners() {
        // Poll option selection
        const pollOptions = document.querySelectorAll('.poll-option');
        pollOptions.forEach(option => {
            option.addEventListener('click', () => {
                if (this.hasVoted) return;
                
                // Remove previous selection
                pollOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Select current option
                option.classList.add('selected');
                this.selectedOption = option.dataset.value;
            });
        });

        // Button event listeners
        const submitBtn = document.getElementById('submitPoll');
        const viewResultsBtn = document.getElementById('viewResults');
        const resetBtn = document.getElementById('resetPoll');

        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitVote());
        }

        if (viewResultsBtn) {
            viewResultsBtn.addEventListener('click', () => this.showResults());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetPoll());
        }
    }

    async submitVote() {
        if (!this.selectedOption || this.hasVoted) {
            alert('Please select an option first!');
            return;
        }

        try {
            // Update poll data
            this.pollData[this.selectedOption]++;
            this.totalVotes++;
            this.hasVoted = true;

            // Save to database
            await this.savePollData();

            // Update display
            this.updateDisplay();
            this.showResults();

            // Update button states
            const submitBtn = document.getElementById('submitPoll');
            if (submitBtn) {
                submitBtn.textContent = 'Vote Submitted!';
                submitBtn.disabled = true;
                submitBtn.style.background = 'linear-gradient(45deg, #000000, #333333)';
            }

            console.log('Vote submitted successfully');
        } catch (error) {
            console.error('Error submitting vote:', error);
            alert('Error submitting vote. Please try again.');
        }
    }

    showResults() {
        const resultsDiv = document.getElementById('pollResults');
        const optionsDiv = document.getElementById('pollOptions');
        
        if (resultsDiv && optionsDiv) {
            optionsDiv.style.display = 'none';
            resultsDiv.style.display = 'block';
            
            this.renderResults();
        }
    }

    renderResults() {
        const resultsChart = document.getElementById('resultsChart');
        const resultsStats = document.getElementById('resultsStats');
        
        if (!resultsChart || !resultsStats) return;

        // Clear previous results
        resultsChart.innerHTML = '';
        resultsStats.innerHTML = '';

        // Create result bars
        const options = [
            { key: 'generative', label: 'Generative Design', icon: '🎨' },
            { key: 'parametric', label: 'Parametric Modeling', icon: '⚙️' },
            { key: 'dataDriven', label: 'Data-Driven Design', icon: '📊' },
            { key: 'interactive', label: 'Interactive Systems', icon: '🖱️' }
        ];

        options.forEach(option => {
            const votes = this.pollData[option.key];
            const percentage = this.totalVotes > 0 ? (votes / this.totalVotes * 100).toFixed(1) : 0;
            
            const resultBar = document.createElement('div');
            resultBar.className = 'result-bar';
            resultBar.innerHTML = `
                <div class="result-label">${option.icon} ${option.label}</div>
                <div class="result-progress">
                    <div class="result-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="result-percentage">${percentage}%</div>
            `;
            
            resultsChart.appendChild(resultBar);
        });

        // Create stats
        const statsHTML = `
            <div class="stat-item">
                <span class="stat-number">${this.totalVotes}</span>
                <span class="stat-label">Total Votes</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${this.getMostPopularOption()}</span>
                <span class="stat-label">Most Popular</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${this.getAverageVotes()}</span>
                <span class="stat-label">Avg per Option</span>
            </div>
        `;
        
        resultsStats.innerHTML = statsHTML;
    }

    getMostPopularOption() {
        const options = [
            { key: 'generative', label: 'Generative' },
            { key: 'parametric', label: 'Parametric' },
            { key: 'dataDriven', label: 'Data-Driven' },
            { key: 'interactive', label: 'Interactive' }
        ];
        
        let maxVotes = 0;
        let mostPopular = 'None';
        
        options.forEach(option => {
            if (this.pollData[option.key] > maxVotes) {
                maxVotes = this.pollData[option.key];
                mostPopular = option.label;
            }
        });
        
        return mostPopular;
    }

    getAverageVotes() {
        const total = Object.values(this.pollData).reduce((sum, votes) => sum + votes, 0);
        return (total / 4).toFixed(1);
    }

    resetPoll() {
        // Reset poll data
        this.pollData = {
            generative: 0,
            parametric: 0,
            dataDriven: 0,
            interactive: 0
        };
        this.totalVotes = 0;
        this.hasVoted = false;
        this.selectedOption = null;

        // Save reset data
        this.savePollData();

        // Reset UI
        const pollOptions = document.querySelectorAll('.poll-option');
        pollOptions.forEach(option => option.classList.remove('selected'));

        const optionsDiv = document.getElementById('pollOptions');
        const resultsDiv = document.getElementById('pollResults');
        
        if (optionsDiv) optionsDiv.style.display = 'grid';
        if (resultsDiv) resultsDiv.style.display = 'none';

        const submitBtn = document.getElementById('submitPoll');
        if (submitBtn) {
            submitBtn.textContent = 'Submit Vote';
            submitBtn.disabled = false;
            submitBtn.style.background = '#000';
        }

        this.updateDisplay();
    }

    updateDisplay() {
        const totalVotesElement = document.getElementById('totalVotes');
        if (totalVotesElement) {
            totalVotesElement.textContent = this.totalVotes;
        }
    }
}

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing components...');
    
    // Test if elements exist
    console.log('Testing element existence:');
    console.log('canvas3d:', document.getElementById('canvas3d'));
    console.log('canvas3d-advanced:', document.getElementById('canvas3d-advanced'));
    console.log('temporalVisualization:', document.getElementById('temporalVisualization'));
    
    // Initialize all canvas components
    new Canvas2D();
    new Canvas3D();
    new Canvas3DAdvanced();
    new TemporalVisualization();
    new RelationalVisualization();
    new GeospatialMap();
    new PollComponent();
    
    // Add intersection observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
    
    console.log('All components initialized');
});
