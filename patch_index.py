with open('app/routes/dashboard/index.tsx', 'r') as f:
    content = f.read()

# 1. Add links export
content = content.replace(
    '''import { Responsive, useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";''',
    '''import type { LinksFunction } from "react-router";
import { Responsive, useContainerWidth } from "react-grid-layout";
import gridStyles from "react-grid-layout/css/styles.css?url";
import resizableStyles from "react-resizable/css/styles.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: gridStyles },
  { rel: "stylesheet", href: resizableStyles }
];'''
)

# 2. Rename localStorage
content = content.replace(
    'localStorage.getItem("interchat-dashboard-layouts")',
    'localStorage.getItem("interchat-dashboard-v2")'
)
content = content.replace(
    'localStorage.setItem("interchat-dashboard-layouts"',
    'localStorage.setItem("interchat-dashboard-v2"'
)

# 3. Add height: 100% back to Cards
content = content.replace(
    "style={{ width: '100%', display: 'flex'",
    "style={{ width: '100%', height: '100%', display: 'flex'"
)

with open('app/routes/dashboard/index.tsx', 'w') as f:
    f.write(content)
