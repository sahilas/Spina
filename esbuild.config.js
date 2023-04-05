const path = require('path')
const rails = require('esbuild-rails')

require("esbuild").build({
    entryPoints: ["application.js"],
    bundle: true,
    outdir: path.join(process.cwd(), "app/assets/builds/spina"),
    absWorkingDir: path.join(process.cwd(), "app/javascript/spina"),
    plugins: [rails()],
}).catch(() => process.exit(1))