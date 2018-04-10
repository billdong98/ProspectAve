const express = require('express');
const app = express();

const http = require("http");
const cors = require('cors');
// require the sqlite module
const sqlite3 = require('sqlite3').verbose();

// connect to the db file
let db = new sqlite3.Database('./clubs.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQLite DB.');
});

let selectAll = 'SELECT * FROM club_status ORDER BY date';

app.use(cors());

app.get('/status', (request, response) => { 
    console.log('Hello getter!');
    
    db.all(selectAll, [], (err, rows) => {
        if(err){
            throw err;
        }
        
        rows.forEach((row)=> {
            console.log(row);
            response.send(row);
        });
    });
})

app.post('/officer_post', (request, response) => {
    
    
    
})




app.listen(1738, (err) => {  
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log('server is listening on port: 1738');
})
