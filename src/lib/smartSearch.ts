import Fuse from "fuse.js";
import type { Resource } from "@/types";

/**
 * Smart Search Engine for BuildFree
 * 
 * Features:
 * - Synonym expansion (e.g., "backend" finds databases, APIs, servers)
 * - Intent detection (e.g., "I want to build a website" → hosting)
 * - Technology mapping (e.g., "React" → Vercel, Netlify)
 * - Use case understanding (e.g., "store data" → databases)
 */

// Synonym and concept mapping - maps user input to relevant search terms
const CONCEPT_MAP: Record<string, string[]> = {
    // Technology Stack Keywords
    "react": ["vercel", "netlify", "nextjs", "frontend", "web", "vite"],
    "nextjs": ["vercel", "react", "frontend", "ssr", "web"],
    "next": ["vercel", "react", "nextjs", "frontend"],
    "vue": ["netlify", "vercel", "frontend", "web", "vite"],
    "angular": ["netlify", "vercel", "frontend", "web"],
    "node": ["render", "railway", "heroku", "backend", "server", "express"],
    "nodejs": ["render", "railway", "backend", "server", "express"],
    "python": ["render", "railway", "flask", "django", "backend", "ml", "ai"],
    "django": ["python", "backend", "render", "railway"],
    "flask": ["python", "backend", "render", "railway"],
    "java": ["jetbrains", "spring", "backend"],
    "go": ["fly.io", "backend", "server"],
    "golang": ["fly.io", "backend", "server"],
    "rust": ["fly.io", "backend", "server"],
    "php": ["hosting", "web", "backend"],
    "ruby": ["rails", "render", "railway", "backend"],

    // Use Case Keywords
    "website": ["hosting", "vercel", "netlify", "cloudflare", "github pages", "static"],
    "webapp": ["hosting", "vercel", "netlify", "render", "railway"],
    "app": ["hosting", "vercel", "netlify", "render", "supabase", "firebase"],
    "api": ["backend", "render", "railway", "fly.io", "serverless"],
    "server": ["hosting", "vps", "digitalocean", "oracle", "google cloud", "render"],
    "deploy": ["hosting", "vercel", "netlify", "render", "railway", "deployment"],
    "host": ["hosting", "vercel", "netlify", "render", "cloudflare"],

    // Database Keywords
    "database": ["supabase", "mongodb", "planetscale", "neon", "firebase", "postgres", "mysql", "sql"],
    "db": ["supabase", "mongodb", "planetscale", "neon", "firebase", "database"],
    "sql": ["supabase", "planetscale", "neon", "postgres", "mysql", "database"],
    "nosql": ["mongodb", "firebase", "database"],
    "postgres": ["supabase", "neon", "planetscale", "database", "sql"],
    "mysql": ["planetscale", "database", "sql"],
    "store data": ["database", "supabase", "mongodb", "firebase"],
    "data": ["database", "supabase", "mongodb", "firebase", "storage"],

    // Authentication Keywords
    "auth": ["clerk", "auth0", "firebase", "supabase", "authentication", "login"],
    "login": ["auth", "clerk", "auth0", "firebase", "supabase", "authentication"],
    "authentication": ["clerk", "auth0", "firebase", "supabase", "auth"],
    "user": ["auth", "clerk", "auth0", "authentication", "users"],
    "signup": ["auth", "clerk", "auth0", "authentication"],

    // Design & Assets Keywords
    "design": ["figma", "ui", "ux", "icons", "illustration", "fonts"],
    "ui": ["figma", "design", "icons", "tailwind", "css"],
    "ux": ["figma", "design", "prototyping"],
    "icons": ["lucide", "font awesome", "feather", "assets"],
    "images": ["unsplash", "pexels", "photos", "assets"],
    "photos": ["unsplash", "pexels", "images", "assets"],
    "illustration": ["undraw", "design", "assets"],
    "fonts": ["google fonts", "typography", "design"],
    "colors": ["coolors", "design", "palette"],

    // DevOps & Tools Keywords
    "docker": ["containers", "devops", "kubernetes", "deployment"],
    "devops": ["docker", "ci", "cd", "github", "deployment"],
    "ci": ["github actions", "devops", "automation"],
    "cd": ["github actions", "devops", "deployment"],
    "monitoring": ["sentry", "uptime", "logging", "errors"],
    "errors": ["sentry", "monitoring", "debugging"],
    "testing": ["postman", "insomnia", "api", "development"],

    // Cloud Keywords
    "cloud": ["aws", "azure", "gcp", "google cloud", "digitalocean", "oracle"],
    "aws": ["amazon", "cloud", "s3", "lambda", "ec2"],
    "azure": ["microsoft", "cloud", "student"],
    "gcp": ["google cloud", "cloud", "firebase"],
    "vps": ["digitalocean", "oracle", "google cloud", "server", "vm"],
    "vm": ["vps", "digitalocean", "oracle", "virtual machine"],

    // Student/Learning Keywords
    "student": ["github student", "education", "student id", "free", "learning"],
    "education": ["student", "github student", "learning", "free"],
    "learn": ["education", "student", "courses", "tutorials"],
    "free": ["student", "hobby", "open source", "no cost"],

    // Project Type Keywords
    "portfolio": ["hosting", "github pages", "vercel", "netlify", "static"],
    "blog": ["hosting", "static", "github pages", "netlify", "cms"],
    "ecommerce": ["hosting", "payment", "stripe", "database"],
    "startup": ["hosting", "database", "auth", "analytics"],
    "hackathon": ["student", "free", "quick", "vercel", "supabase", "firebase"],
    "saas": ["hosting", "database", "auth", "payment", "analytics"],
    "mvp": ["hosting", "database", "auth", "quick", "free"],

    // Intent-based phrases
    "build website": ["hosting", "vercel", "netlify", "static", "frontend"],
    "build app": ["hosting", "database", "auth", "supabase", "vercel"],
    "store user data": ["database", "supabase", "firebase", "mongodb"],
    "add login": ["auth", "clerk", "auth0", "firebase"],
    "make money": ["payment", "stripe", "monetization"],
    "track errors": ["sentry", "monitoring", "logging"],
    "need icons": ["lucide", "font awesome", "icons", "assets"],
    "need images": ["unsplash", "pexels", "images", "photos"],
};

