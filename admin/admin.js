
/* =========================================
   FICTIONAL ARCHIVE - ADMIN PANEL
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

    const supabase = window.supabaseClient;

    const loginScreen = document.getElementById("login-screen");
    const loginForm = document.getElementById("admin-login-form");
    const loginMessage = document.getElementById("login-message");
    const loginButton = document.getElementById("admin-login-button");
    const adminApp = document.getElementById("app");
    const logoutButton = document.getElementById("admin-logout");

    if (!supabase) {
        alert("Supabase connection not found.");
        return;
    }

    /* =====================================
       AUTHENTICATION
    ===================================== */

    function showLogin() {
        loginScreen.hidden = false;
        adminApp.hidden = true;
    }

    function showDashboard() {
        loginScreen.hidden = true;
        adminApp.hidden = false;
    }

    async function verifyAdmin(user) {

        const { data, error } = await supabase
            .from("admin_users")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (error) {
            console.error("Admin verification error:", error);
            return false;
        }

        return data !== null;
    }

    async function authenticateUser(user) {

        const isAdmin = await verifyAdmin(user);

        if (!isAdmin) {
            await supabase.auth.signOut();

            showLogin();
            loginMessage.textContent =
                "Access denied. This account is not an administrator.";

            return false;
        }

        showDashboard();
        openSection("dashboard");

        return true;
    }

    loginForm.addEventListener("submit", async event => {

        event.preventDefault();

        loginButton.disabled = true;
        loginButton.textContent = "Signing in...";
        loginMessage.textContent = "";

        const email = document.getElementById("admin-email").value.trim();
        const password = document.getElementById("admin-password").value;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {

            loginMessage.textContent = error.message;

        } else {

            const success = await authenticateUser(data.user);

            if (!success) {
                document.getElementById("admin-password").value = "";
            }

        }

        loginButton.disabled = false;
        loginButton.textContent = "Sign In";

    });

    logoutButton.addEventListener("click", async () => {

        const { error } = await supabase.auth.signOut();

        if (error) {
            alert("Could not log out: " + error.message);
            return;
        }

        showLogin();
        loginForm.reset();
        loginMessage.textContent = "";

    });


    /* =====================================
       NAVIGATION
    ===================================== */

    const navigationButtons = document.querySelectorAll(
        ".admin-nav-item, .quick-access-item"
    );

    const sections = document.querySelectorAll(".admin-section");

    const breadcrumb = document.getElementById("admin-breadcrumb");

    const sectionNames = {
        dashboard: "DASHBOARD",
        franchises: "FRANCHISES",
        characters: "CHARACTERS",
        locations: "LOCATIONS",
        films: "FILMS",
        series: "SERIES",
        books: "COMICS & BOOKS",
        events: "EVENTS",
        universes: "ALTERNATE UNIVERSES"
    };

    function openSection(sectionName) {

        const targetSection = document.getElementById(
            `section-${sectionName}`
        );

        if (!targetSection) {
            console.error("Section not found:", sectionName);
            return;
        }

        sections.forEach(section => {
            section.classList.remove("active");
            section.hidden = true;
        });

        targetSection.hidden = false;
        targetSection.classList.add("active");

        document.querySelectorAll(".admin-nav-item").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.section === sectionName
            );
        });

        if (breadcrumb) {
            breadcrumb.textContent =
                `ADMIN / ${sectionNames[sectionName]}`;
        }

if (sectionName === "franchises") {
    loadFranchises();
}

if (sectionName === "characters") {
    loadCharacters();
}

