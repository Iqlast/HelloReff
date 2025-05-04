const { google } = require('googleapis');
const express = require('express');
const bodyParser = require('body-parser');
const { authenticate } = require('@google-cloud/local-auth');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const cheerio = require('cheerio');

const app = express();
app.use(bodyParser.json());

// CONFIGURATION
const config = {
  email: "your mail imap",
  port: 3001,
  checkInterval: 10000,
  tokenPath: path.join(__dirname, 'token.json'),
  otpFilePath: path.join(__dirname, 'otp.txt') // Path for OTP file
};

// STYLING
const style = {
  header: chalk.bold.cyan,
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  email: {
    from: chalk.green.bold,
    to: chalk.blue.bold,
    subject: chalk.yellow.bold,
    divider: chalk.gray,
    body: chalk.white
  }
};

let authClient;
let gmail;
let checkInboxInterval;
let startTime;
let lastProcessedEmailId = null; // Track the last processed email ID

// Fungsi untuk menyimpan token
async function saveToken(token) {
  fs.writeFileSync(config.tokenPath, JSON.stringify(token));
}

// Fungsi untuk memuat token
async function loadToken() {
  if (fs.existsSync(config.tokenPath)) {
    return JSON.parse(fs.readFileSync(config.tokenPath));
  }
  return null;
}

// Fungsi untuk menyimpan OTP ke file
function saveOTP(otp) {
  try {
    fs.writeFileSync(config.otpFilePath, otp);
    console.log(style.success(`✓ OTP ${otp} berhasil disimpan ke ${config.otpFilePath}`));
  } catch (error) {
    console.error(style.error('Error menyimpan OTP:'), error.message);
  }
}

// Inisialisasi Gmail API
async function initGmail() {
  try {
    const SCOPES = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ];

    const token = await loadToken();
    
    if (token) {
      const oAuth2Client = new google.auth.OAuth2(
        token.client_id,
        token.client_secret,
        token.redirect_uri
      );
      oAuth2Client.setCredentials(token);
      authClient = oAuth2Client;
    } else {
      const credentials = JSON.parse(fs.readFileSync('./credentials.json'));
      const { client_id, client_secret, redirect_uris } = credentials.web;
      
      const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
      );
      
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
      });
      
      console.log(style.header('\n════════════════════════════════════════'));
      console.log(style.header('  AUTHORIZATION REQUIRED'));
      console.log(style.header('════════════════════════════════════════'));
      console.log(style.warning('\nSilakan buka URL berikut di browser Anda dan izinkan akses:\n'));
      console.log(authUrl);
      console.log(style.header('\n════════════════════════════════════════\n'));
      
      authClient = await authenticate({
        keyfilePath: './credentials.json',
        scopes: SCOPES,
      });
      
      await saveToken({
        ...authClient.credentials,
        client_id,
        client_secret,
        redirect_uri: redirect_uris[0]
      });
    }
    
    gmail = google.gmail({ version: 'v1', auth: authClient });
    console.log(style.success('\n✓ Berhasil terhubung ke Gmail'));
    startTime = Date.now();
    startInboxMonitoring();
    
  } catch (error) {
    console.error(style.error('Error:'), error.message);
    process.exit(1);
  }
}

// Fungsi untuk mengekstrak OTP dari email
function extractOTP(parts) {
  for (const part of parts || []) {
    if (part.mimeType === 'text/html' && part.body?.data) {
      const htmlContent = Buffer.from(part.body.data, 'base64').toString('utf8');
      const $ = cheerio.load(htmlContent);
      // Cari elemen <p> dengan data-id="react-email-text" dan font-size: 30px
      const otpElement = $('p[data-id="react-email-text"]').filter(function () {
        return $(this).css('font-size') === '30px';
      });
      const otp = otpElement.text().trim();
      if (otp) return otp; // Kembalikan OTP jika ditemukan
    } else if (part.mimeType.includes('multipart')) {
      const nestedOTP = extractOTP(part.parts); // Rekursif untuk bagian nested
      if (nestedOTP) return nestedOTP;
    }
  }
  return ''; // Kembalikan string kosong jika tidak ada OTP
}

// Cek email baru
async function checkNewEmails() {
  try {
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 1
    });
    
    const messages = res.data.messages || [];
    
    if (messages.length > 0) {
      const latestEmailId = messages[0].id;
      
      // Skip if this email was already processed
      if (latestEmailId === lastProcessedEmailId) {
        return;
      }
      
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: latestEmailId,
        format: 'full'
      });
      
      const headers = msg.data.payload.headers;
      const dateHeader = headers.find(h => h.name.toLowerCase() === 'date')?.value;
      if (!dateHeader) return;
      
      const emailTime = new Date(dateHeader).getTime();
      
      if (emailTime > startTime) {
        const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || '(No Sender)';
        const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
        
        const otp = extractOTP(msg.data.payload.parts || [msg.data.payload]);
        
        if (otp) {
          console.log(style.email.divider('\n════════════════════════════════════════'));
          console.log(style.header('  EMAIL BARU MASUK'));
          console.log(style.email.divider('════════════════════════════════════════'));
          console.log(style.email.from(`Dari: ${from}`));
          console.log(style.email.subject(`Subjek: ${subject}`));
          console.log(style.email.body(otp));
          console.log(style.email.divider('════════════════════════════════════════\n'));
          
          // Simpan OTP ke file
          saveOTP(otp);
          
          // Update the last processed email ID
          lastProcessedEmailId = latestEmailId;
          
          // Log waiting for new email
          console.log(style.success('Menunggu email baru...'));
        }
      }
    }
  } catch (error) {
    console.error(style.error('Error memeriksa email:'), error.message);
  }
}

// Mulai pemantauan inbox
function startInboxMonitoring() {
  console.log(style.success('✓ Menunggu email baru...'));
  checkInboxInterval = setInterval(checkNewEmails, config.checkInterval);
}

// Server
const server = app.listen(config.port, async () => {
  await initGmail();
});

// Handle exit
process.on('SIGINT', () => {
  clearInterval(checkInboxInterval);
  console.log(style.success('\n✓ Berhenti memantau email'));
  process.exit();
});
