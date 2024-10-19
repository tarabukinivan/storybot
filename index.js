const TelegramApi = require('node-telegram-bot-api')
require('dotenv').config()
const bot = new TelegramApi(process.env.BOT_TOKEN, {polling: true})
const chatId = process.env.CHATID
const binf = process.env.BIN
const valoper = process.env.VALOPER
const wallet = process.env.WALLET
const render = process.env.RENDER
const servicename = process.env.SERVICE_NAME
const apist = process.env.STORY_API
const cuttext = require('./requests/cuttext.js')
const rpc = process.env.RPC
const shellexe = require('./requests/func.js')
const jsonparse = require('./requests/jsonparse.js')
var sound = true;

bot.setMyCommands([
    {command: '/df', description: 'Hard disk information'},
    {command: '/free', description: 'RAM Information'}, 
    {command: '/status', description: 'node status'},
    {command: '/peers', description: 'number of peers'},
    {command: '/infoval', description: 'Validator Info'},
    {command: '/logs', description: 'Last logs'},
    {command: '/nodeheight', description: 'Node height'},
    {command: '/mute', description: 'disabled monitoring'},
    {command: '/unmute', description: 'enable monitoring'},
    {command: '/storyapiinfo', description: 'Api Info'},
    {command: '/last10blockinfo', description: 'signing info for the last 10 blocks'},
  ])
  
async function sendchat(message){
    await bot.sendMessage(chatId, message)
    .then(() => console.log('RPC Message sent'))
    .catch(err => console.log('Error sending message:', err));
}
async function testrpc(){
    try {
        const commd = `curl -s ${rpc}/status`;
        var nodestatus = shellexe(commd);
        if(!nodestatus){             
             return false
        }
        nodestatus = jsonparse(nodestatus)
        if(nodestatus){
            return nodestatus
        }else{
            return false
        }            
    } catch (e) {  
        console.log('node not configured,\n\n error:  ' + e);
        process.exit(1)
    }
}

async function valinfo(){
    try {
        const commd = `curl -s ${apist}/validators/${valoper}`;
        var apitmp = await shellexe(commd);
        if(!apitmp){             
             return false
        }
        apitmp = jsonparse(apitmp)
        if(apitmp){
            return apitmp
        }else{
            return false
        }
    } catch (e) {  
        console.log('node not configured,\n\n error:  ' + e);
    }
}

async function storyapi(){
    try {
        const commd = `curl -s ${apist}/chain/network`;
        var apitmp = await shellexe(commd);
        if(!apitmp){             
             return false
        }
        apitmp = jsonparse(apitmp)
        if(apitmp){
            return apitmp
        }else{
            return false
        }
    } catch (e) {  
        console.log('node not configured,\n\n error:  ' + e);
    }
}

async function checkheight(){
    const result = await storyapi();
    if(result){
        apiheight=Number(result.latestBlock.height)
        nodeheightq = await nodeheight()
        try{
            dheight = apiheight - Number(nodeheightq)
            if(dheight > 300){
                sendchat(`Your node's height is lagging:  ${String(apiheight)} - ${nodeheightq} = ${dheight}`)
            }
        }catch (e) {  
            console.log('nodeheight not configured,\n\n error:  ' + e);
        }
        
        return apiheight
    }else{
        console.log("api not working")
        return false
    }
}

async function nodeheight(){
    try {
        rpcstatus = await testrpc()
        if(rpcstatus){
            nodeh=rpcstatus.result.sync_info.latest_block_height        
            return nodeh
        }else{
            return false
        }
    } catch (e) {  
        console.log('nodeheight not configured,\n\n error:  ' + e);
    }
}

async function gethpeers(){
    try {
            let tmp = shellexe(`geth --exec "admin.peers" attach ~/.story/geth/iliad/geth.ipc`)
            if(tmp){
                const searchTerm = `enode: "enode://`;
                const matches = tmp.split(searchTerm).length - 1;
                return matches
            }else{
                return false
            }
        } catch (e) {  
        console.log('node not configured,\n\n error:  ' + e);
        process.exit(1)
    }
}

async function peers(){
    try {
            let tmp = shellexe(` curl -s ${rpc}/net_info | jq .result.n_peers | xargs`)
            if(tmp){
                return tmp
            }else{
                return false
            }
        } catch (e) {  
        console.log('node not configured,\n\n error:  ' + e);
        process.exit(1)
    }
}

async function testdata() {
    if(!chatId || !bot.token){
        console.log(`chatid: ${chatId} or BOT_TOKEN: ${bot.token} not filled!`)
        process.exit(1)
    }
    
    rpcstatus = await testrpc()
    console.log(rpcstatus)
    if(!rpcstatus){
        await sendchat('RPC not configured, Please check your RPC and try again.')
        process.exit(1)
    }else{
        //check api
        apistor = await storyapi()
        console.log(apistor)
        if(!apistor){
            sendchat('api doesn\'t work')
        }
    }
    const[signed10,signedtrue,signedfalse]=await checksigned()
    if(!signed10){
        return bot.sendMessage(chatId, "Failed to get latest blocks. Is the Valoper entered correctly? Is the API working?");
    }
    
}

async function checksigned(){
    //signed10
    const signed = shellexe(`curl -s https://api.testnet.storyscan.app/blocks/uptime/${valoper} | jq '.' | head -n 41 | sed '\$s/.$/]/'`);
    console.log(`signed3: ${signed}`)
    const signedpar = jsonparse(signed)
    if(signedpar){
        try {
            const count = signedpar.reduce((acc, item) => {
                if (item.signed) {
                    acc.trueCount += 1;
                } else {
                    acc.falseCount += 1;
                }
                return acc;
            }, { trueCount: 0, falseCount: 0 });
            return[signedpar,count.trueCount,count.falseCount];
        } catch (e) {  
            console.log('error count and signedpar' + e);
            process.exit(1)
        }        
    }else{
        return [false,false,false];
    }
    //счетчик true false
    
}

