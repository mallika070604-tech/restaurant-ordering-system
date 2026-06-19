import QRCode from 'qrcode';

export const generateTableQR = async (tableNumber, baseUrl) => {
  const url = `${baseUrl}/order/${tableNumber}`;
  return QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });
};

export const generateTableQRBuffer = async (tableNumber, baseUrl) => {
  const url = `${baseUrl}/order/${tableNumber}`;
  return QRCode.toBuffer(url, { width: 400, margin: 2 });
};
