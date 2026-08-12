# Analysis Engine

Deterministic static analysis for TEAL/PyTeal smart contracts.

## Modules

### orchestrator/
- Analysis pipeline coordination
- Task scheduling
- Result aggregation

### static-analysis/
- Opcode cost table
- Pattern detection
- Control flow analysis
- Dead code detection

### optimization/
- Redundant operation detection
- Scratch slot efficiency
- Loop optimization patterns
- Type conversion optimization

### security/
- Missing checks (GroupSize, RekeyTo)
- Dangerous operation detection
- Access control validation

### cost/
- Execution cost estimation
- Box vs global state analysis
- Inner transaction fee calculation
- OpCode budget management

### complexity/
- Cyclomatic complexity
- Cognitive complexity
- Nesting depth

## Status

⏳ Phase 4 implementation
