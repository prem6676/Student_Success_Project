"""
Comprehensive Job Roles Dataset v2.0
Drop-in replacement for resume_analyzer/job_roles_dataset.py
Updated with 2024-2025 industry requirements, roadmaps, courses, and certifications.
"""

JOB_ROLES_DATASET = {

    "Software Engineer": {
        "description": "Expert-level engineer building distributed, scalable systems using modern stacks, clean architecture, and agile practices.",
        "required_skills": [
            "data structures", "algorithms", "dsa", "object oriented programming", "oop", "oops",
            "system design", "distributed systems", "software development life cycle", "sdlc",
            "debugging", "testing", "unit testing", "git", "version control", "code review",
            "design patterns", "solid principles", "clean code", "complexity analysis", "big o notation"
        ],
        "technical_skills": [
            "java", "python", "c++", "javascript", "typescript", "go", "golang", "rust", "kotlin",
            "spring boot", "django", "flask", "nodejs", "node.js", "express", "fastapi", "nestjs",
            "rest api", "restful", "graphql", "microservices", "grpc", "soap", "event-driven",
            "sql", "nosql", "mongodb", "postgresql", "postgres", "mysql", "sqlite", "redis",
            "kafka", "rabbitmq", "elasticsearch", "cassandra",
            "docker", "kubernetes", "k8s", "helm", "aws", "azure", "gcp",
            "ci/cd", "jenkins", "github actions", "gitlab ci", "terraform", "ansible",
            "prometheus", "grafana", "opentelemetry"
        ],
        "soft_skills": [
            "problem solving", "collaboration", "communication", "teamwork",
            "agile", "scrum", "kanban", "mentoring", "leadership",
            "stakeholder management", "adaptability", "critical thinking", "ownership"
        ],
        "experience_keywords": [
            "developed", "designed", "implemented", "built", "created", "optimized",
            "scaled", "deployed", "maintained", "refactored", "architected", "led",
            "spearheaded", "automated", "streamlined", "engineered", "modernized"
        ],
        "education_keywords": [
            "computer science", "software engineering", "cs", "cse", "btech", "mtech",
            "bachelor", "master", "engineering", "information technology", "it"
        ],
        "weight": {
            "technical_skills": 0.40,
            "required_skills": 0.30,
            "experience": 0.20,
            "soft_skills": 0.05,
            "education": 0.05
        },
        "roadmap": {
            "beginner": [
                "Master one programming language deeply (Python or Java recommended)",
                "Learn data structures: arrays, linked lists, trees, graphs, heaps",
                "Study core algorithms: sorting, searching, dynamic programming, greedy",
                "Practice on LeetCode (aim for 150+ problems across difficulty levels)",
                "Understand OOP principles and SOLID design principles",
                "Learn Git basics: branching, merging, rebasing, PRs"
            ],
            "intermediate": [
                "Design RESTful APIs and understand HTTP protocols deeply",
                "Learn at least one backend framework (Spring Boot, Django, or Express)",
                "Understand relational databases: SQL, indexing, transactions, normalization",
                "Study system design fundamentals: load balancing, caching, CDN, databases",
                "Explore Docker for containerization and basic Kubernetes concepts",
                "Learn CI/CD fundamentals with GitHub Actions or Jenkins"
            ],
            "advanced": [
                "Deep dive into distributed systems: CAP theorem, consensus algorithms, Raft/Paxos",
                "Study advanced system design: event sourcing, CQRS, saga pattern",
                "Master cloud platforms (AWS/GCP/Azure) and cloud-native patterns",
                "Learn observability: metrics, tracing, logging with Prometheus/Grafana",
                "Contribute to open-source projects to demonstrate expertise",
                "Build and deploy a production-grade microservices project"
            ]
        },
        "courses": [
            {"name": "CS50x – Introduction to Computer Science", "platform": "Harvard / edX", "url": "https://cs50.harvard.edu/x/", "level": "Beginner", "free": True},
            {"name": "Data Structures and Algorithms Specialization", "platform": "Coursera (UCSD)", "url": "https://www.coursera.org/specializations/data-structures-algorithms", "level": "Beginner-Intermediate", "free": False},
            {"name": "Grokking the System Design Interview", "platform": "DesignGurus", "url": "https://designgurus.io/course/grokking-the-system-design-interview", "level": "Intermediate", "free": False},
            {"name": "The Complete Node.js Developer Course", "platform": "Udemy", "url": "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/", "level": "Intermediate", "free": False},
            {"name": "Distributed Systems (MIT OpenCourseWare)", "platform": "MIT OCW", "url": "https://pdos.csail.mit.edu/6.824/", "level": "Advanced", "free": True},
            {"name": "Neetcode 150 - Blind 75 + More", "platform": "NeetCode.io", "url": "https://neetcode.io/roadmap", "level": "All Levels", "free": True}
        ],
        "certifications": [
            {"name": "AWS Certified Developer – Associate", "provider": "Amazon Web Services", "url": "https://aws.amazon.com/certification/certified-developer-associate/", "relevance": "High"},
            {"name": "Google Professional Cloud Developer", "provider": "Google Cloud", "url": "https://cloud.google.com/learn/certification/cloud-developer", "relevance": "High"},
            {"name": "Oracle Certified Professional Java SE", "provider": "Oracle", "url": "https://education.oracle.com/java-se-17-developer/pexam_1Z0-829", "relevance": "High"},
            {"name": "Certified Kubernetes Application Developer (CKAD)", "provider": "CNCF/Linux Foundation", "url": "https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad/", "relevance": "Medium"}
        ]
    },

    "Associate Software Engineer": {
        "description": "Entry-level software engineer building foundational skills in programming, CS fundamentals, and collaborative software development.",
        "required_skills": [
            "programming", "software development", "data structures", "algorithms", "dsa",
            "object oriented programming", "oop", "oops", "git", "version control",
            "debugging", "problem solving", "unit testing", "sdlc", "agile fundamentals"
        ],
        "technical_skills": [
            "java", "python", "c", "c++", "javascript", "html", "css", "sql", "mysql",
            "git", "github", "rest api", "json", "linux", "bash", "vscode",
            "docker", "postman", "npm", "jupyter notebook", "mongodb"
        ],
        "soft_skills": [
            "quick learner", "adaptability", "teamwork", "communication",
            "curiosity", "initiative", "time management", "analytical thinking"
        ],
        "experience_keywords": [
            "project", "internship", "coursework", "academic", "capstone", "contributed",
            "built", "developed", "implemented", "debugged", "presented", "collaborated"
        ],
        "education_keywords": [
            "computer science", "software engineering", "cs", "cse", "btech", "mtech",
            "bachelor", "master", "engineering", "information technology", "it", "bca", "mca"
        ],
        "weight": {
            "required_skills": 0.35,
            "technical_skills": 0.30,
            "education": 0.15,
            "experience": 0.15,
            "soft_skills": 0.05
        },
        "roadmap": {
            "beginner": [
                "Pick Python or Java as your primary language and master the basics",
                "Learn fundamental data structures: arrays, strings, stacks, queues, hashmaps",
                "Solve 50+ easy LeetCode problems to build algorithmic thinking",
                "Understand version control with Git: clone, commit, branch, push, pull request",
                "Build 2-3 personal projects (CRUD app, CLI tool, or mini web app)",
                "Learn HTML, CSS, and basic JavaScript if interested in web"
            ],
            "intermediate": [
                "Study OOP concepts: inheritance, polymorphism, encapsulation, abstraction",
                "Learn a web framework: Django (Python) or Spring Boot (Java)",
                "Understand SQL basics: SELECT, JOIN, GROUP BY, indexes",
                "Practice system design basics: client-server, REST API, databases",
                "Contribute to open-source projects on GitHub (beginner-friendly repos)",
                "Complete a capstone project and deploy it (Railway, Render, Vercel)"
            ],
            "advanced": [
                "Prepare for coding interviews: complete Blind 75 problem set",
                "Learn Docker and deploy your application in a container",
                "Understand CI/CD basics with GitHub Actions",
                "Study clean code principles and apply them in your projects",
                "Work on team projects to simulate real-world collaboration",
                "Build a portfolio website showcasing all projects with GitHub links"
            ]
        },
        "courses": [
            {"name": "Python for Everybody Specialization", "platform": "Coursera (University of Michigan)", "url": "https://www.coursera.org/specializations/python", "level": "Beginner", "free": False},
            {"name": "CS50x – Introduction to Computer Science", "platform": "Harvard / edX", "url": "https://cs50.harvard.edu/x/", "level": "Beginner", "free": True},
            {"name": "The Odin Project (Full Stack Web Dev)", "platform": "The Odin Project", "url": "https://www.theodinproject.com/", "level": "Beginner-Intermediate", "free": True},
            {"name": "Java Programming and Software Engineering Fundamentals", "platform": "Coursera (Duke)", "url": "https://www.coursera.org/specializations/java-programming", "level": "Beginner", "free": False},
            {"name": "100 Days of Code: Python Bootcamp", "platform": "Udemy (Angela Yu)", "url": "https://www.udemy.com/course/100-days-of-code/", "level": "Beginner", "free": False}
        ],
        "certifications": [
            {"name": "AWS Certified Cloud Practitioner", "provider": "Amazon Web Services", "url": "https://aws.amazon.com/certification/certified-cloud-practitioner/", "relevance": "Medium"},
            {"name": "Microsoft Azure Fundamentals (AZ-900)", "provider": "Microsoft", "url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/", "relevance": "Medium"},
            {"name": "Oracle Certified Foundations Associate – Java SE", "provider": "Oracle", "url": "https://education.oracle.com/java-foundations/pexam_1Z0-811", "relevance": "High"},
            {"name": "GitHub Foundations Certification", "provider": "GitHub", "url": "https://resources.github.com/learn/certifications/", "relevance": "Medium"}
        ]
    },

    "Data Analyst": {
        "description": "Data professional transforming raw data into actionable insights via SQL, statistical modeling, and business intelligence tools.",
        "required_skills": [
            "sql", "data analysis", "statistics", "statistical analysis", "data visualization",
            "excel", "reporting", "analytics", "business intelligence", "bi", "data mining",
            "exploratory data analysis", "eda", "quantitative analysis", "data cleaning"
        ],
        "technical_skills": [
            "sql", "mysql", "postgresql", "oracle", "sql server", "t-sql", "nosql",
            "python", "pandas", "numpy", "scipy", "matplotlib", "seaborn", "plotly",
            "excel", "advanced excel", "pivot tables", "vlookup", "power query", "macros",
            "tableau", "power bi", "powerbi", "dax", "looker", "google data studio",
            "r", "sas", "spss", "stata",
            "etl", "data cleaning", "data wrangling", "data profiling",
            "google analytics", "ga4", "snowflake", "bigquery", "dbt",
            "jupyter notebook", "anaconda", "apache airflow"
        ],
        "soft_skills": [
            "analytical thinking", "problem solving", "communication",
            "business acumen", "attention to detail", "critical thinking",
            "data storytelling", "stakeholder management", "presentation skills"
        ],
        "experience_keywords": [
            "analyzed", "visualized", "reported", "forecasted", "identified", "tracked",
            "measured", "monitored", "dashboard", "insights", "trends", "kpi",
            "automated", "optimized", "extracted", "data-driven", "summarized"
        ],
        "education_keywords": [
            "statistics", "mathematics", "data science", "analytics", "business analytics",
            "economics", "computer science", "information systems", "quantitative finance"
        ],
        "weight": {
            "technical_skills": 0.40,
            "required_skills": 0.30,
            "experience": 0.20,
            "soft_skills": 0.05,
            "education": 0.05
        },
        "roadmap": {
            "beginner": [
                "Learn SQL from basics to advanced: JOINs, subqueries, window functions, CTEs",
                "Master Excel: pivot tables, VLOOKUP, XLOOKUP, Power Query",
                "Study statistics fundamentals: mean, median, variance, distributions, hypothesis testing",
                "Learn Python basics with pandas and numpy for data manipulation",
                "Build a simple dashboard in Tableau Public or Power BI Desktop",
                "Complete a guided data analysis project (Kaggle datasets recommended)"
            ],
            "intermediate": [
                "Master Python visualization: matplotlib, seaborn, and plotly",
                "Learn advanced SQL: window functions, CTEs, query optimization",
                "Study A/B testing and experimental design for business decisions",
                "Build 3+ end-to-end data analysis projects with documented insights",
                "Learn Google Analytics 4 (GA4) for web analytics",
                "Get hands-on with cloud data warehouses: BigQuery or Snowflake"
            ],
            "advanced": [
                "Learn dbt for data transformation and analytics engineering",
                "Study predictive analytics and basic machine learning with scikit-learn",
                "Master DAX for Power BI or calculated fields in Tableau",
                "Build automated reporting pipelines with Apache Airflow",
                "Learn data storytelling: presenting insights to executive stakeholders",
                "Get certified in Tableau or Power BI to validate your expertise"
            ]
        },
        "courses": [
            {"name": "Google Data Analytics Certificate", "platform": "Coursera / Google", "url": "https://www.coursera.org/professional-certificates/google-data-analytics", "level": "Beginner", "free": False},
            {"name": "SQL for Data Science", "platform": "Coursera (UC Davis)", "url": "https://www.coursera.org/learn/sql-for-data-science", "level": "Beginner", "free": False},
            {"name": "Data Analysis with Python", "platform": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/data-analysis-with-python/", "level": "Beginner", "free": True},
            {"name": "Tableau Desktop Specialist Prep", "platform": "Tableau eLearning", "url": "https://www.tableau.com/learn/training", "level": "Intermediate", "free": True},
            {"name": "Statistics with Python Specialization", "platform": "Coursera (Michigan)", "url": "https://www.coursera.org/specializations/statistics-with-python", "level": "Intermediate", "free": False},
            {"name": "365 Data Science – Data Analyst Track", "platform": "365 Data Science", "url": "https://365datascience.com/career-tracks/data-analyst/", "level": "All Levels", "free": False}
        ],
        "certifications": [
            {"name": "Google Data Analytics Professional Certificate", "provider": "Google / Coursera", "url": "https://www.coursera.org/professional-certificates/google-data-analytics", "relevance": "High"},
            {"name": "Tableau Desktop Specialist", "provider": "Tableau / Salesforce", "url": "https://www.tableau.com/learn/certification/desktop-specialist", "relevance": "High"},
            {"name": "Microsoft Power BI Data Analyst (PL-300)", "provider": "Microsoft", "url": "https://learn.microsoft.com/en-us/credentials/certifications/power-bi-data-analyst-associate/", "relevance": "High"},
            {"name": "IBM Data Analyst Professional Certificate", "provider": "IBM / Coursera", "url": "https://www.coursera.org/professional-certificates/ibm-data-analyst", "relevance": "Medium"}
        ]
    },

    "Web Developer": {
        "description": "Creative and technical professional building responsive, performant web applications using modern frontend frameworks and backend integrations.",
        "required_skills": [
            "html", "css", "javascript", "responsive design", "mobile-first",
            "web development", "dom manipulation", "cross-browser compatibility",
            "web standards", "seo basics", "accessibility"
        ],
        "technical_skills": [
            "html", "html5", "css", "css3", "sass", "scss", "bootstrap", "tailwind",
            "javascript", "es6+", "typescript",
            "react", "next.js", "vue", "svelte",
            "jquery", "material ui", "chakra ui",
            "webpack", "vite", "npm", "yarn",
            "rest api", "fetch api", "axios",
            "git", "github", "php", "wordpress",
            "mysql", "mongodb", "firebase",
            "vercel", "netlify", "heroku", "github pages"
        ],
        "soft_skills": [
            "creativity", "attention to detail", "problem solving", "communication",
            "collaboration", "time management", "client interaction"
        ],
        "experience_keywords": [
            "website", "web page", "web application", "responsive", "interactive",
            "built", "designed", "deployed", "optimized", "integrated"
        ],
        "education_keywords": [
            "computer science", "web development", "software engineering", "multimedia",
            "information technology", "cs", "web design"
        ],
        "weight": {
            "technical_skills": 0.45,
            "required_skills": 0.25,
            "experience": 0.20,
            "soft_skills": 0.05,
            "education": 0.05
        },
        "roadmap": {
            "beginner": [
                "Learn HTML5 deeply: semantic elements, forms, accessibility basics",
                "Master CSS: box model, flexbox, grid, media queries, CSS variables",
                "Learn vanilla JavaScript: DOM, events, fetch API, local storage",
                "Build and deploy 3+ responsive static websites",
                "Learn Git and host projects on GitHub",
                "Study basic SEO: meta tags, structured data, page speed"
            ],
            "intermediate": [
                "Learn a JavaScript framework: React.js is industry standard",
                "Explore CSS frameworks: Tailwind CSS (highly recommended)",
                "Build dynamic websites with API integrations (weather, maps, etc.)",
                "Learn WordPress or other CMS for client projects",
                "Study web performance: lazy loading, image optimization, caching",
                "Understand hosting and deployment: Vercel, Netlify, Cloudflare Pages"
            ],
            "advanced": [
                "Learn Next.js for full-stack capabilities and SEO optimization",
                "Study Web Vitals and advanced performance optimization",
                "Explore e-commerce: Shopify, WooCommerce, or headless CMS",
                "Learn PHP and MySQL for dynamic server-side websites",
                "Build a complete web project with CMS, auth, and payment integration",
                "Study progressive web apps (PWAs) and offline-first strategies"
            ]
        },
        "courses": [
            {"name": "The Complete Web Developer Bootcamp", "platform": "Udemy (Colt Steele)", "url": "https://www.udemy.com/course/the-web-developer-bootcamp/", "level": "Beginner", "free": False},
            {"name": "Responsive Web Design Certification", "platform": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/2022/responsive-web-design/", "level": "Beginner", "free": True},
            {"name": "CSS – The Complete Guide", "platform": "Udemy (Academind)", "url": "https://www.udemy.com/course/css-the-complete-guide-incl-flexbox-grid-sass/", "level": "Beginner-Intermediate", "free": False},
            {"name": "The Odin Project (Web Dev Path)", "platform": "The Odin Project", "url": "https://www.theodinproject.com/", "level": "Beginner-Intermediate", "free": True},
            {"name": "JavaScript30 – 30 Day Vanilla JS Challenge", "platform": "Wes Bos", "url": "https://javascript30.com/", "level": "Beginner-Intermediate", "free": True}
        ],
        "certifications": [
            {"name": "freeCodeCamp Responsive Web Design Certification", "provider": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/2022/responsive-web-design/", "relevance": "Medium"},
            {"name": "Meta Front-End Developer Certificate", "provider": "Meta / Coursera", "url": "https://www.coursera.org/professional-certificates/meta-front-end-developer", "relevance": "High"}
        ]
    },

    "Frontend Developer": {
        "description": "Specialized frontend engineer crafting interactive UIs, component architectures, and optimized client-side performance using modern JS frameworks.",
        "required_skills": [
            "javascript", "typescript", "react", "html", "css", "responsive design",
            "state management", "component architecture", "spa", "dom manipulation",
            "browser compatibility", "accessibility", "wcag", "a11y", "semantic html"
        ],
        "technical_skills": [
            "javascript", "typescript", "es6+", "react", "react.js", "reactjs", "react hooks",
            "next.js", "nextjs", "vue", "vuejs", "angular", "svelte", "astro",
            "redux", "redux toolkit", "context api", "zustand", "mobx", "tanstack query", "react query",
            "html5", "css3", "sass", "scss", "tailwind", "tailwind css", "material ui", "chakra ui", "shadcn/ui",
            "styled-components", "emotion", "css modules",
            "webpack", "vite", "rollup", "babel",
            "jest", "react testing library", "cypress", "playwright", "vitest", "storybook",
            "rest api", "graphql", "apollo", "swr", "axios",
            "git", "github", "figma", "zeplin",
            "web performance", "core web vitals", "lighthouse", "lazy loading",
            "pwa", "service workers", "websockets"
        ],
        "soft_skills": [
            "ui/ux sensitivity", "attention to detail", "creativity", "problem solving",
            "collaboration", "design systems", "technical documentation", "cross-team communication"
        ],
        "experience_keywords": [
            "built", "developed", "implemented", "designed", "architected", "reusable",
            "component", "user interface", "responsive", "performance", "optimized",
            "translated designs", "deployed", "integrated", "pixel-perfect"
        ],
        "education_keywords": [
            "computer science", "software engineering", "web development",
            "information technology", "hci", "cs", "it"
        ],
        "weight": {
            "technical_skills": 0.45,
            "required_skills": 0.25,
            "experience": 0.20,
            "soft_skills": 0.05,
            "education": 0.05
        },
        "roadmap": {
            "beginner": [
                "Master HTML5 semantics: forms, accessibility, SEO-friendly markup",
                "Learn CSS deeply: flexbox, CSS grid, animations, custom properties",
                "Build strong JavaScript foundations: closures, promises, async/await, modules",
                "Study React fundamentals: JSX, components, props, state, hooks",
                "Build 3+ responsive web projects (portfolio, landing page, to-do app)",
                "Learn Git and deploy projects on Vercel or Netlify"
            ],
            "intermediate": [
                "Master TypeScript for type-safe React development",
                "Learn state management: Zustand or Redux Toolkit",
                "Study React performance: useMemo, useCallback, code splitting, lazy loading",
                "Learn testing with Jest and React Testing Library",
                "Build a real-world app with React + REST API integration",
                "Explore Next.js for SSR, SSG, and API routes"
            ],
            "advanced": [
                "Deep dive into Web Performance: Core Web Vitals, Lighthouse, bundle optimization",
                "Study accessibility (WCAG 2.2) and build accessible components",
                "Learn micro-frontend architecture and module federation",
                "Master design systems: build your own component library with Storybook",
                "Explore React Server Components and the Next.js App Router",
                "Study advanced patterns: compound components, render props, custom hooks library"
            ]
        },
        "courses": [
            {"name": "The Complete JavaScript Course 2025", "platform": "Udemy (Jonas Schmedtmann)", "url": "https://www.udemy.com/course/the-complete-javascript-course/", "level": "Beginner", "free": False},
            {"name": "React – The Complete Guide (Hooks, Next.js)", "platform": "Udemy (Maximilian S.)", "url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/", "level": "Beginner-Advanced", "free": False},
            {"name": "freeCodeCamp – Responsive Web Design", "platform": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/2022/responsive-web-design/", "level": "Beginner", "free": True},
            {"name": "Total TypeScript", "platform": "Total TypeScript", "url": "https://www.totaltypescript.com/", "level": "Intermediate-Advanced", "free": False},
            {"name": "Web.dev – Learn CSS", "platform": "Google Web.dev", "url": "https://web.dev/learn/css/", "level": "All Levels", "free": True}
        ],
        "certifications": [
            {"name": "Meta Front-End Developer Professional Certificate", "provider": "Meta / Coursera", "url": "https://www.coursera.org/professional-certificates/meta-front-end-developer", "relevance": "High"},
            {"name": "Google UX Design Certificate", "provider": "Google / Coursera", "url": "https://www.coursera.org/professional-certificates/google-ux-design", "relevance": "Medium"},
            {"name": "W3C Front-End Web Developer", "provider": "W3C / edX", "url": "https://www.edx.org/professional-certificate/w3cx-front-end-web-developer", "relevance": "Medium"}
        ]
    },

    "Backend Developer": {
        "description": "Server-side specialist architecting scalable APIs, managing database schemas, and ensuring high availability via cloud infrastructure and microservices.",
        "required_skills": [
            "backend", "rest api", "restful", "api design", "database management",
            "authentication", "authorization", "system design", "microservices",
            "distributed systems", "scalability", "security", "caching", "message queues"
        ],
        "technical_skills": [
            "nodejs", "node.js", "express", "nestjs", "fastify",
            "python", "django", "flask", "fastapi",
            "java", "spring", "spring boot", "hibernate",
            "golang", "go", "gin", "echo",
            "rest api", "graphql", "grpc", "webhooks",
            "sql", "postgresql", "mysql", "oracle",
            "mongodb", "redis", "cassandra", "dynamodb", "elasticsearch",
            "prisma", "typeorm", "sqlalchemy", "mongoose",
            "jwt", "oauth", "oauth2", "saml",
            "docker", "kubernetes", "aws", "azure", "gcp", "lambda", "serverless",
            "kafka", "rabbitmq", "sqs", "pubsub", "event-driven",
            "nginx", "load balancing", "rate limiting", "api gateway",
            "pytest", "junit", "jest", "mocha", "swagger", "openapi"
        ],
        "soft_skills": [
            "problem solving", "system design thinking", "reliability", "security mindset",
            "collaboration", "documentation", "code review", "mentorship"
        ],
        "experience_keywords": [
            "built", "designed", "architected", "deployed", "scaled", "secured",
            "api", "backend", "microservice", "database", "migrated", "automated",
            "integrated", "monitored", "troubleshot", "provisioned", "optimized"
        ],
        "education_keywords": [
            "computer science", "software engineering", "cs", "cse", "btech",
            "bachelor", "master", "engineering", "information technology"
        ],
        "weight": {
            "technical_skills": 0.40,
            "required_skills": 0.30,
            "experience": 0.20,
            "soft_skills": 0.05,
            "education": 0.05
        },
        "roadmap": {
            "beginner": [
                "Learn a backend language: Node.js (JavaScript) or Python recommended for beginners",
                "Understand HTTP deeply: methods, headers, status codes, request/response cycle",
                "Build your first REST API with Express.js or FastAPI",
                "Learn SQL: CRUD operations, JOINs, indexing, and basic optimization",
                "Understand authentication: session-based vs token-based (JWT)",
                "Deploy a simple API to a cloud platform (Railway, Render, or AWS EC2)"
            ],
            "intermediate": [
                "Build a full-featured REST API with auth, validation, and error handling",
                "Learn NoSQL with MongoDB or Redis for caching patterns",
                "Study API security: input validation, SQL injection, XSS, rate limiting",
                "Containerize your application with Docker",
                "Implement message queues with RabbitMQ or Kafka basics",
                "Learn API documentation with Swagger/OpenAPI"
            ],
            "advanced": [
                "Design microservices architecture: service discovery, API gateway, circuit breaker",
                "Master cloud services: AWS Lambda, RDS, SQS, API Gateway",
                "Study advanced database patterns: read replicas, sharding, connection pooling",
                "Implement distributed tracing and observability with OpenTelemetry",
                "Learn gRPC for high-performance inter-service communication",
                "Study backend security deeply: OWASP Top 10, zero trust architecture"
            ]
        },
        "courses": [
            {"name": "Node.js, Express, MongoDB & More: The Complete Bootcamp", "platform": "Udemy (Jonas Schmedtmann)", "url": "https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/", "level": "Beginner-Intermediate", "free": False},
            {"name": "FastAPI – The Complete Course", "platform": "Udemy", "url": "https://www.udemy.com/course/completefastapi/", "level": "Beginner-Intermediate", "free": False},
            {"name": "Backend Development and APIs", "platform": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/back-end-development-and-apis/", "level": "Beginner", "free": True},
            {"name": "Microservices with Node JS and React", "platform": "Udemy (Stephen Grider)", "url": "https://www.udemy.com/course/microservices-with-node-js-and-react/", "level": "Advanced", "free": False},
            {"name": "Spring Boot 3 & Spring Framework 6", "platform": "Udemy", "url": "https://www.udemy.com/course/spring-framework-5-beginner-to-guru/", "level": "Intermediate", "free": False}
        ],
        "certifications": [
            {"name": "AWS Certified Developer – Associate", "provider": "Amazon Web Services", "url": "https://aws.amazon.com/certification/certified-developer-associate/", "relevance": "High"},
            {"name": "Professional Cloud Developer (Google)", "provider": "Google Cloud", "url": "https://cloud.google.com/learn/certification/cloud-developer", "relevance": "High"},
            {"name": "MongoDB Certified Developer Associate", "provider": "MongoDB University", "url": "https://learn.mongodb.com/pages/mongodb-associate-developer-exam", "relevance": "High"},
            {"name": "Certified Kubernetes Application Developer (CKAD)", "provider": "CNCF/Linux Foundation", "url": "https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad/", "relevance": "Medium"}
        ]
    },

    "Full Stack Developer": {
        "description": "Versatile engineer handling end-to-end development from responsive UI to scalable server-side logic and database architecture.",
        "required_skills": [
            "frontend", "backend", "full stack", "rest api", "database management",
            "javascript", "typescript", "react", "nodejs", "sql", "web development",
            "version control", "deployment", "ci/cd"
        ],
        "technical_skills": [
            "javascript", "typescript", "python", "java",
            "react", "next.js", "vue", "angular",
            "nodejs", "express", "nestjs", "django", "fastapi", "spring boot",
            "html5", "css3", "tailwind", "material ui",
            "rest api", "graphql", "websocket",
            "postgresql", "mysql", "mongodb", "redis", "firebase", "supabase", "prisma",
            "docker", "kubernetes", "aws", "gcp", "azure", "vercel", "netlify",
            "ci/cd", "github actions", "jenkins",
            "jest", "cypress", "playwright", "pytest",
            "git", "github", "mern stack", "mean stack", "pern stack"
        ],
        "soft_skills": [
            "problem solving", "adaptability", "full stack thinking", "agile",
            "collaboration", "project management", "product mindset", "mentorship"
        ],
        "experience_keywords": [
            "full stack", "end to end", "frontend", "backend", "built", "deployed",
            "launched", "maintained", "scaled", "integrated", "automated", "optimized"
        ],
        "education_keywords": [
            "computer science", "software engineering", "cs", "it", "engineering", "bootcamp"
        ],
        "weight": {
            "technical_skills": 0.40,
            "required_skills": 0.30,
            "experience": 0.20,
            "soft_skills": 0.05,
            "education": 0.05
        },
        "roadmap": {
            "beginner": [
                "Master HTML, CSS, and JavaScript fundamentals",
                "Learn React for frontend and Node.js + Express for backend",
                "Understand databases: SQL (PostgreSQL) and NoSQL (MongoDB)",
                "Build a full-stack CRUD application (e.g., a blog or task manager)",
                "Learn REST API design and integration from frontend to backend",
                "Deploy your app using Vercel (frontend) + Railway/Render (backend)"
            ],
            "intermediate": [
                "Migrate to TypeScript across your full stack",
                "Learn Next.js for full-stack React with SSR and API routes",
                "Study authentication: JWT, OAuth 2.0, session management",
                "Implement state management (Zustand or Redux Toolkit)",
                "Add testing: unit tests (Jest/Vitest) and integration tests (Cypress)",
                "Learn Docker and containerize your full-stack app"
            ],
            "advanced": [
                "Study microservices vs monolith and when to use each",
                "Learn GraphQL as an alternative to REST APIs",
                "Master cloud deployment: AWS (EC2, RDS, S3, Lambda) or GCP",
                "Implement CI/CD pipelines with GitHub Actions",
                "Study performance optimization: frontend (Core Web Vitals) and backend (indexing, caching)",
                "Build a production-grade SaaS application with all layers integrated"
            ]
        },
        "courses": [
            {"name": "The Complete Web Developer Bootcamp", "platform": "Udemy (Colt Steele)", "url": "https://www.udemy.com/course/the-web-developer-bootcamp/", "level": "Beginner", "free": False},
            {"name": "Full Stack Open (University of Helsinki)", "platform": "University of Helsinki", "url": "https://fullstackopen.com/en/", "level": "Intermediate", "free": True},
            {"name": "The MERN Stack Guide", "platform": "Udemy (Academind)", "url": "https://www.udemy.com/course/react-nodejs-express-mongodb-the-mern-fullstack-guide/", "level": "Intermediate", "free": False},
            {"name": "Next.js 14 & React – The Complete Guide", "platform": "Udemy (Maximilian)", "url": "https://www.udemy.com/course/nextjs-react-the-complete-guide/", "level": "Intermediate-Advanced", "free": False},
            {"name": "Full Stack Development with React & Node (freeCodeCamp)", "platform": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/", "level": "Beginner", "free": True}
        ],
        "certifications": [
            {"name": "Meta Full-Stack Engineer Professional Certificate", "provider": "Meta / Coursera", "url": "https://www.coursera.org/professional-certificates/meta-full-stack-engineer-professional-certificate", "relevance": "High"},
            {"name": "AWS Certified Developer – Associate", "provider": "Amazon Web Services", "url": "https://aws.amazon.com/certification/certified-developer-associate/", "relevance": "High"},
            {"name": "MongoDB Certified Developer Associate", "provider": "MongoDB University", "url": "https://learn.mongodb.com/pages/mongodb-associate-developer-exam", "relevance": "Medium"}
        ]
    },

    "DevOps Engineer": {
        "description": "Infrastructure specialist bridging dev and ops through CI/CD pipelines, cloud automation, container orchestration, and proactive monitoring.",
        "required_skills": [
            "devops", "ci/cd", "continuous integration", "continuous deployment",
            "docker", "kubernetes", "k8s", "cloud computing", "linux",
            "infrastructure as code", "iac", "automation", "configuration management",
            "monitoring", "observability", "site reliability engineering", "sre"
        ],
        "technical_skills": [
            "docker", "kubernetes", "k8s", "helm", "openshift",
            "aws", "azure", "gcp", "terraform", "cloudformation", "pulumi",
            "ansible", "puppet", "chef",
            "jenkins", "gitlab ci", "github actions", "circleci", "argo cd", "tekton",
            "linux", "ubuntu", "centos", "bash", "shell scripting", "python", "go",
            "git", "github", "gitlab",
            "nginx", "haproxy", "load balancing", "dns", "cdn",
            "prometheus", "grafana", "elk stack", "splunk", "datadog", "newrelic",
            "vpc", "networking", "security groups", "tcp/ip",
            "iam", "rbac", "vault", "sonarqube", "trivy", "snyk",
            "kafka", "redis", "mysql", "postgresql"
        ],
        "soft_skills": [
            "automation mindset", "problem solving", "collaboration", "reliability",
            "incident management", "on-call experience", "documentation", "agile"
        ],
        "experience_keywords": [
            "automated", "deployed", "configured", "maintained", "monitored",
            "ci/cd", "pipeline", "infrastructure", "provisioned", "scaled",
            "optimized", "migrated", "streamlined", "reduced downtime", "improved reliability"
        ],
        "education_keywords": [
            "computer science", "software engineering", "information technology",
            "cs", "it", "engineering", "system administration"
        ],
        "weight": {
            "technical_skills": 0.45,
            "required_skills": 0.25,
            "experience": 0.20,
            "soft_skills": 0.05,
            "education": 0.05
        },
        "roadmap": {
            "beginner": [
                "Master Linux: file system, permissions, processes, bash scripting",
                "Learn networking fundamentals: TCP/IP, DNS, HTTP, firewalls, load balancing",
                "Understand version control with Git (branching strategy, GitFlow)",
                "Learn Docker: images, containers, Dockerfile, docker-compose",
                "Study CI/CD concepts and set up a pipeline with GitHub Actions",
                "Get hands-on with a cloud provider: AWS Free Tier (EC2, S3, IAM)"
            ],
            "intermediate": [
                "Learn Kubernetes: pods, deployments, services, ingress, configmaps",
                "Study Infrastructure as Code with Terraform (HashiCorp)",
                "Implement monitoring with Prometheus + Grafana stack",
                "Learn configuration management with Ansible",
                "Build a complete CI/CD pipeline: build, test, scan, deploy",
                "Study cloud networking: VPC, subnets, security groups, route tables"
            ],
            "advanced": [
                "Master multi-cloud or hybrid cloud architectures",
                "Study GitOps with ArgoCD or Flux for Kubernetes deployments",
                "Implement full observability: metrics, logs, traces (OpenTelemetry)",
                "Learn secrets management with HashiCorp Vault",
                "Study chaos engineering with Chaos Monkey or LitmusChaos",
                "Prepare for CKA/CKAD/CKS Kubernetes certifications"
            ]
        },
        "courses": [
            {"name": "Docker & Kubernetes: The Practical Guide", "platform": "Udemy (Academind)", "url": "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/", "level": "Beginner-Intermediate", "free": False},
            {"name": "HashiCorp Certified Terraform Associate Prep", "platform": "Udemy (Zeal Vora)", "url": "https://www.udemy.com/course/terraform-beginner-to-advanced/", "level": "Intermediate", "free": False},
            {"name": "AWS Solutions Architect – Associate (SAA-C03)", "platform": "Udemy (Stephane Maarek)", "url": "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/", "level": "Intermediate", "free": False},
            {"name": "DevOps Bootcamp", "platform": "freeCodeCamp / YouTube", "url": "https://www.youtube.com/watch?v=j5Zsa_eOXeY", "level": "Beginner", "free": True}
        ],
        "certifications": [
            {"name": "Certified Kubernetes Administrator (CKA)", "provider": "CNCF / Linux Foundation", "url": "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/", "relevance": "High"},
            {"name": "AWS Certified DevOps Engineer – Professional", "provider": "Amazon Web Services", "url": "https://aws.amazon.com/certification/certified-devops-engineer-professional/", "relevance": "High"},
            {"name": "HashiCorp Certified: Terraform Associate", "provider": "HashiCorp", "url": "https://www.hashicorp.com/certifications/terraform-associate", "relevance": "High"},
            {"name": "Google Professional Cloud DevOps Engineer", "provider": "Google Cloud", "url": "https://cloud.google.com/learn/certification/cloud-devops-engineer", "relevance": "High"},
            {"name": "Certified Kubernetes Security Specialist (CKS)", "provider": "CNCF / Linux Foundation", "url": "https://training.linuxfoundation.org/certification/certified-kubernetes-security-specialist/", "relevance": "Medium"}
        ]
    },

    "Machine Learning Engineer": {
        "description": "AI specialist designing, training, and deploying scalable ML models from classical algorithms to modern deep learning and Generative AI architectures.",
        "required_skills": [
            "machine learning", "ml", "artificial intelligence", "ai", "python",
            "deep learning", "neural networks", "model training", "data processing",
            "mathematics", "linear algebra", "calculus", "probability", "statistics",
            "feature engineering", "model evaluation", "mlops", "ml lifecycle"
        ],
        "technical_skills": [
            "python", "jupyter", "numpy", "pandas", "scipy", "matplotlib", "seaborn",
            "scikit-learn", "sklearn", "xgboost", "lightgbm", "catboost",
            "tensorflow", "keras", "pytorch", "jax", "onnx",
            "cnn", "rnn", "lstm", "gru", "transformer", "bert", "gpt",
            "nlp", "natural language processing", "llm", "large language models",
            "langchain", "rag", "vector databases", "fine-tuning", "lora", "peft",
            "computer vision", "opencv", "yolo", "image segmentation",
            "hyperparameter tuning", "optuna", "ray tune",
            "mlflow", "wandb", "dvc", "tensorboard",
            "docker", "kubernetes", "aws sagemaker", "vertex ai", "azure ml",
            "spark", "pyspark", "databricks",
            "pinecone", "chromadb", "milvus", "weaviate",
            "sql", "git", "linux", "github"
        ],
        "soft_skills": [
            "analytical thinking", "problem solving", "research mindset", "experimentation",
            "communication", "collaboration", "ai ethics", "critical thinking", "literature review"
        ],
        "experience_keywords": [
            "trained", "built", "deployed", "implemented", "model",
            "algorithm", "inference", "prediction", "classification", "regression",
            "fine-tuning", "optimized", "accuracy", "f1-score", "recall",
            "precision", "auc-roc", "performance improvement"
        ],
        "education_keywords": [
            "computer science", "machine learning", "data science", "artificial intelligence",
            "statistics", "mathematics", "physics", "cs", "phd", "master", "msc", "btech"
        ],
        "weight": {
            "technical_skills": 0.40,
            "required_skills": 0.25,
            "experience": 0.20,
            "education": 0.10,
            "soft_skills": 0.05
        },
        "roadmap": {
            "beginner": [
                "Master Python for data science: numpy, pandas, matplotlib, seaborn",
                "Study mathematics for ML: linear algebra, calculus, probability, statistics",
                "Learn core ML algorithms: linear/logistic regression, decision trees, SVM, KNN",
                "Complete a supervised learning project on Kaggle (classification or regression)",
                "Understand model evaluation: train/test split, cross-validation, confusion matrix",
                "Take Andrew Ng's Machine Learning Specialization (highly recommended)"
            ],
            "intermediate": [
                "Learn deep learning with PyTorch: neural networks, CNNs, RNNs",
                "Study NLP fundamentals: text preprocessing, TF-IDF, word embeddings",
                "Explore Transformer architecture and pre-trained models (BERT, GPT)",
                "Build end-to-end ML pipelines with MLflow for experiment tracking",
                "Study feature engineering, hyperparameter tuning with Optuna",
                "Participate in Kaggle competitions to build competitive ML skills"
            ],
            "advanced": [
                "Study Large Language Models: fine-tuning, LoRA/QLoRA, RLHF, RAG pipelines",
                "Build production ML systems: model serving with FastAPI + Docker",
                "Learn MLOps: CI/CD for ML, model monitoring, data drift detection",
                "Deploy ML models on AWS SageMaker or Google Vertex AI",
                "Study multi-modal models: vision-language models (CLIP, LLaVA)",
                "Contribute to open-source ML projects (HuggingFace, PyTorch)"
            ]
        },
        "courses": [
            {"name": "Machine Learning Specialization (Andrew Ng)", "platform": "Coursera / DeepLearning.AI", "url": "https://www.coursera.org/specializations/machine-learning-introduction", "level": "Beginner", "free": False},
            {"name": "Deep Learning Specialization (Andrew Ng)", "platform": "Coursera / DeepLearning.AI", "url": "https://www.coursera.org/specializations/deep-learning", "level": "Intermediate", "free": False},
            {"name": "fast.ai – Practical Deep Learning for Coders", "platform": "fast.ai", "url": "https://course.fast.ai/", "level": "Intermediate", "free": True},
            {"name": "MLOps Specialization", "platform": "Coursera / DeepLearning.AI", "url": "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops", "level": "Advanced", "free": False},
            {"name": "Hugging Face NLP Course", "platform": "Hugging Face", "url": "https://huggingface.co/learn/nlp-course/", "level": "Intermediate-Advanced", "free": True},
            {"name": "Full Stack LLM Bootcamp", "platform": "The Full Stack", "url": "https://fullstackdeeplearning.com/llm-bootcamp/", "level": "Advanced", "free": True}
        ],
        "certifications": [
            {"name": "TensorFlow Developer Certificate", "provider": "Google / TensorFlow", "url": "https://www.tensorflow.org/certificate", "relevance": "High"},
            {"name": "AWS Certified Machine Learning – Specialty", "provider": "Amazon Web Services", "url": "https://aws.amazon.com/certification/certified-machine-learning-specialty/", "relevance": "High"},
            {"name": "Google Professional Machine Learning Engineer", "provider": "Google Cloud", "url": "https://cloud.google.com/learn/certification/machine-learning-engineer", "relevance": "High"},
            {"name": "DeepLearning.AI TensorFlow Developer", "provider": "DeepLearning.AI / Coursera", "url": "https://www.coursera.org/professional-certificates/tensorflow-in-practice", "relevance": "High"},
            {"name": "Databricks Certified Machine Learning Associate", "provider": "Databricks", "url": "https://www.databricks.com/learn/certification/machine-learning-associate", "relevance": "Medium"}
        ]
    }
}


def get_job_role_data(role_name: str):
    """Get job role data from the dataset"""
    return JOB_ROLES_DATASET.get(role_name, None)


def get_all_job_roles():
    """Get list of all available job roles"""
    return list(JOB_ROLES_DATASET.keys())


def get_role_roadmap(role_name: str, level: str = "all"):
    """Get roadmap for a specific role and level. level: 'beginner','intermediate','advanced','all'"""
    data = JOB_ROLES_DATASET.get(role_name)
    if not data or "roadmap" not in data:
        return None
    roadmap = data["roadmap"]
    if level == "all":
        return roadmap
    return roadmap.get(level, [])


def get_role_courses(role_name: str, free_only: bool = False):
    """Get recommended courses for a role, optionally filtering to free ones."""
    data = JOB_ROLES_DATASET.get(role_name)
    if not data or "courses" not in data:
        return []
    courses = data["courses"]
    if free_only:
        return [c for c in courses if c.get("free", False)]
    return courses


def get_role_certifications(role_name: str, min_relevance: str = "Low"):
    """Get certifications for a role filtered by minimum relevance."""
    order = {"Low": 0, "Medium": 1, "High": 2}
    data = JOB_ROLES_DATASET.get(role_name)
    if not data or "certifications" not in data:
        return []
    threshold = order.get(min_relevance, 0)
    return [c for c in data["certifications"] if order.get(c.get("relevance", "Low"), 0) >= threshold]
