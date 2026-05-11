export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型枚举
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'revert'],
    ],
    // subject 不能为空
    'subject-empty': [2, 'never'],
    // subject 不能以句号结尾
    'subject-full-stop': [2, 'never', '.'],
    // header 最大长度 100
    'header-max-length': [2, 'always', 100],
  },
};
