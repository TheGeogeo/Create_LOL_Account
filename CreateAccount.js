const puppeteer = require("puppeteer");
const fs = require('fs');

async function MakeRandomStr(length) {
    var result = '';
    var min = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var maj = 'abcdefghijklmnopqrstuvwxyz';
    var num = '0123456789';
    var minLength = min.length;
    var majLength = maj.length;
    var numLength = num.length;
    if (length > 3) {
        let c = 0
        for (var i = 0; i < length; i++) {
            switch (c) {
                case 0:
                    result += min.charAt(Math.floor(Math.random() * minLength));
                    c++;
                    break;
                case 1:
                    result += num.charAt(Math.floor(Math.random() * numLength));
                    c++;
                    break;
                case 2:
                    result += maj.charAt(Math.floor(Math.random() * majLength));
                    c = 0;
                    break;
            }
        }
    }
    return result;
}

async function GetDate() {
    let today = new Date();
    return today.getDay() + '/' + today.getMonth() + 1 + '/' + today.getFullYear() + '-' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
}

async function WaitPage(page) {
    while (page.url() != "https://signup.euw.leagueoflegends.com/en/signup/download") {
        await new Promise(r => setTimeout(r, 50));
    }
}

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://signup.euw.leagueoflegends.com/en/signup/index#/confirmation");
    await page.goto("https://signup.euw.leagueoflegends.com/en/signup/index#/confirmation");
    await page.waitForXPath("/html/body/div[1]/div[2]/div[2]/button[2]");
    const [buttonCookie] = await page.$x("/html/body/div[1]/div[2]/div[2]/button[2]");
    if (buttonCookie) await buttonCookie.click();

    const mail = await MakeRandomStr(12) + '@gmail.com';
    await page.type("#root > div > div > div.confirmation-component.scene-component.mounted > div.scene-content > form > div:nth-child(1) > div:nth-child(1) > input[type=email]", mail);

    const user = await MakeRandomStr(12);
    await page.type("#root > div > div > div.confirmation-component.scene-component.mounted > div.scene-content > form > div:nth-child(1) > div:nth-child(2) > input[type=text]", user);

    const password = await MakeRandomStr(12);
    await page.type("#root > div > div > div.confirmation-component.scene-component.mounted > div.scene-content > form > div:nth-child(2) > div:nth-child(1) > input[type=password]", password);
    await page.type("#root > div > div > div.confirmation-component.scene-component.mounted > div.scene-content > form > div:nth-child(2) > div:nth-child(2) > input[type=password]", password);

    await page.select('#root > div > div > div.confirmation-component.scene-component.mounted > div.scene-content > form > div.input-group.input-group-legal > div.datepicker-component > div:nth-child(2) > select', '11');
    await page.select('#root > div > div > div.confirmation-component.scene-component.mounted > div.scene-content > form > div.input-group.input-group-legal > div.datepicker-component > div:nth-child(3) > select', '6');
    await page.select('#root > div > div > div.confirmation-component.scene-component.mounted > div.scene-content > form > div.input-group.input-group-legal > div.datepicker-component > div:nth-child(4) > select', '1998');

    await page.evaluate(() => {
        document.querySelector("#tou_agree").parentElement.click();
    });

    const [buttonSend] = await page.$x("/html/body/div[3]/div/div/div[2]/div[1]/form/div[4]/button");
    if (buttonSend) {
        await page.waitForSelector('#root > div > div > div.confirmation-component.scene-component.mounted > div.scene-content > form > div:nth-child(2) > div:nth-child(2) > input[type=password]');
        let element = await page.$('#root > div > div > div.confirmation-component.scene-component.mounted > div.scene-content > form > div:nth-child(2) > div:nth-child(2) > input[type=password]');
        let value = await page.evaluate(el => el.textContent, element);
        if (value == "") await page.type("#root > div > div > div.confirmation-component.scene-component.mounted > div.scene-content > form > div:nth-child(2) > div:nth-child(2) > input[type=password]", password);

        await buttonSend.click();

        await WaitPage(page);

        fs.appendFile('Account_EUW.txt', user + ':' + password + " " + await GetDate() + "\n", function (err) {
            if (err) {
                console.log("erreur réécriture!");
                console.error(err);
            } else {
                console.log("\x1b[32m" + "Account create : " + user + ':' + password + "\x1b[0m");
            }
        });
    } else
        console.log("Account not create, error.");

    await browser.close();

})();