(() => {
  "use strict";
  const host = document.querySelector("#all-tools");
  if (!host) return;

  const section = document.createElement("section");
  section.className = "file-tools";
  section.setAttribute("aria-labelledby", "file-tools-title");
  const heading = document.createElement("div");
  heading.className = "section-heading";
  const titleWrap = document.createElement("div");
  const eyebrow = document.createElement("div");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "IMAGE & FILE TOOLS";
  const title = document.createElement("h2");
  title.id = "file-tools-title";
  title.textContent = "Edit images in your browser.";
  titleWrap.append(eyebrow, title);
  const headingNote = document.createElement("p");
  headingNote.textContent = "Choose a task, add an image, and download the result. Files stay on your device.";
  heading.append(titleWrap, headingNote);

  const panel = document.createElement("div");
  panel.className = "tool-panel file-tool-panel";
  const intro = document.createElement("div");
  intro.className = "panel-intro";
  const icon = document.createElement("span");
  icon.className = "tool-icon violet";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "▧";
  const introCopy = document.createElement("div");
  const name = document.createElement("h3");
  name.textContent = "Image & File Toolkit";
  const description = document.createElement("p");
  description.textContent = "Resize, convert, compress, crop, rotate, flip, make grayscale images and thumbnails, create a favicon, or inspect image dimensions.";
  introCopy.append(name, description);
  intro.append(icon, introCopy);

  const controls = document.createElement("div");
  controls.className = "file-tool-controls";
  const outputKinds = [
    { value: "image/png", label: "PNG" },
    { value: "image/jpeg", label: "JPEG" },
    { value: "image/webp", label: "WebP" }
  ];
  const operations = [
    ["resize", "Resize image"], ["compress", "Compress image"], ["convert", "Convert format"],
    ["crop", "Crop image"], ["rotate", "Rotate image"], ["flip", "Flip image"],
    ["grayscale", "Make grayscale"], ["thumbnail", "Create thumbnail"],
    ["favicon", "Create favicon PNG"], ["metadata", "View image dimensions & file info"]
  ];

  function makeField(id, labelText, type = "number", config = {}) {
    const wrap = document.createElement("div");
    wrap.className = "file-field";
    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = labelText;
    const input = document.createElement(type === "select" ? "select" : "input");
    input.id = id;
    input.name = id;
    if (type !== "select") input.type = type;
    if (config.min !== undefined) input.min = String(config.min);
    if (config.max !== undefined) input.max = String(config.max);
    if (config.step !== undefined) input.step = String(config.step);
    if (config.value !== undefined) input.value = String(config.value);
    if (config.accept) input.accept = config.accept;
    if (config.required) input.required = true;
    if (config.options) {
      for (const item of config.options) {
        const option = document.createElement("option");
        option.value = item.value;
        option.textContent = item.label;
        input.append(option);
      }
    }
    wrap.append(label, input);
    return { wrap, input };
  }

  const operationField = makeField("file-operation", "Choose an image task", "select", {
    options: operations.map(([value, label]) => ({ value, label }))
  });
  const fileField = makeField("image-file", "Choose an image", "file", { accept: "image/*", required: true });
  fileField.input.setAttribute("aria-describedby", "file-tool-privacy");
  const dimensions = [
    makeField("image-width", "Width (px, blank keeps ratio)", "number", { min: 1, max: 16384 }),
    makeField("image-height", "Height (px, blank keeps ratio)", "number", { min: 1, max: 16384 }),
    makeField("crop-x", "Crop left (px)", "number", { min: 0, value: 0 }),
    makeField("crop-y", "Crop top (px)", "number", { min: 0, value: 0 }),
    makeField("crop-width", "Crop width (px, blank uses full width)", "number", { min: 1 }),
    makeField("crop-height", "Crop height (px, blank uses full height)", "number", { min: 1 }),
    makeField("rotate-angle", "Rotation", "select", { options: [90, 180, 270].map(value => ({ value: String(value), label: `${value}° clockwise` })) }),
    makeField("flip-axis", "Flip direction", "select", { options: [{ value: "horizontal", label: "Horizontal" }, { value: "vertical", label: "Vertical" }] }),
    makeField("thumb-width", "Maximum width (px)", "number", { min: 1, max: 4096, value: 320 }),
    makeField("thumb-height", "Maximum height (px)", "number", { min: 1, max: 4096, value: 320 }),
    makeField("favicon-size", "Square icon size", "select", { options: [16, 32, 48, 64, 128, 256].map(value => ({ value: String(value), label: `${value} × ${value} px` })) }),
    makeField("output-format", "Output format", "select", { options: outputKinds }),
    makeField("image-quality", "Quality (JPEG/WebP)", "range", { min: 0.1, max: 1, step: 0.05, value: 0.85 })
  ];
  const byId = Object.fromEntries(dimensions.map(item => [item.input.id, item.input]));
  const operationGroups = [
    ["image-width", "image-height", "resize"], ["image-quality", "compress"],
    ["crop-x", "crop-y", "crop-width", "crop-height", "crop"],
    ["rotate-angle", "rotate"], ["flip-axis", "flip"],
    ["thumb-width", "thumb-height", "thumbnail"], ["favicon-size", "favicon"],
    ["output-format", "resize compress convert crop rotate flip grayscale thumbnail favicon"]
  ];
  for (const [id, actions] of operationGroups) {
    const field = dimensions.find(item => item.input.id === id);
    field.wrap.dataset.actions = actions;
  }

  const optionGrid = document.createElement("div");
  optionGrid.className = "file-option-grid";
  optionGrid.append(...dimensions.map(item => item.wrap));
  const privacy = document.createElement("p");
  privacy.className = "hint";
  privacy.id = "file-tool-privacy";
  privacy.textContent = "Image processing runs locally in this browser. Basic file information is available; embedded EXIF camera metadata is not read.";
  const run = document.createElement("button");
  run.className = "button primary";
  run.type = "button";
  run.textContent = "Process image";
  const status = document.createElement("p");
  status.className = "hint";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.textContent = "Select an image and task to begin.";
  const result = document.createElement("div");
  result.className = "file-tool-result";
  result.setAttribute("aria-live", "polite");
  panel.append(intro, controls, optionGrid, fileField.wrap, run, privacy, status, result);
  controls.append(operationField.wrap);
  section.append(heading, panel);
  host.append(section);

  const style = document.createElement("style");
  style.textContent = `
    .file-tools{margin:0 0 72px}.file-tool-controls{margin:0 0 14px}
    .file-option-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:14px 0}
    .file-field{min-width:0}.file-field label{display:block;font-size:13px;font-weight:750;margin-bottom:8px}
    .file-field input,.file-field select{font:inherit;width:100%;border:1px solid #dbe2ec;border-radius:11px;padding:11px 12px;background:white;color:#101827}
    .file-field input[type=range]{padding:8px 0;accent-color:#6846e8}
    .file-field input[type=file]{font-size:13px}.file-field[hidden]{display:none}
    .file-tool-result{display:flex;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-top:18px}
    .file-tool-result img{max-width:min(100%,480px);max-height:360px;object-fit:contain;border:1px solid #e5eaf1;border-radius:12px;background:#f8fafc}
    .file-tool-result pre{font:13px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere;margin:0}
    .file-tool-result a{display:inline-flex;padding:10px 14px;border-radius:10px;background:#f0edff;color:#4f32c6;font-weight:750;font-size:13px}
    @media(max-width:700px){.file-option-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:460px){.file-option-grid{grid-template-columns:1fr}}
  `;
  document.head.append(style);

  let previousUrls = [];
  function clearResult() {
    for (const url of previousUrls) URL.revokeObjectURL(url);
    previousUrls = [];
    result.replaceChildren();
  }
  function showOperationOptions() {
    const action = operationField.input.value;
    if (action === "compress" && byId["output-format"].value === "image/png") byId["output-format"].value = "image/webp";
    if (action === "favicon") byId["output-format"].value = "image/png";
    for (const wrap of optionGrid.children) {
      const supported = wrap.dataset.actions.split(" ").includes(action);
      wrap.hidden = !supported;
      for (const input of wrap.querySelectorAll("input,select")) input.disabled = !supported;
    }
    run.textContent = action === "metadata" ? "Inspect image" : "Process image";
  }
  operationField.input.addEventListener("change", showOperationOptions);
  showOperationOptions();

  function numeric(id, label, fallback) {
    const value = byId[id].value === "" ? fallback : Number(byId[id].value);
    if (!Number.isInteger(value) || value < 1) throw new Error(`${label} must be a positive whole number.`);
    return value;
  }
  function clampSide(width, height, maxWidth, maxHeight) {
    const ratio = Math.min(1, maxWidth / width, maxHeight / height);
    return { width: Math.max(1, Math.round(width * ratio)), height: Math.max(1, Math.round(height * ratio)) };
  }
  function drawToBlob(canvas, mime, quality) {
    return new Promise((resolve, reject) => canvas.toBlob(blob => {
      if (!blob) { reject(new Error("The browser could not export this image.")); return; }
      if (blob.type !== mime) { reject(new Error(`${mime.replace("image/", "").toUpperCase()} export is unavailable in this browser.`)); return; }
      resolve(blob);
    }, mime, quality));
  }
  function extensionFor(mime) { return mime === "image/jpeg" ? "jpg" : mime.split("/")[1]; }
  function outputLink(blob, filename) {
    const url = URL.createObjectURL(blob);
    previousUrls.push(url);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.textContent = `Download ${filename} (${(blob.size / 1024).toFixed(1)} KB)`;
    return link;
  }
  function renderImage(blob, filename, width, height) {
    const url = URL.createObjectURL(blob);
    previousUrls.push(url);
    const preview = document.createElement("img");
    preview.src = url;
    preview.alt = `Processed image preview, ${width} by ${height} pixels`;
    result.append(preview, outputLink(blob, filename));
  }

  run.addEventListener("click", async () => {
    clearResult();
    const file = fileField.input.files?.[0];
    if (!file) { status.textContent = "Choose an image file first."; fileField.input.focus(); return; }
    if (!file.type.startsWith("image/")) { status.textContent = "Choose a supported image file."; return; }
    if (file.size > 40 * 1024 * 1024) { status.textContent = "This image exceeds the 40 MB file size limit."; return; }
    const action = operationField.input.value;
    run.disabled = true;
    status.textContent = "Reading image locally…";
    let bitmap;
    try {
      bitmap = await createImageBitmap(file);
      const sourceWidth = bitmap.width, sourceHeight = bitmap.height;
      if (!sourceWidth || !sourceHeight) throw new Error("This image has invalid dimensions.");
      if (action !== "metadata" && sourceWidth * sourceHeight > 60000000) throw new Error("This image is too large to process safely here (maximum 60 megapixels).");
      if (action === "metadata") {
        const rows = [
          `File name: ${file.name}`, `File type: ${file.type || "unknown"}`,
          `File size: ${(file.size / 1024).toFixed(1)} KB`,
          `Image dimensions: ${sourceWidth} × ${sourceHeight} px`,
          `Aspect ratio: ${(sourceWidth / sourceHeight).toFixed(4)}`,
          `Last modified: ${file.lastModified ? new Date(file.lastModified).toLocaleString() : "unknown"}`,
          "Embedded EXIF metadata: not read"
        ];
        const info = document.createElement("pre");
        info.textContent = rows.join("\n");
        result.append(info);
        status.textContent = "Image dimensions and basic file information are shown. No file was uploaded.";
        return;
      }

      let sx = 0, sy = 0, sw = sourceWidth, sh = sourceHeight;
      let width = sourceWidth, height = sourceHeight;
      let rotation = 0, flip = "", grayscale = false;
      let mime = byId["output-format"].value;
      const quality = Number(byId["image-quality"].value);
      if (action === "resize") {
        const widthValue = byId["image-width"].value;
        const heightValue = byId["image-height"].value;
        const targetWidth = widthValue ? numeric("image-width", "Width", sourceWidth) : heightValue ? Math.round(sourceWidth * numeric("image-height", "Height", sourceHeight) / sourceHeight) : sourceWidth;
        const targetHeight = heightValue ? numeric("image-height", "Height", sourceHeight) : widthValue ? Math.round(sourceHeight * targetWidth / sourceWidth) : sourceHeight;
        width = targetWidth; height = targetHeight;
      } else if (action === "compress") {
        width = sourceWidth; height = sourceHeight;
        if (mime === "image/png") throw new Error("Choose JPEG or WebP for lossy compression; PNG is lossless.");
      } else if (action === "convert") {
        width = sourceWidth; height = sourceHeight;
      } else if (action === "crop") {
        sx = Number(byId["crop-x"].value) || 0;
        sy = Number(byId["crop-y"].value) || 0;
        sw = numeric("crop-width", "Crop width", sourceWidth);
        sh = numeric("crop-height", "Crop height", sourceHeight);
        if (sx < 0 || sy < 0 || sx + sw > sourceWidth || sy + sh > sourceHeight) throw new Error(`Crop bounds exceed the source image (${sourceWidth} × ${sourceHeight} px).`);
        width = sw; height = sh;
      } else if (action === "rotate") {
        rotation = Number(byId["rotate-angle"].value);
        if (rotation === 90 || rotation === 270) { width = sourceHeight; height = sourceWidth; }
      } else if (action === "flip") {
        flip = byId["flip-axis"].value;
      } else if (action === "grayscale") {
        grayscale = true;
      } else if (action === "thumbnail") {
        const target = clampSide(sourceWidth, sourceHeight, numeric("thumb-width", "Maximum width", 320), numeric("thumb-height", "Maximum height", 320));
        width = target.width; height = target.height;
      } else if (action === "favicon") {
        const side = Number(byId["favicon-size"].value);
        if (!Number.isInteger(side) || side < 16 || side > 256) throw new Error("Choose a favicon size from 16 to 256 pixels.");
        const square = Math.min(sourceWidth, sourceHeight);
        sx = Math.floor((sourceWidth - square) / 2); sy = Math.floor((sourceHeight - square) / 2);
        sw = square; sh = square; width = side; height = side; mime = "image/png";
      }
      if (width < 1 || height < 1 || width > 16384 || height > 16384 || width * height > 60000000) throw new Error("Output dimensions are too large (maximum side 16,384 px and 60 megapixels total).");

      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const context = canvas.getContext("2d", { alpha: mime !== "image/jpeg" });
      if (!context) throw new Error("Canvas image processing is unavailable in this browser.");
      if (mime === "image/jpeg") { context.fillStyle = "#fff"; context.fillRect(0, 0, width, height); }
      if (grayscale) context.filter = "grayscale(100%)";
      if (rotation) {
        context.translate(width / 2, height / 2);
        context.rotate(rotation * Math.PI / 180);
        context.drawImage(bitmap, -sourceWidth / 2, -sourceHeight / 2, sourceWidth, sourceHeight);
      } else if (flip) {
        context.translate(flip === "horizontal" ? width : 0, flip === "vertical" ? height : 0);
        context.scale(flip === "horizontal" ? -1 : 1, flip === "vertical" ? -1 : 1);
        context.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);
      } else {
        context.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);
      }
      const blob = await drawToBlob(canvas, mime, quality);
      const basename = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "-") || "image";
      const suffix = action === "favicon" ? `favicon-${width}` : action;
      renderImage(blob, `${basename}-${suffix}.${extensionFor(mime)}`, width, height);
      status.textContent = `${operations.find(item => item[0] === action)[1]} complete. Output: ${width} × ${height} px (${(blob.size / 1024).toFixed(1)} KB).`;
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "Could not process this image.";
    } finally {
      bitmap?.close();
      run.disabled = false;
    }
  });
})();
