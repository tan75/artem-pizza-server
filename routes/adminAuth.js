const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

/**
 *  @swagger
 *  tags:
 *    name: "Admin Auth"
 *    description: API авторизации в админке. Позволяет получить доступ к созданию, обновлению и удалению ингредиентов.
 */


/**
 * @swagger
 * /admin-auth/login:
 *   post:
 *     tags: ["Admin Auth"]
 *     summary: Авторизоваться в админке
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               email: "example@email.com"
 *               password: "password"
 *     responses:
 *       200:
 *         description: Авторизация прошла успешно
 *         content:
 *           application/json:
 *             schema:
 *               token: string
 *
 */
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send("Wrong email or password");
    }
    req.login(user, () => {
      const body = { _id: user.id, email: user.email };

      const token = jwt.sign({ user: body }, "jwt_secret");

      return res.json({ token });
    });
  })(req, res, next);
});

/**
 * @swagger
 * /admin-auth/logout:
 *   get:
 *     tags: ["Admin Auth"]
 *     summary: Разлогиниться
 *     responses:
 *       200:
 *         description: Логаут выполнен успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *
 */
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
