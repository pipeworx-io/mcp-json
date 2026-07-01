interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * JSON tools MCP.
 *
 * Keyless, offline: validate JSON (with the parse-error position), pretty-print
 * or minify it, and extract a value at a dot/bracket path. Pure functions — no
 * API, no key.
 */


const tools: McpToolExport['tools'] = [
  {
    name: 'validate_json',
    description: 'Validate a JSON string (keyless, offline). Returns whether it is valid and, if not, the error message and the character position.',
    inputSchema: { type: 'object', properties: { json: { type: 'string', description: 'The JSON text to validate.' } }, required: ['json'] },
  },
  {
    name: 'format_json',
    description: 'Pretty-print or minify a JSON string. `indent` sets spaces (default 2); pass 0 to minify to a single line. Keyless, offline.',
    inputSchema: { type: 'object', properties: { json: { type: 'string', description: 'The JSON text.' }, indent: { type: 'number', description: 'Indent spaces (default 2; 0 = minify).' } }, required: ['json'] },
  },
  {
    name: 'query_json',
    description: 'Extract a value from JSON at a path using dot/bracket notation, e.g. "user.addresses[0].city". Keyless, offline.',
    inputSchema: { type: 'object', properties: { json: { type: 'string', description: 'The JSON text.' }, path: { type: 'string', description: 'A path like "a.b[0].c".' } }, required: ['json', 'path'] },
  },
];

function parseWithPos(text: string): { ok: true; value: unknown } | { ok: false; message: string; position: number | null } {
  try { return { ok: true, value: JSON.parse(text) }; }
  catch (e) {
    const msg = (e as Error).message;
    const m = msg.match(/position (\d+)/);
    return { ok: false, message: msg, position: m ? +m[1] : null };
  }
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const json = reqStr(args, 'json', '{"a":1}');
  switch (name) {
    case 'validate_json': {
      const r = parseWithPos(json);
      return r.ok ? { valid: true } : { valid: false, error: r.message, position: r.position };
    }
    case 'format_json': {
      const r = parseWithPos(json);
      if (!r.ok) return { valid: false, error: r.message, position: r.position };
      const indent = typeof args.indent === 'number' ? args.indent : 2;
      return { valid: true, formatted: JSON.stringify(r.value, null, indent) };
    }
    case 'query_json': {
      const r = parseWithPos(json);
      if (!r.ok) return { valid: false, error: r.message, position: r.position };
      const path = reqStr(args, 'path', '"a.b[0]"');
      const keys = path.replace(/\[(\d+)\]/g, '.$1').replace(/^\./, '').split('.').filter(Boolean);
      let cur: unknown = r.value;
      for (const k of keys) {
        if (cur == null || typeof cur !== 'object') return { path, found: false, reason: `Cannot descend into "${k}"; the parent is not an object/array.` };
        cur = (cur as Record<string, unknown>)[k];
        if (cur === undefined) return { path, found: false, reason: `Key "${k}" not found.` };
      }
      return { path, found: true, value: cur, type: Array.isArray(cur) ? 'array' : cur === null ? 'null' : typeof cur };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function reqStr(args: Record<string, unknown>, key: string, ex: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.length) throw new Error(`Required argument "${key}" is missing. Pass a string like ${ex}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
