const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://foash_111:qKQv4pZ9JSGbxUXk@m5imr.likynnz.mongodb.net/?retryWrites=true&w=majority&appName=m5imr';
const dbName = 'arabic-storytelling';

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('content');

    // Insert a test post if collection is empty
    const totalCount = await collection.countDocuments({});
    if (totalCount === 0) {
      await collection.insertOne({
        title: "Test Post",
        published: true,
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Inserted a test post.');
    }

    // Now perform the counts
    const publishedCount = await collection.countDocuments({ published: true });
    const draftCount = await collection.countDocuments({ published: false });
    const featuredCount = await collection.countDocuments({ featured: true });

    console.log('Published posts:', publishedCount);
    console.log('Draft posts:', draftCount);
    console.log('Featured posts:', featuredCount);

    const admin = db.admin();
    const dbs = await admin.listDatabases();
    console.log('Databases in cluster:', dbs.databases.map(d => d.name));

    const collections = await db.listCollections().toArray();
    console.log('Collections in db:', collections.map(c => c.name));

    const sample = await collection.findOne({});
    console.log('Sample document:', sample);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

main();