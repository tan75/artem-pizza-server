const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const idlength = 8;

/**
 *  @swagger
 *  tags:
 *    name: Orders
 *    description: API заказов.
 */

/**
 *  @swagger
 *  components:
 *    schemas:
 *      Order:
 *        type: object
 *        required:
 *          - size
 *          - dough
 *          - sauce
 *          - ingredients
 *          - address
 *          - name
 *          - card_number
 *          - price
 *        properties:
 *          id:
 *            type: string
 *            description: Автоматический сгенерированный ID заказа
 *          size:
 *            type: string
 *            description: Размер пиццы
 *          dough:
 *            type: string
 *            description: Тип теста
 *          sauce:
 *            type: string
 *            description: Тип соуса
 *          ingredients:
 *            type: array
 *            items: string
 *            description: Массив с slug - ингредиентов
 *          address:
 *            type: string
 *            description: Адрес заказа
 *          name:
 *            type: string
 *            description: Имя заказчика
 *          card_number:
 *            type: string
 *            description: Номер карты
 *          price:
 *            type: string
 *            description: Цена заказа
 *        example:
 *           size: 30
 *           dough: thick
 *           sauce: mayo
 *           ingredients:
 *             - cucumber
 *             - salami
 *             - bacon
 *           address: Sesame Street *
 *           name: Ivan Ivanov
 *           card_number: 0000 0000 0000 0000
 *           price: 600
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Orders]
 *     Summary: Показать все заказы
 *     responses:
 *       200:
 *         description: Список заказов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
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
 *     tags: [Orders]
 *     description: Создать новый заказ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Заказ оформлен успешно
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       500:
 *         description: Ошибка на сервере
 *
 */
router.post("/", (req, res) => {
  try {
    const {
      size,
      dough,
      sauce,
      ingredients,
      address,
      name,
      card_number,
      price,
    } = req.body;

    const newOrder = {
      id: nanoid(idlength),
      size,
      dough,
      sauce,
      ingredients,
      address,
      name,
      card_number,
      price,
    };

    req.app.db.get("orders").push(newOrder).write();

    return res.send(newOrder);
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;
