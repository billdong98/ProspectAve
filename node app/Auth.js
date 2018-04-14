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


const mapping = {
    "mman" : "Cap",
    "ssjoberg" : "Lame",
    "wzdong" : "Tower",
    "junep" : "Ivy",
    "yangt" : "Cap",
    "bliang" : "Cannon",
}

function getClub(netID){
    return mapping[netID];
}


module.exports = {
    redirect : function(res){ redirect(res)},
    verify: function(ticketID, callback){verify(ticketID, callback)},
    redirectOfficer: function(res){ redirectOfficer(res)},
    getClub: function(netID){return getClub(netID)}
}


