const path = require('path')

const root = __dirname

module.exports = {
  apps: [
    {
      name: 'kpp-api',
      cwd: root,
      script: path.join('apps', 'api', 'dist', 'src', 'main.js'),
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
