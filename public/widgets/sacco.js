/*
 * Afronomics SACCO member widget loader (docs/rebuild/upgrade-U5-plan.md). Put
 *   <div data-afronomics-sacco="your-sacco-slug"></div>
 *   <script src="https://www.afronomicsfeed.com/widgets/sacco.js" async></script>
 * on your page. Each div becomes a frame showing only the figures SASRA published for that SACCO, with source and
 * date, sized to its content. Optional: data-theme="light" or "dark". No cookies; we count
 * widget views by page and referring site only, with no visitor identifiers.
 */
(function () {
  var origin = "https://www.afronomicsfeed.com";
  try {
    var me = document.currentScript && document.currentScript.src;
    if (me) origin = new URL(me).origin;
  } catch {}
  var frames = [];
  function mount() {
    var nodes = document.querySelectorAll("[data-afronomics-sacco]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.getAttribute("data-afronomics-mounted")) continue;
      var slug = (el.getAttribute("data-afronomics-sacco") || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (!slug) continue;
      var theme = el.getAttribute("data-theme");
      var f = document.createElement("iframe");
      f.src = origin + "/embed/sacco/" + slug + (theme === "light" || theme === "dark" ? "?theme=" + theme : "");
      f.title = "Published figures (Afronomics)";
      f.loading = "lazy";
      f.width = "100%";
      f.height = "380";
      f.style.border = "0";
      f.style.maxWidth = "420px";
      el.appendChild(f);
      el.setAttribute("data-afronomics-mounted", "1");
      frames.push(f);
    }
  }
  window.addEventListener("message", function (e) {
    if (e.origin !== origin || !e.data || e.data.type !== "afronomics:height") return;
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].contentWindow === e.source) frames[i].height = String(Math.min(Math.max(Number(e.data.height) || 0, 120), 900));
    }
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
