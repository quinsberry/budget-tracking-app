
const config = {
    NODE_ENV: process.env.NODE_ENV,
    port: parseInt(process.env.PORT, 10),
    cors: {
        enabled: true,
    },
    swagger: {
        enabled: true,
        title: 'Budget Tracking App',
        description: 'Budget Tracking App API',
        version: '1.0',
        path: 'api',
    },
    db: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME,
    },
} as const;

export const configuration = () => ({
    app: config,
});

export type AppConfiguration = typeof config;