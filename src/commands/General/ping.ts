import { Command } from "@sapphire/framework";
import Discord from "discord.js";
import moment from "moment";
import {
  HumanizeDurationLanguage,
  HumanizeDuration,
} from "humanize-duration-ts";
const langService: HumanizeDurationLanguage = new HumanizeDurationLanguage();
const humanizer: HumanizeDuration = new HumanizeDuration(langService);

export class Ping extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: "ping",
      description: "Check the bot ping",
      fullCategory: ["General"],
    });
  }

  public registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description),
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply({
      fetchReply: true,
    });
    const embed = new Discord.EmbedBuilder().setDescription("Ping...");
    const msg = await interaction.editReply({ embeds: [embed] });
    const ping = msg.createdTimestamp - interaction.createdTimestamp;
    const ws = this.container.client.ws.ping;
    const memoryData = process.memoryUsage();
    const memoryUsage = formatMemoryUsage(memoryData.heapUsed);
    const info = new Discord.EmbedBuilder()
      .setAuthor({
        name: "🏓 Ping",
        iconURL: this.container.client?.user?.displayAvatarURL({
          forceStatic: true,
        }),
      })
      .addFields(
        {
          name: "Bot Usage",
          value: `Time Take: ${ping}ms\nDiscord API: ${ws}ms\nRAM Usage: ${memoryUsage}`,
          inline: true,
        },
        {
          name: "Bot Uptime",
          value: `Started At : ${moment(
            this.container.client?.readyTimestamp,
          ).format(
            "YYYY/MM/DD - HH:mm:ss",
          )}\nWorking From : ${humanizer.humanize(
            this.container.client?.uptime || 0,
            {
              round: true,
            },
          )}`,
          inline: true,
        },
        {
          name: "Bot Versions",
          value: `Node.js Version: ${process.version}\nDiscord.js Version: ${Discord.version}`,
        },
      )
      .setThumbnail(
        this.container.client?.user?.displayAvatarURL({ forceStatic: true }) ??
          null,
      )
      .setFooter({
        text: `Requested By ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ forceStatic: true }),
      })
      .setTimestamp();
    await interaction.editReply({ embeds: [info] });
  }
}
function formatMemoryUsage(data: number) {
  return `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;
}
