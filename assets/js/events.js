import topbar from "topbar";
import { globalPubSub } from "./lib/pub_sub";

export function registerTopbar() {
  topbar.config({
    barColors: { 0: "#b2c1ff" },
    shadowColor: "rgba(0, 0, 0, .3)",
  });

  let topBarScheduled = null;

  window.addEventListener("phx:page-loading-start", () => {
    if (!topBarScheduled) {
      topBarScheduled = setTimeout(() => topbar.show(), 500);
    }
  });

  window.addEventListener("phx:page-loading-stop", () => {
    clearTimeout(topBarScheduled);
    topBarScheduled = null;
    topbar.hide();
  });
}

export function registerGlobalEventHandlers() {
  window.addEventListener("lb:focus", (event) => {
    // The element may be about to show up via JS.show, which wraps the
    // change in requestAnimationFrame, so we do the same to make sure
    // the focus is applied only after we change the element visibility
    requestAnimationFrame(() => {
      event.target.focus();
    });
  });

  window.addEventListener("lb:set_value", (event) => {
    event.target.value = event.detail.value;
  });

  window.addEventListener("lb:check", (event) => {
    event.target.checked = true;
  });

  window.addEventListener("lb:uncheck", (event) => {
    event.target.checked = false;
  });

  window.addEventListener("lb:set_text", (event) => {
    event.target.textContent = event.detail.value;
  });

  window.addEventListener("lb:clipcopy", (event) => {
    if ("clipboard" in navigator) {
      if (event.target.tagName === "INPUT") {
        navigator.clipboard.writeText(event.target.value);
      } else {
        navigator.clipboard.writeText(event.target.textContent);
      }
    } else {
      alert(
        "Sorry, your browser does not support clipboard copy.\nThis generally requires a secure origin — either HTTPS or localhost."
      );
    }
  });

  window.addEventListener("lb:session_list:on_selection_change", () => {
    const anySessionSelected = !!document.querySelector(
      "[name='session_ids[]']:checked"
    );
    const disconnect = document.querySelector(
      "#edit-sessions [name='disconnect']"
    );
    const closeAll = document.querySelector(
      "#edit-sessions [name='close_all']"
    );
    disconnect.disabled = !anySessionSelected;
    closeAll.disabled = !anySessionSelected;
  });

  window.addEventListener("contextmenu", (event) => {
    const target = event.target.closest("[data-contextmenu-trigger-click]");

    if (target) {
      event.preventDefault();
      // LV dispatches phx-click to the target of the preceding mousedown event
      target.dispatchEvent(new Event("mousedown", { bubbles: true }));
      target.dispatchEvent(new Event("click", { bubbles: true }));
    }
  });

  // Ignore submit events on elements with phx-nosubmit
  window.addEventListener(
    "submit",
    (event) => {
      if (event.target.hasAttribute("phx-nosubmit")) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    { capture: true }
  );
}
