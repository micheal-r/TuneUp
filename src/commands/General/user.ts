import { Command } from "@sapphire/framework";
import Discord from "discord.js";

export class User extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: "user",
      description: "Get user informations",
      fullCategory: ["General"],
    });
  }

  public registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to get informations about"),
        ),
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply({
      fetchReply: true,
    });
    const { user: author, options } = interaction;
    const user = await (options.getUser("user") || author).fetch(true);
    const badges = await formatFlags(user);

    const userEmbed = new Discord.EmbedBuilder()
      .setTitle(`${user.username}'s Information`)
      .setThumbnail(user.displayAvatarURL({ forceStatic: false }))
      .addFields({
        name: "Global Informations",
        value: `- Name: ${user.toString()} \`${user.username}\`\n- ID: \`${
          user.id
        }\`\n- Created: ${Discord.time(
          Math.floor(user.createdTimestamp / 1000),
          "D",
        )} (${Discord.time(Math.floor(user.createdTimestamp / 1000), "R")})${
          user.avatar
            ? `\n- Avatar: ${Discord.hyperlink(
                user.avatar,
                user.displayAvatarURL({ forceStatic: false }),
              )}`
            : ""
        }${
          user.banner && user.bannerURL({ forceStatic: false })
            ? `\n- Banner: ${Discord.hyperlink(
                user.banner,
                user.bannerURL({ forceStatic: false }) as string,
              )}`
            : ""
        }${
          badges.length
            ? `\n- Badges: ${Discord.italic(badges.join(", "))}`
            : ""
        }`,
      });

    interaction.editReply({
      embeds: [userEmbed],
    });
  }
}

async function formatFlags(user: Discord.User): Promise<string[]> {
  if (!user || !(user instanceof Discord.User)) return [];

  const formattedFlags: { [key: string]: string } = {
    Staff: "Discord Staff",
    Partner: "Partner",
    BugHunterLevel1: "Bug Hunter 1",
    BugHunterLevel2: "Bug Hunter 2",
    CertifiedModerator: "Certified Moderator",
    PremiumEarlySupporter: "Early Supporter",
    VerifiedDeveloper: "Verified Developer",
    VerifiedBot: "Verified Bot",
    ActiveDeveloper: "Active Developer",
    HypeSquadOnlineHouse1: "House Bravery",
    HypeSquadOnlineHouse2: "House Brilliance",
    HypeSquadOnlineHouse3: "House Balance",
  };

  const flags = await user.fetchFlags(true);
  console.log(flags);

  const badges = flags.toArray().map((flag) => formattedFlags[flag] || "");
  return badges;
}
