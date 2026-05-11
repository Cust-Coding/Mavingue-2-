export type AuditLog = {
  id: number;
  actorUserId?: number | null;
  actorNome: string;
  actorRole?: string | null;
  actorScope?: "CLIENTE" | "EQUIPA" | "SISTEMA" | string | null;
  action: string;
  entityType?: string | null;
  entityId?: number | null;
  description: string;
  createdAt?: string | null;
};
