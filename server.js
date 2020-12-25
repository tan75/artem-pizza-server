const express = require("express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const morgan = require("morgan");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const { nanoid } = require("nanoid");
const idlength = 8;

const adapter = new FileSync("db.json");
const db = low(adapter);

db.defaults({ ingredients: [], orders: [] }).write();

const app = express();
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
  swaggerDefinition: {
    info: {
      title: "Library API",
      version: "1.0.0",
    },
  },
  apis: ["server.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

/**
 * @swagger
 * /ingredients:
 *   get:
 *     produces:
 *       - application/json
 *     description: Показать все ингредиенты
 *     responses:
 *       200:
 *         description: Success
 *
 */
app.get("/ingredients", (req, res) => {
  const ingredients = db.get("ingredients");

  res.send(ingredients);
});

/**
 * @swagger
 * /ingredients/{ingredientId}:
 *   get:
 *     produces:
 *       - application/json
 *     description: Показать информацию о конкретном ингредиенте 
 *     parameters:
 *       - name: ingredientId
 *         in: path
 *         description: ingredient ID
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 *
 */
app.get("/ingredients/:ingredientId", (req, res) => {
  const ingredient = db
    .get("ingredients")
    .find({ id: req.params.ingredientId })
    .value();

  res.send(ingredient);
});

/**
 * @swagger
 * /ingredients:
 *   post:
 *     description: Создать новый ингредиент
 *     consumes:
 *       - multipart/form-data
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: name
 *         type: string
 *         required: true
 *         description: Название ингредиента. Будет показано пользователю.
 *       - in: formData
 *         name: slug
 *         type: string
 *         required: true
 *         description: Идентификатор ингредиента.
 *       - in: formData
 *         name: price
 *         type: number
 *         required: true
 *         description: Цена ингредиента.
 *       - in: formData
 *         name: category
 *         type: string
 *         enum: [vegetables, sauces, meat, cheese]
 *         required: true
 *         description: Категория ингредиента.
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: Картинка ингредиента для превью пиццы.
 *       - in: formData
 *         name: thumbnail
 *         type: file
 *         required: true
 *         description: Превью ингредиента для формы.
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Ошибка на сервере
 *
 */
app.post("/ingredients", (req, res) => {
  try {
    const { image, thumbnail } = req.files;
    const { name, slug, price, category } = req.body;

    const imageExt = image.name.split(".").pop();
    const fileName = `${slug}.${imageExt}`;

    image.mv(`./uploads/${fileName}`);

    const thumbExt = thumbnail.name.split(".").pop();
    const thumbFileName = `${slug}-thumb.${thumbExt}`;

    thumbnail.mv(`./uploads/${thumbFileName}`);

    db.get("ingredients")
      .push({ id: nanoid(idlength), name, slug, price, category, image: fileName, thumbnail: thumbFileName })
      .write();

    return res.send({
      status: true,
      message: "Success",
    });
  } catch (e) {
    return res.status(500).send(e);
  }
});


/**
 * @swagger
 * /ingredients/{ingredientId}:
 *   put:
 *     produces:
 *       - application/json
 *     description: Обновнить информацию об ингредиенте
 *     parameters:
 *       - name: ingredientId
 *         in: path
 *         description: ingredient ID
 *         required: true
 *       - in: formData
 *         name: name
 *         type: string
 *         required: true
 *         description: Название ингредиента. Будет показано пользователю.
 *       - in: formData
 *         name: slug
 *         type: string
 *         required: true
 *         description: Идентификатор ингредиента.
 *       - in: formData
 *         name: price
 *         type: number
 *         required: true
 *         description: Цена ингредиента.
 *       - in: formData
 *         name: category
 *         type: string
 *         enum: [vegetables, sauces, meat, cheese]
 *         required: true
 *         description: Категория ингредиента.
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: Картинка ингредиента для превью пиццы.
 *       - in: formData
 *         name: thumbnail
 *         type: file
 *         required: true
 *         description: Превью ингредиента для формы.
 *     responses:
 *       200:
 *         description: Success
 *
 */
app.put("/ingredients/:ingredientId", (req, res) => {
  try {
    const { image } = req.files;
    const { name, slug, price, category } = req.body;

    const imageExt = image.name.split(".").pop();
    const fileName = `${slug}.${imageExt}`;

    image.mv(`./uploads/${fileName}`);

    const thumbExt = thumbnail.name.split(".").pop();
    const thumbFileName = `${slug}-thumb.${thumbExt}`;

    thumbnail.mv(`./uploads/${thumbFileName}`);

    db.get("ingredients")
      .find({ id: req.params.ingredientId })
      .assign({ name, slug, price, category, image: fileName, thumbnail: thumbFileName })
      .write();

    return res.send({
      status: true,
      message: "Success",
    });
  } catch (e) {
    return res.status(500).send(e);
  }
});

/**
 * @swagger
 * /ingredients/{ingredientId}:
 *   delete:
 *     produces:
 *       - application/json
 *     description: Удалить ингредиент
 *     parameters:
 *       - name: ingredientId
 *         in: path
 *         description: ingredient ID
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 *
 */
app.delete("/ingredients/:ingredientId", (req, res) => {
  db
    .get("ingredients")
    .remove({ id: req.params.ingredientId })
    .write();

  res.send({ status: true, message: "Success" });
});

/**
 * @swagger
 * /orders:
 *   get:
 *     produces:
 *       - application/json
 *     description: Показать все заказы
 *     responses:
 *       200:
 *         description: Success
 *
 */
app.get("/orders", (req, res) => {
  const orders = db.get("orders");
  res.send(orders);
});


/**
 * @swagger
 * /orders:
 *   post:
 *     description: Создать новый заказ
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: order
 *         description: Список ингредиентов
 *         schema:
 *           type: object
 *           required:
 *             - ingredients
 *             - address
 *             - name
 *             - card_number
 *           properties:
 *             ingredients:
 *               type: array
 *               items: string
 *               description: Список выбранных ингредиентов
 *             address:
 *               type: string
 *               description: Адрес заказа
 *             name:
 *               type: string
 *               description: Имя заказчика
 *             card_number:
 *               type: string
 *               description: Номер карты
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Ошибка на сервере
 *
 */
app.post("/orders", (req, res) => {
  try {
    const { name, ingredients, address, card_number } = req.body;

    db.get("orders")
      .push({ id: nanoid(idlength), name, ingredients, address, card_number})
      .write();

    return res.send({
      status: true,
      message: "Success",
    });
  } catch (e) {
    return res.status(500).send(e);
  }
});


const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
