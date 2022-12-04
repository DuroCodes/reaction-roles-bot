import { CommandType, Plugins, SparkCommand } from '@spark.ts/handler';
import { APIInteractionDataResolvedChannel, ApplicationCommandOptionType, ChannelType, TextChannel } from 'discord.js';
import { successEmbed } from '../util/embeds.js';
import { prisma } from '../util/prisma.js';

export default new SparkCommand({
  type: CommandType.Slash,
  plugins: [Plugins.Publish({ defaultMemberPermissions: 'Administrator' })],
  description: 'Setup reaction roles',
  options: [
    {
      name: 'channel',
      description: 'The channel of the reaction roles',
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildText],
      required: true,
    },
  ],
  async run({ interaction, args }) {
    await interaction.deferReply({ ephemeral: true });

    const { id: channelId } = args.getChannel('channel', true) as TextChannel | APIInteractionDataResolvedChannel;

    const guildData = await prisma.guildData.findFirst({
      where: {
        guildId: interaction.guildId!,
      },
    });

    if (!guildData) {
      await prisma.guildData.create({
        data: {
          guildId: interaction.guildId!,
          channelId,
        },
      });
    }

    return interaction.followUp({
      embeds: [successEmbed('Successfully updated your channel id!')],
    });
  }
});
