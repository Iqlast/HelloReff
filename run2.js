const axios = require('axios');
const fs = require('fs').promises;
const querystring = require('querystring');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');

// Configuration
const config = {
  csrfToken: 'e97325275f06a3483ff914f50ce847c76002b8fdd282467d0fd0c55feba975e8',
  refCode: '3566143',
  intervals: {
    postInterval: 1000,
    otpCheckInterval: 5000,
    maxOtpWait: 60000,
  },
  headers: {
    firstPost: {
      'next-action': '9de34af8dc563e574f96622e856b144032cba306',
      'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'next-router-state-tree': '%5B%22%22%2C%7B%22children%22%3A%5B%22(homepage)%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2C%22%2F%22%2C%22refresh%22%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'accept': 'text/x-component',
      'content-type': 'text/plain;charset=UTF-8',
      'x-deployment-id': 'dpl_FK6ZtmFwM6hgriNZx2FLpiv7BSnB',
      'origin': 'https://club.hello.one',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'referer': 'https://club.hello.one/',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'cookie': '__Host-authjs.csrf-token=e97325275f06a3483ff914f50ce847c76002b8fdd282467d0fd0c55feba975e8%7Cedb59eec1bac2ba5e4ff682549f6f2b7faf01bc3fa35481876a22628be8262ee; __Secure-authjs.callback-url=https%3A%2F%2Fclub.hello.one%2F',
      'priority': 'u=1, i',
    },
    secondPost: {
      'next-action': '6cb3da7230ec06529ae52a531d4a9423472cedd6',
      'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'next-router-state-tree': '%5B%22%22%2C%7B%22children%22%3A%5B%22(homepage)%22%2C%7B%22children%22%3A%5B%22__PAGE__%3F%7B%5C%22ref%5C%22%3A%5C%223566143%5C%22%7D%22%2C%7B%7D%2C%22%2F%3Fref%3D3566143%22%2C%22refresh%22%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'accept': 'text/x-component',
      'content-type': 'text/plain;charset=UTF-8',
      'x-deployment-id': 'dpl_FK6ZtmFwM6hgriNZx2FLpiv7BSnB',
      'origin': 'https://club.hello.one',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'referer': 'https://club.hello.one/?ref=3566143',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'cookie': '__Host-authjs.csrf-token=e97325275f06a3483ff914f50ce847c76002b8fdd282467d0fd0c55feba975e8%7Cedb59eec1bac2ba5e4ff682549f6f2b7faf01bc3fa35481876a22628be8262ee; __Secure-authjs.callback-url=https%3A%2F%2Fclub.hello.one%2F',
      'priority': 'u=1, i',
    },
    thirdPost: {
      'next-action': '86cdb9956fd52198ec737b2721dcd77c616b6bcb',
      'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'next-router-state-tree': '%5B%22%22%2C%7B%22children%22%3A%5B%22(homepage)%22%2C%7B%22children%22%3A%5B%22__PAGE__%3F%7B%5C%22ref%5C%22%3A%5C%223566143%5C%22%7D%22%2C%7B%7D%2C%22%2F%3Fref%3D3566143%22%2C%22refresh%22%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'accept': 'text/x-component',
      'content-type': 'text/plain;charset=UTF-8',
      'x-deployment-id': 'dpl_FK6ZtmFwM6hgriNZx2FLpiv7BSnB',
      'origin': 'https://club.hello.one',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'referer': 'https://club.hello.one/?ref=3566143',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'cookie': '__Host-authjs.csrf-token=e97325275f06a3483ff914f50ce847c76002b8fdd282467d0fd0c55feba975e8%7Cedb59eec1bac2ba5e4ff682549f6f2b7faf01bc3fa35481876a22628be8262ee; __Secure-authjs.callback-url=https%3A%2F%2Fclub.hello.one%2F',
      'priority': 'u=1, i',
    },
    otpPost: {
      'x-auth-return-redirect': '1',
      'sec-ch-ua-platform': '"Windows"',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'content-type': 'application/x-www-form-urlencoded',
      'sec-ch-ua-mobile': '?0',
      'accept': '*/*',
      'origin': 'https://club.hello.one',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'referer': 'https://club.hello.one/?ref=3566143',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'cookie': '__Host-authjs.csrf-token=e97325275f06a3483ff914f50ce847c76002b8fdd282467d0fd0c55feba975e8%7Cedb59eec1bac2ba5e4ff682549f6f2b7faf01bc3fa35481876a22628be8262ee; __Secure-authjs.callback-url=https%3A%2F%2Fclub.hello.one%2F',
      'priority': 'u=1, i',
    },
    referralPost: {
      'next-action': '39a46d7ad35b25740ca269ef5132bef9d2c98a11',
      'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'next-router-state-tree': '%5B%22%22%2C%7B%22children%22%3A%5B%22(other)%22%2C%7B%22children%22%3A%5B%22referral%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2C%22%2Freferral%22%2C%22refresh%22%5D%7D%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'accept': 'text/x-component',
      'content-type': 'text/plain;charset=UTF-8',
      'x-deployment-id': 'dpl_FK6ZtmFwM6hgriNZx2FLpiv7BSnB',
      'origin': 'https://club.hello.one',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'referer': 'https://club.hello.one/referral',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'priority': 'u=1, i',
    },
  },
};

