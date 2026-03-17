#!/bin/bash

# Production Deployment Script for Bibliotheque
# Usage: ./deploy-prod.sh [start|stop|restart|logs|status|backup|health-check|scale]

set -e

COMPOSE_FILE="docker-compose.prod.yml"
PROJECT_NAME="bibliotheque"
COLOR_RED='\033[0;31m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.prod exists
if [ ! -f ".env.prod" ]; then
    echo -e "${COLOR_RED}Error: .env.prod not found!${NC}"
    echo "Copy .env.prod.example to .env.prod and configure it."
    exit 1
fi

# Helper functions
log_info() {
    echo -e "${COLOR_BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${COLOR_GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${COLOR_YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${COLOR_RED}[ERROR]${NC} $1"
}

# Check Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
}

# Create required directories
setup_directories() {
    log_info "Creating required directories..."
    mkdir -p data backup redis-data uptime-kuma-data nginx-cache
    chmod 755 data backup redis-data uptime-kuma-data nginx-cache
    log_success "Directories created"
}

# Start services
start() {
    check_docker
    setup_directories
    
    log_info "Starting Bibliotheque production environment..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    log_success "Services started!"
    log_info "Waiting for services to be healthy..."
    sleep 5
    
    # Show status
    status
}

# Stop services
stop() {
    log_info "Stopping Bibliotheque production environment..."
    docker-compose -f "$COMPOSE_FILE" down
    log_success "Services stopped"
}

# Restart services
restart() {
    log_warning "Restarting services..."
    stop
    sleep 3
    start
}

# Show status
status() {
    log_info "Status of Bibliotheque services:"
    docker-compose -f "$COMPOSE_FILE" ps
    
    echo ""
    log_info "Accessing services:"
    echo "  Application: http://localhost/"
    echo "  API: http://localhost/api/"
    echo "  Uptime Kuma: http://localhost:3001"
    echo "  Nginx Status: http://localhost/nginx_status (local only)"
}

# Show logs
logs() {
    local service="${1:-}"
    
    if [ -z "$service" ]; then
        log_info "Showing logs from all services (follow mode)..."
        docker-compose -f "$COMPOSE_FILE" logs -f
    else
        log_info "Showing logs from $service..."
        docker-compose -f "$COMPOSE_FILE" logs -f "$service"
    fi
}

# Health check
health_check() {
    log_info "Running health checks..."
    
    local checks_passed=0
    local checks_total=5
    
    # Check Nginx
    echo -n "  Checking Nginx... "
    if curl -s http://localhost/health &> /dev/null; then
        echo -e "${COLOR_GREEN}OK${NC}"
        ((checks_passed++))
    else
        echo -e "${COLOR_RED}FAILED${NC}"
    fi
    
    # Check API-1
    echo -n "  Checking API-1... "
    if curl -s http://localhost:8000/ > /dev/null 2>&1; then
        echo -e "${COLOR_GREEN}OK${NC}"
        ((checks_passed++))
    else
        echo -e "${COLOR_RED}FAILED${NC}"
    fi
    
    # Check Client
    echo -n "  Checking Client... "
    if curl -s http://localhost:3000/ > /dev/null 2>&1; then
        echo -e "${COLOR_GREEN}OK${NC}"
        ((checks_passed++))
    else
        echo -e "${COLOR_RED}FAILED${NC}"
    fi
    
    # Check Redis
    echo -n "  Checking Redis... "
    if docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping &> /dev/null; then
        echo -e "${COLOR_GREEN}OK${NC}"
        ((checks_passed++))
    else
        echo -e "${COLOR_RED}FAILED${NC}"
    fi
    
    # Check Uptime Kuma
    echo -n "  Checking Uptime Kuma... "
    if curl -s http://localhost:3001/ > /dev/null 2>&1; then
        echo -e "${COLOR_GREEN}OK${NC}"
        ((checks_passed++))
    else
        echo -e "${COLOR_RED}FAILED${NC}"
    fi
    
    echo ""
    log_info "Health checks: $checks_passed/$checks_total passed"
    
    if [ $checks_passed -eq $checks_total ]; then
        log_success "All services are healthy!"
        return 0
    else
        log_warning "Some services are not healthy"
        return 1
    fi
}

# Backup database
backup() {
    log_info "Creating database backup..."
    
    local backup_file="backup/bibliotheque-$(date +%Y%m%d_%H%M%S).db"
    
    if [ -f "data/bibliotheque.db" ]; then
        cp "data/bibliotheque.db" "$backup_file"
        log_success "Backup created: $backup_file"
        
        # Show recent backups
        log_info "Recent backups:"
        ls -lh backup/ | tail -5
    else
        log_error "Database file not found"
        exit 1
    fi
}

# Scale API instances
scale() {
    local count="${1:-2}"
    
    if ! [[ "$count" =~ ^[0-9]+$ ]]; then
        log_error "Scale count must be a number"
        exit 1
    fi
    
    if [ "$count" -lt 1 ]; then
        log_error "Must have at least 1 API instance"
        exit 1
    fi
    
    log_info "Scaling API instances to $count..."
    # Note: Docker Compose service scaling has limitations
    # For production scaling, use Docker Swarm or Kubernetes
    log_warning "Volume-based scaling is limited. For production scaling, use Docker Swarm or K8s"
}

# Show help
show_help() {
    cat << EOF
Bibliotheque Production Deployment Script

Usage: ./deploy-prod.sh [COMMAND]

Commands:
  start           Start all services
  stop            Stop all services
  restart         Restart all services
  status          Show status of all services
  logs [SERVICE]  Show logs (optional: specific service)
  health-check    Run health checks on all services
  backup          Create database backup
  scale [COUNT]   Scale API instances (experimental)
  help            Show this help message

Examples:
  ./deploy-prod.sh start
  ./deploy-prod.sh logs api-1
  ./deploy-prod.sh health-check
  ./deploy-prod.sh backup

EOF
}

# Main
main() {
    local command="${1:-start}"
    
    case "$command" in
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        status)
            status
            ;;
        logs)
            logs "$2"
            ;;
        health-check)
            health_check
            ;;
        backup)
            backup
            ;;
        scale)
            scale "$2"
            ;;
        help)
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
