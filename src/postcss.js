import { mkdir, readFile, writeFile } from "node:fs/promises";
import * as path from "path";

import glob from "glob";
import postcssPresetEnv from "postcss-preset-env";
import postcssGlobalData from "@csstools/postcss-global-data";
import postcss from "postcss";
import cssnano from "cssnano";

const SRC_DIR = "themes";
const BUILD_DIR = "public";

async function generateVarsFile(varFiles) {
	if (varFiles.length == 0) {
		return null;
	}

	const varDir = path.join(BUILD_DIR, "css", "__generated__", "variables");
	const varFilePath = path.join(varDir, "always.css");
	try {
		await mkdir(varDir, {
			recursive: true,
		});
	} catch (e) {
		// NOOP
	}
	const content = [];
	for (const vf of varFiles) {
		content.push(await readFile(vf));
	}
	await writeFile(varFilePath, content.join("\n\n"));
	return varFilePath;
}

async function start() {
	const varFiles = glob.sync(path.join(SRC_DIR, "**", "variables", "*.css"));
	const plugins = [
		postcssGlobalData({
			files: varFiles,
		}),
		postcssPresetEnv({
			preserve: true,
		}),
		cssnano(),
	];
	const processor = postcss(plugins);

	const cssFiles = glob.sync(path.join(BUILD_DIR, "**", "*.css"));
	const vfp = await generateVarsFile(varFiles);
	if (vfp) {
		cssFiles.push(vfp);
	}

	for (const c of cssFiles) {
		if (path.basename(c).indexOf("_") == 0) {
			// Skip files starting with underscore
			continue;
		}

		const css = await readFile(c);
		const result = await processor.process(css, { from: c });
		await writeFile(c, result.css);
	}
}

start();
