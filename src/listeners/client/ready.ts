import {
  ApplicationCommandRegistries,
  Listener,
  RegisterBehavior,
} from "@sapphire/framework";
//import { GiveawaysManager } from "@services/functions";
import type { Client } from 'discord.js';

export class ReadyListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      once: true,
    });
  }

  public async run(client: Client) {
    this.container.logger.info(
      `Successfully logged in as ${client.user?.username} (${client.user?.id})`
    );
    ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
      RegisterBehavior.LogToConsole
    );
   /* const maanger = new GiveawaysManager(client);
    await maanger.getGiveaways();
    await maanger.handleGiveaway();
    maanger.emit("GiveawayReady", "Real Giveaways");*/
  }
}
