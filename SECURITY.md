# AlgoForge Security Guidelines

## Critical Security Rules

### 🔴 NEVER Do These

1. **NEVER commit secrets to version control**
   - Private keys
   - API keys
   - Database credentials
   - JWT secrets
   - Wallet mnemonics

2. **NEVER expose backend secrets to frontend**
   - AI API keys
   - Database URLs
   - Payment verification secrets
   - Facilitator credentials

3. **NEVER execute untrusted code**
   - Do not eval() uploaded files
   - Do not execute smart-contract code on host
   - Parse only, never run

4. **NEVER trust user input**
   - Validate all inputs
   - Sanitize file paths
   - Check file types
   - Enforce size limits

5. **NEVER hard-code configuration**
   - Use environment variables
   - Use configuration files (not committed)
   - Use secret management services in production

## Threat Model

### Attack Vectors

**1. Malicious File Upload**
- **Threat**: Attacker uploads malicious ZIP/files
- **Mitigation**: 
  - Validate file types (whitelist only)
  - Scan for path traversal attempts
  - Enforce size limits
  - Extract in isolated directory
  - Timeout analysis operations

**2. Code Injection**
- **Threat**: Attacker injects malicious code in TEAL/PyTeal
- **Mitigation**:
  - Never execute uploaded code
  - Parse to AST only
  - Run analysis in isolated process
  - Validate AST structure

**3. Payment Bypass**
- **Threat**: Attacker tries to access protected resources without payment
- **Mitigation**:
  - Server-side payment verification only
  - Use x402 middleware correctly
  - Verify with GoPlausible facilitator
  - Never trust client-provided payment proof


**4. API Abuse**
- **Threat**: Attacker floods API with requests
- **Mitigation**:
  - Rate limiting per IP
  - Request size limits
  - Analysis timeout enforcement
  - CAPTCHA for web UI (future)

**5. Data Leakage**
- **Threat**: Sensitive data exposed in logs/errors
- **Mitigation**:
  - Sanitize error messages
  - No stack traces in production
  - Log only necessary information
  - Redact sensitive fields

**6. Man-in-the-Middle**
- **Threat**: Attacker intercepts traffic
- **Mitigation**:
  - HTTPS only in production
  - Secure cookie flags
  - HSTS headers
  - Certificate pinning (mobile)

## Input Validation

### File Upload Validation

```typescript
const ALLOWED_EXTENSIONS = ['.teal', '.py'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 100;
const ALLOWED_MIME_TYPES = [
  'text/plain',
  'text/x-python',
  'application/x-python-code'
];

// Validate each file
function validateFile(file: File): ValidationResult {
  // Check extension
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  // Check size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large' };
  }
  
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid MIME type' };
  }
  
  // Check path for traversal
  if (file.name.includes('..') || file.name.includes('/')) {
    return { valid: false, error: 'Invalid file name' };
  }
  
  return { valid: true };
}
```

### ZIP Archive Validation

```typescript
function validateZipEntry(entry: ZipEntry): boolean {
  // Prevent path traversal
  const normalizedPath = path.normalize(entry.path);
  if (normalizedPath.startsWith('..')) {
    throw new SecurityError('Path traversal detected');
  }
  
  // Prevent absolute paths
  if (path.isAbsolute(entry.path)) {
    throw new SecurityError('Absolute paths not allowed');
  }
  
  // Check file size
  if (entry.uncompressedSize > MAX_FILE_SIZE) {
    throw new SecurityError('File too large');
  }
  
  return true;
}
```


## Environment Variables

### Development (.env.local)
```bash
# Safe to use default values for local dev
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://localhost/algoforge_dev
AI_API_KEY=your_test_key_here
```

### Production (.env)
```bash
# NEVER commit this file
# Use secret management service
NODE_ENV=production
PORT=3001
DATABASE_URL=${SECRETS_MANAGER_DB_URL}
AI_API_KEY=${SECRETS_MANAGER_AI_KEY}
JWT_SECRET=${SECRETS_MANAGER_JWT_SECRET}
X402_PAY_TO_ADDRESS=${SECRETS_MANAGER_WALLET_ADDRESS}
```

### Required Secrets

| Secret | Purpose | Source |
|--------|---------|--------|
| `DATABASE_URL` | PostgreSQL connection | Cloud provider |
| `AI_API_KEY` | Groq/Together API | AI provider dashboard |
| `JWT_SECRET` | Session tokens | Generate: `openssl rand -base64 32` |
| `X402_PAY_TO_ADDRESS` | Payment destination | Algorand wallet |

## Authentication & Authorization

### Current Phase (MVP)
- No user authentication required
- x402 payment is authorization
- Payment proves right to access resource

### Future Phases
- JWT-based authentication
- User accounts with wallet linking
- Role-based access control (RBAC)
- API key management for agents

## x402 Payment Security

### Server-Side Verification ONLY

```typescript
// ✅ CORRECT - Server verifies payment
async function handleAnalyze(c: Context) {
  // x402 middleware already verified payment
  // Safe to proceed with analysis
  const result = await performAnalysis();
  return c.json({ success: true, data: result });
}

// ❌ WRONG - Trusting client
async function handleAnalyze(c: Context) {
  const { paymentProof } = await c.req.json();
  // NEVER trust client-provided proof
  if (paymentProof) { // This is insecure!
    const result = await performAnalysis();
    return c.json({ success: true, data: result });
  }
}
```

### x402 Best Practices
- Use official x402 middleware
- Verify with GoPlausible facilitator
- Log payment transactions
- Handle payment failures gracefully
- Implement idempotency for retries