// Common intent phrases that should map to specific categories or searches
const INTENT_PATTERNS: Array<{ pattern: RegExp; terms: string[] }> = [
    { pattern: /where (can i|to|should i) host/i, terms: ["hosting", "vercel", "netlify", "render"] },
    { pattern: /how (can i|to|do i) deploy/i, terms: ["hosting", "deployment", "vercel", "render"] },
    { pattern: /need (a )?database/i, terms: ["database", "supabase", "mongodb", "neon"] },
    { pattern: /add (user )?auth/i, terms: ["auth", "clerk", "auth0", "supabase"] },
    { pattern: /user (login|authentication)/i, terms: ["auth", "clerk", "auth0"] },
    { pattern: /store (my |user |the )?data/i, terms: ["database", "supabase", "firebase"] },
    { pattern: /(build|create|make) (a |my )?(website|site|page)/i, terms: ["hosting", "frontend", "vercel", "static"] },
    { pattern: /(build|create|make) (a |my )?(web ?app|application)/i, terms: ["hosting", "database", "auth", "fullstack"] },
    { pattern: /free (tools|resources|stuff)/i, terms: ["free", "student", "hobby"] },
    { pattern: /student (benefits|deals|offers|pack)/i, terms: ["student", "education", "github student"] },
    { pattern: /backend (service|hosting|api)/i, terms: ["backend", "render", "railway", "serverless"] },
    { pattern: /frontend (hosting|deploy)/i, terms: ["frontend", "vercel", "netlify", "static"] },
    { pattern: /(track|monitor) (errors|bugs)/i, terms: ["sentry", "monitoring", "errors"] },
    { pattern: /api (testing|client)/i, terms: ["postman", "insomnia", "api"] },
    { pattern: /ci\/?cd/i, terms: ["devops", "github", "automation"] },
    { pattern: /no credit card/i, terms: ["no card", "free"] },
];

