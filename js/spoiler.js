/* =========================================
   FA: NO-SPOILER MODE
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const toggle = document.getElementById("spoiler-toggle");
    const status = document.getElementById("spoiler-status");

    if (!toggle || !status) return;

    // Load saved preference
    const savedPreference =
        localStorage.getItem("fa_no_spoiler") === "true";

    toggle.checked = savedPreference;

    updateStatus();

    // Listen for changes
    toggle.addEventListener("change", () => {

        localStorage.setItem(
            "fa_no_spoiler",
            toggle.checked
        );

        updateStatus();

        // Notify other scripts
        document.dispatchEvent(
            new CustomEvent("spoilerModeChanged", {
                detail: {
                    enabled: toggle.checked
                }
            })
        );

    });

    function updateStatus() {
        status.textContent = toggle.checked
            ? "Enabled"
            : "Disabled";
    }

});
