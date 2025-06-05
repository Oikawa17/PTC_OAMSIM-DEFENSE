const app = require('./app');
const PORT = 5000;
const bcrypt = require('bcrypt');

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
