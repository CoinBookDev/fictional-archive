
/* =========================================
   NEXUS - INTELLIGENCE CONTROLLER
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

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
        fullActivity: document.getElementById("full-activity"),

        chatStatus: document.querySelector(".chat-status"),
        chatDisclaimer: document.querySelector(".chat-disclaimer"),
        aiStatus: document.getElementById("ai-status"),
        settingsAI: document.getElementById("settings-ai")
    };


    /* =====================================
       SYSTEM STATE
    ===================================== */

    const state = {
        database: "CHECKING",
        ai: "OFFLINE",
        authenticated: false,
        sending: false,
        messages: []
    };

    let currentUser = null;


    /* =====================================
       ACTIVITY LOGGER
    ===================================== */

    function logActivity(title, description) {

        const activity = {
            title,
            description,
            time: new Date()
        };

        state.activities = state.activities || [];
        state.activities.unshift(activity);
        state.activities = state.activities.slice(0, 50);

        renderActivities();

        console.info("[NEXUS]", title, description);
    }


    function renderActivities() {

        [
            elements.overviewActivity,
            elements.fullActivity
        ].forEach(container => {

            if (!container) return;

            container.replaceChildren();

            if (!state.activities || state.activities.length === 0) {

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
       STATUS MANAGEMENT
    ===================================== */

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

        updateCoreStatus();
    }


    function setAIStatus(status) {

        state.ai = status;

        if (elements.chatStatus) {
            elements.chatStatus.textContent =
                status === "ONLINE" ? "CORE ONLINE" :
                status === "CONNECTING" ? "CONNECTING" :
                status === "ERROR" ? "CORE ERROR" : "CORE OFFLINE";
        }

        if (elements.aiStatus) {
            elements.aiStatus.textContent = status;
            elements.aiStatus.className =
                "status-value " +
                (status === "ONLINE" ? "online" : "offline");
        }

        if (elements.settingsAI) {
            elements.settingsAI.textContent = status;
        }

        updateCoreStatus();
    }


    function updateCoreStatus() {

        if (!elements.coreStatus) return;

        if (!state.authenticated) {
            elements.coreStatus.textContent = "ACCESS DENIED";
        } else if (state.database !== "ONLINE") {
            elements.coreStatus.textContent = "DATABASE OFFLINE";
        } else if (state.ai === "ONLINE") {
            elements.coreStatus.textContent = "OPERATIONAL";
        } else if (state.ai === "CONNECTING") {
            elements.coreStatus.textContent = "CONNECTING";
        } else {
            elements.coreStatus.textContent = "AWAITING REQUEST";
        }

        if (elements.sidebarStatusText) {
            elements.sidebarStatusText.textContent =
                state.authenticated ? "NEXUS AUTHORISED" : "ACCESS DENIED";
        }
    }


    /* =====================================
       CHAT MESSAGE DISPLAY
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
        text.style.whiteSpace = "pre-wrap";

        const time = document.createElement("span");
        time.className = "message-time";
        time.textContent = new Date().toLocaleTimeString();

        content.append(name, text, time);
        wrapper.append(avatar, content);

        elements.chatMessages.appendChild(wrapper);

        elements.chatMessages.scrollTop =
            elements.chatMessages.scrollHeight;
    }


    function showAccessDenied(message) {

        state.authenticated = false;

        if (elements.chatForm) {
            elements.chatForm.style.display = "none";
        }

        addMessage("NEXUS", message);

        updateCoreStatus();
        setAIStatus("OFFLINE");

        logActivity("Access denied", message);
    }


    /* =====================================
       AUTHENTICATION
    ===================================== */

    async function verifyAccess() {

        if (!supabaseClient) {
            showAccessDenied(
                "Supabase could not be initialised. " +
                "NEXUS cannot verify your identity."
            );
            return false;
        }

        try {

            const {
                data: sessionData,
                error: sessionError
            } = await supabaseClient.auth.getSession();

            if (sessionError) throw sessionError;

            const session = sessionData.session;

            if (!session) {
                showAccessDenied(
                    "No active administrator session was found.\n\n" +
                    "Please log in through Fictional Archive Admin first, " +
                    "then open NEXUS again."
                );
                return false;
            }

            const {
                data: userData,
                error: userError
            } = await supabaseClient.auth.getUser();

            if (userError || !userData.user) {
                throw userError || new Error("User verification failed.");
            }

            currentUser = userData.user;

            const {
                data: admin,
                error: adminError
            } = await supabaseClient
                .from("admin_users")
                .select("user_id")
                .eq("user_id", currentUser.id)
                .maybeSingle();

            if (adminError) throw adminError;

            if (!admin) {
                showAccessDenied(
                    "Your account is authenticated, but it does not " +
                    "have administrator permissions for Fictional Archive."
                );
                return false;
            }

            state.authenticated = true;

            logActivity(
                "Administrator authenticated",
                "NEXUS access granted to " + currentUser.email
            );

            return true;

        } catch (error) {

            console.error("[NEXUS] Authentication error:", error);

            showAccessDenied(
                "NEXUS could not verify administrator access.\n\n" +
                (error.message || "Unknown authentication error.")
            );

            return false;
        }
    }


    /* =====================================
       DATABASE CONNECTION
    ===================================== */

    async function checkDatabase() {

        try {

            const { error } = await supabaseClient
                .from("franchises")
                .select("*", {
                    head: true,
                    count: "exact"
                });

            if (error) throw error;

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


    /* =====================================
       GEMINI / EDGE FUNCTION CONNECTION
    ===================================== */

    async function sendToNexus(message) {

        if (!state.authenticated || !currentUser) {
            addMessage(
                "NEXUS",
                "Access denied. An administrator session is required."
            );
            return;
        }

        if (state.sending) return;

        state.sending = true;
        setAIStatus("CONNECTING");

        if (elements.chatInput) {
            elements.chatInput.disabled = true;
        }

        const sendButton = elements.chatForm?.querySelector("button");

        if (sendButton) sendButton.disabled = true;

        state.messages.push({
            role: "user",
            content: message
        });

        try {

            const {
                data,
                error
            } = await supabaseClient.functions.invoke(
                "nexus-assistent",
                {
                    body: {
                        messages: state.messages.slice(-12)
                    }
                }
            );

            if (error) {

                let details = error.message || "Edge Function request failed.";

                if (error.context) {
                    try {
                        const responseBody = await error.context.json();
                        if (responseBody.error) details = responseBody.error;
                    } catch {
                        // Keep the original error message.
                    }
                }

                throw new Error(details);
            }

            if (!data || !data.reply) {
                throw new Error("NEXUS returned an empty response.");
            }

            state.messages.push({
                role: "assistant",
                content: data.reply
            });

            // Keep conversation history within the backend limit.
            state.messages = state.messages.slice(-12);

            addMessage("NEXUS", data.reply);

            setAIStatus("ONLINE");

            logActivity(
                "Intelligence response generated",
                "Gemini processed a conversation request."
            );

        } catch (error) {

            console.error("[NEXUS] AI request failed:", error);

            // Remove the failed message from the conversation history.
            state.messages.pop();

            setAIStatus("ERROR");

            addMessage(
                "NEXUS",
                "I could not process that request.\n\n" +
                "Technical details: " + error.message
            );

            logActivity(
                "AI request failed",
                error.message
            );

        } finally {

            state.sending = false;

            if (elements.chatInput) {
                elements.chatInput.disabled = false;
                elements.chatInput.focus();
            }

            if (sendButton) sendButton.disabled = false;
        }
    }


    /* =====================================
       LOCAL COMMANDS
    ===================================== */

    function handleCommand(command) {

        const normalized = command.trim().toLowerCase();

        if (!normalized) return;

        addMessage("USER", command);

        if (normalized === "help") {

            addMessage(
                "NEXUS",
                "Available commands:\n\n" +
                "help - Display available commands\n" +
                "status - Display system connectivity\n" +
                "clear - Clear the conversation\n\n" +
                "You can also communicate with the NEXUS intelligence core directly."
            );

            return;
        }

        if (normalized === "status") {

            addMessage(
                "NEXUS",
                "SYSTEM STATUS\n\n" +
                "Authentication: " + (state.authenticated ? "VERIFIED" : "DENIED") + "\n" +
                "Database: " + state.database + "\n" +
                "AI Core: " + state.ai + "\n" +
                "Task Engine: NOT CONFIGURED"
            );

            return;
        }

        if (normalized === "clear") {

            state.messages = [];
            elements.chatMessages.replaceChildren();

            addMessage(
                "NEXUS",
                "Conversation cleared. Intelligence interface ready."
            );

            logActivity(
                "Conversation cleared",
                "The conversation history was cleared."
            );

            return;
        }

        sendToNexus(command);
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


    const validViews = [
        "overview",
        "assistant",
        "research",
        "data-engine",
        "analytics",
        "activity",
        "settings"
    ];

    const initialView = location.hash.replace("#", "");

    if (validViews.includes(initialView)) {
        openView(initialView);
    }


    /* =====================================
       CHAT FORM
    ===================================== */

    if (elements.chatForm) {

        elements.chatForm.addEventListener("submit", event => {

            event.preventDefault();

            const command = elements.chatInput.value.trim();

            if (!command || state.sending) return;

            elements.chatInput.value = "";

            handleCommand(command);

        });

    }


    /* =====================================
       INITIALISATION
    ===================================== */

    logActivity(
        "NEXUS initialising",
        "Checking authentication and system connections."
    );

    const authorised = await verifyAccess();

    if (!authorised) return;

    await checkDatabase();

    if (elements.chatMessages) {
        elements.chatMessages.replaceChildren();
    }

    addMessage(
        "NEXUS",
        "Welcome back. Administrator access verified.\n\n" +
        "NEXUS is connected to the intelligence backend. " +
        "I am ready to assist with Fictional Archive."
    );

    if (elements.chatForm) {
        elements.chatForm.style.display = "";
    }

    setAIStatus("OFFLINE");

    if (elements.chatDisclaimer) {
        elements.chatDisclaimer.textContent =
            "NEXUS INTELLIGENCE BACKEND / GEMINI";
    }

    logActivity(
        "NEXUS ready",
        "Administrator verified. Intelligence interface initialised."
    );

});
