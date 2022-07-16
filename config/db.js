 require("dotenv").config();
const mongoose = require("mongoose");

function connect_db() {
  //database connection

  mongoose.connect(process.env.MONGO_CONNECTION_URL, {
    useNewUrlParser: true,
 
    useUnifiedTopology: true,
  
  });
  const connection = mongoose.connection;
  connection
     .once('open', function () {
      console.log('MongoDB running');
    })
    .on('error', function (err) {
      console.log(err);
    });
   
}

module.exports = connect_db ;