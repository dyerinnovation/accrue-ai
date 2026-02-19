import { createApp } from "./app.js";
import { getEnv } from "./config/env.js";

const env = getEnv();
const app = createApp();

app.listen(env.API_PORT, () => {
  console.log(`API server running on port ${env.API_PORT} [${env.NODE_ENV}]`);
});
