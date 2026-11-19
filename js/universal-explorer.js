
import * as THREE from "https://esm.sh/three@0.160.0";
import { OrbitControls } from "https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js";

/* =========================================
   FICTIONAL ARCHIVE
   UNIVERSAL EXPLORER
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       DOM ELEMENTS
    ===================================== */

    const container = document.getElementById("three-container");
    const panel = document.getElementById("object-panel");

    const panelName = document.getElementById("panel-name");
    const panelCategory = document.getElementById("panel-category");
    const panelDescription = document.getElementById("panel-description");
    const panelType = document.getElementById("panel-type");
    const panelClassification = document.getElementById("panel-classification");
    const panelId = document.getElementById("panel-id");
    const relatedList = document.getElementById("panel-related-list");

    const breadcrumb = document.getElementById("breadcrumb");
    const currentMode = document.getElementById("current-mode");
    const instructions = document.getElementById("map-instructions");
    const objectCount = document.getElementById("object-count");
    const searchInput = document.getElementById("object-search");

    /* =====================================
       COSMIC ARCHIVE DATA
    ===================================== */

    const categories = [

        {
            id: "solar-system",
            name: "Solar System",
            type: "STAR SYSTEM",
            color: 0x55bfff,
            description: "A planetary system containing a central star and multiple celestial bodies.",
            objects: [
                ["Earth", "Planet", "Homeworld of humanity."],
                ["Moon", "Natural Satellite", "Earth's natural satellite."],
                ["Mars", "Planet", "The fourth planet from the Sun."],
                ["Titan", "Natural Satellite", "Saturn's largest moon."],
                ["Vormir", "Planet", "A remote world associated with the Soul Stone."],
                ["Xandar", "Planet", "Homeworld of the Xandarians."],
                ["Contraxia", "Planet", "A frozen world known for its criminal underworld."]
            ]
        },

        {
            id: "civilizations",
            name: "Local Galactic Civilizations",
            type: "CIVILIZATION NETWORK",
            color: 0xb18cff,
            description: "Major civilizations, empires and inhabited worlds throughout the cosmos.",
            objects: [
                ["Xandarians", "Civilization", "The people of Xandar."],
                ["Kree Empire", "Empire", "A powerful interstellar civilization."],
                ["Skrull Colonies", "Civilization", "Skrull settlements spread across the galaxy."],
                ["Sovereign", "Civilization", "A genetically engineered golden-skinned society."],
                ["Knowhere", "Settlement", "A settlement built within a Celestial's severed head."],
                ["Sakaar", "Planet / Civilization", "A chaotic world inhabited by many species."],
                ["Spartax", "Civilization", "An interstellar civilization associated with the Spartoi."]
            ]
        },

        {
            id: "territories",
            name: "Cosmic Territories",
            type: "GALACTIC REGION",
            color: 0x58dfbd,
            description: "Large-scale cosmic territories, interstellar routes and ancient regions.",
            objects: [
                ["Kree Space", "Territory", "Space controlled or influenced by the Kree Empire."],
                ["Nova Empire Territory", "Territory", "Regions associated with the Nova Empire."],
                ["Dark Aster Routes", "Travel Routes", "Routes associated with Ronan's warship."],
                ["Quantum Realm Connections", "Cosmic Connections", "Known connections involving the Quantum Realm."],
                ["Celestial Routes and Ancient Worlds", "Ancient Routes", "Ancient locations and routes associated with Celestial activity."]
            ]
        },

        {
            id: "nine-realms",
            name: "The Nine Realms",
            type: "REALM NETWORK",
            color: 0xffbd71,
            description: "Nine interconnected realms connected through the cosmic structure of Yggdrasil.",
            objects: [
                ["Asgard", "Realm", "Home of the Asgardians."],
                ["Midgard", "Realm", "The realm associated with Earth."],
                ["Vanaheim", "Realm", "Home of the Vanir."],
                ["Jotunheim", "Realm", "Realm of the Frost Giants."],
                ["Svartalfheim", "Realm", "Home of the Dark Elves."],
                ["Nidavellir", "Realm", "A realm associated with the Dwarves."],
                ["Alfheim", "Realm", "Home of the Light Elves."],
                ["Niflheim", "Realm", "A realm of ice and mist."],
                ["Muspelheim", "Realm", "A realm of fire, home of the Fire Demons."]
            ]
        },

        {
            id: "dimensions",
            name: "Alternate Dimensions",
            type: "DIMENSIONAL NETWORK",
            color: 0xd28aff,
            description: "Separate dimensions and mystical planes beyond ordinary physical space.",
            objects: [
                ["Mirror Dimension", "Dimension", "A parallel dimension used by sorcerers."],
                ["Dark Dimension", "Dimension", "A dimension associated with Dormammu."],
                ["Noor Dimension", "Dimension", "A dimension connected to Noor energy."],
                ["Ta Lo", "Mystical Realm", "A hidden mystical realm."],
                ["Duat", "Afterlife Realm", "An Egyptian afterlife dimension."],
                ["Ancestral Plane", "Spiritual Realm", "A spiritual plane associated with Wakanda."],
                ["Valhalla", "Afterlife Realm", "The Asgardian afterlife."]
            ]
        },

        {
            id: "multiverse",
            name: "The Multiverse",
            type: "UNIVERSE NETWORK",
            color: 0x75aaff,
            description: "Parallel universes and alternate continuities.",
            objects: [
                ["Earth-199999", "Universe", "The universe designation commonly associated with the MCU."],
                ["Earth-10005", "Universe", "The universe associated with the X-Men film continuity."]
            ]
        },

        {
            id: "sub-realities",
            name: "Sub-Reality Realms",
            type: "SUB-REALITY NETWORK",
            color: 0xff83a8,
            description: "Enclosed realities, temporal pathways and unusual spaces within larger cosmic structures.",
            objects: [
                ["Quantum Realm", "Subatomic Reality", "A strange realm beyond ordinary space and time."],
                ["Probability Storm Regions", "Reality Region", "Regions of shifting probabilities."],
                ["TVA Pathways", "Temporal Infrastructure", "Pathways associated with the Time Variance Authority."],
                ["Void at the End of Time", "Temporal Realm", "A realm at the end of time."]
            ]
        },

        {
            id: "cosmic-entities",
            name: "Cosmic Entities & Celestial Domains",
            type: "CELESTIAL NETWORK",
            color: 0xffdf7c,
            description: "Cosmic beings, celestial structures and domains associated with powerful entities.",
            objects: [
                ["Ego's Planet", "Celestial Body", "The living planetary form of Ego."],
                ["Celestial Worlds", "Celestial Locations", "Worlds connected to Celestial activity."],
                ["Knowhere", "Celestial Location", "A settlement inside a Celestial's severed head."],
                ["Eternity's Realm", "Cosmic Domain", "A realm associated with Eternity."],
                ["Living Tribunal's Domain", "Cosmic Domain", "A domain associated with the Living Tribunal."],
                ["Cosmic Crossroads", "Cosmic Location", "A meeting point between cosmic pathways."]
            ]
        },

        {
            id: "beyond",
            name: "Beyond the Multiverse",
            type: "TRANSCENDENT STRUCTURE",
            color: 0xe4efff,
            description: "Structures and places that exist beyond conventional multiversal organisation.",
            objects: [
                ["The Citadel at the End of Time", "Temporal Structure", "The location associated with He Who Remains."],
                ["Yggdrasil", "Cosmic Structure", "The interconnected structure of the Nine Realms."],
                ["The Void", "Cosmic Realm", "A place associated with the end of time."],
                ["Eternity's Plane", "Cosmic Plane", "A plane associated with Eternity."],
                ["Temporal Loom Remnants", "Temporal Structure", "Remnants associated with the Temporal Loom."]
            ]
        }

    ];

    /* =====================================
       PREPARE OBJECTS
    ===================================== */

    let allObjects = [];

    categories.forEach(category => {

        category.objects.forEach((object, index) => {

            allObjects.push({
                id: makeId(object[0]),
                name: object[0],
                type: object[1],
                description: object[2],
                category: category.name,
                categoryId: category.id,
                index
            });

        });

    });

    function makeId(value) {
        return value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    /* =====================================
       THREE.JS SCENE
    ===================================== */

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x050914);

    const camera = new THREE.PerspectiveCamera(
        55,
        container.clientWidth / container.clientHeight,
        0.1,
        3000
    );

    camera.position.set(0, 65, 175);

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;
    controls.dampingFactor = 0.045;
    controls.minDistance = 12;
    controls.maxDistance = 450;
    controls.enablePan = true;

    scene.add(new THREE.AmbientLight(0x7b9cbb, 1.5));

    const mainLight = new THREE.PointLight(0x8acbff, 2.5, 500);
    mainLight.position.set(0, 80, 80);
    scene.add(mainLight);

    /* =====================================
       STARFIELD
    ===================================== */

    const starGeometry = new THREE.BufferGeometry();
    const starPositions = [];

    for (let i = 0; i < 4500; i++) {

        starPositions.push(
            (Math.random() - 0.5) * 1500,
            (Math.random() - 0.5) * 1000,
            (Math.random() - 0.5) * 1500
        );

    }

    starGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(starPositions, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
        color: 0xaac9ed,
        size: 0.9,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    /* =====================================
       MAP OBJECTS
    ===================================== */

    const categoryMeshes = [];
    const objectMeshes = [];
    const interactiveObjects = [];

    const categoryGroups = new Map();

    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

    const categoryRadius = 5;
    const objectRadius = 1.15;

    function createLabel(text, color = "#dceeff") {

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = 512;
        canvas.height = 128;

        context.font = "500 34px Arial";
        context.textAlign = "center";
        context.fillStyle = color;
        context.shadowColor = color;
        context.shadowBlur = 12;

        context.fillText(text.toUpperCase(), 256, 72);

        const texture = new THREE.CanvasTexture(canvas);

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthWrite: false
        });

        const sprite = new THREE.Sprite(material);

        sprite.scale.set(15, 3.75, 1);

        return sprite;
    }

    function createGlow(color, radius) {

        const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.13,
            side: THREE.BackSide
        });

        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(radius * 1.7, 24, 24),
            material
        );

        return glow;
    }

    /* =====================================
       CATEGORY POSITIONS
    ===================================== */

    const categoryPositions = categories.map((category, index) => {

        const angle = (index / categories.length) * Math.PI * 2;

        const radius = 48;

        return new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle * 2) * 10,
            Math.sin(angle) * radius
        );

    });

    /* =====================================
       CREATE CATEGORY NODES
    ===================================== */

    categories.forEach((category, index) => {

        const position = categoryPositions[index];

        const group = new THREE.Group();

        group.position.copy(position);
        group.userData = {
            kind: "category",
            categoryId: category.id
        };

        const material = new THREE.MeshStandardMaterial({
            color: category.color,
            emissive: category.color,
            emissiveIntensity: 0.55,
            metalness: 0.3,
            roughness: 0.35
        });

        const sphere = new THREE.Mesh(
            sphereGeometry,
            material
        );

        sphere.scale.setScalar(categoryRadius);
        sphere.userData = group.userData;

        group.add(sphere);
        group.add(createGlow(category.color, categoryRadius));

        const label = createLabel(category.name, "#d8edff");
        label.position.y = 9;
        group.add(label);

        scene.add(group);

        categoryGroups.set(category.id, group);
        categoryMeshes.push(sphere);
        interactiveObjects.push(sphere);

        /* Hidden child objects */

        const childMeshes = [];

        category.objects.forEach((object, objectIndex) => {

            const total = category.objects.length;

            const angle = (objectIndex / total) * Math.PI * 2;

            const spread = 17;

            const childPosition = new THREE.Vector3(
                Math.cos(angle) * spread,
                Math.sin(objectIndex * 1.7) * 5,
                Math.sin(angle) * spread
            );

            const childGroup = new THREE.Group();

            childGroup.position.copy(childPosition);

            const childMaterial = new THREE.MeshStandardMaterial({
                color: category.color,
                emissive: category.color,
                emissiveIntensity: 0.3,
                metalness: 0.4,
                roughness: 0.4
            });

            const childSphere = new THREE.Mesh(
                sphereGeometry,
                childMaterial
            );

            childSphere.scale.setScalar(objectRadius);

            const objectData = allObjects.find(
                item => item.categoryId === category.id &&
                        item.name === object[0]
            );

            childSphere.userData = {
                kind: "object",
                objectId: objectData.id,
                categoryId: category.id
            };

            childGroup.add(childSphere);
            childGroup.add(createGlow(category.color, objectRadius));

            const childLabel = createLabel(object[0], "#c5d9eb");
            childLabel.position.y = 2.8;
            childLabel.scale.set(11, 2.75, 1);

            childGroup.add(childLabel);

            group.add(childGroup);

            childGroup.visible = false;

            childMeshes.push(childGroup);
            objectMeshes.push(childSphere);
            interactiveObjects.push(childSphere);

        });

        group.userData.children = childMeshes;

    });

    /* =====================================
       CONNECTION LINES
    ===================================== */

    const connectionMaterial = new THREE.LineBasicMaterial({
        color: 0x416c94,
        transparent: true,
        opacity: 0.22
    });

    for (let i = 0; i < categoryPositions.length; i++) {

        const next = (i + 1) % categoryPositions.length;

        const geometry = new THREE.BufferGeometry().setFromPoints([
            categoryPositions[i],
            categoryPositions[next]
        ]);

        const line = new THREE.Line(geometry, connectionMaterial);

        scene.add(line);

    }

    /* =====================================
       CAMERA NAVIGATION
    ===================================== */

    let cameraTarget = new THREE.Vector3(0, 0, 0);
    let desiredCameraPosition = new THREE.Vector3(0, 65, 175);

    function moveCamera(position, target) {

        desiredCameraPosition.copy(position);
        cameraTarget.copy(target);

    }

    function focusCategory(categoryId) {

        const category = categories.find(
            item => item.id === categoryId
        );

        if (!category) return;

        const group = categoryGroups.get(categoryId);
        const position = group.position;

        group.userData.children.forEach(child => {
            child.visible = true;
        });

        categories.forEach(item => {

            if (item.id !== categoryId) {
                categoryGroups.get(item.id).visible = false;
            }

        });

        const cameraPosition = position.clone().add(
            new THREE.Vector3(0, 20, 48)
        );

        moveCamera(cameraPosition, position);

        currentMode.textContent = category.name.toUpperCase();

        breadcrumb.innerHTML = `
            <span>UNIVERSE</span>
            <span class="breadcrumb-separator">/</span>
            <strong>${category.name.toUpperCase()}</strong>
        `;

        instructions.textContent = "SELECT AN OBJECT TO ACCESS ITS INTELLIGENCE";

        objectCount.textContent = `${category.objects.length} ARCHIVED OBJECTS`;

        showCategoryPanel(category);

    }

    function showOverview() {

        categories.forEach(category => {

            const group = categoryGroups.get(category.id);

            group.visible = true;

            group.userData.children.forEach(child => {
                child.visible = false;
            });

        });

        moveCamera(
            new THREE.Vector3(0, 65, 175),
            new THREE.Vector3(0, 0, 0)
        );

        currentMode.textContent = "COSMIC OVERVIEW";

        breadcrumb.innerHTML = `
            <span>UNIVERSE</span>
            <span class="breadcrumb-separator">/</span>
            <strong>COSMIC OVERVIEW</strong>
        `;

        instructions.textContent = "SELECT A COSMIC REGION TO EXPLORE";

        objectCount.textContent = `${categories.length} COSMIC REGIONS`;

        panel.classList.add("hidden");

    }

    /* =====================================
       INFORMATION PANEL
    ===================================== */

    function showCategoryPanel(category) {

        panel.classList.remove("hidden");

        panelCategory.textContent = "COSMIC CLASSIFICATION";
        panelName.textContent = category.name;
        panelDescription.textContent = category.description;

        panelType.textContent = category.type;
        panelClassification.textContent = "PRIMARY REGION";
        panelId.textContent = category.id.toUpperCase();

        relatedList.innerHTML = "";

        category.objects.forEach(object => {

            const button = document.createElement("button");

            button.className = "related-object";
            button.textContent = object[0];

            button.addEventListener("click", () => {

                const data = allObjects.find(
                    item => item.categoryId === category.id &&
                            item.name === object[0]
                );

                selectObject(data);

            });

            relatedList.appendChild(button);

        });

    }

    function selectObject(object) {

        if (!object) return;

        const category = categories.find(
            item => item.id === object.categoryId
        );

        if (!category) return;

        if (currentMode.textContent !== category.name.toUpperCase()) {
            focusCategory(category.id);
        }

        panel.classList.remove("hidden");

        panelCategory.textContent = category.name.toUpperCase();
        panelName.textContent = object.name;
        panelDescription.textContent = object.description;

        panelType.textContent = object.type;
        panelClassification.textContent = category.name;
        panelId.textContent = object.id.toUpperCase();

        relatedList.innerHTML = "";

        const related = allObjects.filter(item =>
            item.categoryId === object.categoryId &&
            item.id !== object.id
        );

        related.slice(0, 5).forEach(item => {

            const button = document.createElement("button");

            button.className = "related-object";
            button.textContent = item.name;

            button.addEventListener("click", () => {
                selectObject(item);
            });

            relatedList.appendChild(button);

        });

        if (!related.length) {
            relatedList.innerHTML =
                '<span class="empty-related">No connections available.</span>';
        }

        const group = categoryGroups.get(category.id);

        const childIndex = category.objects.findIndex(
            item => item[0] === object.name
        );

        const child = group.children[childIndex];

        const worldPosition = new THREE.Vector3();

        child.getWorldPosition(worldPosition);

        moveCamera(
            worldPosition.clone().add(new THREE.Vector3(0, 8, 22)),
            worldPosition
        );

        instructions.textContent = "OBJECT SELECTED / INTELLIGENCE DATA LOADED";

    }

    /* =====================================
       MOUSE INTERACTION
    ===================================== */

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    renderer.domElement.addEventListener("click", event => {

        const rect = renderer.domElement.getBoundingClientRect();

        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const hits = raycaster.intersectObjects(
            interactiveObjects.filter(mesh => mesh.visible),
            false
        );

        if (!hits.length) return;

        const data = hits[0].object.userData;

        if (data.kind === "category") {
            focusCategory(data.categoryId);
        }

        if (data.kind === "object") {

            const object = allObjects.find(
                item => item.id === data.objectId
            );

            selectObject(object);

        }

    });

    /* =====================================
       SEARCH
    ===================================== */

    searchInput.addEventListener("input", () => {

        const query = searchInput.value.trim().toLowerCase();

        if (query.length < 2) return;

        const result = allObjects.find(item =>
            item.name.toLowerCase().includes(query)
        );

        if (!result) return;

        focusCategory(result.categoryId);

        setTimeout(() => {
            selectObject(result);
        }, 250);

    });

    /* =====================================
       BUTTONS
    ===================================== */

    document.getElementById("overview-button")
        .addEventListener("click", showOverview);

    document.getElementById("reset-camera")
        .addEventListener("click", () => {

            if (currentMode.textContent === "COSMIC OVERVIEW") {
                showOverview();
            } else {
                const category = categories.find(
                    item => item.name.toUpperCase() === currentMode.textContent
                );

                if (category) focusCategory(category.id);
            }

        });

    document.getElementById("close-panel")
        .addEventListener("click", () => {
            panel.classList.add("hidden");
        });

    /* =====================================
       ANIMATION
    ===================================== */

    function animate() {

        requestAnimationFrame(animate);

        camera.position.lerp(desiredCameraPosition, 0.035);
        controls.target.lerp(cameraTarget, 0.035);

        controls.update();

        stars.rotation.y += 0.00004;

        categoryMeshes.forEach((mesh, index) => {

            const pulse = 1 + Math.sin(
                Date.now() * 0.0015 + index
            ) * 0.035;

            mesh.scale.setScalar(categoryRadius * pulse);

        });

        renderer.render(scene, camera);

    }

    /* =====================================
       RESIZE
    ===================================== */

    window.addEventListener("resize", () => {

        const width = container.clientWidth;
        const height = container.clientHeight;

        if (!width || !height) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);

    });

    /* =====================================
       INITIALISE
    ===================================== */

    objectCount.textContent = `${categories.length} COSMIC REGIONS`;

    panel.classList.add("hidden");

    animate();

});
