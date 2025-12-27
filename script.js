import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

const container = document.getElementById('canvas-container');
let scene, camera, renderer, clock;
let mouse = new THREE.Vector2();
let targetPos = new THREE.Vector3(0, 0, 0);
let roosterModel, mixer, headBone, neckBone;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 200);
    camera.position.set(0, 5, 50);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        logarithmicDepthBuffer: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.sortObjects = true;
    container.appendChild(renderer.domElement);

    clock = new THREE.Clock();

    // CAMPO DE ESTRELLAS
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 8000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const alphas = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 400;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
        positions[i * 3 + 2] = -Math.random() * 190 - 10;

        const sizeRoll = Math.random();
        if (sizeRoll > 0.98) {
            sizes[i] = Math.random() * 8 + 5;
        } else if (sizeRoll > 0.85) {
            sizes[i] = Math.random() * 4 + 2;
        } else if (sizeRoll > 0.5) {
            sizes[i] = Math.random() * 2 + 0.5;
        } else {
            sizes[i] = Math.random() * 1 + 0.2;
        }

        alphas[i] = Math.random() * 0.5 + 0.5;

        const colorRoll = Math.random();
        if (colorRoll > 0.95) {
            colors[i * 3] = 0.6 + Math.random() * 0.3;
            colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
            colors[i * 3 + 2] = 1.0;
        } else if (colorRoll > 0.9) {
            colors[i * 3] = 0.8 + Math.random() * 0.2;
            colors[i * 3 + 1] = 0.6 + Math.random() * 0.2;
            colors[i * 3 + 2] = 1.0;
        } else if (colorRoll > 0.85) {
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 0.7 + Math.random() * 0.2;
            colors[i * 3 + 2] = 0.5 + Math.random() * 0.2;
        } else {
            const brightness = 0.95 + Math.random() * 0.05;
            colors[i * 3] = brightness;
            colors[i * 3 + 1] = brightness;
            colors[i * 3 + 2] = brightness;
        }
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    starsGeometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

    const starsMaterial = new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: `
            attribute float size;
            attribute float alpha;
            varying vec3 vColor;
            varying float vAlpha;
            void main() {
                vColor = color;
                vAlpha = alpha;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;
            void main() {
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);
                float intensity = 1.0 - smoothstep(0.0, 0.5, dist);
                intensity = pow(intensity, 2.0);
                vec3 finalColor = vColor * intensity;
                float finalAlpha = intensity * vAlpha;
                gl_FragColor = vec4(finalColor, finalAlpha);
            }
        `,
        transparent: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));

    const sun = new THREE.DirectionalLight(0xffffff, 3.5);
    sun.position.set(10, 40, 20);
    sun.castShadow = true;
    scene.add(sun);

    const loader = new GLTFLoader();

    loader.load('./rooster.glb', (gltf) => {
        roosterModel = gltf.scene;

        const box = new THREE.Box3().setFromObject(roosterModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const targetHeight = 5.5;
        const scale = targetHeight / size.y;
        roosterModel.scale.setScalar(scale);

        roosterModel.position.x = -center.x * scale;
        roosterModel.position.y = -center.y * scale;
        roosterModel.position.z = -center.z * scale;

        const group = new THREE.Group();
        group.add(roosterModel);
        group.position.y = -9;
        scene.add(group);
        roosterModel = group;

        roosterModel.traverse(child => {
            if (child.isBone) {
                const name = child.name;
                if (name === 'Head') {
                    headBone = child;
                    console.log("¡CABEZA ENCONTRADA!", name);
                }
                if (name === 'neck') {
                    neckBone = child;
                    console.log("¡CUELLO ENCONTRADO!", name);
                }
            }
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                if (child.material) {
                    child.material.depthWrite = true;
                    child.material.depthTest = true;
                }
            }
        });

        if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(roosterModel);
            const originalAnim = gltf.animations.find(a => a.name.toLowerCase().includes('walk')) || gltf.animations[0];

            const filteredTracks = originalAnim.tracks.filter(track => {
                const boneName = track.name.split('.')[0];
                const isHeadOrNeck = boneName === 'Head' || boneName === 'neck' || boneName === 'headfront';
                if (isHeadOrNeck) {
                    console.log("🔪 Eliminando track de animación:", track.name);
                }
                return !isHeadOrNeck;
            });

            const cleanedAnim = new THREE.AnimationClip(originalAnim.name + '_filtered', originalAnim.duration, filteredTracks);
            const action = mixer.clipAction(cleanedAnim);
            action.play();
            console.log("✅ Animación de caminar activada (sin control de cabeza)");
        }

        camera.lookAt(0, 0, 0);
    }, undefined, (e) => console.error(e));

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);
}

function onMouseMove(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    targetPos.set(mouse.x * 25, 0, mouse.y * 15);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const t = clock.getElapsedTime();

    if (roosterModel) {
        // MOVIMIENTO HORIZONTAL
        const targetX = mouse.x * 5;
        const clampedX = Math.max(-5, Math.min(5, targetX));
        roosterModel.position.x = THREE.MathUtils.lerp(roosterModel.position.x, clampedX, 0.05);

        // ROTACIÓN INTELIGENTE
        const angle = Math.atan2(targetPos.x, targetPos.z);
        const maxRotation = 1.2;
        const clampedAngle = Math.max(-maxRotation, Math.min(maxRotation, angle));
        roosterModel.rotation.y = THREE.MathUtils.lerp(roosterModel.rotation.y, clampedAngle, 0.08);

        if (mixer) mixer.update(delta);

        if (neckBone) {
            const downwardInfluence = Math.max(0, mouse.y);
            const horizontalReduction = 1.0 - downwardInfluence * 0.6;

            const targetRotationY = mouse.x * 0.4 * horizontalReduction - 0.1;

            neckBone.rotation.y = THREE.MathUtils.lerp(
                neckBone.rotation.y,
                targetRotationY,
                0.1
            );

            neckBone.rotation.x = THREE.MathUtils.lerp(
                neckBone.rotation.x,
                -mouse.y * 0.5,
                0.1
            );
        }
        if (headBone) {
            const downwardInfluence = Math.max(0, mouse.y);
            const horizontalReduction = 1.0 - downwardInfluence * 0.6;

            const targetRotationY = mouse.x * 0.25 * horizontalReduction - 0.05;

            headBone.rotation.y = THREE.MathUtils.lerp(
                headBone.rotation.y,
                targetRotationY,
                0.1
            );
            headBone.rotation.x = THREE.MathUtils.lerp(
                headBone.rotation.x,
                -mouse.y * 0.3,
                0.1
            );
        }

        const breath = 1 + Math.sin(t * 2.5) * 0.02;
        roosterModel.scale.setScalar(breath);
    }
    renderer.render(scene, camera);
}

init();
animate();
