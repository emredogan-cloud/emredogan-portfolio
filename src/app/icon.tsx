import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1D6FF2 0%, #22D3EE 100%)',
        color: '#03070C',
        fontSize: 21,
        fontWeight: 700,
        borderRadius: 7,
      }}
    >
      E
    </div>,
    size,
  );
}
