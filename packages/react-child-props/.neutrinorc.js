let eslint = require('@constgen/eslint')

module.exports = {
   use: [
      eslint({
         eslint: {
				env: { browser: true }
         }
      })
   ]
}