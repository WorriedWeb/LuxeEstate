import mongoose from 'mongoose';

const uri = "mongodb+srv://luxeestate:mlK2V7twaL4PT1ir@cluster0.iywkusf.mongodb.net/luxe-estate?appName=Cluster0"

await mongoose.connect(uri);

await mongoose.connection.db
  .collection('properties')
  .dropIndex('id_1');

console.log('Index dropped');
process.exit(0);
