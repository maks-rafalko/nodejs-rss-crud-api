module.exports = {
    extends: [
        'airbnb-base',
        'airbnb-typescript/base'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
    },
    plugins: ['@typescript-eslint'],
    root: true,
    rules: {
        indent: 'off',
        'max-len': ['error', 130],
        '@typescript-eslint/indent': ['error', 4],
        'import/prefer-default-export': 'off',
        'import/no-default-export': 'error'
    }
};