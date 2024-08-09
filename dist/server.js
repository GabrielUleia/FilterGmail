import { google } from 'googleapis';
import nodemailer from 'nodemailer';
const CLIENT_ID = '';
const CLIENT_SECRET = '';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '';
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
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
sendMail().then(result => console.log('Email sent!', result))
    .catch(error => console.log(error.message));
//# sourceMappingURL=server.js.map