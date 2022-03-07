import 'https://deno.land/std@0.128.0/dotenv/load.ts'
import { Application, Router, send, FormDataReader } from 'https://deno.land/x/oak@v10.4.0/mod.ts'
import { createBot, startBot, sendMessage } from 'https://deno.land/x/discordeno@13.0.0-rc22/mod.ts'

const DISCORD_TOKEN = String(Deno.env.get('DISCORD_TOKEN') ?? '')
const DISCORD_ID = BigInt(Deno.env.get('DISCORD_ID') ?? '')
// const DISCORD_CHANNEL = BigInt(Deno.env.get('DISCORD_CHANNEL') ?? '')

const app = new Application()

let channelId = 0n

const bot = createBot({
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

// await startBot(bot)

//Router
const router = new Router()
router.post('/contact', async (ctx) => {
	const {type, value} = ctx.request.body()
	if (type === 'form-data') {
		const reader = value as FormDataReader
		const message = await (await reader.read()).fields
		sendMessage(bot, channelId, {
			embeds: [{
				color: 0x009DE0,
				title: 'Contact du site',
				author: {name: `${message.prenom} ${message.nom}`},
				fields: [{
					name: 'Message',
					value: '```' + message.message + '```'
				}],
				footer: {text: message.mail},
				timestamp: new Date().toISOString()
			}]
		})
		ctx.response.status
		ctx.response.body = null
		return
	}
	
	ctx.response.status = 400
	ctx.response.body = 'Expected FormData'
})

app.use(router.routes())
app.use(router.allowedMethods())

// Logger
app.use(async (ctx, next) => {
	await next()
	const rt = ctx.response.headers.get('X-Response-Time')
	console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`)
	console.log(`Client IP: ${ctx.request.ip}`)
})

// Timing
app.use(async (ctx, next) => {
	const start = Date.now()
	await next()
	const ms = Date.now() - start
	ctx.response.headers.set('X-Response-Time', `${ms}ms`)
})

//Resolve static files
//Deno Deploy fix
app.use(async (ctx, next) => {
	const root = `${Deno.cwd()}/public`
	const filePath = (() => {
		const { pathname } = ctx.request.url
		if (pathname === '/') return root + '/index.html'
		return root + ctx.request.url.pathname
	})()

	try {
		ctx.response.body = await Deno.readFile(filePath)
		ctx.response.status = 200
	} catch {
		ctx.response.body = 'Fichier introuvable'
		ctx.response.status = 404
	}
	// await send(ctx, ctx.request.url.pathname, {
    //     root: `${Deno.cwd()}/public`,
    //     index: 'index.html'
    // })

	await next()
})

app.addEventListener(
	'listen',
	() => console.log(`Server listen on http://localhost:${Deno.env.get('PORT') ?? 80}`)
)
await app.listen({ port: 80 })