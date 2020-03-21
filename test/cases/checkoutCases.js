// how to run
// npm test chrome .\test\cases\checkoutCases.js 
import { Selector } from 'testcafe'
import myEnv from "../../env.json"

console.log(myEnv.PROXY_AUTHNAME,myEnv.PROXY_AUTHPASS)
fixture('Woobiz Web Apps')
    .page('https://dev.woobiz.id')
    .httpAuth({
        username:myEnv.PROXY_AUTHNAME,
        password:myEnv.PROXY_AUTHPASS
        // username:"woobiz",
        // password:"*woobiz2020*"
    })

class ScreenOnBoarding{
    constructor(){
        this.btnMasuk = Selector('button > span').withText('MASUK')
    }
}   

class ScreenToken{
    constructor(){
        this.inputTelephone = Selector('input.form-control[type="tel"]')
        this.btnLanjut = Selector('button[type="button"]').withText("LANJUT")
        this.otpInput = Selector('input.otp-control[type="tel"]')
        this.otpBtnKonfirmasi = Selector('button').withText('KONFIRMASI OTP')
    }
}

class ScreenDashboard{
    constructor(){
        this.iconCategories = Selector('.pb-3.col-3 > div > div')
        this.iconCategoriesSticky = Selector(".sticky-category-item > div")
    }
}

class ScreenProductList{
    constructor(){
        this.productImageBySku = Selector(".card.border-0.mb-3 > img.card-img-top[src*='W091S000007']")
        this.productLabel = Selector(".card.border-0.mb-3 > div > div > div > div > span")
    }
}

class ScreenProductDetail{
    constructor(){
        this.btnPesanSetSticky = Selector(".product-card.sticky button.btn.btn-primary > span").withText("Pesan Set")
        this.btnAddSet = Selector(".ReactSwipeableBottomSheet--open .nis-operator").withText("+")
        this.btnRemSet = Selector(".ReactSwipeableBottomSheet--open .nis-operator").withText("-")
        this.inputQtySet = Selector(".ReactSwipeableBottomSheet--open .nis-input")
        this.btnOrderLanjut = Selector(".ReactSwipeableBottomSheet--open .single-order-button").withText("LANJUT")
        this.btnCartSticky = Selector(".product-card.sticky .button-action-cart")
    }
}

class ScreenCart{
    constructor(){
        this.checkboxPilihSemua = Selector(".container-checkbox").withText("Pilih Semua")
        this.btnLanjut = Selector("button span").withText("LANJUT")
        this.modalConfirmLanjut = Selector(".ant-modal-body span").withText("LANJUT")
    }
}

class ScreenCheckout{
    constructor(){
        this.btnPilihMetodeBayar = Selector("button span").withText("Pilih Metode Bayar")
        this.pembayaranDenganVirtualAccount = Selector(".ant-col span").withText("Dengan Metode Virtual Account")
        this.ubahMethodPembayaran = Selector("button").withText("Ubah Metode")
        this.pilihVirtualAccountBNI = Selector(".ReactSwipeableBottomSheet--open span").withText("Virtual Account BNI")
        this.pilihVirualAccountCIMB = Selector(".ReactSwipeableBottomSheet--open span").withText("Virtual Account CIMB Niaga")
        this.pilihBankLanjutkan = Selector(".ReactSwipeableBottomSheet--open button.buy-now").withText("Pilih")
        this.btnLanjut = Selector("button span").withText("LANJUT")
    }
}

class ScreenAturMargin{
    constructor(){
        this.btnSelesaikanPesanan = Selector("button span").withText("SELESAIKAN PESANAN")
        this.modalSelesaikanPemesanan = Selector(".ant-modal-body span").withText("BAYAR")
    }
}

class ScreenPembayaran{
    constructor(){
        this.btnKembaliKeCatalog = Selector("button span").withText("KEMBALI KE KATALOG")
    }
}

const screenOnBoarding = new ScreenOnBoarding()
const screenToken = new ScreenToken()
const screenDashboard = new ScreenDashboard()
const screenProductList = new ScreenProductList()
const screenProductDetail = new ScreenProductDetail()
const screenCart = new ScreenCart()
const screenCheckout = new ScreenCheckout()
const screenAturMargin = new ScreenAturMargin()
const screenPembayaran =  new ScreenPembayaran()

test('Positive Checkout Attempt',async(page)=>{
    await page
    .click(screenOnBoarding.btnMasuk)
    
    await page
    .typeText(screenToken.inputTelephone,'81225369537')
    .click(screenToken.btnLanjut)
    
    await page
        .typeText(screenToken.otpInput,'123654')

    await page
        .click(screenDashboard.iconCategories.withText("Ibu & Anak"))
    
   await page.click(screenProductList.productImageBySku)

    await page
        .click(screenProductDetail.btnPesanSetSticky)
        .click(screenProductDetail.btnAddSet)
        .click(screenProductDetail.btnOrderLanjut)
        .click(screenProductDetail.btnCartSticky)
    
    await page
        // .click(screenCart.checkboxPilihSemua)
        .click(screenCart.btnLanjut)
        .click(screenCart.modalConfirmLanjut)
        // .takeScreenshot({
        //     path: 'screenshoots/checkout.png',
        //     fullPage: true
        // })

    let isPilihMethodBayar = await screenCheckout.btnPilihMetodeBayar.exists
    if(isPilihMethodBayar){
        // terjadi apabila tidak ada cart pending
        console.log("- Btn pillih button bayar is exist")
        await page
            .click(screenCheckout.btnPilihMetodeBayar)
            .click(screenCheckout.pembayaranDenganVirtualAccount)
            .click(screenCheckout.pilihVirtualAccountBNI)
            // .takeScreenshot({
            //     path: 'screenshoots/virtualaccountbni1.png',
            //     fullPage: true
            // })
    }else{
        console.log("- Change method pembayaran")
        await page
            .click(screenCheckout.ubahMethodPembayaran)
            .click(screenCheckout.pembayaranDenganVirtualAccount)
            .click(screenCheckout.pilihVirualAccountCIMB)
            // .takeScreenshot({
            //     path: 'screenshoots/changemethods-lanjut.png',
            //     fullPage: true
            // })
    }
    // pilih button dary change method dan 
    await page
        .click(screenCheckout.pilihBankLanjutkan)
        .click(screenCheckout.btnLanjut)

    await page
        .click(screenAturMargin.btnSelesaikanPesanan)
        .click(screenAturMargin.modalSelesaikanPemesanan)
        // .takeScreenshot({
        //     path: 'screenshoots/final-page.png',
        //     fullPage: true
        // })
    
    let btnKembaliKeCatalog = await screenPembayaran.btnKembaliKeCatalog.exists
    await page
        .expect(btnKembaliKeCatalog).eql(true,"Button kembali ke catalog is exist. Checkout success.")
})