// Function to generate random suffix for email
function generateRandomSuffix(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Function to read emails from mailbody.txt
async function readEmails() {
  try {
    const data = await fs.readFile('mailbody.txt', 'utf8');
    return data.split('\n').filter(email => email.trim());
  } catch (error) {
    console.error(chalk.red('❌ Failed to read mailbody.txt:', error.message));
    return [];
  }
}

// Function to read proxies from proxy.txt
async function readProxies() {
  try {
    const data = await fs.readFile('proxy.txt', 'utf8');
    return data.split('\n').filter(proxy => proxy.trim());
  } catch (error) {
    console.error(chalk.red('❌ Failed to read proxy.txt:', error.message));
    return [];
  }
}

// Function to select a random proxy
function getRandomProxy(proxies) {
  if (!proxies.length) return null;
  return proxies[Math.floor(Math.random() * proxies.length)];
}

// Function to create proxy agent
function createProxyAgent(proxyUrl) {
  if (!proxyUrl) return null;
  const parsed = new URL(proxyUrl);
  const protocol = parsed.protocol.replace(':', '').toLowerCase();
  const proxyOptions = {
    host: parsed.hostname,
    port: parsed.port,
  };
  if (parsed.username && parsed.password) {
    proxyOptions.auth = `${parsed.username}:${parsed.password}`;
  }

  if (['http', 'https'].includes(protocol)) {
    return new HttpsProxyAgent(proxyUrl);
  } else if (['socks4', 'socks5'].includes(protocol)) {
    return new SocksProxyAgent(proxyUrl);
  } else {
    throw new Error(`Unsupported proxy protocol: ${protocol}`);
  }
}

// Function to wait for OTP
async function waitForOtp() {
  const startTime = Date.now();
  while (Date.now() - startTime < config.intervals.maxOtpWait) {
    try {
      const otpData = await fs.readFile('otp.txt', 'utf8');
      const otp = otpData.trim();
      if (otp) return otp;
    } catch (error) {}
    await new Promise(resolve => setTimeout(resolve, config.intervals.otpCheckInterval));
  }
  throw new Error('OTP not received within time limit');
}

// Function to clear otp.txt
async function clearOtpFile() {
  try {
    await fs.writeFile('otp.txt', '');
    console.log(chalk.gray('✔️ otp.txt cleared'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to clear otp.txt:', error.message));
  }
}

// Function to parse first step response
function parseFirstPostResponse(responseData) {
  if (typeof responseData !== 'string') {
    return responseData[1]?.data?.user?.id;
  }
  const lines = responseData.split('\n');
  for (const line of lines) {
    if (line.startsWith('1:')) {
      const jsonString = line.substring(2);
      try {
        const jsonData = JSON.parse(jsonString);
        return jsonData.data?.user?.id;
      } catch (error) {
        throw new Error('Failed to parse JSON from first step response');
      }
    }
  }
  throw new Error('Section "1:" not found in first step response');
}

// Function to extract session token from set-cookie header
function extractSessionToken(setCookie) {
  if (!Array.isArray(setCookie)) return null;
  for (const cookie of setCookie) {
    if (cookie.includes('__Secure-authjs.session-token=')) {
      const match = cookie.match(/__Secure-authjs.session-token=([^;]+)/);
      return match ? match[1] : null;
    }
  }
  return null;
}

// Function to process one referral
async function processReferral(baseEmail, proxyAgent) {
  const randomSuffix = generateRandomSuffix();
  const email = baseEmail.replace('@', `+${randomSuffix}@`);
  const url = `https://club.hello.one?ref=${config.refCode}`;
  console.log(chalk.cyan(`📧 Processing email: ${email}`));

  // Step 1: Create user
  const firstBody = [email];
  const firstResponse = await axios.post(url, firstBody, {
    headers: config.headers.firstPost,
    httpsAgent: proxyAgent,
  });
  const userId = parseFirstPostResponse(firstResponse.data);
  console.log(chalk.green(`✔️ User ID: ${userId}`));

  await new Promise(resolve => setTimeout(resolve, config.intervals.postInterval));

  // Step 2: Link referral
  const secondBody = [{ referalCode: parseInt(config.refCode), newUser: userId }];
  await axios.post(url, secondBody, { headers: config.headers.secondPost, httpsAgent: proxyAgent });
  console.log(chalk.green('✔️ Step 2 completed!'));

  await new Promise(resolve => setTimeout(resolve, config.intervals.postInterval));

  // Step 3: Verify email
  const thirdBody = [email];
  await axios.post(url, thirdBody, { headers: config.headers.thirdPost, httpsAgent: proxyAgent });
  console.log(chalk.green('✔️ Step 3 completed!'));

  // Wait for OTP
  console.log(chalk.yellow('⏳ Waiting for OTP...'));
  const otp = await waitForOtp();
  console.log(chalk.green(`✔️ OTP Received: ${otp}`));

  // Step 4: Authenticate OTP
  const otpBody = querystring.stringify({
    email,
    otp,
    csrfToken: config.csrfToken,
    callbackUrl: '/referral',
  });
  const otpResponse = await axios.post(
    'https://club.hello.one/api/auth/callback/credentials',
    otpBody,
    {
      headers: config.headers.otpPost,
      httpsAgent: proxyAgent,
      maxRedirects: 0,
    }
  ).catch(error => error.response || { data: {}, headers: {} });
  const redirectUrl = otpResponse.data.url || otpResponse.headers.location;
  console.log(chalk.green('✔️ OTP authentication completed!'));

  const sessionToken = extractSessionToken(otpResponse.headers['set-cookie']);
  if (!sessionToken) throw new Error('Session token not found');

  await new Promise(resolve => setTimeout(resolve, config.intervals.postInterval));

  // Step 5: Finalize referral
  const referralBody = [userId];
  const referralHeaders = {
    ...config.headers.referralPost,
    cookie: `__Host-authjs.csrf-token=${config.csrfToken}|edb59eec1bac2ba5e4ff682549f6f2b7faf01bc3fa35481876a22628be8262ee; __Secure-authjs.callback-url=https%3A%2F%2Fclub.hello.one%2Freferral; __Secure-authjs.session-token=${sessionToken}`,
  };
  await axios.post('https://club.hello.one/referral', referralBody, {
    headers: referralHeaders,
    httpsAgent: proxyAgent,
    maxRedirects: 0,
  });
  console.log(chalk.green('✔️ Referral action completed!'));

  await clearOtpFile();
  console.log(chalk.blue(`🎉 Referral for ${email} completed!`));
}

// Main function
async function main() {
  console.log(chalk.bold.magenta('🚀 Starting Referral Script 🚀'));

  // Interactive prompt
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useProxy',
      message: 'Would you like to use a proxy?',
      default: false,
    },
    {
      type: 'number',
      name: 'referralCount',
      message: 'How many referrals would you like to create?',
      default: 1,
      validate: input => input > 0 ? true : 'Please enter a number greater than 0',
    },
  ]);

  const { useProxy, referralCount } = answers;

  // Read proxies if needed
  let proxies = [];
  if (useProxy) {
    proxies = await readProxies();
    if (!proxies.length) {
      console.log(chalk.red('❌ No proxies found in proxy.txt, proceeding without proxy'));
    } else {
      console.log(chalk.gray(`📡 Using ${proxies.length} proxies from proxy.txt`));
    }
  }

  // Read emails
  const emails = await readEmails();
  if (!emails.length) {
    console.log(chalk.red('❌ No emails found in mailbody.txt'));
    return;
  }

  // Process referrals
  for (let i = 0; i < referralCount; i++) {
    console.log(chalk.bold.yellow(`\n🔄 Referral ${i + 1} of ${referralCount}`));
    const baseEmail = emails[Math.floor(Math.random() * emails.length)];
    const proxyUrl = useProxy ? getRandomProxy(proxies) : null;
    let proxyAgent = null;

    if (proxyUrl) {
      try {
        proxyAgent = createProxyAgent(proxyUrl);
        console.log(chalk.gray(`🌐 Using proxy: ${proxyUrl}`));
      } catch (error) {
        console.log(chalk.red(`❌ Failed to use proxy ${proxyUrl}: ${error.message}`));
      }
    }

    try {
      await processReferral(baseEmail, proxyAgent);
    } catch (error) {
      console.log(chalk.red(`❌ Failed to process referral: ${error.message}`));
    }
  }

  console.log(chalk.bold.magenta('\n🎉 All referrals completed!'));
}

// Run the script
main().catch(error => console.error(chalk.red('❌ Main error:', error.message)));
