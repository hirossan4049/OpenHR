import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { DiscordGuildMember } from "~/server/services/discord";

// Mock environment variables
jest.mock('~/env', () => ({
  env: {
    DISCORD_BOT_TOKEN: 'test-bot-token'
  }
}));

// Mock fetch (type-safe) without re-declaring global symbol
let mockFetch: jest.MockedFunction<typeof global.fetch>;

import { DiscordService } from '~/server/services/discord';

describe('DiscordService', () => {
  let discordService: DiscordService;

  beforeEach(() => {
    discordService = new DiscordService();
    // Fresh mock per test
    mockFetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;
    global.fetch = mockFetch as unknown as typeof global.fetch;
  });

  describe('getGuild', () => {
    it('should fetch guild information successfully', async () => {
      const mockGuild = {
        id: '123456789012345678',
        name: 'Test Guild',
        member_count: 100
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockGuild,
        headers: new Headers()
      } as Response);

      const result = await discordService.getGuild('123456789012345678');

      expect(result).toEqual(mockGuild);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://discord.com/api/v10/guilds/123456789012345678',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bot test-bot-token',
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers()
      } as Response);

      await expect(discordService.getGuild('invalid-guild-id')).rejects.toThrow(
        'Discord API error: 404 Not Found'
      );
    });

    it('should handle rate limiting', async () => {
      // First call: rate limited
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({ 'retry-after': '1' })
      } as Response);

      // Second call: success
      const mockGuild = { id: '123', name: 'Test Guild' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockGuild,
        headers: new Headers()
      } as Response);

      const result = await discordService.getGuild('123456789012345678');
      
      expect(result).toEqual(mockGuild);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('getAllGuildMembers', () => {
    it('should fetch all guild members with pagination', async () => {
      const mockMembers1 = [
        { user: { id: '1', username: 'user1', discriminator: '0001' } },
        { user: { id: '2', username: 'user2', discriminator: '0002' } }
      ];
      const mockMembers2: DiscordGuildMember[] = []; // Empty array to simulate end of pagination

      // First page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockMembers1,
        headers: new Headers()
      } as Response);

      // Second page (empty)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockMembers2,
        headers: new Headers()
      } as Response);

      const result = await discordService.getAllGuildMembers('123456789012345678');

      expect(result).toEqual(mockMembers1);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('validateBotPermissions', () => {
    it('should validate bot permissions successfully', async () => {
      const mockBotUser = { id: 'bot-id', username: 'TestBot' };
      const mockBotMember = { user: mockBotUser, permissions: 'some-permissions' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockBotUser,
        headers: new Headers()
      } as Response);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockBotMember,
        headers: new Headers()
      } as Response);

      const result = await discordService.validateBotPermissions('123456789012345678');

      expect(result.hasPermissions).toBe(true);
      expect(result.missingPermissions).toEqual([]);
    });

    it('should handle permission validation failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        headers: new Headers()
      } as Response);

      const result = await discordService.validateBotPermissions('123456789012345678');

      expect(result.hasPermissions).toBe(false);
      expect(result.missingPermissions).toEqual(['VIEW_GUILD', 'VIEW_GUILD_MEMBERS']);
    });
  });
});
