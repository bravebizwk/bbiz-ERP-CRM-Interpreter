import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '1Y';

    // 仮のデータ（Vercelでの動作確認用）
    const rows = [
      { category: 'Jan', revenue: 12000, expenses: 8000 },
      { category: 'Feb', revenue: 18000, expenses: 11000 },
      { category: 'Mar', revenue: 15000, expenses: 10000 },
      { category: 'Apr', revenue: 22000, expenses: 12000 },
      { category: 'May', revenue: 28000, expenses: 14000 },
      { category: 'Jun', revenue: 24000, expenses: 15000 },
      { category: 'Jul', revenue: 32000, expenses: 18000 },
      { category: 'Aug', revenue: 35000, expenses: 19000 },
      { category: 'Sep', revenue: 42000, expenses: 22000 },
      { category: 'Oct', revenue: 39000, expenses: 21000 },
      { category: 'Nov', revenue: 46000, expenses: 24000 },
      { category: 'Dec', revenue: 54000, expenses: 26000 },
    ];

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


