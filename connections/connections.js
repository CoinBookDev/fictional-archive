
/* =========================================
   FICTIONAL ARCHIVEio   CONNECTIONS DIRECTORY
   UNIVERSAL ENTITY SYSTEM
========================================= */


/* =========================================
   CONFIGURATION
========================================= */

const CONNECTION_PAGE_SIZE = 50;

let connectionCurrentPage = 1;
let connectionTotal = 0;

let connectionSearchTerm = "";
let connectionSourceType = "";
let connectionTargetType = "";

let connectionSearchTimeout = null;


/* =========================================
   ENTITY TABLE CONFIGURATION
========================================= */

const CONNECTION_ENTITY_TABLES = {

    character: {
        table: "characters",
        nameColumn: "name",
        label: "Character"
    },

    character_version: {
        table: "character_versions",
        nameColumn: "name",
        label: "Character Version"
    },

    organisation: {
        table: "organisations",
        nameColumn: "name",
        label: "Organisation"
    },

    object: {
        table: "objects",
        nameColumn: "name",
        label: "Object"
    },

    franchise: {
        table: "franchises",
        nameColumn: "name",
        label: "Franchise"
    },

    reality: {
        table: "realities",
        nameColumn: "name",
        label: "Reality"
    },

    location: {
        table: "locations",
        nameColumn: "name",
        label: "Location"
    },

    timeline: {
        table: "timelines",
        nameColumn: "name",
        label: "Timeline"
    },

    timeline_event: {
        table: "timeline_events",
        nameColumn: "title",
        label: "Timeline Event"
    }

};


/* =========================================
   ELEMENTS
========================================= */

const connectionSearch =
    document.getElementById("connectionSearch");

const connectionSourceFilter =
    document.getElementById("connectionSourceFilter");

const connectionTargetFilter =
    document.getElementById("connectionTargetFilter");

const connectionCount =
    document.getElementById("connectionCount");

const connectionDirectory =
    document.getElementById("connectionDirectory");

const connectionPagination =
    document.getElementById("connectionPagination");


/* =========================================
   INITIALIZATION
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

    if (!window.supabaseClient) {
        showConnectionError(
            "Supabase client could not be initialized."
        );
        return;
    }

    if (
        !connectionSearch ||
        !connectionSourceFilter ||
        !connectionTargetFilter ||
        !connectionCount ||
        !connectionDirectory ||
        !connectionPagination
    ) {
        console.error(
            "One or more Connections page elements are missing."
        );
        return;
    }

    loadEntityTypeFilters();

    connectionSearch.addEventListener("input", () => {

        clearTimeout(connectionSearchTimeout);

        connectionSearchTimeout = setTimeout(() => {

            connectionSearchTerm =
                connectionSearch.value.trim();

            connectionCurrentPage = 1;

            loadConnections();

        }, 300);

    });


    connectionSourceFilter.addEventListener("change", () => {

        connectionSourceType =
            connectionSourceFilter.value;

        connectionCurrentPage = 1;

        loadConnections();

    });


    connectionTargetFilter.addEventListener("change", () => {

        connectionTargetType =
            connectionTargetFilter.value;

        connectionCurrentPage = 1;

        loadConnections();

    });


    await loadConnections();

});


/* =========================================
   ENTITY TYPE FILTERS
========================================= */

function loadEntityTypeFilters() {

    Object.entries(CONNECTION_ENTITY_TABLES).forEach(
        ([type, config]) => {

            const sourceOption =
                document.createElement("option");

            sourceOption.value = type;
            sourceOption.textContent = config.label;

            connectionSourceFilter.appendChild(
                sourceOption
            );


            const targetOption =
                document.createElement("option");

            targetOption.value = type;
            targetOption.textContent = config.label;

            connectionTargetFilter.appendChild(
                targetOption
            );

        }
    );

}


/* =========================================
   LOAD CONNECTIONS
========================================= */

async function loadConnections() {

    showConnectionLoading();

    const from =
        (connectionCurrentPage - 1) *
        CONNECTION_PAGE_SIZE;

    const to =
        from + CONNECTION_PAGE_SIZE - 1;


    /*
       The Connections table now references
       entities through universal IDs.

       These joins retrieve the registry
       records for both sides of a connection.
    */

    let query = window.supabaseClient
        .from("connections")
        .select(`
            *,
            source:entities!connections_source_entity_fkey!inner(
                id,
                entity_type,
                record_id
            ),
            target:entities!connections_target_entity_fkey!inner(
                id,
                entity_type,
                record_id
            )
        `, { count: "exact" })
        .order("id", { ascending: true })
        .range(from, to);


    /* SEARCH */

    if (connectionSearchTerm) {

        const safeSearch = connectionSearchTerm
            .replace(/[(),]/g, " ")
            .replace(/[%_]/g, " ")
            .trim();

        if (safeSearch) {

            query = query.or(
                `relationship.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`
            );

        }

    }


    /* SOURCE TYPE FILTER */

    if (connectionSourceType) {

        query = query.eq(
            "source.entity_type",
            connectionSourceType
        );

    }


    /* TARGET TYPE FILTER */

    if (connectionTargetType) {

        query = query.eq(
            "target.entity_type",
            connectionTargetType
        );

    }


    const {
        data,
        error,
        count
    } = await query;


    if (error) {

        console.error(
            "Could not load connections:",
            error
        );

        showConnectionError(
            "The connections could not be loaded."
        );

        connectionCount.textContent =
            "Unable to load connections";

        return;

    }


    connectionTotal = count || 0;

    updateConnectionCount();


    if (!data || data.length === 0) {

        showConnectionEmpty();

        renderConnectionPagination();

        return;

    }


    /* RESOLVE ENTITY NAMES */

    const resolvedConnections =
        await resolveConnectionEntities(data);


    renderConnections(resolvedConnections);

    renderConnectionPagination();

}


