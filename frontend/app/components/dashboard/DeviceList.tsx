"use client";
import { Eye, Edit2, Trash2 } from "lucide-react";

// interface para combinar com o Schema do bd
interface Device {
  id: string;
  name: string;
  category: string;
  image?: string;
}

interface DeviceListProps {
  devices: Device[];
  onSelect: (device: Device) => void;
  onDelete: (id: string) => void;
  onEdit: (device: Device) => void; 
  activeId?: string;
}

export default function DeviceList({ devices, onSelect, onDelete, onEdit, activeId }: DeviceListProps) {
  
  if (devices.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-500 italic">Nenhum hardware encontrado no banco de dados.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-800">
      {devices.map((device) => (
        <li 
          key={device.id} 
          className={`flex items-center justify-between p-4 transition-all duration-200 ${
            activeId === device.id 
            ? 'bg-cyan-500/10 border-r-2 border-cyan-500' 
            : 'hover:bg-slate-800/40 border-r-2 border-transparent'
          }`}
        >
          <div className="flex items-center gap-4">
          
            <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700">
               <img 
                src={device.image || "https://via.placeholder.com/150?text=HW"} 
                className="w-full h-full object-cover" 
                alt={device.name} 
              />
            </div>
            
            <div className="min-w-0">
              <p className="text-white font-semibold truncate leading-tight">{device.name}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{device.category}</p>
            </div>
          </div>
          
          <div className="flex gap-1 ml-4">
            <button 
              onClick={() => onSelect(device)} 
              className={`p-2 rounded-lg transition-colors ${activeId === device.id ? 'bg-cyan-500 text-slate-950' : 'text-cyan-400 hover:bg-cyan-500/20'}`}
              title="Monitorar"
            >
              <Eye size={18} />
            </button>
            
            <button 
              onClick={() => onEdit(device)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit2 size={18} />
            </button>
            
            <button 
              onClick={() => {
                if(confirm("Deseja realmente excluir este hardware?")) {
                  onDelete(device.id);
                }
              }} 
              className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Excluir"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}