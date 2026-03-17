# Production Deployment Guide

Ce guide explique comment déployer Bibliotheque en production avec haute disponibilité, monitoring et gestion des données.

## Architecture de Production

```
┌─────────────────────────────────────────────────────────────────┐
│                        Internet (HTTP/HTTPS)                     │
└──────────────────────────────────────┬──────────────────────────┘
                                       │
                    ┌──────────────────▼──────────────────┐
                    │    Nginx Reverse Proxy              │
                    │  (Load Balancer + Caching)          │
                    └──────────────────┬──────────────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                │                      │                      │
        ┌───────▼────────┐     ┌──────▼──────┐     ┌────────▼────────┐
        │   API-1        │     │   Client    │     │    Uptime Kuma  │
        │  (FastAPI)     │     │  (React)    │     │   (Monitoring)  │
        └───────┬────────┘     └──────┬──────┘     └────────┬────────┘
                │                    │                      │
                │        ┌───────────┼──────────────┐      │
                │        │           │              │      │
        ┌───────▼────────┐     │    │      │
        │   API-2        │     │    │      │
        │  (FastAPI)     │     │    │      │
        └────────┬───────┘     │    │      │
                 │             │    │      │
        ┌────────▼─────────────▼────▼──────▼──────┐
        │  Shared Data Volume (SQLite Database)   │
        │  + DB Backup Service (Hourly)           │
        │  + Redis Cache (Sessions/Caching)       │
        └──────────────────────────────────────────┘
```

## Prérequis

- Docker & Docker Compose (v2.0+)
- Ports disponibles: 80 (HTTP), 443 (HTTPS), 3001 (Uptime Kuma)
- Minimum 2GB RAM, 2 CPU cores
- Accès read/write au disque pour les volumes

## Déploiement Initial

### 1. Préparation

```bash
cd /path/to/bibliotheque

# Créer les répertoires de données
mkdir -p data backup redis-data uptime-kuma-data nginx-cache

# Configurer l'environnement
cp .env.prod.example .env.prod

# ⚠️ IMPORTANT: Editer .env.prod et changer SECRET_KEY et passwords
nano .env.prod
```

### 2. Lancement de la Production

```bash
# Utiliser le docker-compose de production
docker-compose -f docker-compose.prod.yml up -d

# Vérifier le statut
docker-compose -f docker-compose.prod.yml ps

# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. Vérification de l'État

```bash
# Check health statuses
docker-compose -f docker-compose.prod.yml ps

# Accéder aux services
- Application: http://localhost/
- API: http://localhost/api/
- Uptime Kuma: http://localhost:3001
```

## Fonctionnalités de Production

### 1. Load Balancing (Nginx)

- **2 instances d'API** en load balanced mode (least_conn)
- **Healthchecks** automatiques avec failover
- **Circuit breaker** avec `fail_timeout=30s`
- **Caching intelligent**:
  - Pour les GET `/api/` : 10 minutes
  - Pour les assets statiques (CSS/JS/images): 30 jours

### 2. Data Consistency & Persistence

**Volumes nommés avec bind mounts**:

```yaml
volumes:
  bibliotheque-data: # SQLite database partagée entre API instances
  redis-data: # Redis persistence (AOF mode)
  uptime-kuma-data: # Monitoring data
  nginx-cache: # Cache proxy
```

**Backup automatique**:

- Service `db-backup` crée un backup du SQLite toutes les heures
- Retenus pendant 7 jours
- Compressions manuelles possibles: `tar -czf backup-$(date +%Y%m%d).tar.gz backup/`

### 3. Monitoring & Uptime Tracking

**Uptime Kuma** (http://localhost:3001):

1. **Configuration initiale**:

   ```bash
   # Se connecter avec admin/changepassword123
   # CHANGER LE PASSWORD IMMÉDIATEMENT
   ```

2. **Configurer les monitors**:

   ```
   - HTTP Keyword: http://localhost/api/ | "status": "running"
   - HTTP: http://localhost/ (healthcheck client)
   - TCP: redis:6379 (Redis connectivity)
   ```

3. **Configurer les notifications**:
   - Email
   - Slack/Discord webhooks
   - SMS (Twilio, etc.)

### 4. Traffic Management

**Rate Limiting (Nginx)**:

```
- API: 10 req/s (burst: 20)
- General: 30 req/s (burst: 50)
```

**Compression & Caching**:

```
- Gzip: Activé, niveau 6
- Static assets: Cached 30 jours
- API responses: Cached 10 minutes
- ETag support: Oui
```

### 5. Downtime Minimal

**Stratégies**:

1. **Rolling updates**:

   ```bash
   # Update API-1 while API-2 handles traffic
   docker-compose -f docker-compose.prod.yml up -d api-1
   # Nginx detecte le failover automatiquement
   ```

2. **Blue-Green deployment** (optional):

   ```bash
   # Créer un second docker-compose.prod.blue.yml
   # Déployer sur le "green" environment
   # Switcher Nginx vers green quand ready
   ```

3. **Graceful shutdown**:
   - Healthchecks arrêtent le traffic AVANT shutdown (drain period: 20s)
   - API instances gardent les connections existantes

## Maintenance

### Logs

```bash
# Tous les services
docker-compose -f docker-compose.prod.yml logs -f