async function monitor() {
    if(sound){
        //testrpc
        rpcstatus = await testrpc()
        if(!rpcstatus){
            sendchat('RPC not working')
        }
        //peers
        const storyp = await peers();
        const gethp = await gethpeers();
        if(!storyp){
            sendchat('Story has no peers')
        }
        if(!gethp){
            sendchat('Geth has no peers')
        }
        //check height
        checkheight()
        
        const[signed10,signedtrue,signedfalse]=await checksigned()
        if(signed10){
            if(Number(signedfalse) == 10){
                sendchat('last 10 blocks are not signed')
            }
        }else{
            console.log("Ne udalos poluchit poslednie bloki. Valoper zadn pravilno?")
            console.log("Failed to get latest blocks. Is the Valoper entered correctly?")            
        }
        
        console.log(signed10)
    }
}

testdata()
// Запускаем мониторинг, вызывая функцию через setInterval каждые 5000 миллисекунд (5 секунд)

setInterval(monitor, Number(render)*1000);


const start = () => {
    bot.on('message', async msg => {
        const text = msg.text;
        if (text === '/start') {
            console.log("нажат start")
            return bot.sendMessage(chatId, 'Welcome to the Story bot!');
        }
        if (text === '/status') {
            const result = await testrpc();
            const formattedJson = JSON.stringify(result, null, 2);
            return bot.sendMessage(chatId, formattedJson || "Not Data");
            
        }
        if(text === '/df'){      
            let tmp = shellexe('df -h | grep -v \'tmpfs\' | grep -v \'overlay\'')
            return bot.sendMessage(chatId, 'Disk info:\n\n' + cuttext(tmp));
        }
        if(text === '/free'){      
            //let tmp = shellexe(`free -h | awk 'NR==1 {printf "%-8s %-8s %-8s %-8s\n", $1, $2, $3, $6} NR==2 {printf "%-8s %-8s %-8s %-s\n", $1, $2, $3, $6}'`)
            let tmp = shellexe(`free -h | awk 'NR==1 {printf "%-12s %-8s %-8s %-8s\\n", $1, $2, $3, $6} NR==2 {printf "%-8s %-8s %-8s %-s\\n", $1, $2, $3, $6}'`)
            return bot.sendMessage(chatId, 'RAM Information:\n\n' + cuttext(tmp));
        }
        if(text === '/peers'){
            const result = await peers();
            //return bot.sendMessage(chatId, `Story peers: ${result}` || "Not Data");
            const gethres = await gethpeers();
            //const jsonstr = jsonparse(gethres)
            return bot.sendMessage(chatId, `Story peers: ${result}\nGeth peers: ${gethres}` || "Not Data");
        }
        if(text === '/storyapiinfo'){            
            const result = await storyapi();
            if(result){
                console.log(result)
                return bot.sendMessage(chatId, `network: ${result.network}\nlatestBlock: ${result.latestBlock.height}\ntoken denom: ${result.token.denom}\ntoken alias: ${result.token.alias}\nvalidators total: ${result.validators.total}\nvalidators active: ${result.validators.active}` || "Not Data");
            }else{
                console.log("api not working")
                return bot.sendMessage(chatId, 'api doesn\'t work')
            }
            
        }
        if(text === '/nodeheight'){
            const result = await nodeheight()
            if(result){
                return bot.sendMessage(chatId, `${result}` || "Not Data");
            }else{
                console.log("height not working")
                return bot.sendMessage(chatId, 'error height')
            }
        }
        if(text === '/mute'){      
            sound=false
            return bot.sendMessage(chatId, 'notifications are disabled');
        }
  
        if(text === '/unmute'){      
            sound=true
            return bot.sendMessage(chatId, 'notifications enabled');
        }
        if(text === '/last10blockinfo'){
            const[signed10,signedtrue,signedfalse]=await checksigned()
            if(signed10){
                return bot.sendMessage(chatId, JSON.stringify(signed10));
            }else{
                return bot.sendMessage(chatId, "Failed to get latest blocks. Is the Valoper entered correctly? Is the API working?");
            }
            
        }
        if(text === '/infoval'){      
            val = await valinfo();
            console.log(val.consensus_pubkey)
            return bot.sendMessage(chatId, `valoper: ${val.operator_address}\nconsensus_pubkey: type=\"${val.consensus_pubkey.type}\"\nvalue=\"${val.consensus_pubkey.value}\"\nstatus: ${val.status}\ntokens: ${val.tokens}\ncommission:\nrate: ${val.commission.commission_rates.rate}\nmax_rate: ${val.commission.commission_rates.max_rate}\nmax_change_rate: ${val.commission.commission_rates.max_change_rate}\nhexAddress:${val.hexAddress}\naccountAddress: ${val.accountAddress}\ntombstoned: ${val.tombstoned}\neth: ${val.eth}`);
        }
        
        if(text === '/logs'){
            let tmp = shellexe(`journalctl -u ${servicename} -n 30 -o cat | sed -r "s/\x1B\\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]//g"`)
            return bot.sendMessage(chatId, 'Last Logs:\n\n' + cuttext(tmp,true));
        }
        
        return bot.sendMessage(chatId, `Unknown command`)
        
    });
}
start();
