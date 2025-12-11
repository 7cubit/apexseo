module.exports = {
    extends: ['eslint-config-custom'],
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
    },
    ignorePatterns: ['.eslintrc.js']
};
