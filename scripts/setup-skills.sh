#!/bin/bash

# OpenHR Skill Master Setup Script
# This script applies database migrations and seeds initial skill data

echo "🚀 Setting up OpenHR Skill Master Management..."

# Check if database exists
if [ ! -f "prisma/dev.db" ]; then
    echo "⚠️  Database not found. Creating new database..."
    npx prisma db push
fi

echo "📋 Applying skill master migrations..."

# Apply the skill master migration
sqlite3 prisma/dev.db < prisma/migrations/001_add_skill_master_fields.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
else
    echo "❌ Migration failed!"
    exit 1
fi

echo "🌱 Seeding initial skill master data..."

# Apply the skill seed data
sqlite3 prisma/dev.db < prisma/seed.sql

if [ $? -eq 0 ]; then
    echo "✅ Skill master data seeded successfully!"
    echo "📊 Added major technologies with logos and verification status"
else
    echo "❌ Seeding failed!"
    exit 1
fi

echo "🎉 Setup complete! You can now:"
echo "  • Use the enhanced skill selection UI with logos"
echo "  • Access admin skill management at /admin/skills"
echo "  • Search skills by name, slug, or aliases"
echo "  • Create new skills with proper normalization"

echo ""
echo "📖 Next steps:"
echo "  1. Start the development server: npm run dev"
echo "  2. Visit /admin/skills to manage the skill master database"
echo "  3. Test the new skill selection in user profiles"