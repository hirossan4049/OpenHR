import { env } from "~/env";

// Discord API base URL
const DISCORD_API_BASE = "https://discord.com/api/v10";

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const MAX_RETRIES = 3;

export interface DiscordGuildMember {
  user?: {
    id: string;
    username: string;
    discriminator: string;
    global_name?: string;
    avatar?: string;
  };
  nick?: string;
  joined_at?: string;
}

export interface DiscordGuild {
  id: string;
  name: string;
  member_count?: number;
}

export class DiscordService {
  private readonly botToken: string;

  constructor() {
    this.botToken = env.DISCORD_BOT_TOKEN;
  }

  private async makeRequest(endpoint: string, options?: RequestInit): Promise<any> {
    const url = `${DISCORD_API_BASE}${endpoint}`;
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bot ${this.botToken}`,
            'Content-Type': 'application/json',
            ...options?.headers,
          },
        });

        if (response.status === 429) {
          // Rate limited - wait and retry
          const retryAfter = response.headers.get('retry-after');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : RATE_LIMIT_DELAY;
          console.warn(`Discord API rate limited, waiting ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        if (!response.ok) {
          throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`Discord API request attempt ${attempt + 1} failed:`, lastError.message);
        
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Get guild information
   */
  async getGuild(guildId: string): Promise<DiscordGuild> {
    return this.makeRequest(`/guilds/${guildId}`);
  }

  /**
   * Get all members from a guild with pagination
   */
  async getAllGuildMembers(guildId: string): Promise<DiscordGuildMember[]> {
    const members: DiscordGuildMember[] = [];
    let after = '';
    const limit = 1000; // Discord's max limit per request

    while (true) {
      const query = new URLSearchParams({
        limit: limit.toString(),
        ...(after && { after }),
      });

      console.log(`Fetching guild members: ${members.length} collected so far...`);
      
      const batch = await this.makeRequest(`/guilds/${guildId}/members?${query}`);
      
      if (!Array.isArray(batch) || batch.length === 0) {
        break;
      }

      members.push(...batch);

      // If we got less than the limit, we've reached the end
      if (batch.length < limit) {
        break;
      }

      // Set up for next batch
      after = batch[batch.length - 1]?.user?.id;
      if (!after) {
        break;
      }

      // Rate limiting - wait between requests
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    }

    console.log(`Fetched ${members.length} total members from guild ${guildId}`);
    return members;
  }

  /**
   * Check if the bot has required permissions
   */
  async validateBotPermissions(guildId: string): Promise<{ hasPermissions: boolean; missingPermissions: string[] }> {
    try {
      // Try to get the bot's member info from the guild
      const botUser = await this.makeRequest('/users/@me');
      const botMember = await this.makeRequest(`/guilds/${guildId}/members/${botUser.id}`);
      
      // For now, just check if we can access the guild and get member info
      // In a full implementation, you'd check specific permissions
      return {
        hasPermissions: true,
        missingPermissions: []
      };
    } catch (error) {
      console.error('Bot permission validation failed:', error);
      return {
        hasPermissions: false,
        missingPermissions: ['VIEW_GUILD', 'VIEW_GUILD_MEMBERS']
      };
    }
  }
}

// Singleton instance
export const discordService = new DiscordService();