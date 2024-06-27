import { Command } from "@sapphire/framework";
import {
  ActionRow,
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ComponentType,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuComponent,
  StringSelectMenuInteraction,
} from "discord.js";
export class Help extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: "help",
      description: "Are you getting lost, this command will help you",
      fullCategory: ["General"],
    });
  }

  public registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option
            .setName("command")
            .setDescription("The command you want to see info about")
            .setAutocomplete(true)
        )
    );
  }

  async autocompleteRun(interaction: Command.AutocompleteInteraction) {
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name === "command") {
      const commands = this.container.stores.get("commands");

      const options = focusedOption?.value
        ? commands
            .filter(({ name }) => name.startsWith(focusedOption.value))
            .map(({ name }) => name)
            .slice(0, 25)
        : commands
            .map((c) => c.name)
            .sort()
            .splice(0, 25);

      if (focusedOption?.value) {
        await interaction
          .respond(
            options.map((cmd) => ({
              name: cmd,
              value: cmd,
            }))
          )
          .catch(console.error);
      } else {
        await interaction
          .respond(options.map((cmd) => ({ name: cmd, value: cmd })))
          .catch(console.error);
      }
    }
  }
  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    try {
      let command = interaction.options.getString("command");
      if (command) {
        command = command.toLowerCase().trim();
        const guildCommands =
        await interaction.guild?.commands.fetch();
        const cmdData = guildCommands?.find((c) => c.name == command);

        if (!cmdData)
          return interaction.reply({
            content: "> ❌ Can't find command with this name.",
          });
        let subcommands = cmdData.options.filter((c) => c.type === 1);
        const row =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("menu-help")
              .setPlaceholder("View Subcommands")
          );

        let embed = new EmbedBuilder()
          .setTitle(`/${cmdData.name} info`)
          .addFields({
            name: "Description",
            value: `${cmdData.description}`,
            inline: false,
          })
          .setTimestamp();

        if (subcommands && subcommands.length > 1) {
          subcommands.forEach((subcommand) => {
            row.components[0].addOptions({
              label: `${subcommand.name}`,
              description: `${subcommand.description}`,
              value: `${subcommand.name}`,
            });
          });

          const msg = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true,
          });

          const collector = msg.createMessageComponentCollector({
            filter: (i) =>
              i.customId === "menu-help" &&
              i.user.id === interaction.user.id &&
              i.componentType == ComponentType.StringSelect,
            time: 300000,
          });

          collector.on("collect", async (i: StringSelectMenuInteraction) => {
            await i.deferUpdate();
            const value = i.values[0];
            const subcommand = subcommands.find((c) => c.name == value);
            const embed = new EmbedBuilder()
              .setTitle(`/${cmdData.name} ${subcommand?.name}`)
              .addFields({
                name: "Description",
                value: `${subcommand?.description}`,
                inline: false,
              })
              .setTimestamp();
            msg.edit({ embeds: [embed] });

            collector.resetTimer();
          });
          collector.on("end", () => {
            const row = ActionRowBuilder.from<StringSelectMenuBuilder>(
              msg.components[0] as ActionRow<StringSelectMenuComponent>
            );
            row.components[0].setDisabled(true);

            msg.edit({
              components: [row],
            });
          });

          return;
        } else {
          return interaction.reply({
            embeds: [embed],
          });
        }
      } else {
        let categories = Array.from(
          new Set(
            [
              ...this.container.stores.get("commands").map((c) => c.category),
            ].filter((c): c is string => typeof c === "string")
          )
        ).map((category) => ({
          label: category,
          value: category,
        }));

        const categoriesMenu =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("categories")
              .setPlaceholder("Choose a category of commands")
              .addOptions(categories)
          );

        let msg = await interaction.reply({
          embeds: [
            new EmbedBuilder().setDescription("Choose a category of commands."),
          ],
          components: [categoriesMenu],
          fetchReply: true,
        });

        const collector = msg.createMessageComponentCollector({
          filter: (i) =>
            i.customId === "categories" &&
            i.user.id === interaction.user.id &&
            i.componentType === ComponentType.StringSelect,
          time: 300000,
        });

        collector.on("collect", async (i: StringSelectMenuInteraction) => {
          await i.deferUpdate();
          const description: string[] = [];
          const commands = this.container.stores
            .get("commands")
            .filter((c) => c.category == i.values[0])
            .map((cmd) => cmd.name);
          const commandsAPI = await interaction.guild?.commands.fetch();
          if (!commandsAPI || commandsAPI.size === 0) return;
          for (const command of commands) {
            const cmdAPI = commandsAPI.find((c) => c.name === command);
            if (!cmdAPI) continue;
            const subcommands = cmdAPI.options.filter(
              (c) => c.type === ApplicationCommandOptionType.Subcommand
            );
            if (subcommands.length > 0) {
              for (const subcommand of subcommands) {
                description.push(
                  `</${cmdAPI.name} ${subcommand.name}:${cmdAPI.id}> ~ ${subcommand.description}`
                );
              }
            } else {
              description.push(
                `</${cmdAPI.name}:${cmdAPI.id}> ~ ${cmdAPI.description}`
              );
            }
          }
          if (description.length == 0) return;
          const embed = new EmbedBuilder().setDescription(
            description.join("\n")
          );

          msg
            .edit({
              embeds: [embed],
              components: [categoriesMenu],
            })
            .catch(() => 0);

          collector.resetTimer();
        });

        collector.on("end", () => {
          msg
            .edit({
              components: [],
            })
            .catch(() => 0);
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
}
