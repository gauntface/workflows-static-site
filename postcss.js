import { readFile, writeFile } from 'node:fs/promises';
import * as path from 'path';

import glob from 'glob';
import postcssPresetEnv from 'postcss-preset-env';
import postcssGlobalData from '@csstools/postcss-global-data';
import postcss from 'postcss';
import cssnano from 'cssnano';

const SRC_DIR = 'themes';
const BUILD_DIR = 'public';

async function start() {
	const plugins = [
		postcssGlobalData({
			files: glob.sync(path.join(SRC_DIR, '**', 'variables', '*.css')),
		}),
		postcssPresetEnv({
			preserve: true,
		}),
		cssnano(),
	];
	const processor = postcss(plugins);

	const cssFiles = glob.sync(path.join(BUILD_DIR, '**', '*.css'));
	for (const c of cssFiles) {
		if (path.basename(c).indexOf('_') == 0) {
			// Skip files starting with underscore
			continue;
		}

		const css = await readFile(c);
		const result = await processor.process(css, { from: c });
		await writeFile(c, result.css);
	}
}

start();
