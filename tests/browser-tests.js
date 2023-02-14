import assert from 'node:assert';
import {describe, before, after, beforeEach, afterEach, it} from 'node:test';
import puppeteer from 'puppeteer';
import {startServer, stopServer} from './utils/dev-server.js';

describe('runtime-errors', { timeout: 2 * 60 * 1000 }, () => {
	let addr;
	let browser;
	let page;

	before(async () => {
		// Server for project
		addr = await startServer();

		// Start browser
		browser = await puppeteer.launch({
			headless: true,
		});
	})

	after(async () => {
		stopServer();
		await browser.close();
	});

	beforeEach(async () => {
		page = await browser.newPage();
	});

	afterEach(async () => {
		await page.close();
	});

	const pages = [
		{
			title: 'index',
			url: '/',
		},
	];

	for (const p of pages) {
		it(`Request Errors - ${p.title}`, async () => {
			const failedRequests = [];
			const consoleErrors = [];
			// Catch all failed requests like 4xx..5xx status codes
			page.on('requestfailed', request => {
				failedRequests.push(request);
			});
			// Catch console log errors
			page.on("pageerror", err => {
				consoleErrors.push(err)
			});

			// Load webpage
			const response = await page.goto(`${addr}${p.url}`, {
				waitUntil: 'networkidle0',
			});
			assert.deepEqual(response.status(), 200);

			await wait(1000);

			if (failedRequests.length > 0) {
				console.log(`Failed network requests:`);
				for (const fr of failedRequests) {
					console.log(`    - url: ${fr.url()}, errText: ${fr.failure().errorText}, method: ${fr.method()}`);
				}
			}
			if (consoleErrors.length > 0) {
				console.log(`Console errors:`);
				for (const err of consoleErrors) {
					console.log(`    - url: ${err.toString()}`);
				}
			}

			assert.deepEqual(failedRequests, []);
			assert.deepEqual(consoleErrors, []);
		});

		it(`Undefined CSS Vars - ${p.title}`, async () => {
			// Load webpage
			const response = await page.goto(`${addr}${p.url}`, {
				waitUntil: 'networkidle0',
			});
			assert.deepEqual(response.status(), 200);

			const undefinedProps = await page.evaluate(() => {
				const cssRules = [...document.styleSheets]
					// Remove third party sheets
					.filter((sheet) => !sheet.href || sheet.href.indexOf(window.location.origin) === 0)
					// Get all the CSS Rules
					.reduce((finalArr, sheet) => finalArr.concat(...sheet.cssRules), [])
					// Filter down to CSSStyleRule
					.filter((rule) => rule.type === 1)
					// Get the styles as key value pairs in an array
					.reduce((propValArr, rule) => {
						const props = [...rule.style].map((propName) => [
							propName.trim(),
							rule.style.getPropertyValue(propName).trim()
						]);
						return [...propValArr, ...props];
					}, []);

				const customProps = {};
				const propRules = cssRules.filter(([propName]) => propName.indexOf("--") === 0);
				for (const [name, value] of propRules) {
					customProps[name] = value;
				}

				const usedVars = cssRules
					.map(([_, propValue]) => {
						const m = propValue.match(/var\((\-\-[^\)]*)\)/);
						if (m) {
							return m[1];
						}
						return null;
					})
					.filter((v) => v !== null);

				const undefinedVars = [];
				for (const uv of usedVars) {
					if (!customProps[uv]) {
						undefinedVars.push(uv);
					}
				}
				return undefinedVars;
			});

			await wait(1000);

			if (undefinedProps.length > 0) {
				console.log(`Undefined custom properties:`);
				for (const up of undefinedProps) {
					console.log(`    - ${up}`);
				}
			}

			assert.deepEqual(undefinedProps, []);
		});
	}
});

function wait(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}
