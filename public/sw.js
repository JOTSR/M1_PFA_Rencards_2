self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('v0').then((cache) => {
            return cache.addAll([
                '/',
                '/app.js',
                '/style.css',
                '/event.ics',
                '/fonts/BrixSlab-Bold.otf',
                '/fonts/BrixSlab-Light.otf',
                '/fonts/BrixSlab-Medium.otf',
                '/fonts/BrixSlab-Regular.otf',
                '/img/header_background.png',
                '/img/icon_flat.png',
                '/img/icon.png',
                '/img/main_bg.png',
                '/img/main_bg_horiz.png',
                '/img/subtitle_background.png',
                '/img/univ_bdx.png',
                '/img/notif_badge.png'
            ])
        })
    )
})

self.addEventListener('fetch', (e) => {
    e.respondWith(caches.match(e.request).then(response => {
        if (response !== undefined) {
            return response
        } else {
            return fetch(e.request).then(response => {
                const responseClone = response.clone()

                caches.open('v2').then(cache => {
                    try {
                        cache.put(e.request, responseClone)
                    } catch (e) {
                        console.error(e)
                    }
                })

                return response
            })
        }
    }))
})

addEventListener('notificationclick', async (e) => {
    if (e.action === 'go-to') {
        clients.openWindow('https://www.google.fr/maps/place/A9,+33400+Talence/@44.8078069,-0.5963735,17z')
    }
    
    if (e.action === 'save-calendar') {
        clients.openWindow('/')
        for (const client of [... await clients.matchAll()]) {
            client.postMessage('#notif.calendar')
        }
    }
    
    e.notification.close()

}, false)

addEventListener('push', async (e) => {
    if (Notification?.permission !== 'granted') {
        return
    }

    const {title, ...options} = e.data.json()

    await showNotification(title, options)
})

async function showNotification(title, {icon, body, tag, actions}) {
	if (!['denied', 'granted'].includes(Notification.permission)) {
		try {
			await Notification.requestPermission()
		} catch (e) {
			return e
		}
	}

	registration.showNotification(title, {
		lang: 'fr',
		badge: '/img/notif_badge.png',
		icon,
		body,
		actions,
		tag
	})
}