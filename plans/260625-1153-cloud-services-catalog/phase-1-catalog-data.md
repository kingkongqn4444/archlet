# Phase 1 — Catalog Data (600 entries, hand-curated)

**Status:** pending | **Priority:** P0 | **Effort:** 2-3d

## Goal

Hand-curate JSON catalog of 600 cloud services (AWS 200 + GCP 120 + Azure 200 — target top 100/cloud first, expand later) với metadata: id, name, cloud, category, iconSlug, description, docsUrl, tags.

## Data structure

```ts
// packages/shared/src/cloud-services-catalog.ts
export type CloudServiceCategory =
  | "compute" | "container" | "serverless"
  | "storage" | "database" | "cache"
  | "queue" | "stream" | "cdn"
  | "networking" | "dns"
  | "security" | "auth" | "kms"
  | "ml-ai" | "analytics" | "observability"
  | "devops" | "migration" | "iot" | "blockchain" | "media";

export type CloudService = {
  id: string;                     // "aws-glue", "gcp-bigquery", "azure-cosmos-db"
  name: string;                   // "AWS Glue", "BigQuery"
  cloud: "aws" | "gcp" | "azure";
  category: CloudServiceCategory;
  iconSlug?: string;              // simpleicons or custom; fallback to cloud icon
  description: string;            // 1-line
  docsUrl: string;                // official docs
  tags: string[];                 // ["etl", "serverless"]
};

export const CLOUD_SERVICES_CATALOG: CloudService[] = [/* 600 entries */];
```

## Curation source

Manual or AI-assisted. Approach:
- AWS: docs.aws.amazon.com/general/latest/gr/aws-service-information.html
- GCP: cloud.google.com/products
- Azure: learn.microsoft.com/azure/

Start with **top 100 per cloud** (most-used in interview / production). Expand to 200+ rolling.

## Initial seed targets (top 100/cloud)

### AWS top 100
EC2, Lambda, ECS, EKS, Fargate, Batch, Lightsail, App Runner, Elastic Beanstalk
S3, EFS, EBS, FSx, Storage Gateway, Snowball, Backup
RDS (Postgres, MySQL, Aurora, MariaDB, Oracle, SQL Server), DynamoDB, ElastiCache, MemoryDB, Neptune, DocumentDB, Timestream, Keyspaces, QLDB
SQS, SNS, EventBridge, Kinesis Data Streams, Kinesis Firehose, Kinesis Analytics, MSK, Step Functions, SWF, MQ
API Gateway, ALB, NLB, GLB, CloudFront, Route 53, Direct Connect, Transit Gateway, VPC, PrivateLink, App Mesh, Global Accelerator
Cognito, IAM, KMS, Secrets Manager, Certificate Manager, WAF, Shield, GuardDuty, Inspector, Macie, Detective, Security Hub
SageMaker, Bedrock, Comprehend, Rekognition, Polly, Transcribe, Translate, Personalize, Forecast, Lex, Textract, Kendra
Athena, Glue, EMR, Redshift, QuickSight, Lake Formation, OpenSearch, Data Pipeline, AppFlow
CloudWatch, X-Ray, CloudTrail, Config, Systems Manager, OpsWorks, Trusted Advisor
CodeCommit, CodeBuild, CodeDeploy, CodePipeline, CodeStar, Cloud9, CloudFormation, CDK
IoT Core, Greengrass, IoT Analytics, FreeRTOS

### GCP top 100
Compute Engine, GKE, Cloud Run, Cloud Functions, App Engine, GKE Autopilot
Cloud Storage, Persistent Disk, Filestore, Transfer Service
Cloud SQL (Postgres, MySQL, SQL Server), Spanner, Bigtable, Firestore, Memorystore (Redis/Memcached), Datastore
Pub/Sub, Cloud Tasks, Cloud Scheduler, Workflows, Eventarc
Cloud Load Balancing, Cloud CDN, Cloud DNS, VPC, Cloud Interconnect, Cloud NAT, Anthos Service Mesh
IAM, Cloud KMS, Secret Manager, Certificate Manager, Cloud Armor, reCAPTCHA Enterprise, BeyondCorp
Vertex AI, AutoML, Speech-to-Text, Text-to-Speech, Vision AI, Translation, Natural Language AI, Dialogflow, Document AI
BigQuery, Dataflow, Dataproc, Composer, Data Catalog, Looker, Datastream
Cloud Logging, Cloud Monitoring, Cloud Trace, Error Reporting, Cloud Profiler, Cloud Debugger
Cloud Build, Cloud Deploy, Artifact Registry, Cloud Source Repos, Cloud Run jobs

### Azure top 100
Virtual Machines, AKS, Container Instances, Functions, App Service, Container Apps, Batch
Blob Storage, Files, Disks, NetApp Files, Data Box
SQL Database, Cosmos DB, Database for Postgres, Database for MySQL, Cache for Redis, Synapse Dedicated Pool, Table Storage
Service Bus, Event Grid, Event Hubs, Queue Storage, Logic Apps, Durable Functions
Application Gateway, Load Balancer, Front Door, CDN, Traffic Manager, DNS, Virtual Network, ExpressRoute, Private Link, VPN Gateway
Entra ID (AD), Key Vault, Managed Identity, AD B2C, Defender, Sentinel, Firewall, DDoS Protection, Application Insights
OpenAI Service, Cognitive Services, Machine Learning, Bot Service, Form Recognizer, Cognitive Search, Speech, Vision, Translator
Synapse Analytics, Data Factory, Databricks, Stream Analytics, Data Explorer, Purview, Power BI Embedded
Monitor, Application Insights, Log Analytics, Network Watcher, Service Map
DevOps, Pipelines, Repos, Artifacts, Container Registry, Bicep, Resource Manager

## TODO

- [ ] Define `CloudService` type + `CloudServiceCategory` enum
- [ ] Curate AWS 100 entries (1 day)
- [ ] Curate GCP 100 entries (0.5-1 day)
- [ ] Curate Azure 100 entries (1 day)
- [ ] Verify all iconSlug values via simpleicons.org
- [ ] Add fallback per-category icon mapping
- [ ] Export from `packages/shared/src/index.ts`
- [ ] Helpers: `getCloudService(id)`, `searchServices(query, filters)`, `byCategory(category)`
- [ ] typecheck pass

## Risks

| Risk | Mitigation |
|---|---|
| 300 entries hand-typing tedious | AI-assist (paste service lists, ask Claude to generate JSON; verify samples) |
| iconSlug fragmentation (simpleicons doesn't have all 600) | Per-category SVG fallbacks built in app/web/public/icons/cloud/{category}.svg |
| Stale within months | Document quarterly review process in README |
| Category fit ambiguous (Step Functions = orchestration?) | Tag with multiple categories via tags[] array |
