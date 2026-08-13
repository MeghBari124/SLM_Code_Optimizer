{
  "openapi": "3.0.3",
  "info": {
    "title": "Algorand x402 Payment Facilitator API by GoPlausible",
    "description": "\n## Algorand x402 Payment Facilitator , by GoPlausible, provides verification, settlement, Bazaar discovery, analytics and beyond for x402 operations on Algorand and also supports Base and Solana.\n\nA payment facilitator for the x402 Payment Protocol on AVM (Algorand) with support for EVM (Base) and SVM (Solana) networks. Active Bazaar endpoints and discovery, supporting USDC (everywhere) and Algo out of the box and also delivering full analytics for non bazaar x402 operations. The facilitator is designed to be gasless for merchants and resources, with the facilitator paying network fees.\n\n[Facilitator Home](https://facilitator.goplausible.xyz)\n\n[Facilitator Dashboard](https://facilitator.goplausible.xyz/dashboard)\n\n[Facilitator Universal Client ](https://facilitator.goplausible.xyz/client)\n\n## Features\n\n- **Payment Verification & Settlement**: Verify and settle x402 payments across multiple chains\n- **Bazaar Discovery**: Auto-catalog x402-enabled resources, merchants, and facilitators\n- **Multi-Chain Support**: AVM (Algorand Mainnet), EVM (Base Mainnet), and SVM (Solana Mainnet)\n- **Gasless Transactions**: Facilitator pays network fees\n- **MCP Integration**: Model Context Protocol support for AI agents\n- **Analytics & Intelligence**: Public, redacted analytics for transparency and insights\n- **Extensions**: GoPlausible Universal Receipts, PAID x402 endpoints for favorites and verified purchase feedback\n\n## Authentication\n\nThis facilitator operates without authentication for payment operations. Discovery endpoints are publicly accessible.\n\n## Networks\n\n| Network | Chain ID | Token |\n|---------|----------|-------|\n| Base Mainnet | eip155:8453 | USDC |\n| Base Sepolia | eip155:84532 | USDC |\n| Solana Mainnet | solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp | USDC |\n| Solana Devnet | solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1 | USDC |\n| Algorand Mainnet | algorand:wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8= | USDC/ALGO |\n| Algorand Testnet | algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI= | USDC/ALGO |\n\n",
    "version": "2.0.0",
    "contact": {
      "name": "GoPlausible x402",
      "url": "https://x402.goplausible.xyz"
    },
    "license": {
      "name": "Apache 2.0",
      "url": "https://www.apache.org/licenses/LICENSE-2.0"
    }
  },
  "servers": [
    {
      "url": "/",
      "description": "Current server"
    }
  ],
  "tags": [
    {
      "name": "Core",
      "description": "Core facilitator operations"
    },
    {
      "name": "Discovery",
      "description": "Bazaar discovery endpoints"
    },
    {
      "name": "Health",
      "description": "Health and status endpoints"
    },
    {
      "name": "Extensions",
      "description": "Facilitator extensions beyond the x402 spec — GoPlausible Universal Receipts for settled transactions, and the GoPlausible platform merchant's own **PAID x402 endpoints** (favorites 0.01 USDC, verified purchase feedback 0.05 USDC — on Algorand MainNet, gasless). The paid endpoints are real x402 resources: they answer 402 with a PAYMENT-REQUIRED challenge and are Bazaar-cataloged like any merchant."
    },
    {
      "name": "x402 Intelligence Data",
      "description": "Public, redacted analytics powering the transparency dashboard (/dashboard). Read-only, edge-cached; addresses masked, URLs stripped, geo = merchant-infra country only."
    },
    {
      "name": "x402 Facilitator Agent",
      "description": "AI analytics assistant (Workers AI) — read-only over masked views"
    },
    {
      "name": "MCP",
      "description": "Model Context Protocol server for AI agents (JSON-RPC 2.0). Canonical in-protocol tool discovery is the MCP `tools/list` method; the same catalog — names, descriptions and JSON-Schema input schemas — is published in this spec under the root `x-mcp` extension and served by GET /mcp as `toolDefinitions`. A plain-HTTP convenience wrapper is available at POST /mcp/call."
    }
  ],
  "x-mcp": {
    "protocol": "Model Context Protocol (JSON-RPC 2.0)",
    "endpoints": {
      "info": "/mcp",
      "sse": "/mcp/sse",
      "call": "/mcp/call"
    },
    "tools": [
      {
        "name": "verify_payment",
        "description": "Verify an x402 payment payload against requirements",
        "inputSchema": {
          "type": "object",
          "properties": {
            "paymentPayload": {
              "type": "object",
              "description": "The x402 payment payload from the client",
              "additionalProperties": true
            },
            "paymentRequirements": {
              "type": "object",
              "description": "The payment requirements from the resource server",
              "additionalProperties": true
            }
          },
          "required": [
            "paymentPayload",
            "paymentRequirements"
          ],
          "additionalProperties": false
        }
      },
      {
        "name": "settle_payment",
        "description": "Settle an x402 payment on-chain",
        "inputSchema": {
          "type": "object",
          "properties": {
            "paymentPayload": {
              "type": "object",
              "description": "The x402 payment payload",
              "additionalProperties": true
            },
            "paymentRequirements": {
              "type": "object",
              "description": "The payment requirements",
              "additionalProperties": true
            }
          },
          "required": [
            "paymentPayload",
            "paymentRequirements"
          ],
          "additionalProperties": false
        }
      },
      {
        "name": "discover_resources",
        "description": "Search for x402-enabled APIs in the Bazaar catalog",
        "inputSchema": {
          "type": "object",
          "properties": {
            "search": {
              "type": "string",
              "description": "Search query for URL or description"
            },
            "network": {
              "type": "string",
              "description": "Filter by network (CAIP-2 identifier)"
            },
            "method": {
              "type": "string",
              "enum": [
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE"
              ],
              "description": "Filter by HTTP method"
            },
            "limit": {
              "type": "number",
              "default": 10,
              "description": "Maximum results to return"
            }
          },
          "additionalProperties": false
        }
      },
      {
        "name": "discover_merchants",
        "description": "Search for merchants accepting x402 payments",
        "inputSchema": {
          "type": "object",
          "properties": {
            "search": {
              "type": "string",
              "description": "Search query for name or description"
            },
            "network": {
              "type": "string",
              "description": "Filter by supported network"
            },
            "category": {
              "type": "string",
              "description": "Filter by category"
            },
            "limit": {
              "type": "number",
              "default": 10,
              "description": "Maximum results to return"
            }
          },
          "additionalProperties": false
        }
      },
      {
        "name": "get_merchant",
        "description": "Complete catalog record for ONE merchant: Bazaar profile, wallet addresses, every resource with full payment requirements (accepts), and site/agent enrichment — A2A agent card, agent manifest, AI plugin, x402 discovery and llms.txt links when the merchant's domain hosts them. Accepts the merchant id or a receiving wallet address.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "Merchant id (16-hex) or a receiving wallet address"
            }
          },
          "required": [
            "id"
          ],
          "additionalProperties": false
        }
      },
      {
        "name": "get_resource",
        "description": "Complete catalog record for ONE x402 resource: full payment requirements (accepts), discovery metadata, merchant identity, and site/agent enrichment (agent card / manifest / AI plugin / llms.txt links). Provide the resource id or its exact URL.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "Resource id (16-hex)"
            },
            "url": {
              "type": "string",
              "description": "Exact resource URL (alternative to id)"
            }
          },
          "additionalProperties": false
        }
      },
      {
        "name": "discover_facilitators",
        "description": "List known x402 facilitators in the network",
        "inputSchema": {
          "type": "object",
          "properties": {
            "network": {
              "type": "string",
              "description": "Filter by supported network"
            },
            "status": {
              "type": "string",
              "enum": [
                "active",
                "degraded",
                "offline"
              ],
              "description": "Filter by status"
            },
            "limit": {
              "type": "number",
              "default": 10,
              "description": "Maximum results to return"
            }
          },
          "additionalProperties": false
        }
      },
      {
        "name": "get_payment_methods",
        "description": "List supported payment networks and tokens",
        "inputSchema": {
          "type": "object",
          "properties": {
            "chainFamily": {
              "type": "string",
              "enum": [
                "evm",
                "svm",
                "avm"
              ],
              "description": "Filter by chain family"
            }
          },
          "additionalProperties": false
        }
      },
      {
        "name": "get_supported",
        "description": "Get supported schemes, networks, and features",
        "inputSchema": {
          "type": "object",
          "properties": {

          },
          "additionalProperties": false
        }
      }
    ]
  },
  "paths": {
    "/verify": {
      "post": {
        "tags": [
          "Core"
        ],
        "summary": "Verify a payment",
        "description": "Verify a payment payload against requirements. Auto-catalogs resources via Bazaar extension.",
        "operationId": "verifyPayment",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/VerifyRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Verification result",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/VerifyResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorResponse"
                }
              }
            }
          },
          "500": {
            "description": "Server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorResponse"
                }
              }
            }
          }
        }
      }
    },
    "/settle": {
      "post": {
        "tags": [
          "Core"
        ],
        "summary": "Settle a payment",
        "description": "Settle a verified payment on-chain.",
        "operationId": "settlePayment",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/SettleRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Settlement result",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SettleResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorResponse"
                }
              }
            }
          },
          "500": {
            "description": "Server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorResponse"
                }
              }
            }
          }
        }
      }
    },
    "/supported": {
      "get": {
        "tags": [
          "Core"
        ],
        "summary": "Get supported schemes and networks",
        "description": "Returns the payment schemes, networks, and features supported by this facilitator.",
        "operationId": "getSupported",
        "responses": {
          "200": {
            "description": "Supported configuration",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SupportedResponse"
                }
              }
            }
          }
        }
      }
    },
    "/health": {
      "get": {
        "tags": [
          "Health"
        ],
        "summary": "Health check",
        "description": "Returns the health status of the facilitator and connected networks.",
        "operationId": "healthCheck",
        "responses": {
          "200": {
            "description": "Health status",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HealthResponse"
                }
              }
            }
          }
        }
      }
    },
    "/discovery/resources": {
      "get": {
        "tags": [
          "Discovery"
        ],
        "summary": "List cataloged resources",
        "description": "Returns x402-enabled API resources auto-cataloged from payment flows.",
        "operationId": "listResources",
        "parameters": [
          {
            "name": "network",
            "in": "query",
            "description": "Filter by network (CAIP-2 identifier)",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "search",
            "in": "query",
            "description": "Search in URL and description",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "method",
            "in": "query",
            "description": "Filter by HTTP method",
            "schema": {
              "type": "string",
              "enum": [
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE"
              ]
            }
          },
          {
            "name": "merchantId",
            "in": "query",
            "description": "Filter by merchant ID",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "description": "Results per page (default: 50, max: 100)",
            "schema": {
              "type": "integer",
              "default": 50
            }
          },
          {
            "name": "offset",
            "in": "query",
            "description": "Pagination offset",
            "schema": {
              "type": "integer",
              "default": 0
            }
          }
        ],
        "responses": {
          "200": {
            "description": "List of resources",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ResourcesResponse"
                }
              }
            }
          }
        }
      }
    },
    "/discovery/resources/{id}": {
      "get": {
        "tags": [
          "Discovery"
        ],
        "summary": "One resource, complete",
        "description": "Complete catalog record for a single resource: full payment requirements (accepts), discovery metadata, merchant identity, and site/agent enrichment (A2A agent card, agent manifest, AI plugin, x402 discovery, llms.txt links). Browsers get a readable page; send Accept: application/json for JSON.",
        "operationId": "getResource",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "description": "Resource id (16-hex, from the resources list)",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Complete resource record with enrichment",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "404": {
            "description": "Resource not found"
          }
        }
      }
    },
    "/discovery/merchants/{id}": {
      "get": {
        "tags": [
          "Discovery"
        ],
        "summary": "One merchant, complete",
        "description": "Complete catalog record for a single merchant: Bazaar profile, wallet addresses, all resources with full payment requirements, and site/agent enrichment (A2A agent card, agent manifest, AI plugin, x402 discovery, llms.txt links). Accepts the merchant id or a receiving wallet address. Browsers get a readable page; send Accept: application/json for JSON.",
        "operationId": "getMerchant",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "description": "Merchant id (16-hex) or a receiving wallet address",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Complete merchant record with enrichment",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "404": {
            "description": "Merchant not found"
          }
        }
      }
    },
    "/discovery/merchants": {
      "get": {
        "tags": [
          "Discovery"
        ],
        "summary": "List discovered merchants",
        "description": "Returns merchants discovered from payment flows (payTo addresses).",
        "operationId": "listMerchants",
        "parameters": [
          {
            "name": "network",
            "in": "query",
            "description": "Filter by network",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "search",
            "in": "query",
            "description": "Search in name and description",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "category",
            "in": "query",
            "description": "Filter by category",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 50
            }
          },
          {
            "name": "offset",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 0
            }
          }
        ],
        "responses": {
          "200": {
            "description": "List of merchants",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/MerchantsResponse"
                }
              }
            }
          }
        }
      }
    },
    "/discovery/facilitators": {
      "get": {
        "tags": [
          "Discovery"
        ],
        "summary": "List known facilitators",
        "description": "Returns facilitators discovered through federation and payment hints.",
        "operationId": "listFacilitators",
        "parameters": [
          {
            "name": "network",
            "in": "query",
            "description": "Filter by supported network",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "status",
            "in": "query",
            "description": "Filter by status",
            "schema": {
              "type": "string",
              "enum": [
                "active",
                "degraded",
                "offline"
              ]
            }
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 50
            }
          },
          {
            "name": "offset",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 0
            }
          }
        ],
        "responses": {
          "200": {
            "description": "List of facilitators",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/FacilitatorsResponse"
                }
              }
            }
          }
        }
      }
    },
    "/discovery/paymentmethods": {
      "get": {
        "tags": [
          "Discovery"
        ],
        "summary": "List supported payment methods",
        "description": "Returns payment networks and tokens supported by this facilitator.",
        "operationId": "listPaymentMethods",
        "parameters": [
          {
            "name": "chainFamily",
            "in": "query",
            "description": "Filter by chain family",
            "schema": {
              "type": "string",
              "enum": [
                "evm",
                "svm",
                "avm"
              ]
            }
          },
          {
            "name": "status",
            "in": "query",
            "description": "Filter by status",
            "schema": {
              "type": "string",
              "enum": [
                "active",
                "congested",
                "offline"
              ]
            }
          }
        ],
        "responses": {
          "200": {
            "description": "List of payment methods",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PaymentMethodsResponse"
                }
              }
            }
          }
        }
      }
    },
    "/discovery/all": {
      "get": {
        "tags": [
          "Discovery"
        ],
        "summary": "Get aggregated discovery data",
        "description": "Returns a summary of all discovery data including stats and recent entries.",
        "operationId": "getDiscoveryAll",
        "responses": {
          "200": {
            "description": "Aggregated discovery data",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DiscoveryAllResponse"
                }
              }
            }
          }
        }
      }
    },
    "/mcp": {
      "get": {
        "tags": [
          "MCP"
        ],
        "summary": "MCP server info + tool catalog",
        "description": "Server name, version, transport endpoints and the full tool catalog: `tools` (names, backward-compatible) and `toolDefinitions` (name, description and JSON-Schema `inputSchema` per tool — identical to what the MCP protocol's `tools/list` returns). Browsers get a readable page.",
        "operationId": "mcpInfo",
        "responses": {
          "200": {
            "description": "Server info with toolDefinitions",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/mcp/sse": {
      "get": {
        "tags": [
          "MCP"
        ],
        "summary": "MCP SSE transport stream",
        "description": "Server-Sent Events stream for MCP clients (text/event-stream).",
        "operationId": "mcpSse",
        "responses": {
          "200": {
            "description": "SSE stream",
            "content": {
              "text/event-stream": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/mcp/call": {
      "post": {
        "tags": [
          "MCP"
        ],
        "summary": "Invoke an MCP tool over plain HTTP",
        "description": "REST convenience wrapper around the MCP tools: post `{ tool, arguments }` where `arguments` must match the tool's `inputSchema` — see the root `x-mcp.tools` extension of this spec or `toolDefinitions` on GET /mcp. Responses are `{ result: … }`.",
        "operationId": "mcpCall",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "tool"
                ],
                "properties": {
                  "tool": {
                    "type": "string",
                    "enum": [
                      "verify_payment",
                      "settle_payment",
                      "discover_resources",
                      "discover_merchants",
                      "get_merchant",
                      "get_resource",
                      "discover_facilitators",
                      "get_payment_methods",
                      "get_supported"
                    ],
                    "description": "Tool name (see x-mcp.tools for each tool's inputSchema)"
                  },
                  "arguments": {
                    "type": "object",
                    "description": "Arguments matching the selected tool's inputSchema",
                    "additionalProperties": true
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Tool result as { result: … }",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "description": "Missing or unknown tool, or invalid arguments"
          },
          "404": {
            "description": "Entity not found (get_merchant / get_resource)"
          }
        }
      }
    },
    "/data/totals": {
      "get": {
        "tags": [
          "x402 Intelligence Data"
        ],
        "summary": "KPI totals",
        "description": "Settled volume, settle/verify counts, x402 success rate, unique payers, avg + typical settle time for the filtered window.",
        "operationId": "dataTotals",
        "parameters": [
          {
            "name": "range",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "1h",
                "24h",
                "7d",
                "30d",
                "all"
              ]
            },
            "description": "Quick time range (default 24h). Ignored when from/to are set."
          },
          {
            "name": "from",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window start — unix ms or YYYY-MM-DD (UTC)."
          },
          {
            "name": "to",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window end — unix ms or YYYY-MM-DD (UTC, inclusive day)."
          },
          {
            "name": "network",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Network slug (e.g. algorand-mainnet, base-mainnet, solana-mainnet) or CAIP-2 id."
          },
          {
            "name": "asset",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Asset symbol filter (USDC, ALGO, ...)."
          },
          {
            "name": "country",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "ISO-3166 alpha-2 country (merchant-infra geo, never the payer's)."
          }
        ],
        "responses": {
          "200": {
            "description": "KPI totals",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/data/timeseries": {
      "get": {
        "tags": [
          "x402 Intelligence Data"
        ],
        "summary": "Verify/settle/volume time series",
        "description": "Daily buckets come from the incremental rollup (includes legacy history); 5m/1h buckets from raw events. Optional groupBy=network.",
        "operationId": "dataTimeseries",
        "parameters": [
          {
            "name": "range",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "1h",
                "24h",
                "7d",
                "30d",
                "all"
              ]
            },
            "description": "Quick time range (default 24h). Ignored when from/to are set."
          },
          {
            "name": "from",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window start — unix ms or YYYY-MM-DD (UTC)."
          },
          {
            "name": "to",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window end — unix ms or YYYY-MM-DD (UTC, inclusive day)."
          },
          {
            "name": "network",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Network slug (e.g. algorand-mainnet, base-mainnet, solana-mainnet) or CAIP-2 id."
          },
          {
            "name": "asset",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Asset symbol filter (USDC, ALGO, ...)."
          },
          {
            "name": "country",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "ISO-3166 alpha-2 country (merchant-infra geo, never the payer's)."
          },
          {
            "name": "bucket",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "5m",
                "1h",
                "1d"
              ]
            }
          },
          {
            "name": "groupBy",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "network"
              ]
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Bucketed time series",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/data/heatmap": {
      "get": {
        "tags": [
          "x402 Intelligence Data"
        ],
        "summary": "Time-of-week heatmap (7×24)",
        "operationId": "dataHeatmap",
        "parameters": [
          {
            "name": "range",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "1h",
                "24h",
                "7d",
                "30d",
                "all"
              ]
            },
            "description": "Quick time range (default 24h). Ignored when from/to are set."
          },
          {
            "name": "from",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window start — unix ms or YYYY-MM-DD (UTC)."
          },
          {
            "name": "to",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window end — unix ms or YYYY-MM-DD (UTC, inclusive day)."
          },
          {
            "name": "network",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Network slug (e.g. algorand-mainnet, base-mainnet, solana-mainnet) or CAIP-2 id."
          },
          {
            "name": "asset",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Asset symbol filter (USDC, ALGO, ...)."
          },
          {
            "name": "country",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "ISO-3166 alpha-2 country (merchant-infra geo, never the payer's)."
          }
        ],
        "responses": {
          "200": {
            "description": "Per day-of-week × hour buckets with tx/volume/okRate/avgMs",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/data/latency": {
      "get": {
        "tags": [
          "x402 Intelligence Data"
        ],
        "summary": "Settlement latency",
        "description": "Average and percentile latencies overall and per network, plus a distribution histogram.",
        "operationId": "dataLatency",
        "parameters": [
          {
            "name": "range",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "1h",
                "24h",
                "7d",
                "30d",
                "all"
              ]
            },
            "description": "Quick time range (default 24h). Ignored when from/to are set."
          },
          {
            "name": "from",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window start — unix ms or YYYY-MM-DD (UTC)."
          },
          {
            "name": "to",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window end — unix ms or YYYY-MM-DD (UTC, inclusive day)."
          },
          {
            "name": "network",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Network slug (e.g. algorand-mainnet, base-mainnet, solana-mainnet) or CAIP-2 id."
          },
          {
            "name": "asset",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Asset symbol filter (USDC, ALGO, ...)."
          },
          {
            "name": "country",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "ISO-3166 alpha-2 country (merchant-infra geo, never the payer's)."
          }
        ],
        "responses": {
          "200": {
            "description": "Latency stats + histogram",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/data/funnel": {
      "get": {
        "tags": [
          "x402 Intelligence Data"
        ],
        "summary": "Verify → settle funnel",
        "operationId": "dataFunnel",
        "parameters": [
          {
            "name": "range",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "1h",
                "24h",
                "7d",
                "30d",
                "all"
              ]
            },
            "description": "Quick time range (default 24h). Ignored when from/to are set."
          },
          {
            "name": "from",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window start — unix ms or YYYY-MM-DD (UTC)."
          },
          {
            "name": "to",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window end — unix ms or YYYY-MM-DD (UTC, inclusive day)."
          },
          {
            "name": "network",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Network slug (e.g. algorand-mainnet, base-mainnet, solana-mainnet) or CAIP-2 id."
          },
          {
            "name": "asset",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Asset symbol filter (USDC, ALGO, ...)."
          },
          {
            "name": "country",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "ISO-3166 alpha-2 country (merchant-infra geo, never the payer's)."
          }
        ],
        "responses": {
          "200": {
            "description": "Funnel steps overall and per network",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/data/sankey": {
      "get": {
        "tags": [
          "x402 Intelligence Data"
        ],
        "summary": "Flow aggregation for the sankey chart",
        "operationId": "dataSankey",
        "parameters": [
          {
            "name": "range",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "1h",
                "24h",
                "7d",
                "30d",
                "all"
              ]
            },
            "description": "Quick time range (default 24h). Ignored when from/to are set."
          },
          {
            "name": "from",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window start — unix ms or YYYY-MM-DD (UTC)."
          },
          {
            "name": "to",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window end — unix ms or YYYY-MM-DD (UTC, inclusive day)."
          },
          {
            "name": "network",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Network slug (e.g. algorand-mainnet, base-mainnet, solana-mainnet) or CAIP-2 id."
          },
          {
            "name": "asset",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Asset symbol filter (USDC, ALGO, ...)."
          },
          {
            "name": "country",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "ISO-3166 alpha-2 country (merchant-infra geo, never the payer's)."
          },
          {
            "name": "scenario",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "geo-asset",
                "country-merchant",
                "method-outcome",
                "asset-category",
                "funnel"
              ]
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Aggregated flows (keys per column + value)",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/data/geo": {
      "get": {
        "tags": [
          "x402 Intelligence Data"
        ],
        "summary": "Country aggregates (merchant-infra geo)",
        "description": "k-anonymized country buckets — the merchant backend's location, never the payer's.",
        "operationId": "dataGeo",
        "parameters": [
          {
            "name": "range",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "1h",
                "24h",
                "7d",
                "30d",
                "all"
              ]
            },
            "description": "Quick time range (default 24h). Ignored when from/to are set."
          },
          {
            "name": "from",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window start — unix ms or YYYY-MM-DD (UTC)."
          },
          {
            "name": "to",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window end — unix ms or YYYY-MM-DD (UTC, inclusive day)."
          },
          {
            "name": "network",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Network slug (e.g. algorand-mainnet, base-mainnet, solana-mainnet) or CAIP-2 id."
          },
          {
            "name": "asset",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Asset symbol filter (USDC, ALGO, ...)."
          },
          {
            "name": "country",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "ISO-3166 alpha-2 country (merchant-infra geo, never the payer's)."
          }
        ],
        "responses": {
          "200": {
            "description": "Country aggregates with deltas",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/data/leaderboards": {
      "get": {
        "tags": [
          "x402 Intelligence Data"
        ],
        "summary": "Top lists",
        "operationId": "dataLeaderboards",
        "parameters": [
          {
            "name": "range",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "1h",
                "24h",
                "7d",
                "30d",
                "all"
              ]
            },
            "description": "Quick time range (default 24h). Ignored when from/to are set."
          },
          {
            "name": "from",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window start — unix ms or YYYY-MM-DD (UTC)."
          },
          {
            "name": "to",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window end — unix ms or YYYY-MM-DD (UTC, inclusive day)."
          },
          {
            "name": "network",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Network slug (e.g. algorand-mainnet, base-mainnet, solana-mainnet) or CAIP-2 id."
          },
          {
            "name": "asset",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Asset symbol filter (USDC, ALGO, ...)."
          },
          {
            "name": "country",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "ISO-3166 alpha-2 country (merchant-infra geo, never the payer's)."
          },
          {
            "name": "cat",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "merchants",
                "payers",
                "resources",
                "assets",
                "networks",
                "countries"
              ]
            }
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {
              "type": "integer",
              "maximum": 50
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Ranked items (masked labels, Bazaar-enriched merchants)",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/data/merchants": {
      "get": {
        "tags": [
          "x402 Intelligence Data"
        ],
        "summary": "Merchants (aggregated, masked)",
        "operationId": "dataMerchants",
        "parameters": [
          {
            "name": "range",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "1h",
                "24h",
                "7d",
                "30d",
                "all"
              ]
            },
            "description": "Quick time range (default 24h). Ignored when from/to are set."
          },
          {
            "name": "from",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window start — unix ms or YYYY-MM-DD (UTC)."
          },
          {
            "name": "to",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window end — unix ms or YYYY-MM-DD (UTC, inclusive day)."
          },
          {
            "name": "network",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Network slug (e.g. algorand-mainnet, base-mainnet, solana-mainnet) or CAIP-2 id."
          },
          {
            "name": "asset",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Asset symbol filter (USDC, ALGO, ...)."
          },
          {
            "name": "country",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "ISO-3166 alpha-2 country (merchant-infra geo, never the payer's)."
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {
              "type": "integer",
              "maximum": 50
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Merchant aggregates with Bazaar profile enrichment",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/data/merchants/{id}": {
      "get": {
        "tags": [
          "x402 Intelligence Data"
        ],
        "summary": "Merchant drilldown",
        "operationId": "dataMerchantById",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "16-hex pseudonymous merchant id"
          }
        ],
        "responses": {
          "200": {
            "description": "Lifetime stats, sparkline, per-network split, resources",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/data/assets": {
      "get": {
        "tags": [
          "x402 Intelligence Data"
        ],
        "summary": "Assets (aggregated)",
        "operationId": "dataAssets",
        "parameters": [
          {
            "name": "range",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "1h",
                "24h",
                "7d",
                "30d",
                "all"
              ]
            },
            "description": "Quick time range (default 24h). Ignored when from/to are set."
          },
          {
            "name": "from",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window start — unix ms or YYYY-MM-DD (UTC)."
          },
          {
            "name": "to",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window end — unix ms or YYYY-MM-DD (UTC, inclusive day)."
          },
          {
            "name": "network",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Network slug (e.g. algorand-mainnet, base-mainnet, solana-mainnet) or CAIP-2 id."
          },
          {
            "name": "asset",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Asset symbol filter (USDC, ALGO, ...)."
          },
          {
            "name": "country",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "ISO-3166 alpha-2 country (merchant-infra geo, never the payer's)."
          }
        ],
        "responses": {
          "200": {
            "description": "Per-asset volume/settles/verifies",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/data/assets/{symbol}": {
      "get": {
        "tags": [
          "x402 Intelligence Data"
        ],
        "summary": "Asset drilldown",
        "operationId": "dataAssetBySymbol",
        "parameters": [
          {
            "name": "symbol",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Lifetime stats, per-network split, sparkline",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/data/networks": {
      "get": {
        "tags": [
          "x402 Intelligence Data"
        ],
        "summary": "Networks (reference + aggregates)",
        "operationId": "dataNetworks",
        "parameters": [
          {
            "name": "range",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "1h",
                "24h",
                "7d",
                "30d",
                "all"
              ]
            },
            "description": "Quick time range (default 24h). Ignored when from/to are set."
          },
          {
            "name": "from",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window start — unix ms or YYYY-MM-DD (UTC)."
          },
          {
            "name": "to",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Custom window end — unix ms or YYYY-MM-DD (UTC, inclusive day)."
          },
          {
            "name": "network",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Network slug (e.g. algorand-mainnet, base-mainnet, solana-mainnet) or CAIP-2 id."
          },
          {
            "name": "asset",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Asset symbol filter (USDC, ALGO, ...)."
          },
          {
            "name": "country",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "ISO-3166 alpha-2 country (merchant-infra geo, never the payer's)."
          }
        ],
        "responses": {
          "200": {
            "description": "All supported networks with features and stats",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/data/networks/{slug}": {
      "get": {
        "tags": [
          "x402 Intelligence Data"
        ],
        "summary": "Network drilldown",
        "operationId": "dataNetworkBySlug",
        "parameters": [
          {
            "name": "slug",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "e.g. algorand-mainnet"
          }
        ],
        "responses": {
          "200": {
            "description": "Reference card, lifetime stats, sparkline, assets, top merchants",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/data/transactions": {
      "get": {
        "tags": [
          "x402 Intelligence Data"
        ],
        "summary": "Recent transactions (masked stream)",
        "description": "Cursor-paginated feed with filters; poll with since= for live updates.",
        "operationId": "dataTransactions",
        "parameters": [
          {
            "name": "limit",
            "in": "query",
            "schema": {
              "type": "integer",
              "maximum": 100
            }
          },
          {
            "name": "before",
            "in": "query",
            "schema": {
              "type": "integer"
            },
            "description": "Return rows with ts \u003C before (pagination cursor)"
          },
          {
            "name": "since",
            "in": "query",
            "schema": {
              "type": "integer"
            },
            "description": "Return rows with ts \u003E since (live polling)"
          },
          {
            "name": "network",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "asset",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "event",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "verify",
                "settle"
              ]
            }
          },
          {
            "name": "outcome",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "success",
                "failure"
              ]
            }
          },
          {
            "name": "q",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Substring match over resource URL / tx hash / asset"
          }
        ],
        "responses": {
          "200": {
            "description": "Masked transaction rows + 24h summary + nextBefore cursor",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/data/ecosystem": {
      "get": {
        "tags": [
          "x402 Intelligence Data"
        ],
        "summary": "Bazaar ecosystem counts",
        "operationId": "dataEcosystem",
        "responses": {
          "200": {
            "description": "Resources / merchants / facilitators / providers / payment methods / networks counts",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/agent/suggest": {
      "post": {
        "tags": [
          "x402 Facilitator Agent"
        ],
        "summary": "Autocomplete example questions",
        "operationId": "agentSuggest",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "q": {
                    "type": "string"
                  }
                },
                "required": [
                  "q"
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Up to 4 completed example questions",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/agent/query": {
      "post": {
        "tags": [
          "x402 Facilitator Agent"
        ],
        "summary": "Ask the analytics assistant",
        "description": "Answers questions by running guarded read-only SQL over the masked public views (v_tx, v_daily). Rate-limited.",
        "operationId": "agentQuery",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "q": {
                    "type": "string"
                  }
                },
                "required": [
                  "q"
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Plain-language answer + executed query steps",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/api/receipt/{txId}": {
      "get": {
        "tags": [
          "Extensions"
        ],
        "summary": "GoPlausible Universal Receipt for a settled transaction",
        "description": "Builds (once — idempotent, keyed by SHA-256 of the txId) a GoPlausible Universal Receipt (category x402) for a transaction settled through this facilitator, then 302-redirects to the universal receipt page at goplausible.xyz. The txId must belong to a successful Algorand, Base or Solana MainNet settlement captured by this facilitator — the chain is auto-detected from the captured settle. Base/Solana receipts are additionally corroborated on-chain via RPC and enriched with the block timestamp and the sponsored network fee (ETH/SOL); payments in native ETH/SOL render with their own currency and logo, like ALGO payments do. `/receipt/{txId}` is an alias of this endpoint.",
        "operationId": "getUniversalReceipt",
        "parameters": [
          {
            "name": "txId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Transaction id / hash / signature of the settled x402 payment (Algorand txid, Base 0x-hash, or Solana signature)"
          },
          {
            "name": "chain",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "algorand",
                "base",
                "solana"
              ]
            },
            "description": "Optional consistency check — the chain is auto-detected from the settle record; a mismatch returns 400"
          }
        ],
        "responses": {
          "302": {
            "description": "Redirect to the universal receipt at goplausible.xyz/api/receipt/{uuid}"
          },
          "400": {
            "description": "Transaction settled, but not on a supported MainNet (Algorand/Base/Solana — receipts are MainNet-only), or ?chain= mismatch"
          },
          "404": {
            "description": "This transaction is not settled on GoPlausible x402 Facilitator"
          },
          "503": {
            "description": "Receipts unavailable (storage binding missing)"
          }
        }
      }
    },
    "/platform/favorites": {
      "post": {
        "tags": [
          "Extensions"
        ],
        "summary": "⭐ Add a favorite — PAID x402 endpoint · 0.01 USDC (Algorand MainNet)",
        "description": "**This is an x402-protected PAID API operated by the GoPlausible platform merchant** (payTo treasury `UTI7PAAS…SZ4I`). Price: **0.01 USDC on Algorand MainNet**, gasless (the facilitator fee payer covers network fees). Calling without payment returns a standards-compliant `402` with the `PAYMENT-REQUIRED` challenge header; retry with a valid `PAYMENT-SIGNATURE` header and the favorite is written under the payment's **settle payer** — the payment itself authenticates the account, so favorites cannot be spoofed. Favorites follow the wallet across devices (read them via `GET /client/data/favorites?address=`); removal is free via `POST /client/data/favorites` with `on:false`. **Pay with your connected wallet in the browser:** open the [Universal Client](https://facilitator.goplausible.xyz/client) and tap the ⭐ star on any merchant or resource — it drives this exact endpoint with Pera/Lute. Agents use the Algorand MCP `make_http_request_with_x402` tool. (Try-it-out is disabled here — Swagger has no wallet.)",
        "operationId": "platformAddFavorite",
        "x-x402": {
          "paid": true,
          "price": "0.01 USDC",
          "amountAtomic": "10000",
          "asset": "31566704 (USDC)",
          "network": "algorand:wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8= (Algorand MainNet)",
          "payTo": "UTI7PAASILRDA3ISHY5M7J7LNRX2AIVQJWI7ZKCCGKVLMFD3VPR5PWSZ4I",
          "scheme": "exact"
        },
        "parameters": [
          {
            "name": "PAYMENT-SIGNATURE",
            "in": "header",
            "required": false,
            "schema": {
              "type": "string"
            },
            "description": "Base64 x402 v2 payment payload. Omit to receive the 402 challenge with the exact payment requirements."
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "kind",
                  "value"
                ],
                "properties": {
                  "kind": {
                    "type": "string",
                    "enum": [
                      "resource",
                      "merchant"
                    ],
                    "description": "What is being favorited"
                  },
                  "value": {
                    "type": "string",
                    "maxLength": 500,
                    "description": "Resource URL (kind=resource) or merchant payTo address (kind=merchant)"
                  },
                  "meta": {
                    "type": "object",
                    "description": "Optional display snapshot (label, method, logo, price…) — ≤2KB"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Payment settled and favorite written under the settle payer. Includes the settle txid; `PAYMENT-RESPONSE` header carries the settle response."
          },
          "400": {
            "description": "Invalid body (kind/value)"
          },
          "402": {
            "description": "Payment required (no/invalid PAYMENT-SIGNATURE, terms mismatch, or verification/settlement failure) — body and `PAYMENT-REQUIRED` header carry the challenge: 0.01 USDC · Algorand MainNet · payTo the GoPlausible treasury"
          },
          "502": {
            "description": "Verification/settlement infrastructure unavailable"
          }
        }
      }
    },
    "/platform/feedback": {
      "post": {
        "tags": [
          "Extensions"
        ],
        "summary": "⭐ Submit verified purchase feedback — PAID x402 endpoint · 0.05 USDC (Algorand MainNet)",
        "description": "**This is an x402-protected PAID API operated by the GoPlausible platform merchant** (payTo treasury `UTI7PAAS…SZ4I`). Price: **0.05 USDC on Algorand MainNet**, gasless. Submits a 5-star rating + message for a purchase settled through this facilitator, keyed by the purchase's settle txid. **One feedback per purchase** (permanent), and **only the purchase's payer can rate it** — enforced by matching the feedback payment's settle payer against the purchase's payer, so ratings cannot be faked. All free pre-checks (purchase exists, no prior feedback, valid rating) run BEFORE any payment is taken. The Universal Client also writes the rating + message into the feedback payment's on-chain transaction note. **Pay with your connected wallet in the browser:** the [feedback form](https://facilitator.goplausible.xyz/client/feedback/{txId}) (also linked from History rows and every new Universal Receipt) drives this exact endpoint with Pera/Lute. (Try-it-out is disabled here — Swagger has no wallet.)",
        "operationId": "platformSubmitFeedback",
        "x-x402": {
          "paid": true,
          "price": "0.05 USDC",
          "amountAtomic": "10000",
          "asset": "31566704 (USDC)",
          "network": "algorand:wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8= (Algorand MainNet)",
          "payTo": "UTI7PAASILRDA3ISHY5M7J7LNRX2AIVQJWI7ZKCCGKVLMFD3VPR5PWSZ4I",
          "scheme": "exact"
        },
        "parameters": [
          {
            "name": "PAYMENT-SIGNATURE",
            "in": "header",
            "required": false,
            "schema": {
              "type": "string"
            },
            "description": "Base64 x402 v2 payment payload. Omit to receive the 402 challenge with the exact payment requirements."
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "purchaseTx",
                  "rating"
                ],
                "properties": {
                  "purchaseTx": {
                    "type": "string",
                    "description": "Settle txid of the purchase being rated (must be a successful settle on this facilitator)"
                  },
                  "rating": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 5,
                    "description": "1–5 stars"
                  },
                  "message": {
                    "type": "string",
                    "maxLength": 1000,
                    "description": "Optional message (≤1000 chars)"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Payment settled and feedback recorded (purchase_tx-keyed, permanent). `PAYMENT-RESPONSE` header carries the settle response."
          },
          "400": {
            "description": "Invalid purchaseTx/rating/message"
          },
          "402": {
            "description": "Payment required — body and `PAYMENT-REQUIRED` header carry the challenge: 0.05 USDC · Algorand MainNet · payTo the GoPlausible treasury"
          },
          "403": {
            "description": "The feedback payment's payer is not the purchase's payer (buyer-only)"
          },
          "404": {
            "description": "purchaseTx is not a settled x402 purchase on this facilitator"
          },
          "409": {
            "description": "Feedback already exists for this purchase — one per purchase"
          },
          "502": {
            "description": "Verification/settlement infrastructure unavailable"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "VerifyRequest": {
        "type": "object",
        "required": [
          "paymentPayload",
          "paymentRequirements"
        ],
        "properties": {
          "paymentPayload": {
            "type": "object",
            "description": "The payment payload from the client"
          },
          "paymentRequirements": {
            "type": "object",
            "description": "The payment requirements from the server"
          }
        }
      },
      "VerifyResponse": {
        "type": "object",
        "properties": {
          "isValid": {
            "type": "boolean",
            "description": "Whether the payment is valid"
          },
          "invalidReason": {
            "type": "string",
            "description": "Reason for invalid payment (if any)"
          }
        }
      },
      "SettleRequest": {
        "type": "object",
        "required": [
          "paymentPayload",
          "paymentRequirements"
        ],
        "properties": {
          "paymentPayload": {
            "type": "object"
          },
          "paymentRequirements": {
            "type": "object"
          }
        }
      },
      "SettleResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean"
          },
          "transaction": {
            "type": "string",
            "description": "Transaction ID/hash"
          },
          "network": {
            "type": "string"
          },
          "errorReason": {
            "type": "string"
          }
        }
      },
      "SupportedResponse": {
        "type": "object",
        "properties": {
          "x402Version": {
            "type": "integer"
          },
          "schemes": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "networks": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "features": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "extensions": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      },
      "HealthResponse": {
        "type": "object",
        "properties": {
          "status": {
            "type": "string",
            "enum": [
              "healthy",
              "degraded",
              "unhealthy"
            ]
          },
          "version": {
            "type": "string"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          },
          "networks": {
            "type": "object",
            "additionalProperties": {
              "type": "object",
              "properties": {
                "status": {
                  "type": "string",
                  "enum": [
                    "up",
                    "down",
                    "slow"
                  ]
                },
                "latency": {
                  "type": "integer"
                }
              }
            }
          },
          "uptime": {
            "type": "string"
          }
        }
      },
      "ResourcesResponse": {
        "type": "object",
        "properties": {
          "x402Version": {
            "type": "integer"
          },
          "items": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/CatalogedResource"
            }
          },
          "pagination": {
            "$ref": "#/components/schemas/Pagination"
          }
        }
      },
      "CatalogedResource": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "resourceUrl": {
            "type": "string"
          },
          "method": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "mimeType": {
            "type": "string"
          },
          "merchantId": {
            "type": "string"
          },
          "accepts": {
            "type": "array",
            "items": {
              "type": "object"
            }
          },
          "discoveryInfo": {
            "type": "object"
          },
          "verifyCount": {
            "type": "integer"
          },
          "settleCount": {
            "type": "integer"
          },
          "firstSeen": {
            "type": "string",
            "format": "date-time"
          },
          "lastSeen": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "MerchantsResponse": {
        "type": "object",
        "properties": {
          "x402Version": {
            "type": "integer"
          },
          "items": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/CatalogedMerchant"
            }
          },
          "pagination": {
            "$ref": "#/components/schemas/Pagination"
          }
        }
      },
      "CatalogedMerchant": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "website": {
            "type": "string"
          },
          "logo": {
            "type": "string"
          },
          "addresses": {
            "type": "object",
            "properties": {
              "evm": {
                "type": "string"
              },
              "svm": {
                "type": "string"
              },
              "avm": {
                "type": "string"
              }
            }
          },
          "categories": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "resourceCount": {
            "type": "integer"
          },
          "totalVerifications": {
            "type": "integer"
          },
          "networks": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "firstSeen": {
            "type": "string",
            "format": "date-time"
          },
          "lastSeen": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "FacilitatorsResponse": {
        "type": "object",
        "properties": {
          "x402Version": {
            "type": "integer"
          },
          "items": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/CatalogedFacilitator"
            }
          },
          "pagination": {
            "$ref": "#/components/schemas/Pagination"
          }
        }
      },
      "CatalogedFacilitator": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "url": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "networks": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "schemes": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "features": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "status": {
            "type": "string",
            "enum": [
              "active",
              "degraded",
              "offline"
            ]
          },
          "lastChecked": {
            "type": "string",
            "format": "date-time"
          },
          "discoveredAt": {
            "type": "string",
            "format": "date-time"
          },
          "source": {
            "type": "string",
            "enum": [
              "self",
              "federation",
              "payment-hint"
            ]
          }
        }
      },
      "PaymentMethodsResponse": {
        "type": "object",
        "properties": {
          "x402Version": {
            "type": "integer"
          },
          "items": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/PaymentMethod"
            }
          }
        }
      },
      "PaymentMethod": {
        "type": "object",
        "properties": {
          "network": {
            "type": "string"
          },
          "networkName": {
            "type": "string"
          },
          "chainFamily": {
            "type": "string",
            "enum": [
              "evm",
              "svm",
              "avm"
            ]
          },
          "tokens": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "symbol": {
                  "type": "string"
                },
                "name": {
                  "type": "string"
                },
                "address": {
                  "type": "string"
                },
                "decimals": {
                  "type": "integer"
                },
                "logoUrl": {
                  "type": "string"
                }
              }
            }
          },
          "features": {
            "type": "object",
            "properties": {
              "gasless": {
                "type": "boolean"
              },
              "instantSettlement": {
                "type": "boolean"
              },
              "smartWallets": {
                "type": "boolean"
              }
            }
          },
          "explorer": {
            "type": "string"
          },
          "status": {
            "type": "string",
            "enum": [
              "active",
              "congested",
              "offline"
            ]
          },
          "avgSettlementTime": {
            "type": "string"
          }
        }
      },
      "DiscoveryAllResponse": {
        "type": "object",
        "properties": {
          "x402Version": {
            "type": "integer"
          },
          "facilitator": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string"
              },
              "url": {
                "type": "string"
              },
              "version": {
                "type": "string"
              },
              "features": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          },
          "summary": {
            "type": "object"
          },
          "networks": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "recentResources": {
            "type": "array",
            "items": {
              "type": "object"
            }
          },
          "recentMerchants": {
            "type": "array",
            "items": {
              "type": "object"
            }
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "Pagination": {
        "type": "object",
        "properties": {
          "limit": {
            "type": "integer"
          },
          "offset": {
            "type": "integer"
          },
          "total": {
            "type": "integer"
          }
        }
      },
      "ErrorResponse": {
        "type": "object",
        "properties": {
          "error": {
            "type": "string"
          }
        }
      }
    }
  }
}