
import * as THREE from "https://esm.sh/three@0.160.0";
import { OrbitControls } from "https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js";

/* =========================================
   FICTIONAL ARCHIVE - UNIVERSAL EXPLORER
   First milestone: interactive Solar System
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const canvasHost = document.getElementById("universeCanvas");
    const loadingScreen = document.getElementById("spaceLoading");
    const informationPanel = document.getElementById("bodyInformation");
    const bodyList = document.getElementById("bodyList");
    const databaseStatus = document.getElementById("databaseStatus");
    const message = document.getElementById("universalMessage");
    const bodyCount = document.getElementById("bodyCount");
    const viewTarget = document.getElementById("viewTarget");

    if (!canvasHost) return;

    const celestialBodies = [
        {
            id: "sun", name: "Sun", type: "G-type main-sequence star",
            description: "The central star of the Solar System. Its gravity governs the orbital motion of the planets and other objects in the system.",
            distance: "0 AU", diameter: "1,392,700 km", color: 0xffbd55,
            size: 2.5, orbit: 0, speed: 0.0015, emissive: 0xff7b22, info: "STELLAR BODY"
        },
        {
            id: "mercury", name: "Mercury", type: "Terrestrial planet",
            description: "The smallest planet in the Solar System and the closest planet to the Sun.",
            distance: "0.39 AU", diameter: "4,879 km", color: 0x9b9690,
            size: 0.38, orbit: 5.2, speed: 0.018, info: "PLANET"
        },
        {
            id: "venus", name: "Venus", type: "Terrestrial planet",
            description: "A rocky planet with a dense atmosphere. Venus is the second planet from the Sun.",
            distance: "0.72 AU", diameter: "12,104 km", color: 0xd6a66e,
            size: 0.62, orbit: 7.4, speed: 0.013, info: "PLANET"
        },
        {
            id: "earth", name: "Earth", type: "Terrestrial planet",
            description: "The third planet from the Sun and the home world of humanity. Earth is the only known world with confirmed life.",
            distance: "1.00 AU", diameter: "12,742 km", color: 0x397fbd,
            size: 0.66, orbit: 10, speed: 0.01, info: "PLANET"
        },
        {
            id: "mars", name: "Mars", type: "Terrestrial planet",
            description: "A cold desert world known for its reddish appearance and evidence of ancient surface water.",
            distance: "1.52 AU", diameter: "6,779 km", color: 0xb85e43,
            size: 0.49, orbit: 12.8, speed: 0.008, info: "PLANET"
        },
        {
            id: "jupiter", name: "Jupiter", type: "Gas giant",
            description: "The largest planet in the Solar System, with a vast atmosphere and an extensive system of moons.",
            distance: "5.20 AU", diameter: "139,820 km", color: 0xc99c76,
            size: 1.45, orbit: 17.2, speed: 0.0045, info: "PLANET"
        },
        {
            id: "saturn", name: "Saturn", type: "Gas giant",
            description: "A gas giant distinguished by its large and complex ring system.",
            distance: "9.58 AU", diameter: "116,460 km", color: 0xd8bd83,
            size: 1.2, orbit: 22.2, speed: 0.0032, info: "PLANET"
        },
        {
            id: "uranus", name: "Uranus", type: "Ice giant",
            description: "An ice giant with a blue-green appearance and an extreme axial tilt.",
            distance: "19.2 AU", diameter: "50,724 km", color: 0x82c9d0,
            size: 0.88, orbit: 27.2, speed: 0.0022, info: "PLANET"
        },
        {
            id: "neptune", name: "Neptune", type: "Ice giant",
            description: "A distant ice giant with a deep blue atmosphere and powerful winds.",
            distance: "30.1 AU", diameter: "49,244 km", color: 0x426bcb,
            size: 0.84, orbit: 32.2, speed: 0.0017, info: "PLANET"
        }
    ];

    let scene, camera, renderer, controls, raycaster, pointer;
    let selectedBodyId = null;
    let showOrbits = true;
    let animationFrame = null;
    const bodyMeshes = new Map();
    const orbitLines = [];
    const clickableMeshes = [];

    const textureColors = {
        sun: 0xffb34d, mercury: 0x918d88, venus: 0xc99a64,
        earth: 0x397fbd, mars: 0xb65b40, jupiter: 0xb98e6b,
        saturn: 0xcbb17d, uranus: 0x83cbd0, neptune: 0x426bc9
    };

    function showMessage(text) {
        message.textContent = text;
        message.hidden = false;
    }

    function hideMessage() {
        message.hidden = true;
        message.textContent = "";
    }

    function makePlanetMaterial(body) {
        const material = new THREE.MeshStandardMaterial({
            color: body.color,
            roughness: body.id === "sun" ? 0.85 : 0.9,
            metalness: 0.02
        });

        if (body.id === "sun") {
            material.emissive = new THREE.Color(body.emissive);
            material.emissiveIntensity = 1.15;
        } else if (body.id === "earth") {
            material.roughness = 0.75;
        }
        return material;
    }

    function addStars() {
        const starGeometry = new THREE.BufferGeometry();
        const positions = [];

        for (let i = 0; i < 2600; i++) {
            const radius = 45 + Math.random() * 95;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            positions.push(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );
        }

        starGeometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(positions, 3)
        );

        const stars = new THREE.Points(
            starGeometry,
            new THREE.PointsMaterial({
                color: 0xc5d4e8,
                size: 0.12,
                transparent: true,
                opacity: 0.8
            })
        );

        scene.add(stars);
    }

    function addOrbit(radius) {
        const points = [];
        const segments = 180;

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(
                new THREE.Vector3(
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius
                )
            );
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const line = new THREE.LineLoop(
            geometry,
            new THREE.LineBasicMaterial({
                color: 0x52647c,
                transparent: true,
                opacity: 0.36
            })
        );

        scene.add(line);
        orbitLines.push(line);
    }

    function addSaturnRings(mesh) {
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(1.45, 2.25, 80),
            new THREE.MeshBasicMaterial({
                color: 0xcbb98f,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.72
            })
        );

        ring.rotation.x = Math.PI / 2.35;
        mesh.add(ring);
    }

    function createBody(body) {
        const geometry = new THREE.SphereGeometry(body.size, 48, 48);
        const mesh = new THREE.Mesh(geometry, makePlanetMaterial(body));

        mesh.userData.bodyId = body.id;

        if (body.id === "sun") {
            mesh.position.set(0, 0, 0);

            const glow = new THREE.Mesh(
                new THREE.SphereGeometry(body.size * 1.16, 32, 32),
                new THREE.MeshBasicMaterial({
                    color: 0xffa33d,
                    transparent: true,
                    opacity: 0.09,
                    side: THREE.BackSide
                })
            );

            mesh.add(glow);
        } else {
            mesh.position.set(body.orbit, 0, 0);
        }

        if (body.id === "saturn") {
            addSaturnRings(mesh);
        }

        const pivot = new THREE.Group();

        if (body.id !== "sun") {
            pivot.add(mesh);
            scene.add(pivot);
            pivot.userData.orbitBodyId = body.id;
        } else {
            scene.add(mesh);
        }

        const record = {
            mesh,
            pivot,
            body,
            angle: Math.random() * Math.PI * 2
        };

        bodyMeshes.set(body.id, record);
        clickableMeshes.push(mesh);
    }

    function createScene() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x050912);
        scene.fog = new THREE.FogExp2(0x050912, 0.0018);

        camera = new THREE.PerspectiveCamera(
            45,
            canvasHost.clientWidth / canvasHost.clientHeight,
            0.1,
            500
        );

        camera.position.set(0, 28, 48);

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(
            canvasHost.clientWidth,
            canvasHost.clientHeight
        );

        renderer.outputColorSpace = THREE.SRGBColorSpace;
        canvasHost.appendChild(renderer.domElement);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.055;
        controls.minDistance = 7;
        controls.maxDistance = 95;
        controls.maxPolarAngle = Math.PI * 0.49;
        controls.target.set(0, 0, 0);

        scene.add(new THREE.AmbientLight(0x9aacc8, 0.72));

        const sunLight = new THREE.PointLight(
            0xffd39a,
            3.3,
            180,
            1.25
        );

        sunLight.position.set(0, 0, 0);
        scene.add(sunLight);

        addStars();

        celestialBodies.forEach(body => {
            if (body.orbit > 0) {
                addOrbit(body.orbit);
            }

            createBody(body);
        });

        raycaster = new THREE.Raycaster();
        pointer = new THREE.Vector2();

        renderer.domElement.addEventListener(
            "pointerdown",
            onCanvasPointerDown
        );

        window.addEventListener("resize", onResize);

        populateBodyList();
        animate();

        requestAnimationFrame(() => {
            loadingScreen.classList.add("is-hidden");

            setTimeout(() => loadingScreen.remove(), 600);
        });
    }

    function onCanvasPointerDown(event) {
        const rect = renderer.domElement.getBoundingClientRect();

        pointer.x = (
            (event.clientX - rect.left) / rect.width
        ) * 2 - 1;

        pointer.y = -(
            (event.clientY - rect.top) / rect.height
        ) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);

        const hits = raycaster.intersectObjects(
            clickableMeshes,
            false
        );

        if (hits.length) {
            const id = hits[0].object.userData.bodyId;
            selectBody(id);
        }
    }

    function onResize() {
        if (!camera || !renderer) return;

        const width = canvasHost.clientWidth;
        const height = canvasHost.clientHeight;

        if (!width || !height) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    }

    function animate() {
        animationFrame = requestAnimationFrame(animate);

        celestialBodies.forEach(body => {
            const record = bodyMeshes.get(body.id);
            if (!record) return;

            record.mesh.rotation.y += (
                body.id === "sun" ? 0.0015 : 0.003
            );

            if (body.id !== "sun") {
                record.angle += body.speed;
                record.pivot.rotation.y = record.angle;
            }
        });

        controls.update();
        renderer.render(scene, camera);
    }

    function populateBodyList() {
        bodyCount.textContent =
            `${celestialBodies.length.toString().padStart(2, "0")} OBJECTS`;

        bodyList.innerHTML = "";

        celestialBodies.forEach(body => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "ue-body-card";
            button.dataset.bodyId = body.id;

            const orb = document.createElement("span");
            orb.className = "ue-body-orb";

            orb.style.background =
                `#${textureColors[body.id].toString(16).padStart(6, "0")}`;

            const name = document.createElement("strong");
            name.textContent = body.name;

            const type = document.createElement("small");
            type.textContent =
                body.id === "sun" ? "STAR" : "PLANET";

            button.append(orb, name, type);

            button.addEventListener("click", () => {
                selectBody(body.id);
            });

            bodyList.appendChild(button);
        });
    }

    function selectBody(id) {
        const body = celestialBodies.find(
            item => item.id === id
        );

        if (!body) return;

        selectedBodyId = id;
        viewTarget.textContent = body.name.toUpperCase();

        bodyList.querySelectorAll(".ue-body-card").forEach(card => {
            card.classList.toggle(
                "selected",
                card.dataset.bodyId === id
            );
        });

        informationPanel.className = "";
        informationPanel.innerHTML = "";

        const type = document.createElement("div");
        type.className = "ue-info-type";
        type.textContent = body.info;

        const name = document.createElement("h2");
        name.className = "ue-info-name";
        name.textContent = body.name;

        const description = document.createElement("p");
        description.className = "ue-info-description";
        description.textContent = body.description;

        const details = [
            ["Object type", body.type],
            ["Distance from Sun", body.distance],
            ["Diameter", body.diameter]
        ];

        informationPanel.append(type, name, description);

        details.forEach(([label, value]) => {
            const detail = document.createElement("div");
            detail.className = "ue-info-detail";

            const labelElement = document.createElement("span");
            labelElement.textContent = label;

            const valueElement = document.createElement("strong");
            valueElement.textContent = value;

            detail.append(labelElement, valueElement);
            informationPanel.appendChild(detail);
        });

        if (id === "earth") {
            const link = document.createElement("a");

            link.className = "ue-record-link";
            link.href = "map.html";
            link.textContent = "OPEN EARTH EXPLORER";

            informationPanel.appendChild(link);
        }

        focusBody(id);
    }

    function focusBody(id) {
        const record = bodyMeshes.get(id);
        if (!record) return;

        const worldPosition = new THREE.Vector3();

        record.mesh.getWorldPosition(worldPosition);

        const direction = new THREE.Vector3()
            .subVectors(camera.position, controls.target)
            .normalize();

        const distance = id === "sun" ? 12 : 6.5;

        const newCameraPosition = worldPosition.clone()
            .add(direction.multiplyScalar(distance));

        controls.target.copy(worldPosition);
        camera.position.copy(newCameraPosition);

        controls.update();
    }

    function resetCamera() {
        controls.target.set(0, 0, 0);
        camera.position.set(0, 28, 48);

        controls.update();

        selectedBodyId = null;
        viewTarget.textContent = "SOL SYSTEM";

        informationPanel.className = "ue-empty";

        informationPanel.innerHTML = `
            <div class="ue-empty-symbol">◎</div>
            <strong>Select a celestial body</strong>
            <p>Choose a planet or the Sun in the 3D environment to inspect its archive profile.</p>
        `;

        bodyList.querySelectorAll(".ue-body-card").forEach(card => {
            card.classList.remove("selected");
        });
    }

    function setupControls() {
        document.getElementById("resetCamera")
            .addEventListener("click", resetCamera);

        document.getElementById("toggleOrbits")
            .addEventListener("click", event => {
                showOrbits = !showOrbits;

                orbitLines.forEach(line => {
                    line.visible = showOrbits;
                });

                event.currentTarget.classList.toggle(
                    "active",
                    showOrbits
                );

                event.currentTarget.textContent =
                    showOrbits ? "Orbits on" : "Orbits off";
            });

        document.getElementById("zoomIn")
            .addEventListener("click", () => {
                camera.position.multiplyScalar(0.82);
                controls.update();
            });

        document.getElementById("zoomOut")
            .addEventListener("click", () => {
                camera.position.multiplyScalar(1.22);
                controls.update();
            });
    }

    async function checkDatabase() {
        if (!window.supabaseClient) {
            databaseStatus.textContent = "OFFLINE";
            databaseStatus.style.color = "#d98c8c";

            showMessage(
                "The Supabase client was not found. Check that ../js/supabase.js loads correctly."
            );

            return;
        }

        try {
            const { error } = await window.supabaseClient
                .from("realities")
                .select("id")
                .limit(1);

            if (error) throw error;

            databaseStatus.textContent = "CONNECTED";
            databaseStatus.style.color = "#80bd9b";

            hideMessage();
        } catch (error) {
            console.error(
                "Universal Explorer database check failed:",
                error
            );

            databaseStatus.textContent = "ERROR";
            databaseStatus.style.color = "#d98c8c";

            showMessage(
                `Database connection check failed: ${error.message || "Unknown error"}`
            );
        }
    }

    setupControls();

    try {
        createScene();
        checkDatabase();
    } catch (error) {
        console.error(
            "Universal Explorer failed to initialise:",
            error
        );

        loadingScreen.innerHTML = `
            <strong>3D ENVIRONMENT COULD NOT START</strong>
            <span>${error.message}</span>
        `;

        showMessage(
            "The 3D environment could not initialise. Check the browser console for details."
        );
    }

    window.addEventListener("beforeunload", () => {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }

        if (renderer) {
            renderer.dispose();
        }
    });
});
