const http = require('http');

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    setInterval(() => {
        const currentTime = new Date().toLocaleString();
        res.write(`Current Date and Time: ${currentTime}\n`);
    }, 1000);
}).listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});
