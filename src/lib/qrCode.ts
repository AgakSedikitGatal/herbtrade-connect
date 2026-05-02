import QRCode from "qrcode";

export const buildJourneyUrl = (batchCode: string) => {
  if (typeof window === "undefined") {
    return `/journey/${batchCode}`;
  }

  return `${window.location.origin}/journey/${batchCode}`;
};

export const generateQRCodeDataUrl = async (targetUrl: string) => {
  return QRCode.toDataURL(targetUrl, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 320,
    color: {
      dark: "#0f3d2e",
      light: "#ffffff",
    },
  });
};

export const downloadDataUrl = (dataUrl: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
