import { Context, Next } from '../deps.ts'

export async function timing(ctx: Context, next: Next) {
	const start = Date.now()
	await next()
	const ms = Date.now() - start
	ctx.response.headers.set('X-Response-Time', `${ms}ms`)
}