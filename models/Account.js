const { Model } = require("objection");

class Account extends Model {
	static get tableName() {
		return "accounts";
	}

	static get MAX_ACCOUNTS() {
		return 5;
	}

	static get WAIT_TIME() {
		return 300;
	}

	static getByToken(token) {
		return Account.query().where('api_token', '=', token).limit(1).then(accounts => {
			return accounts[0];
		})
		.catch(err => {
			return Promise.reject({ message: "Account not found." });
		});
	}

	

	static generateNewAccount(session) {
		const uniqid 	= require("uniqid");
		let uniqueID 	= uniqid();
		let now 		= Math.round(Date.now() / 1000);
		
		let { accountsGenerated, lastGenerateTime } = session;

		if(typeof accountsGenerated === 'undefined') {
			accountsGenerated = 0;
		}

		if(typeof lastGenerateTime === 'undefined') {
			lastGenerateTime = Math.round(Date.now() / 1000);
		}

		let generateTimeDiff = now - lastGenerateTime;

		if(accountsGenerated >= Account.MAX_ACCOUNTS && generateTimeDiff < Account.WAIT_TIME) {
			return Promise.reject({ message: "Please wait 5 minutes before creating a new account ID." })
		}

		return Account.query().insert({
			api_token: uniqueID
		}).then(account => {

			session.accountsGenerated 	+= 1;
			session.lastGenerateTime 	= now;

			return account;
		})
		.catch(err => {
			console.log(err);
			return Promise.reject({ message: "Unable to generate account at this time.  Please try again later." });
		})
	}

	getFavorites() {
		return this.$relatedQuery("favorites").where({ deleted: null }).orderBy("created", "DESC");
	}

	async favorite(url) {

		const Favorite = require("./Favorite");

		// Verify that url is valid
		if(!Favorite.validateURL(url)) {
			return Promise.reject({ message: "You provided an invalid url." });
		}


		// Check if this url is not already favorited
		const favorites = await this.getFavorites().where({
			url: url,
			deleted: null
		});
		

		if(favorites.length > 0) {
			return Promise.resolve(favorites[0]);
		}
		else {
			console.log(this.$relatedQuery("favorites").insert({ url: url }).toSql());
			return this.$relatedQuery("favorites").insert({ url: url });
		}
	}

	$formatJson(json) {
		json = super.$formatJson(json);

		return {
			token	: json.api_token,
			created	: json.created
		}
	}

	static get relationMappings() {
		const Favorite = require("./Favorite");

		return {
			favorites: {
				relation: Model.HasManyRelation,
				modelClass: Favorite,
				join: {
					from: 'accounts.id',
					to: 'favorites.account_id'
				}
			}
		}

	}

}

module.exports = Account;