if (sectionName === "locations") {
    loadLocations();
}
    }

    navigationButtons.forEach(button => {
        button.addEventListener("click", () => {
            openSection(button.dataset.section);
        });
    });


    /* =====================================
       FRANCHISE MANAGEMENT
    ===================================== */

    async function loadFranchises() {

        const list = document.getElementById("franchise-list");
        const count = document.getElementById("franchise-count");

        list.textContent = "Loading franchises...";
        count.textContent = "LOADING...";

        const { data, error } = await supabase
            .from("franchises")
            .select("*")
            .order("name");

        if (error) {
            console.error("Franchise loading error:", error);

            list.textContent =
                "Could not load franchises: " + error.message;

            count.textContent = "ERROR";
            return;
        }

        count.textContent = `${data.length} RECORDS`;

        if (data.length === 0) {
            list.textContent = "No franchises found.";
            return;
        }

        list.innerHTML = "";

        data.forEach(franchise => {

            const row = document.createElement("div");
            row.className = "admin-franchise-row";

            const information = document.createElement("div");
            information.className = "franchise-information";

            const name = document.createElement("strong");
            name.textContent = franchise.name;

            const details = document.createElement("small");

            details.textContent =
                `${franchise.abbreviation || "NO ABBREVIATION"} · ` +
                `${franchise.owner || "UNKNOWN OWNER"}`;

            information.appendChild(name);
            information.appendChild(details);

            const actions = document.createElement("div");
            actions.className = "franchise-actions";

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.className = "admin-edit-button";

            editButton.addEventListener("click", () => {
                openFranchiseForm(franchise);
            });

            actions.appendChild(editButton);

            row.appendChild(information);
            row.appendChild(actions);

            list.appendChild(row);

        });

        const franchiseStat = document.getElementById("stat-franchises");

        if (franchiseStat) {
            franchiseStat.textContent = data.length;
        }

    }


/* =========================================
   LOCATION MANAGEMENT
========================================= */

let locationsCache = [];

async function loadLocations() {

    const list = document.getElementById("location-list");
    const count = document.getElementById("location-count");

    list.textContent = "Loading locations...";

    const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name");

    if (error) {
        console.error("Location loading error:", error);
        list.textContent = "Could not load locations: " + error.message;
        if (count) count.textContent = "ERROR";
        return;
    }

    locationsCache = data || [];

    if (count) {
        count.textContent = `${locationsCache.length} RECORDS`;
    }

    const locationStat = document.getElementById("stat-locations");

    if (locationStat) {
        locationStat.textContent = locationsCache.length;
    }

    if (locationsCache.length === 0) {
        list.textContent = "No locations found.";
        return;
    }

    list.innerHTML = "";

    locationsCache.forEach(location => {

        const row = document.createElement("div");
        row.className = "admin-franchise-row";

        const information = document.createElement("div");
        information.className = "franchise-information";

        const name = document.createElement("strong");
        name.textContent = location.name;

        const parent = locationsCache.find(
            item => item.id === location.parent_location_id
        );

        const details = document.createElement("small");

        details.textContent =
            `${location.location_type} · ` +
            `${parent ? parent.name : "NO PARENT"} · ` +
            `ID: ${location.id}`;

        information.appendChild(name);
        information.appendChild(details);

        const actions = document.createElement("div");
        actions.className = "franchise-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.className = "admin-edit-button";

        editButton.addEventListener("click", () => {
            openLocationForm(location);
        });

        actions.appendChild(editButton);

        row.appendChild(information);
        row.appendChild(actions);

        list.appendChild(row);

    });

}


/* LOCATION FORM */

