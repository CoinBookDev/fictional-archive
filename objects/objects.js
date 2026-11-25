
/* =========================================
   FICTIONAL ARCHIVE
   OBJECTS & ARTIFACTS DIRECTORY
========================================= */


/* =========================================
   CONFIGURATION
========================================= */

const PAGE_SIZE = 50;

let currentPage = 1;
let totalObjects = 0;

let searchTerm = "";
let selectedType = "";
let selectedStatus = "";

let searchTimeout = null;


/* =========================================
   ELEMENTS
========================================= */

const objectSearch = document.getElementById("objectSearch");
const objectTypeFilter = document.getElementById("objectTypeFilter");
const objectStatusFilter = document.getElementById("objectStatusFilter");
const objectCount = document.getElementById("objectCount");
const objectDirectory = document.getElementById("objectDirectory");
const objectPagination = document.getElementById("objectPagination");


/* =========================================
   INITIALIZATION
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

    if (!window.supabaseClient) {
        showError("Supabase client could not be initialized.");
        return;
    }

    objectSearch.addEventListener("input", () => {

        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            searchTerm = objectSearch.value.trim();
            currentPage = 1;
            loadObjects();
        }, 300);

    });

    objectTypeFilter.addEventListener("change", () => {
        selectedType = objectTypeFilter.value;
        currentPage = 1;
        loadObjects();
    });

    objectStatusFilter.addEventListener("change", () => {
        selectedStatus = objectStatusFilter.value;
        currentPage = 1;
        loadObjects();
    });

    await loadFilterOptions();
    await loadObjects();

});


/* =========================================
   FILTER OPTIONS
========================================= */

async function loadFilterOptions() {

    await Promise.all([
        loadTypes(),
        loadStatuses()
    ]);

}


async function loadTypes() {

    const { data, error } = await window.supabaseClient
        .from("objects")
        .select("type")
        .not("type", "is", null)
        .order("type");

    if (error) {
        console.error("Could not load object types:", error);
        return;
    }

    const types = [
        ...new Set(
            data
                .map(item => item.type)
                .filter(type => type && type.trim() !== "")
        )
    ];

    types.forEach(type => {

        const option = document.createElement("option");

        option.value = type;
        option.textContent = type;

        objectTypeFilter.appendChild(option);

    });

}


async function loadStatuses() {

    const { data, error } = await window.supabaseClient
        .from("objects")
        .select("status")
        .not("status", "is", null)
        .order("status");

    if (error) {
        console.error("Could not load object statuses:", error);
        return;
    }

    const statuses = [
        ...new Set(
            data
                .map(item => item.status)
                .filter(status => status && status.trim() !== "")
        )
    ];

    statuses.forEach(status => {

        const option = document.createElement("option");

        option.value = status;
        option.textContent = status;

        objectStatusFilter.appendChild(option);

    });

}


/* =========================================
   LOAD OBJECTS
========================================= */

async function loadObjects() {

    showLoading();

    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = window.supabaseClient
        .from("objects")
        .select("*", { count: "exact" })
        .order("name", { ascending: true })
        .range(from, to);


    // Search
    if (searchTerm) {

        const safeSearch = searchTerm
            .replace(/[(),]/g, " ")
            .replace(/[%_]/g, " ")
            .trim();

        if (safeSearch) {
            query = query.or(
                `name.ilike.%${safeSearch}%,type.ilike.%${safeSearch}%`
            );
        }

    }


    // Type filter
    if (selectedType) {
        query = query.eq("type", selectedType);
    }


    // Status filter
    if (selectedStatus) {
        query = query.eq("status", selectedStatus);
    }


    const { data, error, count } = await query;

    if (error) {

        console.error("Could not load objects:", error);

        showError("The objects could not be loaded.");
        objectCount.textContent = "Unable to load objects";

        return;

    }

    totalObjects = count || 0;

    updateCount();

    if (!data || data.length === 0) {

        showEmpty();
        renderPagination();

        return;

    }

    const enrichedData = await loadRelatedNames(data);

    renderObjects(enrichedData);
    renderPagination();

}


/* =========================================
   LOAD RELATED NAMES
========================================= */

async function loadRelatedNames(objects) {

    const franchiseIds = [
        ...new Set(
            objects
                .map(item => item.franchise_id)
                .filter(id => id !== null)
        )
    ];

    const realityIds = [
        ...new Set(
            objects
                .map(item => item.reality_id)
                .filter(id => id !== null)
        )
    ];

    let franchiseMap = {};
    let realityMap = {};


    // Franchises
    if (franchiseIds.length > 0) {

        const { data, error } = await window.supabaseClient
            .from("franchises")
            .select("id, name")
            .in("id", franchiseIds);

        if (error) {
            console.error("Could not load franchises:", error);
        } else {
            data.forEach(item => {
                franchiseMap[item.id] = item.name;
            });
        }

    }


    // Realities
    if (realityIds.length > 0) {

        const { data, error } = await window.supabaseClient
            .from("realities")
            .select("id, name")
            .in("id", realityIds);

        if (error) {
            console.error("Could not load realities:", error);
        } else {
            data.forEach(item => {
                realityMap[item.id] = item.name;
            });
        }

    }


    return objects.map(item => ({

        ...item,

        franchise_name: franchiseMap[item.franchise_id] || null,
        reality_name: realityMap[item.reality_id] || null

    }));

}


