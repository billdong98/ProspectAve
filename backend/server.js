const express = require('express');
const app = express();
const fs = require('fs');
const http = require("http");
const cors = require('cors');
// require the sqlite module
const sqlite3 = require('sqlite3').verbose();
// to read POST request bodies
const formidable = require('express-formidable');
const dateTime = require('node-datetime');
const auth = require('./Auth.js');
// for handling sessions
var cookieSession = require('cookie-session');
const asyncHandler = require('express-async-handler');
// setup Express server
const fileUpload = require('express-fileupload');
const util = require('util');

var whitelist = ['https://prospectave.io', 'https://prospectave.io:1738', 'https://www.prospectave.io', 'undefined', 'null', undefined];

var corsOptions = {
  origin: function (origin, callback) {

    //TESTING CORS OVERRIDES ONLY. REMOVE IN PROD
    if(origin == null){
        callback(null, true);
        return;
    }

    if(origin.includes("http://127.0.0.1:")){
        //console.log("override for testing");
        callback(null, true);
        return;
    }

    if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
    } else {
        console.log('Not allowed by CORS: ' + origin);
        callback(null, false);
    }
},
credentials: true
}

// setting up middleware options
app.use(cors(corsOptions));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Credentials", true);
    next();
});
// setup cookie sessions
app.use(cookieSession({
    name: 'prospectave_session',
    secret: 'verysecurekey',
    domain: 'prospectave.io',
    httpOnly: false,
    sameSite: 'lax',
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
// set an authentication check
app.post('*', (req, res, next) => {
    var identity = auth.identity(req);
    if(identity == null) {
        console.log("Failed attempt POST data");
        res.status(401);
        res.send("You need to be logged in to do this!");
        return;
    }
    next();
})
app.use('/officer_post', fileUpload());
app.use('/edit', fileUpload());
app.use('/delete', fileUpload());


var https = require('https');

/* handling HTTPS */
const options = {
    key: fs.readFileSync('./../../ssl/keys/b18a6_58805_89cdb2608c1a3a3855eef88c1a65e5e4.key').toString(),
    cert: fs.readFileSync('./../../ssl/certs/prospectave_io_b18a6_58805_1542239999_9f131f9c34a6ce7b49d995fc70855d12.crt').toString()
};

https.createServer(options, app).listen(1738);
console.log("------------------------------");
console.log("Relaunched server on port 1738.");
console.log("Current date: " + currentDate());

// connect to the db file
let db = new sqlite3.Database('./clubs.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite DB.');
});

db.allAsync = function (sql) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that.all(sql, function (err, rows) {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
};

db.allParamsAsync = function (sql, params) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that.all(sql, params, function (err, rows) {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
};

db.runAsync = function (sql, params) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that.run(sql, params, function(err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    })
};


/* SQLITE QUERIES */

// insert a new row into the database
// [(club_name, date, poster, post_date, status, info)]
let postQuery = 'INSERT INTO club_status VALUES ';
let placeholders = '(?,?,?,?,?,?,?)';
// part of a query

//let afterToday = "DATE(substr(date,7,4)||'-'||substr(date,1,2)||'-'||substr(date,4,2)) >= date('now','localtime', '-4 hours')";
//let selectPast = "SELECT * FROM club_status WHERE DATE(substr(date,7,4)||'-'||substr(date,1,2)||'-'||substr(date,4,2)) < date('now','localtime', '-4 hours') ORDER BY date";

// gets all records from club_status after today
let selectAll = 'SELECT * FROM club_status ORDER BY DATE(substr(date,7,4)||"-"||substr(date,1,2)||"-"||substr(date,4,2))';
// get records from club_status for a particular club (after today)
let selectByClub = 'SELECT * FROM club_status WHERE club_name = ? ORDER BY DATE(substr(date,7,4)||"-"||substr(date,1,2)||"-"||substr(date,4,2))';
// delete a given event (club and date needed) 
let deleteEventsQuery = 'DELETE from club_status WHERE date = ? and club_name = ?';

/* gets the current clubs from the DB */
/* allow ALL domains */
app.get('/status', cors(), asyncHandler(async (request, response, next) => {
    //console.log('Hello getter! Current date: ' + currentDate());
    let rows = await db.allAsync(selectAll);
    response.send(rows);
}))

// logs the user in. 
// if the user is already logged in (has session cookie), then redirect to the officer page
// else if the user
// if not, then redirect to CAS 
app.get('/login', (request, response) => { 
    if(request.session.isPopulated) {
        console.log(`Logged in: ${request.session.id}`);
        auth.redirectOfficer(response, request.session.id);
        // redirect to officer page
        return;
    }

    var callback = function(result){
        if(result != false){
                // logged in, but not an officer
                if(auth.getClub(result) == null){
                    console.log("Failed login by: " + result);
                    auth.redirectFailedAttempt(response);
                } else {
                    request.session.id = result;
                    console.log("Created cookie for: " + request.session.id);
                    console.log(`Logged in: ${request.session.id}`);
                    auth.redirectOfficer(response, request.session.id);
                    return;
                }
            } else {
                console.log("Invalid auth token");
                response.status(500);
                response.send("Invalid auth token.");
            }
        }.bind({request: request, response: response});
    // no ticket, need to authenticate
    if(!request.query.ticket){
        //console.log("Redirecting to CAS");
        auth.redirect(response);
    } else {
        // we have just been redirected back here by CAS
        auth.verify(request.query.ticket, callback); 
    }
})

// sends netID and club events as JSON to officer.html
app.get('/officer_download', asyncHandler(async (request, response, next) => {
    response.setHeader('Content-Type', 'application/json');

    var identity = auth.identity(request);
    
    if(identity == null) {
        console.log("Unauthorized attempt to get club data");
        response.json({"identity": null, "rows": null});
        return;
    } else { // officer, admin
        var data = {"identity": identity, "rows" : null};
        if(identity.club == "ADMIN")
            data.rows = await db.allAsync(selectAll);
        else // get row for this club
            data.rows = await db.allParamsAsync(selectByClub, [identity.club]);
        response.json(data);
    }  
}))

/* handles a post request of club data */
app.post('/officer_post', asyncHandler(async (request, response, next) => {
    var identity = auth.identity(request);
    // json object input 
    var obj = request.body;
    var club = identity.club;
    if(club == "ADMIN") club = obj.c;
    // CSV of date strings
    var dates = obj.d;
    var netID = identity.netID;
    var status = obj.s;
    var post_date = currentDate();
    var info = obj.i;

    var data = [];
    var query = postQuery;

    console.log(obj);
    console.log(request.files);

    // split the array (or single date) up
    dates = dates.split(",");

    var filename = "";
    if(request.files){ // only called in the single upload case (no bulk)
        let f = request.files.uploadedImage;
        filename = f.name;
        await f.mv('/home/kidstarter/public_html/prospectave/uploads/' + f.name);
    }
    
    // TODO: delete rows if they already exist 
    
    // construct query and input for each element in dates
    for(var i=0; i<dates.length;i++){
        if(i != 0) query += ", ";
        query += placeholders;
        var date = dates[i];
        data.push(club, date, netID, post_date, status, info, filename);
    }
    
    await db.runAsync(query, data);
    console.log(netID + " (" + club + ") added data");
    response.send("Successfully added data!");
}))


/* deletes a given date */
app.post('/delete', asyncHandler(async (request, response, next) => {
    var identity = auth.identity(request);

    var obj = request.body;
    // data for the sql query
    var data = [obj.d, obj.c];

    // if somehow you're trying to delete another club's data
    if(identity.club != obj.c && identity.club != "ADMIN"){
        console.log("Club: " + identity.club + ", Input: " + obj.c + " mismatch!");
        response.send("You're not authorized to delete that club's event.");
        return;
    }

    await db.runAsync(deleteEventsQuery, data);
    console.log(identity.netID, "(" + identity.club + ")", "deleted event for", obj.d);
    response.send("Successfully deleted event.");
}))


// handles an edit request from an authenticated user
// body has two fields: date and club
app.post('/edit', asyncHandler(async (request, response, next) => {
    var identity = auth.identity(request);
    var obj = request.body;
    var club = identity.club;
    var netID = identity.netID;
    var date = obj.d;
    var status = obj.s;
    var post_date = currentDate();
    var info = obj.i;

    // default to the original name sent by the client (i.e. don't change)
    var filename = "";

    if (obj.uploadedImage != undefined) {
       filename = obj.uploadedImage;
   }

    if(request.files){ // only called in the single upload case (no bulk)
        let f = request.files.uploadedImage;
        filename = f.name;
        await f.mv('/home/kidstarter/public_html/prospectave/uploads/' + f.name);
    }

    var newRow = [club, date, netID, post_date, status, info, filename];
    var addQuery = postQuery + placeholders;

    // delete the existing event
    await db.runAsync(deleteEventsQuery, [date, club]);
    await db.runAsync(addQuery, newRow);
    console.log("Edited row(s) by " + netID);
    response.send("Successfully edited row");
}))

// returns the current time in our format
function currentDate(){
    var dt = dateTime.create();
    return dt.format('m/d/Y');
}
