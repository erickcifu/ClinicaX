import {
  findActiveRoles,
} from "./roles.repository.js";

export async function getActiveRoles() {
  return findActiveRoles();
}