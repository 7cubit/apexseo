module.exports = {
    extends: ['turbo', 'prettier'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['warn', {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_'
        }],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'turbo/no-undeclared-env-vars': 'off'
    },
    ignorePatterns: ['node_modules/', 'dist/', '.next/', 'build/']
};
