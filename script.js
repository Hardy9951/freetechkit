(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  // Tool tabs
  $$(".tab").forEach(tab => tab.addEventListener("click", () => {
    $$(".tab").forEach(t => { const active = t === tab; t.classList.toggle("active", active); t.setAttribute("aria-selected", String(active)); });
    $$(".tool-panel").forEach(panel => { const active = panel.id === tab.dataset.panel; panel.classList.toggle("active", active); panel.hidden = !active; });
  }));
  $$("[data-open-tool]").forEach(link => link.addEventListener("click", () => {
    const id = link.dataset.openTool;
    const tab = $(`[data-panel="${id}"]`);
    if (tab) tab.click();
  }));
  $("#year").textContent = new Date().getFullYear();

  // QR code generator. qrcode.js is loaded from a CDN, so it needs internet access.
  let qrInstance = null;
  const qrStatus = $("#qr-status"), qrButton = $("#qr-download");
  $("#qr-generate").addEventListener("click", () => {
    const value = $("#qr-input").value.trim();
    const size = Number($("#qr-size").value);
    const target = $("#qrcode");
    if (!value) { qrStatus.textContent = "Enter a URL or some text first."; return; }
    if (typeof QRCode === "undefined") { qrStatus.textContent = "The QR library did not load. Check your internet connection or try again later."; return; }
    target.replaceChildren();
    try {
      qrInstance = new QRCode(target, { text: value, width: size, height: size, colorDark: "#101827", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
      qrStatus.textContent = "QR code created. Scan it with your phone to verify the content.";
      qrButton.disabled = false;
    } catch (e) {
      qrStatus.textContent = "Could not create the QR code. Try shorter text.";
      qrButton.disabled = true;
    }
  });
  qrButton.addEventListener("click", () => {
    const canvas = $("#qrcode canvas");
    const img = $("#qrcode img");
    let dataUrl = canvas ? canvas.toDataURL("image/png") : (img ? img.src : "");
    if (!dataUrl) { qrStatus.textContent = "Generate a QR code first."; return; }
    const a = document.createElement("a"); a.href = dataUrl; a.download = "freetechkit-qr.png"; document.body.appendChild(a); a.click(); a.remove();
  });

  // Text utilities
  const textInput = $("#text-input"), textStatus = $("#text-status");
  function updateTextStats() {
    const value = textInput.value;
    const words = value.trim() ? value.trim().split(/\s+/u).length : 0;
    $("#char-count").textContent = value.length.toLocaleString();
    $("#word-count").textContent = words.toLocaleString();
    $("#line-count").textContent = value ? value.split(/\r\n|\r|\n/).length.toLocaleString() : "0";
    $("#read-time").textContent = words ? `${Math.max(1, Math.ceil(words / 200))} min` : "0 min";
  }
  textInput.addEventListener("input", updateTextStats);
  $$("[data-text-action]").forEach(button => button.addEventListener("click", async () => {
    const action = button.dataset.textAction;
    const value = textInput.value;
    switch (action) {
      case "upper": textInput.value = value.toLocaleUpperCase(); break;
      case "lower": textInput.value = value.toLocaleLowerCase(); break;
      case "title": textInput.value = value.toLocaleLowerCase().replace(/(^|[\s([{“"'’])(\p{L})/gu, (_, before, letter) => before + letter.toLocaleUpperCase()); break;
      case "trim": textInput.value = value.split(/\r\n|\r|\n/).map(line => line.trim().replace(/\s+/gu, " ")).join("\n").trim(); break;
      case "unique": textInput.value = [...new Set(value.split(/\r\n|\r|\n/))].join("\n"); break;
      case "clear": textInput.value = ""; break;
      case "copy":
        try { await navigator.clipboard.writeText(value); textStatus.textContent = "Copied text to clipboard."; }
        catch { textInput.select(); textStatus.textContent = "Clipboard access was blocked. Select the text and copy it manually."; }
        updateTextStats(); return;
    }
    updateTextStats();
    textStatus.textContent = "Done. Text is processed locally in your browser.";
  }));
  updateTextStats();

  // IPv4 CIDR calculator
  const cidrSelect = $("#cidr-input");
  for (let i = 0; i <= 32; i++) {
    const option = document.createElement("option"); option.value = i; option.textContent = `/${i}`;
    if (i === 24) option.selected = true;
    cidrSelect.appendChild(option);
  }
  function parseIPv4(value) {
    const parts = value.trim().split(".");
    if (parts.length !== 4 || parts.some(p => !/^\d{1,3}$/.test(p) || Number(p) > 255)) return null;
    return parts.reduce((acc, p) => ((acc * 256) + Number(p)) >>> 0, 0) >>> 0;
  }
  function ipToString(n) { return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join("."); }
  function maskFor(prefix) { return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0; }
  function setNetworkResults(items) {
    $("#network-results").innerHTML = items.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("");
  }
  function calculateNetwork() {
    const ip = parseIPv4($("#ip-input").value);
    const prefix = Number(cidrSelect.value);
    if (ip === null) { $("#network-status").textContent = "Enter a valid IPv4 address, for example 192.168.1.10."; return; }
    const mask = maskFor(prefix), wildcard = (~mask) >>> 0;
    const network = (ip & mask) >>> 0, broadcast = (network | wildcard) >>> 0;
    const total = 2 ** (32 - prefix);
    let usable = total, first = network, last = broadcast;
    if (prefix <= 30) { usable = Math.max(0, total - 2); first = (network + 1) >>> 0; last = (broadcast - 1) >>> 0; }
    else if (prefix === 31) { usable = 2; first = network; last = broadcast; }
    else { usable = 1; first = network; last = network; }
    setNetworkResults([
      ["Network address", `${ipToString(network)}/${prefix}`],
      ["Broadcast address", ipToString(broadcast)],
      ["Subnet mask", ipToString(mask)],
      ["Wildcard mask", ipToString(wildcard)],
      ["Total addresses", total.toLocaleString()],
      ["Usable host addresses", usable.toLocaleString()],
      ["First usable host", ipToString(first)],
      ["Last usable host", ipToString(last)]
    ]);
    $("#network-status").textContent = "Calculation complete. Results are calculated locally in your browser.";
  }
  $("#network-calculate").addEventListener("click", calculateNetwork);
  $("#ip-input").addEventListener("keydown", e => { if (e.key === "Enter") calculateNetwork(); });
  cidrSelect.addEventListener("change", calculateNetwork);
  calculateNetwork();

  // Placeholder affiliate links must never look like live recommendations.
  $$("[data-placeholder-link]").forEach(link => link.addEventListener("click", e => {
    e.preventDefault();
    alert("This is a placeholder. Add a real, approved affiliate URL before publishing.");
  }));
})();