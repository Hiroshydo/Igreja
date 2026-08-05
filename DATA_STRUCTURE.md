# 📋 Estrutura de Dados Esperada

Este documento descreve os formatos de dados esperados pelas APIs.

## Members (Membros)

### Modelo de Dados

```typescript
interface Member {
  id: string | number;
  name: string;              // Nome completo do membro
  email: string;             // Email para contato
  phone?: string;            // Telefone (opcional)
  birthDate?: string;        // Data de nascimento (YYYY-MM-DD)
  joinDate: string;          // Data de filiação (YYYY-MM-DD)
  status: 'ativo' | 'inativo' | 'pendente';
  role?: string;             // Cargo/Função (ex: "Pastor", "Diácono")
  avatar?: string;           // URL da foto
}
```

### Exemplos

#### GET /api/members
Retorna lista de todos os membros:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "(11) 98765-4321",
      "birthDate": "1990-05-15",
      "joinDate": "2023-01-15",
      "status": "ativo",
      "role": "Diácono",
      "avatar": "https://example.com/avatar.jpg"
    }
  ]
}
```

#### POST /api/members
Criar novo membro:

```json
{
  "name": "Maria Santos",
  "email": "maria@email.com",
  "phone": "(11) 99999-8888",
  "birthDate": "1992-03-20",
  "joinDate": "2024-08-05",
  "status": "ativo",
  "role": "Membro"
}
```

Resposta:

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Maria Santos",
    "email": "maria@email.com",
    "phone": "(11) 99999-8888",
    "birthDate": "1992-03-20",
    "joinDate": "2024-08-05",
    "status": "ativo",
    "role": "Membro"
  },
  "message": "Membro criado com sucesso"
}
```

---

## Events (Eventos)

### Modelo de Dados

```typescript
interface Event {
  id: string | number;
  title: string;              // Título do evento
  description?: string;       // Descrição detalhada
  date: string;               // Data (YYYY-MM-DD)
  time: string;               // Hora de início (HH:mm)
  endTime?: string;           // Hora de término (HH:mm)
  location: string;           // Local do evento
  category: 'culto' | 'reuniao' | 'evento' | 'estudo' | 'outro';
  attendees?: number;         // Número de presentes
  image?: string;             // URL da imagem
  organizer?: string;         // Nome do organizador
}
```

### Exemplos

#### GET /api/events
Retorna lista de eventos:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Culto Domingo",
      "description": "Culto de adoração e pregação",
      "date": "2024-08-11",
      "time": "18:00",
      "endTime": "19:30",
      "location": "Templo Principal",
      "category": "culto",
      "attendees": 150,
      "organizer": "João Silva"
    }
  ]
}
```

#### POST /api/events
Criar novo evento:

```json
{
  "title": "Estudo Bíblico",
  "description": "Estudo do livro de Romanos",
  "date": "2024-08-14",
  "time": "19:30",
  "endTime": "21:00",
  "location": "Sala de Reuniões",
  "category": "estudo",
  "organizer": "Pedro Costa"
}
```

---

## Ministries (Ministérios)

### Modelo de Dados

```typescript
interface Ministry {
  id: string | number;
  name: string;              // Nome do ministério
  description: string;       // Descrição/Objetivo
  leader: string;            // Nome do líder
  leaderEmail?: string;      // Email do líder
  leaderPhone?: string;      // Telefone do líder
  members: number;           // Quantidade de membros
  category: string;          // Categoria (ex: "Louvor", "Infantil")
  image?: string;            // URL da imagem
  meetingDay?: string;       // Dia da reunião (ex: "Segunda")
  meetingTime?: string;      // Hora da reunião (HH:mm)
}
```

### Exemplos

#### GET /api/ministries
Retorna lista de ministérios:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Ministério de Louvor",
      "description": "Responsável pela música durante os cultos",
      "leader": "Pedro Costa",
      "leaderEmail": "pedro@email.com",
      "leaderPhone": "(11) 98888-7777",
      "members": 12,
      "category": "Louvor",
      "meetingDay": "Quarta",
      "meetingTime": "19:30"
    }
  ]
}
```

#### POST /api/ministries
Criar novo ministério:

```json
{
  "name": "Ministério de Jovens",
  "description": "Acompanhamento de jovens membros",
  "leader": "Ana Silva",
  "leaderEmail": "ana@email.com",
  "leaderPhone": "(11) 97777-6666",
  "members": 25,
  "category": "Jovens",
  "meetingDay": "Sexta",
  "meetingTime": "19:00"
}
```

---

## Dashboard Stats (Estatísticas)

### Modelo de Dados

```typescript
interface DashboardStats {
  totalMembers: number;       // Total de membros
  membersThisMonth: number;   // Novos membros este mês
  totalEvents: number;        // Total de eventos
  upcomingEvents: number;     // Eventos próximos
  totalMinistries: number;    // Total de ministérios
  activeMinistries: number;   // Ministérios ativos
  attendanceRate: number;     // Taxa de presença (%)
}
```

### Exemplo

#### GET /api/dashboard/stats

```json
{
  "success": true,
  "data": {
    "totalMembers": 250,
    "membersThisMonth": 8,
    "totalEvents": 45,
    "upcomingEvents": 5,
    "totalMinistries": 12,
    "activeMinistries": 10,
    "attendanceRate": 78
  }
}
```

---

## Health Check

### GET /api/health

```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2024-08-05T14:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0"
}
```

---

## Padrões de Resposta

### Sucesso

```json
{
  "success": true,
  "data": {},
  "message": "Operação concluída com sucesso"
}
```

### Erro

```json
{
  "success": false,
  "error": "Descrição do erro",
  "status": 400
}
```

---

## Validações

### Campos Obrigatórios por Tipo

**Member:**
- `name` (string, mínimo 3 caracteres)
- `email` (string, formato email válido)
- `joinDate` (string, formato YYYY-MM-DD)
- `status` (enum: 'ativo' | 'inativo' | 'pendente')

**Event:**
- `title` (string, mínimo 3 caracteres)
- `date` (string, formato YYYY-MM-DD, data futura)
- `time` (string, formato HH:mm)
- `location` (string, mínimo 3 caracteres)
- `category` (enum)

**Ministry:**
- `name` (string, mínimo 3 caracteres)
- `description` (string, mínimo 10 caracteres)
- `leader` (string, mínimo 3 caracteres)
- `members` (number, mínimo 1)
- `category` (string)

---

## Tratamento de Erros

### Códigos HTTP

- `200 OK` - Requisição bem-sucedida
- `201 Created` - Recurso criado
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Não autenticado (futuro)
- `403 Forbidden` - Sem permissão (futuro)
- `404 Not Found` - Recurso não encontrado
- `500 Internal Server Error` - Erro do servidor

### Exemplo de Erro

```json
{
  "success": false,
  "error": "Email já cadastrado",
  "status": 400
}
```

---

**Última atualização:** 2026-08-05
