[build]
  base = "."
  publish = "dist"
  command = "npm install && npx vite build"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
