/* =========================================
   LOCATION PROFILE
========================================= */

const parameters = new URLSearchParams(window.location.search);
const locationId = parameters.get("id");

const profile = document.getElementById("locationProfile");
const breadcrumb = document.getElementById("locationBreadcrumb");


/* =========================================
   LOAD LOCATION
========================================= */

async function loadLocation() {

    if (!locationId) {
        profile.innerHTML = "<p>No location ID provided.</p>";
        return;
    }

    try {

        // Load the location
        const { data: location, error } = await window.supabaseClient
            .from("locations")
            .select("*")
            .eq("id", locationId)
            .single();

        if (error) {
            throw error;
        }

        // Load parent location, if one exists
        let parentLocation = null;

        if (location.parent_location_id !== null) {

            const { data: parent, error: parentError } =
                await window.supabaseClient
                    .from("locations")
                    .select("id, name, location_type")
                    .eq("id", location.parent_location_id)
                    .single();

            if (parentError) {
                throw parentError;
            }

            parentLocation = parent;

        }

        // Load child locations
        const { data: children, error: childrenError } =
            await window.supabaseClient
                .from("locations")
                .select("id, name, location_type, description")
                .eq("parent_location_id", location.id)
                .order("name", { ascending: true });

        if (childrenError) {
            throw childrenError;
        }

        renderLocation(location, parentLocation, children);

    } catch (error) {

        profile.innerHTML =
            `<p>Could not load location: ${error.message}</p>`;

        console.error("LOCATION PROFILE ERROR:", error);

    }

}


/* =========================================
   RENDER LOCATION
========================================= */

function renderLocation(location, parent, children) {

    // Update page title
    document.title =
        `${location.name} | Fictional Archive`;

    // Update breadcrumb
    breadcrumb.textContent =
        `ARCHIVE / LOCATIONS / ${location.name.toUpperCase()}`;

    profile.innerHTML = "";

    /* =====================================
       HERO
    ===================================== */

    const hero = document.createElement("div");
    hero.className = "location-hero";

    if (location.image_url) {

        const image = document.createElement("img");

        image.className = "location-hero-image";
        image.src = location.image_url;
        image.alt = location.name;

        image.onerror = () => {
            image.remove();
        };

        hero.appendChild(image);

    }

    const heroContent = document.createElement("div");
    heroContent.className = "location-hero-content";

    const type = document.createElement("div");
    type.className = "eyebrow";
    type.textContent =
        (location.location_type || "OTHER").toUpperCase();

    const title = document.createElement("h1");
    title.textContent = location.name;

    const subtitle = document.createElement("p");
    subtitle.textContent =
        parent
            ? `Located within ${parent.name}`
            : "Independent location";

    heroContent.append(type, title, subtitle);
    hero.appendChild(heroContent);

    profile.appendChild(hero);


    /* =====================================
       PROFILE GRID
    ===================================== */

    const grid = document.createElement("div");
    grid.className = "location-profile-grid";


    /* =====================================
       DESCRIPTION PANEL
    ===================================== */

    const descriptionPanel = document.createElement("section");
    descriptionPanel.className = "location-panel";

    const descriptionTitle = document.createElement("h2");
    descriptionTitle.textContent = "Overview";

    const description = document.createElement("p");
    description.className = "location-description";
    description.textContent =
        location.description || "No description available.";

    descriptionPanel.append(
        descriptionTitle,
        description
    );

    grid.appendChild(descriptionPanel);


    /* =====================================
       INFORMATION PANEL
    ===================================== */

    const informationPanel = document.createElement("section");
    informationPanel.className = "location-panel";

    const informationTitle = document.createElement("h2");
    informationTitle.textContent = "Information";

    const information = document.createElement("div");
    information.className = "location-information";


    // Location type
    addInformation(
        information,
        "LOCATION TYPE",
        location.location_type || "Unknown"
    );


    // Parent location
    const parentContainer = document.createElement("div");
    parentContainer.className = "location-information-item";

    const parentLabel = document.createElement("span");
    parentLabel.className = "location-information-label";
    parentLabel.textContent = "PARENT LOCATION";

    parentContainer.appendChild(parentLabel);

    if (parent) {

        const parentLink = document.createElement("a");

        parentLink.className = "location-link";
        parentLink.href = `location.html?id=${parent.id}`;
        parentLink.textContent = parent.name;

        parentContainer.appendChild(parentLink);

    } else {

        const parentValue = document.createElement("span");

        parentValue.className = "location-information-value";
        parentValue.textContent = "None";

        parentContainer.appendChild(parentValue);

    }

    information.appendChild(parentContainer);


    // Status
    addInformation(
        information,
        "STATUS",
        location.status || "Unknown"
    );


    // Database ID
    addInformation(
        information,
        "DATABASE ID",
        location.id
    );


    informationPanel.append(
        informationTitle,
        information
    );

    grid.append(
        descriptionPanel,
        informationPanel
    );

    profile.appendChild(grid);


    /* =====================================
       CHILD LOCATIONS
    ===================================== */

    const childrenSection = document.createElement("section");
    childrenSection.className = "location-children";

    const childrenTitle = document.createElement("h2");
    childrenTitle.textContent = "Contained Locations";

    const childrenDescription = document.createElement("p");
    childrenDescription.textContent =
        "Locations that belong to this location.";

    childrenSection.append(
        childrenTitle,
        childrenDescription
    );

    const childrenGrid = document.createElement("div");
    childrenGrid.className = "location-children-grid";

    if (!children || children.length === 0) {

        const emptyMessage = document.createElement("p");
        emptyMessage.textContent =
            "No contained locations found.";

        childrenGrid.appendChild(emptyMessage);

    } else {

        children.forEach(child => {

            const card = document.createElement("a");

            card.className = "location-child-card";
            card.href = `location.html?id=${child.id}`;

            const childType = document.createElement("div");
            childType.className = "location-child-type";
            childType.textContent =
                (child.location_type || "OTHER").toUpperCase();

            const childName = document.createElement("h3");
            childName.textContent = child.name;

            const childDescription = document.createElement("p");
            childDescription.textContent =
                child.description || "No description available.";

            card.append(
                childType,
                childName,
                childDescription
            );

            childrenGrid.appendChild(card);

        });

    }

    childrenSection.appendChild(childrenGrid);
    profile.appendChild(childrenSection);


    /* =====================================
       BACK TO DIRECTORY
    ===================================== */

    const backLink = document.createElement("a");

    backLink.className = "location-back-link";
    backLink.href = "locations.html";
    backLink.textContent = "← Back to Locations Directory";

    profile.appendChild(backLink);

}


/* =========================================
   INFORMATION HELPER
========================================= */

function addInformation(container, label, value) {

    const item = document.createElement("div");
    item.className = "location-information-item";

    const labelElement = document.createElement("span");
    labelElement.className = "location-information-label";
    labelElement.textContent = label;

    const valueElement = document.createElement("span");
    valueElement.className = "location-information-value";
    valueElement.textContent = value;

    item.append(
        labelElement,
        valueElement
    );

    container.appendChild(item);

}


/* =========================================
   INITIAL LOAD
========================================= */

loadLocation();
