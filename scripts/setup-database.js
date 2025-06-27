#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config();

/**
 * FuelWarden Database Setup Script
 * 
 * This script helps you set up your Appwrite database with the correct
 * collections, attributes, and permissions for the FuelWarden app.
 * 
 * Usage:
 * 1. Install dependencies: npm install
 * 2. Set up environment variables
 * 3. Run: node scripts/setup-database.js
 */

const { Client, Databases, Users, Teams } = require('node-appwrite');

// Configuration
const config = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6854d601002800d85e1a',
  apiKey: process.env.APPWRITE_API_KEY, // You'll need to create this in Appwrite console
};

// Database and collection IDs
const DATABASE_ID = 'fuelwarden';
const COLLECTIONS = {
  user_profiles: 'user_profiles',
  meal_logs: 'meal_logs',
  meal_plans: 'meal_plans',
  activity_schedule: 'activity_schedule'
};

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);
const users = new Users(client);
const teams = new Teams(client);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

async function checkPrerequisites() {
  logInfo('Checking prerequisites...');
  
  if (!config.apiKey) {
    logError('APPWRITE_API_KEY environment variable is required');
    logInfo('Please create an API key in your Appwrite console and set it as an environment variable');
    process.exit(1);
  }
  
  logSuccess('Prerequisites check passed');
}

async function createDatabase() {
  try {
    logInfo('Creating database...');
    await databases.create(DATABASE_ID, 'FuelWarden Database');
    logSuccess(`Database '${DATABASE_ID}' created successfully`);
  } catch (error) {
    if (error.code === 409) {
      logWarning(`Database '${DATABASE_ID}' already exists`);
    } else if (error.code === 403 && error.type === 'additional_resource_not_allowed') {
      logWarning('Database limit reached. Checking if database already exists...');
      try {
        const existingDatabase = await databases.get(DATABASE_ID);
        logSuccess(`Database '${existingDatabase.name}' already exists and is accessible`);
      } catch (getError) {
        logError('Database limit reached and database does not exist. Please upgrade your Appwrite plan or delete unused databases.');
        throw new Error('Database limit reached. Please upgrade your Appwrite plan or delete unused databases.');
      }
    } else {
      throw error;
    }
  }
}

async function createUserProfilesCollection() {
  try {
    logInfo('Creating user_profiles collection...');
    
    await databases.createCollection(
      DATABASE_ID,
      COLLECTIONS.user_profiles,
      'User Profiles',
      {
        read: ['role:users'],
        write: ['role:users'],
        create: ['role:users'],
        update: ['role:users'],
        delete: ['role:users']
      }
    );
    
    // Create indexes
    await databases.createIndex(DATABASE_ID, COLLECTIONS.user_profiles, 'userId', 'key', ['userId']);
    
    logSuccess('user_profiles collection created successfully');
  } catch (error) {
    if (error.code === 409) {
      logWarning('user_profiles collection already exists');
    } else {
      throw error;
    }
  }
}

async function createMealLogsCollection() {
  try {
    logInfo('Creating meal_logs collection...');
    
    await databases.createCollection(
      DATABASE_ID,
      COLLECTIONS.meal_logs,
      'Meal Logs',
      {
        read: ['role:users'],
        write: ['role:users'],
        create: ['role:users'],
        update: ['role:users'],
        delete: ['role:users']
      }
    );
    
    // Create indexes
    await databases.createIndex(DATABASE_ID, COLLECTIONS.meal_logs, 'userId', 'key', ['userId']);
    await databases.createIndex(DATABASE_ID, COLLECTIONS.meal_logs, 'date', 'key', ['date']);
    await databases.createIndex(DATABASE_ID, COLLECTIONS.meal_logs, 'userId_date', 'key', ['userId', 'date']);
    
    logSuccess('meal_logs collection created successfully');
  } catch (error) {
    if (error.code === 409) {
      logWarning('meal_logs collection already exists');
    } else {
      throw error;
    }
  }
}

async function createMealPlansCollection() {
  try {
    logInfo('Creating meal_plans collection...');
    
    await databases.createCollection(
      DATABASE_ID,
      COLLECTIONS.meal_plans,
      'Meal Plans',
      {
        read: ['role:users'],
        write: ['role:users'],
        create: ['role:users'],
        update: ['role:users'],
        delete: ['role:users']
      }
    );
    
    // Create indexes
    await databases.createIndex(DATABASE_ID, COLLECTIONS.meal_plans, 'userId', 'key', ['userId']);
    await databases.createIndex(DATABASE_ID, COLLECTIONS.meal_plans, 'date', 'key', ['date']);
    await databases.createIndex(DATABASE_ID, COLLECTIONS.meal_plans, 'userId_date', 'key', ['userId', 'date']);
    
    logSuccess('meal_plans collection created successfully');
  } catch (error) {
    if (error.code === 409) {
      logWarning('meal_plans collection already exists');
    } else {
      throw error;
    }
  }
}

async function createActivityScheduleCollection() {
  try {
    logInfo('Creating activity_schedule collection...');
    
    await databases.createCollection(
      DATABASE_ID,
      COLLECTIONS.activity_schedule,
      'Activity Schedule',
      {
        read: ['role:users'],
        write: ['role:users'],
        create: ['role:users'],
        update: ['role:users'],
        delete: ['role:users']
      }
    );
    
    // Create indexes
    await databases.createIndex(DATABASE_ID, COLLECTIONS.activity_schedule, 'userId', 'key', ['userId']);
    await databases.createIndex(DATABASE_ID, COLLECTIONS.activity_schedule, 'date', 'key', ['date']);
    await databases.createIndex(DATABASE_ID, COLLECTIONS.activity_schedule, 'userId_date', 'key', ['userId', 'date']);
    
    logSuccess('activity_schedule collection created successfully');
  } catch (error) {
    if (error.code === 409) {
      logWarning('activity_schedule collection already exists');
    } else {
      throw error;
    }
  }
}

async function verifySetup() {
  logInfo('Verifying setup...');
  
  try {
    const database = await databases.get(DATABASE_ID);
    logSuccess(`Database '${database.name}' verified`);
    
    const collections = await databases.listCollections(DATABASE_ID);
    logSuccess(`Found ${collections.collections.length} collections`);
    
    for (const collection of collections.collections) {
      logInfo(`- ${collection.name} (${collection.$id})`);
    }
    
  } catch (error) {
    logError('Setup verification failed');
    throw error;
  }
}

async function main() {
  try {
    log('🚀 Starting FuelWarden Database Setup', 'bright');
    log('');
    
    await checkPrerequisites();
    await createDatabase();
    await createUserProfilesCollection();
    await createMealLogsCollection();
    await createMealPlansCollection();
    await createActivityScheduleCollection();
    await verifySetup();
    
    log('');
    logSuccess('Database setup completed successfully!');
    log('');
    logInfo('Next steps:');
    logInfo('1. Test your setup by visiting /test in your app');
    logInfo('2. Create a user account and complete onboarding');
    logInfo('3. Verify that profile data is saved correctly');
    log('');
    
  } catch (error) {
    logError('Setup failed');
    console.error(error);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  main();
}

module.exports = {
  createDatabase,
  createUserProfilesCollection,
  createMealLogsCollection,
  createMealPlansCollection,
  createActivityScheduleCollection,
  verifySetup
}; 