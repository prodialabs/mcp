# prodia-mcp

a model context protocol (mcp) server that connects to the prodia api to generate images from text prompts. it exposes a single `job` tool over stdio transport and saves the resulting image to disk.

## requirements

- node.js v16+
- a valid prodia api token in `PRODIA_TOKEN`

## installation

```sh
git clone https://github.com/your-org/prodia-mcp.git
cd prodia-mcp
npm install
npm run build
```

set your token:

```
export PRODIA_TOKEN=xxx
```

add to claude code as an mcp server:

```
claude mcp add \
-e "PRODIA_TOKEN=$PRODIA_TOKEN" \
-- prodia node $PWD/build/index.js
```

## development

- format: `npm run format`
- build: `npm run build`

## license

mit
