from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

# ==========================================
# MODELOS DE AUTENTICAÇÃO E USUÁRIO
# ==========================================
class UserAuth(BaseModel):
    username: str = Field(..., description="Nome de usuário visível")
    email: str = Field(..., description="E-mail de login")
    password: str = Field(..., description="Senha do usuário")
    role: Optional[str] = Field("user", description="Nível de acesso: 'admin' ou 'user'")

class UserLogin(BaseModel):
    email: str
    password: str

# ==========================================
# MODELO DE DISPOSITIVOS (HARDWARE)
# ==========================================
class DeviceModel(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., description="Ex: SSD Kingston 1TB")
    category: str = Field(..., description="Ex: Armazenamento, GPU, CPU")
    serial: str = Field(..., description="S/N ou IP")
    image: str = Field(..., description="Caminho da imagem")
    status: str = Field("online", description="Status de energia da peça")
    
    # DIVISÃO DA ARQUITETURA DE DADOS
    dados_maximos: Dict[str, Any] = Field(..., description="Capacidades máximas de fábrica (ex: Clock)")
    dados_tempo_real: Optional[Dict[str, Any]] = Field(default={}, description="Métricas atuais medidas pelo simulador")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Processador Core i9",
                "category": "CPU",
                "serial": "SN-INTEL-9921",
                "image": "/images/i9.png",
                "dados_maximos": {
                    "Clock": "5000MHz",
                    "Consumo": "240W"
                }
            }
        }

# ==========================================
# MODELO DE COLEÇÕES (COMPUTADORES)
# ==========================================
class CollectionModel(BaseModel):
    id: Optional[str] = None
    name: str = Field(...)
    description: str = Field(...)
    owner: Optional[str] = Field(default=None, description="E-mail do usuário proprietário")
    status: str = Field("online", description="Status de energia: 'online' ou 'offline'")
    devices: Optional[List[DeviceModel]] = Field(default=[], description="Lista de peças vinculadas")