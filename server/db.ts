import { postgres } from './deps.ts'

export type ContactForm = {
    id: number
    created_at: string
    first_name: string
    name: string
    email: string
    message: string
}

export type ConnectionLogs = {
    ip: string
    first_at?: string
    last_at: string
}

class DB {
    #pool: postgres.Pool

    constructor(config: postgres.ClientOptions, pool = 3) {
        this.#pool = new postgres.Pool(config, pool)
    }

    contactForm = {
        insert: async ({first_name, name, email, message}: Omit<ContactForm, 'id' | 'created_at'>) => {
            const client = await this.#pool.connect()
            try {
                await client.queryObject/*sql*/`
                INSERT INTO contact_form (
                    first_name, name, email, message
                ) VALUES (
                    ${first_name}, ${name}, ${email}, ${message}
                )`
            } finally {
                client.release()
            }
        },
        select: async (where: unknown) => {
            
        }
    }

    connectionLogs = {
        update: async ({ip, last_at}: ConnectionLogs) => {
            const client = await this.#pool.connect()
            try {
                await client.queryObject/*sql*/`
                INSERT INTO connection_logs (
                    ip, last_at
                ) VALUES (
                    ${ip}, ${last_at}
                ) ON CONFLICT (ip)
                DO UPDATE SET last_at = EXCLUDED.last_at`
            } finally {
                client.release()
            }
        }
    }

    close() {
        this.#pool.end()
    }
}

export const db = new DB({
    hostname: String(Deno.env.get('DB_HOSTNAME') ?? ''),
    database: String(Deno.env.get('DB_DATABASE') ?? ''),
    port: Number(Deno.env.get('DB_PORT') ?? ''),
    user: String(Deno.env.get('DB_USER') ?? ''),
    password: String(Deno.env.get('DB_PASSWORD') ?? '')
})