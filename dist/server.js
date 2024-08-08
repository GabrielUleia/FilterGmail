import * as http from 'http';
const PORT = 8000;
const server = http.createServer((req, res) => {

    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>This is the HOME page</h1>');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>Sorry, but the page you&apos;re looking for doesn&apos;t exist</h1>');
    }
});
server.listen(PORT, () => {
    console.log(`This server is running on the port: ${PORT}`);
});
//# sourceMappingURL=server.js.map