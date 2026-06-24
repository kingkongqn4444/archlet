// Generator registry — maps format IDs to metadata and generator functions
import { generateDockerCompose } from "./docker-compose";
import { generateTerraformAws } from "./terraform-aws";
import { generateKubernetes } from "./kubernetes";
import { generateAnsible } from "./ansible";
import { generateRawJson } from "./raw-json";
import type { IacNode, IacEdge } from "./utils";

export type { IacNode, IacEdge };

export const GENERATORS = {
  "docker-compose": {
    label: "Docker Compose",
    ext: "yml",
    lang: "yaml",
    generate: (nodes: IacNode[], edges: IacEdge[]) => generateDockerCompose(nodes, edges),
  },
  "terraform": {
    label: "Terraform (AWS)",
    ext: "tf",
    lang: "hcl",
    generate: (nodes: IacNode[], edges: IacEdge[]) => generateTerraformAws(nodes, edges),
  },
  "kubernetes": {
    label: "Kubernetes manifests",
    ext: "yaml",
    lang: "yaml",
    generate: (nodes: IacNode[], edges: IacEdge[]) => generateKubernetes(nodes, edges),
  },
  "ansible": {
    label: "Ansible playbook",
    ext: "yml",
    lang: "yaml",
    generate: (nodes: IacNode[], edges: IacEdge[]) => generateAnsible(nodes, edges),
  },
  "json": {
    label: "Raw JSON",
    ext: "json",
    lang: "json",
    generate: (nodes: IacNode[], edges: IacEdge[]) => generateRawJson(nodes, edges),
  },
} as const;

export type GeneratorId = keyof typeof GENERATORS;
