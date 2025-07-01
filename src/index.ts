import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createProdia } from "prodia/v2";
import fs from "node:fs/promises";

// create server instance
const server = new McpServer({
	name: "prodia",
	version: "1.0.0",
	capabilities: {
		resources: {},
		tools: {}
	}
});

// initialize prodia client
const token = process.env.PRODIA_TOKEN;
if (!token) {
	console.error(
		"error: PRODIA_TOKEN environment variable not set. get a token from https://app.prodia.com/api"
	);
	process.exit(1);
}
const prodia = createProdia({ token });

server.tool(
	"job",
	'Submit a job to Prodia with any supported type/config and save the image. Example: { type: "inference.flux-fast.schnell.txt2img.v2", config: { prompt: "A sweeping mountain landscape at sunrise, captured from a high-angle perspective using a wide-angle lens. The early morning light casts long shadows across the rugged terrain, with mist rolling over the valleys. The scene features sharp detail in the rocks, lush greenery, and clouds forming over distant peaks. Warm oranges and pinks dominate the sky, creating a dramatic and serene atmosphere. High dynamic range (HDR) captures the subtle transitions between light and shadow." } }',
	{
		type: z.string().describe("Prodia job type to run"),
		config: z.record(z.any()).describe("Prodia job configuration object"),
		outputPath: z.string().describe("Full absolute output file path")
	},
	async ({ type, config, outputPath }) => {
		if (!process.env.PRODIA_TOKEN) {
			return {
				content: [
					{
						type: "text",
						text: "error: PRODIA_TOKEN environment variable not set. get a token from https://app.prodia.com/api"
					}
				]
			};
		}
		try {
			const job = await prodia.job({ type, config });
			const image = await job.arrayBuffer();
			await fs.writeFile(outputPath, new Uint8Array(image));
			return {
				content: [
					{
						type: "text",
						text: `image generated successfully and saved as ${outputPath}\ntype: ${type}\nconfig: ${JSON.stringify(config)}`
					}
				]
			};
		} catch (error) {
			return {
				content: [
					{
						type: "text",
						text: `error generating image: ${error instanceof Error ? error.message : "unknown error"}`
					}
				]
			};
		}
	}
);

async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error("prodia mcp server running on stdio");
}

main().catch((error) => {
	console.error("fatal error in main():", error);
	process.exit(1);
});
