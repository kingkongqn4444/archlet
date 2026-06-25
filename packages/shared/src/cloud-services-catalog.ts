// Cloud Services Catalog — untyped reference catalog of cloud services
// (coexists with typed variants/ — typed variants get capacity simulation,
// these don't). Phase 1: AWS top 100. GCP + Azure rolling.

export type CloudServiceCategory =
  | "compute" | "container" | "serverless"
  | "storage" | "database" | "cache"
  | "queue" | "stream" | "event" | "workflow"
  | "cdn" | "networking" | "loadbalancer" | "dns"
  | "auth" | "iam" | "security" | "kms"
  | "ml-ai" | "analytics" | "observability"
  | "devops" | "management" | "migration"
  | "iot" | "media";

export type CloudServiceProvider = "aws" | "gcp" | "azure";

export type CloudService = {
  id: string;
  name: string;
  cloud: CloudServiceProvider;
  category: CloudServiceCategory;
  iconSlug?: string;   // simpleicons.org slug; fallback resolved at render time
  description: string;
  docsUrl: string;
  tags?: readonly string[];
};

const aws = (s: Omit<CloudService, "cloud">): CloudService => ({ ...s, cloud: "aws" });
const AWS_DOCS = "https://docs.aws.amazon.com";

const AWS_SERVICES: readonly CloudService[] = [
  // ── Compute (8) ──────────────────────────────────────────────────────────
  aws({ id: "aws-ec2", name: "Amazon EC2", category: "compute", iconSlug: "amazonec2", description: "Resizable virtual servers in the cloud.", docsUrl: `${AWS_DOCS}/ec2/`, tags: ["vm", "iaas"] }),
  aws({ id: "aws-lightsail", name: "Lightsail", category: "compute", iconSlug: "amazonwebservices", description: "Simple VPS with predictable pricing.", docsUrl: `${AWS_DOCS}/lightsail/`, tags: ["vps", "simple"] }),
  aws({ id: "aws-batch", name: "AWS Batch", category: "compute", iconSlug: "amazonwebservices", description: "Run batch computing jobs at any scale.", docsUrl: `${AWS_DOCS}/batch/`, tags: ["batch", "hpc"] }),
  aws({ id: "aws-elastic-beanstalk", name: "Elastic Beanstalk", category: "compute", iconSlug: "amazonwebservices", description: "Deploy and scale web apps + services.", docsUrl: `${AWS_DOCS}/elasticbeanstalk/`, tags: ["paas"] }),
  aws({ id: "aws-app-runner", name: "App Runner", category: "compute", iconSlug: "amazonwebservices", description: "Fully managed container application service.", docsUrl: `${AWS_DOCS}/apprunner/`, tags: ["container", "paas"] }),
  aws({ id: "aws-outposts", name: "AWS Outposts", category: "compute", iconSlug: "amazonwebservices", description: "AWS infrastructure on-premises.", docsUrl: `${AWS_DOCS}/outposts/`, tags: ["hybrid"] }),
  aws({ id: "aws-wavelength", name: "AWS Wavelength", category: "compute", iconSlug: "amazonwebservices", description: "5G edge compute.", docsUrl: `${AWS_DOCS}/wavelength/`, tags: ["edge", "5g"] }),
  aws({ id: "aws-local-zones", name: "Local Zones", category: "compute", iconSlug: "amazonwebservices", description: "Low-latency compute close to end users.", docsUrl: `${AWS_DOCS}/local-zones/`, tags: ["edge"] }),

  // ── Container (3) ────────────────────────────────────────────────────────
  aws({ id: "aws-ecs", name: "Amazon ECS", category: "container", iconSlug: "amazonecs", description: "Highly secure, reliable, scalable container orchestration.", docsUrl: `${AWS_DOCS}/ecs/`, tags: ["docker", "orchestration"] }),
  aws({ id: "aws-eks", name: "Amazon EKS", category: "container", iconSlug: "amazoneks", description: "Managed Kubernetes service.", docsUrl: `${AWS_DOCS}/eks/`, tags: ["kubernetes", "k8s"] }),
  aws({ id: "aws-fargate", name: "AWS Fargate", category: "container", iconSlug: "amazonwebservices", description: "Serverless compute for containers.", docsUrl: `${AWS_DOCS}/fargate/`, tags: ["serverless", "container"] }),

  // ── Serverless (1) ───────────────────────────────────────────────────────
  aws({ id: "aws-lambda", name: "AWS Lambda", category: "serverless", iconSlug: "awslambda", description: "Run code without provisioning servers.", docsUrl: `${AWS_DOCS}/lambda/`, tags: ["faas", "serverless"] }),

  // ── Storage (8) ──────────────────────────────────────────────────────────
  aws({ id: "aws-s3", name: "Amazon S3", category: "storage", iconSlug: "amazons3", description: "Object storage built for any amount of data.", docsUrl: `${AWS_DOCS}/s3/`, tags: ["object"] }),
  aws({ id: "aws-s3-glacier", name: "S3 Glacier", category: "storage", iconSlug: "amazons3", description: "Low-cost archive storage.", docsUrl: `${AWS_DOCS}/amazonglacier/`, tags: ["archive", "cold"] }),
  aws({ id: "aws-ebs", name: "Amazon EBS", category: "storage", iconSlug: "amazonwebservices", description: "Block storage for EC2.", docsUrl: `${AWS_DOCS}/ebs/`, tags: ["block"] }),
  aws({ id: "aws-efs", name: "Amazon EFS", category: "storage", iconSlug: "amazonwebservices", description: "Elastic NFS file system.", docsUrl: `${AWS_DOCS}/efs/`, tags: ["nfs", "file"] }),
  aws({ id: "aws-fsx", name: "Amazon FSx", category: "storage", iconSlug: "amazonwebservices", description: "Managed third-party file systems (Lustre, Windows, NetApp).", docsUrl: `${AWS_DOCS}/fsx/`, tags: ["file", "lustre"] }),
  aws({ id: "aws-storage-gateway", name: "Storage Gateway", category: "storage", iconSlug: "amazonwebservices", description: "Hybrid cloud storage.", docsUrl: `${AWS_DOCS}/storagegateway/`, tags: ["hybrid"] }),
  aws({ id: "aws-backup", name: "AWS Backup", category: "storage", iconSlug: "amazonwebservices", description: "Centralized backup across AWS services.", docsUrl: `${AWS_DOCS}/aws-backup/`, tags: ["backup"] }),
  aws({ id: "aws-snowball", name: "Snow Family", category: "storage", iconSlug: "amazonwebservices", description: "Petabyte-scale data transport.", docsUrl: `${AWS_DOCS}/snowball/`, tags: ["transfer", "physical"] }),

  // ── Database (9) ─────────────────────────────────────────────────────────
  aws({ id: "aws-rds", name: "Amazon RDS", category: "database", iconSlug: "amazonrds", description: "Managed relational database (Postgres/MySQL/MariaDB/Oracle/SQL Server).", docsUrl: `${AWS_DOCS}/rds/`, tags: ["sql", "managed"] }),
  aws({ id: "aws-aurora", name: "Amazon Aurora", category: "database", iconSlug: "amazonrds", description: "MySQL/Postgres-compatible relational DB built for cloud.", docsUrl: `${AWS_DOCS}/aurora/`, tags: ["sql", "mysql", "postgres"] }),
  aws({ id: "aws-dynamodb", name: "DynamoDB", category: "database", iconSlug: "amazondynamodb", description: "Fast, flexible NoSQL key-value + document.", docsUrl: `${AWS_DOCS}/dynamodb/`, tags: ["nosql", "kv"] }),
  aws({ id: "aws-documentdb", name: "DocumentDB", category: "database", iconSlug: "amazonwebservices", description: "MongoDB-compatible document database.", docsUrl: `${AWS_DOCS}/documentdb/`, tags: ["mongodb", "document"] }),
  aws({ id: "aws-neptune", name: "Amazon Neptune", category: "database", iconSlug: "amazonwebservices", description: "Fully managed graph database.", docsUrl: `${AWS_DOCS}/neptune/`, tags: ["graph"] }),
  aws({ id: "aws-timestream", name: "Timestream", category: "database", iconSlug: "amazonwebservices", description: "Time-series database for IoT and ops.", docsUrl: `${AWS_DOCS}/timestream/`, tags: ["timeseries"] }),
  aws({ id: "aws-keyspaces", name: "Keyspaces (Cassandra)", category: "database", iconSlug: "amazonwebservices", description: "Managed Apache Cassandra-compatible service.", docsUrl: `${AWS_DOCS}/keyspaces/`, tags: ["cassandra", "nosql"] }),
  aws({ id: "aws-qldb", name: "QLDB", category: "database", iconSlug: "amazonwebservices", description: "Ledger database with cryptographic verification.", docsUrl: `${AWS_DOCS}/qldb/`, tags: ["ledger", "immutable"] }),
  aws({ id: "aws-memorydb", name: "MemoryDB for Redis", category: "database", iconSlug: "redis", description: "Durable in-memory database (Redis-compatible).", docsUrl: `${AWS_DOCS}/memorydb/`, tags: ["redis", "in-memory"] }),

  // ── Cache (1) ────────────────────────────────────────────────────────────
  aws({ id: "aws-elasticache", name: "ElastiCache", category: "cache", iconSlug: "amazonwebservices", description: "Managed Redis or Memcached.", docsUrl: `${AWS_DOCS}/elasticache/`, tags: ["redis", "memcached"] }),

  // ── Queue / Event / Stream / Workflow (8) ────────────────────────────────
  aws({ id: "aws-sqs", name: "Amazon SQS", category: "queue", iconSlug: "amazonsqs", description: "Managed message queues.", docsUrl: `${AWS_DOCS}/sqs/`, tags: ["queue"] }),
  aws({ id: "aws-mq", name: "Amazon MQ", category: "queue", iconSlug: "amazonwebservices", description: "Managed Apache ActiveMQ + RabbitMQ.", docsUrl: `${AWS_DOCS}/amazon-mq/`, tags: ["amqp", "rabbitmq"] }),
  aws({ id: "aws-sns", name: "Amazon SNS", category: "event", iconSlug: "amazonwebservices", description: "Pub/sub messaging.", docsUrl: `${AWS_DOCS}/sns/`, tags: ["pubsub"] }),
  aws({ id: "aws-eventbridge", name: "EventBridge", category: "event", iconSlug: "amazonwebservices", description: "Serverless event bus.", docsUrl: `${AWS_DOCS}/eventbridge/`, tags: ["events", "bus"] }),
  aws({ id: "aws-kinesis-streams", name: "Kinesis Data Streams", category: "stream", iconSlug: "amazonwebservices", description: "Real-time data streams.", docsUrl: `${AWS_DOCS}/kinesis/`, tags: ["stream"] }),
  aws({ id: "aws-kinesis-firehose", name: "Kinesis Firehose", category: "stream", iconSlug: "amazonwebservices", description: "Load streaming data into data lakes.", docsUrl: `${AWS_DOCS}/firehose/`, tags: ["stream", "etl"] }),
  aws({ id: "aws-msk", name: "Amazon MSK (Kafka)", category: "stream", iconSlug: "apachekafka", description: "Fully managed Apache Kafka.", docsUrl: `${AWS_DOCS}/msk/`, tags: ["kafka"] }),
  aws({ id: "aws-step-functions", name: "Step Functions", category: "workflow", iconSlug: "amazonwebservices", description: "Visual workflow orchestrator.", docsUrl: `${AWS_DOCS}/step-functions/`, tags: ["orchestration", "saga"] }),

  // ── CDN / Networking / LB / DNS (10) ─────────────────────────────────────
  aws({ id: "aws-cloudfront", name: "CloudFront", category: "cdn", iconSlug: "amazoncloudfront", description: "Global CDN.", docsUrl: `${AWS_DOCS}/cloudfront/`, tags: ["cdn", "edge"] }),
  aws({ id: "aws-global-accelerator", name: "Global Accelerator", category: "networking", iconSlug: "amazonwebservices", description: "Anycast IP routing to AWS endpoints.", docsUrl: `${AWS_DOCS}/global-accelerator/`, tags: ["anycast", "edge"] }),
  aws({ id: "aws-vpc", name: "Amazon VPC", category: "networking", iconSlug: "amazonwebservices", description: "Isolated virtual networks.", docsUrl: `${AWS_DOCS}/vpc/`, tags: ["network"] }),
  aws({ id: "aws-transit-gateway", name: "Transit Gateway", category: "networking", iconSlug: "amazonwebservices", description: "Connect VPCs and on-prem networks.", docsUrl: `${AWS_DOCS}/transit-gateway/`, tags: ["vpc"] }),
  aws({ id: "aws-direct-connect", name: "Direct Connect", category: "networking", iconSlug: "amazonwebservices", description: "Dedicated network to AWS.", docsUrl: `${AWS_DOCS}/directconnect/`, tags: ["dx", "hybrid"] }),
  aws({ id: "aws-privatelink", name: "PrivateLink", category: "networking", iconSlug: "amazonwebservices", description: "Private connectivity between VPCs and services.", docsUrl: `${AWS_DOCS}/vpc/latest/privatelink/`, tags: ["vpc"] }),
  aws({ id: "aws-app-mesh", name: "App Mesh", category: "networking", iconSlug: "amazonwebservices", description: "Service mesh based on Envoy.", docsUrl: `${AWS_DOCS}/app-mesh/`, tags: ["envoy", "mesh"] }),
  aws({ id: "aws-alb", name: "Application Load Balancer", category: "loadbalancer", iconSlug: "amazonwebservices", description: "HTTP/HTTPS L7 load balancer.", docsUrl: `${AWS_DOCS}/elasticloadbalancing/`, tags: ["l7", "http"] }),
  aws({ id: "aws-nlb", name: "Network Load Balancer", category: "loadbalancer", iconSlug: "amazonwebservices", description: "TCP/UDP L4 load balancer.", docsUrl: `${AWS_DOCS}/elasticloadbalancing/`, tags: ["l4", "tcp"] }),
  aws({ id: "aws-route53", name: "Route 53", category: "dns", iconSlug: "amazonroute53", description: "Scalable DNS + domain registration.", docsUrl: `${AWS_DOCS}/route53/`, tags: ["dns"] }),

  // ── Auth / IAM / Security / KMS (12) ─────────────────────────────────────
  aws({ id: "aws-cognito", name: "Amazon Cognito", category: "auth", iconSlug: "amazoncognito", description: "User sign-up, sign-in, OAuth, SAML.", docsUrl: `${AWS_DOCS}/cognito/`, tags: ["oauth", "user-pool"] }),
  aws({ id: "aws-iam", name: "AWS IAM", category: "iam", iconSlug: "amazonwebservices", description: "Identity and access management.", docsUrl: `${AWS_DOCS}/iam/`, tags: ["iam"] }),
  aws({ id: "aws-iam-identity-center", name: "IAM Identity Center (SSO)", category: "iam", iconSlug: "amazonwebservices", description: "Centralized workforce SSO.", docsUrl: `${AWS_DOCS}/singlesignon/`, tags: ["sso"] }),
  aws({ id: "aws-kms", name: "AWS KMS", category: "kms", iconSlug: "amazonwebservices", description: "Managed encryption keys.", docsUrl: `${AWS_DOCS}/kms/`, tags: ["encryption", "keys"] }),
  aws({ id: "aws-secrets-manager", name: "Secrets Manager", category: "kms", iconSlug: "amazonwebservices", description: "Rotate and retrieve secrets.", docsUrl: `${AWS_DOCS}/secretsmanager/`, tags: ["secrets"] }),
  aws({ id: "aws-acm", name: "Certificate Manager (ACM)", category: "kms", iconSlug: "amazonwebservices", description: "Provision and manage TLS certificates.", docsUrl: `${AWS_DOCS}/acm/`, tags: ["tls", "certs"] }),
  aws({ id: "aws-waf", name: "AWS WAF", category: "security", iconSlug: "amazonwebservices", description: "Web application firewall.", docsUrl: `${AWS_DOCS}/waf/`, tags: ["waf"] }),
  aws({ id: "aws-shield", name: "AWS Shield", category: "security", iconSlug: "amazonwebservices", description: "DDoS protection.", docsUrl: `${AWS_DOCS}/shield/`, tags: ["ddos"] }),
  aws({ id: "aws-guardduty", name: "GuardDuty", category: "security", iconSlug: "amazonwebservices", description: "Threat detection.", docsUrl: `${AWS_DOCS}/guardduty/`, tags: ["threat"] }),
  aws({ id: "aws-inspector", name: "Inspector", category: "security", iconSlug: "amazonwebservices", description: "Automated vulnerability scanning.", docsUrl: `${AWS_DOCS}/inspector/`, tags: ["vuln"] }),
  aws({ id: "aws-macie", name: "Macie", category: "security", iconSlug: "amazonwebservices", description: "Data security and privacy for S3.", docsUrl: `${AWS_DOCS}/macie/`, tags: ["pii", "data"] }),
  aws({ id: "aws-security-hub", name: "Security Hub", category: "security", iconSlug: "amazonwebservices", description: "Unified security posture.", docsUrl: `${AWS_DOCS}/securityhub/`, tags: ["posture"] }),

  // ── ML / AI (12) ─────────────────────────────────────────────────────────
  aws({ id: "aws-sagemaker", name: "SageMaker", category: "ml-ai", iconSlug: "amazonwebservices", description: "Build, train, deploy ML models.", docsUrl: `${AWS_DOCS}/sagemaker/`, tags: ["ml", "training"] }),
  aws({ id: "aws-bedrock", name: "Bedrock", category: "ml-ai", iconSlug: "amazonwebservices", description: "Foundation models as a service.", docsUrl: `${AWS_DOCS}/bedrock/`, tags: ["llm", "genai"] }),
  aws({ id: "aws-comprehend", name: "Comprehend", category: "ml-ai", iconSlug: "amazonwebservices", description: "Natural language processing.", docsUrl: `${AWS_DOCS}/comprehend/`, tags: ["nlp"] }),
  aws({ id: "aws-rekognition", name: "Rekognition", category: "ml-ai", iconSlug: "amazonwebservices", description: "Image and video analysis.", docsUrl: `${AWS_DOCS}/rekognition/`, tags: ["vision"] }),
  aws({ id: "aws-polly", name: "Polly", category: "ml-ai", iconSlug: "amazonwebservices", description: "Text-to-speech.", docsUrl: `${AWS_DOCS}/polly/`, tags: ["tts"] }),
  aws({ id: "aws-transcribe", name: "Transcribe", category: "ml-ai", iconSlug: "amazonwebservices", description: "Speech-to-text.", docsUrl: `${AWS_DOCS}/transcribe/`, tags: ["asr"] }),
  aws({ id: "aws-translate", name: "Translate", category: "ml-ai", iconSlug: "amazonwebservices", description: "Neural machine translation.", docsUrl: `${AWS_DOCS}/translate/`, tags: ["i18n"] }),
  aws({ id: "aws-personalize", name: "Personalize", category: "ml-ai", iconSlug: "amazonwebservices", description: "Real-time recommendations.", docsUrl: `${AWS_DOCS}/personalize/`, tags: ["recsys"] }),
  aws({ id: "aws-forecast", name: "Forecast", category: "ml-ai", iconSlug: "amazonwebservices", description: "Time-series forecasting.", docsUrl: `${AWS_DOCS}/forecast/`, tags: ["forecast"] }),
  aws({ id: "aws-lex", name: "Lex", category: "ml-ai", iconSlug: "amazonwebservices", description: "Conversational interfaces.", docsUrl: `${AWS_DOCS}/lex/`, tags: ["chatbot"] }),
  aws({ id: "aws-textract", name: "Textract", category: "ml-ai", iconSlug: "amazonwebservices", description: "Extract text + data from docs.", docsUrl: `${AWS_DOCS}/textract/`, tags: ["ocr"] }),
  aws({ id: "aws-kendra", name: "Kendra", category: "ml-ai", iconSlug: "amazonwebservices", description: "Enterprise search powered by ML.", docsUrl: `${AWS_DOCS}/kendra/`, tags: ["search"] }),

  // ── Analytics (9) ────────────────────────────────────────────────────────
  aws({ id: "aws-athena", name: "Athena", category: "analytics", iconSlug: "amazonwebservices", description: "Query S3 with SQL (Presto).", docsUrl: `${AWS_DOCS}/athena/`, tags: ["presto", "sql"] }),
  aws({ id: "aws-glue", name: "AWS Glue", category: "analytics", iconSlug: "amazonwebservices", description: "Serverless ETL + data catalog.", docsUrl: `${AWS_DOCS}/glue/`, tags: ["etl", "spark"] }),
  aws({ id: "aws-emr", name: "Amazon EMR", category: "analytics", iconSlug: "amazonwebservices", description: "Managed Spark/Hadoop/Hive cluster.", docsUrl: `${AWS_DOCS}/emr/`, tags: ["spark", "hadoop"] }),
  aws({ id: "aws-redshift", name: "Redshift", category: "analytics", iconSlug: "amazonredshift", description: "Cloud data warehouse.", docsUrl: `${AWS_DOCS}/redshift/`, tags: ["dwh", "olap"] }),
  aws({ id: "aws-quicksight", name: "QuickSight", category: "analytics", iconSlug: "amazonwebservices", description: "Cloud business intelligence.", docsUrl: `${AWS_DOCS}/quicksight/`, tags: ["bi", "dashboards"] }),
  aws({ id: "aws-lake-formation", name: "Lake Formation", category: "analytics", iconSlug: "amazonwebservices", description: "Build secure data lakes.", docsUrl: `${AWS_DOCS}/lake-formation/`, tags: ["datalake"] }),
  aws({ id: "aws-opensearch", name: "OpenSearch Service", category: "analytics", iconSlug: "opensearch", description: "Search + log analytics (Elastic fork).", docsUrl: `${AWS_DOCS}/opensearch-service/`, tags: ["elasticsearch", "search"] }),
  aws({ id: "aws-data-pipeline", name: "Data Pipeline", category: "analytics", iconSlug: "amazonwebservices", description: "Process and move data.", docsUrl: `${AWS_DOCS}/datapipeline/`, tags: ["etl"] }),
  aws({ id: "aws-appflow", name: "AppFlow", category: "analytics", iconSlug: "amazonwebservices", description: "SaaS data integration.", docsUrl: `${AWS_DOCS}/appflow/`, tags: ["saas", "etl"] }),

  // ── Observability (5) ────────────────────────────────────────────────────
  aws({ id: "aws-cloudwatch", name: "CloudWatch", category: "observability", iconSlug: "amazoncloudwatch", description: "Metrics, logs, alarms.", docsUrl: `${AWS_DOCS}/cloudwatch/`, tags: ["metrics", "logs"] }),
  aws({ id: "aws-xray", name: "X-Ray", category: "observability", iconSlug: "amazonwebservices", description: "Distributed tracing.", docsUrl: `${AWS_DOCS}/xray/`, tags: ["tracing"] }),
  aws({ id: "aws-cloudtrail", name: "CloudTrail", category: "observability", iconSlug: "amazonwebservices", description: "API audit log.", docsUrl: `${AWS_DOCS}/awscloudtrail/`, tags: ["audit"] }),
  aws({ id: "aws-config", name: "AWS Config", category: "observability", iconSlug: "amazonwebservices", description: "Resource configuration tracking.", docsUrl: `${AWS_DOCS}/config/`, tags: ["compliance"] }),
  aws({ id: "aws-managed-grafana", name: "Managed Grafana", category: "observability", iconSlug: "grafana", description: "Managed Grafana dashboards.", docsUrl: `${AWS_DOCS}/grafana/`, tags: ["dashboards"] }),

  // ── DevOps (8) ───────────────────────────────────────────────────────────
  aws({ id: "aws-codecommit", name: "CodeCommit", category: "devops", iconSlug: "amazonwebservices", description: "Managed Git repos.", docsUrl: `${AWS_DOCS}/codecommit/`, tags: ["git"] }),
  aws({ id: "aws-codebuild", name: "CodeBuild", category: "devops", iconSlug: "amazonwebservices", description: "Managed CI build service.", docsUrl: `${AWS_DOCS}/codebuild/`, tags: ["ci"] }),
  aws({ id: "aws-codedeploy", name: "CodeDeploy", category: "devops", iconSlug: "amazonwebservices", description: "Automated deployments.", docsUrl: `${AWS_DOCS}/codedeploy/`, tags: ["cd"] }),
  aws({ id: "aws-codepipeline", name: "CodePipeline", category: "devops", iconSlug: "amazonwebservices", description: "Continuous delivery pipeline.", docsUrl: `${AWS_DOCS}/codepipeline/`, tags: ["cicd"] }),
  aws({ id: "aws-codeartifact", name: "CodeArtifact", category: "devops", iconSlug: "amazonwebservices", description: "Software package repository.", docsUrl: `${AWS_DOCS}/codeartifact/`, tags: ["registry"] }),
  aws({ id: "aws-cloudformation", name: "CloudFormation", category: "devops", iconSlug: "amazonwebservices", description: "Infrastructure as code (YAML/JSON).", docsUrl: `${AWS_DOCS}/cloudformation/`, tags: ["iac"] }),
  aws({ id: "aws-cdk", name: "AWS CDK", category: "devops", iconSlug: "amazonwebservices", description: "Cloud development kit (TypeScript/Python/Go).", docsUrl: `${AWS_DOCS}/cdk/`, tags: ["iac", "typescript"] }),
  aws({ id: "aws-ecr", name: "Amazon ECR", category: "devops", iconSlug: "amazonwebservices", description: "Managed container registry.", docsUrl: `${AWS_DOCS}/ecr/`, tags: ["docker", "registry"] }),

  // ── Management (3) ───────────────────────────────────────────────────────
  aws({ id: "aws-systems-manager", name: "Systems Manager", category: "management", iconSlug: "amazonwebservices", description: "Operations dashboard + automation.", docsUrl: `${AWS_DOCS}/systems-manager/`, tags: ["ops"] }),
  aws({ id: "aws-organizations", name: "Organizations", category: "management", iconSlug: "amazonwebservices", description: "Multi-account management.", docsUrl: `${AWS_DOCS}/organizations/`, tags: ["multi-account"] }),
  aws({ id: "aws-control-tower", name: "Control Tower", category: "management", iconSlug: "amazonwebservices", description: "Set up + govern multi-account environment.", docsUrl: `${AWS_DOCS}/controltower/`, tags: ["governance"] }),

  // ── Migration (2) ────────────────────────────────────────────────────────
  aws({ id: "aws-dms", name: "Database Migration Service", category: "migration", iconSlug: "amazonwebservices", description: "Migrate databases with minimal downtime.", docsUrl: `${AWS_DOCS}/dms/`, tags: ["migration"] }),
  aws({ id: "aws-datasync", name: "DataSync", category: "migration", iconSlug: "amazonwebservices", description: "Online data transfer service.", docsUrl: `${AWS_DOCS}/datasync/`, tags: ["transfer"] }),

  // ── IoT (3) ──────────────────────────────────────────────────────────────
  aws({ id: "aws-iot-core", name: "IoT Core", category: "iot", iconSlug: "amazonwebservices", description: "MQTT broker + device management.", docsUrl: `${AWS_DOCS}/iot/`, tags: ["mqtt"] }),
  aws({ id: "aws-greengrass", name: "IoT Greengrass", category: "iot", iconSlug: "amazonwebservices", description: "Local compute + ML for IoT devices.", docsUrl: `${AWS_DOCS}/greengrass/`, tags: ["edge"] }),
  aws({ id: "aws-iot-analytics", name: "IoT Analytics", category: "iot", iconSlug: "amazonwebservices", description: "Analytics for IoT data.", docsUrl: `${AWS_DOCS}/iotanalytics/`, tags: ["timeseries"] }),

  // ── Media (3) ────────────────────────────────────────────────────────────
  aws({ id: "aws-mediaconvert", name: "Elemental MediaConvert", category: "media", iconSlug: "amazonwebservices", description: "File-based video transcoding.", docsUrl: `${AWS_DOCS}/mediaconvert/`, tags: ["transcode"] }),
  aws({ id: "aws-medialive", name: "Elemental MediaLive", category: "media", iconSlug: "amazonwebservices", description: "Live video processing.", docsUrl: `${AWS_DOCS}/medialive/`, tags: ["live"] }),
  aws({ id: "aws-mediapackage", name: "Elemental MediaPackage", category: "media", iconSlug: "amazonwebservices", description: "Video origin + just-in-time packaging.", docsUrl: `${AWS_DOCS}/mediapackage/`, tags: ["hls", "dash"] }),

  // ── Misc (3) ─────────────────────────────────────────────────────────────
  aws({ id: "aws-api-gateway", name: "API Gateway", category: "networking", iconSlug: "amazonapigateway", description: "Create, publish, secure APIs.", docsUrl: `${AWS_DOCS}/apigateway/`, tags: ["api"] }),
  aws({ id: "aws-appsync", name: "AppSync (GraphQL)", category: "networking", iconSlug: "graphql", description: "Managed GraphQL service.", docsUrl: `${AWS_DOCS}/appsync/`, tags: ["graphql"] }),
  aws({ id: "aws-amplify", name: "AWS Amplify", category: "devops", iconSlug: "awsamplify", description: "Build full-stack web/mobile apps.", docsUrl: `${AWS_DOCS}/amplify/`, tags: ["frontend"] }),
];

