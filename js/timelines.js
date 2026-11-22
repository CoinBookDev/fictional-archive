
/* =========================================
   FICTIONAL ARCHIVE
   SUPABASE TIMELINE ENGINE
========================================= */


/* =========================================
   CONFIGURATION
========================================= */

const CURRENT_TIMELINE = "mcu";

let timelineData = [];
let currentTimeline = null;


/* =========================================
   ELEMENTS
========================================= */

const timelineEvents = document.getElementById("timelineEvents");
const timelineViewport = document.getElementById("timelineViewport");
const timelineCanvas = document.getElementById("timelineCanvas");
const timelineCount = document.getElementById("timelineCount");

const intelligencePanel =
    document.getElementById("intelligencePanel");

const panelOverlay =
    document.getElementById("panelOverlay");

const panelContent =
    document.getElementById("panelContent");

const closePanelButton =
    document.getElementById("closePanel");

const zoomLabel =
    document.getElementById("zoomLabel");


/* =========================================
   STATE
========================================= */

let currentOrder = "chronological";
let currentFilter = "all";
let currentZoom = 1;
let selectedEvent = null;


/* =========================================
   DATABASE CONNECTION
========================================= */

async function loadTimeline() {

    if (!window.supabaseClient) {
        showError("Supabase client could not be found. Check your script loading order.");
        return;
    }

    showLoading();

    try {

        // Find the selected timeline
        const { data: timeline, error: timelineError } =
            await window.supabaseClient
                .from("timelines")
                .select("*")
                .eq("slug", CURRENT_TIMELINE)
                .eq("status", "published")
                .single();

        if (timelineError) throw timelineError;

        currentTimeline = timeline;

        // Retrieve its published events
        const { data: events, error: eventsError } =
            await window.supabaseClient
                .from("timeline_events")
                .select("*")
                .eq("timeline_id", timeline.id)
                .eq("status", "published");

        if (eventsError) throw eventsError;

        // Convert database records into timeline objects
        timelineData = events.map(event => {

            const releaseYear = event.release_date
                ? Number(event.release_date.substring(0, 4))
                : null;

            return {
                id: String(event.id),
                title: event.title,
                type: event.event_type,

                year: Number(event.chronology_sort),

                chronologyLabel:
                    event.chronology_label || null,

                releaseYear: releaseYear,

                releaseDate: event.release_date,

                franchise: event.franchise_id
                    ? `FRANCHISE #${event.franchise_id}`
                    : "UNASSIGNED",

                description: event.description || "No description available.",

                imageUrl: event.image_url || null
            };

        });

        renderTimeline();

    } catch (error) {

        console.error("Timeline loading error:", error);

        showError(
            "Unable to load timeline data. Check your Supabase connection and database permissions."
        );

    }

}


/* =========================================
   LOADING AND ERROR STATES
========================================= */

function showLoading() {

    timelineEvents.innerHTML = "";

    const message = document.createElement("div");

    message.className = "timeline-message";
    message.textContent = "ACCESSING ARCHIVE DATABASE...";

    timelineEvents.appendChild(message);

    timelineCount.textContent = "LOADING";

}


function showError(message) {

    timelineEvents.innerHTML = "";

    const error = document.createElement("div");

    error.className = "timeline-message";
    error.textContent = message;

    timelineEvents.appendChild(error);

    timelineCount.textContent = "DATABASE ERROR";

}


/* =========================================
   SORTING
========================================= */

function getSortedEvents() {

    const events = [...timelineData];

    if (currentOrder === "chronological") {

        events.sort((a, b) =>
            a.year - b.year ||
            a.title.localeCompare(b.title)
        );

    } else {

        events.sort((a, b) => {

            if (a.releaseDate === null) return 1;
            if (b.releaseDate === null) return -1;

            return a.releaseDate.localeCompare(b.releaseDate);

        });

    }

    return events;

}


/* =========================================
   FILTERING
========================================= */

function getFilteredEvents() {

    const events = getSortedEvents();

    if (currentFilter === "all") {
        return events;
    }

    return events.filter(event =>
        event.type === currentFilter
    );

}


/* =========================================
   DATE FORMATTING
========================================= */

function formatYear(event) {

    if (currentOrder === "release") {

        return event.releaseYear
            ? String(event.releaseYear)
            : "UNKNOWN RELEASE DATE";

    }

    return event.chronologyLabel ||
        `${Math.floor(event.year)} CE`;

}


/* =========================================
   CREATE TIMELINE NODE
========================================= */

function createTimelineEvent(event, index) {

    const position = index % 2 === 0
        ? "above"
        : "below";

    const element = document.createElement("article");

    element.className = `timeline-event ${position}`;
    element.dataset.id = event.id;

    let typeLabel = "FEATURE FILM";

    if (event.type === "series") {
        typeLabel = "TELEVISION SERIES";
    }

    if (event.type === "event") {
        typeLabel = "MAJOR EVENT";
    }

    const nodeClass =
        event.type === "series"
            ? "series-node"
            : event.type === "event"
                ? "event-node-major"
                : "";

    element.innerHTML = `
        <div class="event-connector"></div>

        <div class="event-node ${nodeClass}"></div>

        <button class="event-card event-type-${event.type}"
                type="button">

            <div class="event-type"></div>

            <h3></h3>

            <div class="event-date"></div>

            <div class="event-franchise"></div>

        </button>

        <div class="event-year"></div>
    `;

    // Insert database values safely
    element.querySelector(".event-type").textContent = typeLabel;
    element.querySelector("h3").textContent = event.title;

    element.querySelector(".event-date").textContent =
        formatYear(event);

    element.querySelector(".event-franchise").textContent =
        event.franchise;

    element.querySelector(".event-year").textContent =
        formatYear(event);

    element.querySelector(".event-card").addEventListener(
        "click",
        () => openEvent(event.id)
    );

    return element;

}


