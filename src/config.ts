import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export interface IConfig {
    port: number;
    debugLogging: boolean;
    dbsslconn: boolean;
    jwtSecret: string;
    databaseUrl: string;
    dbEntitiesPath: string[];
    cronJobExpression: string;
}
console.log(process.env.NODE_ENV);
const isDevMode = true || process.env.NODE_ENV == 'development';

const config: IConfig = {
    port: +process.env.PORT || 4000,
    debugLogging: isDevMode,
    dbsslconn: !isDevMode,
    jwtSecret: process.env.JWT_SECRET || 'helloworld',
    databaseUrl: process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/apidb',
    dbEntitiesPath: [
      ... isDevMode ? ['src/entity/**/*.ts'] : ['dist/entity/**/*.js'],
    ],
    cronJobExpression: '0 * * * *'
};

export { config };