const express = require("express");
const app = express();

app.get("/ingridients", (req, res) => {
	return res.send("GET HTTP method on ingridient resource");
});

app.post("/ingridients", (req, res) => {
	return res.send("POST HTTP method on ingridient resource");
});

app.put("/ingridients/:ingridientId", (req, res) => {
	return res.send(
		`PUT HTTP method on ingridient/${req.params.ingridientId} resource`
	);
});

app.delete("/ingridients/:ingridientId", (req, res) => {
	return res.send(
		`DELETE HTTP method on ingridient/${req.params.ingridientId} resource`
	);
});

