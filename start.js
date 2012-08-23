#!/usr/bin/env node
require("norman").createServer("Procfile", function(server) {
    server.spawn();
});
