<?php
// Load Composer's autoloader
require 'vendor/autoload.php';

// Configuration
// PASTE YOUR NEW API KEY BELOW
$apiKey = SEND_GRIDAPI 
$fromEmail = 'andrew@dibberlab.me';
$toEmail = 'amcmorrow84@proton.me';
$subject = 'Test Email from SendGrid PHP';
$messageBody = 'This is a test email sent using the SendGrid PHP Library.';

// Create the Mail object
$email = new \SendGrid\Mail\Mail();
$email->setFrom($fromEmail, "Andrew"); // Added a name for better deliverability
$email->setSubject($subject);
$email->addTo($toEmail);
$email->addContent("text/plain", $messageBody);
// You can also add HTML content:
// $email->addContent("text/html", "<strong>This is a test</strong>");

// Initialize SendGrid
$sendgrid = new \SendGrid($apiKey);

try {
    // Send the email
    $response = $sendgrid->send($email);
    
    // Output the response for debugging
    echo "Status Code: " . $response->statusCode() . "\n";
    // Status 202 means Accepted/Sent.
    
    if ($response->statusCode() != 202) {
        print_r($response->headers());
        print_r($response->body());
    } else {
        echo "Email sent successfully!\n";
    }

} catch (Exception $e) {
    echo 'Caught exception: '. $e->getMessage() ."\n";
}
?>