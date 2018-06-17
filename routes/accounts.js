const express = require("express");
const router = express.Router();

const Account = require(process.cwd() + "/models/Account");

router.use("/", (req, res, next) => {
	console.log(req.method);
	if(req.method == "OPTIONS") {
		return res.json({ result: true });
	}
	console.log("LOL");
	next();
});

router.post("/", (req, res) => {
	Account.generateNewAccount(req.session).then(account => {
		res.json(account);
	})
	.catch(err => {
		res.json(err);
	})
});

router.get("/:accountToken/favorites", (req, res) => {

	Account.getByToken(req.params.accountToken).then(account => {
		return account.getFavorites();
	})
	.then(favorites => {
		res.json(favorites);
	})
	.catch(err => {
		res.json(err);
	})
});

router.post("/:accountToken/favorite", (req, res) => {
	console.log(req.query.url);
	Account.getByToken(req.params.accountToken).then(account => {
		console.log(account);
		return account.favorite(req.body.url);
	})
	.then(favorite => {
		res.json(favorite);
		//return Promise.reject({ err: "NOPE" });
	})
	.catch(err => {
		console.log(err);
		res.status(400);
		res.json(err);
	})
});

router.delete("/:accountToken/favorite", (req, res) => {
	Account.getByToken(req.params.accountToken).then(account => {
		return account.getFavorites().where({ url: req.body.url });
	})
	.then(favorites => {
		if(favorites.length > 0) {
			let favorite = favorites[0];
			return favorite.delete();
		}

		return Promise.resolve();
	})
	.then(() => {
		res.json({ result: true })
	})
	.catch(err => {
		console.log(err);
		res.json({ message: "Unable to delete favorite at this time." });
	});
});


module.exports = router;
