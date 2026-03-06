const LANGUAGES = ['node', 'npm', 'yarn', 'javac', 'java', 'mvn', 'gradle', 'pytest', 'python', 'tsc', 'webpack', 'vite', 'esbuild', 'cargo', 'rustc', 'go', 'dotnet', 'gcc', 'g++', 'make', 'cmake'];


const LANGUAGE_PATTERNS: Record<string, Record<string, RegExp[]>> = {
  node: {
    syntax_error: [/syntaxerror/i, /unexpected token/i, /unexpected identifier/i],
    error: [/error:/i, /throw new error/i, /error\b/i, /referenceerror/i, /typeerror/i, /rangeerror/i, /urierror/i, /evalerror/i, /unhandled.*rejection/i, /fatal error/i, /cannot find module/i, /module not found/i, /enoent/i, /eacces/i, /econnrefused/i],
    compiled: [/compiled successfully/i, /compiled with/i, /build completed/i],
    sysexit: [/process exited/i, /exit code/i, /process\.exit/i],
    warning: [/warning/i, /deprecat/i]
  },

  npm: {
    error: [/npm err!/i, /npm error/i, /errno/i],
    warning: [/npm warn/i],
    compiled: [/added \d+ packages/i]
  },

  yarn: {
    error: [/error\b/i, /yarn error/i],
    warning: [/warning\b/i],
    compiled: [/done in/i]
  },

  python: {
    syntax_error: [/syntaxerror/i, /indentationerror/i, /taberror/i],
    error: [/traceback/i, /error:/i, /exception/i, /nameerror/i, /valueerror/i, /keyerror/i, /indexerror/i, /attributeerror/i, /importerror/i, /modulenotfounderror/i, /filenotfounderror/i, /zerodivisionerror/i, /oserror/i, /runtimeerror/i, /typeerror/i],
    sysexit: [/systemexit/i, /process finished with exit code/i],
    warning: [/warning/i, /deprecat/i]
  },

  java: {
    syntax_error: [/error:.*\^/i, /error:.*expected/i],
    error: [/error:/i, /exception in thread/i, /java\.lang\.\w*exception/i, /java\.lang\.\w*error/i, /caused by:/i, /at\s+[\w.$]+\([\w.]+:\d+\)/i],
    build_failure: [/build failure/i, /build failed/i, /compilation failure/i],
    build_success: [/build success/i, /build completed/i],
    compiled: [/compiling/i],
    warning: [/warning/i]
  },

  mvn: {
    build_failure: [/build failure/i, /build failed/i],
    build_success: [/build success/i],
    error: [/error/i],
    warning: [/warning/i]
  },

  gradle: {
    build_failure: [/build failed/i, /execution failed/i],
    build_success: [/build successful/i],
    error: [/error/i],
    warning: [/warning/i]
  },

  tsc: {
    syntax_error: [/error ts\d+/i],
    error: [/error/i],
    compiled: [/found 0 errors/i],
    warning: [/warning/i]
  },

  webpack: {
    error: [/error in/i, /module build failed/i],
    compiled: [/compiled successfully/i, /compiled with.*warning/i],
    build_failure: [/failed to compile/i],
    warning: [/warning/i]
  },

  vite: {
    error: [/error/i, /failed to resolve/i],
    compiled: [/ready in/i, /built in/i],
    warning: [/warning/i]
  },

  esbuild: {
    error: [/✘.*error/i, /error:/i],
    compiled: [/build finished/i],
    warning: [/warning/i]
  },

  cargo: {
    error: [/error\[e\d+\]/i, /error:/i],
    compiled: [/compiling/i, /finished/i],
    build_failure: [/could not compile/i],
    warning: [/warning/i]
  },

  rustc: {
    error: [/error\[e\d+\]/i, /error:/i],
    warning: [/warning/i]
  },

  go: {
    error: [/cannot/i, /undefined:/i, /syntax error/i],
    compiled: [/build succeeded/i],
    build_failure: [/build failed/i],
    warning: [/warning/i]
  },

  dotnet: {
    error: [/error\s+\w+\d+/i, /build failed/i],
    compiled: [/build succeeded/i],
    build_failure: [/build failed/i],
    warning: [/warning\s+\w+\d+/i]
  },

  gcc: {
    error: [/error:/i, /fatal error/i],
    compiled: [/^$/],  // gcc is silent on success
    warning: [/warning:/i]
  },

  'g++': {
    error: [/error:/i, /fatal error/i],
    warning: [/warning:/i]
  },

  make: {
    error: [/error/i, /\*\*\*/i],
    build_failure: [/make:.*error/i],
    warning: [/warning/i]
  },

  cmake: {
    error: [/error/i, /cmake error/i],
    build_failure: [/build failed/i],
    compiled: [/build files have been written/i],
    warning: [/warning/i, /cmake warning/i]
  }
};

const TEST_PATTERNS: Record<string, Record<string, RegExp[]>> = {

  // JavaScript / TypeScript
  jest: {
    test_passed: [/tests:.*passed/i, /test suites:.*passed/i, /tests passed/i],
    test_failed: [/tests:.*failed/i, /test suites:.*failed/i, /tests failed/i]
  },

  mocha: {
    test_passed: [/passing/i],
    test_failed: [/failing/i]
  },

  vitest: {
    test_passed: [/tests passed/i, /test files.*passed/i],
    test_failed: [/tests failed/i, /test files.*failed/i]
  },

  // Python
  pytest: {
    test_passed: [/=+.*passed/i, /passed/i],
    test_failed: [/=+.*failed/i, /failed/i, /error/i]
  },

  unittest: {
    test_passed: [/ok$/im],
    test_failed: [/failed \(.*\)/i]
  },

  // Java
  junit: {
    test_passed: [/tests run:.*failures: 0/i, /build success/i],
    test_failed: [/failures: [1-9]/i, /errors: [1-9]/i, /tests run:.*failures:/i]
  },

  // Go
  gotest: {
    test_passed: [/^ok\s/im, /pass$/im],
    test_failed: [/^fail\s/im, /--- fail/i]
  },

  // Rust
  cargo_test: {
    test_passed: [/test result: ok/i],
    test_failed: [/test result: failed/i]
  },

  // .NET
  dotnet_test: {
    test_passed: [/passed!/i, /total tests:.*failed\s*:\s*0/i],
    test_failed: [/failed!/i, /failed\s*:\s*[1-9]/i]
  }
};


const AUDIO_MAP = {
  error: 'error.wav',
  syntax_error: "syntax_error.wav",
  build_failure: "build_failure.wav",
  build_success: "compiled.wav",
  success: "success.wav",
  test_failed: "test_failure.wav",
  test_passed: "compiled.wav",
  sysexit: "sys_exit.wav",
  compiled: "compiled.wav",
  warning: "error.wav"
};

export {
  LANGUAGES,
  TEST_PATTERNS,
  LANGUAGE_PATTERNS,
  AUDIO_MAP
};