## Database Security

### Connection Security
```typescript
// Use SSL for production
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: true }
    : false
});
```

### SQL Injection Prevention
```typescript
// ✅ CORRECT - Parameterized queries
await pool.query(
  'SELECT * FROM analyses WHERE id = $1',
  [analysisId]
);

// ❌ WRONG - String concatenation
await pool.query(
  `SELECT * FROM analyses WHERE id = '${analysisId}'`
);
```

### Principle of Least Privilege
- Database user should have minimal permissions
- Read/write only to required tables
- No DROP, TRUNCATE in production user
- Use migrations for schema changes

## API Security

### Rate Limiting
```typescript
import { rateLimiter } from 'hono-rate-limiter';

app.use('/api/*', rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per window
  message: 'Too many requests, please try again later'
}));
```

### CORS Configuration
```typescript
import { cors } from 'hono/cors';

app.use('/api/*', cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://algoforge.example.com']
    : ['http://localhost:5173'],
  credentials: false,
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));
```

### Request Size Limits
```typescript
app.use('/api/*', async (c, next) => {
  const contentLength = c.req.header('content-length');
  if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
    return c.json({ error: 'Request too large' }, 413);
  }
  await next();
});
```

## Code Analysis Security

### Sandboxing Principles
1. **Never execute uploaded code**
   - Parse to AST only
   - Static analysis only
   - No eval(), no vm.runInContext()

2. **Isolate analysis process**
   - Run in separate process if needed
   - Enforce memory limits
   - Enforce time limits
   - Handle crashes gracefully

3. **Validate AST structure**
   - Check for malformed syntax
   - Limit AST depth
   - Limit node count

### Resource Limits
```typescript
const ANALYSIS_LIMITS = {
  maxExecutionTime: 120000, // 2 minutes
  maxMemory: 512 * 1024 * 1024, // 512MB
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxFiles: 100,
  maxASTDepth: 1000,
  maxASTNodes: 10000
};
```


## Logging & Monitoring

### Safe Logging Practices

```typescript
// ✅ CORRECT - Sanitized logging
logger.info('Analysis started', {
  analysisId: analysis.id,
  fileCount: files.length,
  userId: user.id // Public ID only
});

// ❌ WRONG - Logging secrets
logger.info('Payment received', {
  apiKey: process.env.AI_API_KEY, // NEVER log secrets
  walletKey: privateKey, // NEVER log private keys
  password: userPassword // NEVER log passwords
});
```

### Sensitive Fields to Redact
- API keys
- Private keys
- Wallet mnemonics
- Passwords
- JWT tokens
- Session IDs
- Database credentials
- Credit card numbers
- Personal identifiable information (PII)

### Security Event Logging
Log these events for security monitoring:
- Failed authentication attempts
- Payment verification failures
- Rate limit violations
- Invalid file uploads
- Suspicious patterns
- API errors
- Database connection errors

## Error Handling

### Secure Error Responses

```typescript
// ✅ CORRECT - Generic error for client
try {
  await performAnalysis();
} catch (error) {
  logger.error('Analysis failed', { error, analysisId });
  return c.json({
    success: false,
    error: {
      code: 'ANALYSIS_FAILED',
      message: 'Analysis could not be completed'
    }
  }, 500);
}

// ❌ WRONG - Exposing internals
try {
  await performAnalysis();
} catch (error) {
  return c.json({
    error: error.message, // May contain sensitive info
    stack: error.stack // NEVER expose stack traces
  }, 500);
}
```

## Dependency Security

### Regular Audits
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Review outdated packages
npm outdated
```

### Package Vetting
Before adding a dependency:
- Check package popularity (npm downloads)
- Review GitHub stars and activity
- Check for known vulnerabilities
- Review recent issues
- Verify maintainer reputation
- Check license compatibility

### Dependency Pinning
```json
{
  "dependencies": {
    "hono": "4.0.0",
    "@x402/core": "1.0.0"
  }
}
```

## Deployment Security

### Production Checklist

- [ ] All secrets in environment variables
- [ ] No .env file in repository
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Database SSL enabled
- [ ] Error messages sanitized
- [ ] Logging configured
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Firewall rules set
- [ ] Security headers added
- [ ] Dependencies audited
- [ ] Secrets rotated
- [ ] Access logs enabled

### Security Headers
```typescript
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Strict-Transport-Security', 'max-age=31536000');
});
```

## Incident Response

### If Secrets Are Compromised

1. **Immediately rotate all secrets**
   - Database credentials
   - API keys
   - JWT secrets
   - Wallet keys (if exposed)

2. **Audit access logs**
   - Check for unauthorized access
   - Identify affected resources
   - Document timeline

3. **Notify stakeholders**
   - Team members
   - Users (if user data affected)
   - Service providers

4. **Review and improve**
   - How did it happen?
   - How to prevent in future?
   - Update security practices

### If Breach Detected

1. **Contain**: Isolate affected systems
2. **Assess**: Determine scope and impact
3. **Eradicate**: Remove threat
4. **Recover**: Restore normal operations
5. **Document**: Write incident report
6. **Improve**: Implement preventive measures

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Algorand Security](https://developer.algorand.org/docs/get-details/security/)
- [x402 Documentation](https://github.com/GoPlausible/.github/blob/main/profile/algorand-x402-documentation/)

## Security Contact

For security issues, please contact: [security contact TBD]

**Do not** open public issues for security vulnerabilities.
