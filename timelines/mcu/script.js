
/* =========================================
   FICTIONAL ARCHIVE
   MCU TIMELINE ENGINE
========================================= */


/* =========================================
   CONFIGURATION
========================================= */

const CURRENT_TIMELINE = "mcu";

let timelineData = [];
let currentTimeline = null;

let currentOrder = "chronological";
let currentFilter = "all";
let currentZoom = 1;
let selectedEvent = null;


/* =========================================
   ELEMENTS
========================================= */

const timelineEvents = document.getElementById("timelineEvents");
const timelineViewport = document.getElementById("timelineViewport");
const timelineCanvas = document.getElementById("timelineCanvas");
const timelineCount = document.getElementById("timelineCount");

const intelligencePanel = document.getElementById("intelligencePanel");
const panelOverlay = document.getElementById("panelOverlay");
const panelContent = document.getElementById("panelContent");

const databaseStatus = document.getElementById("databaseStatus");
const zoomLabel = document.getElementById("zoomLabel");


/* =========================================
   LOAD DATABASE
========================================= */

async function loadTimeline() {

    showLoading();

    try {

        const result = await TimelineEngine.load(CURRENT_TIMELINE);

        currentTimeline = result.timeline;
        timelineData = result.events;

        databaseStatus.textContent = "CONNECTED";

        document.getElementById("timelineDescription").textContent =
            currentTimeline.description || "Explore the history of the MCU.";

        renderTimeline();

    } catch (error) {

        console.error("MCU timeline error:", error);

        databaseStatus.textContent = "ERROR";

        showError("Unable to retrieve MCU timeline data.");

    }

}


/* =========================================
   LOADING STATES
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

    const element = document.createElement("div");

    element.className = "timeline-message";
    element.textContent = message;

    timelineEvents.appendChild(element);

    timelineCount.textContent = "DATABASE ERROR";

}


/* =========================================
   SORTING
========================================= */

function getSortedEvents() {

    if (currentOrder === "release") {

        return TimelineEngine.sortByRelease(timelineData);

    }

    return TimelineEngine.sortChronologically(timelineData);

}


/* =========================================
   FILTERING
========================================= */

function getFilteredEvents() {

    const events = getSortedEvents();

    if (currentFilter === "all") return events;

    return events.filter(event =>
        event.type === currentFilter
    );

}


/* =========================================
   DATE FORMATTING
========================================= */

function formatYear(event) {

    if (currentOrder === "release") {

        return event.releaseDate || "UNKNOWN RELEASE DATE";

    }

    return event.chronologyLabel ||
        (event.chronologySort !== null
            ? `${event.chronologySort} CE`
            : "UNKNOWN DATE");

}


/* =========================================
   CREATE EVENT
========================================= */

function createTimelineEvent(event, index) {

    const position = index % 2 === 0 ? "above" : "below";

    const element = document.createElement("article");

    element.className = `timeline-event ${position}`;
    element.dataset.id = event.id;

    const typeLabels = {
        film: "FEATURE FILM",
        series: "TELEVISION SERIES",
        event: "MAJOR EVENT"
    };

    const nodeClass = event.type === "series"
        ? "series-node"
        : event.type === "event"
            ? "event-node-major"
            : "";

    element.innerHTML = `
        <div class="event-connector"></div>
        <div class="event-node ${nodeClass}"></div>

        <button class="event-card event-type-${event.type}" type="button">
            <div class="event-type"></div>
            <h3></h3>
            <div class="event-date"></div>
        </button>

        <div class="event-year"></div>
    `;

    element.querySelector(".event-type").textContent =
        typeLabels[event.type] || "ARCHIVE RECORD";

    element.querySelector("h3").textContent = event.title;

    element.querySelector(".event-date").textContent =
        formatYear(event);

    element.querySelector(".event-year").textContent =
        formatYear(event);

    element.querySelector(".event-card").addEventListener("click", () => {
        openEvent(event.id);
    });

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

        timelineEvents.appendChild(
            createTimelineEvent(event, index)
        );

    });

    timelineCount.textContent = `${events.length} RECORDS`;

    if (selectedEvent &&
        !events.some(event => event.id === selectedEvent)) {

        closePanel();

    }

    if (selectedEvent) {

        const selectedNode = document.querySelector(
            `.timeline-event[data-id="${selectedEvent}"]`
        );

        if (selectedNode) selectedNode.classList.add("selected");

    }

}


