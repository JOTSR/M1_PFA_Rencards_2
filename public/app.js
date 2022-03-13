const swRegistration = await (async () => {
	if ('serviceWorker' in navigator) {
		try {
			const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
	
			const subscription = await getOrSubscribe(registration)
			
			await fetch('/pushRegister', {
				method: 'POST',
				headers: {
					'Content-type': 'application/json'
				},
				body: JSON.stringify({
					subscription
				})
			})

			console.log('Subscribed to web push notification')

			if (registration.installing) {
				console.log('Service worker installing')
			} else if (registration.waiting) {
				console.log('Service worker installed')
			} else if (registration.active) {
				console.log('Service worker active')
			}

			return registration

		} catch (error) {
			// registration failed
			console.error('Registration failed with ' + error)
		}
	}
})()

/**
 * 
 * @param {ServiceWorkerRegistration} registration 
 * @returns 
 */
async function getOrSubscribe(registration) {
	const subscription = await registration.pushManager.getSubscription()
	
	if (subscription) {
		return subscription
	}

	const { pub } = await (await fetch('./vapid', {
		method: 'POST',
		accept: 'application/json'
	})).json() 
	const vapidKey = urlBase64ToUint8Array(pub)

	return registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: vapidKey,

	})

}

const $ = (tag) => document.querySelector(tag)
// const $$ = (tag) => document.querySelectorAll(tag)

const menu = {
	carte: $('#controls-carte'),
	agenda: $('#controls-agenda'),
	contact: $('#controls-contact'),
	programme: $('#controls-programme'),
}

for (const button in menu) {
	menu[button].addEventListener('click', () => {
		for (const item in menu) {
			if (
				item !== button &&
				!$(`#modal-${item}`).classList.contains('modal-hidden')
			) {
				$(`#modal-${item}`).classList.toggle('modal-animation')
				setTimeout(() => {
					$(`#modal-${item}`).classList.toggle('modal-hidden')
				}, 200)
			}
		}

		if ($(`#modal-${button}`).classList.contains('modal-hidden')) {
			$(`#modal-${button}`).classList.toggle('modal-hidden')
			$(`#controls-${button}`).disabled = true
			setTimeout(() => {
				$(`#controls-${button}`).disabled = false
				$(`#modal-${button}`).classList.toggle('modal-animation')
			}, 200)
		} else {
			$(`#modal-${button}`).classList.toggle('modal-animation')
			$(`#controls-${button}`).disabled = true
			setTimeout(() => {
				$(`#controls-${button}`).disabled = false
				$(`#modal-${button}`).classList.toggle('modal-hidden')
			}, 200)
		}
	})
}

$('#addToCalendar').addEventListener('click', () => {
	downloadFile('/event.ics')
})

$('#controls-carte').addEventListener(
	'click',
	() => {
		const API_KEY = 'AIzaSyB6JvRs9KTbJ0Pz-HVIMJX6rFaF6uyZ2U4'
		const script = document.createElement('script')
		script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`
		script.async = true
		const coords = { lat: 44.8076603569638, lng: -0.5941251226010084 }

		window.initMap = function () {
			const map = new google.maps.Map($('#gmaps'), {
				center: coords,
				zoom: 16,
			})

			const marker = new google.maps.Marker({
				position: coords,
				map,
				title: 'A9 Salle 01',
			})

			marker.setMap(map)
		}

		document.head.appendChild(script)
	},
	{ once: true }
)

async function downloadFile(url) {
	if (window.FileSystemHandle) {
		const newHandle = await window.showSaveFilePicker({
			suggestedName: 'rencards2.ics',
			types: [
				{
					description: 'évenement iCalendar',
					accept: {
						'text/plain': ['.ics'],
					},
				},
			],
		})
		const writableStream = await newHandle.createWritable()
		const file = await (await fetch(url)).blob()
		await writableStream.write(file)
		await writableStream.close()
	} else {
		const link = document.createElement('a')
		link.setAttribute('href', url)
		link.click()
		document.removeChild(link)
		console.log('link')
	}
}

for (const child of $('#contact_form').children) {
	if (child.tagName === 'INPUT') {
		child.value = localStorage.getItem(`contact_form_${child.name}`) ?? ''
	}
	if (child.tagName === 'TEXTAREA') {
		child.innerText =
			localStorage.getItem(`contact_form_${child.name}`) ?? ''
	}
	child.addEventListener('input', () => {
		if (child.tagName === 'INPUT' || child.tagName === 'TEXTAREA') {
			localStorage.setItem(`contact_form_${child.name}`, child.value)
		}
	})
}

$('#contact_form').addEventListener('submit', (event) => {
	event.preventDefault()
	const datas = new FormData($('#contact_form'))
	if (datas.get('mail').match(/[\w-]+\.[\w-]+@(etu\.)*(u-bordeaux.fr)/i)) {
		fetch('/contact', {
			method: 'POST',
			body: datas,
		}).then((r) => console.log(r))
		for (const child of $('#contact_form').children) {
			if (child.tagName === 'INPUT' || child.tagName === 'TEXTAREA') {
				localStorage.removeItem(`contact_form_${child.name}`)
			}
			if (child.tagName === 'INPUT') child.value = ''
			if (child.tagName === 'TEXTAREA') child.innerText = ''
		}
		return
	}
	alert('email invalide, seul les adresses univeristaires sont autorisées')
})

const root = document.documentElement

root.style.setProperty(
	'--tilt',
	`-${4 * Math.exp(-(((window.innerWidth - 450) / 450) ** 2))}deg`
)

addEventListener('resize', () => {
	root.style.setProperty(
		'--tilt',
		`-${4 * Math.exp(-(((window.innerWidth - 450) / 450) ** 2))}deg`
	)
	detectVirtualKeyboardCrop()
})

function detectVirtualKeyboardCrop() {	
	for (const modal of document.querySelectorAll('.modal:focus-within, .modal-focus-full')) {
		modal.classList.toggle('modal-focus-full')
	}
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function _showNotification(title, {body, tag, actions}) {
	if (!('Notification' in window)) {
		return
	}

	if (!['denied', 'granted'].includes(Notification.permission)) {
		try {
			await Notification.requestPermission()
		} catch (e) {
			return e
		}
	}

	const _notification = swRegistration.showNotification(title, {
		lang: 'fr',
		badge: '/img/notif_badge.png',
		icon: '/img/icon_flat.png',
		body,
		actions,
		tag
	})
}

navigator.serviceWorker.addEventListener('message', (e) => {
	if(e.data === '#notif.calendar') {
		downloadFile('./event.ics')
		return
	}
})