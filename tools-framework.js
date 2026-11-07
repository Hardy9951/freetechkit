(() => {
  "use strict";
  const tools = [];
  const ids = new Set();
  window.FreeTechKitTools = {
    tools,
    register(entries) {
      for (const tool of entries) {
        if (!tool || !/^[a-z0-9-]+$/.test(tool.id) || ids.has(tool.id) || typeof tool.run !== "function") {
          throw new TypeError("Invalid or duplicate FreeTechKit tool registration.");
        }
        if (!Array.isArray(tool.fields) || tool.fields.some(field => !/^[a-zA-Z][a-zA-Z0-9]*$/.test(field.name) || !["text", "textarea", "number", "select", "checkbox"].includes(field.type))) {
          throw new TypeError(`Invalid fields in tool: ${tool.id}`);
        }
        ids.add(tool.id);
        tools.push(tool);
      }
    }
  };
})();
