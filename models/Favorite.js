const { Model } = require("objection");

class Favorite extends Model {
	static get tableName() {
		return "favorites";
	}

	
	static get jsonSchema() {
		return {
			type: 'object',
			required: ['url'],
			properties: {
				id: { type: 'integer' },
				account_id: { type: 'integer' },
				url: { type: 'string' },
				created: { type: 'string', format: 'date-time' },
				modified: { type: 'string', format: 'date-time' },
				deleted: { type: 'string', format: 'date-time' }
			}
		}
	}
	
	$formatJson(json) {
		json = super.$formatJson(json);

		return {
			url		: json.url,
			created	: json.created
		};

	}

	static validateURL(url) {
		let baseURL = "https://images.dog.ceo/";
		let checkBaseURL = url.substr(0, baseURL.length) == baseURL;
		let urlExtension = (url.substr(-4)).toLowerCase();
		let allowedExtensions = [
			'.jpg',
			'.png',
			'.gif'
		];

		return checkBaseURL && allowedExtensions.indexOf(urlExtension) !== -1;
	}

	async delete() {

		let dateString = (new Date()).toISOString();
		

		return Favorite.query().patch({ deleted: dateString }).where('id', '=', this.id);
	}

}

module.exports = Favorite;
