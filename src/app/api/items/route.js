import { databaseUnavailable } from '@/lib/databaseUnavailable';

export function GET() {
    return databaseUnavailable('Items');
}

export function POST() {
    return databaseUnavailable('Items');
}
