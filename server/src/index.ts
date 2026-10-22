import { createApp } from "./app.js";
import { createConsoleTransport } from "./mail/consoleTransport.js";

const port = Number(process.env.PORT ?? 3001);

const app = createApp({
  transport: createConsoleTransport(),
  mail: {
    from: process.env.INQUIRY_FROM ?? "portfolio@localhost",
    to: process.env.INQUIRY_TO ?? "owner@localhost",
  },
  log: (line) => console.log(line),
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Server listening on http://127.0.0.1:${port}`);
});