/**
 * Expands search query with related terms using concept mapping
 */
function expandQuery(query: string): string[] {
    const lowerQuery = query.toLowerCase().trim();
    const terms = new Set<string>([lowerQuery]);

    // Check for intent patterns first
    for (const { pattern, terms: intentTerms } of INTENT_PATTERNS) {
        if (pattern.test(lowerQuery)) {
            intentTerms.forEach(term => terms.add(term));
        }
    }

    // Split query into words and expand each
    const words = lowerQuery.split(/\s+/);
    for (const word of words) {
        terms.add(word);

        // Check if word matches any concept
        if (CONCEPT_MAP[word]) {
            CONCEPT_MAP[word].forEach(related => terms.add(related));
        }

        // Check for partial matches in concept keys
        for (const [concept, related] of Object.entries(CONCEPT_MAP)) {
            if (concept.includes(word) || word.includes(concept)) {
                related.forEach(term => terms.add(term));
                terms.add(concept);
            }
        }
    }

    // Check for multi-word phrases in concept map
    for (const [phrase, related] of Object.entries(CONCEPT_MAP)) {
        if (lowerQuery.includes(phrase)) {
            related.forEach(term => terms.add(term));
        }
    }

    return Array.from(terms);
}

/**
 * Main smart search function
 */
export function smartSearch(resources: Resource[], query: string): Resource[] {
    if (!query.trim()) {
        return resources;
    }

    // Expand the query with related terms
    const expandedTerms = expandQuery(query);
    const expandedQuery = expandedTerms.join(" ");

    // Configure Fuse.js with optimized settings
    const fuse = new Fuse(resources, {
        keys: [
            { name: "toolName", weight: 4 },
            { name: "tags", weight: 3 },
            { name: "category", weight: 2.5 },
            { name: "useCase", weight: 2 },
            { name: "freeWhat", weight: 1.5 },
            { name: "recommendedFor", weight: 2 },
            { name: "eligibility", weight: 1 },
        ],
        threshold: 0.45,  // Slightly more relaxed for better recall
        distance: 100,
        minMatchCharLength: 2,
        ignoreLocation: true,  // Search entire string, not just start
        useExtendedSearch: true,
        includeScore: true,
    });

    // Search with expanded query
    const expandedResults = fuse.search(expandedQuery);

    // Also search with original query for exact matches
    const exactResults = fuse.search(query);

    // Combine results, prioritizing exact matches
    const seenTools = new Set<string>();
    const combinedResults: Resource[] = [];

    // Add exact matches first
    for (const result of exactResults) {
        if (!seenTools.has(result.item.toolName)) {
            seenTools.add(result.item.toolName);
            combinedResults.push(result.item);
        }
    }

    // Add expanded results
    for (const result of expandedResults) {
        if (!seenTools.has(result.item.toolName)) {
            seenTools.add(result.item.toolName);
            combinedResults.push(result.item);
        }
    }

    // If no results found, try a more lenient search
    if (combinedResults.length === 0) {
        const lenientFuse = new Fuse(resources, {
            keys: [
                { name: "toolName", weight: 3 },
                { name: "tags", weight: 2 },
                { name: "category", weight: 2 },
                { name: "useCase", weight: 1.5 },
                { name: "freeWhat", weight: 1 },
            ],
            threshold: 0.6,  // Very lenient
            distance: 200,
            minMatchCharLength: 1,
            ignoreLocation: true,
        });

        const lenientResults = lenientFuse.search(query);
        return lenientResults.map(r => r.item);
    }

    return combinedResults;
}

/**
 * Get search suggestions based on partial input
 */
export function getSearchSuggestions(query: string): string[] {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery || lowerQuery.length < 2) return [];

    const suggestions: string[] = [];

    // Find matching concepts
    for (const concept of Object.keys(CONCEPT_MAP)) {
        if (concept.includes(lowerQuery) || lowerQuery.includes(concept)) {
            suggestions.push(concept);
        }
    }

    return suggestions.slice(0, 5);
}
