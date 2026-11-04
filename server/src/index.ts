import "./loadEnv.js";
import { createApp } from "./app.js";
import { transportFromEnv } from "./notify/transportFromEnv.js";

const port = Number(process.env.PORT || 3001);

const app = createApp({
  transport: transportFromEnv(process.env),
  log: (line) => console.log(line),
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Server listening on http://127.0.0.1:${port}`);
});
