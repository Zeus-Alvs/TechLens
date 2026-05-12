from pydantic import BaseModel, Field
from typing import Optional

class RackMonitor(BaseModel):
    # ID opcional na criação, pois o backend irá gerar
    id: Optional[str] = None
    
    # "Título" -> Nome identificador do Rack
    nome_identificador: str = Field(..., description="Nome de identificação do ativo na rede")
    
    # "Autor" -> Responsável técnico ou Empresa Cliente
    cliente_vinculado: str = Field(..., description="Empresa ou departamento responsável pelo rack")
    
    # "Categoria" -> Tipo de Rack ou Servidor
    tipo_equipamento: str = Field(..., description="Categoria do equipamento")
    
    # "Ano" -> Ano de Instalação/Ativação
    ano_instalacao: int = Field(..., description="Ano em que o ativo foi instalado")
    
    # "Quantidade" -> Capacidade ocupada ou unidades U
    u_ocupados: int = Field(..., description="Quantidade de unidades rack (U) ocupadas") 
    
    # "Status" -> Estado atual
    status_sistema: str = Field(..., description="Status de operação atual do rack")

    # Campos Extras para o "Monitoramento" (Hipotéticos)
    ip_gerenciamento: str = Field(..., description="IP principal para acesso ao gerenciamento do rack")
    temperatura_atual: Optional[float] = Field(25.5, description="Temperatura em Celsius medida pelos sensores")

    class Config:
        json_schema_extra = {
            "example": {
                "nome_identificador": "RACK-01-SALA-A",
                "cliente_vinculado": "TechLens Solutions Ltda",
                "tipo_equipamento": "Rack de Colocation 42U",
                "ano_instalacao": 2026,
                "u_ocupados": 12,
                "status_sistema": "Online / Estável",
                "ip_gerenciamento": "192.168.10.50",
                "temperatura_atual": 22.5
            }
        }