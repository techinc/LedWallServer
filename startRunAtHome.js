#!/usr/bin/env node
require("norman").createServer("ProcfileRunAtHome", function(server) {
    server.spawn();
});
