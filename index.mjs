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
    if (bare.shouldRoute(request)) {
        bare.routeRequest(request, response);
    } else {
        serve.serve(request, response, (err) => {
            if (err) {
                if (!response.headersSent) {
                    response.writeHead(err.status || 500, {
                        'Content-Type': 'text/plain'
                    });
                    response.end(err.message || 'Internal Server Error');
                } else {
                    console.error('Node-Static Error (headers already sent):', err.message);
                }
            }
        });
    }
});

server.on('upgrade', (req, socket, head) => {
    if (bare.shouldRoute(req)) {
        bare.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

// Crash-proofing
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

server.listen(process.env.PORT || 7070);
