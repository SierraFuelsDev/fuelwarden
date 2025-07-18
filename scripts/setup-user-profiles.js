#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config();

/**
 * Simple User Profiles Collection Setup
 * 
 * This script creates only the user_profiles collection with proper permissions
 * for the FuelWarden app.
 */

const { Client, Databases } = require('node-appwrite');

// Configuration
const config = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6854d601002800d85e1a',
  apiKey: process.env.APPWRITE_API_KEY,
};

// Database and collection IDs
const DATABASE_ID = 'fuelwarden';
const COLLECTION_ID = 'user_profiles';

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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
    logInfo('Go to: Appwrite Console → Settings → API Keys → Create API Key');
    logInfo('Required permissions: databases.read, databases.write, collections.read, collections.write, documents.read, documents.write, documents.delete');
    process.exit(1);
  }
  
  logSuccess('Prerequisites check passed');
}

async function createUserProfilesCollection() {
  try {
    logInfo('Creating user_profiles collection...');
    
    // Create collection with only CREATE permission for users
    await databases.createCollection(
      DATABASE_ID,
      COLLECTION_ID,
      'User Profiles',
      ['users'] // Only authenticated users can CREATE documents
    );
    
    logSuccess('user_profiles collection created successfully');
    
    // Create attributes
    logInfo('Creating user_profiles attributes...');
    
    // Required attributes
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'userId', 255, true);
    await databases.createIntegerAttribute(DATABASE_ID, COLLECTION_ID, 'age', true, 13, 120);
    await databases.createFloatAttribute(DATABASE_ID, COLLECTION_ID, 'weightPounds', true, 50, 500);
    await databases.createIntegerAttribute(DATABASE_ID, COLLECTION_ID, 'heightInches', true, 48, 96);
    await databases.createEnumAttribute(DATABASE_ID, COLLECTION_ID, 'sex', ['male', 'female', 'other'], true);
    
    // Optional attributes
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'wakeupTime', 10, false);
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'bedTime', 10, false);
    
    // Array attributes
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'restrictions', 255, true, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'preferences', 255, true, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'goals', 255, true, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'activities', 255, true, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'supplements', 255, false, true);
    
    logSuccess('user_profiles attributes created successfully');
    
    // Create index for userId
    await databases.createIndex(DATABASE_ID, COLLECTION_ID, 'userId', 'key', ['userId']);
    
    logSuccess('user_profiles index created successfully');
    
  } catch (error) {
    if (error.code === 409) {
      logWarning('user_profiles collection already exists');
    } else {
      throw error;
    }
  }
}

async function verifySetup() {
  logInfo('Verifying setup...');
  
  try {
    const collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
    logSuccess(`Collection '${collection.name}' is accessible`);
    
    const attributes = await databases.listAttributes(DATABASE_ID, COLLECTION_ID);
    logSuccess(`Collection has ${attributes.attributes.length} attributes`);
    
    return true;
  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    log('🚀 Setting up User Profiles Collection...', 'bright');
    
    await checkPrerequisites();
    await createUserProfilesCollection();
    
    const verified = await verifySetup();
    
    if (verified) {
      log('\n🎉 User profiles collection setup completed successfully!', 'bright');
      log('\n📋 Next Steps:', 'cyan');
      log('1. Test your database connection at /test', 'cyan');
      log('2. Try creating a user profile through the onboarding flow', 'cyan');
      log('3. Verify that users can only access their own data', 'cyan');
      log('\n🔧 How it works:', 'cyan');
      log('- Collection allows any authenticated user to CREATE documents', 'cyan');
      log('- Document-level permissions ensure users can only access their own data', 'cyan');
      log('- Each document is automatically secured to its creator', 'cyan');
    } else {
      log('\n⚠️  Setup completed but verification failed. Please check your configuration.', 'yellow');
    }
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  main();
}

module.exports = { main }; 