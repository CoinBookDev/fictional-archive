/* =========================================
   LOCATION DIRECTORY
========================================= */

const directory = document.getElementById("locationDirectory");
const searchInput = document.getElementById("locationSearch");
const typeFilter = document.getElementById("locationTypeFilter");
const locationCount = document.getElementById("locationCount");
const pagination = document.getElementById("locationPagination");

let currentPage = 1;
const pageSize = 50;

let searchTerm = "";
let selectedType = "";


/* =========================================
   LOAD LOCATION TYPES
========================================= */

async function loadLocationTypes() {

    try {

        const { data, error } = await window.supabaseClient
            .from("locations")
            .select("location_type");

        if (error) {
            throw error;
        }

        const types = [
            ...new Set(
                data
                    .map(location => location.location_type)
                    .filter(Boolean)
            )
        ].sort();

        types.forEach(type => {

            const option = document.createElement("option");

            option.value = type;
            option.textContent = type;

            typeFilter.appendChild(option);

        });

    } catch (error) {

        console.error("LOCATION TYPE ERROR:", error);

    }
}


/* =========================================
   LOAD LOCATIONS
========================================= */

async function loadLocations() {

    directory.innerHTML = "<p>Loading locations...</p>";
    pagination.innerHTML = "";

    try {

        let query = window.supabaseClient
            .from("locations")
            .select("*", { count: "exact" });

        // Search by name
        if (searchTerm) {

            query = query.ilike(
                "name",
                `%${searchTerm}%`
            );

        }

        // Filter by location type
        if (selectedType) {

            query = query.eq(
                "location_type",
                selectedType
            );

        }

        // Pagination
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await query
            .order("name", { ascending: true })
            .range(from, to);

        if (error) {
            throw error;
        }

        // Load parent location names
        const parentIds = [
            ...new Set(
                data
                    .map(location => location.parent_location_id)
                    .filter(id => id !== null)
            )
        ];

        let parentLocations = {};

        if (parentIds.length > 0) {

            const { data: parents, error: parentError } =
                await window.supabaseClient
                    .from("locations")
                    .select("id, name")
                    .in("id", parentIds);

            if (parentError) {
                throw parentError;
            }

            parents.forEach(parent => {
                parentLocations[parent.id] = parent.name;
            });

        }

        // Attach parent names to locations
        const locations = data.map(location => ({
            ...location,
            parent_name:
                parentLocations[location.parent_location_id] || null
        }));

        locationCount.textContent =
            `${count} LOCATIONS FOUND`;

        renderLocations(locations);
        renderPagination(count);

    } catch (error) {

        directory.innerHTML =
            `<p>DATABASE ERROR: ${error.message}</p>`;

        locationCount.textContent = "DATABASE ERROR";

        console.error("LOCATION ERROR:", error);

    }
}


/* =========================================
   RENDER LOCATIONS
========================================= */

function renderLocations(locations) {

    directory.innerHTML = "";

    if (!locations || locations.length === 0) {

        directory.innerHTML = "<p>No locations found.</p>";
        return;

    }

    locations.forEach(location => {

        const card = document.createElement("div");

        card.className = "directory-card";
        card.style.cursor = "pointer";

        card.addEventListener("click", () => {

            window.location.href =
                `location.html?id=${location.id}`;

        });

        // Location type
        const type = document.createElement("div");

        type.className = "card-type";
        type.textContent =
            (location.location_type || "OTHER").toUpperCase();

        // Location name
        const title = document.createElement("h3");

        title.textContent = location.name;

        // Description
        const description = document.createElement("p");

        description.textContent =
            location.description || "No description available.";

        // Parent location
        const parent = document.createElement("div");

        parent.className = "card-franchise";

        parent.textContent = location.parent_name
            ? `PART OF: ${location.parent_name.toUpperCase()}`
            : "ROOT LOCATION";

        card.append(
            type,
            title,
            description,
            parent
        );

        directory.appendChild(card);

    });

}


/* =========================================
   PAGINATION
========================================= */

function renderPagination(totalLocations) {

    pagination.innerHTML = "";

    const totalPages = Math.ceil(totalLocations / pageSize);

    if (totalPages <= 1) {
        return;
    }

    function createButton(label, page, disabled = false, active = false) {

        const button = document.createElement("button");

        button.type = "button";
        button.textContent = label;
        button.className = "directory-page-button";

        if (active) {
            button.classList.add("active");
        }

        button.disabled = disabled;

        button.addEventListener("click", () => {

            currentPage = page;

            loadLocations();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

        pagination.appendChild(button);

    }

    // Previous
    createButton(
        "Previous",
        currentPage - 1,
        currentPage === 1
    );

    // Numbered buttons
    for (let page = 1; page <= totalPages; page++) {

        createButton(
            page,
            page,
            false,
            page === currentPage
        );

    }

    // Next
    createButton(
        "Next",
        currentPage + 1,
        currentPage === totalPages
    );

}


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener("input", () => {

    searchTerm = searchInput.value.trim();

    currentPage = 1;

    loadLocations();

});


/* =========================================
   LOCATION TYPE FILTER
========================================= */

typeFilter.addEventListener("change", () => {

    selectedType = typeFilter.value;

    currentPage = 1;

    loadLocations();

});


/* =========================================
   INITIAL LOAD
========================================= */

async function initializeDirectory() {

    await loadLocationTypes();

    await loadLocations();

}

initializeDirectory();
