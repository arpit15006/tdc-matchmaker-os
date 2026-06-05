import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`\n🪶  TDC Matchmaker OS API running on http://localhost:${env.PORT}`);
  // eslint-disable-next-line no-console
  console.log(`    Health: http://localhost:${env.PORT}/api/health\n`);
});
