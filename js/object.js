
/* =========================================
   FICTIONAL ARCHIVE
   OBJECT PROFILE
========================================= */


/* =========================================
   CONFIGURATION
========================================= */

const parameters = new URLSearchParams(window.location.search);
const objectId = parameters.get("id");

const profile = document.getElementById("objectProfile");
const breadcrumb = document.getElementById("objectBreadcrumb");


/* =========================================
   LOAD OBJECT
========================================= */

async function loadObject() {

    if (!objectId) {
        showProfileError("No object ID provided.");
        return;
    }

    try {

        // Load object
        const { data: object, error } = await window.supabaseClient
            .from("objects")
            .select("*")
            .eq("id", objectId)
            .single();

        if (error) {
            throw error;
        }


        // Load franchise
        let franchise = null;

        if (object.franchise_id !== null) {

            const { data, error } = await window.supabaseClient
                .from("franchises")
                .select("id, name")
                .eq("id", object.franchise_id)
                .maybeSingle();

            if (error) {
                console.error("Could not load franchise:", error);
            } else {
                franchise = data;
            }

        }


        // Load reality
        let reality = null;

        if (object.reality_id !== null) {

            const { data, error } = await window.supabaseClient
                .from("realities")
                .select("id, name")
                .eq("id", object.reality_id)
                .maybeSingle();

            if (error) {
                console.error("Could not load reality:", error);
            } else {
                reality = data;
            }

        }


        // Load origin location
        let originLocation = null;

        if (object.origin_location_id !== null) {

            const { data, error } = await window.supabaseClient
                .from("locations")
                .select("id, name")
                .eq("id", object.origin_location_id)
                .maybeSingle();

            if (error) {
                console.error("Could not load origin location:", error);
            } else {
                originLocation = data;
            }

        }


        renderObject(
            object,
            franchise,
            reality,
            originLocation
        );


    } catch (error) {

        console.error("OBJECT PROFILE ERROR:", error);

        showProfileError(
            `Could not load object: ${error.message}`
        );

    }

}


/* =========================================
   RENDER OBJECT
========================================= */

function renderObject(
    object,
    franchise,
    reality,
    originLocation
) {

    // Page title
    document.title =
        `${object.name} | Fictional Archive`;


    // Breadcrumb
    breadcrumb.textContent =
        `ARCHIVE / OBJECTS & ARTIFACTS / ${object.name.toUpperCase()}`;


    profile.innerHTML = "";


    /* =====================================
       HERO
    ===================================== */

    const hero = document.createElement("div");
    hero.className = "object-hero";


    if (object.image_url) {

        const image = document.createElement("img");

        image.className = "object-hero-image";
        image.src = object.image_url;
        image.alt = object.name;

        image.onerror = () => {
            image.remove();
        };

        hero.appendChild(image);

    }


    const heroContent = document.createElement("div");
    heroContent.className = "object-hero-content";


    const type = document.createElement("div");
    type.className = "eyebrow";
    type.textContent =
        (object.type || "OBJECT").toUpperCase();


    const title = document.createElement("h1");
    title.textContent = object.name;


    const subtitle = document.createElement("p");
    subtitle.textContent =
        object.status || "Status unknown";


    heroContent.append(
        type,
        title,
        subtitle
    );

    hero.appendChild(heroContent);

    profile.appendChild(hero);


    /* =====================================
       PROFILE GRID
    ===================================== */

    const grid = document.createElement("div");
    grid.className = "object-profile-grid";


    /* =====================================
       OVERVIEW PANEL
    ===================================== */

    const overviewPanel = document.createElement("section");
    overviewPanel.className = "object-panel";


    const overviewTitle = document.createElement("h2");
    overviewTitle.textContent = "Overview";


    const description = document.createElement("p");
    description.className = "object-description";
    description.textContent =
        object.description || "No description available.";


    overviewPanel.append(
        overviewTitle,
        description
    );


    // Aliases
    if (object.aliases && object.aliases.length > 0) {

        const aliasesSection = document.createElement("div");
        aliasesSection.className = "object-aliases";


        object.aliases.forEach(alias => {

            const aliasElement = document.createElement("span");

            aliasElement.className = "object-alias";
            aliasElement.textContent = alias;

            aliasesSection.appendChild(aliasElement);

        });


        overviewPanel.appendChild(aliasesSection);

    }


    /* =====================================
       INFORMATION PANEL
    ===================================== */

    const informationPanel = document.createElement("section");
    informationPanel.className = "object-panel";


    const informationTitle = document.createElement("h2");
    informationTitle.textContent = "Information";


    const information = document.createElement("div");
    information.className = "object-information";


    // Type
    addInformation(
        information,
        "TYPE",
        object.type || "Unknown"
    );


    // Status
    addInformation(
        information,
        "STATUS",
        object.status || "Unknown"
    );


    // Origin
    addInformation(
        information,
        "ORIGIN",
        object.origin || "Unknown"
    );


    // First appearance
    addInformation(
        information,
        "FIRST APPEARANCE",
        object.first_appearance || "Unknown"
    );


    // Franchise
    addRelatedInformation(
        information,
        "FRANCHISE",
        franchise,
        franchise
            ? `franchise.html?id=${encodeURIComponent(franchise.id)}`
            : null
    );


    // Reality
    addRelatedInformation(
        information,
        "REALITY",
        reality,
        null
    );


    // Origin location
    addRelatedInformation(
        information,
        "ORIGIN LOCATION",
        originLocation,
        originLocation
            ? `location.html?id=${encodeURIComponent(originLocation.id)}`
            : null
    );


    // Database ID
    addInformation(
        information,
        "DATABASE ID",
        object.id
    );


    informationPanel.append(
        informationTitle,
        information
    );


    grid.append(
        overviewPanel,
        informationPanel
    );

    profile.appendChild(grid);


    /* =====================================
       PROPERTIES
    ===================================== */

    renderProperties(object.properties);


    /* =====================================
       BACK TO DIRECTORY
    ===================================== */

    const backLink = document.createElement("a");

    backLink.className = "object-back-link";
    backLink.href = "objects.html";
    backLink.textContent =
        "← Back to Objects & Artifacts Directory";

    profile.appendChild(backLink);

}


