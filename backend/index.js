require('dotenv').config(); //to stop verbose errors from being sent to client (env production)

var validate = require('jsonschema').validate;
const query_essay_schema = {
	"type": "object",
	"properties": {
		"title": {"type": "string"},
		"words": {"type": "integer", "minimum": 20, "maximum": 500},
		"exotic": {"type": "boolean"},
		"ducks": {"type": "boolean"},
	},
	"required": ["title", "words", "exotic", "ducks"]
};

const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
//const compression = require('compression')
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const port = 40780;

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, //window size in ms
	max: 1, //requests per window
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const app = express();

app.use(express.json());
app.use(cors({
	origin: `http://127.0.0.1:8000`
}));
app.use(limiter);
app.set('trust proxy', 1);
//app.use(compression());

app.post('/query', async (req, res) => {
  var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`request from ${ip}`);
	var isvalid = validate(req.body, query_essay_schema).valid;
	if (!isvalid){
		res.send({
			"status": 1,
			"message": "Schema mismatch"
		});
	} else if (!hasGoodChars(req.body.title)) {
		res.send({
			"status": 2,
			"message": "Invalid characters in title"
		});	
	} else {
		let gpt_prompt = `Write an essay entitled {${req.body.title}} in ${req.body.words-1} words.`;

		if (req.body.exotic)
			gpt_prompt += ` Make the essay weird, fictional and use a lot of adjectives.`;

		if (req.body.ducks)
			gpt_prompt += ` Also mention ducks a lot and talk about how they relate to the essay topic.`;

		console.log(gpt_prompt);
		try {
			const response = await openai.createCompletion({
				model: "text-davinci-003",
				prompt: gpt_prompt,
				temperature: req.body.exotic ? 1:0,
				max_tokens: Math.floor(req.body.words*1.5),
			});

			res.send({
				"status": 0,
				"message": response.data.choices[0].text
			});
		} catch (error) {
			console.error('Failed to talk to chatGPT');
			if (error.response) {
				console.error(error.response.status);
				console.error(error.response.data);
			} else {
				console.error(error.message);
			}

			res.send({
				"status": 3,
				"message": "Unable to reach openai's API :("
			});
		}
	}
});

function hasGoodChars(title){
	return !title.match(/[^a-zA-Z0-9\-\'\!\$\ \(\)\[\]\,\.\;\?]/);
}

app.listen(port, () => {
  console.log(`Listening on ${port}`)
});
