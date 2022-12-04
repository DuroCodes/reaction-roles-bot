import { CommandType, Plugins, SparkCommand } from '@spark.ts/handler';
import { EmbedBuilder, EmbedField, TextChannel } from 'discord.js';
import { errEmbed, successEmbed } from '../util/embeds.js';
import { prisma } from '../util/prisma.js';

export default new SparkCommand({
  type: CommandType.Slash,
  plugins: [Plugins.Publish({ defaultMemberPermissions: 'Administrator' })],
  description: 'Sends the panel to your channel',
  async run({ interaction }) {
    await interaction.deferReply({ ephemeral: true });

    const guildData = await prisma.guildData.findFirst({
      where: {
        guildId: interaction.guildId!,
      },
      select: {
        reactionRoles: true,
        channelId: true,
      },
    });

    if (!guildData) {
      return interaction.followUp({
        embeds: [errEmbed('No data found! Please run the `/setup` command.')],
      });
    }

    const channel = await interaction.guild?.channels.fetch(guildData.channelId) as TextChannel | null;

    if (!channel) {
      return interaction.followUp({
        embeds: [errEmbed('Could not find the channel. Run `/setup` with your channel id.')],
      });
    }

    const fields: EmbedField[] = guildData.reactionRoles.map((v) => ({
      name: `${v.emoji} ${v.title}`,
      value: `• ${v.description}`,
      inline: false,
    }));

    const panel = new EmbedBuilder()
      .setColor('DarkButNotBlack')
      .setFields(fields);

    try {
      const sentMessage = await channel.send({
        embeds: [panel],
      });

      guildData.reactionRoles.forEach(({ emoji }) => {
        sentMessage.react(emoji);
      });
    } catch (e) {
      return interaction.followUp({
        embeds: [errEmbed('Unable to send panel or react.\nPlease insure I have correct permissions.')],
      });
    }

    return interaction.followUp({
      embeds: [successEmbed(`Successfully sent the panel to <#${guildData.channelId}>`)],
    });
  }
});
