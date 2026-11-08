import { databaseUnavailable } from '@/lib/databaseUnavailable';

export function GET() {
    return databaseUnavailable('Users');
}
