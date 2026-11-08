import { NextResponse } from 'next/server';

export function databaseUnavailable(resource: string) {
    return NextResponse.json(
        {
            message: `${resource} Disabled`,
            error: 'このAPIはNeonへの移行が完了するまで利用できません。',
        },
        { status: 503 }
    );
}
