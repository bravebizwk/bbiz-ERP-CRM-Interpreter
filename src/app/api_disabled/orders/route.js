import { databaseUnavailable } from '@/lib/databaseUnavailable';

export function GET() {
    return databaseUnavailable('Orders');
}

export function POST() {
    return databaseUnavailable('Orders');
}
