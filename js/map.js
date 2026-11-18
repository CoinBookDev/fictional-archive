
/* =========================================
   FICTIONAL ARCHIVE - EARTH EXPLORER
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       ELEMENTS
    ===================================== */

    const mapElement = document.getElementById("locationMap");

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
    let markerClusterGroup;
    let allLocations = [];
    let markers = [];
    let selectedLocationId = null;

    const defaultCenter = [25, 0];
    const defaultZoom = 2;


    /* =====================================
       INITIALISE MAP
    ===================================== */

    function initialiseMap() {

        if (typeof L === "undefined") {
            showMessage("Leaflet could not be loaded. Check your internet connection.", true);
            return false;
        }

        if (typeof L.markerClusterGroup !== "function") {
            showMessage("Marker clustering could not be loaded. Check the MarkerCluster script.", true);
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

        // Dark cartographic map tiles
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


        // Create marker cluster group
        markerClusterGroup = L.markerClusterGroup({

            showCoverageOnHover: false,
            spiderfyOnMaxZoom: true,
            zoomToBoundsOnClick: true,
            maxClusterRadius: 45,

            iconCreateFunction: function (cluster) {

                const count = cluster.getChildCount();

                return L.divIcon({

                    html: `<div><span>${count}</span></div>`,

                    className: "marker-cluster",

                    iconSize: L.point(40, 40)

                });

            }

        });

        markerClusterGroup.addTo(map);


        // Display coordinates when moving over the map
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
       LOAD LOCATIONS FROM SUPABASE
    ===================================== */

    async function loadLocations() {

        showMessage("Loading geographical database...");

        try {

            if (!window.supabaseClient) {
                throw new Error("Supabase client is not available.");
            }

            const { data, error } = await window.supabaseClient
                .from("locations")
                .select("*")
                .not("latitude", "is", null)
                .not("longitude", "is", null)
                .order("name", { ascending: true });

            if (error) {
                throw error;
            }

            // Keep only records with valid geographical coordinates
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
                    "No locations with valid coordinates were found. Add latitude and longitude values to your locations in Supabase."
                );

            } else {

                hideMessage();

            }

        } catch (error) {

            console.error("Error loading map locations:", error);

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

        const types = [
            ...new Set(
                allLocations
                    .map(location => location.location_type)
                    .filter(Boolean)
            )
        ].sort((a, b) => a.localeCompare(b));

        typeFilter.innerHTML =
            '<option value="">All location types</option>';

        types.forEach(type => {

            const option = document.createElement("option");

            option.value = type;
            option.textContent = type;

            typeFilter.appendChild(option);

        });

        categoryTotal.textContent = types.length;

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

        const value = (type || "").toLowerCase();

        if (
            value.includes("country") ||
            value.includes("state")
        ) {
            return "country";
        }

        if (
            value.includes("building") ||
            value.includes("tower") ||
            value.includes("palace")
        ) {
            return "building";
        }

        if (
            value.includes("facility") ||
            value.includes("base") ||
            value.includes("prison") ||
            value.includes("compound")
        ) {
            return "facility";
        }

        return "city";

    }


    /* =====================================
       COORDINATE ACCURACY LABEL
    ===================================== */

    function getAccuracyLabel(accuracy) {

        const labels = {
            exact: "Exact",
            approximate: "Approximate",
            estimated: "Estimated",
            unknown: "Unknown"
        };

        return labels[accuracy] || "Unknown";

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

        // Remove existing marker clusters and markers
        markerClusterGroup.clearLayers();

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


        // Create markers for filtered locations
        filteredLocations.forEach(location => {

            const marker = createMarker(location);

            markers.push(marker);

        });


        // Add all markers to the cluster group
        markerClusterGroup.addLayers(markers);

        visibleTotal.textContent = filteredLocations.length;


        // Clear selection if it is no longer visible
        if (
            selectedLocationId !== null &&
            !filteredLocations.some(
                location => String(location.id) === String(selectedLocationId)
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

        const parent = await getParentLocation(location.parent_location_id);

        // Prevent an older request from replacing a newer selection
        if (String(selectedLocationId) !== String(location.id)) {
            return;
        }

        renderLocationInformation(location, parent);

    }


    /* =====================================
       GET PARENT LOCATION
    ===================================== */

    async function getParentLocation(parentId) {

        if (!parentId) {
            return null;
        }

        try {

            const { data, error } = await window.supabaseClient
                .from("locations")
                .select("id, name, location_type")
                .eq("id", parentId)
                .maybeSingle();

            if (error) {
                console.error("Could not load parent location:", error);
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


        // Divider
        addDivider();


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


        // Coordinate accuracy
        addDetail(
            "Coordinate accuracy",
            getAccuracyLabel(location.coordinate_accuracy)
        );


        // Status
        if (location.status) {

            addDetail(
                "Status",
                location.status
            );

        }


        // Database ID
        addDetail(
            "Database ID",
            location.id
        );


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
       SEARCH AND FILTER EVENTS
    ===================================== */

    searchInput.addEventListener("input", () => {

        renderMarkers();

    });


    typeFilter.addEventListener("change", () => {

        renderMarkers();

    });


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

        loadLocations();

    }

});
