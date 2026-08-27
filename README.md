# Lofi Radio

Uma rádio web de música lo-fi com estações temáticas, player contínuo e uma interface visual inspirada em diferentes atmosferas musicais.

O projeto é uma aplicação full stack composta por um frontend em React/Vite, uma API em Laravel e um banco PostgreSQL. As faixas são carregadas por estação e reproduzidas no navegador com avanço automático para a próxima música.

## Funcionalidades

- Seleção entre estações lo-fi com temas diferentes:
  - Lo-Fi Chill & 8-Bit
  - Vaporwave Nostalgia
  - Lo-Fi Bossa & Brasil
  - Midnight R&B
- Reprodução, pausa, próxima faixa e faixa anterior.
- Controle de volume e opção de silenciar o player.
- Avanço automático da fila quando uma faixa termina ou falha ao carregar.
- Visualização de estação, faixa e artista atuais.
- Lista de faixas por estação.
- Favoritos salvos localmente no navegador.
- Imagens de fundo e identidade visual específicas para cada estação.
- Endpoint de verificação de saúde da API.

## Tecnologias

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Lucide React

### Backend

- PHP 8.2+
- Laravel 12
- Laravel Sanctum
- Eloquent ORM
- PHPUnit

### Infraestrutura

- PostgreSQL 16
- Nginx
- Docker e Docker Compose

## Estrutura do projeto

```text
.
├── backend/       # API Laravel, modelos, migrations e seeders
├── frontend/      # Aplicação React/Vite
├── nginx/         # Configuração do servidor Nginx
└── docker-compose.yml
```

## Pré-requisitos

Para executar com Docker:

- Docker Desktop com Docker Compose
- Git

Para executar manualmente, além do Git:

- PHP 8.2 ou superior
- Composer
- Node.js 20 ou superior
- PostgreSQL 16 ou superior

## Execução com Docker

1. Clone o repositório e entre na pasta do projeto:

```bash
git clone https://github.com/caiodjss/Projeto-Fullstack-Radio-Lofi.git
cd Projeto-Fullstack-Radio-Lofi
```

2. Crie o arquivo de ambiente do backend:

```bash
cp backend/.env.example backend/.env
```

No Windows PowerShell, use:

```powershell
Copy-Item backend/.env.example backend/.env
```

3. Inicie os containers:

```bash
docker compose up --build -d
```

4. Instale as dependências, gere a chave da aplicação e configure o banco:

```bash
docker compose exec backend composer install
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate --seed
```

5. Acesse a aplicação frontend em [http://localhost:5173](http://localhost:5173).

A API ficará disponível em [http://localhost:8000](http://localhost:8000). Os dados iniciais das estações, artistas e faixas são inseridos pelo `RadioSeeder`.

Para encerrar os containers:

```bash
docker compose down
```

Para remover também o volume do PostgreSQL e começar com um banco vazio:

```bash
docker compose down -v
```

## Configuração da API

O frontend usa `http://localhost:8000/api` como URL padrão. Para alterar essa URL, crie `frontend/.env` com:

```env
VITE_API_URL=http://localhost:8000/api
```

Quando a aplicação for executada em outro domínio ou porta, ajuste esse valor antes de iniciar o Vite.

No Railway, configure `VITE_API_URL` como variável de build do serviço frontend, por exemplo:

```env
VITE_API_URL=https://seu-backend.up.railway.app/api
```

No serviço backend, configure pelo menos:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://seu-backend.up.railway.app
APP_KEY=base64:...
DB_CONNECTION=pgsql
DB_HOST=...
DB_PORT=5432
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...
FILESYSTEM_DISK=r2
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET=lofi-radio-assets
CLOUDFLARE_R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
CLOUDFLARE_R2_URL=https://<public-domain-r2>
CORS_ALLOWED_ORIGINS=https://seu-frontend.up.railway.app
```

As chaves do R2 devem ser criadas novamente caso tenham sido expostas em qualquer commit ou log. Nunca as coloque no repositório.

## Endpoints públicos

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/health` | Verifica se a API está online |
| `GET` | `/api/stations` | Lista estações ativas com faixas e artistas |
| `GET` | `/api/stations/{slug}` | Retorna uma estação ativa pelo slug |
| `GET` | `/api/tracks` | Lista faixas ativas |
| `GET` | `/api/tracks?station_id={id}` | Filtra faixas por estação |

Exemplo:

```bash
curl http://localhost:8000/api/health
```

## Execução sem Docker

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Configure no `backend/.env` as credenciais de uma instância PostgreSQL local, por exemplo:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=lofi_radio_db
DB_USERNAME=postgres
DB_PASSWORD=root
```

### Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend será disponibilizado em [http://localhost:5173](http://localhost:5173).

## Scripts úteis

### Frontend

```bash
npm run dev       # inicia o servidor de desenvolvimento
npm run build     # gera o build de produção
npm run lint      # executa o ESLint
npm run preview   # pré-visualiza o build
```

### Backend

```bash
php artisan test  # executa os testes
php artisan migrate
php artisan db:seed
```

## Mídia

Os arquivos de áudio e alguns backgrounds locais ficam em `backend/public/audio` e `backend/public/backgrounds`. O seeder também utiliza algumas URLs externas para músicas e imagens de demonstração.

## Contribuição

1. Crie uma branch para sua alteração.
2. Faça as mudanças e adicione testes quando necessário.
3. Verifique o lint do frontend e os testes do backend.
4. Abra um pull request descrevendo o que foi alterado.

## Licença

O backend utiliza a licença MIT em sua configuração. Para formalizar a licença do repositório no GitHub, adicione um arquivo `LICENSE` na raiz do projeto.
