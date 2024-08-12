import { config } from 'dotenv';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import messagesFilterOptions from '../messagesFilterOptions.json' assert { type: 'json' };
// load variables from .env into process.env
config();
// Define __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
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
            userId: messagesFilterOptions.userId,
            q: `from:${messagesFilterOptions.q.from} subject:${messagesFilterOptions.q.subject} after:${messagesFilterOptions.q.after}`, // add filter query
            maxResults: messagesFilterOptions.maxResults, // limit the number of results
        });
        const messages = res.data.messages;
        if (!messages || messages.length === 0) {
            console.log('No messages found.');
            return;
        }
        // accumulate email details into an array
        const allEmailDetails = [];
        // save email details for all emails that pass the filter
        for (let message of messages) {
            let msg = await gmail.users.messages.get({ userId: 'me', id: message.id });
            console.log(`Message snippet: ${msg.data.snippet}`);
            // collect details from the email
            const headers = msg.data.payload?.headers || [];
            const emailDetails = {
                id: msg.data.id,
                snippet: msg.data.snippet,
                subject: headers.find(header => header.name === 'Subject')?.value || 'No Subject',
                from: headers.find(header => header.name === 'From')?.value || 'Unknown Sender',
                date: headers.find(header => header.name === 'Date')?.value || 'No Date',
            };
            // add email details to the array
            allEmailDetails.push(emailDetails);
        }
        // save emails' details to a JSON file
        const allEmailsJsonFilePath = path.join(__dirname, 'filteredEmails.json');
        fs.writeFileSync(allEmailsJsonFilePath, JSON.stringify(allEmailDetails, null, 2));
        console.log(`All email details saved to ${allEmailsJsonFilePath}`);
        // handle attachments for all filtered emails
        for (let message of messages) {
            let msg = await gmail.users.messages.get({ userId: 'me', id: message.id });
            // check for attachments in the message payload
            const parts = msg.data.payload?.parts;
            if (parts) {
                for (let part of parts) {
                    if (part.filename && part.body && part.body.attachmentId) {
                        // attachment found
                        const attachmentId = part.body.attachmentId;
                        const attachment = await gmail.users.messages.attachments.get({
                            userId: 'me',
                            messageId: message.id,
                            id: attachmentId
                        });
                        const attachmentData = attachment.data?.data;
                        if (attachmentData) {
                            // decode string from base64
                            const decodedAttachment = Buffer.from(attachmentData, 'base64');
                            // save the attachment
                            const filePath = path.join(__dirname, part.filename);
                            fs.writeFileSync(filePath, decodedAttachment);
                            console.log(`Attachment saved to ${filePath}`);
                            // stop after downloading the first attachment
                            return; // DELETE this 'return' statement if you want to download all the attachments from the filtered emails, not just the first
                        }
                    }
                }
            }
        }
    }
    catch (error) {
        console.error('Error filtering emails:', error.message);
    }
}
// call the function to send mail with provided options
// sendMail().then(result => console.log('Email sent!', result))
// .catch(error => console.log(error.message))
// filter emails using the filters added inside 'res' and download attachments (if there are any)
filterEmails();
//# sourceMappingURL=server.js.map