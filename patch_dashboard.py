import re

filepath = "/Users/chanakan5591/Developments/interchat-web/app/routes/dashboard/index.tsx"
with open(filepath, 'r') as f:
    content = f.read()

# Instead of injecting imports in the middle of the file, let's put them at the top.
# But putting them right before DashboardIndex is also syntactically valid in JS, though conventionally bad.
# Let's just put it at the top.
import_str = """
import { requireUser } from "../../services/auth.server";
import { db } from "../../db.server";
import { hub } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/index";
"""
content = import_str + content

content = content.replace("export default function DashboardIndex() {", """
export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const userHubs = await db.select().from(hub).where(eq(hub.ownerId, user.id));
  return { userHubs };
}

export default function DashboardIndex({ loaderData }: Route.ComponentProps) {
  const { userHubs } = loaderData;
""")

hubs_pattern = r'const hubs\s*=\s*\[[\s\S]*?(?=^\s*const \[configs, setConfigs\])'

hub_replacement = """  const hubs = userHubs.length > 0 ? userHubs.map(h => ({
    id: h.id,
    name: h.name,
    avatarUrl: h.iconUrl || "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=300&auto=format&fit=crop",
    bannerUrl: h.bannerUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    verified: h.verified,
    partnered: h.partnered,
    weeklyMsgs: h.weeklyMessageCount ? h.weeklyMessageCount.toString() : "0"
  })) : [];
"""
content = re.sub(hubs_pattern, hub_replacement, content, flags=re.MULTILINE)

content = content.replace('useState("gaming-bros")', 'useState(userHubs[0]?.id || "")')

with open(filepath, 'w') as f:
    f.write(content)
print("done")