// ────────────────────────────────────────────────────────────────────────────
// GCP (top services)
// ────────────────────────────────────────────────────────────────────────────

const gcp = (s: Omit<CloudService, "cloud">): CloudService => ({ ...s, cloud: "gcp" });
const GCP_DOCS = "https://cloud.google.com";

const GCP_SERVICES: readonly CloudService[] = [
  // Compute / Container / Serverless
  gcp({ id: "gcp-compute-engine", name: "Compute Engine", category: "compute", iconSlug: "googlecloud", description: "Virtual machines on GCP.", docsUrl: `${GCP_DOCS}/compute`, tags: ["vm", "iaas"] }),
  gcp({ id: "gcp-gke", name: "Google Kubernetes Engine", category: "container", iconSlug: "googlecloud", description: "Managed Kubernetes.", docsUrl: `${GCP_DOCS}/kubernetes-engine`, tags: ["k8s"] }),
  gcp({ id: "gcp-cloud-run", name: "Cloud Run", category: "serverless", iconSlug: "googlecloud", description: "Serverless containers.", docsUrl: `${GCP_DOCS}/run`, tags: ["serverless", "container"] }),
  gcp({ id: "gcp-cloud-functions", name: "Cloud Functions", category: "serverless", iconSlug: "googlecloud", description: "Event-driven serverless functions.", docsUrl: `${GCP_DOCS}/functions`, tags: ["faas"] }),
  gcp({ id: "gcp-app-engine", name: "App Engine", category: "compute", iconSlug: "googlecloud", description: "Managed PaaS for web apps.", docsUrl: `${GCP_DOCS}/appengine`, tags: ["paas"] }),
  gcp({ id: "gcp-batch", name: "Batch", category: "compute", iconSlug: "googlecloud", description: "Batch job scheduler.", docsUrl: `${GCP_DOCS}/batch`, tags: ["batch"] }),
  gcp({ id: "gcp-cloud-run-jobs", name: "Cloud Run Jobs", category: "compute", iconSlug: "googlecloud", description: "Run containers to completion.", docsUrl: `${GCP_DOCS}/run/docs/create-jobs`, tags: ["jobs"] }),
  // Storage
  gcp({ id: "gcp-cloud-storage", name: "Cloud Storage", category: "storage", iconSlug: "googlecloud", description: "Object storage (GCS).", docsUrl: `${GCP_DOCS}/storage`, tags: ["object"] }),
  gcp({ id: "gcp-persistent-disk", name: "Persistent Disk", category: "storage", iconSlug: "googlecloud", description: "Block storage for VMs.", docsUrl: `${GCP_DOCS}/persistent-disk`, tags: ["block"] }),
  gcp({ id: "gcp-filestore", name: "Filestore", category: "storage", iconSlug: "googlecloud", description: "Managed NFS file storage.", docsUrl: `${GCP_DOCS}/filestore`, tags: ["nfs"] }),
  gcp({ id: "gcp-transfer-service", name: "Storage Transfer Service", category: "migration", iconSlug: "googlecloud", description: "Move data into GCS.", docsUrl: `${GCP_DOCS}/storage-transfer-service`, tags: ["transfer"] }),
  // Databases
  gcp({ id: "gcp-cloud-sql", name: "Cloud SQL", category: "database", iconSlug: "googlecloud", description: "Managed Postgres/MySQL/SQL Server.", docsUrl: `${GCP_DOCS}/sql`, tags: ["sql"] }),
  gcp({ id: "gcp-spanner", name: "Spanner", category: "database", iconSlug: "googlecloud", description: "Globally distributed, strongly consistent SQL.", docsUrl: `${GCP_DOCS}/spanner`, tags: ["global", "sql"] }),
  gcp({ id: "gcp-bigtable", name: "Bigtable", category: "database", iconSlug: "googlecloud", description: "Wide-column NoSQL for analytical workloads.", docsUrl: `${GCP_DOCS}/bigtable`, tags: ["nosql", "wide-column"] }),
  gcp({ id: "gcp-firestore", name: "Firestore", category: "database", iconSlug: "firebase", description: "Document database with realtime sync.", docsUrl: `${GCP_DOCS}/firestore`, tags: ["document", "realtime"] }),
  gcp({ id: "gcp-memorystore", name: "Memorystore", category: "cache", iconSlug: "googlecloud", description: "Managed Redis + Memcached.", docsUrl: `${GCP_DOCS}/memorystore`, tags: ["redis"] }),
  gcp({ id: "gcp-alloydb", name: "AlloyDB for PostgreSQL", category: "database", iconSlug: "googlecloud", description: "High-performance Postgres-compatible DB.", docsUrl: `${GCP_DOCS}/alloydb`, tags: ["postgres"] }),
  // Pub/Sub / Tasks / Workflow
  gcp({ id: "gcp-pubsub", name: "Pub/Sub", category: "event", iconSlug: "googlecloud", description: "Async messaging at scale.", docsUrl: `${GCP_DOCS}/pubsub`, tags: ["pubsub"] }),
  gcp({ id: "gcp-cloud-tasks", name: "Cloud Tasks", category: "queue", iconSlug: "googlecloud", description: "Async task execution.", docsUrl: `${GCP_DOCS}/tasks`, tags: ["queue"] }),
  gcp({ id: "gcp-cloud-scheduler", name: "Cloud Scheduler", category: "workflow", iconSlug: "googlecloud", description: "Managed cron.", docsUrl: `${GCP_DOCS}/scheduler`, tags: ["cron"] }),
  gcp({ id: "gcp-workflows", name: "Workflows", category: "workflow", iconSlug: "googlecloud", description: "Orchestrate Google Cloud + HTTP services.", docsUrl: `${GCP_DOCS}/workflows`, tags: ["orchestration"] }),
  gcp({ id: "gcp-eventarc", name: "Eventarc", category: "event", iconSlug: "googlecloud", description: "Event-driven service connector.", docsUrl: `${GCP_DOCS}/eventarc`, tags: ["events"] }),
  // Networking / CDN / DNS / LB
  gcp({ id: "gcp-load-balancing", name: "Cloud Load Balancing", category: "loadbalancer", iconSlug: "googlecloud", description: "Global HTTP(S)/TCP/UDP load balancer.", docsUrl: `${GCP_DOCS}/load-balancing`, tags: ["lb"] }),
  gcp({ id: "gcp-cdn", name: "Cloud CDN", category: "cdn", iconSlug: "googlecloud", description: "Global content delivery.", docsUrl: `${GCP_DOCS}/cdn`, tags: ["cdn"] }),
  gcp({ id: "gcp-dns", name: "Cloud DNS", category: "dns", iconSlug: "googlecloud", description: "Authoritative DNS hosting.", docsUrl: `${GCP_DOCS}/dns`, tags: ["dns"] }),
  gcp({ id: "gcp-vpc", name: "Virtual Private Cloud", category: "networking", iconSlug: "googlecloud", description: "Isolated virtual networks.", docsUrl: `${GCP_DOCS}/vpc`, tags: ["vpc"] }),
  gcp({ id: "gcp-interconnect", name: "Cloud Interconnect", category: "networking", iconSlug: "googlecloud", description: "Dedicated/partner connection to GCP.", docsUrl: `${GCP_DOCS}/network-connectivity/docs/interconnect`, tags: ["hybrid"] }),
  gcp({ id: "gcp-nat", name: "Cloud NAT", category: "networking", iconSlug: "googlecloud", description: "Managed NAT for outbound traffic.", docsUrl: `${GCP_DOCS}/nat`, tags: ["nat"] }),
  gcp({ id: "gcp-anthos-service-mesh", name: "Anthos Service Mesh", category: "networking", iconSlug: "googlecloud", description: "Managed Istio service mesh.", docsUrl: `${GCP_DOCS}/service-mesh`, tags: ["mesh", "istio"] }),
  // IAM / Security / KMS
  gcp({ id: "gcp-iam", name: "Cloud IAM", category: "iam", iconSlug: "googlecloud", description: "Identity and access management.", docsUrl: `${GCP_DOCS}/iam`, tags: ["iam"] }),
  gcp({ id: "gcp-kms", name: "Cloud KMS", category: "kms", iconSlug: "googlecloud", description: "Managed encryption keys.", docsUrl: `${GCP_DOCS}/kms`, tags: ["keys"] }),
  gcp({ id: "gcp-secret-manager", name: "Secret Manager", category: "kms", iconSlug: "googlecloud", description: "Store + access secrets.", docsUrl: `${GCP_DOCS}/secret-manager`, tags: ["secrets"] }),
  gcp({ id: "gcp-certificate-manager", name: "Certificate Manager", category: "kms", iconSlug: "googlecloud", description: "Manage TLS certificates.", docsUrl: `${GCP_DOCS}/certificate-manager`, tags: ["tls"] }),
  gcp({ id: "gcp-armor", name: "Cloud Armor", category: "security", iconSlug: "googlecloud", description: "DDoS + WAF protection.", docsUrl: `${GCP_DOCS}/armor`, tags: ["waf", "ddos"] }),
  gcp({ id: "gcp-recaptcha-enterprise", name: "reCAPTCHA Enterprise", category: "security", iconSlug: "googlecloud", description: "Bot + fraud protection.", docsUrl: `${GCP_DOCS}/recaptcha-enterprise`, tags: ["bot"] }),
  gcp({ id: "gcp-beyondcorp", name: "BeyondCorp Enterprise", category: "security", iconSlug: "googlecloud", description: "Zero-trust access.", docsUrl: `${GCP_DOCS}/beyondcorp-enterprise`, tags: ["zero-trust"] }),
  gcp({ id: "gcp-identity-platform", name: "Identity Platform", category: "auth", iconSlug: "firebase", description: "Customer identity (CIAM).", docsUrl: `${GCP_DOCS}/identity-platform`, tags: ["ciam"] }),
  // AI / ML
  gcp({ id: "gcp-vertex-ai", name: "Vertex AI", category: "ml-ai", iconSlug: "googlecloud", description: "Unified ML platform (training + serving).", docsUrl: `${GCP_DOCS}/vertex-ai`, tags: ["ml"] }),
  gcp({ id: "gcp-gemini-api", name: "Gemini API (AI Studio)", category: "ml-ai", iconSlug: "googlecloud", description: "Foundation model API.", docsUrl: `https://ai.google.dev/`, tags: ["llm"] }),
  gcp({ id: "gcp-automl", name: "AutoML", category: "ml-ai", iconSlug: "googlecloud", description: "No-code ML model training.", docsUrl: `${GCP_DOCS}/automl`, tags: ["automl"] }),
  gcp({ id: "gcp-speech-to-text", name: "Speech-to-Text", category: "ml-ai", iconSlug: "googlecloud", description: "Convert audio to text.", docsUrl: `${GCP_DOCS}/speech-to-text`, tags: ["asr"] }),
  gcp({ id: "gcp-text-to-speech", name: "Text-to-Speech", category: "ml-ai", iconSlug: "googlecloud", description: "Synthesize natural speech.", docsUrl: `${GCP_DOCS}/text-to-speech`, tags: ["tts"] }),
  gcp({ id: "gcp-vision-ai", name: "Vision AI", category: "ml-ai", iconSlug: "googlecloud", description: "Image analysis API.", docsUrl: `${GCP_DOCS}/vision`, tags: ["vision"] }),
  gcp({ id: "gcp-translation", name: "Translation", category: "ml-ai", iconSlug: "googlecloud", description: "Neural machine translation.", docsUrl: `${GCP_DOCS}/translate`, tags: ["i18n"] }),
  gcp({ id: "gcp-natural-language", name: "Natural Language AI", category: "ml-ai", iconSlug: "googlecloud", description: "Entity + sentiment + syntax.", docsUrl: `${GCP_DOCS}/natural-language`, tags: ["nlp"] }),
  gcp({ id: "gcp-dialogflow", name: "Dialogflow", category: "ml-ai", iconSlug: "googlecloud", description: "Conversational AI agents.", docsUrl: `${GCP_DOCS}/dialogflow`, tags: ["chatbot"] }),
  gcp({ id: "gcp-document-ai", name: "Document AI", category: "ml-ai", iconSlug: "googlecloud", description: "Extract structured data from documents.", docsUrl: `${GCP_DOCS}/document-ai`, tags: ["ocr"] }),
  // Analytics
  gcp({ id: "gcp-bigquery", name: "BigQuery", category: "analytics", iconSlug: "googlebigquery", description: "Serverless data warehouse.", docsUrl: `${GCP_DOCS}/bigquery`, tags: ["dwh", "olap"] }),
  gcp({ id: "gcp-dataflow", name: "Dataflow", category: "analytics", iconSlug: "googlecloud", description: "Stream + batch processing (Apache Beam).", docsUrl: `${GCP_DOCS}/dataflow`, tags: ["beam"] }),
  gcp({ id: "gcp-dataproc", name: "Dataproc", category: "analytics", iconSlug: "googlecloud", description: "Managed Spark + Hadoop.", docsUrl: `${GCP_DOCS}/dataproc`, tags: ["spark"] }),
  gcp({ id: "gcp-composer", name: "Cloud Composer", category: "analytics", iconSlug: "googlecloud", description: "Managed Apache Airflow.", docsUrl: `${GCP_DOCS}/composer`, tags: ["airflow"] }),
  gcp({ id: "gcp-data-catalog", name: "Data Catalog", category: "analytics", iconSlug: "googlecloud", description: "Metadata discovery.", docsUrl: `${GCP_DOCS}/data-catalog`, tags: ["catalog"] }),
  gcp({ id: "gcp-looker", name: "Looker", category: "analytics", iconSlug: "looker", description: "BI + embedded analytics.", docsUrl: `${GCP_DOCS}/looker`, tags: ["bi"] }),
  gcp({ id: "gcp-datastream", name: "Datastream", category: "analytics", iconSlug: "googlecloud", description: "Serverless CDC for DBs.", docsUrl: `${GCP_DOCS}/datastream`, tags: ["cdc"] }),
  // Observability
  gcp({ id: "gcp-cloud-logging", name: "Cloud Logging", category: "observability", iconSlug: "googlecloud", description: "Centralized log management.", docsUrl: `${GCP_DOCS}/logging`, tags: ["logs"] }),
  gcp({ id: "gcp-cloud-monitoring", name: "Cloud Monitoring", category: "observability", iconSlug: "googlecloud", description: "Metrics + alerting.", docsUrl: `${GCP_DOCS}/monitoring`, tags: ["metrics"] }),
  gcp({ id: "gcp-cloud-trace", name: "Cloud Trace", category: "observability", iconSlug: "googlecloud", description: "Distributed tracing.", docsUrl: `${GCP_DOCS}/trace`, tags: ["tracing"] }),
  gcp({ id: "gcp-error-reporting", name: "Error Reporting", category: "observability", iconSlug: "googlecloud", description: "Real-time exception tracking.", docsUrl: `${GCP_DOCS}/error-reporting`, tags: ["errors"] }),
  gcp({ id: "gcp-cloud-profiler", name: "Cloud Profiler", category: "observability", iconSlug: "googlecloud", description: "Continuous CPU + heap profiling.", docsUrl: `${GCP_DOCS}/profiler`, tags: ["profiler"] }),
  // DevOps
  gcp({ id: "gcp-cloud-build", name: "Cloud Build", category: "devops", iconSlug: "googlecloud", description: "Serverless CI/CD.", docsUrl: `${GCP_DOCS}/build`, tags: ["ci"] }),
  gcp({ id: "gcp-cloud-deploy", name: "Cloud Deploy", category: "devops", iconSlug: "googlecloud", description: "Continuous delivery for GKE + Run.", docsUrl: `${GCP_DOCS}/deploy`, tags: ["cd"] }),
  gcp({ id: "gcp-artifact-registry", name: "Artifact Registry", category: "devops", iconSlug: "googlecloud", description: "Container + package registry.", docsUrl: `${GCP_DOCS}/artifact-registry`, tags: ["registry"] }),
  gcp({ id: "gcp-source-repos", name: "Source Repositories", category: "devops", iconSlug: "googlecloud", description: "Hosted Git repos.", docsUrl: `${GCP_DOCS}/source-repositories`, tags: ["git"] }),
];

