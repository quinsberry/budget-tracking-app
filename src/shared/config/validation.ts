import z from 'zod';

export const envSchema = z.object({
    NODE_ENV: z.union([z.literal('development'), z.literal('production')]),

    PORT: z.string(),

    DB_HOST: z.string(),
    DB_PORT: z.string(),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),
    
    DATABASE_URL: z.string(),
});

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace NodeJS {
        interface ProcessEnv extends z.infer<typeof envSchema> {}
    }
}
