import { databaseUnavailable } from '@/lib/databaseUnavailable';

export function GET() {
    return databaseUnavailable('Chat');
}

export function POST() {
    return databaseUnavailable('Chat');
}
