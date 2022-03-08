import {createBot, startBot, sendMessage} from './deps.ts'

const DISCORD_TOKEN = String(Deno.env.get('DISCORD_TOKEN') ?? '')
const DISCORD_ID = BigInt(Deno.env.get('DISCORD_ID') ?? '')
const DISCORD_CHANNEL = BigInt(Deno.env.get('DISCORD_CHANNEL') ?? '')

export let channelId = 0n ?? DISCORD_CHANNEL

export const bot = createBot({
	token: DISCORD_TOKEN,
	intents: ['Guilds', 'GuildMessages'],
	botId: DISCORD_ID,
	events: {
		ready() {
			console.log('Discord bot successfully connected to gateway');
		},
		messageCreate(bot, message) {
			if (message.content === '!rencard') {
				channelId = message.channelId
				sendMessage(bot, message.channelId, { content: `Bot initialized on channel [${channelId}]`})
			}
		},
	},
})

await startBot(bot)