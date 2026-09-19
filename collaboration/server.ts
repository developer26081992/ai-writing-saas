import { Server } from "@hocuspocus/server";

const server = new Server({
  port: 1234,
});

server.listen().then(() => {
  console.log("Collaboration server running on port 1234");
});