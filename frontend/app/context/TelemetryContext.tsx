"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface DeviceHistory {
  uso: number[];
  temperatura: number[];
}

export interface TelemetryCache {
  [deviceId: string]: DeviceHistory;
}

export type Device = {
  id: string;
  name: string;
  category: string;
  serial: string;
  image: string;
  status?: string;
  dados_maximos?: any;
  dados_tempo_real?: any;
};

export type Collection = {
  id: string;
  name: string;
  description: string;
  owner: string;
  status: string; // "online" ou "offline"
  devices: Device[];
};

interface TelemetryContextType {
  devices: Device[];
  collections: Collection[];
  historyCache: TelemetryCache;
  loading: boolean;
  error: string | null;
  fetchData: (showLoading?: boolean) => Promise<void>;
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [historyCache, setHistoryCache] = useState<TelemetryCache>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (showLoading = false) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return; // Evita requisições sem token

    if (showLoading) setLoading(true);
    try {
      const [resDevices, resCollections] = await Promise.all([
        fetch("http://localhost:8000/devices", {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch("http://localhost:8000/collections", {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      if (!resDevices.ok || !resCollections.ok) {
        throw new Error("Erro ao ler dados da API.");
      }

      const dataDevices: Device[] = await resDevices.json();
      const dataCollections: Collection[] = await resCollections.json();

      setDevices(dataDevices);
      setCollections(dataCollections);

      // Alimentação ININTERRUPTA e SILENCIOSA de todas as peças a partir do histórico do Redis
      setHistoryCache((prev) => {
        const nextCache = { ...prev };
        for (const device of dataDevices) {
          const rawHistory = (device as any).historico || [];
          nextCache[device.id] = {
            uso: rawHistory.map((h: any) => h.uso),
            temperatura: rawHistory.map((h: any) => h.temperatura),
          };
        }
        return nextCache;
      });

      setError(null);
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o servidor backend.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Polling centralizado a cada 3 segundos a partir da raiz (layout/provider)
  useEffect(() => {
    fetchData(true);

    const interval = setInterval(() => {
      fetchData(false);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TelemetryContext.Provider value={{
      devices,
      collections,
      historyCache,
      loading,
      error,
      fetchData,
      setDevices,
      setCollections
    }}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetry deve ser usado dentro de um TelemetryProvider");
  }
  return context;
}
