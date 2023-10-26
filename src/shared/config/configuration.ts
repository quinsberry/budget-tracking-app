export const configuration = () => ({
    app: {
        NODE_ENV: process.env.NODE_ENV,
        port: process.env.PORT,
        hostname: process.env.HOSTNAME || undefined,
        application_url: process.env.API_URL,
        globalPrefix: 'api',
        auth: {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackUrl: process.env.GOOGLE_CALLBACK_URL,
            },
        },
        cors: {
            enabled: true,
            origin: process.env.CORS_ORIGIN,
        },
        jwt: {
            secret: process.env.JWT_SECRET,
            expiresIn: process.env.JWT_EXPIRES_IN,
            refreshExpiresIn: process.env.REFRESH_EXPIRES_IN,
        },
        swagger: {
            enabled: process.env.NODE_ENV !== 'production',
            title: 'Budget Tracking App',
            description: 'Budget Tracking App API',
            version: '1.0',
            path: 'docs',
        },
        db: {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT, 10),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            name: process.env.DB_NAME,
        },
    } as const,
});

export type AppConfiguration = ReturnType<typeof configuration>['app'];
