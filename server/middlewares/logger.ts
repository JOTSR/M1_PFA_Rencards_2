import { Context, Next } from '../deps.ts'
import { db } from '../db.ts'

export async function logger(ctx: Context, next: Next) {
	await next()
	const rt = ctx.response.headers.get('X-Response-Time')
	console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`)
	console.log(`Client IP: ${ctx.request.ip}`)
	if (ctx.request.url.pathname === '/') {
		await db.connectionLogs.update({ip: ctx.request.ip, last_at: (new Date()).toISOString()})
	}
}