/* =========================================
   INTELLIGENCE PANEL
========================================= */

function openEvent(id) {

    const event = timelineData.find(item => item.id === String(id));

    if (!event) return;

    selectedEvent = event.id;

    document.querySelectorAll(".timeline-event").forEach(node => {
        node.classList.remove("selected");
    });

    const selectedNode = document.querySelector(
        `.timeline-event[data-id="${event.id}"]`
    );

    if (selectedNode) selectedNode.classList.add("selected");

    panelContent.innerHTML = `
        <div class="panel-category"></div>
        <h2 class="panel-title"></h2>
        <div class="panel-date"></div>

        <hr class="panel-divider">

        <div class="panel-section-label">HISTORICAL OVERVIEW</div>
        <p class="panel-description"></p>

        <div class="panel-meta">

            <div class="panel-meta-item">
                <span>ARCHIVE ID</span>
                <strong class="meta-id"></strong>
            </div>

            <div class="panel-meta-item">
                <span>FRANCHISE ID</span>
                <strong class="meta-franchise"></strong>
            </div>

            <div class="panel-meta-item">
                <span>CHRONOLOGICAL DATE</span>
                <strong class="meta-chronology"></strong>
            </div>

            <div class="panel-meta-item">
                <span>RELEASE DATE</span>
                <strong class="meta-release"></strong>
            </div>

            <div class="panel-meta-item">
                <span>REALITY ID</span>
                <strong class="meta-reality"></strong>
            </div>

            <div class="panel-meta-item">
                <span>ENTITY ID</span>
                <strong class="meta-entity"></strong>
            </div>

        </div>
    `;

    const labels = {
        film: "FEATURE FILM",
        series: "TELEVISION SERIES",
        event: "MAJOR HISTORICAL EVENT"
    };

    panelContent.querySelector(".panel-category").textContent =
        labels[event.type] || "ARCHIVE RECORD";

    panelContent.querySelector(".panel-title").textContent =
        event.title;

    panelContent.querySelector(".panel-date").textContent =
        formatYear(event);

    panelContent.querySelector(".panel-description").textContent =
        event.description;

    panelContent.querySelector(".meta-id").textContent = event.id;

    panelContent.querySelector(".meta-franchise").textContent =
        event.franchiseId ?? "UNASSIGNED";

    panelContent.querySelector(".meta-chronology").textContent =
       event.chronologyLabel || (event.chronologySort ?? "UNKNOWN");

    panelContent.querySelector(".meta-release").textContent =
        event.releaseDate || "UNKNOWN";

    panelContent.querySelector(".meta-reality").textContent =
        event.realityId ?? "UNASSIGNED";

    panelContent.querySelector(".meta-entity").textContent =
        event.entityId ?? "UNASSIGNED";

    intelligencePanel.classList.add("open");
    panelOverlay.classList.add("open");

}


function closePanel() {

    intelligencePanel.classList.remove("open");
    panelOverlay.classList.remove("open");

    document.querySelectorAll(".timeline-event").forEach(node => {
        node.classList.remove("selected");
    });

    selectedEvent = null;

}


/* =========================================
   PANEL CONTROLS
========================================= */

document.getElementById("closePanel").addEventListener(
    "click", closePanel
);

panelOverlay.addEventListener("click", closePanel);

document.addEventListener("keydown", event => {

    if (event.key === "Escape") closePanel();

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

        document.getElementById("timelineModeLabel").textContent =
            currentOrder === "chronological"
                ? "CHRONOLOGICAL ORDER"
                : "RELEASE ORDER";

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
   ZOOM
========================================= */

function updateZoom() {

    timelineCanvas.style.transform = `scale(${currentZoom})`;

    zoomLabel.textContent = `${Math.round(currentZoom * 100)}%`;

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
