import { EventType } from "../types/eventTypes";
import { LANGUAGE_PATTERNS, TEST_PATTERNS } from "./constants";


export const parser = (log: string, language: string): Extract<EventType, string> | null => {
    // 1. Check language-specific patterns first
    const languagePattern = LANGUAGE_PATTERNS[language];

    if (languagePattern) {
        for (const [eventName, patterns] of Object.entries(languagePattern)) {
            for (const p of patterns) {
                if (p.test(log)) { return eventName as EventType; }
            }
        }
    }

    // 2. Check test framework patterns (framework-agnostic)
    for (const [, frameworkPatterns] of Object.entries(TEST_PATTERNS)) {
        for (const [eventName, patterns] of Object.entries(frameworkPatterns)) {
            for (const p of patterns) {
                if (p.test(log)) { return eventName as EventType; }
            }
        }
    }

    return null;

};