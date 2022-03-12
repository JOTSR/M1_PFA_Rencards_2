import { Application } from './deps.ts'
import { logger, timing, resolveStatic } from './middlewares/mod.ts'
import { router } from './routes.ts'

const app = new Application()

app.use(router.routes())
app.use(router.allowedMethods())

// Logger
app.use(logger)

// Timing
app.use(timing)

//Resolve static files
//Deno Deploy fix
app.use(resolveStatic)

app.addEventListener(
	'listen',
	() => console.log(`Server listen on http://localhost:${Deno.env.get('PORT') ?? 80}`)
)
await app.listen({ port: 80 })