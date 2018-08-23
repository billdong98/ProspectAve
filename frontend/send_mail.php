<?php
/*
This first bit sets the email address that you want the form to be submitted to.
You will need to change this value to a valid email address that you can access.
*/
$webmaster_email = "prospectaveio@gmail.com";
$feedback_page = "index.html";
/*
This next bit loads the form field data into variables.
*/
$comments = $_REQUEST['feedback'] ;

/*
The following function checks for email injection.
Specifically, it checks for carriage returns - typically used by spammers to inject a CC list.
*/
function isInjected($str) {
	$injections = array('(\n+)',
	'(\r+)',
	'(\t+)',
	'(%0A+)',
	'(%0D+)',
	'(%08+)',
	'(%09+)'
	);
	$inject = join('|', $injections);
	$inject = "/$inject/i";
	if(preg_match($inject,$str)) {
		return true;
	}
	else {
		return false;
	}
}

// If we passed all tests, send the email.
if (!isInjected($comments)) {
    if(isset($comments) && !empty($comments)){
	   mail( "$webmaster_email", "Feedback Form Results", $comments);
	   header( "Location: $feedback_page" );
    }
}
?>