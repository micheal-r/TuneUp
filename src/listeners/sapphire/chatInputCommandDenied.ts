import {
  Events,
  Listener,
  type ChatInputCommandDeniedPayload,
  type UserError,
} from "@sapphire/framework";

export class ChatInputCommandDenied extends Listener<
  typeof Events.ChatInputCommandDenied
> {
  public run(error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
    const type: "reply" | "editReply" =
      interaction.deferred || interaction.replied ? "editReply" : "reply";
    return interaction[type]({
      content: error.message,
      ephemeral: true,
    });
  }
}
