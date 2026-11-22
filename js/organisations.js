
/* =========================================
   FICTIONAL ARCHIVE
   ORGANISATIONS DIRECTORY
========================================= */


/* =========================================
   CONFIGURATION
========================================= */

const PAGE_SIZE = 50;

let currentPage = 1;
let totalOrganisations = 0;

let searchTerm = "";
let selectedType = "";
let selectedStatus = "";

let searchTimeout = null;


/* =========================================
   ELEMENTS
========================================= */

const organisationSearch =
    document.getElementById("organisationSearch");

const organisationTypeFilter =
    document.getElementById("organisationTypeFilter");

const organisationStatusFilter =
    document.getElementById("organisationStatusFilter");

const organisationCount =
    document.getElementById("organisationCount");

const organisationDirectory =
    document.getElementById("organisationDirectory");

const organisationPagination =
    document.getElementById("organisationPagination");


/* =========================================
   INITIALIZATION
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

    if (!window.supabaseClient) {
        showError("Supabase client could not be initialized.");
        return;
    }

    organisationSearch.addEventListener("input", () => {

        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            searchTerm = organisationSearch.value.trim();
            currentPage = 1;
            loadOrganisations();
        }, 300);

    });

    organisationTypeFilter.addEventListener("change", () => {
        selectedType = organisationTypeFilter.value;
        currentPage = 1;
        loadOrganisations();
    });

    organisationStatusFilter.addEventListener("change", () => {
        selectedStatus = organisationStatusFilter.value;
        currentPage = 1;
        loadOrganisations();
    });

    await loadFilterOptions();
    await loadOrganisations();

});


/* =========================================
   LOAD FILTER OPTIONS
========================================= */

async function loadFilterOptions() {

    await Promise.all([
        loadTypes(),
        loadStatuses()
    ]);

}


async function loadTypes() {

    const { data, error } = await window.supabaseClient
        .from("organisations")
        .select("type")
        .not("type", "is", null)
        .order("type");

    if (error) {
        console.error("Could not load organisation types:", error);
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

        organisationTypeFilter.appendChild(option);

    });

}


async function loadStatuses() {

    const { data, error } = await window.supabaseClient
        .from("organisations")
        .select("status")
        .not("status", "is", null)
        .order("status");

    if (error) {
        console.error("Could not load organisation statuses:", error);
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

        organisationStatusFilter.appendChild(option);

    });

}


/* =========================================
   LOAD ORGANISATIONS
========================================= */

async function loadOrganisations() {

    showLoading();

    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = window.supabaseClient
        .from("organisations")
        .select("*", { count: "exact" })
        .order("name", { ascending: true })
        .range(from, to);


    /* SEARCH */

    if (searchTerm) {

        // Keep special PostgREST filter characters from
        // accidentally changing the search expression.
        const safeSearch = searchTerm
            .replace(/[(),]/g, " ")
            .replace(/[%_]/g, " ")
            .trim();

        if (safeSearch) {
            query = query.or(
                `name.ilike.%${safeSearch}%,abbreviation.ilike.%${safeSearch}%`
            );
        }

    }


    /* TYPE FILTER */

    if (selectedType) {
        query = query.eq("type", selectedType);
    }


    /* STATUS FILTER */

    if (selectedStatus) {
        query = query.eq("status", selectedStatus);
    }


    const { data, error, count } = await query;

    if (error) {

        console.error("Could not load organisations:", error);

        showError("The organisations could not be loaded.");
        organisationCount.textContent = "Unable to load organisations";

        return;

    }

    totalOrganisations = count || 0;

    updateCount();

    if (!data || data.length === 0) {

        showEmpty();
        renderPagination();

        return;

    }


    /* LOAD RELATED NAMES */

    const enrichedData = await loadRelatedNames(data);

    renderOrganisations(enrichedData);
    renderPagination();

}


/* =========================================
   LOAD RELATED FRANCHISES AND REALITIES
========================================= */

async function loadRelatedNames(organisations) {

    const franchiseIds = [
        ...new Set(
            organisations
                .map(item => item.franchise_id)
                .filter(id => id !== null)
        )
    ];

    const realityIds = [
        ...new Set(
            organisations
                .map(item => item.reality_id)
                .filter(id => id !== null)
        )
    ];

    let franchiseMap = {};
    let realityMap = {};


    /* FRANCHISES */

    if (franchiseIds.length > 0) {

        const { data, error } = await window.supabaseClient
            .from("franchises")
            .select("id, name")
            .in("id", franchiseIds);

        if (error) {
            console.error("Could not load franchise names:", error);
        } else {
            data.forEach(franchise => {
                franchiseMap[franchise.id] = franchise.name;
            });
        }

    }


    /* REALITIES */

    if (realityIds.length > 0) {

        const { data, error } = await window.supabaseClient
            .from("realities")
            .select("id, name")
            .in("id", realityIds);

        if (error) {
            console.error("Could not load reality names:", error);
        } else {
            data.forEach(reality => {
                realityMap[reality.id] = reality.name;
            });
        }

    }


    /* ATTACH RELATED NAMES */

    return organisations.map(organisation => ({

        ...organisation,

        franchise_name:
            franchiseMap[organisation.franchise_id] || null,

        reality_name:
            realityMap[organisation.reality_id] || null

    }));

}


