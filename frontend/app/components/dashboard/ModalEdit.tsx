"use client";
import { useState, useRef } from "react";
import { X, Edit3, Gauge, Zap, Image as ImageIcon, Link2, Upload } from "lucide-react";

interface Device {
  id: string;
  name: string;
  category: string;
  serial: string;
  image: string;
  dados_maximos: any; // Novo nó de especificações de fábrica (Tarefa 3)
}

interface ModalEditProps {
  device: Device;
  onClose: () => void;
  onSave: (updatedDevice: Device) => void;
}

export default function ModalEdit({ device, onClose, onSave }: ModalEditProps) {
  const isCurrentlyLocal = device.image?.startsWith("data:image/");
  const [imageType, setImageType] = useState<"url" | "local">(isCurrentlyLocal ? "local" : "url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Device>({
    id: device.id,
    name: device.name || "",
    category: device.category || "Processador",
    serial: device.serial || "",
    image: device.image || "",
    dados_maximos: device.dados_maximos || {}
  });

  // Converte o objeto dados_maximos (JSON) recebido do backend em um array { key, value } editável,
  // mas oculta as chaves Uso e Temperatura (Tarefa 3)
  const initialAttributes = device.dados_maximos && typeof device.dados_maximos === "object"
    ? Object.entries(device.dados_maximos)
        .filter(([key]) => key.toLowerCase() !== "uso" && key.toLowerCase() !== "temperatura")
        .map(([key, value]) => ({ key, value: String(value) }))
    : [{ key: "", value: "" }];

  const [dynamicAttributes, setDynamicAttributes] = useState<{ key: string; value: string }[]>(
    initialAttributes.length > 0 ? initialAttributes : [{ key: "", value: "" }]
  );

  const handleAddAttribute = () => {
    setDynamicAttributes([...dynamicAttributes, { key: "", value: "" }]);
  };

  const handleRemoveAttribute = (index: number) => {
    setDynamicAttributes(dynamicAttributes.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (index: number, field: "key" | "value", val: string) => {
    const updated = [...dynamicAttributes];
    updated[index][field] = val;
    setDynamicAttributes(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filtra e converte atributos para dados_maximos (Tarefa 3)
    const dadosMaximosObj: { [key: string]: string } = {};
    dynamicAttributes.forEach(attr => {
      const k = attr.key.trim();
      const kLower = k.toLowerCase();
      // Garante que o usuário não registre Uso ou Temperatura manualmente
      if (k !== "" && kLower !== "uso" && kLower !== "temperatura") {
        dadosMaximosObj[k] = attr.value;
      }
    });

    onSave({
      ...formData,
      dados_maximos: dadosMaximosObj // Atualiza sob o novo contrato da API
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/70 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header do Modal */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Edit3 className="text-cyan-500" size={20} />
            Editar Hardware
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Nome e Categoria */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome do Dispositivo</label>
              <input 
                required
                type="text" 
                value={formData.name}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-xs"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</label>
              <select 
                value={formData.category}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none appearance-none text-xs"
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option>Processador</option>
                <option>Placa de Vídeo</option>
                <option>Memória RAM</option>
                <option>Armazenamento</option>
                <option>Outros</option>
              </select>
            </div>
          </div>

          {/* Serial */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nº de Série</label>
            <input 
              required
              type="text" 
              value={formData.serial}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none text-xs"
              onChange={(e) => setFormData({...formData, serial: e.target.value})}
            />
          </div>

          {/* Atributos Estáticos de Capacidade */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={14} className="text-yellow-500"/> Capacidades de Fábrica (Dados Estáticos)
              </label>
              <button
                type="button"
                onClick={handleAddAttribute}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
              >
                + Adicionar Atributo
              </button>
            </div>
            
            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
              {dynamicAttributes.map((attr, index) => (
                <div key={index} className="flex gap-2 items-center animate-in fade-in duration-200">
                  <input 
                    type="text" 
                    placeholder="Capacidade (ex: Clock)"
                    required
                    value={attr.key}
                    onChange={(e) => handleAttributeChange(index, "key", e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Valor Máximo (ex: 3600MHz)"
                    required
                    value={attr.value}
                    onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                  {dynamicAttributes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(index)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                      title="Remover Atributo"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Seleção do Tipo de Imagem */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <ImageIcon size={12}/> Foto do Dispositivo
            </label>
            
            <div className="flex gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => { setImageType("url"); setFormData({ ...formData, image: "" }); }}
                className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-2 transition-all ${imageType === "url" ? "bg-slate-800 text-cyan-400 font-medium" : "text-slate-400 hover:text-white"}`}
              >
                <Link2 size={14} /> URL da Web
              </button>
              <button
                type="button"
                onClick={() => { setImageType("local"); setFormData({ ...formData, image: "" }); }}
                className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-2 transition-all ${imageType === "local" ? "bg-slate-800 text-cyan-400 font-medium" : "text-slate-400 hover:text-white"}`}
              >
                <Upload size={14} /> Arquivo Local
              </button>
            </div>

            {imageType === "url" ? (
              <input 
                type="url" 
                value={formData.image}
                placeholder="https://link-da-imagem.com/foto.jpg"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none text-xs"
                onChange={(e) => setFormData({...formData, image: e.target.value})}
              />
            ) : (
              <div>
                <input 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-dashed border-slate-800 hover:border-slate-700 text-slate-400 rounded-lg text-xs flex flex-col items-center justify-center gap-1.5 transition-all"
                >
                  {formData.image ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      ✓ Imagem local carregada
                    </span>
                  ) : (
                    <>
                      <Upload size={18} className="text-slate-500" />
                      <span>Clique para alterar a imagem do PC</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Footer do Form */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 transition-colors text-xs font-semibold"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 text-xs"
            >
              <Gauge size={16} />
              Confirmar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}