// ────────────────────────────────────────────────────────────────────────────
// Azure (top services)
// ────────────────────────────────────────────────────────────────────────────

const azure = (s: Omit<CloudService, "cloud">): CloudService => ({ ...s, cloud: "azure" });
const AZURE_DOCS = "https://learn.microsoft.com/azure";

const AZURE_SERVICES: readonly CloudService[] = [
  // Compute / Container / Serverless
  azure({ id: "azure-vm", name: "Virtual Machines", category: "compute", iconSlug: "microsoftazure", description: "Linux + Windows VMs.", docsUrl: `${AZURE_DOCS}/virtual-machines/`, tags: ["vm"] }),
  azure({ id: "azure-aks", name: "Azure Kubernetes Service", category: "container", iconSlug: "microsoftazure", description: "Managed Kubernetes.", docsUrl: `${AZURE_DOCS}/aks/`, tags: ["k8s"] }),
  azure({ id: "azure-aci", name: "Container Instances", category: "container", iconSlug: "microsoftazure", description: "Run containers without orchestration.", docsUrl: `${AZURE_DOCS}/container-instances/`, tags: ["container"] }),
  azure({ id: "azure-functions", name: "Azure Functions", category: "serverless", iconSlug: "microsoftazure", description: "Event-driven serverless functions.", docsUrl: `${AZURE_DOCS}/azure-functions/`, tags: ["faas"] }),
  azure({ id: "azure-app-service", name: "App Service", category: "compute", iconSlug: "microsoftazure", description: "Managed PaaS for web apps.", docsUrl: `${AZURE_DOCS}/app-service/`, tags: ["paas"] }),
  azure({ id: "azure-container-apps", name: "Container Apps", category: "serverless", iconSlug: "microsoftazure", description: "Serverless containers (KEDA + Dapr).", docsUrl: `${AZURE_DOCS}/container-apps/`, tags: ["serverless"] }),
  azure({ id: "azure-batch", name: "Azure Batch", category: "compute", iconSlug: "microsoftazure", description: "Large-scale parallel batch jobs.", docsUrl: `${AZURE_DOCS}/batch/`, tags: ["batch"] }),
  // Storage
  azure({ id: "azure-blob", name: "Blob Storage", category: "storage", iconSlug: "microsoftazure", description: "Object storage.", docsUrl: `${AZURE_DOCS}/storage/blobs/`, tags: ["object"] }),
  azure({ id: "azure-files", name: "Azure Files", category: "storage", iconSlug: "microsoftazure", description: "Managed file shares (SMB/NFS).", docsUrl: `${AZURE_DOCS}/storage/files/`, tags: ["smb", "nfs"] }),
  azure({ id: "azure-disks", name: "Managed Disks", category: "storage", iconSlug: "microsoftazure", description: "Block storage for VMs.", docsUrl: `${AZURE_DOCS}/virtual-machines/managed-disks-overview`, tags: ["block"] }),
  azure({ id: "azure-netapp-files", name: "NetApp Files", category: "storage", iconSlug: "microsoftazure", description: "Enterprise NFS/SMB file shares.", docsUrl: `${AZURE_DOCS}/azure-netapp-files/`, tags: ["enterprise"] }),
  azure({ id: "azure-data-box", name: "Data Box", category: "migration", iconSlug: "microsoftazure", description: "Petabyte-scale data transport.", docsUrl: `${AZURE_DOCS}/databox/`, tags: ["transfer"] }),
  // Databases
  azure({ id: "azure-sql-db", name: "Azure SQL Database", category: "database", iconSlug: "microsoftazure", description: "Managed SQL Server.", docsUrl: `${AZURE_DOCS}/azure-sql/database/`, tags: ["sql"] }),
  azure({ id: "azure-cosmos-db", name: "Cosmos DB", category: "database", iconSlug: "microsoftazure", description: "Globally distributed multi-model DB.", docsUrl: `${AZURE_DOCS}/cosmos-db/`, tags: ["nosql", "global"] }),
  azure({ id: "azure-postgres", name: "Database for PostgreSQL", category: "database", iconSlug: "postgresql", description: "Managed Postgres.", docsUrl: `${AZURE_DOCS}/postgresql/`, tags: ["postgres"] }),
  azure({ id: "azure-mysql", name: "Database for MySQL", category: "database", iconSlug: "mysql", description: "Managed MySQL.", docsUrl: `${AZURE_DOCS}/mysql/`, tags: ["mysql"] }),
  azure({ id: "azure-redis", name: "Cache for Redis", category: "cache", iconSlug: "redis", description: "Managed Redis.", docsUrl: `${AZURE_DOCS}/azure-cache-for-redis/`, tags: ["redis"] }),
  azure({ id: "azure-synapse-dedicated", name: "Synapse Dedicated SQL Pool", category: "analytics", iconSlug: "microsoftazure", description: "MPP data warehouse.", docsUrl: `${AZURE_DOCS}/synapse-analytics/sql-data-warehouse/`, tags: ["mpp"] }),
  azure({ id: "azure-table-storage", name: "Table Storage", category: "database", iconSlug: "microsoftazure", description: "NoSQL key-attribute store.", docsUrl: `${AZURE_DOCS}/storage/tables/`, tags: ["nosql"] }),
  // Messaging
  azure({ id: "azure-service-bus", name: "Service Bus", category: "queue", iconSlug: "microsoftazure", description: "Enterprise messaging broker.", docsUrl: `${AZURE_DOCS}/service-bus-messaging/`, tags: ["amqp"] }),
  azure({ id: "azure-event-grid", name: "Event Grid", category: "event", iconSlug: "microsoftazure", description: "Reactive event routing.", docsUrl: `${AZURE_DOCS}/event-grid/`, tags: ["events"] }),
  azure({ id: "azure-event-hubs", name: "Event Hubs", category: "stream", iconSlug: "microsoftazure", description: "Big-data streaming + Kafka-compatible.", docsUrl: `${AZURE_DOCS}/event-hubs/`, tags: ["kafka", "stream"] }),
  azure({ id: "azure-queue-storage", name: "Queue Storage", category: "queue", iconSlug: "microsoftazure", description: "Simple, durable message queues.", docsUrl: `${AZURE_DOCS}/storage/queues/`, tags: ["queue"] }),
  azure({ id: "azure-logic-apps", name: "Logic Apps", category: "workflow", iconSlug: "microsoftazure", description: "Visual workflow integrator.", docsUrl: `${AZURE_DOCS}/logic-apps/`, tags: ["integration"] }),
  azure({ id: "azure-durable-functions", name: "Durable Functions", category: "workflow", iconSlug: "microsoftazure", description: "Stateful serverless orchestration.", docsUrl: `${AZURE_DOCS}/azure-functions/durable/`, tags: ["orchestration"] }),
  // Networking / CDN / DNS / LB
  azure({ id: "azure-app-gateway", name: "Application Gateway", category: "loadbalancer", iconSlug: "microsoftazure", description: "L7 load balancer + WAF.", docsUrl: `${AZURE_DOCS}/application-gateway/`, tags: ["lb", "waf"] }),
  azure({ id: "azure-lb", name: "Load Balancer", category: "loadbalancer", iconSlug: "microsoftazure", description: "L4 load balancer.", docsUrl: `${AZURE_DOCS}/load-balancer/`, tags: ["l4"] }),
  azure({ id: "azure-front-door", name: "Front Door", category: "cdn", iconSlug: "microsoftazure", description: "Global CDN + WAF + LB.", docsUrl: `${AZURE_DOCS}/frontdoor/`, tags: ["cdn", "global"] }),
  azure({ id: "azure-cdn", name: "Azure CDN", category: "cdn", iconSlug: "microsoftazure", description: "Content delivery network.", docsUrl: `${AZURE_DOCS}/cdn/`, tags: ["cdn"] }),
  azure({ id: "azure-traffic-manager", name: "Traffic Manager", category: "dns", iconSlug: "microsoftazure", description: "DNS-based traffic routing.", docsUrl: `${AZURE_DOCS}/traffic-manager/`, tags: ["dns"] }),
  azure({ id: "azure-dns", name: "Azure DNS", category: "dns", iconSlug: "microsoftazure", description: "Authoritative DNS hosting.", docsUrl: `${AZURE_DOCS}/dns/`, tags: ["dns"] }),
  azure({ id: "azure-vnet", name: "Virtual Network (VNet)", category: "networking", iconSlug: "microsoftazure", description: "Isolated virtual networks.", docsUrl: `${AZURE_DOCS}/virtual-network/`, tags: ["vnet"] }),
  azure({ id: "azure-expressroute", name: "ExpressRoute", category: "networking", iconSlug: "microsoftazure", description: "Private connectivity to Azure.", docsUrl: `${AZURE_DOCS}/expressroute/`, tags: ["hybrid"] }),
  azure({ id: "azure-private-link", name: "Private Link", category: "networking", iconSlug: "microsoftazure", description: "Private access to Azure services.", docsUrl: `${AZURE_DOCS}/private-link/`, tags: ["vnet"] }),
  azure({ id: "azure-vpn-gateway", name: "VPN Gateway", category: "networking", iconSlug: "microsoftazure", description: "Site-to-site + point-to-site VPN.", docsUrl: `${AZURE_DOCS}/vpn-gateway/`, tags: ["vpn"] }),
  // Identity / Security
  azure({ id: "azure-entra-id", name: "Microsoft Entra ID (AD)", category: "iam", iconSlug: "microsoftazure", description: "Cloud identity + access management.", docsUrl: `${AZURE_DOCS}/active-directory/`, tags: ["iam"] }),
  azure({ id: "azure-key-vault", name: "Key Vault", category: "kms", iconSlug: "microsoftazure", description: "Secrets + keys + certificates.", docsUrl: `${AZURE_DOCS}/key-vault/`, tags: ["secrets", "keys"] }),
  azure({ id: "azure-managed-identity", name: "Managed Identities", category: "iam", iconSlug: "microsoftazure", description: "App identities without secrets.", docsUrl: `${AZURE_DOCS}/active-directory/managed-identities-azure-resources/`, tags: ["identity"] }),
  azure({ id: "azure-ad-b2c", name: "Entra External ID (B2C)", category: "auth", iconSlug: "microsoftazure", description: "Customer identity (CIAM).", docsUrl: `${AZURE_DOCS}/active-directory-b2c/`, tags: ["ciam"] }),
  azure({ id: "azure-defender", name: "Defender for Cloud", category: "security", iconSlug: "microsoftazure", description: "Cloud security posture + workload protection.", docsUrl: `${AZURE_DOCS}/defender-for-cloud/`, tags: ["cspm"] }),
  azure({ id: "azure-sentinel", name: "Microsoft Sentinel", category: "security", iconSlug: "microsoftazure", description: "SIEM + SOAR.", docsUrl: `${AZURE_DOCS}/sentinel/`, tags: ["siem"] }),
  azure({ id: "azure-firewall", name: "Azure Firewall", category: "security", iconSlug: "microsoftazure", description: "Managed network firewall.", docsUrl: `${AZURE_DOCS}/firewall/`, tags: ["firewall"] }),
  azure({ id: "azure-ddos-protection", name: "DDoS Protection", category: "security", iconSlug: "microsoftazure", description: "DDoS attack mitigation.", docsUrl: `${AZURE_DOCS}/ddos-protection/`, tags: ["ddos"] }),
  azure({ id: "azure-app-insights", name: "Application Insights", category: "observability", iconSlug: "microsoftazure", description: "APM for live apps.", docsUrl: `${AZURE_DOCS}/azure-monitor/app/`, tags: ["apm"] }),
  // ML / AI
  azure({ id: "azure-openai", name: "Azure OpenAI Service", category: "ml-ai", iconSlug: "microsoftazure", description: "OpenAI models on Azure.", docsUrl: `${AZURE_DOCS}/ai-services/openai/`, tags: ["llm", "gpt"] }),
  azure({ id: "azure-ai-services", name: "AI Services (Cognitive)", category: "ml-ai", iconSlug: "microsoftazure", description: "Pre-built AI APIs (Vision, Speech, Language).", docsUrl: `${AZURE_DOCS}/ai-services/`, tags: ["cognitive"] }),
  azure({ id: "azure-ml", name: "Machine Learning", category: "ml-ai", iconSlug: "microsoftazure", description: "Build, train, deploy ML models.", docsUrl: `${AZURE_DOCS}/machine-learning/`, tags: ["ml"] }),
  azure({ id: "azure-bot-service", name: "Bot Service", category: "ml-ai", iconSlug: "microsoftazure", description: "Build conversational bots.", docsUrl: `${AZURE_DOCS}/bot-service/`, tags: ["bot"] }),
  azure({ id: "azure-form-recognizer", name: "Document Intelligence", category: "ml-ai", iconSlug: "microsoftazure", description: "Extract data from documents.", docsUrl: `${AZURE_DOCS}/ai-services/document-intelligence/`, tags: ["ocr"] }),
  azure({ id: "azure-cognitive-search", name: "AI Search", category: "ml-ai", iconSlug: "microsoftazure", description: "Cloud search with AI enrichment.", docsUrl: `${AZURE_DOCS}/search/`, tags: ["search"] }),
  // Analytics
  azure({ id: "azure-synapse", name: "Synapse Analytics", category: "analytics", iconSlug: "microsoftazure", description: "Unified analytics platform.", docsUrl: `${AZURE_DOCS}/synapse-analytics/`, tags: ["dwh"] }),
  azure({ id: "azure-data-factory", name: "Data Factory", category: "analytics", iconSlug: "microsoftazure", description: "Cloud ETL + data integration.", docsUrl: `${AZURE_DOCS}/data-factory/`, tags: ["etl"] }),
  azure({ id: "azure-databricks", name: "Azure Databricks", category: "analytics", iconSlug: "databricks", description: "Apache Spark analytics platform.", docsUrl: `${AZURE_DOCS}/databricks/`, tags: ["spark"] }),
  azure({ id: "azure-stream-analytics", name: "Stream Analytics", category: "analytics", iconSlug: "microsoftazure", description: "Real-time stream processing.", docsUrl: `${AZURE_DOCS}/stream-analytics/`, tags: ["stream"] }),
  azure({ id: "azure-data-explorer", name: "Data Explorer (Kusto)", category: "analytics", iconSlug: "microsoftazure", description: "Fast big-data analytics.", docsUrl: `${AZURE_DOCS}/data-explorer/`, tags: ["kusto"] }),
  azure({ id: "azure-purview", name: "Purview", category: "analytics", iconSlug: "microsoftazure", description: "Data governance + catalog.", docsUrl: `${AZURE_DOCS}/purview/`, tags: ["catalog"] }),
  azure({ id: "azure-power-bi-embedded", name: "Power BI Embedded", category: "analytics", iconSlug: "microsoftazure", description: "Embed BI visuals in apps.", docsUrl: `${AZURE_DOCS}/power-bi-embedded/`, tags: ["bi"] }),
  // Observability + DevOps
  azure({ id: "azure-monitor", name: "Azure Monitor", category: "observability", iconSlug: "microsoftazure", description: "Metrics + logs + alerts.", docsUrl: `${AZURE_DOCS}/azure-monitor/`, tags: ["metrics", "logs"] }),
  azure({ id: "azure-log-analytics", name: "Log Analytics", category: "observability", iconSlug: "microsoftazure", description: "Query log + telemetry.", docsUrl: `${AZURE_DOCS}/azure-monitor/logs/`, tags: ["logs"] }),
  azure({ id: "azure-network-watcher", name: "Network Watcher", category: "observability", iconSlug: "microsoftazure", description: "Network monitoring + diagnostics.", docsUrl: `${AZURE_DOCS}/network-watcher/`, tags: ["network"] }),
  azure({ id: "azure-devops", name: "Azure DevOps", category: "devops", iconSlug: "azuredevops", description: "Pipelines + Repos + Boards + Artifacts.", docsUrl: `${AZURE_DOCS}/devops/`, tags: ["cicd"] }),
  azure({ id: "azure-pipelines", name: "Pipelines", category: "devops", iconSlug: "azurepipelines", description: "Cloud CI/CD.", docsUrl: `${AZURE_DOCS}/devops/pipelines/`, tags: ["ci"] }),
  azure({ id: "azure-container-registry", name: "Container Registry", category: "devops", iconSlug: "microsoftazure", description: "Managed Docker registry.", docsUrl: `${AZURE_DOCS}/container-registry/`, tags: ["docker"] }),
  azure({ id: "azure-bicep", name: "Bicep / ARM", category: "devops", iconSlug: "microsoftazure", description: "Infrastructure-as-code for Azure.", docsUrl: `${AZURE_DOCS}/azure-resource-manager/bicep/`, tags: ["iac"] }),
];

// Total exported catalog
export const CLOUD_SERVICES_CATALOG: readonly CloudService[] = [
  ...AWS_SERVICES,
  ...GCP_SERVICES,
  ...AZURE_SERVICES,
];

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getCloudService(id: string): CloudService | undefined {
  return CLOUD_SERVICES_CATALOG.find((s) => s.id === id);
}

export function servicesByCloud(cloud: CloudServiceProvider): CloudService[] {
  return CLOUD_SERVICES_CATALOG.filter((s) => s.cloud === cloud);
}

export function servicesByCategory(category: CloudServiceCategory): CloudService[] {
  return CLOUD_SERVICES_CATALOG.filter((s) => s.category === category);
}

export function searchServices(query: string, opts?: {
  cloud?: CloudServiceProvider;
  category?: CloudServiceCategory;
  limit?: number;
}): CloudService[] {
  const q = query.toLowerCase().trim();
  const limit = opts?.limit ?? 50;
  const matches = CLOUD_SERVICES_CATALOG.filter((s) => {
    if (opts?.cloud && s.cloud !== opts.cloud) return false;
    if (opts?.category && s.category !== opts.category) return false;
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      (s.tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
    );
  });
  return matches.slice(0, limit);
}
