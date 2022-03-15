const webPush = require('web-push')
const fs = require('fs')

webPush.setVapidDetails(
    VAPID_SUB,
    VAPID_PUBLIC,
    VAPID_PRIVATE
)

function pushNotification(title: string, options: Record<string, unknown>) {
    
    const payload = JSON.stringify({title, ...options})

    fs.readFile("./subs.json", "utf8", (err: unknown, jsonString: string) => {
        if (err) {
          console.log("File read failed:", err);
          return;
        }
        // console.log("File data:", jsonString)

        const rows = JSON.parse(jsonString)

        //@ts-ignore ok
        for (const row of rows) {
            // console.log(row)
            //@ts-ignore ok
            webPush.sendNotification(row.subscription, payload)
            console.log('sended')
        }

    })
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