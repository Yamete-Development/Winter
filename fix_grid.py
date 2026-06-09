import re

with open('app/routes/dashboard/index.tsx', 'r') as f:
    content = f.read()

# Replace imports
content = content.replace(
    'import { Responsive, useContainerWidth } from "react-grid-layout";',
    'import { Responsive, WidthProvider } from "react-grid-layout/legacy";'
)

# Replace GridTabContent definition
content = re.sub(
    r'const GridTabContent = .*?;\n};',
    'const ResponsiveGridLayout = WidthProvider(Responsive);',
    content,
    flags=re.DOTALL
)

# Replace <GridTabContent ...> tags with ResponsiveGridLayout
content = re.sub(
    r'<GridTabContent layout=\{layouts\.(.*?)\} onLayoutChange=\{\(l: any, allLayouts: any\) => handleLayoutChange\(\'\1\', l, allLayouts\)\}>',
    r'''<ResponsiveGridLayout
                    className="layout"
                    layouts={layouts.\1}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    rowHeight={30}
                    onLayoutChange={(l, allLayouts) => handleLayoutChange('\1', l, allLayouts)}
                    draggableHandle=".drag-handle"
                    containerPadding={[0, 8]}
                  >''',
    content
)

content = content.replace('</GridTabContent>', '</ResponsiveGridLayout>')

# Optional: remove height: '100%' from cards so they don't stretch unnaturally if the grid row is too tall, 
# or just reduce the h values in the default layout so they start smaller.
content = content.replace(
    "h: 18, minW: 5, minH: 12",
    "h: 14, minW: 5, minH: 10"
)

# Let's completely remove height: '100%' from the inline style of the Cards
content = content.replace("style={{ width: '100%', height: '100%', display: 'flex'", "style={{ width: '100%', display: 'flex'")

with open('app/routes/dashboard/index.tsx', 'w') as f:
    f.write(content)
