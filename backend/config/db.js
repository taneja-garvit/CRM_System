const mongoose = require('mongoose');

const mongoConnect = async () => {
  try {
    await mongoose.connect("mongodb+srv://tanejaggarvit:garvit@cluster0.zw7tt5l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = { mongoConnect };