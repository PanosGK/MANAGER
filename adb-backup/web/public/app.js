const state = {
  devices: [],
  folders: [],
  sizes: {},
  browsePath: "sdcard",
  browseSelected: new Set(),
  selectedRows: new Set(),
  running: false,
  ready: false,
  paused: false,
  canRetryFailed: false,
  readiness: null,
  lastResultShown: false,
  pollTimer: null,
  readyTimer: null,
};

const $ = (id) => document.getElementById(id);

async function api(path, options = {}) {
  const { timeoutMs = 30000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(path, {
      ...fetchOptions,
      headers: { "Content-Type": "application/json", ...(fetchOptions.headers || {}) },
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || res.statusText);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out. The server may be busy — try again.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function showBanner(message, type = "error") {
  const el = $("banner");
  el.textContent = message;
  el.className = `toast ${type}`;
  el.classList.remove("hidden");
}

function hideBanner() {
  $("banner").classList.add("hidden");
}

function folderName(path) {
  const parts = path.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] || path;
}

function formatBytes(bytes) {
  if (bytes == null || bytes < 0) return "Unknown";
  if (bytes < 1024) return `${bytes.toFixed(0)} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function normalizeDevices(list) {
  if (!list) return [];
  return list.flatMap((item) => {
    if (Array.isArray(item)) return item.filter((d) => d && typeof d === "object");
    if (item && typeof item === "object") return [item];
    return [];
  });
}

function deviceLabel(d) {
  return d.displayName || d.DisplayName || `${d.model || d.Model || "?"} · ${d.serialNumber || d.SerialNumber || "?"}`;
}

function deviceSerial(d) {
  return d?.serialNumber || d?.SerialNumber || "";
}

function deviceModel(d) {
  return d?.model || d?.Model || "";
}

function selectedDevice() {
  const idx = $("deviceSelect").value;
  return state.devices[Number(idx)] || null;
}

function renderFolders() {
  const checkedState = {};
  $("folderTable").querySelectorAll('input[type="checkbox"]').forEach((c) => {
    const idx = Number(c.dataset.index);
    if (!Number.isNaN(idx) && state.folders[idx]) {
      checkedState[state.folders[idx]] = c.checked;
    }
  });

  const tbody = $("folderTable").querySelector("tbody");
  tbody.innerHTML = "";
  state.folders.forEach((path, index) => {
    const tr = document.createElement("tr");
    const size = state.sizes[path];
    const checked = checkedState[path] !== undefined ? checkedState[path] : true;
    tr.innerHTML = `
      <td><input type="checkbox" data-index="${index}" ${checked ? "checked" : ""}></td>
      <td>${folderName(path)}</td>
      <td>${size?.text || "-"}</td>
      <td class="status-cell">${size?.status || "Ready"}</td>
      <td>${path}</td>
    `;
    if (state.selectedRows.has(index)) tr.classList.add("selected-row");
    tr.addEventListener("click", (e) => {
      if (e.target.tagName === "INPUT") return;
      if (state.selectedRows.has(index)) state.selectedRows.delete(index);
      else state.selectedRows.add(index);
      renderFolders();
    });
    tbody.appendChild(tr);
  });
  updateFolderTotal();
}

function getSelectedFolders() {
  return state.folders.filter((_, i) => {
    const row = $("folderTable").querySelector(`input[data-index="${i}"]`);
    return row?.checked;
  });
}

function updateFolderTotal() {
  const selected = getSelectedFolders();
  if (selected.length === 0) {
    $("folderTotal").textContent = "none selected";
    return;
  }
  let total = 0;
  let hasUnknown = false;
  for (const path of selected) {
    const s = state.sizes[path];
    if (s?.bytes != null) total += s.bytes;
    else hasUnknown = true;
  }
  const totalText = formatBytes(total);
  $("folderTotal").textContent = hasUnknown
    ? `${totalText}+ selected`
    : `${totalText} selected`;
}

function setOrbState(mode) {
  const ring = $("orbRing");
  if (ring) ring.className = `orb-ring ${mode}`;
}

function setOrbLabel(text) {
  const label = $("backupNow")?.querySelector(".orb-label");
  if (label) label.textContent = text;
}

function renderReadiness(data) {
  state.readiness = data;
  state.ready = !!data.ready && !data.running;

  const list = $("readinessList");
  list.innerHTML = "";

  if (data.running) {
    list.innerHTML = `<div class="status-pill active"><span class="dot pulse"></span>sync active</div>`;
    setOrbState("active");
    setOrbLabel("SYNCING");
  } else if (data.ready) {
    list.innerHTML = `<div class="status-pill ready"><span class="dot"></span>all systems ready</div>`;
    setOrbState("ready");
    setOrbLabel("START");
    for (const check of (data.checks || []).filter((c) => c.level === "warn")) {
      const item = document.createElement("div");
      item.className = "status-item warn";
      item.innerHTML = `<span class="dot"></span><span>${check.message || ""}</span>`;
      list.appendChild(item);
    }
    const contactsOk = (data.checks || []).find((c) => c.code === "contacts_vcf");
    if (contactsOk) {
      const item = document.createElement("div");
      item.className = "status-item ok";
      item.innerHTML = `<span class="dot"></span><span>${contactsOk.message || ""}</span>`;
      list.appendChild(item);
    }
  } else {
    setOrbState("waiting");
    setOrbLabel("START");
    const issues = (data.checks || []).filter((c) => c.level === "error" || c.level === "warn");
    for (const check of issues) {
      const item = document.createElement("div");
      item.className = `status-item ${check.level || "error"}`;
      item.innerHTML = `<span class="dot pulse"></span><span>${check.message || ""}</span>`;
      list.appendChild(item);
    }
  }

  $("backupNow").disabled = !state.ready;

  if (data.running) {
    $("heroHint").textContent = "transfer in progress";
  } else if (data.ready) {
    const deviceName = data.device?.model || data.device?.displayName || "device";
    $("heroHint").textContent = `${deviceName} · ${data.folderCount || 0} folders`;
  } else {
    const firstError = (data.checks || []).find((c) => c.level === "error");
    $("heroHint").textContent = firstError?.message?.toLowerCase() || "awaiting connection";
  }

  renderRecoveryPanel(data.interruptedBackups);
}

function renderRecoveryPanel(interrupted) {
  const panel = $("recoveryPanel");
  const items = interrupted || [];
  if (!items.length) {
    panel.classList.add("hidden");
    panel.innerHTML = "";
    return;
  }
  panel.classList.remove("hidden");
  panel.innerHTML = items
    .map(
      (item) => `
    <div class="recovery-item" data-dir="${item.backupDir || item.backupDir}">
      <span>interrupted · ${item.folderName || item.deviceSerial || "backup"}</span>
      <div class="recovery-actions">
        <button type="button" class="resume-interrupted" data-dir="${item.backupDir}" data-serial="${item.deviceSerial || ""}">resume</button>
        <button type="button" class="dismiss-interrupted" data-dir="${item.backupDir}">dismiss</button>
      </div>
    </div>`
    )
    .join("");
}

async function refreshReadiness() {
  try {
    const device = selectedDevice();
    const path = $("backupPath").value.trim();
    const qs = new URLSearchParams();
    if (device) qs.set("device", deviceSerial(device));
    if (path) qs.set("path", path);
    const data = await api(`/api/ready?${qs}`, { timeoutMs: 15000 });
    renderReadiness(data);

    if (data.device && state.devices.length > 0) {
      const idx = state.devices.findIndex((d) => deviceSerial(d) === data.device.serialNumber);
      if (idx >= 0) $("deviceSelect").value = String(idx);
    }
  } catch (err) {
    $("heroHint").textContent = err.message;
    $("backupNow").disabled = true;
  }
}

async function loadSettings() {
  const settings = await api("/api/settings");
  $("backupPath").value = settings.BackupBaseDir || settings.backupBaseDir || "";
  state.folders = (settings.BackupFolders || settings.backupFolders || []).map(String);
  state.sizes = {};
  renderFolders();
}

async function refreshDevices() {
  $("deviceStatus").className = "field-hint";
  $("deviceStatus").textContent = "scanning...";
  try {
    const data = await api("/api/devices");
    state.devices = normalizeDevices(data.devices);
    const select = $("deviceSelect");
    select.innerHTML = "";
    if (state.devices.length === 0) {
      $("deviceStatus").className = "field-hint error";
      $("deviceStatus").textContent = "no device";
      return;
    }
    state.devices.forEach((d, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = deviceLabel(d);
      select.appendChild(opt);
    });
    $("deviceStatus").className = "field-hint ok";
    $("deviceStatus").textContent =
      state.devices.length > 1 ? `${state.devices.length} devices detected` : "connected";
  } catch (err) {
    $("deviceStatus").className = "field-hint error";
    $("deviceStatus").textContent = err.message;
  }
  await refreshReadiness();
}

async function previewSizes() {
  const device = selectedDevice();
  if (!device) return showBanner("Connect a device first.");
  const selected = getSelectedFolders();
  if (selected.length === 0) return showBanner("Select at least one folder.");

  $("previewSizes").disabled = true;
  $("folderTotal").textContent = "Calculating sizes...";
  try {
    const data = await api("/api/folders/sizes", {
      method: "POST",
      timeoutMs: 600000,
      body: JSON.stringify({ device: deviceSerial(device), folders: selected }),
    });
    for (const [path, info] of Object.entries(data.sizes || {})) {
      state.sizes[path] = { bytes: info.bytes, text: info.text, status: "Ready" };
    }
    renderFolders();
    hideBanner();
  } catch (err) {
    showBanner(err.message);
  } finally {
    $("previewSizes").disabled = state.running;
  }
}

async function saveSettings(silent = false) {
  await api("/api/settings", {
    method: "PUT",
    body: JSON.stringify({
      backupBaseDir: $("backupPath").value.trim(),
      backupFolders: state.folders,
    }),
  });
  if (!silent) showBanner("Settings saved.", "ok");
  await refreshReadiness();
}

function addFolderPath(path) {
  const normalized = path.trim().replace(/^\/+/, "");
  if (!normalized) return;
  const full = normalized.startsWith("sdcard/") ? normalized : `sdcard/${normalized}`;
  if (state.folders.includes(full)) return;
  state.folders.push(full);
  renderFolders();
}

async function openBrowseDialog() {
  const device = selectedDevice();
  if (!device) return showBanner("Connect a device first.");
  state.browsePath = "sdcard";
  state.browseSelected.clear();
  await loadBrowseList(deviceSerial(device));
  $("browseDialog").showModal();
}

async function loadBrowseList(deviceId) {
  const data = await api(
    `/api/folders?device=${encodeURIComponent(deviceId)}&path=${encodeURIComponent(state.browsePath)}`
  );
  state.browsePath = data.currentPath;
  $("browsePath").textContent = `/${data.currentPath}`;
  const list = $("browseList");
  list.innerHTML = "";
  state.browseSelected.clear();

  if (data.folders.length === 0) {
    const div = document.createElement("div");
    div.className = "browse-item";
    div.textContent = "(No subfolders)";
    list.appendChild(div);
    return;
  }

  data.folders.forEach((f) => {
    const div = document.createElement("div");
    div.className = "browse-item";
    div.dataset.path = f.path;
    div.innerHTML = `
      <input type="checkbox">
      <div>
        <div>${f.name}</div>
        <div class="path">${f.path}</div>
      </div>
    `;
    div.addEventListener("click", (e) => {
      if (e.target.tagName === "INPUT") return;
      enterBrowseFolder(f.path);
    });
    div.querySelector("input").addEventListener("change", (e) => {
      e.stopPropagation();
      if (e.target.checked) state.browseSelected.add(f.path);
      else state.browseSelected.delete(f.path);
      div.classList.toggle("selected", e.target.checked);
    });
    list.appendChild(div);
  });
}

async function enterBrowseFolder(path) {
  const device = selectedDevice();
  if (!device) return;
  state.browsePath = path;
  await loadBrowseList(deviceSerial(device));
}

function setUiRunning(running) {
  state.running = running;
  $("backupNow").disabled = running || !state.ready;
  setOrbLabel(running ? "SYNCING" : "INITIATE");
  setOrbState(running ? "active" : state.ready ? "ready" : "waiting");
  $("pauseBackup").disabled = !running;
  $("cancelBackup").disabled = !running;
  $("retryFailed").disabled = running || !state.canRetryFailed;
  $("startBackupAdvanced").disabled = running;
  $("refreshDevices").disabled = running;
  $("deviceSelect").disabled = running;
  $("backupPath").disabled = running;
  $("saveSettings").disabled = running;
  $("scanDevice").disabled = running;
  $("previewSizes").disabled = running;
  $("folderTable").querySelectorAll("input").forEach((el) => {
    el.disabled = running;
  });
}

const ACTIVITY_LABELS = {
  idle: "STANDBY",
  preparing: "PREP",
  sizing: "SCAN",
  copying: "SYNC",
  working: "ACTIVE",
  paused: "PAUSED",
  complete: "DONE",
  issues: "ALERT",
};

function applyActivity(status) {
  const step = status.activityStep || (status.running ? "working" : "idle");
  let labelStep = step;
  if (!status.running && status.result) {
    labelStep = status.result.Success || status.result.success ? "complete" : "issues";
  }

  $("activityPanel").className = `readout ${labelStep}`;
  $("activityBadge").textContent = ACTIVITY_LABELS[labelStep] || "ACTIVE";
  $("activityTitle").textContent = (status.activityTitle || status.phase || "standby").toLowerCase();
  $("activityDetail").textContent = (status.activityDetail || status.detail || "").toLowerCase();

  const showSpinner = status.running && !status.paused;
  $("activitySpinner").classList.toggle("hidden", !showSpinner);

  const currentFile = status.currentFile || "";
  $("currentFile").textContent = currentFile ? currentFile : "";

  const counts = [];
  if (status.folderTotal > 0) {
    counts.push(`dir ${status.folderIndex || 0}/${status.folderTotal}${status.currentFolder ? ` · ${status.currentFolder}` : ""}`);
  }
  if (status.fileTotal > 0) {
    counts.push(`file ${status.fileIndex || 0}/${status.fileTotal}`);
  }
  $("progressCounts").textContent = counts.join("  ");
}

function showContactsNotice(contacts) {
  if (!contacts?.message) return;
  const type = contacts.found || contacts.level === "ok" ? "ok" : "warn";
  showBanner(contacts.message, type);
}

function showResultToast(result) {
  const r = result;
  const cancelled = r.Cancelled || r.cancelled;
  const title = cancelled ? "Backup cancelled" : r.Success || r.success ? "Backup complete" : "Backup finished";
  const body = r.Message || r.message || "";
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
  showBanner(`${title}: ${body}`, cancelled ? "warn" : r.Success || r.success ? "ok" : "warn");
  const contacts = r.ContactsVcf || r.contactsVcf;
  if (contacts?.Message || contacts?.message) {
    setTimeout(() => showContactsNotice({
      message: contacts.Message || contacts.message,
      found: contacts.Found ?? contacts.found,
      level: contacts.Level || contacts.level,
    }), 400);
  }
}

function applyStatus(status) {
  applyActivity(status);
  $("progressDetail").textContent = status.detail || "0.00 GB transferred";
  $("eta").textContent = status.eta || "";

  const bar = $("progressBar");
  if (!status.running) {
    bar.classList.remove("indeterminate");
    bar.style.width = status.percent >= 0
      ? `${Math.max(0, Math.min(100, status.percent))}%`
      : "100%";
  } else if (status.percent < 0) {
    bar.classList.add("indeterminate");
    bar.style.width = "";
  } else {
    bar.classList.remove("indeterminate");
    bar.style.width = `${Math.max(0, Math.min(100, status.percent || 0))}%`;
  }

  if (status.folderStatuses) {
    state.folders.forEach((path) => {
      const info = status.folderStatuses[path];
      if (info) {
        state.sizes[path] = {
          ...(state.sizes[path] || {}),
          status: info.Status || info.status,
        };
      }
    });
    renderFolders();
  }

  if (status.logs?.length) {
    $("logBox").textContent = status.logs.join("\n");
    $("logBox").scrollTop = $("logBox").scrollHeight;
  }

  if (status.backupDir) {
    $("openFolder").disabled = false;
    $("openFolder").dataset.path = status.backupDir;
  }

  if (status.result && !status.running) {
    setUiRunning(false);
    if (!state.lastResultShown) {
      state.lastResultShown = true;
      showResultToast(status.result);
    }
    refreshReadiness();
  } else if (!status.running) {
    state.lastResultShown = false;
  }

  setUiRunning(!!status.running);
  state.canRetryFailed = !!status.canRetryFailed;
  $("retryFailed").disabled = status.running || !status.canRetryFailed;
  renderRecoveryPanel(status.interruptedBackups);
  if (typeof status.paused === "boolean") {
    state.paused = status.paused;
    $("pauseBackup").textContent = status.paused ? "▶" : "⏸";
    $("pauseBackup").title = status.paused ? "Resume" : "Pause";
  }
}

function connectEvents() {
  if (state.pollTimer) clearInterval(state.pollTimer);
  state.pollTimer = setInterval(async () => {
    try {
      const status = await api("/api/backup/status", { timeoutMs: 10000 });
      applyStatus(status);
    } catch {
      /* server busy */
    }
  }, 1000);

  if (state.readyTimer) clearInterval(state.readyTimer);
  state.readyTimer = setInterval(() => {
    if (!state.running) refreshReadiness();
  }, 3000);
}

async function backupNow() {
  return startBackupAdvanced();
}

async function startBackupAdvanced() {
  const device = selectedDevice();
  if (!device) return showBanner("Connect a device first.");

  const selected = getSelectedFolders();
  if (selected.length === 0) return showBanner("Select at least one folder, then click Start backup.");

  const backupBaseDir = $("backupPath").value.trim();
  if (!backupBaseDir) return showBanner("Enter a backup destination.");

  hideBanner();
  state.lastResultShown = false;
  $("logBox").textContent = "";
  setUiRunning(true);

  try {
    await api("/api/backup/start", {
      method: "POST",
      timeoutMs: 30000,
      body: JSON.stringify({
        deviceSerial: deviceSerial(device),
        deviceModel: deviceModel(device),
        backupBaseDir,
        allFolders: state.folders,
        selectedFolders: selected,
        skipSizeCalculation: true,
      }),
    });
  } catch (err) {
    setUiRunning(false);
    showBanner(err.message);
  }
}

async function retryFailedBackup() {
  const device = selectedDevice();
  if (!device) return showBanner("Connect a device first.");
  hideBanner();
  state.lastResultShown = false;
  try {
    await api("/api/backup/retry-failed", {
      method: "POST",
      timeoutMs: 30000,
      body: JSON.stringify({
        deviceSerial: deviceSerial(device),
        deviceModel: deviceModel(device),
        backupBaseDir: $("backupPath").value.trim(),
      }),
    });
    setUiRunning(true);
  } catch (err) {
    showBanner(err.message);
  }
}

function wireEvents() {
  $("backupNow").addEventListener("click", backupNow);
  $("retryFailed").addEventListener("click", retryFailedBackup);
  $("recoveryPanel").addEventListener("click", async (e) => {
    const resumeBtn = e.target.closest(".resume-interrupted");
    const dismissBtn = e.target.closest(".dismiss-interrupted");
    if (resumeBtn) {
      try {
        await api("/api/backup/resume-interrupted", {
          method: "POST",
          body: JSON.stringify({
            backupDir: resumeBtn.dataset.dir,
            deviceSerial: resumeBtn.dataset.serial,
          }),
        });
        setUiRunning(true);
        hideBanner();
      } catch (err) {
        showBanner(err.message);
      }
    }
    if (dismissBtn) {
      try {
        await api("/api/backup/dismiss-interrupted", {
          method: "POST",
          body: JSON.stringify({ backupDir: dismissBtn.dataset.dir }),
        });
        refreshReadiness();
      } catch (err) {
        showBanner(err.message);
      }
    }
  });
  $("refreshDevices").addEventListener("click", refreshDevices);
  $("deviceSelect").addEventListener("change", refreshReadiness);
  $("backupPath").addEventListener("change", refreshReadiness);

  $("saveSettings").addEventListener("click", () => saveSettings().catch((e) => showBanner(e.message)));
  $("exportSettings").addEventListener("click", () => {
    const blob = new Blob(
      [JSON.stringify({ backupBaseDir: $("backupPath").value.trim(), backupFolders: state.folders }, null, 2)],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backup_settings.json";
    a.click();
  });
  $("importSettings").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      $("backupPath").value = data.backupBaseDir || data.BackupBaseDir || "";
      state.folders = (data.backupFolders || data.BackupFolders || []).map(String);
      state.sizes = {};
      renderFolders();
      await saveSettings(true);
    } catch (err) {
      showBanner("Invalid settings file.");
    }
    e.target.value = "";
  });

  $("selectAll").addEventListener("click", () => {
    $("folderTable").querySelectorAll('input[type="checkbox"]').forEach((c) => (c.checked = true));
    updateFolderTotal();
  });
  $("clearAll").addEventListener("click", () => {
    $("folderTable").querySelectorAll('input[type="checkbox"]').forEach((c) => (c.checked = false));
    updateFolderTotal();
  });
  $("addFolder").addEventListener("click", () => {
    const path = prompt("Folder on phone (e.g. sdcard/Music):", "sdcard/");
    if (path) addFolderPath(path);
  });
  $("removeFolder").addEventListener("click", () => {
    if (state.selectedRows.size === 0) return showBanner("Click a row to select a folder first.");
    state.folders = state.folders.filter((_, i) => !state.selectedRows.has(i));
    state.selectedRows.clear();
    renderFolders();
  });
  $("folderTable").addEventListener("change", (e) => {
    if (e.target.matches('input[type="checkbox"]')) updateFolderTotal();
  });

  $("scanDevice").addEventListener("click", openBrowseDialog);
  $("previewSizes").addEventListener("click", previewSizes);
  $("browseUp").addEventListener("click", async () => {
    if (state.browsePath === "sdcard") return;
    const parts = state.browsePath.split("/");
    parts.pop();
    state.browsePath = parts.join("/") || "sdcard";
    const device = selectedDevice();
    if (device) await loadBrowseList(deviceSerial(device));
  });
  $("browseRefresh").addEventListener("click", () => {
    const device = selectedDevice();
    if (device) loadBrowseList(deviceSerial(device));
  });
  $("browseAddCurrent").addEventListener("click", () => addFolderPath(state.browsePath));
  $("browseAddSelected").addEventListener("click", () => {
    state.browseSelected.forEach((p) => addFolderPath(p));
  });

  $("startBackupAdvanced").addEventListener("click", startBackupAdvanced);
  $("pauseBackup").addEventListener("click", async () => {
    const paused = !state.paused;
    await api(paused ? "/api/backup/pause" : "/api/backup/resume", { method: "POST" });
    state.paused = paused;
    $("pauseBackup").textContent = paused ? "▶" : "⏸";
    $("pauseBackup").title = paused ? "Resume" : "Pause";
  });
  $("cancelBackup").addEventListener("click", async () => {
    try {
      $("cancelBackup").disabled = true;
      await api("/api/backup/cancel", { method: "POST", timeoutMs: 30000 });
      applyActivity({
        running: true,
        activityStep: "working",
        activityTitle: "terminating",
        activityDetail: "stopping after current file",
      });
    } catch (err) {
      showBanner(err.message);
      $("cancelBackup").disabled = state.running;
    }
  });
  $("openFolder").addEventListener("click", async () => {
    const path = $("openFolder").dataset.path;
    if (!path) return;
    try {
      await api("/api/open-folder", { method: "POST", body: JSON.stringify({ path }) });
    } catch (err) {
      showBanner(err.message);
    }
  });
}

async function init() {
  wireEvents();
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
  try {
    await loadSettings();
    await refreshDevices();
    const status = await api("/api/backup/status");
    applyStatus(status);
    if (status.running) setUiRunning(true);
  } catch (err) {
    showBanner(err.message);
  }
  connectEvents();
}

init();
