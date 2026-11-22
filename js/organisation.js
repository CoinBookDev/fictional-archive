
/* =========================================
   FICTIONAL ARCHIVE
   ORGANISATION PROFILE
========================================= */


/* =========================================
   CONFIGURATION
========================================= */

const parameters = new URLSearchParams(window.location.search);
const organisationId = parameters.get("id");

const profile = document.getElementById("organisationProfile");
const breadcrumb = document.getElementById("organisationBreadcrumb");


/* =========================================
   LOAD ORGANISATION
========================================= */

async function loadOrganisation() {

    if (!organisationId) {
        showProfileError("No organisation ID provided.");
        return;
    }

    try {

        // Load organisation
        const { data: organisation, error } = await window.supabaseClient
            .from("organisations")
            .select("*")
            .eq("id", organisationId)
            .single();

        if (error) {
            throw error;
        }


        // Load related franchise
        let franchise = null;

        if (organisation.franchise_id !== null) {

            const { data, error } = await window.supabaseClient
                .from("franchises")
                .select("id, name")
                .eq("id", organisation.franchise_id)
                .maybeSingle();

            if (error) {
                console.error("Could not load franchise:", error);
            } else {
                franchise = data;
            }

        }


        // Load related reality
        let reality = null;

        if (organisation.reality_id !== null) {

            const { data, error } = await window.supabaseClient
                .from("realities")
                .select("id, name")
                .eq("id", organisation.reality_id)
                .maybeSingle();

            if (error) {
                console.error("Could not load reality:", error);
            } else {
                reality = data;
            }

        }


        // Load headquarters
        let headquarters = null;

        if (organisation.headquarters_location_id !== null) {

            const { data, error } = await window.supabaseClient
                .from("locations")
                .select("id, name, location_type")
                .eq("id", organisation.headquarters_location_id)
                .maybeSingle();

            if (error) {
                console.error("Could not load headquarters:", error);
            } else {
                headquarters = data;
            }

        }


        renderOrganisation(
            organisation,
            franchise,
            reality,
            headquarters
        );


    } catch (error) {

        console.error("ORGANISATION PROFILE ERROR:", error);

        showProfileError(
            `Could not load organisation: ${error.message}`
        );

    }

}


/* =========================================
   RENDER ORGANISATION
========================================= */

function renderOrganisation(
    organisation,
    franchise,
    reality,
    headquarters
) {

    // Update page title
    document.title =
        `${organisation.name} | Fictional Archive`;


    // Update breadcrumb
    breadcrumb.textContent =
        `ARCHIVE / ORGANISATIONS / ${organisation.name.toUpperCase()}`;


    profile.innerHTML = "";


    /* =====================================
       HERO
    ===================================== */

    const hero = document.createElement("div");
    hero.className = "organisation-hero";


    if (organisation.image_url) {

        const image = document.createElement("img");

        image.className = "organisation-hero-image";
        image.src = organisation.image_url;
        image.alt = organisation.name;

        image.onerror = () => {
            image.remove();
        };

        hero.appendChild(image);

    }


    const heroContent = document.createElement("div");
    heroContent.className = "organisation-hero-content";


    const type = document.createElement("div");
    type.className = "eyebrow";
    type.textContent =
        (organisation.type || "ORGANISATION").toUpperCase();


    const title = document.createElement("h1");
    title.textContent = organisation.name;


    heroContent.append(type, title);


    if (organisation.abbreviation) {

        const abbreviation = document.createElement("div");

        abbreviation.className = "organisation-hero-abbreviation";
        abbreviation.textContent = organisation.abbreviation;

        heroContent.appendChild(abbreviation);

    }


    hero.appendChild(heroContent);
    profile.appendChild(hero);


    /* =====================================
       PROFILE GRID
    ===================================== */

    const grid = document.createElement("div");
    grid.className = "organisation-profile-grid";


    /* =====================================
       OVERVIEW PANEL
    ===================================== */

    const overviewPanel = document.createElement("section");
    overviewPanel.className = "organisation-panel";


    const overviewTitle = document.createElement("h2");
    overviewTitle.textContent = "Overview";


    const description = document.createElement("p");
    description.className = "organisation-description";
    description.textContent =
        organisation.description || "No description available.";


    overviewPanel.append(
        overviewTitle,
        description
    );


    // Aliases
    if (
        organisation.aliases &&
        organisation.aliases.length > 0
    ) {

        const aliasesSection = document.createElement("div");
        aliasesSection.className = "organisation-aliases";


        organisation.aliases.forEach(alias => {

            const aliasElement = document.createElement("span");

            aliasElement.className = "organisation-alias";
            aliasElement.textContent = alias;

            aliasesSection.appendChild(aliasElement);

        });


        overviewPanel.appendChild(aliasesSection);

    }


    /* =====================================
       INFORMATION PANEL
    ===================================== */

    const informationPanel = document.createElement("section");
    informationPanel.className = "organisation-panel";


    const informationTitle = document.createElement("h2");
    informationTitle.textContent = "Information";


    const information = document.createElement("div");
    information.className = "organisation-information";


    // Organisation type
    addInformation(
        information,
        "TYPE",
        organisation.type || "Unknown"
    );


    // Status
    addInformation(
        information,
        "STATUS",
        organisation.status || "Unknown"
    );


    // Founded
    addInformation(
        information,
        "FOUNDED",
        organisation.founded || "Unknown"
    );


    // Disbanded
    addInformation(
        information,
        "DISBANDED",
        organisation.disbanded || "Not applicable"
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


    // Headquarters
    addRelatedInformation(
        information,
        "HEADQUARTERS",
        headquarters,
        headquarters
            ? `location.html?id=${encodeURIComponent(headquarters.id)}`
            : null
    );


    // Database ID
    addInformation(
        information,
        "DATABASE ID",
        organisation.id
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
       BACK TO DIRECTORY
    ===================================== */

    const backLink = document.createElement("a");

    backLink.className = "organisation-back-link";
    backLink.href = "organisations.html";
    backLink.textContent =
        "← Back to Organisations Directory";

    profile.appendChild(backLink);

}


/* =========================================
   INFORMATION HELPER
========================================= */

function addInformation(container, label, value) {

    const item = document.createElement("div");
    item.className = "organisation-information-item";


    const labelElement = document.createElement("span");
    labelElement.className = "organisation-information-label";
    labelElement.textContent = label;


    const valueElement = document.createElement("span");
    valueElement.className = "organisation-information-value";
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
    item.className = "organisation-information-item";


    const labelElement = document.createElement("span");
    labelElement.className = "organisation-information-label";
    labelElement.textContent = label;


    item.appendChild(labelElement);


    if (relatedEntity) {

        if (link) {

            const linkElement = document.createElement("a");

            linkElement.className = "organisation-link";
            linkElement.href = link;
            linkElement.textContent = relatedEntity.name;

            item.appendChild(linkElement);

        } else {

            const valueElement = document.createElement("span");

            valueElement.className = "organisation-information-value";
            valueElement.textContent = relatedEntity.name;

            item.appendChild(valueElement);

        }

    } else {

        const valueElement = document.createElement("span");

        valueElement.className = "organisation-information-value";
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

    error.className = "organisation-profile-error";
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

    loadOrganisation();

});

