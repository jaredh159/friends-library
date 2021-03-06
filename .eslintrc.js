module.exports = {
  parser: 'babel-eslint',
  plugins: ['flowtype', 'no-only-tests'],
  extends: ['airbnb', 'plugin:flowtype/recommended'],
  globals: {
    window: false,
    expect: false,
    it: false,
    describe: false,
    beforeEach: false,
    document: false,
    test: false,
    jest: false,
  },
  rules: {
    'react/no-danger': 0,
    'no-only-tests/no-only-tests': 2,
    'arrow-body-style': 0,
    'object-curly-newline': 0,
    'no-use-before-define': 0,
    'import/prefer-default-export': 0,
    'arrow-parens': 0,
    'no-plusplus': 0,
    'no-param-reassign': 0,
    'no-confusing-arrow': 0,
    'import/no-extraneous-dependencies': 0,
    'react/jsx-one-expression-per-line': 0,
    'react/sort-comp': 0,
    'react/jsx-filename-extension': [0],
    'no-cond-assign': 0,
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'lines-between-class-members': [
      'error',
      'always',
      { exceptAfterSingleLine: true },
    ],
  },
  settings: {
    flowtype: {
      onlyFilesWithFlowAnnotation: true,
    },
  },
};
