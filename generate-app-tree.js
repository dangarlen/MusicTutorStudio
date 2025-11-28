// generate-app-tree.js
// Node.js script to merge Vue Router routes with component file structure

const fs = require('fs')
const path = require('path')
const router = require('./src/router').default // adjust path if needed

// --- Helper: build component directory tree ---
function buildComponentTree(dir) {
  return fs.readdirSync(dir).map(file => {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    return stat.isDirectory()
      ? { name: file, children: buildComponentTree(fullPath) }
      : { name: file }
  })
}

// --- Helper: build route tree with component mapping ---
function buildRouteTree(routes) {
  return routes.map(route => {
    const node = {
      id: route.path,
      name: route.name || route.path,
      component: route.component?.name || route.component?.__file || null,
      children: route.children ? buildRouteTree(route.children) : []
    }
    return node
  })
}

// --- Build unified tree ---
function buildUnifiedTree() {
  const routeTree = buildRouteTree(router.options.routes)
  const componentTree = buildComponentTree(path.join(__dirname, 'src/components'))

  return [
    { name: 'Routes', children: routeTree },
    { name: 'Components', children: componentTree }
  ]
}

// --- Execute and output JSON ---
const unifiedTree = buildUnifiedTree()
fs.writeFileSync('app-tree.json', JSON.stringify(unifiedTree, null, 2))
console.log('Unified app tree written to app-tree.json')
