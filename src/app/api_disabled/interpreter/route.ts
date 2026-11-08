import { databaseUnavailable } from '@/lib/databaseUnavailable';

export function GET() {
    return databaseUnavailable('Interpreter');
}

export function POST() {
    return databaseUnavailable('Interpreter');
}
