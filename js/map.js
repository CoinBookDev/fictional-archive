
/* =========================================
   FICTIONAL ARCHIVE - EARTH EXPLORER
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       ELEMENTS
    ===================================== */

    const mapElement = document.getElementById("locationMap");

    const realityFilter = document.getElementById("realityFilter");
    const realityLabel = document.getElementById("mapRealityLabel");

    const searchInput = document.getElementById("locationSearch");
    const typeFilter = document.getElementById("locationTypeFilter");
    const resetButton = document.getElementById("resetMap");

    const locationTotal = document.getElementById("locationTotal");
    const categoryTotal = document.getElementById("categoryTotal");
    const visibleTotal = document.getElementById("visibleTotal");

    const informationPanel = document.getElementById("locationInformation");
    const mapMessage = document.getElementById("mapMessage");
    const mapCoordinates = document.getElementById("mapCoordinates");


    /* =====================================
       VARIABLES
    ===================================== */

    let map;
    let markerCluster;

    let realities = [];
    let selectedReality = null;

    let allLocations = [];
    let markers = [];

    let selectedLocationId = null;

    const defaultCenter = [25, 0];
    const defaultZoom = 2;


    /* =====================================
       LOCATION CATEGORY GROUPS
    ===================================== */

    const categoryGroups = {

        "Geographical Areas": [
            "country",
            "state",
            "region",
            "city",
            "town",
            "village",
            "island",
            "continent",
            "territory",
            "province",
            "district"
        ],

        "Structures & Buildings": [
            "building",
            "tower",
            "headquarters",
            "monument",
            "palace",
            "laboratory",
            "bunker",
            "residence",
            "mansion",
            "temple",
            "church",
            "castle",
            "skyscraper"
        ],

        "Facilities & Installations": [
            "facility",
            "military base",
            "base",
            "prison",
            "research facility",
            "airport",
            "hospital",
            "factory",
            "training facility",
            "compound",
            "warehouse",
            "embassy",
            "command center"
        ],

        "Natural Locations": [
            "forest",
            "mountain",
            "desert",
            "ocean",
            "sea",
            "lake",
            "river",
            "cave",
            "valley",
            "waterfall",
            "jungle",
            "volcano",
            "glacier",
            "island"
        ],

        "Infrastructure & Transport": [
            "road",
            "railway",
            "bridge",
            "tunnel",
            "spaceport",
            "transport hub",
            "station",
            "port",
            "harbour",
            "highway",
            "airport"
        ],

        "Cosmic Locations": [
            "planet",
            "moon",
            "star system",
            "galaxy",
            "space station",
            "celestial body",
            "asteroid",
            "nebula",
            "dimension",
            "realm",
            "satellite"
        ]

    };


    /* =====================================
       DETERMINE CATEGORY GROUP
    ===================================== */

    function getCategoryGroup(type) {

        const value = (type || "").toLowerCase().trim();

        // More specific matches first

        if (
            value.includes("space station") ||
            value.includes("star system") ||
            value.includes("planet") ||
            value.includes("galaxy") ||
            value.includes("moon") ||
            value.includes("nebula") ||
            value.includes("celestial") ||
            value.includes("asteroid") ||
            value.includes("dimension") ||
            value.includes("realm") ||
            value.includes("satellite")
        ) {
            return "Cosmic Locations";
        }

        for (const [group, types] of Object.entries(categoryGroups)) {

            if (types.some(item => value === item || value.includes(item))) {
                return group;
            }

        }

        return "Other Locations";

    }


    /* =====================================
       INITIALISE MAP
    ===================================== */

    function initialiseMap() {

        if (typeof L === "undefined") {
            showMessage("Leaflet could not be loaded.", true);
            return false;
        }

        if (!mapElement) {
            showMessage("Map element could not be found.", true);
            return false;
        }

        map = L.map("locationMap", {
            center: defaultCenter,
            zoom: defaultZoom,
            minZoom: 2,
            maxZoom: 18,
            zoomControl: false,
            worldCopyJump: true
        });

        L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=cb1_5b62_1_75c3b45e51e4c1266bcd3361",
            {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: "abcd",
                maxZoom: 20
            }
        ).addTo(map);

        L.control.zoom({
            position: "bottomright"
        }).addTo(map);


        // Marker clustering

        if (typeof L.markerClusterGroup === "function") {

            markerCluster = L.markerClusterGroup({
                showCoverageOnHover: false,
                spiderfyOnMaxZoom: true,
                maxClusterRadius: 45
            });

            map.addLayer(markerCluster);

        } else {

            console.warn("MarkerCluster plugin unavailable.");

        }


        // Coordinates display

        map.on("mousemove", event => {

            const lat = event.latlng.lat.toFixed(4);
            const lng = event.latlng.lng.toFixed(4);

            mapCoordinates.textContent =
                `LAT: ${lat} / LNG: ${lng}`;

        });

        map.on("mouseout", () => {
            mapCoordinates.textContent = "LAT: -- / LNG: --";
        });

        return true;

    }


    /* =====================================
       LOAD REALITIES
    ===================================== */

    async function loadRealities() {

        showMessage("Loading reality database...");

        try {

            const { data, error } = await window.supabaseClient
                .from("realities")
                .select("id, name, designation, universe_id, continuity_id, description, status, image_url")
                .order("designation", { ascending: true });

            if (error) throw error;

            realities = data || [];

            realityFilter.innerHTML = "";

            if (realities.length === 0) {

                throw new Error("No realities were found in the database.");

            }

            realities.forEach(reality => {

                const option = document.createElement("option");

                option.value = reality.id;

                const designation = reality.designation || "UNCLASSIFIED";
                const name = reality.name || "Unnamed Reality";

                option.textContent = `${designation} — ${name}`;

                realityFilter.appendChild(option);

            });


            // Prefer Earth-199999 when available

            const preferredReality = realities.find(reality =>
                (reality.designation || "").toLowerCase() === "earth-199999"
            );

            selectedReality = preferredReality || realities[0];

            realityFilter.value = selectedReality.id;

            updateRealityDisplay();

            await loadLocations();

        } catch (error) {

            console.error("Reality loading error:", error);

            showMessage(
                "Could not load realities: " + error.message,
                true
            );

        }

    }


    /* =====================================
       UPDATE REALITY DISPLAY
    ===================================== */

    function updateRealityDisplay() {

        if (!selectedReality) return;

        const designation = selectedReality.designation || "UNKNOWN REALITY";

        realityLabel.textContent = designation.toUpperCase();

    }


    /* =====================================
       CHANGE REALITY
    ===================================== */

    async function changeReality() {

        const realityId = realityFilter.value;

        selectedReality = realities.find(reality =>
            String(reality.id) === String(realityId)
        );

        if (!selectedReality) return;

        selectedLocationId = null;

        showEmptyPanel();

        searchInput.value = "";
        typeFilter.value = "";

        updateRealityDisplay();

        map.setView(defaultCenter, defaultZoom);

        await loadLocations();

    }


    /* =====================================
       LOAD LOCATIONS
    ===================================== */

    async function loadLocations() {

        if (!selectedReality) return;

        showMessage("Loading geographical database...");

        try {

            const { data, error } = await window.supabaseClient
                .from("locations")
                .select("*")
                .eq("reality_id", selectedReality.id)
                .not("latitude", "is", null)
                .not("longitude", "is", null)
                .order("name", { ascending: true });

            if (error) throw error;


            // Validate geographical coordinates

            allLocations = (data || []).filter(location => {

                const latitude = Number(location.latitude);
                const longitude = Number(location.longitude);

                return (
                    location.latitude !== null &&
                    location.longitude !== null &&
                    Number.isFinite(latitude) &&
                    Number.isFinite(longitude) &&
                    latitude >= -90 &&
                    latitude <= 90 &&
                    longitude >= -180 &&
                    longitude <= 180
                );

            });

            populateTypeFilter();

            updateStatistics();

            renderMarkers();

            if (allLocations.length === 0) {

                showMessage(
                    `No locations with valid coordinates were found for ${selectedReality.designation || selectedReality.name}.`
                );

            } else {

                hideMessage();

            }

        } catch (error) {

            console.error("Location loading error:", error);

            showMessage(
                "Could not load locations: " + error.message,
                true
            );

        }

    }


    /* =====================================
       POPULATE TYPE FILTER
    ===================================== */

    function populateTypeFilter() {

        const previousValue = typeFilter.value;

        const types = [
            ...new Set(
                allLocations
                    .map(location => location.location_type)
                    .filter(Boolean)
            )
        ].sort((a, b) => a.localeCompare(b));


        typeFilter.innerHTML = "";

        const allOption = document.createElement("option");

        allOption.value = "";
        allOption.textContent = "All location types";

        typeFilter.appendChild(allOption);


        // Group types into categories

        const groupedTypes = {};

        types.forEach(type => {

            const group = getCategoryGroup(type);

            if (!groupedTypes[group]) {
                groupedTypes[group] = [];
            }

            groupedTypes[group].push(type);

        });


        Object.keys(groupedTypes).forEach(group => {

            const optgroup = document.createElement("optgroup");

            optgroup.label = group;

            groupedTypes[group].forEach(type => {

                const option = document.createElement("option");

                option.value = type;
                option.textContent = type;

                optgroup.appendChild(option);

            });

            typeFilter.appendChild(optgroup);

        });


        // Restore previous filter if still available

        if (types.includes(previousValue)) {
            typeFilter.value = previousValue;
        }

    }


    /* =====================================
       UPDATE STATISTICS
    ===================================== */

    function updateStatistics() {

        locationTotal.textContent = allLocations.length;

        const types = new Set(
            allLocations
                .map(location => location.location_type)
                .filter(Boolean)
        );

        categoryTotal.textContent = types.size;

    }


    /* =====================================
       MARKER COLOURS
    ===================================== */

    function getMarkerClass(type) {

        const group = getCategoryGroup(type);

        const value = (type || "").toLowerCase();

        if (
            value.includes("country") ||
            value.includes("state") ||
            value.includes("region")
        ) {
            return "country";
        }

        if (group === "Structures & Buildings") {
            return "building";
        }

        if (group === "Facilities & Installations") {
            return "facility";
        }

        if (group === "Natural Locations") {
            return "natural";
        }

        if (group === "Infrastructure & Transport") {
            return "infrastructure";
        }

        if (group === "Cosmic Locations") {
            return "cosmic";
        }

        return "city";

    }


    /* =====================================
       CREATE MARKER
    ===================================== */

    function createMarker(location) {

        const markerClass = getMarkerClass(location.location_type);

        const icon = L.divIcon({

            className: "archive-marker-wrapper",

            html: `
                <div
                    class="archive-marker ${markerClass}"
                    title="${escapeHTML(location.name)}"
                ></div>
            `,

            iconSize: [19, 19],
            iconAnchor: [9, 9]

        });


        const marker = L.marker(
            [
                Number(location.latitude),
                Number(location.longitude)
            ],
            {
                icon: icon
            }
        );

        marker.locationData = location;

        marker.bindPopup(`
            <div class="map-popup-type">
                ${escapeHTML(location.location_type || "Location")}
            </div>

            <div class="map-popup-name">
                ${escapeHTML(location.name)}
            </div>

            <a
                class="map-popup-link"
                href="location.html?id=${encodeURIComponent(location.id)}"
            >
                OPEN LOCATION PROFILE →
            </a>
        `);

        marker.on("click", () => {
            selectLocation(location);
        });

        return marker;

    }


    /* =====================================
       RENDER MARKERS
    ===================================== */

    function renderMarkers() {

        if (!map) return;

        if (markerCluster) {
            markerCluster.clearLayers();
        }

        markers = [];

        const searchTerm = searchInput.value
            .trim()
            .toLowerCase();

        const selectedType = typeFilter.value;


        const filteredLocations = allLocations.filter(location => {

            const matchesSearch = (
                !searchTerm ||
                (location.name || "").toLowerCase().includes(searchTerm) ||
                (location.description || "").toLowerCase().includes(searchTerm) ||
                (location.location_type || "").toLowerCase().includes(searchTerm)
            );

            const matchesType = (
                !selectedType ||
                location.location_type === selectedType
            );

            return matchesSearch && matchesType;

        });


        filteredLocations.forEach(location => {

            const marker = createMarker(location);

            markers.push(marker);

            if (markerCluster) {

                markerCluster.addLayer(marker);

            } else {

                marker.addTo(map);

            }

        });


        visibleTotal.textContent = filteredLocations.length;


        // Clear selection if filtered out

        if (
            selectedLocationId !== null &&
            !filteredLocations.some(location =>
                String(location.id) === String(selectedLocationId)
            )
        ) {

            selectedLocationId = null;

            showEmptyPanel();

        }

    }


    /* =====================================
       SELECT LOCATION
    ===================================== */

    async function selectLocation(location) {

        selectedLocationId = location.id;

        const parent = await getParentLocation(
            location.parent_location_id
        );

        // Prevent an outdated request from replacing a newer selection

        if (String(selectedLocationId) !== String(location.id)) {
            return;
        }

        renderLocationInformation(location, parent);

    }


    /* =====================================
       GET PARENT LOCATION
    ===================================== */

    async function getParentLocation(parentId) {

        if (!parentId) return null;

        try {

            const { data, error } = await window.supabaseClient
                .from("locations")
                .select("id, name, location_type")
                .eq("id", parentId)
                .maybeSingle();

            if (error) {
                console.error("Parent location error:", error);
                return null;
            }

            return data;

        } catch (error) {

            console.error("Parent location error:", error);

            return null;

        }

    }


    /* =====================================
       RENDER INTELLIGENCE PANEL
    ===================================== */

    function renderLocationInformation(location, parent) {

        informationPanel.className = "";
        informationPanel.innerHTML = "";


        // Image

        if (location.image_url) {

            const image = document.createElement("img");

            image.className = "intelligence-image";
            image.src = location.image_url;
            image.alt = location.name;

            image.onerror = () => image.remove();

            informationPanel.appendChild(image);

        }


        // Type

        const type = document.createElement("div");

        type.className = "intelligence-type";
        type.textContent = location.location_type || "Location";

        informationPanel.appendChild(type);


        // Name

        const name = document.createElement("h2");

        name.className = "intelligence-name";
        name.textContent = location.name;

        informationPanel.appendChild(name);


        // Description

        if (location.description) {

            const description = document.createElement("p");

            description.className = "intelligence-description";
            description.textContent = location.description;

            informationPanel.appendChild(description);

        }


        addDivider();


        // Reality

        if (selectedReality) {

            addDetail(
                "Reality",
                selectedReality.designation || selectedReality.name
            );

        }


        // Parent location

        if (parent) {

            const parentContainer = document.createElement("div");

            parentContainer.className = "intelligence-detail";

            const parentLabel = document.createElement("div");

            parentLabel.className = "intelligence-detail-label";
            parentLabel.textContent = "Parent location";

            const parentLink = document.createElement("a");

            parentLink.className =
                "intelligence-detail-value intelligence-parent-link";

            parentLink.textContent = parent.name;

            parentLink.href =
                `location.html?id=${encodeURIComponent(parent.id)}`;

            parentContainer.appendChild(parentLabel);
            parentContainer.appendChild(parentLink);

            informationPanel.appendChild(parentContainer);

        }


        // Coordinates

        addDetail(
            "Coordinates",
            `${Number(location.latitude).toFixed(4)}, ${Number(location.longitude).toFixed(4)}`
        );


        // Status

        if (location.status) {
            addDetail("Status", location.status);
        }


        // Database ID

        addDetail("Database ID", location.id);


        // Profile link

        const profileLink = document.createElement("a");

        profileLink.className = "intelligence-link";

        profileLink.href =
            `location.html?id=${encodeURIComponent(location.id)}`;

        profileLink.textContent = "VIEW FULL LOCATION PROFILE →";

        informationPanel.appendChild(profileLink);

    }


    /* =====================================
       PANEL HELPERS
    ===================================== */

    function addDivider() {

        const divider = document.createElement("hr");

        divider.className = "intelligence-divider";

        informationPanel.appendChild(divider);

    }


    function addDetail(label, value) {

        const container = document.createElement("div");

        container.className = "intelligence-detail";

        const labelElement = document.createElement("div");

        labelElement.className = "intelligence-detail-label";
        labelElement.textContent = label;

        const valueElement = document.createElement("div");

        valueElement.className = "intelligence-detail-value";
        valueElement.textContent = value ?? "Unknown";

        container.appendChild(labelElement);
        container.appendChild(valueElement);

        informationPanel.appendChild(container);

    }


    function showEmptyPanel() {

        informationPanel.className = "intelligence-empty";

        informationPanel.innerHTML = `
            <div class="intelligence-empty-icon">◎</div>

            <strong>No location selected</strong>

            <p>
                Select a marker on the map to access
                its geographical and database information.
            </p>
        `;

    }


    /* =====================================
       MESSAGE HELPERS
    ===================================== */

    function showMessage(message, isError = false) {

        mapMessage.textContent = message;

        mapMessage.className = isError
            ? "explorer-message error"
            : "explorer-message";

        mapMessage.hidden = false;

    }


    function hideMessage() {
        mapMessage.hidden = true;
    }


    /* =====================================
       HTML ESCAPING
    ===================================== */

    function escapeHTML(value) {

        return String(value ?? "").replace(
            /[&<>"']/g,
            character => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            })[character]
        );

    }


    /* =====================================
       EVENT LISTENERS
    ===================================== */

    realityFilter.addEventListener("change", changeReality);

    searchInput.addEventListener("input", renderMarkers);

    typeFilter.addEventListener("change", renderMarkers);


    /* =====================================
       RESET MAP
    ===================================== */

    resetButton.addEventListener("click", () => {

        searchInput.value = "";
        typeFilter.value = "";

        selectedLocationId = null;

        renderMarkers();

        showEmptyPanel();

        map.setView(defaultCenter, defaultZoom);

    });


    /* =====================================
       START
    ===================================== */

    if (initialiseMap()) {

        if (!window.supabaseClient) {

            showMessage("Supabase client is unavailable.", true);

        } else {

            loadRealities();

        }

    }

});
