-- Skill Master Seed Data for OpenHR
-- Insert major technologies with logos and verified status

INSERT INTO Skill (id, name, slug, category, logoUrl, aliases, verified, createdAt, updatedAt) VALUES
  -- Frontend Technologies
  ('skill_react', 'React', 'react', 'Frontend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', '["ReactJS", "React.js"]', 1, datetime('now'), datetime('now')),
  ('skill_vue', 'Vue.js', 'vue', 'Frontend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg', '["Vue", "VueJS"]', 1, datetime('now'), datetime('now')),
  ('skill_angular', 'Angular', 'angular', 'Frontend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg', '["AngularJS"]', 1, datetime('now'), datetime('now')),
  ('skill_nextjs', 'Next.js', 'nextjs', 'Frontend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg', '["Next", "NextJS"]', 1, datetime('now'), datetime('now')),
  ('skill_svelte', 'Svelte', 'svelte', 'Frontend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg', '["SvelteJS"]', 1, datetime('now'), datetime('now')),
  
  -- Backend Technologies  
  ('skill_nodejs', 'Node.js', 'nodejs', 'Backend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', '["Node", "NodeJS"]', 1, datetime('now'), datetime('now')),
  ('skill_express', 'Express.js', 'express', 'Backend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg', '["Express", "ExpressJS"]', 1, datetime('now'), datetime('now')),
  ('skill_nestjs', 'NestJS', 'nestjs', 'Backend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-plain.svg', '["Nest", "Nest.js"]', 1, datetime('now'), datetime('now')),
  ('skill_fastify', 'Fastify', 'fastify', 'Backend', NULL, '[]', 1, datetime('now'), datetime('now')),
  
  -- Programming Languages
  ('skill_javascript', 'JavaScript', 'javascript', 'Language', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', '["JS", "ECMAScript"]', 1, datetime('now'), datetime('now')),
  ('skill_typescript', 'TypeScript', 'typescript', 'Language', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', '["TS"]', 1, datetime('now'), datetime('now')),
  ('skill_python', 'Python', 'python', 'Language', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', '[]', 1, datetime('now'), datetime('now')),
  ('skill_java', 'Java', 'java', 'Language', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg', '[]', 1, datetime('now'), datetime('now')),
  ('skill_csharp', 'C#', 'csharp', 'Language', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg', '["C Sharp", "CSharp"]', 1, datetime('now'), datetime('now')),
  ('skill_go', 'Go', 'go', 'Language', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg', '["Golang"]', 1, datetime('now'), datetime('now')),
  ('skill_rust', 'Rust', 'rust', 'Language', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg', '[]', 1, datetime('now'), datetime('now')),
  ('skill_php', 'PHP', 'php', 'Language', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg', '[]', 1, datetime('now'), datetime('now')),
  
  -- Databases
  ('skill_mysql', 'MySQL', 'mysql', 'Database', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg', '[]', 1, datetime('now'), datetime('now')),
  ('skill_postgresql', 'PostgreSQL', 'postgresql', 'Database', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', '["Postgres"]', 1, datetime('now'), datetime('now')),
  ('skill_mongodb', 'MongoDB', 'mongodb', 'Database', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg', '["Mongo"]', 1, datetime('now'), datetime('now')),
  ('skill_redis', 'Redis', 'redis', 'Database', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg', '[]', 1, datetime('now'), datetime('now')),
  ('skill_sqlite', 'SQLite', 'sqlite', 'Database', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg', '[]', 1, datetime('now'), datetime('now')),
  
  -- Cloud & DevOps
  ('skill_aws', 'AWS', 'aws', 'Cloud', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg', '["Amazon Web Services"]', 1, datetime('now'), datetime('now')),
  ('skill_gcp', 'Google Cloud', 'gcp', 'Cloud', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg', '["GCP", "Google Cloud Platform"]', 1, datetime('now'), datetime('now')),
  ('skill_azure', 'Azure', 'azure', 'Cloud', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg', '["Microsoft Azure"]', 1, datetime('now'), datetime('now')),
  ('skill_docker', 'Docker', 'docker', 'DevOps', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', '[]', 1, datetime('now'), datetime('now')),
  ('skill_kubernetes', 'Kubernetes', 'kubernetes', 'DevOps', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg', '["K8s"]', 1, datetime('now'), datetime('now')),
  ('skill_terraform', 'Terraform', 'terraform', 'DevOps', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg', '[]', 1, datetime('now'), datetime('now')),
  
  -- Version Control & Tools
  ('skill_git', 'Git', 'git', 'Tool', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', '[]', 1, datetime('now'), datetime('now')),
  ('skill_github', 'GitHub', 'github', 'Tool', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg', '[]', 1, datetime('now'), datetime('now')),
  ('skill_gitlab', 'GitLab', 'gitlab', 'Tool', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg', '[]', 1, datetime('now'), datetime('now')),
  ('skill_vscode', 'VS Code', 'vscode', 'Tool', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg', '["Visual Studio Code"]', 1, datetime('now'), datetime('now')),
  
  -- CSS & Styling
  ('skill_css', 'CSS', 'css', 'Frontend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg', '["CSS3"]', 1, datetime('now'), datetime('now')),
  ('skill_html', 'HTML', 'html', 'Frontend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', '["HTML5"]', 1, datetime('now'), datetime('now')),
  ('skill_tailwind', 'Tailwind CSS', 'tailwind', 'Frontend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg', '["TailwindCSS"]', 1, datetime('now'), datetime('now')),
  ('skill_sass', 'Sass', 'sass', 'Frontend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg', '["SCSS"]', 1, datetime('now'), datetime('now')),
  
  -- Testing
  ('skill_jest', 'Jest', 'jest', 'Testing', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg', '[]', 1, datetime('now'), datetime('now')),
  ('skill_cypress', 'Cypress', 'cypress', 'Testing', NULL, '[]', 1, datetime('now'), datetime('now')),
  ('skill_playwright', 'Playwright', 'playwright', 'Testing', NULL, '[]', 1, datetime('now'), datetime('now'));