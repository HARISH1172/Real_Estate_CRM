# EstateFlow CRM — Frontend

A modern, role-based Real Estate CRM frontend built with **React + Vite**.  
Designed to integrate with your Spring Boot + JWT backend.

---

## 🏗 Project Structure

```
src/
├── App.jsx                        # Root router
├── index.css                      # Global design system & CSS variables
├── main.jsx                       # React entry point
│
├── components/
│   ├── common/                    # Shared UI components
│   │   ├── Layout.jsx             # Sidebar + Navbar wrapper
│   │   ├── Sidebar.jsx            # Role-aware navigation
│   │   ├── Navbar.jsx             # Topbar with profile dropdown
│   │   ├── PrivateRoute.jsx       # JWT-protected route guard
│   │   ├── StatsCard.jsx          # Dashboard stats card
│   │   └── LoadingSpinner.jsx     # Loading indicator
│   │
│   ├── admin/                     # Admin-only pages
│   │   ├── AdminDashboard.jsx     # Stats + pending agent approvals
│   │   ├── ManageManagers.jsx     # Create / list / delete managers
│   │   └── ManageAgents.jsx       # Approve / reject / assign agents
│   │
│   ├── manager/                   # Manager-only pages
│   │   ├── ManagerDashboard.jsx   # Stats + lead trend chart
│   │   ├── LeadManagement.jsx     # Full CRUD leads + assign to agent
│   │   └── ViewAgents.jsx         # View agents + their leads
│   │
│   └── agent/                     # Agent-only pages
│       ├── AgentDashboard.jsx     # Personal stats + recent leads
│       └── AgentLeads.jsx         # View leads + add comments
│
├── context/
│   └── AuthContext.jsx            # JWT auth state + login/logout
│
├── pages/
│   ├── Login.jsx                  # Login form (email + password)
│   ├── Register.jsx               # Agent self-registration + address
│   └── Unauthorized.jsx           # 403 page
│
├── services/
│   ├── api.js                     # Axios instance with JWT interceptor
│   ├── authService.js             # /api/auth/login, /api/auth/register
│   ├── userService.js             # Admin/Manager user management
│   └── leadService.js             # Lead CRUD + comments
│
└── utils/
    ├── constants.js               # ROLES, LEAD_STATUS, PROPERTY_TYPES, etc.
    └── helpers.js                 # formatDate, formatCurrency, getInitials, etc.
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Your Spring Boot backend running on `http://localhost:8080`

### Install & Run

```bash
cd real-estate-crm
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**  
(matches the CORS origin in your `AuthController`)

---

## 🔌 API Integration

All requests go through the Vite dev proxy:

```
Frontend /api/* → http://localhost:8080/api/*
```

Configured in `vite.config.js`. No CORS issues in development.

### JWT Flow

1. `POST /api/auth/login` → receives `{ token, name, email, role, ... }`
2. Token stored in `localStorage`
3. All subsequent requests: `Authorization: Bearer <token>` (auto-injected by Axios interceptor)
4. On 401 → auto logout + redirect to `/login`

---

## 📦 Backend DTO Mapping

### RegisterRequestDTO
```json
{
  "name":     "Rahul Sharma",
  "email":    "rahul@email.com",
  "password": "secret123",
  "phone":    "9876543210",
  "role":     "AGENT",
  "address": {
    "street":  "123 MG Road",
    "city":    "Pune",
    "state":   "Maharashtra",
    "pincode": "411001"
  }
}
```

### LoginRequestDTO
```json
{
  "email":    "admin@estateflow.com",
  "password": "admin123"
}
```

### AuthResponseDTO (expected shape)
```json
{
  "token": "eyJhbGci...",
  "name":  "Admin User",
  "email": "admin@estateflow.com",
  "role":  "ADMIN",
  "phone": "9876543210"
}
```

---

## 👤 Role-Based Access

| Role    | Access |
|---------|--------|
| `ADMIN`   | Dashboard, Manage Managers, Manage Agents (approve/reject/assign) |
| `MANAGER` | Dashboard, Lead Management (CRUD + assign), View Agents + their leads |
| `AGENT`   | Dashboard, View assigned leads, Add comments |

---

## 🎨 Design System

All colors and tokens are CSS variables in `index.css`:

```css
--primary:        #1a3c5e   /* Navy blue */
--accent:         #e8a838   /* Gold */
--success:        #22c55e
--danger:         #ef4444
--font-display:   'Outfit'
--font-body:      'DM Sans'
```

---

## 📡 Expected Backend Endpoints

### Auth
- `POST /api/auth/register` — Agent self-registration
- `POST /api/auth/login`    — Login for all roles

### Admin
- `GET/POST /api/admin/managers`
- `DELETE   /api/admin/managers/{id}`
- `GET      /api/admin/agents`
- `PUT      /api/admin/agents/{id}/approve`
- `PUT      /api/admin/agents/{id}/reject`
- `PUT      /api/admin/agents/{agentId}/assign-manager/{managerId}`
- `DELETE   /api/admin/agents/{id}`
- `GET      /api/admin/dashboard/stats`

### Manager
- `GET/POST          /api/manager/leads`
- `PUT               /api/manager/leads/{id}`
- `DELETE            /api/manager/leads/{id}`
- `PUT               /api/manager/leads/{leadId}/assign-agent/{agentId}`
- `GET               /api/manager/agents`
- `GET               /api/manager/agents/{agentId}/leads`
- `GET               /api/manager/dashboard/stats`

### Agent
- `GET  /api/agent/leads`
- `POST /api/agent/leads/{leadId}/comments`
- `GET  /api/agent/leads/{leadId}/comments`
- `GET  /api/agent/dashboard/stats`

---

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP client + interceptors |
| Recharts | Dashboard charts |
| Lucide React | Icons |
| React Hot Toast | Notifications |
| Vite | Build tool (port 5173) |

---

## 📝 Notes for Backend Team

1. **CORS** — Already set to `http://localhost:5173` in `AuthController`. ✅
2. **User entity** — Frontend uses `user.name` (single field). ✅
3. **IDs** — Frontend treats all IDs as strings (handles UUID).
4. **Phone validation** — Matches `^[6-9]\d{9}$` regex from `RegisterRequestDTO`.
5. **Auth response** — Must include `token` and `role` at minimum.
6. **Agent approval** — Frontend expects `status` field: `PENDING | APPROVED | REJECTED`.
