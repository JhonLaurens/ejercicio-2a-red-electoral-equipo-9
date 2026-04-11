import { createServer } from "./createServer";

const port = Number(process.env.PORT ?? 8787);

const app = createServer();

app.listen(port, () => {
  console.log(`Electoral API listening on ${port}`);
});
