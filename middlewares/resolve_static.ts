import { Context, Next } from '../deps.ts'

export async function resolveStatic(ctx: Context, next: Next) {
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
}