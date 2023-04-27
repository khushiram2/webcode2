import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv"
const app = express();
app.use(express.json())
app.use(cors())
dotenv.config()
const port= process.env.port


async function createConnection() {
    const client = new MongoClient(process.env.url)
    await client.connect()
    console.log("mongo connected")
    return client
};

const client = await createConnection();


//amazon scraping
//  async function start(){
// const browser = await puppeteer.launch()
// const page = await browser.newPage()
// await page.goto("https://www.amazon.in/deal/a7a40511?showVariations=true&pf_rd_r=PWJM7KRYA9ZM822QWB46&pf_rd_t=PageFrameworkApplication&pf_rd_i=14142561031&pf_rd_p=3fc9338c-e131-4447-a4af-6fc18ae33769&pf_rd_s=mobile-hybrid-3&ref=dlx_14142_sh_dcl_img_0_a7a40511_mw_mohy3_69")
// const price = await page.evaluate(()=>{
//     return Array.from(document.querySelectorAll(".a-price-whole")).map((e)=> e.textContent)

// })
// const title = await page.evaluate(()=>{
//     return Array.from(document.querySelectorAll(".octopus-dlp-asin-title")).map((e)=> e.textContent)

// })
// const imglink = await page.evaluate(()=>{
//     return Array.from(document.querySelectorAll(".octopus-dlp-asin-image")).map((e)=> e.src)

// })
//  const pricearr=[price.join(",")]
//  const titlearr = [title.join(" , ")]
//  const srcarr = [imglink.join(" , ")]
//  const finalpricearr=pricearr.toString().split(".")
//  const finaltitle=titlearr.toString().split(" , ")
//  const finalsrc=srcarr.toString().split(" , ")
//  let productDetails= finalpricearr.map((e,i)=>{
//     return {
//         title:finaltitle[i],
//         price:e,
//         src:finalsrc[i]
//     }

//  })
//  console.log(productDetails)
//   await browser.close()
// }

//  start()
app.post("/trigger", async (req,res)=>{
try{
await start2()
await start3()
res.send({message:"triggered"})
}catch(e){console.log(e)

}
})

// flipcart scrapping
async function start2() {
   try{ const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto("https://www.flipkart.com/televisions/pr?sid=ckf%2Cczl&p%5B%5D=facets.brand%255B%255D%3DMi&otracker=categorytree&p%5B%5D=facets.serviceability%5B%5D%3Dtrue&p%5B%5D=facets.availability%255B%255D%3DExclude%2BOut%2Bof%2BStock&otracker=nmenu_sub_TVs%20%26%20Appliances_0_Mi")
    const price = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("._30jeq3")).map((e) => e.textContent)

    })
    const title = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("._4rR01T")).map((e) => e.textContent)

    })
    const imglink = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("._396cs4")).map((e) => e.src)

    })
    const rating = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("._3LWZlK")).map((e) => e.textContent)

    })
    const realprice = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("._3I9_wc")).map((e) => e.textContent)

    })


    const pricearr = [price.join(" , ")]
    const titlearr = [title.join(",")]
    const srcarr = [imglink.join(",")]
    const ratingarr = [rating.join(" , ")]
    const realpricearr = [realprice.join(" , ")]
    const finalpricearr = pricearr.toString().split(" , ")
    const finaltitle = titlearr.toString().split(",")
    const finalsrc = srcarr.toString().split(",")
    const finalrating = ratingarr.toString().split(" , ")
    const finalrealprice = realpricearr.toString().split(" , ")
    let productDetails = finalpricearr.map((e, i) => {
        return {
            title: finaltitle[i],
            price: e,
            src: finalsrc[i],
            realprice: finalrealprice[i],
            rating: finalrating[i]
        }

    })
    let querry=[]
    for(let i=0;i<productDetails.length;i++){
        querry.push({
            updateOne:{
                filter:{
                    title:productDetails[i].title
                },
                update:{
                    $set:{...productDetails[i]}
                },
                upsert:true
            }
        })
    }
    await client
        .db("webcode")
        .collection("flipcart")
        .bulkWrite(querry)

    await browser.close()}
    catch(err){console.log(err)

    }

}

app.get("/flipcart", async (req, res) => {
    try{ const sendingproductdata = await client
         .db("webcode")
         .collection("flipcart")
         .find({})
         .toArray()
     res.send(sendingproductdata)}
     catch(e){console.log(e)

     }
 })


// snapdeal scrapping
async function start3() {
    try{const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto("https://www.snapdeal.com/products/electronics-bluetooth-speakers?sort=plrty")
    const price = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".product-price")).map((e) => e.textContent)

    })
    const title = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".product-title")).map((e) => e.textContent)

    })
    const imglink = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".product-image")).map((e) => (e.src) ? e.src : e.srcset)

    })
    const realprice = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".product-desc-price")).map((e) => e.textContent)

    })



    const pricearr = [price.join(" , ")]
    const titlearr = [title.join("  ,  ")]
    const srcarr = [imglink.join(",")]
    const realpricearr = [realprice.join(" , ")]
    const finalpricearr = pricearr.toString().split(" , ")
    const finaltitle = titlearr.toString().split("  ,  ")
    const finalsrc = srcarr.toString().split(",")
    const finalrealprice = realpricearr.toString().split(" , ")
    let productDetails = finalpricearr.map((e, i) => {
        return {
            title: finaltitle[i],
            price: e,
            realprice: finalrealprice[i],
            src: finalsrc[i]
        }

    })

    // const check = await client
    //     .db("webcode")
    //     .collection("snapdeal")
    //     .find({})
    //     .toArray()
    // if (check.length == 0) {
        let querry=[]
        for(let i=0;i<productDetails.length;i++){
            querry.push({
                updateOne:{
                    filter:{
                        title:productDetails[i].title
                    },
                    update:{
                        $set:{...productDetails[i]}
                    },
                    upsert:true
                }
            })
        }
        await client
            .db("webcode")
            .collection("snapdeal")
            .bulkWrite(querry)
   



    await browser.close()}
    catch(err){console.log(err)

    }
}

app.get("/snapdeal", async (req, res) => {
    try{  const sendingproductdata = await client
          .db("webcode")
          .collection("snapdeal")
          .find({})
          .toArray()
      res.send(sendingproductdata)
  }
      catch(err){console.log(err)
      }
  })

// refreshing it after 24hrs  


app.listen(port, () => console.log("server started on", port))