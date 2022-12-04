import { SparkEvent } from '@spark.ts/handler';
import { Events, parseEmoji } from 'discord.js';
import { errEmbed } from '../util/embeds.js';
import { prisma } from '../util/prisma.js';

export default new SparkEvent({
  name: Events.MessageReactionAdd,
  async run(reaction, user) {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;
    if (!reaction.message.guild) return;

    const member = reaction.message.guild.members.cache.get(user.id)!;

    const guildData = await prisma.guildData.findFirst({
      where: {
        guildId: reaction.message.guildId!,
      },
      select: {
        channelId: true,
        reactionRoles: true,
      },
    });

    if (!guildData) return;

    if (reaction.message.channelId !== guildData.channelId) return;

    const foundRole = guildData.reactionRoles.find(({ emoji }) => {
      return emoji === reaction.emoji.name || parseEmoji(emoji)?.name === reaction.emoji.name;
    });

    try {
      await reaction.users.remove(user.id);
    } catch (e) {
      reaction.message.reply({
        embeds: [errEmbed('Failed to remove reaction. Missing permissions.')],
      });

      reaction.client.logger.error(e);
      
      return;
    }

    if (foundRole) {
      if (member.roles.cache.get(foundRole.roleId)) {
        try {
          await member.roles.remove(foundRole.roleId);
        } catch (e) {
          reaction.message.reply({
            embeds: [errEmbed('Failed to remove role. Missing permissions.')],
          });
        }

        return;
      }

      try {
        await member.roles.add(foundRole.roleId);
      } catch (e) {
        reaction.message.reply({
          embeds: [errEmbed('Failed to add role. Missing permissions.')],
        });
      }
    }
  },
});
