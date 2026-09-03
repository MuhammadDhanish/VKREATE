const { connectMongoDB } = require('../lib/mongodb');
const { ProjectModel, ReviewModel, InquiryModel } = require('../lib/models');

async function wipeDatabase() {
  console.log('🧹 Clearing all projects, reviews, and inquiries from MongoDB Atlas...');
  const db = await connectMongoDB();
  if (db) {
    await ProjectModel.deleteMany({});
    await ReviewModel.deleteMany({});
    await InquiryModel.deleteMany({});
    console.log('✅ MongoDB collections cleared successfully!');
  } else {
    console.log('ℹ️ MONGODB_URI not set locally. Local JSON files have been cleared.');
  }
}

wipeDatabase().then(() => process.exit(0)).catch(err => {
  console.error('Wipe error:', err);
  process.exit(1);
});