/* =========================================
   RESOLVE ENTITY NAMES
========================================= */

async function resolveConnectionEntities(connections) {

    const requestedEntities = {};


    /*
       Collect registry records by entity type.

       record_id refers to the original ID
       inside the corresponding entity table.
    */

    connections.forEach(connection => {

        const source = connection.source;
        const target = connection.target;


        if (
            source &&
            CONNECTION_ENTITY_TABLES[source.entity_type]
        ) {

            const type = source.entity_type;

            if (!requestedEntities[type]) {
                requestedEntities[type] = new Set();
            }

            requestedEntities[type].add(
                source.record_id
            );

        }


        if (
            target &&
            CONNECTION_ENTITY_TABLES[target.entity_type]
        ) {

            const type = target.entity_type;

            if (!requestedEntities[type]) {
                requestedEntities[type] = new Set();
            }

            requestedEntities[type].add(
                target.record_id
            );

        }

    });


    const entityMaps = {};


    /*
       Query each relevant entity table.

       These queries use original record IDs,
       not universal entity IDs.
    */

    for (
        const [type, idSet]
        of Object.entries(requestedEntities)
    ) {

        const config =
            CONNECTION_ENTITY_TABLES[type];

        if (!config) {
            continue;
        }

        const ids = [...idSet];

        if (ids.length === 0) {
            continue;
        }


        const { data, error } =
            await window.supabaseClient
                .from(config.table)
                .select(
                    `id, ${config.nameColumn}`
                )
                .in("id", ids);


        if (error) {

            console.error(
                `Could not resolve ${type} entities:`,
                error
            );

            entityMaps[type] = {};

            continue;

        }


        entityMaps[type] = {};

        (data || []).forEach(entity => {

            entityMaps[type][entity.id] =
                entity[config.nameColumn];

        });

    }


    /*
       Attach resolved information to
       each connection.
    */

    return connections.map(connection => {

        const source = connection.source;
        const target = connection.target;


        const sourceConfig = source
            ? CONNECTION_ENTITY_TABLES[source.entity_type]
            : null;

        const targetConfig = target
            ? CONNECTION_ENTITY_TABLES[target.entity_type]
            : null;


        const sourceName = sourceConfig
            ? entityMaps[source.entity_type]?.[
                source.record_id
            ]
            : null;

        const targetName = targetConfig
            ? entityMaps[target.entity_type]?.[
                target.record_id
            ]
            : null;


        return {

            ...connection,

            source_name:
                sourceName ||
                `${sourceConfig?.label || "Unknown Entity"} #${source?.record_id ?? "?"}`,

            target_name:
                targetName ||
                `${targetConfig?.label || "Unknown Entity"} #${target?.record_id ?? "?"}`,

            source_label:
                sourceConfig?.label || "Unknown Entity",

            target_label:
                targetConfig?.label || "Unknown Entity",

            source_universal_id:
                source?.id ?? null,

            target_universal_id:
                target?.id ?? null

        };

    });

}


/* =========================================
   RENDER CONNECTIONS
========================================= */

