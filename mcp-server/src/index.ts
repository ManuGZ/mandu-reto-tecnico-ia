#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { fetchDocText } from './google/doc-export.js';

const server = new McpServer({ name: 'google-docs-mcp-server', version: '1.0.0' });

const InputSchema = z
  .object({
    url: z
      .string()
      .min(1, 'La URL o ID es obligatorio')
      .describe('URL completa del Google Doc (.../document/d/<ID>/...) o el ID suelto'),
  })
  .strict();

server.registerTool(
  'read_google_doc',
  {
    title: 'Leer un Google Doc',
    description: [
      'Recibe la URL o el ID de un Google Doc público y devuelve su contenido en texto plano.',
      'Devuelve un envelope JSON: { ok:true, data:{ id, text } } o { ok:false, error:{ code, message } }.',
      'code en: INVALID_URL | NOT_FOUND | FORBIDDEN | FETCH_ERROR.',
      'El documento debe estar compartido como "cualquiera con el enlace".',
    ].join(' '),
    inputSchema: InputSchema.shape,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ url }) => {
    const result = await fetchDocText(url);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result) }],
      structuredContent: result as Record<string, unknown>,
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('google-docs-mcp-server listo (stdio)');