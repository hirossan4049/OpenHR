import { describe, it, expect } from '@jest/globals';
import { skillMasterSchema, skillSearchSchema, skillSuggestionSchema } from '~/lib/validation/skill';

describe('Skill Master Validation', () => {
  describe('skillMasterSchema', () => {
    it('should validate a valid skill master', () => {
      const validSkill = {
        name: 'React',
        slug: 'react',
        category: 'Frontend',
        logoUrl: 'https://example.com/react.svg',
        aliases: ['ReactJS', 'React.js'],
        verified: true,
      };

      const result = skillMasterSchema.safeParse(validSkill);
      expect(result.success).toBe(true);
    });

    it('should reject invalid slug format', () => {
      const invalidSkill = {
        name: 'React',
        slug: 'React@#$', // Invalid characters
        verified: false,
      };

      const result = skillMasterSchema.safeParse(invalidSkill);
      expect(result.success).toBe(false);
    });

    it('should reject invalid URL for logoUrl', () => {
      const invalidSkill = {
        name: 'React',
        slug: 'react',
        logoUrl: 'not-a-url',
        verified: false,
      };

      const result = skillMasterSchema.safeParse(invalidSkill);
      expect(result.success).toBe(false);
    });

    it('should allow empty string for logoUrl', () => {
      const validSkill = {
        name: 'React',
        slug: 'react',
        logoUrl: '',
        verified: false,
      };

      const result = skillMasterSchema.safeParse(validSkill);
      expect(result.success).toBe(true);
    });

    it('should set default values correctly', () => {
      const minimalSkill = {
        name: 'React',
        slug: 'react',
      };

      const result = skillMasterSchema.parse(minimalSkill);
      expect(result.verified).toBe(false);
    });
  });

  describe('skillSearchSchema', () => {
    it('should validate search input', () => {
      const validSearch = {
        query: 'react',
        limit: 10,
      };

      const result = skillSearchSchema.safeParse(validSearch);
      expect(result.success).toBe(true);
    });

    it('should apply default limit', () => {
      const searchInput = {
        query: 'react',
      };

      const result = skillSearchSchema.parse(searchInput);
      expect(result.limit).toBe(10);
    });

    it('should reject empty query', () => {
      const invalidSearch = {
        query: '',
        limit: 10,
      };

      const result = skillSearchSchema.safeParse(invalidSearch);
      expect(result.success).toBe(false);
    });

    it('should reject limit out of range', () => {
      const invalidSearch = {
        query: 'react',
        limit: 100, // Too high
      };

      const result = skillSearchSchema.safeParse(invalidSearch);
      expect(result.success).toBe(false);
    });
  });

  describe('skillSuggestionSchema', () => {
    it('should validate skill suggestion', () => {
      const validSuggestion = {
        name: 'New Framework',
        category: 'Frontend',
      };

      const result = skillSuggestionSchema.safeParse(validSuggestion);
      expect(result.success).toBe(true);
    });

    it('should allow missing category', () => {
      const validSuggestion = {
        name: 'New Framework',
      };

      const result = skillSuggestionSchema.safeParse(validSuggestion);
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const invalidSuggestion = {
        name: '',
        category: 'Frontend',
      };

      const result = skillSuggestionSchema.safeParse(invalidSuggestion);
      expect(result.success).toBe(false);
    });
  });

  describe('Slug Generation Logic', () => {
    it('should generate valid slugs from skill names', () => {
      const generateSlug = (name: string) => {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim();
      };

      expect(generateSlug('React.js')).toBe('reactjs');
      expect(generateSlug('Vue.js 3')).toBe('vuejs-3');
      expect(generateSlug('C#')).toBe('c');
      expect(generateSlug('Node.js')).toBe('nodejs');
      expect(generateSlug('TypeScript')).toBe('typescript');
    });
  });
});