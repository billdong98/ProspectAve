const express = require('express');
const app = express();
const fs = require('fs');
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

var https = require('https');
//https.createServer(options, app).listen(1234);


/* handling HTTPS */
const options = {
  key: fs.readFileSync('./../../ssl/keys/9f016_d0a13_46664a744423c921776ce2dde252b120.key').toString(),
  cert: fs.readFileSync('./../../ssl/certs/prospectave_io_9f016_d0a13_1530835199_f77b28e7908bb77ad4e6cbe0ea03205e.crt').toString()
};

https.createServer(options, app).listen(1738);
console.log("Server listening on port: " + 1738);

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
let post = 'INSERT INTO club_status VALUES ';
let placeholders = '(?,?,?,?,?,?)';


/* gets the current clubs from the DB */
app.get('/status', (request, response) => { 
    console.log('Hello getter! Current date: ' + currentDate());
        
    db.all(selectAll, [], (err, rows) => {
        if(err){
            throw err;
        }
        
        console.log("GET: sent " + rows.length + " rows.");
        response.send(rows);
    });
})


/* clears the DB */
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


/* handles a post request */
app.post('/officer_post', (request, response) => {
    var obj = request.body;
    // IMPLEMENT THIS FOR JSON ARRAY LATER
    console.log(obj);
    var club = obj.c;
    var dates = obj.d;
    var netID = obj.p;
    var status = obj.s;
    var post_date = currentDate();
    var info = obj.i;
    
    var data = [];
    var query = post;
    
    // construct query and input for each element in dates
    for(var i=0; i<dates.length;i++){
        if(i != 0){
            query += ", ";
        }
        query += placeholders;
        var date = dates[i];
        data.push(club, date, netID, post_date, status, info);
    }
    
    console.log(query);
    console.log(data);
    
    db.run(query, data, (err)=>{
       if(err){ 
           response.status(500);
           response.send("ERROR");
           console.log(err);
       } else {
           console.log("CHANGED: " + this.changes);
           response.send("Ok.");
       }
    });
})


// returns the current time in 
function currentDate(){
    var dt = dateTime.create();
    var formatted = dt.format('m/d/Y');
    return formatted;
}
