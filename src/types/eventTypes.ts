
import { LANGUAGE_PATTERNS } from "../utils/constants";

export type EventType = 
  | "error"
  | "syntax_error"
  | "build_failure"
  | "build_success"
  | "success"
  | "warning"
  | "test_failed"
  | "test_passed"
  | "sysexit"
  | "compiled";


  export type supportedLanguages = keyof typeof LANGUAGE_PATTERNS;