const { Client, Databases } = require('node-appwrite');

// Configuration
const config = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6854d601002800d85e1a',
  apiKey: process.env.APPWRITE_API_KEY,
};

// Database and collection IDs
const DATABASE_ID = 'fuelwarden';
const COLLECTION_ID = 'activity_schedule';

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

// Logging functions
const logInfo = (message) => console.log(`ℹ️  ${message}`);
const logSuccess = (message) => console.log(`✅ ${message}`);
const logError = (message) => console.log(`❌ ${message}`);

async function createActivityScheduleCollection() {
  try {
    logInfo('Creating activity_schedule collection...');
    
    // Create collection with only CREATE permission for users
    await databases.createCollection(
      DATABASE_ID,
      COLLECTION_ID,
      'Activity Schedule',
      ['users'] // Only authenticated users can CREATE documents
    );
    
    logSuccess('activity_schedule collection created successfully');
    
    // Create attributes
    logInfo('Creating activity_schedule attributes...');
    
    // Required attributes
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'userId', 255, true);
    
    // Array attribute for schedule items
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'schedule', 10000, true, true);
    
    logSuccess('activity_schedule attributes created successfully');
    
    // Create index for userId
    logInfo('Creating activity_schedule indexes...');
    await databases.createIndex(DATABASE_ID, COLLECTION_ID, 'userId', 'key', ['userId']);
    
    logSuccess('activity_schedule indexes created successfully');
    
    logSuccess('Activity schedule collection setup completed!');
    
  } catch (error) {
    if (error.code === 409) {
      logInfo('Activity schedule collection already exists, skipping creation');
    } else {
      logError(`Failed to create activity schedule collection: ${error.message}`);
      throw error;
    }
  }
}

async function main() {
  try {
    logInfo('Starting activity schedule collection setup...');
    
    if (!config.apiKey) {
      throw new Error('APPWRITE_API_KEY environment variable is required');
    }
    
    await createActivityScheduleCollection();
    
    logSuccess('Activity schedule collection setup completed successfully!');
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the setup
main(); 