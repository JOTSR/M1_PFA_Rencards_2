import {Router, FormDataReader, sendMessage} from './deps.ts'
import {bot, channelId} from './discordBot.ts'
import {supabase, ContactForm} from './db.ts'

export const router = new Router()

router.post('/contact', async (ctx) => {
	const {type, value} = ctx.request.body()
	if (type === 'form-data') {
		const reader = value as FormDataReader
		const message = await (await reader.read()).fields

		const {data, error} = await supabase
			.from<ContactForm>('contact_form')
			//@ts-ignore .insert() not exist
			.insert([
				{first_name: message.prenom, name: message.nom, email: message.mail, message: message.message}
			])

		ctx.response.status = error ? 503 : 200 
		ctx.response.body = error ? 'Database error' : 'Database successful'

		try {
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

			ctx.response.body += ' Discord successful'
		} catch (e) {
			console.error(`DISCORD_BOT::sendMassage : ${e}`)
			ctx.response.status = 503 
			ctx.response.body += ' Discord error'
		}
		return
	}
	
	ctx.response.status = 400
	ctx.response.body = 'Expected FormData'
})