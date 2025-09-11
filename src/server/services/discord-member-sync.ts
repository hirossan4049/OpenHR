import { db } from "~/server/db";
import { discordService, type DiscordGuildMember } from "~/server/services/discord";

export function getDiscordAvatarUrl(userId: string, avatarHash?: string | null, size: number = 128): string | null {
  if (!avatarHash) return null;
  const format = avatarHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${format}?size=${size}`;
}

export interface SyncResult {
  success: boolean;
  totalMembers: number;
  syncedMembers: number;
  linkedMembers: number;
  errors: string[];
}

export class DiscordMemberSyncService {
  /**
   * Sync all members from a Discord guild
   */
  async syncGuildMembers(guildId: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      totalMembers: 0,
      syncedMembers: 0,
      linkedMembers: 0,
      errors: []
    };

    try {
      // Update guild sync status to 'syncing'
      await this.updateGuildSyncStatus(guildId, 'syncing');

      // Validate bot permissions first
      const permissionCheck = await discordService.validateBotPermissions(guildId);
      if (!permissionCheck.hasPermissions) {
        throw new Error(`Bot missing permissions: ${permissionCheck.missingPermissions.join(', ')}`);
      }

      // Get guild info
      const guild = await discordService.getGuild(guildId);
      
      // Fetch all guild members
      const discordMembers = await discordService.getAllGuildMembers(guildId);
      result.totalMembers = discordMembers.length;

      // Process members in batches to avoid overwhelming the database
      const batchSize = 100;
      for (let i = 0; i < discordMembers.length; i += batchSize) {
        const batch = discordMembers.slice(i, i + batchSize);
        
        try {
          const batchResult = await this.processMemberBatch(guildId, batch);
          result.syncedMembers += batchResult.syncedCount;
          result.linkedMembers += batchResult.linkedCount;
        } catch (error) {
          const errorMsg = `Batch ${Math.floor(i / batchSize) + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      // Update guild sync status
      await this.updateGuildSyncStatus(guildId, 'completed', {
        guildName: guild.name,
        totalMembers: result.totalMembers,
        syncedMembers: result.syncedMembers,
      });

      result.success = result.errors.length === 0;
      return result;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Guild sync failed:', errorMsg);
      
      result.errors.push(errorMsg);
      
      // Update guild sync status to 'error'
      await this.updateGuildSyncStatus(guildId, 'error', undefined, errorMsg);
      
      return result;
    }
  }

  /**
   * Process a batch of Discord members
   */
  private async processMemberBatch(guildId: string, members: DiscordGuildMember[]): Promise<{ syncedCount: number; linkedCount: number }> {
    let syncedCount = 0;
    let linkedCount = 0;

    for (const member of members) {
      if (!member.user || member.user.bot) continue; // Exclude bots

      try {
        // Find existing user by Discord account (OAuth-linked)
        const existingUserAccount = await db.account.findFirst({
          where: {
            provider: 'discord',
            providerAccountId: member.user.id
          },
          include: {
            user: true
          }
        });

        // Find any existing DiscordMember record to preserve previous linkage
        const existingDiscordMember = await db.discordMember.findUnique({
          where: {
            discordId_guildId: {
              discordId: member.user.id,
              guildId: guildId
            }
          }
        });

        // Decide which userId to set
        let targetUserId: string | null = existingUserAccount?.user.id || existingDiscordMember?.userId || null;

        // If not linked to any user yet, provision a placeholder User for directory visibility
        if (!targetUserId) {
          const placeholder = await db.user.create({
            data: {
              name: member.user.global_name || member.nick || member.user.username || 'Discord User',
              image: getDiscordAvatarUrl(member.user.id, member.user.avatar, 128),
            }
          });
          targetUserId = placeholder.id;
        }

        // Upsert Discord member record
        await db.discordMember.upsert({
          where: {
            discordId_guildId: {
              discordId: member.user.id,
              guildId: guildId
            }
          },
          update: {
            username: member.user.username,
            discriminator: member.user.discriminator || null,
            displayName: member.user.global_name || member.nick || null,
            avatar: member.user.avatar || null,
            joinedAt: member.joined_at ? new Date(member.joined_at) : null,
            userId: targetUserId,
            syncedAt: new Date(),
            syncStatus: 'active'
          },
          create: {
            discordId: member.user.id,
            guildId: guildId,
            username: member.user.username,
            discriminator: member.user.discriminator || null,
            displayName: member.user.global_name || member.nick || null,
            avatar: member.user.avatar || null,
            joinedAt: member.joined_at ? new Date(member.joined_at) : null,
            userId: targetUserId,
            syncedAt: new Date(),
            syncStatus: 'active'
          }
        });

        syncedCount++;
        if (targetUserId) {
          linkedCount++;
        }

      } catch (error) {
        console.error(`Failed to sync member ${member.user.id}:`, error);
        // Continue with other members instead of failing the entire batch
      }
    }

    return { syncedCount, linkedCount };
  }

  /**
   * Update guild sync status
   */
  private async updateGuildSyncStatus(
    guildId: string, 
    status: string, 
    data?: { guildName?: string; totalMembers?: number; syncedMembers?: number },
    error?: string
  ): Promise<void> {
    await db.guildSync.upsert({
      where: { guildId },
      update: {
        status,
        lastSyncedAt: status === 'completed' ? new Date() : undefined,
        totalMembers: data?.totalMembers,
        syncedMembers: data?.syncedMembers,
        lastError: error || null,
        guildName: data?.guildName
      },
      create: {
        guildId,
        guildName: data?.guildName || null,
        status,
        lastSyncedAt: status === 'completed' ? new Date() : null,
        totalMembers: data?.totalMembers || null,
        syncedMembers: data?.syncedMembers || null,
        lastError: error || null
      }
    });
  }

  /**
   * Get sync status for a guild
   */
  async getGuildSyncStatus(guildId: string) {
    return db.guildSync.findUnique({
      where: { guildId },
      include: {
        _count: {
          select: {
            members: true
          }
        }
      }
    });
  }

  /**
   * Get Discord members for a guild with pagination
   */
  async getGuildMembers(guildId: string, options: { skip?: number; take?: number; search?: string } = {}) {
    const { skip = 0, take = 50, search } = options;

    const where: any = { guildId };
    
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { displayName: { contains: search } }
      ];
    }

    const [members, total] = await Promise.all([
      db.discordMember.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        },
        orderBy: { username: 'asc' },
        skip,
        take
      }),
      db.discordMember.count({ where })
    ]);

    return {
      members,
      total,
      hasMore: skip + take < total
    };
  }
}

// Singleton instance
export const discordMemberSyncService = new DiscordMemberSyncService();