/* =========================================
   RENDER TIMELINE
========================================= */

function renderTimeline() {

    const events = getFilteredEvents();

    timelineEvents.innerHTML = "";

    if (events.length === 0) {

        const message = document.createElement("div");

        message.className = "timeline-message";
        message.textContent = "NO RECORDS FOUND";

        timelineEvents.appendChild(message);

    }

    events.forEach((event, index) => {

        const element = createTimelineEvent(event, index);

        timelineEvents.appendChild(element);

    });

    timelineCount.textContent =
        `${events.length} RECORDS`;

    if (selectedEvent &&
        !events.some(event => event.id === selectedEvent)) {

        closePanel();

    }

    if (selectedEvent) {

        const selectedNode = document.querySelector(
            `.timeline-event[data-id="${selectedEvent}"]`
        );

        if (selectedNode) {
            selectedNode.classList.add("selected");
        }

    }

}


/* =========================================
   OPEN INTELLIGENCE PANEL
========================================= */

function openEvent(id) {

    const event = timelineData.find(
        item => item.id === String(id)
    );

    if (!event) return;

    selectedEvent = event.id;

    document.querySelectorAll(".timeline-event").forEach(node => {
        node.classList.remove("selected");
    });

    const selectedNode = document.querySelector(
        `.timeline-event[data-id="${event.id}"]`
    );

    if (selectedNode) {
        selectedNode.classList.add("selected");
    }

    const typeLabels = {
        film: "FEATURE FILM",
        series: "TELEVISION SERIES",
        event: "MAJOR HISTORICAL EVENT"
    };

    panelContent.innerHTML = `
        <div class="panel-category"></div>

        <h2 class="panel-title"></h2>

        <div class="panel-date"></div>

        <hr class="panel-divider">

        <div class="panel-section-label">
            HISTORICAL OVERVIEW
        </div>

        <p class="panel-description"></p>

        <div class="panel-meta">

            <div class="panel-meta-item">
                <span>ARCHIVE ID</span>
                <strong class="meta-id"></strong>
            </div>

            <div class="panel-meta-item">
                <span>FRANCHISE</span>
                <strong class="meta-franchise"></strong>
            </div>

            <div class="panel-meta-item">
                <span>CHRONOLOGICAL DATE</span>
                <strong class="meta-chronology"></strong>
            </div>

            <div class="panel-meta-item">
                <span>RELEASE YEAR</span>
                <strong class="meta-release"></strong>
            </div>

        </div>

        <hr class="panel-divider">

        <div class="panel-section-label">
            DATABASE RELATIONSHIPS
        </div>

        <p class="panel-description">
            Additional character, location and event relationships
            will become available as the archive database expands.
        </p>
    `;

    panelContent.querySelector(".panel-category").textContent =
        typeLabels[event.type] || "ARCHIVE RECORD";

    panelContent.querySelector(".panel-title").textContent =
        event.title;

    panelContent.querySelector(".panel-date").textContent =
        formatYear(event);

    panelContent.querySelector(".panel-description").textContent =
        event.description;

    panelContent.querySelector(".meta-id").textContent =
        event.id.toUpperCase();

    panelContent.querySelector(".meta-franchise").textContent =
        event.franchise;

    panelContent.querySelector(".meta-chronology").textContent =
        event.chronologyLabel || `${Math.floor(event.year)} CE`;

    panelContent.querySelector(".meta-release").textContent =
        event.releaseYear || "UNKNOWN";

    intelligencePanel.classList.add("open");
    panelOverlay.classList.add("open");

}


/* =========================================
   CLOSE PANEL
========================================= */

function closePanel() {

    intelligencePanel.classList.remove("open");
    panelOverlay.classList.remove("open");

    document.querySelectorAll(".timeline-event").forEach(node => {
        node.classList.remove("selected");
    });

    selectedEvent = null;

}


closePanelButton.addEventListener("click", closePanel);

panelOverlay.addEventListener("click", closePanel);

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closePanel();
    }

});


/* =========================================
   ORDER SWITCH
========================================= */

document.querySelectorAll(".view-button").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".view-button").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        currentOrder = button.dataset.order;

        closePanel();

        renderTimeline();

        timelineViewport.scrollLeft = 0;

    });

});


/* =========================================
   FILTER SWITCH
========================================= */

document.querySelectorAll(".filter-button").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".filter-button").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        closePanel();

        renderTimeline();

        timelineViewport.scrollLeft = 0;

    });

});


/* =========================================
   ZOOM SYSTEM
========================================= */

function updateZoom() {

    timelineCanvas.style.transform =
        `scale(${currentZoom})`;

    zoomLabel.textContent =
        `${Math.round(currentZoom * 100)}%`;

}


document.getElementById("zoomIn").addEventListener("click", () => {

    currentZoom = Math.min(1.5, currentZoom + 0.1);

    updateZoom();

});


document.getElementById("zoomOut").addEventListener("click", () => {

    currentZoom = Math.max(0.7, currentZoom - 0.1);

    updateZoom();

});


/* =========================================
   INITIALISE
========================================= */
loadTimeline();
updateZoom();
