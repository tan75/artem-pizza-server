const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const idlength = 8;

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
router.get("/", (req, res) => {
  const ingredients = req.app.db.get("ingredients");

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
router.get("/:ingredientId", (req, res) => {
  const ingredient = req.app.db
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
router.post("/", (req, res) => {
  try {
    const { image, thumbnail } = req.files;
    const { name, slug, price, category } = req.body;

    const imageExt = image.name.split(".").pop();
    const fileName = `${slug}.${imageExt}`;

    image.mv(`./uploads/${fileName}`);

    const thumbExt = thumbnail.name.split(".").pop();
    const thumbFileName = `${slug}-thumb.${thumbExt}`;

    thumbnail.mv(`./uploads/${thumbFileName}`);

    req.app.db.get("ingredients")
      .push({
        id: nanoid(idlength),
        name,
        slug,
        price,
        category,
        image: fileName,
        thumbnail: thumbFileName,
      })
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
router.put("/:ingredientId", (req, res) => {
  try {
    const { image, thumbnail } = req.files;
    const { name, slug, price, category } = req.body;

    const imageExt = image.name.split(".").pop();
    const fileName = `${slug}.${imageExt}`;

    image.mv(`./uploads/${fileName}`);

    const thumbExt = thumbnail.name.split(".").pop();
    const thumbFileName = `${slug}-thumb.${thumbExt}`;

    thumbnail.mv(`./uploads/${thumbFileName}`);

    req.app.db.get("ingredients")
      .find({ id: req.params.ingredientId })
      .assign({
        name,
        slug,
        price,
        category,
        image: fileName,
        thumbnail: thumbFileName,
      })
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
router.delete("/:ingredientId", (req, res) => {
  req.app.db.get("ingredients").remove({ id: req.params.ingredientId }).write();

  res.send({ status: true, message: "Success" });
});

module.exports = router;