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

// ==== Global crash guards ====
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection:', reason);
});

// ==== Request handler ====
server.on('request', (request, response) => {
  try {
    if (bare.shouldRoute(request)) {
      bare.routeRequest(request, response).catch((err) => {
        console.error('Bare route error:', err);
        if (!response.headersSent) {
          response.writeHead(502, { 'Content-Type': 'text/plain' });
          response.end('Bare server error');
        }
      });
    } else {
      serve.serve(request, response, (err) => {
        if (err) {
          console.error('Static file error:', err);
          if (!response.headersSent) {
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end('Static file error');
          }
        }
      });
    }
  } catch (err) {
    console.error('Request handler error:', err);
    if (!response.headersSent) {
      response.writeHead(500, { 'Content-Type': 'text/plain' });
      response.end('Unexpected error');
    }
  }
});

// ==== Upgrade handler (WebSocket, etc) ====
server.on('upgrade', (req, socket, head) => {
  try {
    if (bare.shouldRoute(req)) {
      bare.routeUpgrade(req, socket, head).catch((err) => {
        console.error('Upgrade route error:', err);
        socket.end();
      });
    } else {
      socket.end();
    }
  } catch (err) {
    console.error('Upgrade handler error:', err);
    socket.end();
  }
});

server.listen(process.env.PORT || 7070, () => {
  console.log(`✅ Server listening on port ${process.env.PORT || 7070}`);
});
