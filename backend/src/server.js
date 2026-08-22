import { createApp } from './app.js';
import { db } from './db/index.js';
import { assertConfig, env } from './config/env.js';

assertConfig();

const app = createApp();

app.listen(env.port, () => {
  console.log('SkillBridge API');
  console.log(`  url      : http://localhost:${env.port}`);
  console.log(`  health   : http://localhost:${env.port}/health`);
  console.log(`  env      : ${env.nodeEnv}`);
  console.log(`  database : ${db.kind}`);
  console.log(`  mail     : ${env.mail.driver}`);
  console.log(`  domain   : @${env.allowedEmailDomain}\n`);
});

// Never let a swallowed rejection leave the process in a half-dead state.
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
