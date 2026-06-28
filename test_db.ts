import { db } from "./app/db.server";
import { user } from "./drizzle/schema";
async function run() {
  const users = await db.select().from(user).limit(1);
  console.log(users);
  process.exit(0);
}
run();
