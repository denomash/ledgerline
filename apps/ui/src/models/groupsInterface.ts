export interface GroupSummary {
  id: string;
  name: string;
  role: "MEMBER" | "ADMIN";
  joinedAt: string;
}

export interface GroupMember {
  id: string;
  role: "MEMBER" | "ADMIN";
  status: "ACTIVE" | "INVITED";
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
}
