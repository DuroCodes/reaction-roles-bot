import { EmbedBuilder } from 'discord.js';

export function errEmbed(description: string) {
  return new EmbedBuilder()
    .setColor('Red')
    .setTitle('❌ Error')
    .setDescription(description);
}

export function successEmbed(description: string) {
  return new EmbedBuilder()
    .setColor('Green')
    .setTitle('✅ Success')
    .setDescription(description);
}
