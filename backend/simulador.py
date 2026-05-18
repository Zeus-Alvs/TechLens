import redis
import json
import time
import random
import re

redis_db = redis.Redis(host='localhost', port=6379, decode_responses=True)

def extrair_numero(texto):
    match = re.search(r'\d+', str(texto))
    return int(match.group()) if match else None

def substituir_numero(texto, novo_numero):
    return re.sub(r'\d+', str(novo_numero), str(texto), count=1)

print("Simulador de Telemetria com Ondas de Estresse Ativo! (CTRL+C para parar)")

# Dicionário em memória para guardar a tendência atual de cada dispositivo
# Evita o efeito "sobe e desce frenético"
historico_tendencias = {}

while True:
    try:
        ids = redis_db.smembers("lista_devices")
        for d_id in ids:
            info = redis_db.hgetall(d_id)
            if not info or info.get("status") == "offline":
                continue

            try:
                maximos = json.loads(info.get("dados_maximos", "{}"))
                tempo_real = json.loads(info.get("dados_tempo_real", "{}"))
            except (json.JSONDecodeError, TypeError):
                continue

           # 1. GERENCIADOR DE ONDAS (INÉRCIA EQUILIBRADA)
            if d_id not in historico_tendencias:
                historico_tendencias[d_id] = {
                    "direcao": random.choice(["SUBINDO", "DESCENDO"]),
                    "ciclos_restantes": random.randint(5, 9) # Aumentamos o fôlego inicial
                }
            
            onda = historico_tendencias[d_id]

            # 2. CALCULA O IMPACTO BASEADO NA TENDÊNCIA ATUAL
            uso_atual_text = tempo_real.get("Uso", "30%")
            uso_atual = extrair_numero(uso_atual_text) or 30

            if onda["direcao"] == "SUBINDO":
                # Passos de subida mais agressivos para estressar o hardware de verdade
                mudanca = random.choice([5, 8, 12, 15, 0, -2])
            else:
                # Descida um pouco mais suave
                mudanca = random.choice([-4, -6, -10, -12, 0, 2])

            novo_uso = max(20, min(100, uso_atual + mudanca))
            tempo_real["Uso"] = f"{novo_uso}%"

            # Reduz o contador da onda atual
            onda["ciclos_restantes"] -= 1

            # Inversão de tendência com tempos IGUAIS (ou até mais longos na subida se quiser)
            if onda["ciclos_restantes"] <= 0:
                if onda["direcao"] == "SUBINDO":
                    onda["direcao"] = "DESCENDO"
                    onda["ciclos_restantes"] = random.randint(5, 9) # Tempo de descida
                else:
                    onda["direcao"] = "SUBINDO"
                    onda["ciclos_restantes"] = random.randint(6, 10) # Dá mais tempo para a subida durar e chegar a 100%

            # 3. CALCULA A TEMPERATURA ACOMPANHANDO A ONDA
            # Segue no raio de variação de 15 pontos, mas como o uso agora é suave, ela vai subir em rampa também!
            variacao_temp = random.randint(-15, 15)
            nova_temp = max(25, min(100, novo_uso + variacao_temp))
            tempo_real["Temperatura"] = f"{nova_temp}°C"

            # 4. COMPUTA PROPORCIONALMENTE OS OUTROS ATRIBUTOS TÉCNICOS
            for chave, valor_max in maximos.items():
                if chave.lower() in ["uso", "temperatura"]:
                    continue
                
                limite_num = extrair_numero(valor_max)
                if limite_num is not None:
                    valor_proporcional = int(limite_num * (novo_uso / 100.0))
                    tempo_real[chave] = substituir_numero(valor_max, valor_proporcional)

            # Grava a telemetria realista e suave no Redis
            redis_db.hset(d_id, "dados_tempo_real", json.dumps(tempo_real))
            
            # Grava na lista circular de histórico persistente no Redis (Opção A)
            history_key = f"device:{d_id}:history"
            payload = json.dumps({"uso": novo_uso, "temperatura": nova_temp})
            redis_db.rpush(history_key, payload)
            redis_db.ltrim(history_key, -15, -1)
            
        print(f"[{time.strftime('%H:%M:%S')}] Telemetria atualizada aplicando Ondas de Carga.")
    except Exception as e:
        print(f"Erro no simulador: {e}")
        
    time.sleep(3)