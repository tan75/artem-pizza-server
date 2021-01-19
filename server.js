const express = require("express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const morgan = require("morgan");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const ingredientsRouter = require("./routes/ingredients")
const ordersRouter = require("./routes/orders")

const adapter = new FileSync("db.json");
const db = low(adapter);

db.defaults({ ingredients: [], orders: [] }).write();

const app = express();
app.db = db;

app.use(
  fileUpload({
    createParentPath: true,
  })
);

app.use(cors());
app.use(express.static("uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use("/orders", ordersRouter);
app.use("/ingredients", ingredientsRouter);

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Server is running on port ${port}`));
