// Cloud provider tagging system — used by variants to indicate which cloud
// provider hosts the service (vs self-hosted). Drives icon swap, IaC export,
// and cost estimation in later phases.

export const CLOUD_PROVIDERS = ["self-hosted", "aws", "gcp", "azure", "cloudflare"] as const;
export type CloudProvider = typeof CLOUD_PROVIDERS[number];

export const CLOUD_DISPLAY_NAMES: Record<CloudProvider, string> = {
  "self-hosted": "Self-Hosted",
  aws: "AWS",
  gcp: "Google Cloud",
  azure: "Microsoft Azure",
  cloudflare: "Cloudflare",
};

// simpleicons.org slugs for cloud-provider branded icons.
// Used in node-card.tsx when variant.cloudProvider != "self-hosted".
export const CLOUD_ICON_SLUGS: Record<CloudProvider, string> = {
  "self-hosted": "ubuntu",
  aws: "amazonwebservices",
  gcp: "googlecloud",
  azure: "microsoftazure",
  cloudflare: "cloudflare",
};

// Region lists per cloud (top regions only — extend as needed).
export const AWS_REGIONS = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "eu-west-1", "eu-west-2", "eu-central-1",
  "ap-southeast-1", "ap-southeast-2", "ap-northeast-1",
] as const;

export const GCP_REGIONS = [
  "us-central1", "us-east1", "us-west1",
  "europe-west1", "europe-west2",
  "asia-southeast1", "asia-northeast1",
] as const;

export const AZURE_REGIONS = [
  "eastus", "eastus2", "westus2", "westus3",
  "westeurope", "northeurope",
  "southeastasia", "japaneast",
] as const;
