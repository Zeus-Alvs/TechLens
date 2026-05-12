import redis
import os

redis_client = redis.Redis(
    host="localhost", 
    port=6379, 
    db=0, 
    decode_responses=True
)

def get_redis():
    try:
        # Testa a conexão
        redis_client.ping()
        return redis_client
    except redis.ConnectionError:
        print("Erro: Não foi possível conectar ao Redis. O Docker está rodando?")
        return None