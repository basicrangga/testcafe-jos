// how to run
// npm test chrome .\test\cases\wooBizProducts.js 
import { Selector } from 'testcafe'
import myEnv from "../../env.json"
import ExcelWriter from "../helper/excel.js"
import fs from 'fs'

const envType = "DEV"
const env = myEnv[envType]
const fileOutput = "product-list_prod.xlsx"
const backupEvery = 10

fixture(`Woobiz ${envType} Cms Apps`)
    .page(env.CMS_DOMAIN)

class LoginScreen{
    constructor(){
        this.inputEmail = Selector('input#email')
        this.inputPassword = Selector('input#password')
        this.btnMasuk = Selector('button[type="submit"]').withText("Masuk")
    }
}

class DashboardScreen{
    constructor(){
        this.urlProductIndex = `${env.CMS_DOMAIN}/product/index`
        this.paginationLatest = Selector("ul.pagination > li > a").withText("Last")
        this.productRows = Selector("table > tbody > tr")
        this.tdLastPage = Selector("td.text-center").withText("Maaf, Tidak ada data produk untuk ditampilkan")
        this.mapIndexTd = {
            brandOwner:1,
            productName:2,
            productFoto:3,
            productPrice:4,
            productPriceDist:5,
            productStatus:6,
            productAction:7,
        }
    }
    builtPageParams(page){
        return `${env.CMS_DOMAIN}/product/index?page=${page}`
    }
    async asyncGetRowData(indexRow){
        let $row = this.productRows.nth(indexRow)

        let $pcsSelector = $row.find("td").nth(this.mapIndexTd.productPrice).find("span").withText(/pcs/)
        let pcsPrice = await $pcsSelector.count
            pcsPrice = (pcsPrice) ? await $pcsSelector.innerText : "Rp 0 / pcs"

        let $setSelector = $row.find("td").nth(this.mapIndexTd.productPrice).find("span").withText(/Set/)
        let setPrice = await $setSelector.count
            setPrice = (setPrice) ? await $setSelector.innerText : "Rp 0 / Set"

        let sku = await $row.find("td").nth(this.mapIndexTd.productAction).find("a").nth(0).getAttribute("href")
            sku = sku.split("/")
            sku.pop()
            sku = sku.pop()

        return {
            brandOwner:await $row.find("td").nth(this.mapIndexTd.brandOwner).innerText,
            sku:sku,
            productName:await $row.find("td").nth(this.mapIndexTd.productName).innerText,
            productFoto:await $row.find("td").nth(this.mapIndexTd.productFoto).find("img").getAttribute("src"),
            productPricePcs:pcsPrice,
            productPriceSet:setPrice,
            productStatus:await $row.find("td").nth(this.mapIndexTd.productStatus).innerText,
        }
    }
}

const loginScreen = new LoginScreen()
const dashboardScreen = new DashboardScreen()

test('Get Product Attempt',async(page)=>{

    await page
    .typeText(loginScreen.inputEmail,env.CMS_LOGIN_EMAIL)
    .typeText(loginScreen.inputPassword,env.CMS_LOGIN_PASSWORD)
    .click(loginScreen.btnMasuk)

    // await page
    // .navigateTo(dashboardScreen.urlProductIndex)
    // .takeScreenshot({
    //     path: 'cms/dashboard-page.png',
    //     fullPage: true
    // })

    let isLastTdExists = await dashboardScreen.tdLastPage.exists
    let i = 1;
    let productCollection = []
    while(isLastTdExists==false){
        
        await page
        .navigateTo(dashboardScreen.builtPageParams(i))
        let productRowsTotal = await dashboardScreen.productRows.count
        
        isLastTdExists = await dashboardScreen.tdLastPage.exists
        if(isLastTdExists==false){
            let rowIndex = 0
            let rowCollection = []
            while(rowIndex<productRowsTotal){
                let rowValuesMaped = await dashboardScreen.asyncGetRowData(rowIndex)
                
                // productCollection.push(rowValuesMaped)
                rowCollection.push(rowValuesMaped)
                rowIndex++;
            }
            let fileExist = fs.existsSync(fileOutput)

            if(fileExist==false){
                console.log(`Creating file output : ${fileOutput}`)
                await ExcelWriter.createEmptyFileSingleWorkSheet({
                    title:"sheet1",
                    path_file:fileOutput,
                    worksheet:"sheet1",
                    header:Object.keys(rowCollection[0]),
                    content:[]
                })
            }

            console.log(`Updating file output : ${fileOutput}`)
            await ExcelWriter.addWorksheetData({
                path_file:fileOutput,
                rows:rowCollection
            }).then(newFileName=>{
                if(i%backupEvery==0){
                    console.log(`Backing up each ${backupEvery} file output : ${fileOutput}`)
                    fs.copyFileSync(fileOutput,`${newFileName}.bak`)
                }
                fs.renameSync(newFileName,fileOutput)
            })
        }
        i++;
    }
    
})