from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
import uuid
import hashlib
import json
from typing import Optional

from schemas import DeviceModel, CollectionModel, UserAuth, UserLogin
from database import get_redis

app = FastAPI(
    title="TechLens Engine",
    description="Monitoramento de Hardware com Autenticação e Coleções"
)

# ==========================================
# ROTA PRINCIPAL
# ==========================================
@app.get("/", tags=["Home"])
def home():
    return {
        "status": "online",
        "api": "TechLens Engine",
        "docs": "/docs"
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

redis_db = get_redis()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# ==========================================
# AUTENTICAÇÃO (REGISTER / LOGIN / LOGOUT)
# ==========================================
@app.post("/auth/register", status_code=201, tags=["Auth"])
def registrar_usuario(user: UserAuth):
    if redis_db.exists(f"user:{user.email}"):
        raise HTTPException(status_code=400, detail="Usuário já existe.")
    
    user_data = {
        "username": user.username,
        "email": user.email,
        "password": hash_password(user.password),
        "role": user.role
    }
    redis_db.hset(f"user:{user.email}", mapping=user_data)
    return {"mensagem": "Usuário criado com sucesso!", "role": user.role}

@app.post("/auth/login", tags=["Auth"])
def login(user: UserLogin):
    user_data = redis_db.hgetall(f"user:{user.email}")
    
    if not user_data or user_data["password"] != hash_password(user.password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas.")
    
    token = f"TOKEN-{uuid.uuid4().hex}"
    redis_db.setex(f"token:{token}", 86400, user.email)
    
    return {
        "mensagem": "Login efetuado com sucesso!",
        "token": token,
        "role": user_data["role"],
        "email": user.email,
        "username": user_data.get("username", "Usuário") # Retorna o username real
    }

@app.post("/auth/logout", tags=["Auth"])
def logout(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token não fornecido.")
    token = authorization.replace("Bearer ", "").strip()
    
    if redis_db.exists(f"token:{token}"):
        redis_db.delete(f"token:{token}")
        return {"mensagem": "Logout efetuado. Sessão encerrada no servidor."}
    raise HTTPException(status_code=401, detail="Token inválido ou sessão já expirada.")

# ==========================================
# SECURE HELPER: OBTER USUÁRIO ATUAL
# ==========================================
def get_current_user_email(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Token de autorização ausente.")
    token = authorization.replace("Bearer ", "").strip()
    email = redis_db.get(f"token:{token}")
    if not email:
        raise HTTPException(status_code=401, detail="Sessão inválida ou expirada.")
    return email

# ==========================================
# CRUD: DISPOSITIVOS (PEÇAS)
# ==========================================
@app.post("/devices", status_code=201, tags=["Hardware"])
def cadastrar_dispositivo(device: DeviceModel, authorization: Optional[str] = Header(None)):
    email = get_current_user_email(authorization)
    dev_id = f"DEV:{uuid.uuid4().hex[:8].upper()}"
    device.id = dev_id
    
    dados = device.model_dump(exclude={"id"})
    dados["owner"] = email # Vincula a peça ao dono logado
    
    # Força as travas de segurança padrão em dados_maximos
    dados["dados_maximos"]["Temperatura"] = "100°C"
    dados["dados_maximos"]["Uso"] = "100%"
    
    # Inicializa os dados em tempo real estáveis
    dados["dados_tempo_real"] = {
        "Uso": "20%",
        "Temperatura": "35°C"
    }
    
    # Serialização JSON para o Redis
    dados["dados_maximos"] = json.dumps(dados["dados_maximos"])
    dados["dados_tempo_real"] = json.dumps(dados["dados_tempo_real"])
    
    dados_para_redis = {k: str(v) for k, v in dados.items()}
    redis_db.hset(dev_id, mapping=dados_para_redis)
    redis_db.sadd("lista_devices", dev_id) # Mantém global para o simulador
    redis_db.sadd(f"user:{email}:devices", dev_id) # Vincula especificamente ao usuário
    
    return {"mensagem": "Peça cadastrada!", "id": dev_id}

@app.get("/devices", tags=["Hardware"])
def listar_dispositivos(authorization: Optional[str] = Header(None)):
    email = get_current_user_email(authorization)
    ids = redis_db.smembers(f"user:{email}:devices") # Busca apenas os IDs do usuário ativo
    resultado = []
    for d_id in ids:
        info = redis_db.hgetall(d_id)
        if info:
            info["id"] = d_id
            if "dados_maximos" in info:
                info["dados_maximos"] = json.loads(info["dados_maximos"])
            if "dados_tempo_real" in info:
                info["dados_tempo_real"] = json.loads(info["dados_tempo_real"])
            
            # Recupera o histórico circular do Redis
            history_key = f"device:{d_id}:history"
            history_list = redis_db.lrange(history_key, 0, -1)
            parsed_history = []
            for item in history_list:
                try:
                    parsed_history.append(json.loads(item))
                except Exception:
                    pass
            info["historico"] = parsed_history
            
            resultado.append(info)
    return resultado

@app.get("/devices/{device_id}", tags=["Hardware"])
def buscar_dispositivo(device_id: str, authorization: Optional[str] = Header(None)):
    email = get_current_user_email(authorization)
    info = redis_db.hgetall(device_id)
    if not info:
        raise HTTPException(status_code=404, detail="Peça não encontrada.")
    if info.get("owner") != email:
        raise HTTPException(status_code=403, detail="Acesso negado: esta peça pertence a outro usuário.")
        
    info["id"] = device_id
    if "dados_maximos" in info:
        info["dados_maximos"] = json.loads(info["dados_maximos"])
    if "dados_tempo_real" in info:
        info["dados_tempo_real"] = json.loads(info["dados_tempo_real"])
    
    # Recupera o histórico circular do Redis
    history_key = f"device:{device_id}:history"
    history_list = redis_db.lrange(history_key, 0, -1)
    parsed_history = []
    for item in history_list:
        try:
            parsed_history.append(json.loads(item))
        except Exception:
            pass
    info["historico"] = parsed_history
    
    return info

@app.put("/devices/{device_id}", tags=["Hardware"])
def atualizar_dispositivo(device_id: str, device: DeviceModel, authorization: Optional[str] = Header(None)):
    email = get_current_user_email(authorization)
    info_antiga = redis_db.hgetall(device_id)
    if not info_antiga:
        raise HTTPException(status_code=404, detail="Dispositivo não encontrado.")
    if info_antiga.get("owner") != email:
        raise HTTPException(status_code=403, detail="Acesso negado: esta peça pertence a outro usuário.")
    
    # Transforma o payload do front em dicionário, excluindo o id e o nó de tempo real vindo do front
    dados_novos = device.model_dump(exclude={"id", "dados_tempo_real"})
    dados_novos["owner"] = email # Mantém o proprietário
    
    # Garante que chaves padrão de fábrica nunca mudem no Update
    dados_novos["dados_maximos"]["Temperatura"] = "100°C"
    dados_novos["dados_maximos"]["Uso"] = "100%"
    
    # --- 🛠️ CORREÇÃO DO BUG: EXPURGO DE CHAVES FANTASMAS ---
    try:
        # Lemos a telemetria antiga que estava rodando no Redis
        tempo_real_antigo = json.loads(info_antiga.get("dados_tempo_real", "{}"))
    except Exception:
        tempo_real_antigo = {}
    
    # Mantemos estritamente o Uso e Temperatura atuais para não quebrar a linha do Sparkline no front,
    # mas eliminamos todas as outras chaves antigas (evitando a duplicação de CLOCK, CLOCKKKKK, etc.)
    tempo_real_limpo = {
        "Uso": tempo_real_antigo.get("Uso", "20%"),
        "Temperatura": tempo_real_antigo.get("Temperatura", "35°C")
    }
    
    # O simulador.py vai reconstruir as chaves técnicas proporcionais corretas em 3 segundos
    dados_novos["dados_tempo_real"] = json.dumps(tempo_real_limpo)
    # -------------------------------------------------------
    
    # Serializa os dados máximos novos
    dados_novos["dados_maximos"] = json.dumps(dados_novos["dados_maximos"])
    
    # Salva tudo como String no Redis
    dados_para_redis = {k: str(v) for k, v in dados_novos.items()}
    redis_db.hset(device_id, mapping=dados_para_redis)
    
    return {"mensagem": "Dispositivo atualizado e histórico de telemetria limpo de fantasmas!", "id": device_id}

@app.delete("/devices/{device_id}", tags=["Hardware"])
def remover_dispositivo(device_id: str, authorization: Optional[str] = Header(None)):
    email = get_current_user_email(authorization)
    info = redis_db.hgetall(device_id)
    if not info:
        raise HTTPException(status_code=404, detail="Peça não encontrada.")
    if info.get("owner") != email:
        raise HTTPException(status_code=403, detail="Acesso negado: esta peça pertence a outro usuário.")
        
    if redis_db.delete(device_id):
        redis_db.srem("lista_devices", device_id)
        redis_db.srem(f"user:{email}:devices", device_id)
        redis_db.delete(f"device:{device_id}:history") # Remove o histórico associado no Redis
        
        # Desvincula de qualquer computador (PC) associado a este usuário
        col_ids = redis_db.smembers(f"user:{email}:collections")
        for c_id in col_ids:
            redis_db.srem(f"{c_id}:devices", device_id)
            
        return {"mensagem": "Peça removida com sucesso."}
    raise HTTPException(status_code=404, detail="Peça não encontrada.")

# ==========================================
# CRUD: COLEÇÕES (COMPUTADORES)
# ==========================================
@app.post("/collections", status_code=201, tags=["Collections"])
def criar_colecao(col: CollectionModel, authorization: Optional[str] = Header(None)):
    email = get_current_user_email(authorization)
    col_id = f"PC:{uuid.uuid4().hex[:8].upper()}"
    col.id = col_id
    
    dados = {
        "name": col.name, 
        "description": col.description, 
        "owner": email, # Vincula ao e-mail ativo
        "status": col.status
    }
    redis_db.hset(col_id, mapping=dados)
    redis_db.sadd("lista_collections", col_id) # Mantém global
    redis_db.sadd(f"user:{email}:collections", col_id) # Vincula especificamente ao usuário
    
    return {"mensagem": "Computador criado com sucesso!", "id": col_id}

@app.get("/collections", tags=["Collections"])
def listar_colecoes(authorization: Optional[str] = Header(None)):
    email = get_current_user_email(authorization)
    col_ids = redis_db.smembers(f"user:{email}:collections") # Filtra por usuário ativo
    resultado = []
    for c_id in col_ids:
        info = redis_db.hgetall(c_id)
        if info:
            info["id"] = c_id
            device_ids = redis_db.smembers(f"{c_id}:devices")
            pecas = []
            for d_id in device_ids:
                if redis_db.exists(d_id):
                    dev_info = redis_db.hgetall(d_id)
                    if dev_info:
                        dev_info["id"] = d_id
                        if "dados_maximos" in dev_info:
                            dev_info["dados_maximos"] = json.loads(dev_info["dados_maximos"])
                        if "dados_tempo_real" in dev_info:
                            dev_info["dados_tempo_real"] = json.loads(dev_info["dados_tempo_real"])
                        pecas.append(dev_info)
            info["devices"] = pecas
            resultado.append(info)
    return resultado

@app.delete("/collections/{collection_id}", tags=["Collections"])
def remover_colecao(collection_id: str, authorization: Optional[str] = Header(None)):
    email = get_current_user_email(authorization)
    info = redis_db.hgetall(collection_id)
    if not info:
        raise HTTPException(status_code=404, detail="Computador não encontrado.")
    if info.get("owner") != email:
        raise HTTPException(status_code=403, detail="Acesso negado: este computador pertence a outro usuário.")
        
    if redis_db.delete(collection_id):
        redis_db.srem("lista_collections", collection_id)
        redis_db.srem(f"user:{email}:collections", collection_id)
        redis_db.delete(f"{collection_id}:devices")
        return {"mensagem": "Computador removido com sucesso."}
    raise HTTPException(status_code=404, detail="Computador não encontrado.")

@app.post("/collections/{collection_id}/link/{device_id}", tags=["Collections"])
def vincular_peca_ao_pc(collection_id: str, device_id: str, authorization: Optional[str] = Header(None)):
    email = get_current_user_email(authorization)
    col_info = redis_db.hgetall(collection_id)
    dev_info = redis_db.hgetall(device_id)
    
    if not col_info or not dev_info:
        raise HTTPException(status_code=404, detail="Computador ou Peça inexistente.")
    if col_info.get("owner") != email or dev_info.get("owner") != email:
        raise HTTPException(status_code=403, detail="Acesso negado: você só pode vincular peças e PCs de sua propriedade.")
        
    status_col = col_info.get("status") or "online"
    redis_db.sadd(f"{collection_id}:devices", device_id)
    redis_db.hset(device_id, "status", status_col)
    
    return {"mensagem": "Peça vinculada com sucesso!"}

@app.delete("/collections/{collection_id}/unlink/{device_id}", tags=["Collections"])
def desvincular_peca_do_pc(collection_id: str, device_id: str, authorization: Optional[str] = Header(None)):
    email = get_current_user_email(authorization)
    col_info = redis_db.hgetall(collection_id)
    if not col_info:
        raise HTTPException(status_code=404, detail="Computador não encontrado.")
    if col_info.get("owner") != email:
        raise HTTPException(status_code=403, detail="Acesso negado: este computador pertence a outro usuário.")
        
    redis_db.srem(f"{collection_id}:devices", device_id)
    redis_db.hset(device_id, "status", "online")
    
    return {"mensagem": "Peça desvinculada."}

@app.put("/collections/{collection_id}/power", tags=["Collections"])
def alternar_energia(collection_id: str, authorization: Optional[str] = Header(None)):
    email = get_current_user_email(authorization)
    info = redis_db.hgetall(collection_id)
    if not info:
        raise HTTPException(status_code=404, detail="Computador não encontrado.")
    if info.get("owner") != email:
        raise HTTPException(status_code=403, detail="Acesso negado: este computador pertence a outro usuário.")
        
    novo_status = "offline" if info.get("status") == "online" else "online"
    redis_db.hset(collection_id, "status", novo_status)
    
    dev_ids = redis_db.smembers(f"{collection_id}:devices")
    for d_id in dev_ids:
        redis_db.hset(d_id, "status", novo_status)
        
    return {"mensagem": f"Computador alterado para {novo_status}", "status": novo_status}