import { describe, it, expect } from 'vitest';
import { parseAiQuery } from '../utils/aiParser';
import { aiResponses } from '../utils/aiResponses';

describe('parseAiQuery', () => {
  it('returns rag response for rag-related keywords', () => {
    expect(parseAiQuery('tell me about your rag pipeline')).toBe(aiResponses.rag);
    expect(parseAiQuery('faiss')).toBe(aiResponses.rag);
    expect(parseAiQuery('VECTOR')).toBe(aiResponses.rag);
  });

  it('returns stack response for technology keywords', () => {
    expect(parseAiQuery('what is your tech stack?')).toBe(aiResponses.stack);
    expect(parseAiQuery('what languages do you know?')).toBe(aiResponses.stack);
  });

  it('returns experience response for job/history keywords', () => {
    expect(parseAiQuery('work experience')).toBe(aiResponses.experience);
    expect(parseAiQuery('resume')).toBe(aiResponses.experience);
    expect(parseAiQuery('job history')).toBe(aiResponses.experience);
  });

  it('returns contact response for contact keywords', () => {
    expect(parseAiQuery('how to contact you')).toBe(aiResponses.contact);
    expect(parseAiQuery('email address')).toBe(aiResponses.contact);
    expect(parseAiQuery('linkedin profile')).toBe(aiResponses.contact);
  });

  it('returns projects response for project-related keywords', () => {
    expect(parseAiQuery('what projects have you built?')).toBe(aiResponses.projects);
    expect(parseAiQuery('create')).toBe(aiResponses.projects);
  });

  it('returns default response for unknown or empty queries', () => {
    expect(parseAiQuery('tell me a joke')).toBe(aiResponses.default);
    expect(parseAiQuery('   ')).toBe(aiResponses.default);
    expect(parseAiQuery('hello world')).toBe(aiResponses.default);
  });

  it('is case insensitive and trims whitespace', () => {
    expect(parseAiQuery('   RAG   ')).toBe(aiResponses.rag);
    expect(parseAiQuery('SKILL')).toBe(aiResponses.stack);
  });
});
