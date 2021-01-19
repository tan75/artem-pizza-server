const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const idlength = 8;


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
router.get("/", (req, res) => {
  const orders = req.app.db.get("orders");
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
router.post("/", (req, res) => {
  try {
    const { name, ingredients, address, card_number } = req.body;

    const newOrder = {
      id: nanoid(idlength),
      name,
      ingredients,
      address,
      card_number,
    };

    req.app.db.get("orders").push(newOrder).write();

    return res.send(newOrder);
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;