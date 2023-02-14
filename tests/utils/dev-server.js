import StaticServer from 'static-server';

const sitePath = process.env['WORKFLOWS_SITE_PATH'];
if (!sitePath) {
	throw new Error('To use theses tests you must defined the `WORKFLOWS_SITE_PATH` environment variable.');
}

const server = new StaticServer({
	rootPath: sitePath,
	port: 9999,
});

export function startServer() {
	return new Promise((resolve) => {
		server.start(() => {
			console.log(`Using http://localhost:${server.port}`);
			resolve(`http://localhost:${server.port}`);
		})
	});
}

export function stopServer() {
	server.stop();
}
