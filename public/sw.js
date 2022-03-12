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

                caches.open('v0').then(cache => {
                    cache.put(e.request, responseClone)
                })

                return response
            })
        }
    }))
})