/* =========================================
   RENDER ORGANISATIONS
========================================= */

function renderOrganisations(organisations) {

    organisationDirectory.innerHTML = "";

    organisations.forEach(organisation => {

        const card = document.createElement("a");

        card.className = "organisation-card";

        card.href = `organisation.html?id=${encodeURIComponent(organisation.id)}`;


        const status = organisation.status || "Unknown";

        const statusClass = status
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");


        const abbreviation = organisation.abbreviation
            ? escapeHTML(organisation.abbreviation)
            : "";


        const type = organisation.type
            ? escapeHTML(organisation.type)
            : "Unclassified";


        const description = organisation.description
            ? escapeHTML(organisation.description)
            : "No description has been added to this organisation yet.";


        const franchise = organisation.franchise_name
            ? escapeHTML(organisation.franchise_name)
            : null;


        const reality = organisation.reality_name
            ? escapeHTML(organisation.reality_name)
            : null;


        const founded = organisation.founded
            ? escapeHTML(organisation.founded)
            : null;


        card.innerHTML = `

            <div class="organisation-card-top">

                <span class="organisation-card-type">
                    ${type}
                </span>

                <span class="organisation-status status-${statusClass}">
                    ${escapeHTML(status)}
                </span>

            </div>


            <h2 class="organisation-card-name">
                ${escapeHTML(organisation.name)}
            </h2>


            ${
                abbreviation
                    ? `<div class="organisation-card-abbreviation">
                        ${abbreviation}
                       </div>`
                    : ""
            }


            <p class="organisation-card-description">
                ${description}
            </p>


            <div class="organisation-card-footer">

                ${
                    franchise
                        ? `<span class="organisation-card-meta">
                            Franchise: <strong>${franchise}</strong>
                           </span>`
                        : ""
                }

                ${
                    reality
                        ? `<span class="organisation-card-meta">
                            Reality: <strong>${reality}</strong>
                           </span>`
                        : ""
                }

                ${
                    founded
                        ? `<span class="organisation-card-meta">
                            Founded: <strong>${founded}</strong>
                           </span>`
                        : ""
                }

            </div>


            <span class="organisation-card-arrow">→</span>

        `;

        organisationDirectory.appendChild(card);

    });

}


/* =========================================
   PAGINATION
========================================= */

function renderPagination() {

    organisationPagination.innerHTML = "";

    const totalPages = Math.ceil(totalOrganisations / PAGE_SIZE);

    if (totalPages <= 1) {
        return;
    }


    /* PREVIOUS BUTTON */

    const previousButton = document.createElement("button");

    previousButton.textContent = "←";
    previousButton.disabled = currentPage === 1;

    previousButton.addEventListener("click", () => {
        changePage(currentPage - 1);
    });

    organisationPagination.appendChild(previousButton);


    /* PAGE NUMBERS */

    let pages = [];

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


    /* NEXT BUTTON */

    const nextButton = document.createElement("button");

    nextButton.textContent = "→";
    nextButton.disabled = currentPage === totalPages;

    nextButton.addEventListener("click", () => {
        changePage(currentPage + 1);
    });

    organisationPagination.appendChild(nextButton);

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

    organisationPagination.appendChild(button);

}


function addPageEllipsis() {

    const ellipsis = document.createElement("span");

    ellipsis.textContent = "...";
    ellipsis.style.color = "var(--text-muted)";
    ellipsis.style.padding = "8px 3px";
    ellipsis.style.fontSize = "11px";

    organisationPagination.appendChild(ellipsis);

}


function changePage(page) {

    currentPage = page;

    loadOrganisations();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   COUNT
========================================= */

function updateCount() {

    if (totalOrganisations === 0) {
        organisationCount.textContent = "No organisations found";
        return;
    }

    const from = (currentPage - 1) * PAGE_SIZE + 1;

    const to = Math.min(
        currentPage * PAGE_SIZE,
        totalOrganisations
    );

    organisationCount.textContent =
        `Showing ${from}–${to} of ${totalOrganisations} organisations`;

}


/* =========================================
   STATES
========================================= */

function showLoading() {

    organisationDirectory.innerHTML = `

        <div class="organisation-loading">

            <div class="organisation-loading-spinner"></div>

            <span>Loading organisations...</span>

        </div>

    `;

}


function showEmpty() {

    organisationDirectory.innerHTML = `

        <div class="organisation-empty">

            <div class="organisation-empty-title">
                No organisations found
            </div>

            <span>
                Try changing your search or filters.
            </span>

        </div>

    `;

}


function showError(message) {

    organisationDirectory.innerHTML = `

        <div class="organisation-error">

            <div class="organisation-error-title">
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

