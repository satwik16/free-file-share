const express = require("express");
const app = express();
const path = require("path");
const PORT = process.env.PORT || 3000;
app.use(express.static("public"));
app.use(express.json());
// app.use("/styles", express.static(__dirname + '/public/css/style.css'));
app.use("/files/download/", require("./routes/download"));
const connectdb = require("./config/db.js");
connectdb();

//template engine
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

app.use("/api/files", require("./routes/files"));
app.use("/files", require("./routes/show.js"));

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
