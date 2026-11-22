
/* =========================================
   NEXUS - INTELLIGENCE CONTROLLER
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const supabaseClient = window.supabaseClient;

    const elements = {
        views: document.querySelectorAll(".nexus-view"),
        navLinks: document.querySelectorAll(".nav-link[data-view]"),
        breadcrumb: document.getElementById("breadcrumb"),

        coreStatus: document.getElementById("core-status-text"),
        sidebarStatus: document.getElementById("sidebar-status"),
        sidebarStatusText: document.getElementById("sidebar-status-text"),

        connectionLabel: document.getElementById("connection-label"),
        databaseStatus: document.getElementById("database-status"),
        settingsDB: document.getElementById("settings-db"),

        chatForm: document.getElementById("chat-form"),
        chatInput: document.getElementById("chat-input"),
        chatMessages: document.getElementById("chat-messages"),

        overviewActivity: document.getElementById("overview-activity"),
        fullActivity: document.getElementById("full-activity")
    };


    /* =====================================
       SYSTEM STATE
    ===================================== */

    const state = {
        database: "CHECKING",
        ai: "OFFLINE",
        activities: []
    };


    /* =====================================
       ACTIVITY LOGGER
    ===================================== */

    function logActivity(title, description) {

        const activity = {
            title,
            description,
            time: new Date()
        };

        state.activities.unshift(activity);

        // Keep the current session manageable.
        state.activities = state.activities.slice(0, 50);

        renderActivities();

        console.info("[NEXUS]", title, description);
    }


    function renderActivities() {

        const containers = [
            elements.overviewActivity,
            elements.fullActivity
        ];

        containers.forEach(container => {

            if (!container) return;

            container.replaceChildren();

            if (state.activities.length === 0) {

                const empty = document.createElement("div");
                empty.className = "empty-state";
                empty.textContent = "No activity recorded yet.";

                container.appendChild(empty);
                return;
            }

            state.activities.forEach(activity => {

                const item = document.createElement("div");
                item.className = "activity-item";

                const marker = document.createElement("div");
                marker.className = "activity-marker";

                const content = document.createElement("div");

                const title = document.createElement("strong");
                title.textContent = activity.title;

                const description = document.createElement("p");
                description.textContent = activity.description;

                const time = document.createElement("time");
                time.textContent = activity.time.toLocaleTimeString();

                content.append(title, description, time);
                item.append(marker, content);

                container.appendChild(item);

            });

        });

    }


    /* =====================================
       NAVIGATION
    ===================================== */

    function openView(viewName) {

        const target = document.getElementById("view-" + viewName);

        if (!target) return;

        elements.views.forEach(view => {
            view.classList.remove("active");
        });

        target.classList.add("active");

        elements.navLinks.forEach(link => {

            link.classList.toggle(
                "active",
                link.dataset.view === viewName
            );

        });

        if (elements.breadcrumb) {
            elements.breadcrumb.textContent =
                viewName.replace("-", " ").toUpperCase();
        }

        // Update the URL hash without reloading.
        history.replaceState(null, "", "#" + viewName);

    }


    elements.navLinks.forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();

            openView(link.dataset.view);

        });

    });


    document.querySelectorAll("[data-open]").forEach(button => {

        button.addEventListener("click", () => {

            openView(button.dataset.open);

        });

    });


    // Support direct links to individual sections.
    const initialView = location.hash.replace("#", "");

    const validViews = [
        "overview",
        "assistant",
        "research",
        "data-engine",
        "analytics",
        "activity",
        "settings"
    ];

    if (validViews.includes(initialView)) {
        openView(initialView);
    }


    /* =====================================
       DATABASE CONNECTION
    ===================================== */

    async function checkDatabase() {

        logActivity(
            "Database connection",
            "Testing Supabase connectivity."
        );

        if (!supabaseClient) {

            setDatabaseStatus(false);

            logActivity(
                "Database unavailable",
                "Supabase client was not initialised."
            );

            return;
        }

        try {

            // Read-only connection test against an existing table.
            const { error } = await supabaseClient
                .from("franchises")
                .select("*", {
                    head: true,
                    count: "exact"
                });

            if (error) {
                throw error;
            }

            setDatabaseStatus(true);

            logActivity(
                "Database connected",
                "Supabase responded successfully."
            );

        } catch (error) {

            console.error("[NEXUS] Database error:", error);

            setDatabaseStatus(false);

            logActivity(
                "Database connection failed",
                error.message || "Unknown database error."
            );

        }

    }


    function setDatabaseStatus(connected) {

        state.database = connected ? "ONLINE" : "OFFLINE";

        if (elements.databaseStatus) {
            elements.databaseStatus.textContent = state.database;
            elements.databaseStatus.className =
                "status-value " + (connected ? "online" : "offline");
        }

        if (elements.settingsDB) {
            elements.settingsDB.textContent = state.database;
        }

        if (elements.connectionLabel) {
            elements.connectionLabel.textContent =
                connected ? "DATABASE CONNECTED" : "DATABASE OFFLINE";
        }

        if (elements.sidebarStatus) {
            elements.sidebarStatus.className =
                "status-dot " + (connected ? "online" : "offline");
        }

        if (elements.sidebarStatusText) {
            elements.sidebarStatusText.textContent =
                connected ? "DATABASE ONLINE" : "DATABASE OFFLINE";
        }

        if (elements.coreStatus) {
            elements.coreStatus.textContent =
                "AI CORE OFFLINE";
        }

    }


    /* =====================================
       CHAT INTERFACE
    ===================================== */

    function addMessage(sender, message) {

        const wrapper = document.createElement("div");

        wrapper.className =
            "message " +
            (sender === "USER" ? "user-message" : "nexus-message");

        const avatar = document.createElement("div");
        avatar.className = "message-avatar";
        avatar.textContent = sender === "USER" ? "U" : "N";

        const content = document.createElement("div");
        content.className = "message-content";

        const name = document.createElement("strong");
        name.textContent = sender === "USER" ? "YOU" : "NEXUS";

        const text = document.createElement("p");
        text.textContent = message;

        const time = document.createElement("span");
        time.className = "message-time";
        time.textContent = new Date().toLocaleTimeString();

        content.append(name, text, time);
        wrapper.append(avatar, content);

        elements.chatMessages.appendChild(wrapper);

        elements.chatMessages.scrollTop =
            elements.chatMessages.scrollHeight;

    }


    function handleCommand(command) {

        const normalized = command.trim().toLowerCase();

        if (!normalized) return;

        addMessage("USER", command);

        if (normalized === "help") {

            addMessage(
                "NEXUS",
                "Available local commands:\n\n" +
                "help - Display available commands\n" +
                "status - Display system connectivity\n" +
                "clear - Clear the conversation\n\n" +
                "The AI reasoning engine has not yet been connected."
            );

            return;
        }


        if (normalized === "status") {

            addMessage(
                "NEXUS",
                "SYSTEM STATUS\n\n" +
                "Interface: Operational\n" +
                "Supabase: " + state.database + "\n" +
                "AI Core: " + state.ai + "\n" +
                "Task Engine: Not configured\n\n" +
                "The command centre is operational. " +
                "AI reasoning and autonomous operations are pending integration."
            );

            return;
        }


        if (normalized === "clear") {

            elements.chatMessages.replaceChildren();

            addMessage(
                "NEXUS",
                "Conversation cleared. The intelligence interface is ready."
            );

            logActivity(
                "Conversation cleared",
                "The chat history was cleared for this session."
            );

            return;
        }


        addMessage(
            "NEXUS",
            "I have received your request, but my AI reasoning engine " +
            "is not connected yet.\n\n" +
            "Your command has not been executed. " +
            "AI backend integration is the next development phase."
        );

        logActivity(
            "Command received",
            "Received command: " + command
        );

    }


    if (elements.chatForm) {

        elements.chatForm.addEventListener("submit", event => {

            event.preventDefault();

            const command = elements.chatInput.value.trim();

            if (!command) return;

            elements.chatInput.value = "";

            handleCommand(command);

        });

    }


    /* =====================================
       INITIALISATION
    ===================================== */

    logActivity(
        "NEXUS initialised",
        "Command centre interface loaded."
    );

    checkDatabase();

});
