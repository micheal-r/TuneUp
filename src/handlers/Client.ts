import { GatewayIntentBits } from "discord.js";
//import mongoose from 'mongoose';
import { SapphireClient, BucketScope } from "@sapphire/framework";
import { getRootData } from "@sapphire/pieces";
import { Time } from "@sapphire/time-utilities";
import config from "@services/config";
import { join } from "path";
import mongoose from "mongoose";
import { Job } from "node-schedule";
import { Collection } from "discord.js";

export class Bot extends SapphireClient {
  private readonly rootData = getRootData();
  public readonly config = config;
  public jobs: Collection<string, Job> = new Collection();
  public constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
      defaultCooldown: {
        delay: Time.Second * 3,
        filteredUsers: config.owners,
        scope: BucketScope.Global,
      },
    });

    this.stores
      .get("interaction-handlers")
      .registerPath(join(this.rootData.root, "components"));
  }
  public async initDatbase(): Promise<void> {
    if (process.env.MONGO_DB) {
      try {
        await mongoose.connect(process.env.MONGO_DB);
        this.logger.info("[DATABASE] Connected to database");
      } catch (error) {
        this.logger.error("Couldn't connect to Mongoose database", error);
      }
    } else {
      this.logger.info("[DATABASE] Connetion URL is not available");
    }
  }

  public async login(token?: string | undefined): Promise<string> {
    await this.initDatbase();
    return await super.login(token);
  }
}

declare module "@sapphire/pieces" {
  interface Container {
    config: typeof config;
    jobs: Collection<string, Job>;
  }
}
declare module "discord.js" {
  interface Client {
    config: typeof config;
    jobs: Collection<string, Job>;
  }
}
