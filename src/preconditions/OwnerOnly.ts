import { Precondition } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";

export class OwnerOnlyPrecondition extends Precondition {
  public async chatInputRun(interaction: CommandInteraction) {
    return this.checkOwner(interaction);
  }

  private async checkOwner(interaction: CommandInteraction) {
    return this.container.client.config.owners.includes(interaction.user.id)
      ? this.ok()
      : this.error({
          message: `> ❌ *\`${interaction.commandName}\` Command is reserved for bot owners only!*`,
        });
  }
}

