import { z } from "zod";
import { AWS_REGIONS, GCP_REGIONS, AZURE_REGIONS } from "../cloud-providers";

// Region enums per cloud — reuse across variants.
export const awsRegion = z.enum(AWS_REGIONS).default("us-east-1");
export const gcpRegion = z.enum(GCP_REGIONS).default("us-central1");
export const azureRegion = z.enum(AZURE_REGIONS).default("eastus");

// AWS RDS instance classes (top tiers)
export const AWS_DB_CLASSES = [
  "db.t3.micro", "db.t3.small", "db.t3.medium",
  "db.m5.large", "db.m5.xlarge", "db.m5.2xlarge",
  "db.r5.large", "db.r5.xlarge", "db.r5.2xlarge",
] as const;

// GCP Cloud SQL machine types
export const GCP_SQL_CLASSES = [
  "db-f1-micro", "db-g1-small",
  "db-n1-standard-1", "db-n1-standard-2", "db-n1-standard-4",
  "db-n1-highmem-2", "db-n1-highmem-4", "db-n1-highmem-8",
] as const;

// Azure DB tiers
export const AZURE_DB_TIERS = ["Basic", "GeneralPurpose", "MemoryOptimized"] as const;
export const AZURE_DB_SKUS = ["GP_Gen5_2", "GP_Gen5_4", "GP_Gen5_8", "MO_Gen5_8", "MO_Gen5_16"] as const;