/* =========================================
   RENDER OBJECTS
========================================= */

function renderObjects(objects) {

    objectDirectory.innerHTML = "";

    objects.forEach(object => {

        const card = document.createElement("a");

        card.className = "object-card";
        card.href = `object.html?id=${encodeURIComponent(object.id)}`;


        const status = object.status || "Unknown";

        const statusClass = status
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");


        const type = object.type
            ? escapeHTML(object.type)
            : "Unclassified";


        const description = object.description
            ? escapeHTML(object.description)
            : "No description has been added to this object yet.";


        const franchise = object.franchise_name
            ? escapeHTML(object.franchise_name)
            : null;


        const reality = object.reality_name
            ? escapeHTML(object.reality_name)
            : null;


        const firstAppearance = object.first_appearance
            ? escapeHTML(object.first_appearance)
            : null;


        card.innerHTML = `

            <div class="object-card-top">

                <span class="object-card-type">
                    ${type}
                </span>

                <span class="object-status status-${statusClass}">
                    ${escapeHTML(status)}
                </span>

            </div>


            <h2 class="object-card-name">
                ${escapeHTML(object.name)}
            </h2>


            <p class="object-card-description">
                ${description}
            </p>


            <div class="object-card-footer">

                ${
                    franchise
                        ? `<span class="object-card-meta">
                            Franchise: <strong>${franchise}</strong>
                           </span>`
                        : ""
                }

                ${
                    reality
                        ? `<span class="object-card-meta">
                            Reality: <strong>${reality}</strong>
                           </span>`
                        : ""
                }

                ${
                    firstAppearance
                        ? `<span class="object-card-meta">
                            First appearance: <strong>${firstAppearance}</strong>
                           </span>`
                        : ""
                }

            </div>


            <span class="object-card-arrow">→</span>

        `;

        objectDirectory.appendChild(card);

    });

}


/* =========================================
   PAGINATION
========================================= */

function renderPagination() {

    objectPagination.innerHTML = "";

    const totalPages = Math.ceil(totalObjects / PAGE_SIZE);

    if (totalPages <= 1) {
        return;
    }


    const previousButton = document.createElement("button");

    previousButton.textContent = "←";
    previousButton.disabled = currentPage === 1;

    previousButton.addEventListener("click", () => {
        changePage(currentPage - 1);
    });

    objectPagination.appendChild(previousButton);


    const pages = [];

    for (
        let page = Math.max(1, currentPage - 2);
        page <= Math.min(totalPages, currentPage + 2);
        page++
    ) {
        pages.push(page);
    }


    if (pages[0] > 1) {

        addPageButton(1);

        if (pages[0] > 2) {
            addPageEllipsis();
        }

    }


    pages.forEach(page => {
        addPageButton(page);
    });


    if (pages[pages.length - 1] < totalPages) {

        if (pages[pages.length - 1] < totalPages - 1) {
            addPageEllipsis();
        }

        addPageButton(totalPages);

    }


    const nextButton = document.createElement("button");

    nextButton.textContent = "→";
    nextButton.disabled = currentPage === totalPages;

    nextButton.addEventListener("click", () => {
        changePage(currentPage + 1);
    });

    objectPagination.appendChild(nextButton);

}


function addPageButton(page) {

    const button = document.createElement("button");

    button.textContent = page;

    if (page === currentPage) {
        button.classList.add("active");
    }

    button.addEventListener("click", () => {
        changePage(page);
    });

    objectPagination.appendChild(button);

}


function addPageEllipsis() {

    const ellipsis = document.createElement("span");

    ellipsis.textContent = "...";
    ellipsis.style.color = "var(--text-muted)";
    ellipsis.style.padding = "8px 3px";
    ellipsis.style.fontSize = "11px";

    objectPagination.appendChild(ellipsis);

}


function changePage(page) {

    currentPage = page;

    loadObjects();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   COUNT
========================================= */

function updateCount() {

    if (totalObjects === 0) {
        objectCount.textContent = "No objects found";
        return;
    }

    const from = (currentPage - 1) * PAGE_SIZE + 1;

    const to = Math.min(
        currentPage * PAGE_SIZE,
        totalObjects
    );

    objectCount.textContent =
        `Showing ${from}–${to} of ${totalObjects} objects`;

}


/* =========================================
   STATES
========================================= */

function showLoading() {

    objectDirectory.innerHTML = `

        <div class="object-loading">

            <div class="object-loading-spinner"></div>

            <span>Loading objects...</span>

        </div>

    `;

}


function showEmpty() {

    objectDirectory.innerHTML = `

        <div class="object-empty">

            <div class="object-empty-title">
                No objects found
            </div>

            <span>
                Try changing your search or filters.
            </span>

        </div>

    `;

}


function showError(message) {

    objectDirectory.innerHTML = `

        <div class="object-error">

            <div class="object-error-title">
                Something went wrong
            </div>

            <span>${escapeHTML(message)}</span>

        </div>

    `;

}


/* =========================================
   HTML ESCAPING
========================================= */

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];

    });

}
