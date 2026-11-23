import crypto from "crypto";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  pricingId: number;
  avatarId: number;
  platform: string;
  subscriptionExpiresAt: string;
  createdAt: string;
  registration_link?: string;
};

type StoredUser = Omit<AuthUser, 'registration_link'> & {
  passwordHash: string;
  registration_link?: string;
};

type Session = {
  token: string;
  userId: number;
  createdAt: string;
};

type GlobalAuthStore = {
  users: StoredUser[];
  sessions: Session[];
};

const globalKey = "__MAITE_AUTH_STORE__" as const;
const globalStore = (globalThis as unknown as Record<string, unknown>)[globalKey] as GlobalAuthStore | undefined;

const store: GlobalAuthStore =
  globalStore ??
  {
    users: [],
    sessions: [],
  };

(globalThis as unknown as Record<string, unknown>)[globalKey] = store;

const users: StoredUser[] = store.users;
const sessions: Session[] = store.sessions;

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function addDaysIso(iso: string, days: number) {
  const ms = Date.parse(iso);
  const d = new Date(Number.isFinite(ms) ? ms : Date.now());
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function createUser(input: {
  id?: number; // Optional ID from backend
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  pricingId?: number;
  avatarId?: number;
  platform?: string;
  registration_link?: string;
}): AuthUser {
  const email = input.email.trim().toLowerCase();
  const phoneNumber = input.phoneNumber.trim();

  if (!phoneNumber) {
    throw new Error("INVALID_PHONE");
  }

  if (users.some((u) => u.email === email)) {
    throw new Error("EMAIL_TAKEN");
  }

  const createdAt = new Date().toISOString();
  const pricingId = typeof input.pricingId === "number" ? input.pricingId : 0;
  const avatarId = typeof input.avatarId === "number" ? input.avatarId : 0;
  const platform = typeof input.platform === "string" ? input.platform : "";
  const subscriptionExpiresAt = addDaysIso(createdAt, 30);

  // Use provided ID from backend or generate a new one
  const userId = input.id ?? (users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1);

  const newUser: StoredUser = {
    id: userId,
    name: input.name.trim(),
    email,
    phoneNumber,
    pricingId,
    avatarId,
    platform,
    subscriptionExpiresAt,
    createdAt,
    passwordHash: hashPassword(input.password),
    registration_link: input.registration_link,
  };

  users.push(newUser);

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    phoneNumber: newUser.phoneNumber,
    pricingId: newUser.pricingId,
    avatarId: newUser.avatarId,
    platform: newUser.platform,
    subscriptionExpiresAt: newUser.subscriptionExpiresAt,
    createdAt: newUser.createdAt,
    registration_link: newUser.registration_link,
  };
}

export function verifyUser(input: { email: string; password: string }): AuthUser {
  const email = input.email.trim().toLowerCase();
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error("INVALID_CREDENTIALS");

  const passwordHash = hashPassword(input.password);
  if (passwordHash !== user.passwordHash) throw new Error("INVALID_CREDENTIALS");

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    pricingId: user.pricingId,
    avatarId: user.avatarId,
    platform: user.platform,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
    createdAt: user.createdAt,
    registration_link: user.registration_link,
  };
}

export function createSession(userId: number) {
  const token = crypto.randomUUID();
  const session: Session = { token, userId, createdAt: new Date().toISOString() };
  sessions.push(session);
  return session;
}

export function getUserBySessionToken(token: string | undefined | null): AuthUser | null {
  if (!token) return null;

  const session = sessions.find((s) => s.token === token);
  if (!session) return null;

  const user = users.find((u) => u.id === session.userId);
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    pricingId: user.pricingId,
    avatarId: user.avatarId,
    platform: user.platform,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
    createdAt: user.createdAt,
    registration_link: user.registration_link,
  };
}

export function updateUserPlanBySessionToken(token: string | undefined | null, pricingId: number): AuthUser {
  if (!token) throw new Error("UNAUTHORIZED");
  const session = sessions.find((s) => s.token === token);
  if (!session) throw new Error("UNAUTHORIZED");

  const user = users.find((u) => u.id === session.userId);
  if (!user) throw new Error("UNAUTHORIZED");

  user.pricingId = pricingId;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    pricingId: user.pricingId,
    avatarId: user.avatarId,
    platform: user.platform,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
    createdAt: user.createdAt,
    registration_link: user.registration_link,
  };
}

export function renewSubscriptionBySessionToken(token: string | undefined | null, days: number): AuthUser {
  if (!token) throw new Error("UNAUTHORIZED");
  const session = sessions.find((s) => s.token === token);
  if (!session) throw new Error("UNAUTHORIZED");

  const user = users.find((u) => u.id === session.userId);
  if (!user) throw new Error("UNAUTHORIZED");

  const base = Date.parse(user.subscriptionExpiresAt);
  const now = Date.now();
  const from = Number.isFinite(base) && base > now ? user.subscriptionExpiresAt : new Date().toISOString();
  user.subscriptionExpiresAt = addDaysIso(from, days);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    pricingId: user.pricingId,
    avatarId: user.avatarId,
    platform: user.platform,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
    createdAt: user.createdAt,
    registration_link: user.registration_link,
  };
}

export function updateUserAvatarBySessionToken(token: string | undefined | null, avatarId: number): AuthUser {
  if (!token) throw new Error("UNAUTHORIZED");
  const session = sessions.find((s) => s.token === token);
  if (!session) throw new Error("UNAUTHORIZED");

  const user = users.find((u) => u.id === session.userId);
  if (!user) throw new Error("UNAUTHORIZED");

  user.avatarId = avatarId;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    pricingId: user.pricingId,
    avatarId: user.avatarId,
    platform: user.platform,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
    createdAt: user.createdAt,
    registration_link: user.registration_link,
  };
}

export function updateUserPricingBySessionToken(token: string | undefined | null, pricingId: number): AuthUser {
  if (!token) throw new Error("UNAUTHORIZED");
  const session = sessions.find((s) => s.token === token);
  if (!session) throw new Error("UNAUTHORIZED");

  const user = users.find((u) => u.id === session.userId);
  if (!user) throw new Error("UNAUTHORIZED");

  user.pricingId = pricingId;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    pricingId: user.pricingId,
    avatarId: user.avatarId,
    platform: user.platform,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
    createdAt: user.createdAt,
    registration_link: user.registration_link,
  };
}

export function updateUserPlatformBySessionToken(token: string | undefined | null, platform: string): AuthUser {
  if (!token) throw new Error("UNAUTHORIZED");
  const session = sessions.find((s) => s.token === token);
  if (!session) throw new Error("UNAUTHORIZED");

  const user = users.find((u) => u.id === session.userId);
  if (!user) throw new Error("UNAUTHORIZED");

  user.platform = platform;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    pricingId: user.pricingId,
    avatarId: user.avatarId,
    platform: user.platform,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
    createdAt: user.createdAt,
    registration_link: user.registration_link,
  };
}

export function deleteSession(token: string | undefined | null) {
  if (!token) return;
  for (let i = sessions.length - 1; i >= 0; i -= 1) {
    if (sessions[i].token === token) sessions.splice(i, 1);
  }
}
