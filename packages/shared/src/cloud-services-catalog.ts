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

// Total exported catalog
export const CLOUD_SERVICES_CATALOG: readonly CloudService[] = AWS_SERVICES;

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
