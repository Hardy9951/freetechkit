(() => {
  "use strict";
  const tools = [
    {
      id: "char-counter", name: "Character Counter", category: "Text", description: "Count characters with and without spaces.",
      fields: [{ name: "text", label: "Text", type: "textarea", default: "" }],
      run: ({ text = "" }) => `Characters (including spaces): ${[...text].length}\nCharacters (excluding whitespace): ${[...text].filter(char => !/\s/u.test(char)).length}`
    },
    {
      id: "line-counter", name: "Line Counter", category: "Text", description: "Count total, non-empty, and blank lines.",
      fields: [{ name: "text", label: "Text", type: "textarea", default: "" }],
      run: ({ text = "" }) => { const lines = text ? text.split(/\r\n|\r|\n/u) : []; return `Total lines: ${lines.length}\nNon-empty lines: ${lines.filter(line => line.trim()).length}\nBlank lines: ${lines.filter(line => !line.trim()).length}`; }
    },
    {
      id: "case-converter", name: "Case Converter", category: "Text", description: "Convert text to upper, lower, or sentence case.",
      fields: [{ name: "text", label: "Text", type: "textarea", default: "" }, { name: "case", label: "Case", type: "select", default: "upper", options: [{ label: "UPPERCASE", value: "upper" }, { label: "lowercase", value: "lower" }, { label: "Sentence case", value: "sentence" }] }],
      run: ({ text = "", case: mode }) => mode === "upper" ? text.toLocaleUpperCase() : mode === "lower" ? text.toLocaleLowerCase() : text.toLocaleLowerCase().replace(/(^|[.!?]\s+)(\p{L})/gu, (_, before, letter) => before + letter.toLocaleUpperCase())
    },
    {
      id: "reverse-text", name: "Reverse Text", category: "Text", description: "Reverse text by Unicode character.",
      fields: [{ name: "text", label: "Text", type: "textarea", default: "" }],
      run: ({ text = "" }) => [...text].reverse().join("")
    },
    {
      id: "whitespace-cleaner", name: "Whitespace Cleaner", category: "Text", description: "Trim lines and collapse repeated spaces.",
      fields: [{ name: "text", label: "Text", type: "textarea", default: "" }],
      run: ({ text = "" }) => text.split(/\r\n|\r|\n/u).map(line => line.trim().replace(/[\t ]+/gu, " ")).join("\n").trim()
    },
    {
      id: "slug-generator", name: "URL Slug Generator", category: "Text", description: "Turn a title into a lowercase URL-friendly slug.",
      fields: [{ name: "text", label: "Title", type: "text", default: "" }],
      run: ({ text = "" }) => text.normalize("NFKD").replace(/[\u0300-\u036f]/gu, "").toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/gu, "")
    },
    {
      id: "url-encoder", name: "URL Component Encoder", category: "Encoding", description: "Encode text for safe use as a URL component.",
      fields: [{ name: "text", label: "Text", type: "textarea", default: "" }],
      run: ({ text = "" }) => encodeURIComponent(text)
    },
    {
      id: "url-decoder", name: "URL Component Decoder", category: "Encoding", description: "Decode percent-encoded URL text.",
      fields: [{ name: "text", label: "Encoded text", type: "textarea", default: "" }],
      run: ({ text = "" }) => { try { return decodeURIComponent(text.replace(/\+/gu, "%20")); } catch { return "Invalid percent-encoded text."; } }
    },
    {
      id: "base64-encoder", name: "Base64 Encoder", category: "Encoding", description: "Encode UTF-8 text as Base64 in your browser.",
      fields: [{ name: "text", label: "Text", type: "textarea", default: "" }],
      run: ({ text = "" }) => { const bytes = new TextEncoder().encode(text); let binary = ""; bytes.forEach(byte => { binary += String.fromCharCode(byte); }); return btoa(binary); }
    },
    {
      id: "base64-decoder", name: "Base64 Decoder", category: "Encoding", description: "Decode Base64 data as UTF-8 text.",
      fields: [{ name: "text", label: "Base64", type: "textarea", default: "" }],
      run: ({ text = "" }) => { try { const binary = atob(text.replace(/\s/gu, "")); const bytes = Uint8Array.from(binary, char => char.charCodeAt(0)); return new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { return "Invalid Base64 or the decoded bytes are not valid UTF-8."; } }
    },
    {
      id: "html-escaper", name: "HTML Escape / Unescape", category: "Text", description: "Escape special HTML characters or decode common entities.",
      fields: [{ name: "text", label: "Text", type: "textarea", default: "" }, { name: "mode", label: "Action", type: "select", default: "escape", options: [{ label: "Escape HTML", value: "escape" }, { label: "Unescape common entities", value: "unescape" }] }],
      run: ({ text = "", mode }) => mode === "escape" ? text.replace(/[&<>"']/gu, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]) : text.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|#39);/giu, (entity, code) => { const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'" }; if (code[0] !== "#") return named[code.toLowerCase()] ?? entity; const point = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1)); try { return String.fromCodePoint(point); } catch { return entity; } })
    },
    {
      id: "regex-matcher", name: "Regular Expression Matcher", category: "Developer", description: "Find matches and capture groups using a JavaScript regular expression.",
      fields: [{ name: "pattern", label: "Pattern", type: "text", default: "\b\w+\b" }, { name: "flags", label: "Flags", type: "text", default: "gi" }, { name: "text", label: "Text to search", type: "textarea", default: "" }],
      run: ({ pattern = "", flags = "", text = "" }) => { try { const safeFlags = [...new Set(flags.replace(/[^dgimsuvy]/gu, ""))].join(""); const regex = new RegExp(pattern, safeFlags.includes("g") ? safeFlags : safeFlags + "g"); const matches = [...text.matchAll(regex)]; return matches.length ? matches.map((match, index) => `${index + 1}. ${JSON.stringify(match[0])}${match.length > 1 ? ` (groups: ${match.slice(1).map(value => JSON.stringify(value)).join(", ")})` : ""}`).join("\n") : "No matches."; } catch (error) { return `Invalid regular expression: ${error.message}`; } }
    },
    {
      id: "word-frequency", name: "Word Frequency Counter", category: "Text", description: "Count how often each word appears.",
      fields: [{ name: "text", label: "Text", type: "textarea", default: "" }],
      run: ({ text = "" }) => { const counts = new Map(); for (const word of text.toLocaleLowerCase().matchAll(/[\p{L}\p{N}']+/gu)) counts.set(word[0], (counts.get(word[0]) || 0) + 1); return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([word, count]) => `${word}: ${count}`).join("\n") || "No words found."; }
    },
    {
      id: "find-replace", name: "Find and Replace", category: "Text", description: "Replace every exact occurrence of one phrase with another.",
      fields: [{ name: "text", label: "Text", type: "textarea", default: "" }, { name: "find", label: "Find", type: "text", default: "" }, { name: "replace", label: "Replace with", type: "text", default: "" }],
      run: ({ text = "", find = "", replace = "" }) => find ? text.split(find).join(replace) : "Enter text to find."
    },
    {
      id: "percentage-calculator", name: "Percentage Calculator", category: "Math", description: "Find a percentage of a value.",
      fields: [{ name: "percent", label: "Percent", type: "number", default: "15" }, { name: "value", label: "Value", type: "number", default: "200" }],
      run: ({ percent, value }) => { const p = Number(percent), v = Number(value); return Number.isFinite(p) && Number.isFinite(v) ? `${p}% of ${v} = ${v * p / 100}` : "Enter valid numbers."; }
    },
    {
      id: "tip-calculator", name: "Tip Calculator", category: "Math", description: "Calculate tip and per-person total.",
      fields: [{ name: "bill", label: "Bill amount", type: "number", default: "50" }, { name: "tip", label: "Tip percent", type: "number", default: "18" }, { name: "people", label: "People", type: "number", default: "2", min: "1" }],
      run: ({ bill, tip, people }) => { const b = Number(bill), t = Number(tip), n = Number(people); if (![b, t, n].every(Number.isFinite) || b < 0 || t < 0 || n < 1) return "Enter a non-negative bill and tip, and at least one person."; return `Tip: ${(b * t / 100).toFixed(2)}\nTotal: ${(b * (1 + t / 100)).toFixed(2)}\nPer person: ${(b * (1 + t / 100) / n).toFixed(2)}`; }
    },
    {
      id: "discount-calculator", name: "Discount Calculator", category: "Math", description: "Calculate the sale price and savings.",
      fields: [{ name: "price", label: "Original price", type: "number", default: "100" }, { name: "discount", label: "Discount percent", type: "number", default: "20" }],
      run: ({ price, discount }) => { const p = Number(price), d = Number(discount); if (!Number.isFinite(p) || !Number.isFinite(d) || p < 0 || d < 0 || d > 100) return "Enter a non-negative price and a discount from 0 to 100%."; return `Savings: ${(p * d / 100).toFixed(2)}\nSale price: ${(p * (1 - d / 100)).toFixed(2)}`; }
    },
    {
      id: "sales-tax-calculator", name: "Sales Tax Calculator", category: "Math", description: "Add sales tax to a price or find the tax portion.",
      fields: [{ name: "price", label: "Price before tax", type: "number", default: "100" }, { name: "tax", label: "Tax percent", type: "number", default: "8.25" }],
      run: ({ price, tax }) => { const p = Number(price), t = Number(tax); if (!Number.isFinite(p) || !Number.isFinite(t) || p < 0 || t < 0) return "Enter non-negative price and tax values."; return `Tax: ${(p * t / 100).toFixed(2)}\nTotal: ${(p * (1 + t / 100)).toFixed(2)}`; }
    },
    {
      id: "average-calculator", name: "Average Calculator", category: "Math", description: "Calculate count, sum, mean, median, minimum, and maximum.",
      fields: [{ name: "numbers", label: "Numbers separated by commas or spaces", type: "textarea", default: "4, 8, 15, 16, 23, 42" }],
      run: ({ numbers = "" }) => { const values = numbers.trim().split(/[\s,;]+/u).filter(Boolean).map(Number); if (!values.length || values.some(value => !Number.isFinite(value))) return "Enter one or more valid numbers."; const sorted = [...values].sort((a, b) => a - b), sum = values.reduce((a, b) => a + b, 0), mid = Math.floor(sorted.length / 2); return `Count: ${values.length}\nSum: ${sum}\nMean: ${sum / values.length}\nMedian: ${sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2}\nMinimum: ${sorted[0]}\nMaximum: ${sorted.at(-1)}`; }
    },
    {
      id: "bmi-calculator", name: "BMI Calculator", category: "Health & Math", description: "Calculate body mass index from metric measurements.",
      fields: [{ name: "weight", label: "Weight in kilograms", type: "number", default: "70" }, { name: "height", label: "Height in centimeters", type: "number", default: "175" }],
      run: ({ weight, height }) => { const w = Number(weight), h = Number(height) / 100; if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return "Enter positive weight and height values."; return `BMI: ${(w / (h * h)).toFixed(1)}\nThis is a screening measure, not a diagnosis.`; }
    },
    {
      id: "length-converter", name: "Length Converter", category: "Conversion", description: "Convert between metric and imperial length units.",
      fields: [{ name: "value", label: "Value", type: "number", default: "1" }, { name: "from", label: "From", type: "select", default: "m", options: [{ label: "Millimeters", value: "mm" }, { label: "Centimeters", value: "cm" }, { label: "Meters", value: "m" }, { label: "Kilometers", value: "km" }, { label: "Inches", value: "in" }, { label: "Feet", value: "ft" }, { label: "Yards", value: "yd" }, { label: "Miles", value: "mi" }] }, { name: "to", label: "To", type: "select", default: "ft", options: [{ label: "Millimeters", value: "mm" }, { label: "Centimeters", value: "cm" }, { label: "Meters", value: "m" }, { label: "Kilometers", value: "km" }, { label: "Inches", value: "in" }, { label: "Feet", value: "ft" }, { label: "Yards", value: "yd" }, { label: "Miles", value: "mi" }] }],
      run: ({ value, from, to }) => { const factors = { mm: .001, cm: .01, m: 1, km: 1000, in: .0254, ft: .3048, yd: .9144, mi: 1609.344 }; const n = Number(value); return Number.isFinite(n) ? `${n} ${from} = ${(n * factors[from] / factors[to]).toPrecision(8)} ${to}` : "Enter a valid number."; }
    },
    {
      id: "weight-converter", name: "Weight Converter", category: "Conversion", description: "Convert between common mass units.",
      fields: [{ name: "value", label: "Value", type: "number", default: "1" }, { name: "from", label: "From", type: "select", default: "kg", options: [{ label: "Milligrams", value: "mg" }, { label: "Grams", value: "g" }, { label: "Kilograms", value: "kg" }, { label: "Ounces", value: "oz" }, { label: "Pounds", value: "lb" }, { label: "US tons", value: "ton" }] }, { name: "to", label: "To", type: "select", default: "lb", options: [{ label: "Milligrams", value: "mg" }, { label: "Grams", value: "g" }, { label: "Kilograms", value: "kg" }, { label: "Ounces", value: "oz" }, { label: "Pounds", value: "lb" }, { label: "US tons", value: "ton" }] }],
      run: ({ value, from, to }) => { const factors = { mg: 1e-6, g: .001, kg: 1, oz: .028349523125, lb: .45359237, ton: 907.18474 }; const n = Number(value); return Number.isFinite(n) ? `${n} ${from} = ${(n * factors[from] / factors[to]).toPrecision(8)} ${to}` : "Enter a valid number."; }
    },
    {
      id: "temperature-converter", name: "Temperature Converter", category: "Conversion", description: "Convert Celsius, Fahrenheit, and Kelvin.",
      fields: [{ name: "value", label: "Temperature", type: "number", default: "20" }, { name: "from", label: "From", type: "select", default: "C", options: [{ label: "Celsius", value: "C" }, { label: "Fahrenheit", value: "F" }, { label: "Kelvin", value: "K" }] }, { name: "to", label: "To", type: "select", default: "F", options: [{ label: "Celsius", value: "C" }, { label: "Fahrenheit", value: "F" }, { label: "Kelvin", value: "K" }] }],
      run: ({ value, from, to }) => { const n = Number(value); if (!Number.isFinite(n)) return "Enter a valid temperature."; const c = from === "C" ? n : from === "F" ? (n - 32) * 5 / 9 : n - 273.15; const result = to === "C" ? c : to === "F" ? c * 9 / 5 + 32 : c + 273.15; return `${n} °${from} = ${result.toFixed(2)} °${to}`; }
    },
    {
      id: "unix-time-converter", name: "Unix Timestamp Converter", category: "Date & Time", description: "Convert Unix seconds or milliseconds to a UTC date and time.",
      fields: [{ name: "timestamp", label: "Timestamp", type: "number", default: "0" }, { name: "unit", label: "Timestamp unit", type: "select", default: "seconds", options: [{ label: "Seconds", value: "seconds" }, { label: "Milliseconds", value: "milliseconds" }] }],
      run: ({ timestamp, unit }) => { const n = Number(timestamp), date = new Date(n * (unit === "seconds" ? 1000 : 1)); return Number.isFinite(n) && Number.isFinite(date.getTime()) ? `${date.toISOString()} (UTC)` : "Enter a valid timestamp."; }
    },
    {
      id: "age-calculator", name: "Age Calculator", category: "Date & Time", description: "Calculate age on a chosen date using calendar dates in UTC.",
      fields: [{ name: "birth", label: "Date of birth", type: "text", default: "2000-01-01" }, { name: "asof", label: "Age on date", type: "text", default: new Date().toISOString().slice(0, 10) }],
      run: ({ birth, asof }) => { const parse = value => { if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return null; const date = new Date(`${value}T00:00:00Z`); return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null; }; const b = parse(birth), a = parse(asof); if (!b || !a || a < b) return "Enter valid dates and ensure the age-on date is not before birth."; let years = a.getUTCFullYear() - b.getUTCFullYear(); const month = a.getUTCMonth() - b.getUTCMonth(); if (month < 0 || (month === 0 && a.getUTCDate() < b.getUTCDate())) years--; return `Age: ${years} years\nCalendar dates interpreted in UTC.`; }
    },
    {
      id: "date-difference", name: "Days Between Dates", category: "Date & Time", description: "Count elapsed days between two calendar dates in UTC.",
      fields: [{ name: "start", label: "Start date", type: "text", default: "2026-01-01" }, { name: "end", label: "End date", type: "text", default: "2026-01-31" }],
      run: ({ start, end }) => { const parse = value => { if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return null; const date = new Date(`${value}T00:00:00Z`); return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null; }; const a = parse(start), b = parse(end); return a && b ? `${Math.abs(b - a) / 86400000} elapsed days\nCalendar dates interpreted in UTC.` : "Enter valid dates in YYYY-MM-DD format."; }
    },
    {
      id: "date-adder", name: "Add Days to Date", category: "Date & Time", description: "Add or subtract days from a calendar date in UTC.",
      fields: [{ name: "date", label: "Start date", type: "text", default: "2026-01-01" }, { name: "days", label: "Days to add (negative to subtract)", type: "number", default: "30" }],
      run: ({ date, days }) => { if (!/^\d{4}-\d{2}-\d{2}$/u.test(date)) return "Enter a date in YYYY-MM-DD format."; const d = new Date(`${date}T00:00:00Z`), n = Number(days); if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== date || !Number.isInteger(n)) return "Enter a valid date and whole number of days."; d.setUTCDate(d.getUTCDate() + n); return Number.isFinite(d.getTime()) ? `${d.toISOString().slice(0, 10)} (UTC calendar date)` : "Result is outside the supported date range."; }
    },
    {
      id: "hex-to-rgb", name: "HEX to RGB Converter", category: "Color", description: "Convert a 3- or 6-digit HEX color to RGB.",
      fields: [{ name: "hex", label: "HEX color", type: "text", default: "#6846e8" }],
      run: ({ hex = "" }) => { let value = hex.trim().replace(/^#/u, ""); if (/^[\da-f]{3}$/iu.test(value)) value = [...value].map(char => char + char).join(""); if (!/^[\da-f]{6}$/iu.test(value)) return "Enter a HEX color such as #6846e8 or #68e."; const nums = value.match(/../gu).map(pair => parseInt(pair, 16)); return `rgb(${nums.join(", ")})`; }
    },
    {
      id: "rgb-to-hex", name: "RGB to HEX Converter", category: "Color", description: "Convert red, green, and blue channel values to HEX.",
      fields: [{ name: "red", label: "Red (0–255)", type: "number", default: "104", min: "0", max: "255" }, { name: "green", label: "Green (0–255)", type: "number", default: "70", min: "0", max: "255" }, { name: "blue", label: "Blue (0–255)", type: "number", default: "232", min: "0", max: "255" }],
      run: ({ red, green, blue }) => { const values = [red, green, blue].map(Number); return values.every(value => Number.isInteger(value) && value >= 0 && value <= 255) ? `#${values.map(value => value.toString(16).padStart(2, "0")).join("")}` : "Enter whole-number RGB values from 0 to 255."; }
    },
    {
      id: "contrast-ratio", name: "Color Contrast Checker", category: "Color", description: "Calculate WCAG contrast ratio for two HEX colors.",
      fields: [{ name: "foreground", label: "Foreground HEX", type: "text", default: "#101827" }, { name: "background", label: "Background HEX", type: "text", default: "#ffffff" }],
      run: ({ foreground, background }) => { const luminance = hex => { let value = hex.trim().replace(/^#/u, ""); if (/^[\da-f]{3}$/iu.test(value)) value = [...value].map(char => char + char).join(""); if (!/^[\da-f]{6}$/iu.test(value)) return null; const channels = value.match(/../gu).map(pair => parseInt(pair, 16) / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4); return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2]; }; const a = luminance(foreground), b = luminance(background); if (a === null || b === null) return "Enter valid 3- or 6-digit HEX colors."; const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05); return `Contrast ratio: ${ratio.toFixed(2)}:1\nWCAG AA normal text (4.5:1): ${ratio >= 4.5 ? "Pass" : "Fail"}\nWCAG AA large text (3:1): ${ratio >= 3 ? "Pass" : "Fail"}`; }
    },
    {
      id: "rgb-to-hsl", name: "RGB to HSL Converter", category: "Color", description: "Convert RGB channels into HSL values.",
      fields: [{ name: "red", label: "Red (0–255)", type: "number", default: "104" }, { name: "green", label: "Green (0–255)", type: "number", default: "70" }, { name: "blue", label: "Blue (0–255)", type: "number", default: "232" }],
      run: ({ red, green, blue }) => { const nums = [red, green, blue].map(Number); if (!nums.every(value => Number.isInteger(value) && value >= 0 && value <= 255)) return "Enter whole-number RGB values from 0 to 255."; const [r, g, b] = nums.map(value => value / 255), max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min; let h = 0, s = 0; const l = (max + min) / 2; if (delta) { s = delta / (1 - Math.abs(2 * l - 1)); if (max === r) h = ((g - b) / delta) % 6; else if (max === g) h = (b - r) / delta + 2; else h = (r - g) / delta + 4; h *= 60; if (h < 0) h += 360; } return `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`; }
    },
    {
      id: "number-base-converter", name: "Number Base Converter", category: "Math", description: "Convert an integer between binary, decimal, and hexadecimal.",
      fields: [{ name: "number", label: "Integer", type: "text", default: "255" }, { name: "base", label: "Input base", type: "select", default: "10", options: [{ label: "Binary", value: "2" }, { label: "Decimal", value: "10" }, { label: "Hexadecimal", value: "16" }] }],
      run: ({ number = "", base }) => { try { const n = BigInt(`${base === "16" ? "0x" : base === "2" ? "0b" : ""}${number.trim().replace(/^0x/iu, "").replace(/^0b/iu, "")}`); return `Binary: ${n.toString(2)}\nDecimal: ${n.toString(10)}\nHexadecimal: ${n.toString(16).toUpperCase()}`; } catch { return "Enter a valid integer for the selected base."; } }
    },
    {
      id: "csv-to-tsv", name: "CSV to TSV Converter", category: "Text", description: "Replace CSV field separators with tabs while respecting quoted fields.",
      fields: [{ name: "text", label: "CSV input", type: "textarea", default: "name,city\nAda,London" }],
      run: ({ text = "" }) => { const rows = []; let row = [], cell = "", quoted = false; for (let i = 0; i < text.length; i++) { const char = text[i]; if (char === '"') { if (quoted && text[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; } else if (char === "," && !quoted) { row.push(cell); cell = ""; } else if ((char === "\n" || char === "\r") && !quoted) { row.push(cell); rows.push(row); row = []; cell = ""; if (char === "\r" && text[i + 1] === "\n") i++; } else { cell += char; } } if (cell || row.length || text.endsWith(",")) { row.push(cell); rows.push(row); } const output = rows.map(fields => fields.join("\t")).join("\n"); return quoted ? `Warning: unclosed quoted field.\n${output}` : output; }
    },
    {
      id: "markdown-table", name: "Markdown Table Generator", category: "Text", description: "Create a Markdown table from comma-separated rows.",
      fields: [{ name: "text", label: "CSV rows (first row becomes header)", type: "textarea", default: "Name,Role\nAda,Programmer\nGrace,Computer scientist" }],
      run: ({ text = "" }) => { const rows = text.split(/\r?\n/u).filter(Boolean).map(line => line.split(",").map(cell => cell.trim().replace(/\|/gu, "\\|"))); if (!rows.length) return "Enter at least one row."; const width = Math.max(...rows.map(row => row.length)); const normalize = row => Array.from({ length: width }, (_, index) => row[index] ?? ""); const header = normalize(rows[0]); return `| ${header.join(" | ")} |\n| ${header.map(() => "---").join(" | ")} |\n${rows.slice(1).map(row => `| ${normalize(row).join(" | ")} |`).join("\n")}`; }
    }
  ];
  window.FreeTechKitTools.register(tools);
})();
