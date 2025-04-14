import createBareServer from '@tomphttp/bare-server-node';
import http from 'http';
import nodeStatic from 'node-static';
import dotenv from 'dotenv';
dotenv.config();

const bare = createBareServer('/bare/', {
    logErrors: true
});

const serve = new nodeStatic.Server('static/');
const fakeServe = new nodeStatic.Server('BlacklistServe/');

const server = http.createServer();

server.on('request', (request, response) => {
    try {
        if (bare.shouldRoute(request)) {
            bare.routeRequest(request, response);
        } else {
            serve.serve(request, response);
        }
    } catch (err) {
        console.error('Request error:', err);
        response.statusCode = 500;
        response.end('Internal Server Error');
    }
});

server.on('upgrade', (req, socket, head) => {
    try {
        if (bare.shouldRoute(req)) {
            bare.routeUpgrade(req, socket, head);
        } else {
            socket.end();
        }
    } catch (err) {
        console.error('Upgrade error:', err);
        socket.end();
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    server.close(() => {
        console.log('Server shut down gracefully');
        process.exit(1);
    });
});

server.listen(process.env.PORT || 7070, () => {
    console.log(`Server is running on port ${process.env.PORT || 7070}`);
});
