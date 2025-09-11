# Discord Member Auto-Registration Feature

This document describes the Discord member auto-registration functionality implemented for the OpenHR TMS application.

## Overview

The Discord member auto-registration feature allows administrators to automatically register all members from a specified Discord server as provisional users in the OpenHR system. This feature includes:

- **Automated Member Sync**: Fetch all members from Discord servers using the Discord API
- **User Linking**: Automatically link Discord members with existing OpenHR users who have Discord OAuth accounts
- **Provisional Users**: Create provisional user records for Discord members without existing accounts
- **Admin Management**: Complete admin interface for managing Discord server synchronization

## Features Implemented

### 1. Database Schema

#### DiscordMember Model
- **discordId**: Discord user ID (snowflake)
- **guildId**: Discord server/guild ID
- **username**: Discord username
- **discriminator**: Discord discriminator (legacy)
- **displayName**: Discord display name or nickname
- **avatar**: Discord avatar hash
- **joinedAt**: When user joined the Discord server
- **userId**: Link to OpenHR User if connected
- **syncStatus**: Member status (active, left, error)
- **syncedAt**: Last synchronization timestamp

#### GuildSync Model
- **guildId**: Discord server/guild ID
- **guildName**: Discord server name
- **lastSyncedAt**: Last successful sync timestamp
- **status**: Sync status (pending, syncing, completed, error)
- **totalMembers**: Total members found in last sync
- **syncedMembers**: Successfully synced members
- **lastError**: Last error message if sync failed

### 2. Discord API Integration

#### DiscordService
- **Rate Limiting**: Implements proper rate limiting with retry logic
- **Pagination**: Handles large servers with chunked member fetching
- **Error Handling**: Comprehensive error handling with detailed logging
- **Permission Validation**: Validates bot permissions before sync

#### Key Methods
- `getGuild(guildId)`: Fetch Discord server information
- `getAllGuildMembers(guildId)`: Fetch all members with pagination
- `validateBotPermissions(guildId)`: Check bot permissions

### 3. Member Synchronization

#### DiscordMemberSyncService
- **Batch Processing**: Processes members in batches to avoid overwhelming the database
- **Idempotent Operations**: Upsert operations ensure no data duplication
- **User Linking**: Automatically links Discord members with existing users
- **Error Recovery**: Continues processing even if individual member sync fails

#### Sync Process
1. Validate bot permissions
2. Fetch Discord server information
3. Retrieve all server members (with pagination)
4. Process members in batches
5. Upsert member records to database
6. Link with existing users where possible
7. Update sync status and statistics

### 4. Admin Interface

#### Discord Management Dashboard
- **Server List**: View all configured Discord servers
- **Sync Status**: Real-time sync status and progress
- **Member Management**: View and manage Discord members
- **Manual Sync**: Trigger manual synchronization
- **User Linking**: Manual user linking capabilities

#### Features
- Add Discord servers for synchronization
- View sync history and statistics
- Search and filter Discord members
- Link/unlink Discord members with OpenHR users
- Error monitoring and reporting

### 5. API Endpoints (tRPC)

#### Admin Router Extensions
- `getGuildSyncs`: Get all guild sync statuses
- `getGuildSyncStatus`: Get specific guild sync status
- `syncGuildMembers`: Trigger member synchronization
- `getGuildMembers`: Get Discord members with pagination/search
- `linkDiscordMember`: Link Discord member to user
- `unlinkDiscordMember`: Unlink Discord member from user

## Setup Instructions

### 1. Environment Configuration

Add Discord bot token to environment variables:

```env
DISCORD_BOT_TOKEN="your-discord-bot-token"
```

### 2. Discord Bot Setup

1. Create a Discord application at https://discord.com/developers/applications
2. Create a bot user and copy the bot token
3. Enable the following privileged gateway intents:
   - **SERVER MEMBERS INTENT**: Required to access guild member information
   - **MESSAGE CONTENT INTENT**: Optional, for future features

