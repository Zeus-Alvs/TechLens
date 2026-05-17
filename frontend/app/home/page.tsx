"use client";
import { useState } from "react";
import NavbarDashboard from "../components/dashboard/NavbarDashboard";
import DeviceList from "../components/dashboard/DeviceList";
import TelemetryPanel from "../components/dashboard/TelemetryPanel";
import ModalDevice from "../components/dashboard/ModalDevice";
import ModalEdit from "../components/dashboard/ModalEdit";

export type Device = {
  id: string;
  name: string;
  category: string;
  serial: string;
  image: string;
  extraAttribute: string;
};

export default function Home() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  
  // Controle do Modal de Cadastro
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Controle do Modal de Edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState<Device | null>(null);

  // Ação: Cadastrar (add CRUD)
  const addDevice = (device: Device) => {
    setDevices([...devices, device]);
    setIsModalOpen(false);
  };


  const handleOpenEdit = (device: Device) => {
    setDeviceToEdit(device);
    setIsEditModalOpen(true);
  };

  // Ação: Editar/Atualizar (add CRUD)
  const updateDevice = (updatedDevice: Device) => {
    setDevices(devices.map(d => d.id === updatedDevice.id ? updatedDevice : d));
    
    if (selectedDevice?.id === updatedDevice.id) {
      setSelectedDevice(updatedDevice);
    }
    
    setIsEditModalOpen(false);
    setDeviceToEdit(null);
  };

  // Ação: Excluir (Add CRUD)
  const deleteDevice = (id: string) => {
    setDevices(devices.filter(d => d.id !== id));
    if (selectedDevice?.id === id) setSelectedDevice(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <NavbarDashboard user="Eduarda" />
      
      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-24">
        {/* Coluna Esquerda: CRUD (5/12) */}
        <section className="lg:col-span-5 space-y-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/10"
          >
            + Cadastrar Novo Eletrônico
          </button>
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <DeviceList 
              devices={devices} 
              onSelect={setSelectedDevice} 
              onEdit={handleOpenEdit}
              onDelete={deleteDevice} 
              activeId={selectedDevice?.id}
            />
          </div>
        </section>

        {/* Coluna Direita: Telemetria (7/12) */}
        <section className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-8 min-h-[600px] flex flex-col">
          <TelemetryPanel device={selectedDevice} />
        </section>
      </main>

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <ModalDevice onClose={() => setIsModalOpen(false)} onSave={addDevice} />
      )}

      {/* Modal de Edição */}
      {isEditModalOpen && deviceToEdit && (
        <ModalEdit 
          device={deviceToEdit} 
          onClose={() => { setIsEditModalOpen(false); setDeviceToEdit(null); }} 
          onSave={updateDevice} 
        />
      )}
    </div>
  );
}