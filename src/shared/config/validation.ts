import z from 'zod';

export const envSchema = z.object({
    NODE_ENV: z.union([z.literal('development'), z.literal('production')]),

    HOSTNAME: z.string().optional(),
    PORT: z.string(),
    CORS_ORIGIN: z.string(),

    API_URL: z.string(),

    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_CALLBACK_URL: z.string(),

    DB_HOST: z.string(),
    DB_PORT: z.string(),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),

    JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.string(),
    REFRESH_EXPIRES_IN: z.string(),

    DATABASE_URL: z.string(),
});

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace NodeJS {
        interface ProcessEnv extends z.infer<typeof envSchema> {}
    }
}
