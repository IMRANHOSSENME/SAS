import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: process.env.DB_TYPE || (process.env.NODE_ENV === 'production' ? 'postgres' : 'sqlite'),
  database: process.env.DB_TYPE === 'sqlite' || process.env.NODE_ENV !== 'production' 
    ? (process.env.DB_NAME || 'database.sqlite')
    : (process.env.DB_NAME || 'smartbio_db'),
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
}));
