import { z } from "zod";

// Define the schema for environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string;
      MONGO_DB: string;
    }
  }
}

// Define the type for environment variables using Zod
declare const envVariablesSchema: z.ZodObject<{
  BOT_TOKEN: z.ZodString;
  MONGO_DB: z.ZodString;
}>;

// Now you can use the schema to parse environment variables