# Service spécifique
docker-compose -f docker-compose.prod.yml logs -f api-1

# Format JSON structured
# Tous les logs sont en JSON format pour parsing facile
```

### Sauvegarde & Restauration

```bash
# Backup complet
tar -czf backup-complete-$(date +%Y%m%d_%H%M%S).tar.gz data/ backup/ redis-data/ uptime-kuma-data/

# Restauration
docker-compose -f docker-compose.prod.yml down
rm -rf data/
tar -xzf backup-complete-*.tar.gz
docker-compose -f docker-compose.prod.yml up -d
```

### Scaling

```bash
# Ajouter une 3ème instance API (api-3)
# 1. Copier le service api-2 dans docker-compose.prod.yml
# 2. Renommer en api-3
# 3. Ajouter upstream dans nginx.conf:
#    server api-3:8000 max_fails=3 fail_timeout=30s;
# 4. Recharger:
docker-compose -f docker-compose.prod.yml up -d
docker exec bibliotheque-nginx nginx -s reload
```

## Sécurité

### Checklist Pré-Production

- [ ] Changer `SECRET_KEY` dans `.env.prod` (utiliser `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
- [ ] Changer le password Uptime Kuma
- [ ] Configurer les certificats SSL/TLS (décommenter la section HTTPS dans nginx.conf)
- [ ] Restreindre `ALLOWED_ORIGINS` CORS (ne pas utiliser `*`)
- [ ] Configurer les backups vers un stockage distant (S3, NAS, etc.)
- [ ] Mettre en place la rotation des logs
- [ ] Configurer Fail2Ban pour les bruteforce attacks
- [ ] Mettre en place un VPN ou une whitelist IP pour les outils de monitoring

### SSL/TLS Setup

```bash
# Générer un certificat auto-signé (development)
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -nodes -out ssl/cert.pem -keyout ssl/key.pem -days 365

# Ou utiliser Let's Encrypt avec Certbot
certbot certonly --standalone -d example.com
cp /etc/letsencrypt/live/example.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/example.com/privkey.pem ssl/key.pem

# Décommenter la section HTTPS dans nginx.conf et recharger
docker exec bibliotheque-nginx nginx -s reload
```

## Monitoring & Alertes

### Métriques clés à surveiller

1. **API Response Time**: Target < 100ms p95
2. **Error Rate**: Target < 0.1%
3. **DB Backup Success**: Tous les jours à 100%
4. **Redis Memory Usage**: < 80% capacity
5. **Disk Space**: > 20% free

### Commandes de diagnostic

```bash
# CPU & Memory usage
docker stats --no-stream

# API logs en temps réel
docker-compose -f docker-compose.prod.yml logs -f api-1 api-2 | grep ERROR

# Vérifier la santé des instances
curl -s http://localhost/api/ | jq .status

# Vérifier la cache Nginx
curl -I http://localhost/ | grep X-Cache-Status

# Vérifier Redis
docker-compose -f docker-compose.prod.yml exec redis redis-cli INFO
```

## Troubleshooting

### API instances down

```bash
# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs api-1 api-2

# Restart
docker-compose -f docker-compose.prod.yml restart api-1 api-2

# Vérifier la santé
curl -f http://localhost:8000/ || echo "API unhealthy"
```

### Database locked (SQLite issue)

```bash
# Stop les instances API
docker-compose -f docker-compose.prod.yml stop api-1 api-2

# Vérifier l'intégrité
docker-compose -f docker-compose.prod.yml run --rm -v bibliotheque-data:/data alpine sqlite3 /data/bibliotheque.db "PRAGMA integrity_check;"

# Restart
docker-compose -f docker-compose.prod.yml up -d api-1 api-2
```

### Nginx cache issues

```bash
# Clearner le cache
docker volume rm bibliotheque_nginx-cache
docker-compose -f docker-compose.prod.yml up -d

# Ou manuellement
docker exec bibliotheque-nginx rm -rf /var/cache/nginx/*
```

## Performance Tuning

### Ajustements possibles

```bash
# Plus de workers Nginx
open /nginx.conf
# Changer: worker_processes auto; -> worker_processes 8;

# Plus de connections
# keepalive_connections: 4096 -> 8192

# Cache keys plus agressifs
# Modifier les zones de cache et les durations

# Activer HTTP/2 (dans la section HTTPS)
# add: http2;
```

## Shutdown & Maintenance

```bash
# Graceful shutdown (drain connections: 20s)
docker-compose -f docker-compose.prod.yml down

# Force shutdown (abrupte)
docker-compose -f docker-compose.prod.yml down -t 5

# Backup avant maintenance
docker-compose -f docker-compose.prod.yml exec db-backup /bin/sh -c "cp /data/bibliotheque.db /backup/pre-maintenance-$(date +%Y%m%d_%H%M%S)"
```

---

**Support & Documentation**:

- API Docs: http://localhost/api/docs
- Nginx Status: http://localhost/nginx_status (local only)
- Uptime Kuma: http://localhost:3001
