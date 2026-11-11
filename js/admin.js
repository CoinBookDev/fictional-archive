
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
   CHARACTER MANAGEMENT
========================================= */

async function loadCharacters() {

    const list = document.getElementById("character-list");
    const count = document.getElementById("character-count");

    list.textContent = "Loading characters...";
    count.textContent = "LOADING...";

    const { data, error } = await supabase
        .from("characters")
        .select("*")
        .order("name");

    if (error) {
        console.error("Character loading error:", error);
        list.textContent = "Could not load characters: " + error.message;
        count.textContent = "ERROR";
        return;
    }

    count.textContent = `${data.length} RECORDS`;

    if (data.length === 0) {
        list.textContent = "No characters found.";
        return;
    }

    list.innerHTML = "";

    data.forEach(character => {

        const row = document.createElement("div");
        row.className = "admin-franchise-row";

        const information = document.createElement("div");
        information.className = "franchise-information";

        const name = document.createElement("strong");
        name.textContent = character.name;

        const details = document.createElement("small");
        details.textContent =
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
        row.appendChild(information);
        row.appendChild(actions);
        list.appendChild(row);
    });

    const characterStat = document.getElementById("stat-characters");

    if (characterStat) {
        characterStat.textContent = data.length;
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
