import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// This configures a request mocking server for Node.js (used in tests)
export const server = setupServer(...handlers);
