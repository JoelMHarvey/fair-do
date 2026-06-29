import QRCode from 'qrcode'

// Server-side QR as an inline SVG string (no external service). Brand-coloured.
export async function qrSvg(data: string): Promise<string> {
  return QRCode.toString(data, {
    type: 'svg',
    margin: 1,
    color: { dark: '#193e39', light: '#ffffff' },
  })
}