4. Invite the bot to your Discord server with permissions:
   - **View Channels**
   - **View Server Members**

### 3. Database Migration

Run the database migration to create the new tables:

```bash
bun run db:push
```

### 4. Bot Permissions

Ensure your Discord bot has the following permissions in the target server:
- **View Channels**: To access the server
- **View Server Members**: To read member list (requires SERVER MEMBERS INTENT)

## Usage

### For Administrators

1. **Navigate to Admin Dashboard**: Go to `/admin`
2. **Access Discord Management**: Click "Manage Discord"
3. **Add Discord Server**: 
   - Click "Add Server"
   - Enter the Discord server ID (17-19 digit number)
   - Click "Add Server" to start initial sync
4. **Monitor Sync Progress**: View sync status and progress in the dashboard
5. **Manage Members**: 
   - Click "View Members" to see all synced Discord members
   - Use search to find specific members
   - Link/unlink members with OpenHR users as needed

### Discord Server ID

To get your Discord server ID:
1. Enable Developer Mode in Discord settings
2. Right-click on your server name
3. Click "Copy Server ID"

## Security Considerations

### 1. Bot Token Security
- Store bot token securely in environment variables
- Never commit bot tokens to version control
- Rotate bot tokens periodically

### 2. Rate Limiting
- Implements Discord API rate limiting
- Automatic retry with exponential backoff
- Respects Discord's rate limit headers

### 3. Data Privacy
- Only syncs publicly available Discord member information
- No message content or private data is accessed
- Users can request data deletion

### 4. Access Control
- Admin-only access to Discord management features
- Proper authentication required for all admin endpoints
- Input validation on all API endpoints

## Monitoring and Troubleshooting

### 1. Sync Status Monitoring
- Real-time sync status display
- Error logging and reporting
- Sync statistics and metrics

### 2. Common Issues

#### Bot Permission Errors
- **Cause**: Bot missing required permissions
- **Solution**: Ensure bot has "View Server Members" permission and SERVER MEMBERS INTENT is enabled

#### Rate Limiting
- **Cause**: Too many API requests
- **Solution**: Automatic retry with delays, no manual intervention needed

#### Large Server Timeouts
- **Cause**: Very large Discord servers (10k+ members)
- **Solution**: Batch processing and chunked fetching handles large servers automatically

### 3. Error Logs
All sync operations are logged with detailed error information for troubleshooting.

## Testing

### Unit Tests
Run Discord service tests:
```bash
bun run test src/tests/discord-service.test.ts
```

### Integration Testing
1. Set up test Discord server
2. Configure bot token in test environment
3. Run sync operations and verify database state

## Future Enhancements

### Planned Features
- **Automatic Periodic Sync**: Scheduled background synchronization
- **Member Status Tracking**: Track when members leave/join servers
- **Role Synchronization**: Sync Discord roles with OpenHR permissions
- **Webhook Integration**: Real-time member updates via Discord webhooks
- **Bulk User Creation**: Option to create full OpenHR accounts for all Discord members

### Community Features
- **Member Notifications**: Notify Discord members about their OpenHR accounts
- **Consent Management**: Member consent tracking for data processing
- **Privacy Controls**: Individual member data management options

## Technical Architecture

### Dependencies
- **Discord API v10**: REST API for Discord integration
- **Prisma ORM**: Database operations and migrations
- **tRPC**: Type-safe API endpoints
- **Next.js**: Application framework
- **NextAuth.js**: Authentication system

### Performance Optimizations
- **Batch Processing**: Efficient database operations
- **Pagination**: Memory-efficient member fetching
- **Caching**: Future implementation for frequently accessed data
- **Background Jobs**: Future implementation for scheduled syncs

---

**Implementation Status**: ✅ Complete  
**Last Updated**: December 2024  
**Version**: 1.0.0