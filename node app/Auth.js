const https = require('https');


// verifies the ticketID passed back to /login via CAS
const serviceURL = 'https://prospectave.io/redirect/';
function verify(ticketID, callback){
    console.log("Verifying");
    //console.log(`https://fed.princeton.edu/cas/validate?service=${serviceURL}&ticket=${ticketID}`);
    let validateURL = `https://fed.princeton.edu/cas/validate?service=${serviceURL}&ticket=${ticketID}`
    https.get(validateURL,
              (res,d)=>
              {
        let body = "";
        res.setEncoding("utf8");
        res.on('data',(d) => {body+=d})
        res.on('end', ()=>{
            let answer = body.split('\n');
            if (answer[0] == 'no'){
                callback(false);
            }
            callback(answer[1]); //return netID
        })}).on('error',console.log);
}


//const serviceURL = 'https://localhost:1738/login';

function redirect(response){
    response.writeHead(301,
                       {Location: `https://fed.princeton.edu/cas/login?service=https://prospectave.io/redirect/`}
                      );
    response.end();
}


function redirectOfficer(response){
    console.log("Redirecting to officer page.");
    response.writeHead(301,
                       {Location: `https://fed.princeton.edu/cas/login?service=https://prospectave.io/officer.html`}
                      );
    response.end();
}

function redirectFailedAttempt(response){
    response.writeHead(301,
                       {Location: `https://prospectave.io/failed_login.html`});
    response.end();
}

const mapping = {
    "mman" : "Charter",
    "wzdong" : "Tower",
    "junep" : "Charter",
    "yangt" : "Cap",
    "bliang" : "Cloister",
    // actual officers
    "sbelt": "Charter",
    "eaguas": "Cap",
    "rjh3": "Cap",
    "jpinnock": "Cap",
    "tdatta": "Quadrangle",
    "nwedel": "Quadrangle"
}

function getClub(netID){
    return mapping[netID];
}


// returns an identity object
// if the user is not logged in, return a null identity
function identity(request){
    if (!request.session.isPopulated){
        return null;
    }
    var identity = {netID: request.session.id, club: mapping[request.session.id]};
    return identity;
}


module.exports = {
    redirect : function(res){ redirect(res)},
    verify: function(ticketID, callback){verify(ticketID, callback)},
    redirectOfficer: function(res){ redirectOfficer(res)},
    getClub: function(netID){return getClub(netID)},
    identity: function(request){return identity(request)},
    redirectFailedAttempt: function(res){redirectFailedAttempt(res)}
}


