import { ImageResponse } from 'next/og';
import { supabase } from '@/lib/supabase';

// 画像のサイズ
export const alt = 'Nexus Activity Log';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  // 記事データを取得
  const { data: activity } = await supabase
    .from('activities')
    .select('title, category, date')
    .eq('slug', params.id)
    .single();

  if (!activity) {
    return new ImageResponse(
      (
        <div style={{ background: '#fdfbf8', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ color: '#1a1612' }}>Nexus</h1>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: '#fdfbf8', // --warm-white
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* 装飾的な背景要素 */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            right: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124, 111, 205, 0.1) 0%, transparent 70%)',
          }}
        />

        {/* カテゴリと日付 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <span
            style={{
              background: '#7c6fcd', // --accent
              color: 'white',
              padding: '6px 20px',
              borderRadius: '99px',
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            {activity.category}
          </span>
          <span style={{ color: '#81776d', fontSize: '24px' }}>{activity.date}</span>
        </div>

        {/* 記事タイトル */}
        <h1
          style={{
            fontSize: '72px',
            lineHeight: 1.2,
            color: '#1a1612', // --ink
            margin: 0,
            marginBottom: '48px',
            fontWeight: 'bold',
            display: 'flex',
          }}
        >
          {activity.title}
        </h1>

        {/* ロゴ */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              background: '#7c6fcd',
              borderRadius: '8px',
              marginRight: '16px',
            }}
          />
          <span style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '0.1em', color: '#1a1612' }}>
            NEXUS
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
