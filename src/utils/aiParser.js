import { aiResponses } from './aiResponses';

export function parseAiQuery(query) {
    const cleanQuery = query.toLowerCase().trim();

    if (cleanQuery.includes('rag') || cleanQuery.includes('pipeline') || cleanQuery.includes('faiss') || cleanQuery.includes('vector')) {
        return aiResponses.rag;
    }
    if (cleanQuery.includes('stack') || cleanQuery.includes('technolog') || cleanQuery.includes('skill') || cleanQuery.includes('language')) {
        return aiResponses.stack;
    }
    if (cleanQuery.includes('experience') || cleanQuery.includes('work') || cleanQuery.includes('history') || cleanQuery.includes('resume') || cleanQuery.includes('job')) {
        return aiResponses.experience;
    }
    if (cleanQuery.includes('contact') || cleanQuery.includes('email') || cleanQuery.includes('hire') || cleanQuery.includes('linkedin') || cleanQuery.includes('github') || cleanQuery.includes('reach')) {
        return aiResponses.contact;
    }
    if (cleanQuery.includes('project') || cleanQuery.includes('built') || cleanQuery.includes('create')) {
        return aiResponses.projects;
    }

    return aiResponses.default;
}
