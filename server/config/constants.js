export const WEAK_AREA_THRESHOLD = process.env.WEAK_AREA_THRESHOLD
  ? Number(process.env.WEAK_AREA_THRESHOLD)
  : 60;

export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
};

export const SOURCE_TYPES = {
  FILE: "file",
  TEXT: "text",
};
