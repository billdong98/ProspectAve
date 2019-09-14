const express = require('express');
const app = express();
const fs = require('fs');
const http = require("http");
const cors = require('cors');
// to read POST request bodies
const formidable = require('express-formidable');
const dateTime = require('node-datetime');
const auth = require('./Auth.js');
const db = require('./db.js');
// for handling sessions
var cookieSession = require('cookie-session');
const asyncHandler = require('express-async-handler');
// setup Express server
const fileUpload = require('express-fileupload');
const util = require('util');
var bodyParser = require('body-parser');

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

var authenticationCheck = function (req, res, next) {
    var identity = auth.identity(req);
    if(identity == null) {
        console.log("Failed attempt by: " + req.session.id);
        res.status(401);
        res.send("You need to be logged in to do this!");
        return;
    }
    req.identity = identity;
    next();
}
/*
// set an authentication check
app.post('*', (req, res, next) => {
    console.log("Checking db...");
    auth.identity(req).then(function(identity){
        if(identity == null) {
                console.log("Failed attempt POST data");
                res.status(401);
                res.send("You need to be logged in to do this!");
                return;
        }
        next();
    });
})*/

app.use('/officer_post', fileUpload());
app.use('/edit', fileUpload());
app.use('/delete', fileUpload());
var jsonParser = bodyParser.json();

var https = require('https');

/* handling HTTPS */

const options = {
    key: fs.readFileSync('./../../ssl/keys/b1f8a_544c5_68f106f21f8de236e8d7f03067f508c9.key').toString(),
    cert: fs.readFileSync('./../../ssl/certs/prospectave_io_b1f8a_544c5_1575158399_e1dafe180e5b636cf7a129100d72fb62.crt').toString()
};


https.createServer(options, app).listen(1738);
console.log("------------------------------");
console.log("Relaunched server on port 1738.");
console.log("Current date: " + currentDate());

/* gets the current clubs from the DB */
/* allow ALL domains */
app.get('/status', cors(), asyncHandler(async (request, response, next) => {
    //console.log('Hello getter! Current date: ' + currentDate());
    let rows = await db.allAsync(db.selectAll);
    response.send(rows);
}))

// logs the user in. 
// if the user is already logged in (has session cookie), then redirect to the officer page
// else if the user
// if not, then redirect to CAS 
app.get('/login', (request, response) => { 
    if(request.session.isPopulated) {
        console.log(`Already logged in: ${request.session.id} (${request.session.club})`);
        auth.redirectOfficer(response, request.session.id);
        // redirect to officer page
        return;
    }

    var callback = async function(result){
        if(result != false){
            // logged in, but not an officer
            var c = await auth.getClub(result);
            if(c == null){
                console.log("Failed login by: " + result + " (not an officer)");
                auth.redirectFailedAttempt(response);
            } else {
                // Only set cookies if valid officer login!
                request.session.id = result;
                request.session.club = c;
                console.log("Created cookie for: " + request.session.id);
                console.log(`Successful login: ${request.session.id} (${request.session.club})`);
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
        //console.log("Returned from CAS... verifying netid")
        // we have just been redirected back here by CAS
        auth.verify(request.query.ticket, callback); 
    }
})

/* --------------------------- ADMIN USE ONLY --------------------------- */
app.get('/auth_download', authenticationCheck, asyncHandler(async (request, response, next) => {
    response.setHeader('Content-Type', 'application/json');
    var identity = request.identity;

    // officer, admin
    if(identity.club != "ADMIN"){
        console.log("Unauthorized attempt to get auth data by: " + identity.netID);
        response.json({"identity": null, "rows": null});
        return;
    }
    var data = {"identity": identity, "auth_list" : null};
    data.auth_list = await db.allAsync(db.selectAllAuth);
    response.json(data);
}))

/* deletes a given officer */
app.post('/auth_delete', authenticationCheck, jsonParser, asyncHandler(async (request, response, next) => {
    var identity = request.identity;

    if(identity.club != "ADMIN"){
        console.log(identity.netID + " tried to delete auth data!");
        response.send("ILLEGAL ACCESS");
        return;
    }
    var obj = request.body;
    // data for the sql query
    var data = [obj.netID];

    await db.runAsync(db.deleteAuth, data);
    console.log(identity.netID, "(" + identity.club + ")", "deleted access for", data);
    response.send("Successfully deleted officer.");
}))

/* adding new officers */
app.post('/auth_add', authenticationCheck, jsonParser, asyncHandler(async (request, response, next) => {
    var identity = request.identity;

    if(identity.club != "ADMIN"){
        console.log(identity.netID + " tried to add auth data!");
        response.send("ILLEGAL ACCESS");
        return;
    }
    var obj = request.body;
    // data for the sql query
    var data = [obj.netID, obj.club];

    await db.runAsync(db.addAuth, data);
    console.log(identity.netID, "(" + identity.club + ")", "added access for", data);
    response.send("Successfully deleted officer.");
}))



/* --------------------------- OFFICER USE ONLY --------------------------- */
// sends netID and club events as JSON to officer.html
app.get('/officer_download', authenticationCheck, asyncHandler(async (request, response, next) => {
    response.setHeader('Content-Type', 'application/json');

    var identity = request.identity;
    
    if(identity == null) {
        console.log("Unauthorized attempt to get club data");
        response.json({"identity": null, "rows": null});
        return;
    } else { // officer, admin
        var data = {"identity": identity, "rows" : null};
        if(identity.club == "ADMIN")
            data.rows = await db.allAsync(db.selectAll);
        else // get row for this club
            data.rows = await db.allParamsAsync(db.selectByClub, [identity.club]);
        response.json(data);
    }  
}))

/* handles a post request of club data */
app.post('/officer_post',authenticationCheck, asyncHandler(async (request, response, next) => {
    var identity = request.identity;
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
    var query = db.postQuery;

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
        query += db.placeholders;
        var date = dates[i];
        data.push(club, date, netID, post_date, status, info, filename);
    }
        
    console.log(data);
    await db.runAsync(query, data);
    console.log(netID + " (" + club + ") added data");
    response.send("Successfully added data!");
}))


/* deletes a given date */
app.post('/delete', authenticationCheck, asyncHandler(async (request, response, next) => {
    var identity = request.identity;

    var obj = request.body;
    // data for the sql query
    var data = [obj.d, obj.c];

    // if somehow you're trying to delete another club's data
    if(identity.club != obj.c && identity.club != "ADMIN"){
        console.log("Club: " + identity.club + ", Input: " + obj.c + " mismatch!");
        response.send("You're not authorized to delete that club's event.");
        return;
    }

    await db.runAsync(db.deleteEventsQuery, data);
    console.log(identity.netID, "(" + identity.club + ")", "deleted event for", obj.d);
    response.send("Successfully deleted event.");
}))


// handles an edit request from an authenticated user
// body has two fields: date and club
app.post('/edit', authenticationCheck, asyncHandler(async (request, response, next) => {
    var identity = request.identity;
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
    var addQuery = db.postQuery + placeholders;

    // delete the existing event
    await db.runAsync(db.deleteEventsQuery, [date, club]);
    await db.runAsync(db.addQuery, newRow);
    console.log("Edited row(s) by " + netID);
    response.send("Successfully edited row");
}))

// returns the current time in our format
function currentDate(){
    var dt = dateTime.create();
    return dt.format('m/d/Y');
}
