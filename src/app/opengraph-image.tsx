import { ImageResponse } from 'next/og';
import { site } from '@/content/site';

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: '#03070C',
        backgroundImage:
          'radial-gradient(900px 500px at 12% 8%, rgba(29,111,242,0.22), transparent 60%), radial-gradient(700px 460px at 92% 92%, rgba(34,211,238,0.16), transparent 60%)',
        padding: '80px',
      }}
    >
      <div style={{ display: 'flex', fontSize: 26, color: '#5D6A7D', letterSpacing: 4 }}>
        {site.location.toUpperCase()}
      </div>
      <div
        style={{ display: 'flex', marginTop: 26, fontSize: 96, fontWeight: 700, color: '#F2F6FB' }}
      >
        {site.name}
      </div>
      <div
        style={{ display: 'flex', marginTop: 12, fontSize: 46, fontWeight: 600, color: '#3D88FF' }}
      >
        {site.role}
      </div>
      <div
        style={{ display: 'flex', marginTop: 30, fontSize: 28, color: '#8896AB', maxWidth: 940 }}
      >
        {site.tagline}
      </div>
      <div
        style={{
          display: 'flex',
          marginTop: 'auto',
          fontSize: 24,
          color: '#5D6A7D',
        }}
      >
        emredogan.work
      </div>
    </div>,
    size,
  );
}
