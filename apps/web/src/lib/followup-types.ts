export type WorkplaceTask = {
  id: string;
  title: string;
  description: string;
  url: string | null;
};
export type LegacyProposal = {
  id: string;
  incidentId: string;
  title: string;
  description: string;
  workspaceId: string;
  identityName: string;
  expiresAt: number;
};
export type { Proposal } from "./decisions";
export type Commitment = {
  title: string;
  owner: string;
  dueDate: string;
  ambiguousId: string;
  url: string;
};
export type WorkplaceStatus =
  | { status: "unconfigured"; message: string }
  | {
      status: "connected";
      workspaceId: string;
      identityName: string;
      tasks: WorkplaceTask[];
    };
