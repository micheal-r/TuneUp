import "module-alias/register";
import "dotenv/config";
import { Bot } from "./handlers/Client";
import { ApplicationCommandRegistries } from "@sapphire/framework";
const client = new Bot();
ApplicationCommandRegistries.setDefaultGuildIds(["925786384017522741"])

void client.login(process.env.BOT_TOKEN);