/* =========================================
   RENDER PROPERTIES
========================================= */

function renderProperties(properties) {

    const section = document.createElement("section");
    section.className = "object-properties";


    const title = document.createElement("h2");
    title.textContent = "Properties";

    section.appendChild(title);


    const grid = document.createElement("div");
    grid.className = "object-properties-grid";


    if (
        !properties ||
        typeof properties !== "object" ||
        Object.keys(properties).length === 0
    ) {

        const emptyMessage = document.createElement("p");

        emptyMessage.className = "object-properties-empty";
        emptyMessage.textContent =
            "No additional properties have been recorded.";

        grid.appendChild(emptyMessage);

    } else {

        Object.entries(properties).forEach(([key, value]) => {

            // Ignore empty values
            if (value === null || value === undefined || value === "") {
                return;
            }

            const card = document.createElement("div");
            card.className = "object-property-card";


            const label = document.createElement("div");
            label.className = "object-property-label";
            label.textContent = formatPropertyLabel(key);


            const propertyValue = document.createElement("div");
            propertyValue.className = "object-property-value";
            propertyValue.textContent = formatPropertyValue(value);


            card.append(
                label,
                propertyValue
            );

            grid.appendChild(card);

        });


        if (grid.children.length === 0) {

            const emptyMessage = document.createElement("p");

            emptyMessage.className = "object-properties-empty";
            emptyMessage.textContent =
                "No additional properties have been recorded.";

            grid.appendChild(emptyMessage);

        }

    }


    section.appendChild(grid);
    profile.appendChild(section);

}


/* =========================================
   PROPERTY FORMATTING
========================================= */

function formatPropertyLabel(key) {

    return String(key)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();

}


function formatPropertyValue(value) {

    if (Array.isArray(value)) {
        return value.map(item => formatPropertyValue(item)).join(", ");
    }

    if (typeof value === "object" && value !== null) {
        return JSON.stringify(value, null, 2);
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    return String(value);

}


/* =========================================
   INFORMATION HELPER
========================================= */

function addInformation(container, label, value) {

    const item = document.createElement("div");
    item.className = "object-information-item";


    const labelElement = document.createElement("span");
    labelElement.className = "object-information-label";
    labelElement.textContent = label;


    const valueElement = document.createElement("span");
    valueElement.className = "object-information-value";
    valueElement.textContent = value;


    item.append(
        labelElement,
        valueElement
    );

    container.appendChild(item);

}


/* =========================================
   RELATED INFORMATION HELPER
========================================= */

function addRelatedInformation(
    container,
    label,
    relatedEntity,
    link
) {

    const item = document.createElement("div");
    item.className = "object-information-item";


    const labelElement = document.createElement("span");
    labelElement.className = "object-information-label";
    labelElement.textContent = label;


    item.appendChild(labelElement);


    if (relatedEntity) {

        if (link) {

            const linkElement = document.createElement("a");

            linkElement.className = "object-link";
            linkElement.href = link;
            linkElement.textContent = relatedEntity.name;

            item.appendChild(linkElement);

        } else {

            const valueElement = document.createElement("span");

            valueElement.className = "object-information-value";
            valueElement.textContent = relatedEntity.name;

            item.appendChild(valueElement);

        }

    } else {

        const valueElement = document.createElement("span");

        valueElement.className = "object-information-value";
        valueElement.textContent = "None";

        item.appendChild(valueElement);

    }


    container.appendChild(item);

}


/* =========================================
   ERROR HANDLING
========================================= */

function showProfileError(message) {

    profile.innerHTML = "";

    const error = document.createElement("p");

    error.className = "object-profile-error";
    error.textContent = message;

    profile.appendChild(error);

}


/* =========================================
   INITIAL LOAD
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    if (!window.supabaseClient) {

        showProfileError("Supabase client could not be initialized.");
        return;

    }

    loadObject();

});
