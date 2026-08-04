# mcp-json

JSON tools MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `validate_json` | Validate a JSON string (keyless, offline). Returns whether it is valid and, if not, the error message and the character position. |
| `format_json` | Pretty-print or minify a JSON string. `indent` sets spaces (default 2); pass 0 to minify to a single line. Keyless, offline. |
| `query_json` | Extract a value from JSON at a path using dot/bracket notation, e.g. "user.addresses[0].city". Keyless, offline. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "json": {
      "url": "https://gateway.pipeworx.io/json/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Json data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
