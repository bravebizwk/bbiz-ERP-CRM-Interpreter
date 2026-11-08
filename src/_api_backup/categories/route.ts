import { databaseUnavailable } from '@/lib/databaseUnavailable';

export function GET() {
    return databaseUnavailable('Categories');
}

export function POST() {
    return databaseUnavailable('Categories');
}
