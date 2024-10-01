import mongoose from 'mongoose';

export const connectDB = async (dbConnectionString) => {
  try {
    const connection = await mongoose.connect(dbConnectionString);
    console.log(`Successfully connected to database`);
    // console.log(`HOST: ${connection.connection.host}`);
    console.log(`PORT: ${connection.connection.port}`);
    console.log(`NAME: ${connection.connection.name}\n`);
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
};