# Chat WebSocket Architecture

## System Overview

```mermaid
graph TB
    subgraph "Client Side"
        CC[Chat Client]
        AC[Admin Client]
        SC[Socket Client Manager]
        CU[Utils]
    end
    
    subgraph "Server Side"
        WS[WebSocket Server]
        AS[Auth Service]
        CS[Chat Service]
        DB[(Database)]
    end
    
    subgraph "Network"
        HTTP[HTTP/HTTPS]
        WSS[WebSocket]
    end
    
    CC --> SC
    AC --> SC
    SC --> WSS
    WSS --> WS
    WS --> AS
    WS --> CS
    CS --> DB
    
    CC -.-> HTTP
    AC -.-> HTTP
    HTTP -.-> WS
```

## Component Architecture

```mermaid
graph LR
    subgraph "Client Application"
        MA[Main App]
        CA[Chat Admin]
        CC[Chat Client]
        SM[Socket Manager]
        UT[Utils]
    end
    
    subgraph "Server Application"
        CG[Chat Gateway]
        CS[Chat Service]
        AS[Auth Service]
        PS[Prisma Service]
    end
    
    MA --> CA
    MA --> CC
    CA --> SM
    CC --> SM
    SM --> CG
    CG --> CS
    CG --> AS
    CS --> PS
```

## Data Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Admin
    participant S as Server
    participant D as Database
    
    Note over C,D: Connection Establishment
    C->>S: Connect with JWT
    A->>S: Connect with Admin JWT
    S->>D: Validate tokens
    D-->>S: User data
    S-->>C: Connection established
    S-->>A: Connection established
    
    Note over C,D: Message Flow
    C->>S: Send message
    S->>D: Save message
    D-->>S: Message saved
    S-->>A: Broadcast message
    S-->>C: Message confirmation
    
    Note over C,D: Admin Response
    A->>S: Send response
    S->>D: Save response
    D-->>S: Response saved
    S-->>C: Broadcast response
    S-->>A: Response confirmation
```

## Error Handling Flow

```mermaid
graph TD
    A[Connection Attempt] --> B{Server Available?}
    B -->|Yes| C[Connect Socket]
    B -->|No| D[Show Warning]
    C --> E{Connection Success?}
    E -->|Yes| F[Connected State]
    E -->|No| G[Show Error]
    G --> H[Auto Retry]
    H --> I{Max Attempts?}
    I -->|No| A
    I -->|Yes| J[Show Final Error]
    
    F --> K[Connection Lost?]
    K -->|Yes| L[Auto Reconnect]
    K -->|No| F
    L --> M{Reconnect Success?}
    M -->|Yes| F
    M -->|No| H
```

## File Structure

```mermaid
graph TD
    A[chat-interface/] --> B[chat-client/]
    A --> C[chat-admin/]
    
    B --> D[index.html]
    B --> E[js/]
    B --> F[styles/]
    
    C --> G[index.html]
    C --> H[js/]
    C --> I[styles/]
    
    E --> J[main.js]
    E --> K[chat-client.js]
    E --> L[socket-client.js]
    E --> M[utils.js]
    
    H --> N[admin-main.js]
    H --> O[chat-admin.js]
    
    F --> P[main.css]
    F --> Q[chat.css]
    F --> R[client.css]
    
    I --> S[admin.css]
```

## Security Model

```mermaid
graph TB
    subgraph "Authentication"
        JWT[JWT Token]
        AUTH[Auth Service]
        ROLE[Role-based Access]
    end
    
    subgraph "Authorization"
        ADMIN[Admin Role]
        USER[User Role]
        GUARD[Route Guards]
    end
    
    subgraph "Data Protection"
        VALID[Input Validation]
        SANIT[Data Sanitization]
        ENCRYPT[Data Encryption]
    end
    
    JWT --> AUTH
    AUTH --> ROLE
    ROLE --> ADMIN
    ROLE --> USER
    ADMIN --> GUARD
    USER --> GUARD
    
    VALID --> SANIT
    SANIT --> ENCRYPT
```

## Performance Considerations

### Client-side Optimization
- Lazy loading of components
- Message pagination
- Efficient DOM updates
- Connection pooling
- Offline support with message queuing

### Server-side Optimization
- Connection management
- Message batching
- Database indexing
- Caching strategies
- Rate limiting

### Network Optimization
- WebSocket compression
- Message compression
- Connection multiplexing
- Keep-alive mechanisms
