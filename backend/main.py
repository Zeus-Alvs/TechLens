from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid
from schemas import RackMonitor
from database import get_redis

app = FastAPI(title="TechLens Monitoring Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "status": "Online",
        "sistema": "TechLens Monitoring API",
        "docs": "Acesse /docs para ver a documentação"
    }
    
redis_db = get_redis()

@app.post("/racks", status_code=201)
def cadastrar_rack(rack: RackMonitor):
    rack_id = f"RACK:{uuid.uuid4().hex[:8].upper()}"
    rack.id = rack_id
    
    dados = {k: str(v) for k, v in rack.model_dump().items()}
    
    redis_db.hset(rack_id, mapping=dados)
    redis_db.sadd("lista_racks", rack_id)
    
    return {"mensagem": "Equipamento vinculado com sucesso!", "rack_id": rack_id}

@app.get("/racks")
def listar_todos_racks():
    ids = redis_db.smembers("lista_racks")
    dashboard = []
    
    for rid in ids:
        info = redis_db.hgetall(rid)
        if info:
            dashboard.append(info)
            
    return dashboard

@app.get("/racks/{rack_id}")
def detalhes_rack(rack_id: str):
    info = redis_db.hgetall(rack_id)
    if not info:
        raise HTTPException(status_code=404, detail="Rack não encontrado na rede.")
    return info

@app.put("/racks/{rack_id}")
def atualizar_status_rack(rack_id: str, rack: RackMonitor):
    if not redis_db.exists(rack_id):
        raise HTTPException(status_code=404, detail="ID de Rack inexistente.")
    
    rack.id = rack_id
    dados = {k: str(v) for k, v in rack.model_dump().items()}
    redis_db.hset(rack_id, mapping=dados)
    
    return {"mensagem": "Dados de monitoramento atualizados."}

@app.delete("/racks/{rack_id}")
def desvincular_rack(rack_id: str):
    if redis_db.delete(rack_id):
        redis_db.srem("lista_racks", rack_id)
        return {"mensagem": f"Rack {rack_id} removido do sistema."}
    
    raise HTTPException(status_code=404, detail="Falha ao remover: Rack não encontrado.")   