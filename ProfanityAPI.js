const request = require('request');
require('dotenv').config();
async function hasProfanity(text, apiKey) {
    return new Promise((resolve, reject) => {
        request.get({
            url: `https://api.api-ninjas.com/v1/profanityfilter?text=${encodeURIComponent(text)}`,
            headers: {
                'X-Api-Key': apiKey
            }
        }, (error, response, body) => {
            if (error) {
                reject(error);
                return;
            } else if (response.statusCode != 200) {
                reject(new Error(`Error: ${response.statusCode} - ${body.toString('utf8')}`));
                return;
            }

            const result = JSON.parse(body);
            resolve(result.has_profanity);
        });
    });
}

module.exports = hasProfanity;
