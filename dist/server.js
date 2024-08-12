import { google } from 'googleapis';
import nodemailer from 'nodemailer';
const CLIENT_ID = '';
const CLIENT_SECRET = '';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '';
// allow this app to access a gmail address by using the CLIENT_ID, CLIENT_SECRET, REDIRECT_URI and REFRESH_TOKEN listed above
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
// create a function that sends an email with the provided options
async function sendMail() {
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'johndoe@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        });
        const mailOptions = {
            from: 'johndoe@gmail.com', // alternative format: 'John Doe <johndoe@gmail.com>'
            to: 'example@gmail.com',
            subject: 'Email subject',
            text: 'This is just a text placeholder.',
            html: '<h1>This is a text placeholder.</h1>', // optional: You can provide the HTML version of your email - this allows for rich formatting, including images, links, fonts, colors and layouts.
        };
        const result = await transport.sendMail(mailOptions);
        return result;
    }
    catch (error) {
        return error;
    }
}
// create a function that filters email messages by using the specified options inside 'res'
async function filterEmails() {
    try {
        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
        const res = await gmail.users.messages.list({
            userId: 'me',
            q: 'from:johndoe@gmail.com subject:email after:2024/08/12', // add filter query
            maxResults: 3, // limit the number of results
        });
        const messages = res.data.messages;
        if (!messages || messages.length === 0) {
            console.log('No messages found.');
            return;
        }
        console.log('Messages:', messages);
        for (let message of messages) {
            let msg = await gmail.users.messages.get({ userId: 'me', id: message.id });
            console.log(`Message snippet: ${msg.data.snippet}`);
        }
    }
    catch (error) {
        console.error('Error filtering emails:', error.message);
    }
}
// call the function to send mail with provided options
// sendMail().then(result => console.log('Email sent!', result))
// .catch(error => console.log(error.message))
// filter emails using the filters added inside 'res'
filterEmails();
//# sourceMappingURL=server.js.map