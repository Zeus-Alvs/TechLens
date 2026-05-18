"use client";
import { useState } from "react";
import NavbarDashboard from "../components/dashboard/NavbarDashboard";
import DeviceList from "../components/dashboard/DeviceList";
import TelemetryPanel from "../components/dashboard/TelemetryPanel";
import ModalDevice from "../components/dashboard/ModalDevice";
import ModalEdit from "../components/dashboard/ModalEdit";
import ModalCollection from "../components/dashboard/ModalCollection";
import CollectionList from "../components/dashboard/CollectionList";
import CollectionPanel from "../components/dashboard/CollectionPanel";
import { Loader2, Monitor, Cpu } from "lucide-react";
import { TelemetryProvider, useTelemetry, Device, Collection } from "../context/TelemetryContext";

// Exporta tipos locais herdados para fins de compatibilidade
export type { Device, Collection };

function DashboardContent() {
  const {
    devices,
    collections,
    loading,
    error,
    fetchData,
    setDevices,
    setCollections
  } = useTelemetry();

  const [activeTab, setActiveTab] = useState<"devices" | "collections">("devices");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  
  // Controle dos Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState<Device | null>(null);

  // Sincroniza em tempo real a peça e o computador selecionados a partir do Provider
  const liveDevice = devices.find((d) => d.id === selectedDevice?.id) || selectedDevice;
  const liveCollection = collections.find((c) => c.id === selectedCollection?.id) || selectedCollection;

  // Inversão do Fluxo de Criação (PC -> Peça)
  const addDevice = async (device: Device) => {
    if (!liveCollection) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      // 1. Cria o dispositivo no inventário global
      const response = await fetch("http://localhost:8000/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(device),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar o hardware no servidor.");
      }

      const data = await response.json();
      const newDeviceId = data.id;

      // 2. Vincula a peça criada ao computador selecionado imediatamente
      const resLink = await fetch(`http://localhost:8000/collections/${liveCollection.id}/link/${newDeviceId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!resLink.ok) {
        throw new Error("Erro ao vincular o novo hardware ao computador.");
      }

      setIsModalOpen(false);
      fetchData(false); // Sincroniza a lista e o cache global imediatamente
    } catch (err: any) {
      alert(err.message || "Erro ao cadastrar e vincular hardware.");
    }
  };

  const handleOpenEdit = (device: Device) => {
    setDeviceToEdit(device);
    setIsEditModalOpen(true);
  };

  // Ações de CRUD: Editar Hardware
  const updateDevice = async (updatedDevice: Device) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const response = await fetch(`http://localhost:8000/devices/${updatedDevice.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedDevice),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar o dispositivo no servidor.");
      }

      setDevices(devices.map(d => d.id === updatedDevice.id ? updatedDevice : d));
      
      if (selectedDevice?.id === updatedDevice.id) {
        setSelectedDevice(updatedDevice);
      }
      
      setIsEditModalOpen(false);
      setDeviceToEdit(null);
      fetchData(false);
    } catch (err: any) {
      alert(err.message || "Erro de conexão ao atualizar no backend.");
    }
  };

  // Ações de CRUD: Excluir Hardware
  const deleteDevice = async (id: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const response = await fetch(`http://localhost:8000/devices/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar o dispositivo no servidor.");
      }

      setDevices(devices.filter(d => d.id !== id));
      if (selectedDevice?.id === id) setSelectedDevice(null);
      fetchData(false);
    } catch (err: any) {
      alert(err.message || "Erro de conexão ao deletar no backend.");
    }
  };

  // Ações de CRUD: Criar Computador/Coleção
  const addCollection = async (colData: { name: string; description: string; owner: string }) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const response = await fetch("http://localhost:8000/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(colData),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar computador no servidor.");
      }

      const data = await response.json();
      const newCol: Collection = {
        id: data.id,
        name: colData.name,
        description: colData.description,
        owner: colData.owner,
        status: "online",
        devices: []
      };

      setCollections(prev => [...prev, newCol]);
      setIsCollectionModalOpen(false);
      setSelectedCollection(newCol);
      fetchData(false);
    } catch (err: any) {
      alert(err.message || "Erro de conexão ao criar computador.");
    }
  };

  // Ações de CRUD: Excluir Computador/Coleção
  const deleteCollection = async (id: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const response = await fetch(`http://localhost:8000/collections/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir computador do servidor.");
      }

      setCollections(prev => prev.filter(c => c.id !== id));
      if (selectedCollection?.id === id) setSelectedCollection(null);
      fetchData(false);
    } catch (err: any) {
      alert(err.message || "Erro de conexão ao excluir computador.");
    }
  };

  // Botão Power: Ligar/Desligar Computador
  const togglePCStatus = async (colId: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const response = await fetch(`http://localhost:8000/collections/${colId}/power`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Erro ao alterar o status do computador.");
      }

      fetchData(false); // Atualiza os dados imediatamente
    } catch (err: any) {
      alert(err.message || "Erro ao ligar/desligar máquina.");
    }
  };

  // Relacionamento: Vincular Peça Existente ao PC
  const linkDeviceToPC = async (deviceId: string) => {
    if (!liveCollection) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const response = await fetch(`http://localhost:8000/collections/${liveCollection.id}/link/${deviceId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Erro ao vincular peça no servidor.");
      }

      fetchData(false);
    } catch (err: any) {
      alert(err.message || "Erro de conexão ao vincular peça.");
    }
  };

  // Relacionamento: Desvincular Peça do PC
  const unlinkDeviceFromPC = async (deviceId: string) => {
    if (!liveCollection) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const response = await fetch(`http://localhost:8000/collections/${liveCollection.id}/unlink/${deviceId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Erro ao desvincular peça no servidor.");
      }

      fetchData(false);
    } catch (err: any) {
      alert(err.message || "Erro de conexão ao desvincular peça.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <NavbarDashboard />
      
      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-24">
        {/* Coluna Esquerda: Seletor de Abas e Listas CRUD (5/12) */}
        <section className="lg:col-span-5 space-y-4">
          
          {/* Seletor de Abas Premium */}
          <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab("devices")}
              className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === "devices"
                  ? "bg-slate-800 text-cyan-400 font-bold border border-slate-700/50 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Cpu size={16} />
              Inventário de Peças
            </button>
            <button
              onClick={() => setActiveTab("collections")}
              className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === "collections"
                  ? "bg-slate-800 text-cyan-400 font-bold border border-slate-700/50 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor size={16} />
              Computadores (Montados)
            </button>
          </div>

          {/* Botão de Criação Dinâmico */}
          {activeTab === "collections" && (
            <button 
              onClick={() => setIsCollectionModalOpen(true)}
              className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/10 text-xs flex items-center justify-center gap-2"
            >
              + Criar Computador
            </button>
          )}
          
          {/* Box de Listagem */}
          <div className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden ${loading || error ? 'min-h-[300px] flex flex-col justify-center items-center p-6' : ''}`}>
            {loading ? (
              <div className="flex flex-col items-center gap-3 text-cyan-500">
                <Loader2 className="animate-spin text-cyan-500" size={36} />
                <span className="text-sm font-semibold text-slate-400">Carregando dados do Redis...</span>
              </div>
            ) : error ? (
              <div className="text-center space-y-3 p-4">
                <span className="text-sm text-red-400 font-semibold block">⚠️ {error}</span>
                <button 
                  onClick={() => fetchData(true)} 
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-all border border-slate-700"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : activeTab === "devices" ? (
              <DeviceList 
                devices={devices} 
                onSelect={setSelectedDevice} 
                onEdit={handleOpenEdit}
                onDelete={deleteDevice} 
                activeId={liveDevice?.id}
              />
            ) : (
              <CollectionList
                collections={collections}
                onSelect={setSelectedCollection}
                activeId={liveCollection?.id}
              />
            )}
          </div>
        </section>

        {/* Coluna Direita: Telemetria ou Gerenciamento da Coleção (7/12) */}
        <section className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-8 min-h-[600px] flex flex-col justify-start">
          {activeTab === "devices" ? (
            <TelemetryPanel device={liveDevice} />
          ) : (
            <CollectionPanel
              collection={liveCollection}
              allDevices={devices}
              onLink={linkDeviceToPC}
              onUnlink={unlinkDeviceFromPC}
              onDeleteCollection={() => liveCollection && deleteCollection(liveCollection.id)}
              onTogglePower={() => liveCollection && togglePCStatus(liveCollection.id)}
              onAddNewDeviceClick={() => setIsModalOpen(true)}
            />
          )}
        </section>
      </main>

      {/* Modal de Cadastro de Hardware */}
      {isModalOpen && (
        <ModalDevice onClose={() => setIsModalOpen(false)} onSave={addDevice} />
      )}

      {/* Modal de Edição de Hardware */}
      {isEditModalOpen && deviceToEdit && (
        <ModalEdit 
          device={deviceToEdit} 
          onClose={() => { setIsEditModalOpen(false); setDeviceToEdit(null); }} 
          onSave={updateDevice} 
        />
      )}

      {/* Modal de Criação de Coleção / PC */}
      {isCollectionModalOpen && (
        <ModalCollection 
          onClose={() => setIsCollectionModalOpen(false)} 
          onSave={addCollection} 
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <TelemetryProvider>
      <DashboardContent />
    </TelemetryProvider>
  );
}