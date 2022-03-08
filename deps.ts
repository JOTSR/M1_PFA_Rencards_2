import 'https://deno.land/std@0.128.0/dotenv/load.ts'
export { Application, Router, send, FormDataReader, Context } from 'https://deno.land/x/oak@v10.4.0/mod.ts'
export { createBot, startBot, sendMessage } from 'https://deno.land/x/discordeno@13.0.0-rc22/mod.ts'

export type Next = () => Promise<unknown>