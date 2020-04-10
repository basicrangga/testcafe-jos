// how to run
// npm test chrome .\test\cases\wooBizProductDetail.js 
import { Selector } from 'testcafe'
import myEnv from "../../env.json"
import ExcelWriter from "../helper/excel.js"
import fs from 'fs'

const envType = "DEV"
const env = myEnv[envType]
const fileListProduct = "product-list_prod.xlsx" //file to read sku from
const fileOutput = "product-detail_prod.xlsx" // output after read done
const continueOnRow = false
const stopOnRow = false
const backupEvery = 100

fixture(`Woobiz ${envType} Cms Apps - Product Detail`)
    .page(env.CMS_DOMAIN)

class LoginScreen{
    constructor(){
        this.inputEmail = Selector('input#email')
        this.inputPassword = Selector('input#password')
        this.btnMasuk = Selector('button[type="submit"]').withText("Masuk")
    }
}

class DetailProductScreen{
    constructor(){
        this.brandOwner = Selector('#select2-brandowner_id-container')
        this.productName = Selector("input#name")
        this.productStatus = Selector("#select2-status-container")
        this.qtySet = Selector("input#qty_set")
        this.qtyStock = Selector('[name="qty[0]"]')
        this.previewImage = Selector('[id*="pro-img-"]')
        this.variantSku = Selector('label[for="variant_sku"]').parent(0)
        this.variantStatus = Selector('label[for="variant_status"]').parent(0)
        this.sellingPrice = Selector('label[for="is_in_stock"]').parent(0)
        this.commission3Pcs = Selector('[name="comm_3_pcs[0]"]')
        this.commission3Set = Selector('[name="comm_3_set[0]"]')
        this.satuan = {
            sku:this.variantSku.find("input").nth(0),
            status:Selector("[name*='variant_status_pcs[0]']"),
            harga:Selector("[name*='variant_selling_price_pcs[0]']"),
            komisiMitra:this.commission3Pcs,
            msrp:Selector('[name="variant_msrp_pcs[0]"]'),
            distributorPrice:Selector('[name="variant_distributor_price_pcs[0]"]')
        }
        this.set = {
            sku:this.variantSku.find("input").nth(1),
            status:Selector("[name*='variant_status_set[0]']"),
            harga:Selector("[name*='variant_selling_price_set[0]']"),
            komisiMitra:this.commission3Set,
            msrp:Selector('[name="variant_msrp_set[0]"]'),
            distributorPrice:Selector('[name="variant_distributor_price_set[0]"]')
        }

    }
    builtPageUrl(sku){
        return `${env.CMS_DOMAIN}/product/${sku}/edit`
    }
    async asyncGetRowData(indexRow){
        let statusPcs = await this.satuan.status.value
            statusPcs = (statusPcs=="no") ? "Tidak Aktif" : "Aktif"
        let statusSet = await this.set.status.value
            statusSet = (statusSet=="no") ? "Tidak Aktif" : "Aktif"
            
        return {
            brand:await this.brandOwner.innerText,
            skuPcs:await this.satuan.sku.value,
            skuSet:await this.set.sku.value,
            productName:await this.productName.value,
            productStatus:await this.productStatus.innerText,
            qtySet:await this.qtySet.value,
            stock:await this.qtyStock.value,
            jumlahGambar:await this.previewImage.count-1,
            statusPcs:statusPcs,
            statusSet:statusSet,
            hargaPcs:await this.satuan.harga.value,
            hargaSet:await this.set.harga.value,
            komisiMitraSet:await this.set.komisiMitra.value,
            komisiMitraPcs:await this.satuan.komisiMitra.value,
            msrpPcs:await this.satuan.msrp.value,
            msrpSet:await this.set.msrp.value,
            distributorPricePcs: await this.satuan.distributorPrice.value,
            distributorPriceSet: await this.set.distributorPrice.value,
            jumlahVarian:"",
        }
    }
}

const loginScreen = new LoginScreen()
const detailProductScreen = new DetailProductScreen()

test('Get Product Detail Attempt',async(page)=>{

    await page
    .typeText(loginScreen.inputEmail,env.CMS_LOGIN_EMAIL)
    .typeText(loginScreen.inputPassword,env.CMS_LOGIN_PASSWORD)
    .click(loginScreen.btnMasuk)
    
    // let productSkus = [
    //     "W154S000011"
    // ]

    let productSkus = await ExcelWriter.readFileOnSheet({
        path_file:fileListProduct
    }).then(excelRows=>{
        return excelRows.map(row=>{
            return row[2]
        })
    })

    // remove excel header
    productSkus.shift()
    let productLength = productSkus.length

    let startRow = (continueOnRow) ? continueOnRow : 0
    let endRow = (stopOnRow) ? stopOnRow : productLength
    productSkus = productSkus.slice(startRow,endRow)

    for(let i=0;i<productLength;i++){
        let productSku = productSkus[i]

        console.log({
            fetchingIndex:startRow+i,
            fetching:productSku
        })
        if(productSku){
            let fileExist = fs.existsSync(fileOutput)
            let url = detailProductScreen.builtPageUrl(productSku)
            console.log(url)
            await page.navigateTo(url)
            // .takeScreenshot({
            //     path: 'cms/detail-page.png',
            //     fullPage: true
            // })

            let data = await detailProductScreen.asyncGetRowData()
            data.fetchingKey = productSku

            console.log({
                fileExist
            })
            if(fileExist==false){
                console.log(`Creating file output : ${fileOutput}`)
                await ExcelWriter.createEmptyFileSingleWorkSheet({
                    title:"sheet1",
                    path_file:fileOutput,
                    worksheet:"sheet1",
                    header:Object.keys(data),
                    content:[
                        data
                    ]
                })
            }else{
                if(i%backupEvery==0){
                    console.log(`Backing up each ${backupEvery} file output : ${fileOutput}`)
                    fs.copyFileSync(fileOutput,`${fileOutput}-${startRow+i}.bak`)
                }
                
                console.log(`Updating file output : ${fileOutput}`)
                await ExcelWriter.addWorksheetData({
                    path_file:fileOutput,
                    rows:[
                        data
                    ]
                }).then(newFileName=>{
                    fs.renameSync(newFileName,fileOutput)
                })

                // backup on last process
                if(i==productLength-1){
                    console.log(`Backing up end processing file output : ${fileOutput}`)
                    fs.copyFileSync(fileOutput,`${fileOutput}-${startRow+i}.bak`)
                }
            }

        }
    }
    
})