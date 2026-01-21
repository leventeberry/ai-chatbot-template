(() => {
  const getCurrentScript = () => {
    if (document.currentScript) {
      return document.currentScript;
    }

    const scripts = document.getElementsByTagName("script");
    return scripts.length ? scripts[scripts.length - 1] : null;
  };

  const logError = (message) => {
    if (console && console.error) {
      console.error(`[AI Chat Widget] ${message}`);
    }
  };

  const ensureContainer = () => {
    if (typeof document === "undefined") return null;
    let container = document.getElementById("ai-chat-widget");
    if (!container) {
      container = document.createElement("div");
      container.id = "ai-chat-widget";
      document.body.appendChild(container);
    }
    return container;
  };

  const getConfigFromScript = () => {
    const script = getCurrentScript();
    if (!script) {
      logError("Unable to locate the widget script tag.");
      return null;
    }

    const widgetId = script.getAttribute("data-widget-id");
    const token = script.getAttribute("data-token");
    const origin = script.getAttribute("data-origin");

    if (!widgetId) {
      logError("Missing required attribute: data-widget-id.");
    }

    if (!origin) {
      logError("Missing required attribute: data-origin.");
    }

    const container = ensureContainer();

    return {
      script,
      widgetId,
      token,
      origin,
      container,
    };
  };

  const applyIframeSizing = (iframe) => {
    const isNarrow = window.innerWidth < 768;
    if (isNarrow) {
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      return;
    }

    iframe.style.width = "420px";
    iframe.style.height = "720px";
    iframe.style.right = "24px";
    iframe.style.bottom = "24px";
  };

  const buildWidgetUrl = (scriptSrc, config) => {
    let baseUrl;
    try {
      baseUrl = new URL(scriptSrc);
    } catch {
      logError("Invalid widget script URL.");
      return null;
    }

    const widgetUrl = new URL("/widget", baseUrl.origin);
    if (config.widgetId) {
      widgetUrl.searchParams.set("widget_id", config.widgetId);
    }
    if (config.token) {
      widgetUrl.searchParams.set("token", config.token);
    }
    if (config.origin) {
      widgetUrl.searchParams.set("origin", config.origin);
    }
    return widgetUrl.toString();
  };

  const mountWidget = () => {
    const config = getConfigFromScript();
    if (!config || !config.container) return;

    const widgetSrc = buildWidgetUrl(config.script.src, config);
    if (!widgetSrc) return;

    let iframe = document.getElementById("ai-chat-widget-frame");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "ai-chat-widget-frame";
      iframe.title = "AI Chat Widget";
      iframe.setAttribute("aria-hidden", "false");
      iframe.style.position = "fixed";
      iframe.style.border = "0";
      iframe.style.zIndex = "2147483647";
      iframe.style.background = "transparent";
      iframe.style.maxWidth = "100%";
      iframe.style.maxHeight = "100%";
      config.container.appendChild(iframe);
    }

    iframe.src = widgetSrc;
    applyIframeSizing(iframe);
    window.addEventListener("resize", () => applyIframeSizing(iframe));
  };

  window.AIChatWidgetLoader = {
    getConfig: getConfigFromScript,
    mount: mountWidget,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountWidget);
  } else {
    mountWidget();
  }
})();
