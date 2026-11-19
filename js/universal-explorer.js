
import * as THREE from "https://esm.sh/three@0.160.0";
import { OrbitControls } from "https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js";

/* =========================================
   FICTIONAL ARCHIVE
   UNIVERSAL NAVIGATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       ELEMENTS
    ===================================== */

    const canvasHost = document.getElementById("universeCanvas");
    const loadingScreen = document.getElementById("spaceLoading");

    const objectPanel = document.getElementById("objectPanel");
    const objectName = document.getElementById("objectName");
    const objectType = document.getElementById("objectType");
    const objectCategory = document.getElementById("objectCategory");
    const objectDescription = document.getElementById("objectDescription");
    const objectDetails = document.getElementById("objectDetails");
    const objectVisual = document.getElementById("objectVisual");
    const objectIndex = document.getElementById("objectIndex");
    const objectAction = document.getElementById("objectAction");

    const bodyList = document.getElementById("bodyList");
    const bodyCount = document.getElementById("bodyCount");

    const viewTarget = document.getElementById("viewTarget");
    const viewCoordinates = document.getElementById("viewCoordinates");

    const databaseStatus = document.getElementById("databaseStatus");
    const message = document.getElementById("universalMessage");

    if (!canvasHost) return;


    /* =====================================
       CELESTIAL OBJECTS
    ===================================== */

    const celestialBodies = [
        {
            id: "sun",
            name: "Sun",
            type: "Star",
            category: "STELLAR OBJECT",
            description: "The central star of the Solar System. Its immense energy and gravity shape the surrounding planetary environment.",
            diameter: "1,392,700 km",
            distance: "0 AU",
            color: 0xffa64d,
            size: 2.8,
            position: [0, 0, 0],
            texture: "sun"
        },
        {
            id: "mercury",
            name: "Mercury",
            type: "Terrestrial planet",
            category: "PLANETARY OBJECT",
            description: "A small rocky world with an ancient, heavily cratered surface.",
            diameter: "4,879 km",
            distance: "0.39 AU",
            color: 0x96918c,
            size: 0.55,
            position: [-7, 1, 4],
            texture: "rock"
        },
        {
            id: "venus",
            name: "Venus",
            type: "Terrestrial planet",
            category: "PLANETARY OBJECT",
            description: "A dense atmosphere surrounds this extremely hot world, hiding its surface beneath thick clouds.",
            diameter: "12,104 km",
            distance: "0.72 AU",
            color: 0xd9a46e,
            size: 0.85,
            position: [7, -1, -4],
            texture: "cloud"
        },
        {
            id: "earth",
            name: "Earth",
            type: "Terrestrial planet",
            category: "PLANETARY OBJECT",
            description: "A world of oceans, continents and complex ecosystems. Earth is currently the only known planet with confirmed life.",
            diameter: "12,742 km",
            distance: "1.00 AU",
            color: 0x328bd6,
            size: 0.95,
            position: [-4, 3, -12],
            texture: "earth"
        },
        {
            id: "mars",
            name: "Mars",
            type: "Terrestrial planet",
            category: "PLANETARY OBJECT",
            description: "A cold desert world with a reddish surface, enormous volcanoes and evidence of ancient water.",
            diameter: "6,779 km",
            distance: "1.52 AU",
            color: 0xb75c43,
            size: 0.72,
            position: [13, 2, 8],
            texture: "mars"
        },
        {
            id: "jupiter",
            name: "Jupiter",
            type: "Gas giant",
            category: "PLANETARY OBJECT",
            description: "The largest planet in the Solar System. Its atmosphere contains enormous cloud bands and powerful storms.",
            diameter: "139,820 km",
            distance: "5.20 AU",
            color: 0xc99c76,
            size: 2.1,
            position: [-17, -2, -5],
            texture: "jupiter"
        },
        {
            id: "saturn",
            name: "Saturn",
            type: "Gas giant",
            category: "PLANETARY OBJECT",
            description: "A gas giant surrounded by an extensive and visually distinctive ring system.",
            diameter: "116,460 km",
            distance: "9.58 AU",
            color: 0xd8bd83,
            size: 1.75,
            position: [19, 4, -13],
            texture: "saturn"
        },
        {
            id: "uranus",
            name: "Uranus",
            type: "Ice giant",
            category: "PLANETARY OBJECT",
            description: "A distant ice giant with a pale blue-green atmosphere and an extreme axial tilt.",
            diameter: "50,724 km",
            distance: "19.2 AU",
            color: 0x82c9d0,
            size: 1.25,
            position: [-13, -5, 17],
            texture: "ice"
        },
        {
            id: "neptune",
            name: "Neptune",
            type: "Ice giant",
            category: "PLANETARY OBJECT",
            description: "A remote blue ice giant with powerful winds and a dynamic atmosphere.",
            diameter: "49,244 km",
            distance: "30.1 AU",
            color: 0x426bcb,
            size: 1.2,
            position: [16, -4, 19],
            texture: "neptune"
        }
    ];


    /* =====================================
       VARIABLES
    ===================================== */

    let scene;
    let camera;
    let renderer;
    let controls;
    let raycaster;
    let pointer;

    let selectedBody = null;
    let showLabels = true;
    let animationFrame;

    const bodyMeshes = new Map();
    const clickableMeshes = [];
    const floatingObjects = [];

    const clock = new THREE.Clock();


    /* =====================================
       PROCEDURAL TEXTURES
    ===================================== */

    function createPlanetTexture(type, color) {

        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 512;

        const ctx = canvas.getContext("2d");

        const baseColor = new THREE.Color(color);

        ctx.fillStyle = `#${baseColor.getHexString()}`;
        ctx.fillRect(0, 0, 1024, 512);

        const imageData = ctx.getImageData(0, 0, 1024, 512);
        const data = imageData.data;

        // Surface noise

        for (let i = 0; i < data.length; i += 4) {

            const variation = Math.random() * 35 - 17;

            data[i] = Math.max(0, Math.min(255, data[i] + variation));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + variation));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + variation));
        }

        ctx.putImageData(imageData, 0, 0);

        // Atmospheric bands

        if (["jupiter", "saturn", "venus", "sun"].includes(type)) {

            for (let i = 0; i < 22; i++) {

                const y = Math.random() * 512;
                const height = Math.random() * 18 + 3;

                ctx.fillStyle = `rgba(255,255,255,${Math.random() * .12})`;

                ctx.fillRect(0, y, 1024, height);
            }
        }

        // Earth-like continents

        if (type === "earth") {

            ctx.fillStyle = "#397b48";

            for (let i = 0; i < 35; i++) {

                const x = Math.random() * 1024;
                const y = Math.random() * 512;

                ctx.beginPath();
                ctx.ellipse(
                    x,
                    y,
                    Math.random() * 60 + 20,
                    Math.random() * 35 + 10,
                    Math.random() * Math.PI,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }

            ctx.fillStyle = "rgba(230,245,255,.45)";

            for (let i = 0; i < 30; i++) {

                ctx.beginPath();
                ctx.arc(
                    Math.random() * 1024,
                    Math.random() * 512,
                    Math.random() * 15 + 3,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }

        // Craters

        if (type === "rock" || type === "mars") {

            for (let i = 0; i < 180; i++) {

                const x = Math.random() * 1024;
                const y = Math.random() * 512;
                const radius = Math.random() * 13 + 2;

                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);

                ctx.fillStyle = "rgba(0,0,0,.16)";
                ctx.fill();

                ctx.beginPath();
                ctx.arc(x - 2, y - 2, radius * .65, 0, Math.PI * 2);

                ctx.strokeStyle = "rgba(255,255,255,.13)";
                ctx.stroke();
            }
        }

        // Cloud patterns

        if (type === "cloud" || type === "venus") {

            for (let i = 0; i < 120; i++) {

                ctx.beginPath();

                ctx.ellipse(
                    Math.random() * 1024,
                    Math.random() * 512,
                    Math.random() * 100 + 20,
                    Math.random() * 20 + 5,
                    Math.random() * Math.PI,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle = "rgba(255,255,255,.09)";
                ctx.fill();
            }
        }

        // Ice patterns

        if (type === "ice" || type === "neptune") {

            for (let i = 0; i < 90; i++) {

                ctx.fillStyle = `rgba(220,250,255,${Math.random() * .13})`;

                ctx.fillRect(
                    Math.random() * 1024,
                    Math.random() * 512,
                    Math.random() * 80,
                    Math.random() * 5 + 1
                );
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;

        return texture;
    }


    /* =====================================
       ATMOSPHERE
    ===================================== */

    function addAtmosphere(mesh, color, size) {

        const atmosphere = new THREE.Mesh(
            new THREE.SphereGeometry(size * 1.12, 48, 48),

            new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.13,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );

        mesh.add(atmosphere);

        const outerGlow = new THREE.Mesh(
            new THREE.SphereGeometry(size * 1.3, 32, 32),

            new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.035,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );

        mesh.add(outerGlow);
    }


    /* =====================================
       PLANET RINGS
    ===================================== */

    function addRings(mesh) {

        const geometry = new THREE.RingGeometry(2.0, 3.0, 100);

        const material = new THREE.MeshBasicMaterial({
            color: 0xd6c39c,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.65
        });

        const rings = new THREE.Mesh(geometry, material);

        rings.rotation.x = Math.PI / 2.3;
        mesh.add(rings);
    }


    /* =====================================
       CREATE CELESTIAL OBJECT
    ===================================== */

    function createBody(body) {

        const geometry = new THREE.SphereGeometry(
            body.size,
            64,
            64
        );

        const texture = createPlanetTexture(
            body.texture,
            body.color
        );

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: body.id === "sun" ? 1 : 0.88,
            metalness: 0.02
        });

        if (body.id === "sun") {

            material.emissive = new THREE.Color(0xff7b22);
            material.emissiveMap = texture;
            material.emissiveIntensity = 1.2;
        }

        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(...body.position);
        mesh.userData.bodyId = body.id;

        if (body.id !== "sun") {
            addAtmosphere(mesh, body.color, body.size);
        }

        if (body.id === "saturn") {
            addRings(mesh);
        }

        scene.add(mesh);

        // Sun light

        if (body.id === "sun") {

            const light = new THREE.PointLight(
                0xffc58b,
                4,
                150,
                1.5
            );

            light.position.copy(mesh.position);
            scene.add(light);
        }

        bodyMeshes.set(body.id, {
            mesh,
            body,
            basePosition: mesh.position.clone(),
            phase: Math.random() * Math.PI * 2
        });

        clickableMeshes.push(mesh);
    }


    /* =====================================
       STAR FIELD
    ===================================== */

    function createStarField() {

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        for (let i = 0; i < 4500; i++) {

            const radius = 35 + Math.random() * 110;

            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);

            positions.push(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );

            const brightness = .5 + Math.random() * .5;

            colors.push(
                brightness * .7,
                brightness * .85,
                brightness
            );
        }

        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(positions, 3)
        );

        geometry.setAttribute(
            "color",
            new THREE.Float32BufferAttribute(colors, 3)
        );

        const stars = new THREE.Points(
            geometry,

            new THREE.PointsMaterial({
                size: .12,
                vertexColors: true,
                transparent: true,
                opacity: .85,
                sizeAttenuation: true
            })
        );

        scene.add(stars);
        floatingObjects.push(stars);
    }


    /* =====================================
       NEBULA BACKGROUND
    ===================================== */

    function createNebula() {

        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;

        const ctx = canvas.getContext("2d");

        const gradient = ctx.createRadialGradient(
            256, 256, 10,
            256, 256, 250
        );

        gradient.addColorStop(0, "rgba(40,100,190,.20)");
        gradient.addColorStop(.4, "rgba(55,65,150,.10)");
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);

        const texture = new THREE.CanvasTexture(canvas);

        const nebula = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            })
        );

        nebula.position.set(-18, 12, -35);
        nebula.scale.set(70, 55, 1);

        scene.add(nebula);
    }


    /* =====================================
       SCENE
    ===================================== */

    function createScene() {

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x020611);
        scene.fog = new THREE.FogExp2(0x020611, 0.0018);

        camera = new THREE.PerspectiveCamera(
            50,
            canvasHost.clientWidth / canvasHost.clientHeight,
            0.1,
            500
        );

        camera.position.set(0, 18, 43);

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 1.75)
        );

        renderer.setSize(
            canvasHost.clientWidth,
            canvasHost.clientHeight
        );

        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;

        canvasHost.appendChild(renderer.domElement);

        controls = new OrbitControls(
            camera,
            renderer.domElement
        );

        controls.enableDamping = true;
        controls.dampingFactor = 0.045;

        controls.minDistance = 3;
        controls.maxDistance = 100;

        controls.target.set(0, 0, 0);

        scene.add(new THREE.AmbientLight(0x6685ae, 0.7));

        const blueLight = new THREE.DirectionalLight(
            0x5caeff,
            1.2
        );

        blueLight.position.set(-20, 15, 25);
        scene.add(blueLight);

        createStarField();
        createNebula();

        celestialBodies.forEach(createBody);

        raycaster = new THREE.Raycaster();
        pointer = new THREE.Vector2();

        renderer.domElement.addEventListener(
            "pointerdown",
            onCanvasClick
        );

        window.addEventListener("resize", onResize);

        populateObjectList();

        animate();

        requestAnimationFrame(() => {

            loadingScreen.classList.add("is-hidden");

            setTimeout(() => {
                loadingScreen.remove();
            }, 650);
        });
    }


    /* =====================================
       ANIMATION
    ===================================== */

    function animate() {

        animationFrame = requestAnimationFrame(animate);

        const elapsed = clock.getElapsedTime();

        bodyMeshes.forEach(record => {

            record.mesh.rotation.y += 0.0015;

            // Subtle floating movement

            record.mesh.position.y =
                record.basePosition.y +
                Math.sin(elapsed * 0.4 + record.phase) * 0.07;
        });

        floatingObjects.forEach(object => {
            object.rotation.y += 0.000025;
        });

        controls.update();

        renderer.render(scene, camera);
    }


    /* =====================================
       CLICK DETECTION
    ===================================== */

    function onCanvasClick(event) {

        const rect = renderer.domElement.getBoundingClientRect();

        pointer.x =
            ((event.clientX - rect.left) / rect.width) * 2 - 1;

        pointer.y =
            -((event.clientY - rect.top) / rect.height) * 2 + 1;

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


    /* =====================================
       OBJECT NAVIGATION LIST
    ===================================== */

    function populateObjectList() {

        bodyList.innerHTML = "";

        bodyCount.textContent =
            `${celestialBodies.length.toString().padStart(2, "0")} OBJECTS`;

        celestialBodies.forEach(body => {

            const button = document.createElement("button");

            button.className = "ue-object-card";
            button.type = "button";
            button.dataset.id = body.id;

            const orb = document.createElement("span");

            orb.className = "ue-object-orb";

            orb.style.background =
                `#${body.color.toString(16).padStart(6, "0")}`;

            const name = document.createElement("strong");
            name.textContent = body.name;

            button.append(orb, name);

            button.addEventListener("click", () => {
                selectBody(body.id);
            });

            bodyList.appendChild(button);
        });
    }


    /* =====================================
       SELECT OBJECT
    ===================================== */

    function selectBody(id) {

        const body = celestialBodies.find(
            item => item.id === id
        );

        if (!body) return;

        selectedBody = body;

        // Update navigation

        viewTarget.textContent = body.name.toUpperCase();
        viewCoordinates.textContent =
            `SOL SYSTEM / ${body.id.toUpperCase()}`;

        // Update selected button

        bodyList.querySelectorAll(".ue-object-card").forEach(button => {

            button.classList.toggle(
                "selected",
                button.dataset.id === id
            );
        });

        // Update information panel

        objectCategory.textContent = body.category;
        objectIndex.textContent =
            `OBJ / ${String(celestialBodies.indexOf(body) + 1).padStart(3, "0")}`;

        objectType.textContent = body.type.toUpperCase();
        objectName.textContent = body.name;
        objectDescription.textContent = body.description;

        objectVisual.innerHTML = "";

        const visualSymbol = document.createElement("span");
        visualSymbol.textContent = "✦";

        objectVisual.appendChild(visualSymbol);

        // Object details

        objectDetails.innerHTML = "";

        const details = [
            ["Diameter", body.diameter],
            ["Distance from Sun", body.distance],
            ["Object ID", body.id.toUpperCase()]
        ];

        details.forEach(([label, value]) => {

            const row = document.createElement("div");
            row.className = "ue-object-detail";

            const labelElement = document.createElement("span");
            labelElement.textContent = label;

            const valueElement = document.createElement("strong");
            valueElement.textContent = value;

            row.append(labelElement, valueElement);

            objectDetails.appendChild(row);
        });

        // Earth navigation

        if (body.id === "earth") {

            objectAction.classList.add("visible");
            objectAction.href = "map.html";

        } else {

            objectAction.classList.remove("visible");
        }

        objectPanel.classList.add("visible");

        focusBody(body.id);
    }


    /* =====================================
       CAMERA FOCUS
    ===================================== */

    function focusBody(id) {

        const record = bodyMeshes.get(id);

        if (!record) return;

        const target = record.mesh.position.clone();

        const direction = new THREE.Vector3()
            .subVectors(camera.position, controls.target)
            .normalize();

        const distance = Math.max(
            record.body.size * 4.5,
            5
        );

        const destination = target.clone().add(
            direction.multiplyScalar(distance)
        );

        camera.position.copy(destination);
        controls.target.copy(target);

        controls.update();
    }


    /* =====================================
       RESET CAMERA
    ===================================== */

    function resetCamera() {

        camera.position.set(0, 18, 43);

        controls.target.set(0, 0, 0);
        controls.update();

        selectedBody = null;

        objectPanel.classList.remove("visible");

        viewTarget.textContent = "KNOWN UNIVERSE";
        viewCoordinates.textContent = "SECTOR 001 / SOL";

        bodyList.querySelectorAll(".ue-object-card").forEach(button => {
            button.classList.remove("selected");
        });
    }


    /* =====================================
       INTERFACE CONTROLS
    ===================================== */

    function setupControls() {

        document.getElementById("resetCamera")
            .addEventListener("click", resetCamera);

        document.getElementById("closePanel")
            .addEventListener("click", () => {
                objectPanel.classList.remove("visible");
            });

        document.getElementById("toggleLabels")
            .addEventListener("click", event => {

                showLabels = !showLabels;

                event.currentTarget.classList.toggle(
                    "active",
                    showLabels
                );

                event.currentTarget.textContent =
                    showLabels ? "LABELS ON" : "LABELS OFF";

                bodyList.style.opacity =
                    showLabels ? "1" : "0.25";
            });

        document.getElementById("zoomIn")
            .addEventListener("click", () => {

                camera.position.multiplyScalar(0.8);
                controls.update();
            });

        document.getElementById("zoomOut")
            .addEventListener("click", () => {

                camera.position.multiplyScalar(1.2);
                controls.update();
            });
    }


    /* =====================================
       RESIZE
    ===================================== */

    function onResize() {

        if (!camera || !renderer) return;

        const width = canvasHost.clientWidth;
        const height = canvasHost.clientHeight;

        if (!width || !height) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    }


    /* =====================================
       SUPABASE CONNECTION
    ===================================== */

    async function checkDatabase() {

        if (!window.supabaseClient) {

            databaseStatus.textContent = "CLIENT UNAVAILABLE";
            databaseStatus.style.color = "#e58c8c";

            showMessage(
                "Supabase client unavailable. Check ../js/supabase.js."
            );

            return;
        }

        try {

            const { error } = await window.supabaseClient
                .from("realities")
                .select("id")
                .limit(1);

            if (error) throw error;

            databaseStatus.textContent = "ARCHIVE CONNECTED";
            databaseStatus.style.color = "#64cda8";

        } catch (error) {

            console.error("Database connection failed:", error);

            databaseStatus.textContent = "DATABASE ERROR";
            databaseStatus.style.color = "#e58c8c";

            showMessage(
                `Database connection failed: ${error.message}`
            );
        }
    }


    /* =====================================
       ERROR MESSAGE
    ===================================== */

    function showMessage(text) {

        message.textContent = text;
        message.hidden = false;
    }


    /* =====================================
       INITIALISE
    ===================================== */

    setupControls();

    try {

        createScene();
        checkDatabase();

    } catch (error) {

        console.error(
            "Universal Navigation initialisation failed:",
            error
        );

        loadingScreen.innerHTML = `
            <span>SPATIAL SYSTEM ERROR</span>
            <small>${error.message}</small>
        `;

        showMessage(
            "The 3D environment could not initialise. Check the browser console."
        );
    }


    /* =====================================
       CLEANUP
    ===================================== */

    window.addEventListener("beforeunload", () => {

        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }

        if (renderer) {
            renderer.dispose();
        }
    });

});
