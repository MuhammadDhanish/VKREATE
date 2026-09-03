const mongoose = require('mongoose');

// Connection string from user's MongoDB Atlas cluster setup
const uri = process.env.MONGODB_URI || 'mongodb+srv://danishdhanishkk_db_user:ZuLPfEJoexCxngnG@vkreate.1e3x5.mongodb.net/test?retryWrites=true&w=majority';

async function wipeAtlas() {
  console.log('🔌 Connecting to MongoDB Atlas Cloud...');
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB Cloud Database!');

    const collections = await conn.connection.db.collections();
    console.log(`Found ${collections.length} collections:`, collections.map(c => c.collectionName));

    for (let col of collections) {
      console.log(`🧹 Wiping collection: ${col.collectionName}...`);
      await col.deleteMany({});
    }

    console.log('🎉 All MongoDB Atlas Cloud collections wiped clean!');
  } catch (err) {
    console.error('❌ Atlas wipe error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

wipeAtlas();
