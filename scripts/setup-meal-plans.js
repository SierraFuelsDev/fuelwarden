require('dotenv').config();
const { Client, Databases } = require('node-appwrite');

// Configuration
const config = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6854d601002800d85e1a',
  apiKey: process.env.APPWRITE_API_KEY,
};

// Database and collection IDs
const DATABASE_ID = 'fuelwarden';
const COLLECTION_ID = 'meal_plans';

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

// Logging functions
function log(message, color = 'reset') {
  const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function checkPrerequisites() {
  logInfo('Checking prerequisites...');
  
  if (!config.apiKey) {
    throw new Error('APPWRITE_API_KEY environment variable is required');
  }
  
  logSuccess('Prerequisites check passed');
}

async function createMealPlansCollection() {
  try {
    logInfo('Creating meal_plans collection...');
    
    // Create collection with only CREATE permission for users
    await databases.createCollection(
      DATABASE_ID,
      COLLECTION_ID,
      'Meal Plans',
      ['users'] // Only authenticated users can CREATE documents
    );
    
    logSuccess('meal_plans collection created successfully');
    
    // Create attributes
    logInfo('Creating meal_plans attributes...');
    
    // Required attributes
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'userId', 255, true);
    await databases.createEnumAttribute(DATABASE_ID, COLLECTION_ID, 'status', ['draft', 'active', 'archived'], true);
    await databases.createIntegerAttribute(DATABASE_ID, COLLECTION_ID, 'version', true, 1, 100);
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'generatedAt', 255, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'meals', 50000, true); // JSON string
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'planDateRange', 1000, true); // JSON string
    await databases.createIntegerAttribute(DATABASE_ID, COLLECTION_ID, 'totalCalories', true, 0, 10000);
    await databases.createFloatAttribute(DATABASE_ID, COLLECTION_ID, 'totalProtein', true, 0, 1000);
    await databases.createFloatAttribute(DATABASE_ID, COLLECTION_ID, 'totalCarbs', true, 0, 1000);
    await databases.createFloatAttribute(DATABASE_ID, COLLECTION_ID, 'totalFat', true, 0, 1000);
    
    // Optional attributes
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'type', 255, false);
    
    logSuccess('meal_plans attributes created successfully');
    
    // Create indexes
    logInfo('Creating meal_plans indexes...');
    await databases.createIndex(DATABASE_ID, COLLECTION_ID, 'userId', 'key', ['userId']);
    await databases.createIndex(DATABASE_ID, COLLECTION_ID, 'status', 'key', ['status']);
    await databases.createIndex(DATABASE_ID, COLLECTION_ID, 'userId_status', 'key', ['userId', 'status']);
    await databases.createIndex(DATABASE_ID, COLLECTION_ID, 'createdAt', 'key', ['$createdAt']);
    
    logSuccess('meal_plans indexes created successfully');
    
    logSuccess('Meal plans collection setup completed!');
    
  } catch (error) {
    if (error.code === 409) {
      logInfo('Meal plans collection already exists, skipping creation');
    } else {
      logError(`Failed to create meal plans collection: ${error.message}`);
      throw error;
    }
  }
}

async function verifySetup() {
  try {
    logInfo('Verifying meal plans collection setup...');
    
    // Try to list documents to verify collection exists and is accessible
    const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [], 1);
    logSuccess('Meal plans collection is accessible');
    
    return true;
  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    log('🚀 Starting meal plans collection setup...', 'bright');
    
    await checkPrerequisites();
    await createMealPlansCollection();
    await verifySetup();
    
    log('🎉 Meal plans collection setup completed successfully!', 'bright');
    log('📋 Next steps:', 'cyan');
    log('   1. Test the meal plan generation in your app', 'cyan');
    log('   2. Verify the AI function integration works', 'cyan');
    log('   3. Check that meal plans are saved correctly', 'cyan');
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  main();
}

module.exports = { createMealPlansCollection, verifySetup }; 