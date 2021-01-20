const express = require("express");
const passport = require("passport");
const router = express.Router();
const { nanoid } = require("nanoid");
const idlength = 8;

/**
 *  @swagger
 *  tags:
 *    name: Ingredients
 *    description: API ингредиентов для Пиццы
 */

/**
 *  @swagger
 *  components:
 *    securitySchemes:
 *      - BearerAuth:
 *        type: http
 *        in: header
 *        scheme: bearer
 *        bearerFormat: JWT
 *    parameters:
 *      ingredientId:
 *        name: ingredientId
 *        in: path
 *        description: Идентификатор ингредиента
 *        required: true
 *        type: string
 *    schemas:
 *      Ingredient:
 *        type: object
 *        required:
 *          - name
 *          - slug
 *          - price
 *          - category
 *          - image
 *          - thumbnail
 *        properties:
 *          id:
 *            type: string
 *            description: Автоматический сгенерированный ID ингредиента
 *          name:
 *            type: string
 *            description: Название ингредиента
 *          slug:
 *            type: string
 *            description: Идентификатор ингредиента
 *          price:
 *            type: string
 *            description: Цена ингредиента
 *          category:
 *            type: string
 *            enum: [vegetables, sauces, meat, cheese]
 *            description: Категория ингредиента
 *          image:
 *            type: file
 *            description: Картинка ингредиента для превью пиццы.
 *          thumbnail:
 *            type: file
 *            description: Превью ингредиента для формы.
 *        example:
 *           id: d5fE_asz
 *           name: Огурец
 *           slug: cucumber
 *           price: 100
 *           caterogy: vegetables
 *           image: /cucumber.jpg
 *           thumbnail: /cucumber-thumb.jpg
 */

/**
 * @swagger
 * /ingredients:
 *   get:
 *     tags: [Ingredients]
 *     summary: Показать все ингредиенты
 *     responses:
 *       200:
 *         description: Список всех доступных ингредиентов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ingredient'
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
 *     tags: [Ingredients]
 *     summary: Показать информацию о конкретном ингредиенте
 *     parameters:
 *       - $ref: '#/components/parameters/ingredientId'
 *     responses:
 *       200:
 *         description: Описание конкретного ингредиента
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
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
 *     tags: [Ingredients]
 *     summary: Создать новый ингредиент
 *     security:
 *       - BearerAuth
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Ingredient'
 *     responses:
 *       200:
 *         description: Ингредиент успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       401:
 *         description: Вы не авторизованы
 *       500:
 *         description: Ошибка на сервере
 *
 */
router.post(
  "/",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    try {
      const { image, thumbnail } = req.files;
      const { name, slug, price, category } = req.body;

      const imageExt = image.name.split(".").pop();
      const fileName = `${slug}.${imageExt}`;

      image.mv(`./uploads/${fileName}`);

      const thumbExt = thumbnail.name.split(".").pop();
      const thumbFileName = `${slug}-thumb.${thumbExt}`;

      thumbnail.mv(`./uploads/${thumbFileName}`);

      const newIngredient = {
        id: nanoid(idlength),
        name,
        slug,
        price,
        category,
        image: fileName,
        thumbnail: thumbFileName,
      };

      req.app.db.get("ingredients").push(newIngredient).write();

      return res.send(newIngredient);
    } catch (e) {
      return res.status(500).send(e);
    }
  }
);

/**
 * @swagger
 * /ingredients/{ingredientId}:
 *   put:
 *     tags: [Ingredients]
 *     summary: Обновнить информацию об ингредиенте
 *     security:
 *       - BearerAuth
 *     parameters:
 *       - $ref: '#/components/parameters/ingredientId'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Ingredient'
 *     responses:
 *       200:
 *         description: Ингредиент успешно обновлён
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       500:
 *         description: Ошибка на сервере
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

    const ingredient = req.app.db
      .get("ingredients")
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

    return res.send(ingredient);
  } catch (e) {
    return res.status(500).send(e);
  }
});

/**
 * @swagger
 * /ingredients/{ingredientId}:
 *   delete:
 *     tags: [Ingredients]
 *     summary: Удалить ингредиент
 *     security:
 *       - BearerAuth
 *     parameters:
 *       - $ref: '#/components/parameters/ingredientId'
 *     responses:
 *       200:
 *         description: Ингредиент был успешно удалён
 *
 */
router.delete("/:ingredientId", (req, res) => {
  req.app.db.get("ingredients").remove({ id: req.params.ingredientId }).write();

  res.send({ status: true, message: "Success" });
});

module.exports = router;
