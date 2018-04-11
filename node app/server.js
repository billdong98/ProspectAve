const express = require('express');
const app = express();

const http = require("http");
const cors = require('cors');
// require the sqlite module
const sqlite3 = require('sqlite3').verbose();
// to read POST request bodies
const bodyParser = require('body-parser');
const dateTime = require('node-datetime');

// setup Express server
app.use(bodyParser.json());
app.use(cors());

// connect to the db file
let db = new sqlite3.Database('./clubs.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQLite DB.');
});


/* QUERIES */
// gets all records from club_status
let selectAll = 'SELECT * FROM club_status ORDER BY date';
// [(club_name, date, poster, post_date, status, info)]
let post = 'INSERT INTO club_status VALUES (?,?,?,?,?,?)';



app.get('/status', (request, response) => { 
    console.log('Hello getter! Current date: ' + currentDate());
        
    db.all(selectAll, [], (err, rows) => {
        if(err){
            throw err;
        }
        
        console.log(rows);
        response.send(rows);
    });
})


app.get('/clear', (request, response) => { 
    console.log('CLEARING DB');
    
    db.run("DELETE from club_status", [], (err, result) => {
        if(err){
            throw err;
        }
        
        console.log(result);
        response.send(result);
    });
})



app.post('/officer_post', (request, response) => {
    var obj = request.body;
    // IMPLEMENT THIS FOR JSON ARRAY LATER
    console.log(obj);
    var club = obj.c;
    var date = obj.d;
    var netID = obj.p;
    var status = obj.s;
    var post_date = currentDate();
    var info = obj.i;
    
    var data = [club, date, netID, post_date, status, info];
    
    db.run(post, data, (err)=>{
       if(err){ 
           response.status(500);
           response.send("ERROR");
           throw err;
       }
        console.log("CHANGED: " + this.changes);
        response.send("Ok.");
    });
})

app.listen(1738, (err) => {  
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log('server is listening on port: 1738');
})

// returns the current time in 
function currentDate(){
    var dt = dateTime.create();
    var formatted = dt.format('m-d-Y');
    return formatted;
}
