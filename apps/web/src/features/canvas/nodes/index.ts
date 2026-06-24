import { UserNode } from "./user-node";
import { ApiNode } from "./api-node";
import { DatabaseNode } from "./database-node";
import { CacheNode } from "./cache-node";
import { QueueNode } from "./queue-node";
import { StorageNode } from "./storage-node";
import { CdnNode } from "./cdn-node";
import { LoadBalancerNode } from "./load-balancer-node";
import { WorkerNode } from "./worker-node";
import { ExternalNode } from "./external-node";

export const nodeTypes = {
  user: UserNode,
  api: ApiNode,
  database: DatabaseNode,
  cache: CacheNode,
  queue: QueueNode,
  storage: StorageNode,
  cdn: CdnNode,
  load_balancer: LoadBalancerNode,
  worker: WorkerNode,
  external: ExternalNode,
} as const;
