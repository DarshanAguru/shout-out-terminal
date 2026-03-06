import { LANGUAGES } from "./constants";

const detectLanguage = (log: string) : string => {
    const line  = log.toLowerCase();
    return LANGUAGES.find((lang) => line.includes(lang)) || "unknown";
};

export { detectLanguage };