function openLocationForm(location = null) {

    const isEditing = location !== null;

    const modal = document.createElement("div");
    modal.className = "admin-modal";

    modal.innerHTML = `
        <div class="admin-modal-content">

            <div class="admin-modal-header">
                <h2>${isEditing ? "Edit Location" : "Add Location"}</h2>
                <button class="admin-close-button" type="button">×</button>
            </div>

            <form id="location-form">

                <label>Name</label>
                <input type="text" name="name" required>

                <label>Location Type</label>
                <select name="location_type" required>
                    <option value="Planet">Planet</option>
                    <option value="Star">Star</option>
                    <option value="Moon">Moon</option>
                    <option value="Country">Country</option>
                    <option value="Region">Region</option>
                    <option value="City">City</option>
                    <option value="District">District</option>
                    <option value="Building">Building</option>
                    <option value="Structure">Structure</option>
                    <option value="Space Station">Space Station</option>
                    <option value="Other">Other</option>
                </select>

                <label>Parent Location</label>
                <select name="parent_location_id">
                    <option value="">No Parent Location</option>
                </select>

                <label>Description</label>
                <textarea name="description" rows="5"></textarea>

                <label>Image URL</label>
                <input type="url" name="image_url" placeholder="https://...">

                <label>Status</label>
                <select name="status">
                    <option value="Active">Active</option>
                    <option value="Destroyed">Destroyed</option>
                    <option value="Abandoned">Abandoned</option>
                    <option value="Unknown">Unknown</option>
                </select>

                <div class="admin-form-actions">

                    ${isEditing ? `
                        <button type="button" class="location-delete-button">
                            Delete
                        </button>
                    ` : ""}

                    <button type="button" class="admin-cancel-button">
                        Cancel
                    </button>

                    <button type="submit" class="admin-save-button">
                        ${isEditing ? "Save Changes" : "Add Location"}
                    </button>

                </div>

            </form>
        </div>
    `;

    document.body.appendChild(modal);

    const form = modal.querySelector("#location-form");
    const parentSelect = form.elements.parent_location_id;

    // Find all descendants to prevent circular parent relationships.
    function getDescendantIds(parentId) {

        const descendants = new Set();

        function findChildren(id) {

            locationsCache
                .filter(item => item.parent_location_id === id)
                .forEach(child => {

                    if (descendants.has(child.id)) return;

                    descendants.add(child.id);
                    findChildren(child.id);

                });
        }

        findChildren(parentId);

        return descendants;
    }

    const excludedIds = isEditing
        ? getDescendantIds(location.id)
        : new Set();

    if (isEditing) {
        excludedIds.add(location.id);
    }

    locationsCache.forEach(item => {

        if (excludedIds.has(item.id)) return;

        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name;

        parentSelect.appendChild(option);

    });

    // Fill existing information.
    if (isEditing) {

        form.elements.name.value = location.name || "";
        form.elements.location_type.value =
            location.location_type || "Other";

        form.elements.parent_location_id.value =
            location.parent_location_id ?? "";

        form.elements.description.value =
            location.description || "";

        form.elements.image_url.value =
            location.image_url || "";

        form.elements.status.value =
            location.status || "Active";
    }

    function closeModal() {
        modal.remove();
    }

    modal.querySelector(".admin-close-button")
        .addEventListener("click", closeModal);

    modal.querySelector(".admin-cancel-button")
        .addEventListener("click", closeModal);


    // DELETE LOCATION
    const deleteButton = modal.querySelector(".location-delete-button");

    if (deleteButton) {

        deleteButton.addEventListener("click", async () => {

            const confirmed = confirm(
                `Are you sure you want to delete ${location.name}?`
            );

            if (!confirmed) return;

            deleteButton.disabled = true;
            deleteButton.textContent = "Deleting...";

            const { error } = await supabase
                .from("locations")
                .delete()
                .eq("id", location.id);

            if (error) {

                console.error("Location deletion error:", error);
                alert("Could not delete location: " + error.message);

                deleteButton.disabled = false;
                deleteButton.textContent = "Delete";

                return;
            }

            closeModal();
            await loadLocations();

        });
    }


    // SAVE LOCATION
    form.addEventListener("submit", async event => {

        event.preventDefault();

        const formData = new FormData(form);

        const parentId = formData.get("parent_location_id");

        const locationData = {

            name: formData.get("name").trim(),

            location_type: formData.get("location_type"),

            parent_location_id: parentId
                ? Number(parentId)
                : null,

            description:
                formData.get("description").trim() || null,

            image_url:
                formData.get("image_url").trim() || null,

            status: formData.get("status")

        };

        const saveButton = form.querySelector(".admin-save-button");

        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        let result;

        if (isEditing) {

            result = await supabase
                .from("locations")
                .update(locationData)
                .eq("id", location.id);

        } else {

            result = await supabase
                .from("locations")
                .insert([locationData]);

        }

        if (result.error) {

            console.error("Location save error:", result.error);

            alert("Could not save location: " + result.error.message);

            saveButton.disabled = false;
            saveButton.textContent = isEditing
                ? "Save Changes"
                : "Add Location";

            return;
        }

        closeModal();
        await loadLocations();

    });

}


/* ADD LOCATION BUTTON */

const addLocationButton = document.getElementById("add-location");

if (addLocationButton) {

    addLocationButton.addEventListener("click", () => {
        openLocationForm();
    });

}


/* =========================================
   CHARACTER MANAGEMENT
========================================= */

/* =========================================
   CHARACTER PAGINATION
========================================= */

let characterPage = 1;
const characterPageSize = 50;
let characterSearch = "";