function renderConnections(connections) {

    connectionDirectory.innerHTML = "";


    connections.forEach(connection => {

        const card = document.createElement("a");

        card.className = "connection-card";

        card.href =
            `connection.html?id=${encodeURIComponent(connection.id)}`;


        /* SOURCE ENTITY */

        const source = document.createElement("div");

        source.className =
            "connection-entity connection-entity-source";


        const sourceType = document.createElement("span");

        sourceType.className =
            "connection-entity-type";

        sourceType.textContent =
            connection.source_label;


        const sourceName = document.createElement("span");

        sourceName.className =
            "connection-entity-name";

        sourceName.textContent =
            connection.source_name;


        source.append(sourceType, sourceName);


        /* RELATIONSHIP */

        const arrow = document.createElement("div");

        arrow.className = "connection-flow-arrow";


        const relationship = document.createElement("span");

        relationship.className =
            "connection-relationship";

        relationship.textContent =
            connection.relationship;


        const arrowLine = document.createElement("div");

        arrowLine.className =
            "connection-arrow-line";


        arrow.append(relationship, arrowLine);


        /* TARGET ENTITY */

        const target = document.createElement("div");

        target.className =
            "connection-entity connection-entity-target";


        const targetType = document.createElement("span");

        targetType.className =
            "connection-entity-type";

        targetType.textContent =
            connection.target_label;


        const targetName = document.createElement("span");

        targetName.className =
            "connection-entity-name";

        targetName.textContent =
            connection.target_name;


        target.append(targetType, targetName);


        /* CONNECTION FLOW */

        const flow = document.createElement("div");

        flow.className = "connection-flow";

        flow.append(source, arrow, target);

        card.appendChild(flow);


        /* DESCRIPTION */

        if (connection.description) {

            const description =
                document.createElement("p");

            description.className =
                "connection-description";

            description.textContent =
                connection.description;

            card.appendChild(description);

        }


        connectionDirectory.appendChild(card);

    });

}


/* =========================================
   PAGINATION
========================================= */

function renderConnectionPagination() {

    connectionPagination.innerHTML = "";

    const totalPages = Math.ceil(
        connectionTotal / CONNECTION_PAGE_SIZE
    );

    if (totalPages <= 1) {
        return;
    }


    /* PREVIOUS BUTTON */

    const previousButton =
        document.createElement("button");

    previousButton.textContent = "←";

    previousButton.disabled =
        connectionCurrentPage === 1;

    previousButton.addEventListener("click", () => {

        changeConnectionPage(
            connectionCurrentPage - 1
        );

    });

    connectionPagination.appendChild(
        previousButton
    );


    /* PAGE NUMBERS */

    const pages = [];

    for (
        let page = Math.max(
            1,
            connectionCurrentPage - 2
        );

        page <= Math.min(
            totalPages,
            connectionCurrentPage + 2
        );

        page++
    ) {

        pages.push(page);

    }


    if (pages[0] > 1) {

        addConnectionPageButton(1);

        if (pages[0] > 2) {
            addConnectionEllipsis();
        }

    }


    pages.forEach(page => {

        addConnectionPageButton(page);

    });


    if (pages[pages.length - 1] < totalPages) {

        if (
            pages[pages.length - 1] <
            totalPages - 1
        ) {

            addConnectionEllipsis();

        }

        addConnectionPageButton(totalPages);

    }


    /* NEXT BUTTON */

    const nextButton =
        document.createElement("button");

    nextButton.textContent = "→";

    nextButton.disabled =
        connectionCurrentPage === totalPages;

    nextButton.addEventListener("click", () => {

        changeConnectionPage(
            connectionCurrentPage + 1
        );

    });

    connectionPagination.appendChild(
        nextButton
    );

}


function addConnectionPageButton(page) {

    const button =
        document.createElement("button");

    button.textContent = page;

    if (page === connectionCurrentPage) {
        button.classList.add("active");
    }

    button.addEventListener("click", () => {

        changeConnectionPage(page);

    });

    connectionPagination.appendChild(button);

}


function addConnectionEllipsis() {

    const ellipsis =
        document.createElement("span");

    ellipsis.textContent = "...";

    ellipsis.style.color =
        "var(--text-muted)";

    ellipsis.style.padding = "8px 3px";

    ellipsis.style.fontSize = "11px";

    connectionPagination.appendChild(ellipsis);

}


function changeConnectionPage(page) {

    connectionCurrentPage = page;

    loadConnections();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   COUNT
========================================= */

function updateConnectionCount() {

    if (connectionTotal === 0) {

        connectionCount.textContent =
            "No connections found";

        return;

    }


    const from =
        (connectionCurrentPage - 1) *
        CONNECTION_PAGE_SIZE + 1;

    const to = Math.min(
        connectionCurrentPage *
        CONNECTION_PAGE_SIZE,
        connectionTotal
    );


    connectionCount.textContent =
        `Showing ${from}–${to} of ${connectionTotal} connections`;

}


/* =========================================
   STATES
========================================= */

function showConnectionLoading() {

    connectionDirectory.innerHTML = `

        <div class="connection-loading">

            <div class="connection-loading-spinner"></div>

            <span>Loading connections...</span>

        </div>

    `;

}


function showConnectionEmpty() {

    connectionDirectory.innerHTML = `

        <div class="connection-empty">

            <div class="connection-empty-title">
                No connections found
            </div>

            <span>
                Try changing your search or filters.
            </span>

        </div>

    `;

}


function showConnectionError(message) {

    connectionDirectory.innerHTML = "";

    const error = document.createElement("div");

    error.className = "connection-error";


    const title = document.createElement("div");

    title.className = "connection-error-title";

    title.textContent = "Something went wrong";


    const description = document.createElement("span");

    description.textContent = message;


    error.append(title, description);

    connectionDirectory.appendChild(error);

}
