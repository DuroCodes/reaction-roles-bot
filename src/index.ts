import { SparkClient } from '@spark.ts/handler';
import { Partials } from 'discord.js';
import { env } from './util/env.js';

const client = new SparkClient({
  intents: ['Guilds', 'MessageContent', 'GuildMessages', 'GuildMessageReactions'],
  partials: [Partials.Reaction, Partials.Message],
  directories: {
    commands: './dist/commands',
    events: './dist/events',
  },
  logLevel: 'debug',
});

client.login(env.DISCORD_TOKEN);
