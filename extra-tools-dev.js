(() => {
  "use strict";
  const field = (name, label, type = "text", extra = {}) => ({ name, label, type, ...extra });
  const tool = (id, name, category, description, fields, run) => ({ id, name, category, description, fields, run });
  const textField = (name, label, value = "") => field(name, label, "textarea", { default: value });
  const utf8Base64 = value => {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  };
  const base64Utf8 = value => {
    const binary = atob(value.replace(/\s+/g, ""));
    return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(binary, char => char.charCodeAt(0)));
  };
  const bytesToHex = bytes => [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
  const hexToBytes = value => {
    const clean = value.replace(/\s+/g, "").replace(/^0x/i, "");
    if (!/^(?:[\da-f]{2})*$/i.test(clean)) throw new Error("Enter an even number of hexadecimal digits.");
    return Uint8Array.from(clean.match(/.{2}/g) || [], pair => parseInt(pair, 16));
  };
  const ipNumber = value => {
    const parts = value.trim().split(".");
    if (parts.length !== 4 || parts.some(part => !/^\d{1,3}$/.test(part) || Number(part) > 255)) throw new Error("Enter a valid IPv4 address.");
    return parts.reduce((n, part) => (n * 256 + Number(part)) >>> 0, 0) >>> 0;
  };
  const ipString = n => [n >>> 24, n >>> 16 & 255, n >>> 8 & 255, n & 255].join(".");
  const tools = [
    tool("url-parser", "URL Parser", "Developer", "Inspect the parts of an absolute URL.", [textField("url", "URL", "https://example.com/path?name=Robin#section")], v => {
      const url = new URL(v.url);
      return [`Protocol: ${url.protocol}`, `Hostname: ${url.hostname}`, `Port: ${url.port || "(default)"}`, `Path: ${url.pathname}`, `Query: ${url.search || "(none)"}`, `Fragment: ${url.hash || "(none)"}`].join("\n");
    }),
    tool("query-parser", "Query String Parser", "Developer", "List decoded query parameters from a URL or query string.", [textField("query", "URL or query string", "?q=free%20tools&tag=web&tag=local")], v => {
      const query = v.query.includes("?") ? v.query.slice(v.query.indexOf("?") + 1).split("#")[0] : v.query.replace(/^\?/, "");
      const params = new URLSearchParams(query);
      const rows = [...params].map(([key, value]) => `${key} = ${value}`);
      return rows.length ? rows.join("\n") : "No query parameters found.";
    }),
    tool("query-builder", "Query String Builder", "Developer", "Build an encoded query string from key-value lines.", [textField("pairs", "One key=value pair per line", "q=free tools\ntag=browser\ntag=local")], v => {
      const params = new URLSearchParams();
      for (const line of v.pairs.split(/\r?\n/)) {
        if (!line.trim()) continue;
        const split = line.indexOf("=");
        if (split < 0) params.append(line.trim(), "");
        else params.append(line.slice(0, split).trim(), line.slice(split + 1).trim());
      }
      return params.toString();
    }),
    tool("regex-tester", "Regular Expression Tester", "Developer", "Find matches with a JavaScript regular expression.", [field("pattern", "Pattern", "text", { default: "\\b\w+\\b" }), field("flags", "Flags (gimsuy)", "text", { default: "g" }), textField("input", "Test text", "Find words in this sentence.")], v => {
      const flags = v.flags.includes("g") ? v.flags : `${v.flags}g`;
      const regex = new RegExp(v.pattern, flags);
      const matches = [...v.input.matchAll(regex)];
      return matches.length ? matches.map((match, index) => `${index + 1}. ${JSON.stringify(match[0])} at index ${match.index}`).join("\n") : "No matches.";
    }),
    tool("regex-replace", "Regular Expression Replace", "Developer", "Replace text using a JavaScript regular expression.", [field("pattern", "Pattern", "text", { default: "\\s+" }), field("flags", "Flags (gimsuy)", "text", { default: "g" }), field("replacement", "Replacement", "text", { default: " " }), textField("input", "Input text", "Clean    up   extra spaces.")], v => v.input.replace(new RegExp(v.pattern, v.flags), v.replacement)),
    tool("json-sort-keys", "JSON Key Sorter", "Developer", "Sort object keys recursively and pretty-print valid JSON.", [textField("json", "JSON", '{"z":1,"a":{"y":2,"b":3}}')], v => {
      const sort = value => Array.isArray(value) ? value.map(sort) : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map(key => [key, sort(value[key])])) : value;
      return JSON.stringify(sort(JSON.parse(v.json)), null, 2);
    }),
    tool("json-to-csv", "JSON to CSV", "Developer", "Convert an array of flat JSON objects into CSV.", [textField("json", "Array of JSON objects", '[{"name":"Ada","role":"engineer"},{"name":"Lin","role":"designer"}]')], v => {
      const rows = JSON.parse(v.json);
      if (!Array.isArray(rows) || rows.some(row => !row || Array.isArray(row) || typeof row !== "object")) throw new Error("Input must be an array of objects.");
      const keys = [...new Set(rows.flatMap(Object.keys))];
      const quote = value => `"${String(value ?? "").replace(/"/g, '""')}"`;
      return [keys.map(quote).join(","), ...rows.map(row => keys.map(key => quote(row[key])).join(","))].join("\n");
    }),
    tool("csv-to-json", "CSV to JSON", "Developer", "Convert simple comma-separated rows with a header into JSON objects.", [textField("csv", "CSV", "name,role\nAda,engineer\nLin,designer")], v => {
      const lines = v.csv.trim().split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) throw new Error("Add a header row and at least one data row.");
      const parse = line => line.match(/(?:"(?:[^"]|"")*"|[^,]*)(?:,|$)/g).filter((part, i, all) => i < all.length - 1 || part).map(part => part.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"'));
      const headers = parse(lines[0]);
      return JSON.stringify(lines.slice(1).map(line => Object.fromEntries(headers.map((key, i) => [key, parse(line)[i] ?? ""]))), null, 2);
    }),
    tool("html-escape", "HTML Entity Encoder", "Encoding", "Escape special characters for safe insertion as HTML text.", [textField("input", "Text", '<p title="demo">Tom & Jerry</p>')], v => v.input.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char])),
    tool("html-unescape", "HTML Entity Decoder", "Encoding", "Decode common named and numeric HTML entities into plain text.", [textField("input", "Encoded text", "Tom &amp; Jerry &lt;3 &#x1F680;")], v => v.input.replace(/&(#(?:x[\da-f]+|\d+)|amp|lt|gt|quot|apos|nbsp);/gi, (entity, code) => {
      const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0" };
      if (code[0] !== "#") return named[code.toLowerCase()] || entity;
      const number = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1));
      try { return String.fromCodePoint(number); } catch { return entity; }
    })),
    tool("js-string-escape", "JavaScript String Escaper", "Encoding", "Escape text for use inside a JavaScript string literal.", [textField("input", "Text", 'She said, "hello".\nNext line.')], v => JSON.stringify(v.input)),
    tool("text-to-base64", "Base64 Encoder", "Encoding", "Encode Unicode text as UTF-8 Base64.", [textField("input", "Text", "Hello, 世界 🌍")], v => utf8Base64(v.input)),
    tool("base64-to-text", "Base64 Decoder", "Encoding", "Decode UTF-8 text from Base64.", [textField("input", "Base64", "SGVsbG8sIOS4lueVjCDwn4yN")], v => base64Utf8(v.input)),
    tool("text-to-base64url", "Base64URL Encoder", "Encoding", "Encode Unicode text using URL-safe Base64 without padding.", [textField("input", "Text", "https://example.com/?x=1")], v => utf8Base64(v.input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")),
    tool("base64url-to-text", "Base64URL Decoder", "Encoding", "Decode UTF-8 text from URL-safe Base64.", [textField("input", "Base64URL", "SGVsbG8td29ybGQ")], v => base64Utf8(v.input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(v.input.length / 4) * 4, "="))),
    tool("text-to-hex", "Text to Hex", "Encoding", "Show UTF-8 bytes as hexadecimal pairs.", [textField("input", "Text", "Hello")], v => bytesToHex(new TextEncoder().encode(v.input))),
    tool("hex-to-text", "Hex to Text", "Encoding", "Decode hexadecimal UTF-8 bytes into text.", [textField("input", "Hex bytes", "48656c6c6f")], v => new TextDecoder("utf-8", { fatal: true }).decode(hexToBytes(v.input))),
    tool("text-to-binary", "Text to Binary", "Encoding", "Convert each UTF-8 byte to an 8-bit binary value.", [textField("input", "Text", "Hi")], v => [...new TextEncoder().encode(v.input)].map(byte => byte.toString(2).padStart(8, "0")).join(" ")),
    tool("binary-to-text", "Binary to Text", "Encoding", "Decode groups of 8 binary bits as UTF-8 bytes.", [textField("input", "8-bit groups", "01001000 01101001")], v => {
      const groups = v.input.trim().split(/[\s,]+/).filter(Boolean);
      if (groups.some(group => !/^[01]{8}$/.test(group))) throw new Error("Use groups of exactly 8 bits separated by spaces.");
      return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(groups, group => parseInt(group, 2)));
    }),
    tool("unicode-inspector", "Unicode Inspector", "Encoding", "List code points and UTF-8 bytes for each character.", [textField("input", "Text", "A🌍")], v => [...v.input].map(char => `${JSON.stringify(char)}  U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}  UTF-8 ${bytesToHex(new TextEncoder().encode(char))}`).join("\n")),
    tool("url-encode", "URL Component Encoder", "Encoding", "Percent-encode text for use as one URL component.", [textField("input", "Text", "hello world & friends")], v => encodeURIComponent(v.input)),
    tool("url-decode", "URL Component Decoder", "Encoding", "Decode a percent-encoded URL component.", [textField("input", "Encoded text", "hello%20world%20%26%20friends")], v => decodeURIComponent(v.input.replace(/\+/g, " "))),
    tool("jwt-payload", "JWT Payload Decoder", "Security", "Decode a JWT payload for inspection. This does not verify its signature.", [textField("token", "JWT", "eyJhbGciOiJub25lIn0.eyJzdWIiOiJ1c2VyLTEyMyIsImlhdCI6MTcwMDAwMDAwMH0.x")], v => {
      const parts = v.token.trim().split(".");
      if (parts.length !== 3) throw new Error("A JWT should contain three dot-separated parts.");
      return JSON.stringify(JSON.parse(base64Utf8(parts[1].replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(parts[1].length / 4) * 4, "="))), null, 2) + "\n\nWarning: payload decoded only; signature and claims were not verified.";
    }),
    tool("uuid-v4", "UUID v4 Generator", "Security", "Generate a cryptographically random UUID using Web Crypto.", [], () => {
      if (!globalThis.crypto?.getRandomValues) throw new Error("Web Crypto is unavailable in this browser.");
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      bytes[6] = bytes[6] & 0x0f | 0x40;
      bytes[8] = bytes[8] & 0x3f | 0x80;
      const hex = bytesToHex(bytes);
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }),
    tool("basic-auth-header", "HTTP Basic Auth Header", "Security", "Build a Basic Authorization header value. Use only over HTTPS.", [field("username", "Username", "text", { default: "user" }), field("password", "Password", "text", { default: "pass" })], v => `Authorization: Basic ${utf8Base64(`${v.username}:${v.password}`)}\n\nBasic authentication is reversible encoding, not encryption. Send only over HTTPS.`),
    tool("jwt-expiry", "JWT Expiry Checker", "Security", "Read exp and nbf timestamps from a JWT without validating its signature.", [textField("token", "JWT", "")], v => {
      const part = v.token.trim().split(".")[1];
      if (!part) throw new Error("Enter a JWT with a payload segment.");
      const payload = JSON.parse(base64Utf8(part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=")));
      const lines = ["Signature is not verified."];
      for (const key of ["iat", "nbf", "exp"]) if (Number.isFinite(payload[key])) lines.push(`${key}: ${new Date(payload[key] * 1000).toISOString()} (${payload[key] <= Date.now() / 1000 ? "in the past" : "in the future"})`);
      return lines.join("\n");
    }),
    tool("ipv4-binary", "IPv4 to Binary", "Network", "Convert an IPv4 address into four 8-bit binary octets.", [field("ip", "IPv4 address", "text", { default: "192.168.1.1" })], v => ipNumber(v.ip).toString(2).padStart(32, "0").match(/.{8}/g).join(".")),
    tool("ipv4-integer", "IPv4 to Integer", "Network", "Convert an IPv4 address to its unsigned 32-bit integer form.", [field("ip", "IPv4 address", "text", { default: "192.168.1.1" })], v => String(ipNumber(v.ip))),
    tool("integer-ipv4", "Integer to IPv4", "Network", "Convert an unsigned 32-bit integer to an IPv4 address.", [field("number", "Unsigned 32-bit integer", "number", { default: "3232235777", min: 0, max: 4294967295 })], v => {
      const number = Number(v.number);
      if (!Number.isInteger(number) || number < 0 || number > 4294967295) throw new Error("Enter an integer from 0 to 4294967295.");
      return ipString(number >>> 0);
    }),
    tool("ipv4-class", "IPv4 Class & Scope", "Network", "Identify legacy IPv4 class and common private, loopback, or link-local ranges.", [field("ip", "IPv4 address", "text", { default: "192.168.1.1" })], v => {
      const ip = ipNumber(v.ip), first = ip >>> 24;
      const scope = first === 10 || first === 172 && (ip >>> 16 & 255) >= 16 && (ip >>> 16 & 255) <= 31 || first === 192 && (ip >>> 16 & 255) === 168 ? "Private RFC 1918" : first === 127 ? "Loopback" : first === 169 && (ip >>> 16 & 255) === 254 ? "Link-local" : "Not in the common private ranges";
      const klass = first < 128 ? "A" : first < 192 ? "B" : first < 224 ? "C" : first < 240 ? "D (multicast)" : "E (reserved)";
      return `Address: ${ipString(ip)}\nLegacy class: ${klass}\nScope: ${scope}\nNote: CIDR replaced class-based routing.`;
    }),
    tool("mac-normalizer", "MAC Address Formatter", "Network", "Validate a 48-bit MAC address and format it in common styles.", [field("mac", "MAC address", "text", { default: "a1:b2:c3:d4:e5:f6" })], v => {
      const clean = v.mac.replace(/[^\da-f]/gi, "");
      if (!/^[\da-f]{12}$/i.test(clean)) throw new Error("Enter 12 hexadecimal digits, optionally separated by colons or hyphens.");
      const pairs = clean.toLowerCase().match(/.{2}/g);
      return `Colon: ${pairs.join(":")}\nHyphen: ${pairs.join("-")}\nCisco: ${pairs.join("").match(/.{4}/g).join(".")}\nEUI-48: ${pairs.join(":").toUpperCase()}`;
    }),
    tool("port-reference", "Common Port Reference", "Network", "Look up common TCP/UDP ports by number or service name.", [field("query", "Port number or service", "text", { default: "443" })], v => {
      const ports = { ftp: "20/21", ssh: "22", telnet: "23", smtp: "25", dns: "53", dhcp: "67/68", http: "80", pop3: "110", ntp: "123", imap: "143", https: "443", smb: "445", submission: "587", ldaps: "636", imaps: "993", pop3s: "995", mssql: "1433", mysql: "3306", rdp: "3389", postgresql: "5432", redis: "6379", http_alt: "8080" };
      const query = v.query.trim().toLowerCase();
      if (/^\d+$/.test(query)) return Object.entries(ports).filter(([, port]) => port.split("/").includes(query)).map(([name, port]) => `${name}: ${port}`).join("\n") || "No common service listed for that port.";
      const key = query.replace(/\s+/g, "_");
      return ports[key] ? `${key}: ${ports[key]} (common service port)` : "Service not found in the built-in common-port list.";
    }),
    tool("http-status", "HTTP Status Code Reference", "Developer", "Look up a common HTTP response status code.", [field("code", "Status code", "number", { default: "404", min: 100, max: 599 })], v => {
      const statuses = { 200: "OK — request succeeded", 201: "Created — resource created", 204: "No Content — succeeded with no response body", 301: "Moved Permanently — permanent redirect", 302: "Found — temporary redirect", 304: "Not Modified — cached representation is still valid", 400: "Bad Request — invalid request", 401: "Unauthorized — authentication required", 403: "Forbidden — request refused", 404: "Not Found — resource does not exist", 405: "Method Not Allowed", 408: "Request Timeout", 409: "Conflict — request conflicts with current state", 410: "Gone — resource is no longer available", 418: "I'm a teapot (RFC 2324)", 422: "Unprocessable Content — request understood but invalid", 429: "Too Many Requests — rate limit reached", 500: "Internal Server Error", 501: "Not Implemented", 502: "Bad Gateway", 503: "Service Unavailable", 504: "Gateway Timeout" };
      return statuses[Number(v.code)] || "No description in this common-status reference.";
    }),
    tool("user-agent-inspector", "User Agent Inspector", "Developer", "Inspect a pasted browser user-agent string for common browser and platform tokens.", [textField("ua", "User-Agent string", "")], v => {
      const ua = v.ua;
      if (!ua) throw new Error("Paste a User-Agent string to inspect.");
      const browser = /Edg\//.test(ua) ? "Microsoft Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome/Chromium" : /Safari\//.test(ua) && !/Chrome\//.test(ua) ? "Safari" : "Unknown or other";
      const platform = /Windows NT/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad|iPod/.test(ua) ? "iOS/iPadOS" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Unknown or other";
      return `Likely browser: ${browser}\nLikely platform: ${platform}\n\n${ua}`;
    }),
    tool("unix-time", "Unix Timestamp Converter", "Developer", "Convert between Unix seconds and a readable UTC date.", [field("value", "Timestamp seconds or ISO date", "text", { default: "1700000000" })], v => {
      const raw = v.value.trim();
      const date = /^-?\d+(?:\.\d+)?$/.test(raw) ? new Date(Number(raw) * 1000) : new Date(raw);
      if (Number.isNaN(date.getTime())) throw new Error("Enter Unix seconds or a valid date string.");
      return `Unix seconds: ${Math.floor(date.getTime() / 1000)}\nUnix milliseconds: ${date.getTime()}\nUTC: ${date.toISOString()}\nLocal: ${date.toString()}`;
    }),
    tool("css-minifier", "CSS Minifier", "Developer", "Remove CSS comments and compress common whitespace safely enough for small snippets.", [textField("css", "CSS", "h1 { color: #123456; margin: 0 1rem; }")], v => v.css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{}:;,>])\s*/g, "$1").trim()),
    tool("text-to-rot13", "ROT13 Encoder", "Encoding", "Apply the ROT13 letter substitution (not encryption).", [textField("input", "Text", "FreeTechKit")], v => v.input.replace(/[a-z]/gi, char => String.fromCharCode(char.charCodeAt(0) + (char.toLowerCase() <= "m" ? 13 : -13)))),
    tool("cidr-mask", "CIDR Subnet Mask Helper", "Network", "Convert an IPv4 CIDR prefix to its subnet and wildcard masks.", [field("prefix", "CIDR prefix (0–32)", "number", { default: "24", min: 0, max: 32 })], v => {
      const prefix = Number(v.prefix);
      if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) throw new Error("Prefix must be an integer from 0 to 32.");
      const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
      return `Subnet mask: ${ipString(mask)}\nWildcard mask: ${ipString((~mask) >>> 0)}\nAddresses: ${(2 ** (32 - prefix)).toLocaleString()}\nPrefix: /${prefix}`;
    })
  ];

  window.FreeTechKitTools.register(tools);
})();
