const express = require("express");
const cookieParser = require("cookie-parser");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const morgan = require("morgan");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const ingredientsRouter = require("./routes/ingredients")
const ordersRouter = require("./routes/orders")
const adminAuthRouter = require("./routes/adminAuth")

const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportJWT = require("passport-jwt");

JWTStrategy = passportJWT.Strategy;
ExtractJWT = passportJWT.ExtractJwt;

const adapter = new FileSync("db.json");
const db = low(adapter);

db.defaults({ ingredients: [], orders: [] }).write();

const app = express();

app.use(passport.initialize());

const user = {
  id: "1",
  email: "example@email.com",
  password: "password",
};

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    (email, password, done) => {
      if (email === user.email && password === user.password) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "jwt_secret",
    },
    (jwt_payload, done) => {
      if (user.id === jwt_payload.user._id) {
        return done(null, user);
      } else {
        return done(null, false, {
          message: "Token not matched.",
        });
      }
    }
  )
);


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
app.use(cookieParser());
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
app.use("/admin-auth", adminAuthRouter);

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Server is running on port ${port}`));
