'use client';

import { useEffect, useState, useCallback } from 'react';

interface QRCodeDisplayProps {
  qrcode: string;
  instanceName: string;
  onConnected?: () => void;
}

export default function QRCodeDisplay({ qrcode, instanceName, onConnected }: QRCodeDisplayProps) {
  const [status, setStatus] = useState<'aguardando_qr' | 'conectado' | 'erro'>('aguardando_qr');
  const [countdown, setCountdown] = useState(30);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/numeros/status?instance=${encodeURIComponent(instanceName)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === 'conectado' || data.status === 'open') {
        setStatus('conectado');
        onConnected?.();
      }
    } catch {
      // silent — keep polling
    }
  }, [instanceName, onConnected]);

  useEffect(() => {
    if (status === 'conectado') return;

    const interval = setInterval(() => {
      checkStatus();
      setCountdown((c) => {
        if (c <= 1) return 30;
        return c - 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [checkStatus, status]);

  if (status === 'conectado') {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-4xl">
          ✅
        </div>
        <p className="text-green-400 font-semibold text-lg">WhatsApp Conectado!</p>
        <p className="text-slate-400 text-sm">Instância: {instanceName}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-[#1A1A2E] rounded-xl border border-[#2A2A3E]">
      <p className="text-white font-medium">Escaneie o QR Code com seu WhatsApp</p>
      <p className="text-slate-400 text-xs">Instância: {instanceName}</p>

      <div className="p-3 bg-white rounded-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrcode.startsWith('data:') ? qrcode : `data:image/png;base64,${qrcode}`}
          alt="QR Code WhatsApp"
          className="w-48 h-48 object-contain"
        />
      </div>

      <div className="flex items-center gap-2 text-slate-400 text-xs">
        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        Aguardando escaneamento… verificando em {countdown}s
      </div>

      <p className="text-slate-500 text-xs text-center max-w-xs">
        Abra o WhatsApp → Dispositivos Conectados → Conectar um dispositivo → Escaneie este código
      </p>
    </div>
  );
}
