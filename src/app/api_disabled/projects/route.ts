import { databaseUnavailable } from '@/lib/databaseUnavailable';

export const dynamic = 'force-dynamic';

export function GET() {
    return databaseUnavailable('Projects');
}

export function POST() {
    return databaseUnavailable('Projects');
}
