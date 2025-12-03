"use client";

import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

const qrCode = new QRCodeStyling({
  width: 350,
  height: 350,
  image: "/white-logo.jpg",
  dotsOptions: {
    type: "extra-rounded",
    gradient: {
      type: "linear",
      rotation: 0,
      colorStops: [
        { offset: 0, color: "#00B8D9" },
        { offset: 1, color: "#005F73" },
      ],
    },
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 15,
    imageSize: 0.5,
  },
  backgroundOptions: {
    color: "#ffffff",
  },
  cornersSquareOptions: {
    type: "extra-rounded",
    color: "#005F73",
  },
  cornersDotOptions: {
    type: "dot",
    color: "#005F73",
  },
});

export default function QRCodePage() {
  const ref = useRef<HTMLDivElement>(null);

  const updateQRCode = () => {
    // Yangi token generatsiya qilish
    const newToken = `VEGAS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    qrCode.update({
      data: newToken,
    });
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = "";
      qrCode.append(ref.current);
    }

    updateQRCode();

    // Har 5 daqiqada yangilash
    const interval = setInterval(updateQRCode, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center h-full w-full min-h-[calc(100vh-100px)]">
      <div ref={ref} />
    </div>
  );
}