async function loadCharacters() {

    const list = document.getElementById("character-list");
    const count = document.getElementById("character-count");
    const pagination = document.getElementById("character-pagination");

    list.textContent = "Loading characters...";
    count.textContent = "LOADING...";
    pagination.innerHTML = "";

    // Build the Supabase query
    let query = supabase
        .from("characters")
        .select("*", { count: "exact" });

    // Search by name or alias
    if (characterSearch) {
        const safeSearch = characterSearch.replace(/[,%()\\]/g, " ").trim();

        if (safeSearch) {
            query = query.or(
                `name.ilike.%${safeSearch}%,Alias.ilike.%${safeSearch}%`
            );
        }
    }

    // Alphabetical sorting and pagination
    const from = (characterPage - 1) * characterPageSize;
    const to = from + characterPageSize - 1;

    const { data, error, count: totalCount } = await query
        .order("name", { ascending: true })
        .range(from, to);

    if (error) {
        console.error("Character loading error:", error);
        list.textContent = "Could not load characters: " + error.message;
        count.textContent = "ERROR";
        return;
    }

    count.textContent = `${totalCount} RECORDS`;

    const characterStat = document.getElementById("stat-characters");

    if (characterStat) {
        characterStat.textContent = totalCount;
    }

    // Empty results
    if (!data || data.length === 0) {
        list.textContent = "No characters found.";
        return;
    }

    // Create character cards
    list.innerHTML = "";

    data.forEach(character => {

        const card = document.createElement("div");
        card.className = "character-admin-card";

        const information = document.createElement("div");
        information.className = "franchise-information";

        const name = document.createElement("strong");
        name.textContent = character.name;

        const details = document.createElement("small");
        details.textContent =
            `ID: ${character.id} · ` +
            `${character.species || "UNKNOWN SPECIES"} · ` +
            `${character.Status || "UNKNOWN STATUS"}`;

        information.appendChild(name);
        information.appendChild(details);

        const actions = document.createElement("div");
        actions.className = "franchise-actions";

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "admin-edit-button";

        editButton.addEventListener("click", () => {
            openCharacterForm(character);
        });

        actions.appendChild(editButton);

        card.appendChild(information);
        card.appendChild(actions);

        list.appendChild(card);
    });

    // Create numbered pagination
    const totalPages = Math.ceil(totalCount / characterPageSize);

    if (totalPages > 1) {

        function createPageButton(label, page, disabled = false, active = false) {

            const button = document.createElement("button");

            button.type = "button";
            button.textContent = label;
            button.className = "admin-page-button";

            if (active) {
                button.classList.add("active");
            }

            button.disabled = disabled;

            button.addEventListener("click", () => {
                characterPage = page;
                loadCharacters();
            });

            pagination.appendChild(button);
        }

        // Previous
        createPageButton(
            "Previous",
            characterPage - 1,
            characterPage === 1
        );

        // Numbered pages
        for (let page = 1; page <= totalPages; page++) {
            createPageButton(
                page,
                page,
                false,
                page === characterPage
            );
        }

        // Next
        createPageButton(
            "Next",
            characterPage + 1,
            characterPage === totalPages
        );
    }
}


/* CHARACTER FORM */

