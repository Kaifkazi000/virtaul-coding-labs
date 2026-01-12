# Compiler Architecture & Security

## Recommended Approach: Docker-Based Execution

### Option 1: Piston API (Recommended for MVP)
- **Pros**: Easy setup, multi-language support, built-in sandboxing
- **Cons**: External dependency, less control
- **URL**: https://github.com/engineer-man/piston

### Option 2: Judge0 API
- **Pros**: Production-ready, extensive language support
- **Cons**: Requires setup, rate limits on free tier
- **URL**: https://judge0.com

### Option 3: Custom Docker Containers (Best for Production)
- **Pros**: Full control, no external dependencies, maximum security
- **Cons**: More complex setup, requires Docker infrastructure

## Implementation Strategy: Hybrid Approach

### Phase 1: Piston API (Quick Start)
Use Piston API for initial implementation:
- Fast to integrate
- Handles Python, Java, C++, C
- Built-in security

### Phase 2: Custom Docker (Production)
Migrate to custom Docker containers:
- Full control over execution environment
- Custom resource limits
- Better security isolation

## Security Requirements

### Execution Limits
```javascript
{
  timeLimit: 5000,        // 5 seconds
  memoryLimit: 128 * 1024 * 1024,  // 128 MB
  cpuLimit: "0.5",        // 50% CPU
  networkAccess: false,
  fileSystemAccess: "read-only",  // Only read sample files
  maxOutputSize: 1024 * 1024      // 1 MB max output
}
```

### Docker Container Setup
```dockerfile
# Example: Python execution container
FROM python:3.11-slim

# Create non-root user
RUN useradd -m -u 1000 runner

# Set working directory
WORKDIR /app

# Copy only necessary files
COPY --chown=runner:runner . /app

# Switch to non-root user
USER runner

# Run with resource limits
CMD ["python", "code.py"]
```

## Language-Specific Execution

### Python
```javascript
{
  language: "python",
  version: "3.11",
  command: "python3",
  files: [{ name: "main.py", content: code }]
}
```

### Java
```javascript
{
  language: "java",
  version: "17",
  command: "javac && java",
  files: [
    { name: "Main.java", content: code }
  ]
}
```

### C++
```javascript
{
  language: "cpp",
  version: "17",
  command: "g++ -std=c++17 && ./a.out",
  files: [{ name: "main.cpp", content: code }]
}
```

### SQL (DBMS)
```javascript
{
  language: "sql",
  // Execute against test database
  // Return query results
  // Validate against expected output
}
```

### OS (C)
```javascript
{
  language: "c",
  version: "c11",
  command: "gcc && ./a.out",
  files: [{ name: "main.c", content: code }]
}
```

## Error Handling

### Execution States
- `success`: Code executed successfully
- `failed`: Compilation or runtime error
- `timeout`: Execution exceeded time limit
- `memory_limit`: Exceeded memory limit
- `error`: System error (container failure, etc.)

### Error Response Format
```json
{
  "execution_status": "failed",
  "output": "",
  "error": "SyntaxError: invalid syntax",
  "execution_time_ms": 50,
  "memory_used_kb": 1024
}
```

## Implementation Plan

1. **Start with Piston API** (Week 1)
   - Integrate Piston API client
   - Handle Python, Java, C++
   - Basic error handling

2. **Add SQL Support** (Week 2)
   - Custom SQL executor
   - Test database setup
   - Query validation

3. **Migrate to Docker** (Week 3-4)
   - Setup Docker containers per language
   - Implement resource limits
   - Security hardening

4. **Production Hardening** (Week 5)
   - Load testing
   - Security audit
   - Monitoring & logging
