module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'backend'], // Ignore backend folder
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    // 👇 Point this to your frontend's tsconfig file
    project: './frontend/tsconfig.app.json', 
    // 👇 Set the root directory for the tsconfig
    tsconfigRootDir: __dirname, 
  },
  settings: {
    // Optional: help ESLint find imports inside frontend folder
    'import/resolver': {
      typescript: {
        project: './frontend/tsconfig.app.json',
      },
    },
  },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
};