function openCharacterForm(character = null) {

    const isEditing = character !== null;

    const modal = document.createElement("div");
    modal.className = "admin-modal";

    modal.innerHTML = `
        <div class="admin-modal-content">

            <div class="admin-modal-header">
                <h2>${isEditing ? "Edit Character" : "Add Character"}</h2>
                <button class="admin-close-button" type="button">×</button>
            </div>

            <form id="character-form">

             <label>ID</label>
             <input
                 type="number"
                 name="id"
                 min="0"
                 step="1"
                 required
                 ${isEditing ? "readonly" : ""}
             >
                <label>Name</label>
                <input type="text" name="name" required>

                <label>Alias</label>
                <input type="text" name="Alias">

                <label>Description</label>
                <textarea name="description" rows="5"></textarea>

                <label>Species</label>
                <input type="text" name="species">

                <label>Image URL</label>
                <input type="url" name="image_url" placeholder="https://...">

                <div class="character-image-preview">
                    <img id="character-preview" alt="Character preview" hidden>
                    <span id="character-preview-placeholder">
                        IMAGE PREVIEW
                    </span>
                </div>

                <label>First Appearance</label>
                <input type="text" name="first_appearence">

                <label>Status</label>
                <input type="text" name="Status" list="character-status-options">

                <datalist id="character-status-options">
                    <option value="Alive">
                    <option value="Deceased">
                    <option value="Unknown">
                    <option value="Missing">
                    <option value="Inactive">
                </datalist>

                <label>Gender</label>
                <input type="text" name="Gender">

                <label>Citizenship</label>
                <input type="text" name="Citizenship">

                <div class="admin-form-actions">

                    ${isEditing ? `
                        <button type="button" class="character-delete-button">
                            Delete
                        </button>
                    ` : ""}

                    <button type="button" class="admin-cancel-button">
                        Cancel
                    </button>

                    <button type="submit" class="admin-save-button">
                        ${isEditing ? "Save Changes" : "Add Character"}
                    </button>

                </div>

            </form>
        </div>
    `;

    document.body.appendChild(modal);

    const form = modal.querySelector("#character-form");

    /* FILL EXISTING DATA */

    if (isEditing) {
      form.elements.id.value = character.id;
        form.elements.name.value = character.name || "";
        form.elements.Alias.value = character.Alias || "";
        form.elements.description.value = character.description || "";
        form.elements.species.value = character.species || "";
        form.elements.image_url.value = character.image_url || "";
        form.elements.first_appearence.value =
            character.first_appearence || "";
        form.elements.Status.value = character.Status || "";
        form.elements.Gender.value = character.Gender || "";
        form.elements.Citizenship.value = character.Citizenship || "";
    }

    /* IMAGE PREVIEW */

    const imageInput = form.elements.image_url;
    const preview = modal.querySelector("#character-preview");
    const placeholder = modal.querySelector(
        "#character-preview-placeholder"
    );

    function updateImagePreview() {

        const url = imageInput.value.trim();

        if (!url) {
            preview.hidden = true;
            preview.removeAttribute("src");
            placeholder.hidden = false;
            return;
        }

        preview.src = url;
        preview.hidden = false;
        placeholder.hidden = true;
    }

    imageInput.addEventListener("input", updateImagePreview);

    preview.addEventListener("error", () => {
        preview.hidden = true;
        placeholder.hidden = false;
        placeholder.textContent = "IMAGE COULD NOT BE LOADED";
    });

    preview.addEventListener("load", () => {
        preview.hidden = false;
        placeholder.hidden = true;
    });

    updateImagePreview();

    /* CLOSE FORM */

    function closeModal() {
        modal.remove();
    }

    modal.querySelector(".admin-close-button")
        .addEventListener("click", closeModal);

    modal.querySelector(".admin-cancel-button")
        .addEventListener("click", closeModal);

    /* DELETE CHARACTER */

    const deleteButton = modal.querySelector(".character-delete-button");

    if (deleteButton) {

        deleteButton.addEventListener("click", async () => {

            const confirmed = confirm(
                `Are you sure you want to delete ${character.name}?`
            );

            if (!confirmed) return;

            deleteButton.disabled = true;
            deleteButton.textContent = "Deleting...";

            const { error } = await supabase
                .from("characters")
                .delete()
                .eq("id", character.id);

            if (error) {
                console.error("Character deletion error:", error);
                alert("Could not delete character: " + error.message);

                deleteButton.disabled = false;
                deleteButton.textContent = "Delete";
                return;
            }

            closeModal();
            await loadCharacters();
        });
    }

    /* SAVE CHARACTER */

    form.addEventListener("submit", async event => {

        event.preventDefault();

        const formData = new FormData(form);

        const characterData = {
             id: Number(formData.get("id")),
             name: formData.get("name").trim(),
             Alias: formData.get("Alias").trim() || null,
            description: formData.get("description").trim() || null,
            species: formData.get("species").trim() || null,
            image_url: formData.get("image_url").trim() || null,
            first_appearence:
                formData.get("first_appearence").trim() || null,
            Status: formData.get("Status").trim() || null,
            Gender: formData.get("Gender").trim() || null,
            Citizenship: formData.get("Citizenship").trim() || null
        };

        const saveButton = form.querySelector(".admin-save-button");

        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        let result;

        if (isEditing) {

            result = await supabase
                .from("characters")
                .update(characterData)
                .eq("id", character.id);

} else {

    characterData.id = Number(formData.get("id"));

    result = await supabase
        .from("characters")
        .insert([characterData]);

}

        if (result.error) {

            console.error("Character save error:", result.error);

            alert("Could not save character: " + result.error.message);

            saveButton.disabled = false;
            saveButton.textContent = isEditing
                ? "Save Changes"
                : "Add Character";

            return;
        }

        closeModal();
        await loadCharacters();

    });
}

    /* =====================================
       FRANCHISE FORM
    ===================================== */

    function openFranchiseForm(franchise = null) {

        const isEditing = franchise !== null;

        const modal = document.createElement("div");
        modal.className = "admin-modal";

        modal.innerHTML = `
            <div class="admin-modal-content">

                <div class="admin-modal-header">
                    <h2>${isEditing ? "Edit Franchise" : "Add Franchise"}</h2>
                    <button class="admin-close-button" type="button">
                        ×
                    </button>
                </div>

                <form id="franchise-form">

                    <label>Name</label>
                    <input type="text" name="name" required>

                    <label>Abbreviation</label>
                    <input type="text" name="abbreviation">

                    <label>Owner</label>
                    <input type="text" name="owner">

                    <label>Description</label>
                    <textarea name="description" rows="5"></textarea>

                    <label>Medium (comma-separated)</label>
                    <input type="text" name="medium">

                    <div class="admin-form-actions">
                        <button type="button" class="admin-cancel-button">
                            Cancel
                        </button>

                        <button type="submit" class="admin-save-button">
                            ${isEditing ? "Save Changes" : "Add Franchise"}
                        </button>
                    </div>

                </form>

            </div>
        `;

        document.body.appendChild(modal);

        const form = modal.querySelector("#franchise-form");

        if (isEditing) {

            form.elements.name.value = franchise.name || "";
            form.elements.abbreviation.value = franchise.abbreviation || "";
            form.elements.owner.value = franchise.owner || "";
            form.elements.description.value = franchise.description || "";

            form.elements.medium.value =
                (franchise.medium || []).join(", ");

        }

        function closeModal() {
            modal.remove();
        }

        modal.querySelector(".admin-close-button")
            .addEventListener("click", closeModal);

        modal.querySelector(".admin-cancel-button")
            .addEventListener("click", closeModal);

        form.addEventListener("submit", async event => {

            event.preventDefault();

            const formData = new FormData(form);

            const franchiseData = {
                name: formData.get("name").trim(),
                abbreviation: formData.get("abbreviation").trim() || null,
                owner: formData.get("owner").trim() || null,
                description: formData.get("description").trim() || null,
                medium: formData.get("medium")
                    .split(",")
                    .map(item => item.trim())
                    .filter(Boolean)
            };

            const saveButton = form.querySelector(".admin-save-button");

            saveButton.disabled = true;
            saveButton.textContent = "Saving...";

            let result;

            if (isEditing) {

                result = await supabase
                    .from("franchises")
                    .update(franchiseData)
                    .eq("id", franchise.id);

            } else {

                result = await supabase
                    .from("franchises")
                    .insert([franchiseData]);

            }

            if (result.error) {

                console.error("Franchise save error:", result.error);

                alert("Could not save franchise: " + result.error.message);

                saveButton.disabled = false;
                saveButton.textContent = isEditing
                    ? "Save Changes"
                    : "Add Franchise";

                return;
            }

            closeModal();
            await loadFranchises();

        });

    }


    /* =====================================
       ADD FRANCHISE BUTTON
    ===================================== */

    const addFranchiseButton =
        document.getElementById("add-franchise");

    if (addFranchiseButton) {
        addFranchiseButton.addEventListener("click", () => {
            openFranchiseForm();
        });
    }

   /* ADD CHARACTER BUTTON */

const addCharacterButton =
    document.getElementById("add-character");

if (addCharacterButton) {
    addCharacterButton.addEventListener("click", () => {
        openCharacterForm();
    });
}

   /* CHARACTER SEARCH */

const characterSearchInput =
    document.getElementById("character-search");

if (characterSearchInput) {

    characterSearchInput.addEventListener("input", () => {

        characterSearch = characterSearchInput.value.trim();
        characterPage = 1;

        loadCharacters();

    });

}
    /* =====================================
       INITIALIZATION
    ===================================== */

    window.openAdminSection = openSection;

    showLogin();

    const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

    if (sessionError) {
        console.error("Session error:", sessionError);
        loginMessage.textContent = "Could not verify your session.";
        return;
    }

    if (sessionData.session) {
        await authenticateUser(sessionData.session.user);
    }

});
