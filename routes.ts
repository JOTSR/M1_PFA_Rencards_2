import {Router, FormDataReader, sendMessage} from './deps.ts'
import {bot, channelId} from './discordBot.ts'

export const router = new Router()

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