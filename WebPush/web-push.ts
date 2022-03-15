import { db } from '../server/db.ts'

export async function pushNotification(title: string, options: Record<string, unknown>) {
    const subscriptions = await db.webPush.select<'subscription'>('*')
    const payload = JSON.stringify({title, ...options})

    const process = Deno.run({
        cmd: [
            'cmd',
            '/c',
            `ts-node WebPush/index.ts ${
                JSON.stringify(subscriptions).replaceAll(' ', '%20')
            } ${
                payload.replaceAll(' ', '%20')
            }`
        ]
    })

    await process.status()
}

pushNotification(
	'Rφ le 25 à 12h30',
	{
		body: 'RDV au Rencards de la Physique le 25 à 12h30 au A9',
		tag: 'rappel',
		icon: '/img/icon_flat.png',
		actions: [
			{
				action: 'go-to',
				title: `S'y rendre`
			},
			{
				action: 'save-calendar',
				title: 'Ajouter à mon agenda'
			}
		]
	}
)