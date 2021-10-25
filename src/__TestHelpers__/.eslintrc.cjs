module.exports = {
    rules: {
        // Allow test helpers to use dev dependencies
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
}
