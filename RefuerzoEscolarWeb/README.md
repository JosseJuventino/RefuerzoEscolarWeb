## Project Information
This repository hosts the source code for **William Mendoza - RefuerzoEscolarWeb**, an online platform designed to help students improve their academic performance through personalized lessons and interactive exercises in subjects like math, science, and language arts.

### Prerequisites
Before starting the project, make sure you have the following installed on your development environment:
- **Node.js** (version 14 or higher)
- **NPM** (for dependency management)
- **Git** (to clone the repository)

### Instructions to Run the Project

1. **Clone the repository**

   First, clone the repository from GitHub or your preferred version control platform. Use the following command in your terminal:
   ```bash
   git clone https://github.com/username/WilliamMendoza-RefuerzoEscolarWeb.git
   ```

2. **Navigate to the project directory**

   Change the directory to the folder of the project you just cloned:
   ```bash
   cd WilliamMendoza-RefuerzoEscolarWeb
   ```

3. **Install dependencies**
   
   Use `npm` to install the necessary dependencies for the project. Run the following command:
   ```bash
   npm install
   ```

4. **Start the development server**

   Once all dependencies are installed, start the development server. This will compile the code and start a local instance of the platform:
   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:4321`. You can open your browser and visit that address to see the project running.

### Project Structure
The current structure of the project is as follows:

```
- .astro/
- .vscode/
- node_modules/
- public/
    - favicon.svg
    - Logo.svg
- src/
    - components/
        - Login/
            - LoginCard.astro
    - css/
        - globals.module.css
        - login.module.css
    - layouts/
        - Layout.astro
    - index.astro
- scripts/
- types/
    - env.d.ts
- .env
- .gitignore
- astro.config.mjs
- package-lock.json
- package.json
- README.md
```

- **src/components/Login**: Contains the components for the login page.
- **src/css**: CSS files for global and login-specific styles.
- **src/layouts**: Contains the general layouts for the project.
- **public**: Static files like the logo and favicon.
- **scripts**: Contains scripts used in the project.
- **types**: Defines TypeScript types, such as `env.d.ts` for environment variables.

This is the current structure and the basic setup for running the project locally. If you need more details or changes, feel free to reach out!
