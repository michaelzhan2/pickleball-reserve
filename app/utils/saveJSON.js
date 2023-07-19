const fs = require('fs');


function saveJSON() {
  const data = JSON.stringify({
    "username": "test",
    "password": "test",
  })
  fs.writeFileSync('../data/test.json', data);
}