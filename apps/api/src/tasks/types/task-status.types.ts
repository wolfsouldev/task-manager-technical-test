import type { statuses } from "../constants/task-status.constants";

export type Status = (typeof statuses)[number];
