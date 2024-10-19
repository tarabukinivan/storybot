# storybot
Install

```
sudo apt update && sudo apt install -y jq nodejs npm && sudo npm install pm2 -g && pm2 update
cd
git clone https://github.com/tarabukinivan/storybot
cd storybot
npm i
```

fill in the .env file

```
cp .env.conf .env
nano .env
```

Example:

```
BOT_TOKEN=<TELEGRAM_TOKEN>
CHATID=<chat_id>
BIN=story
VALOPER=storyvaloper1x9c7xr8x4du2e926cgztthaq8cydnvcvvypesa
RPC=<your_rpc>
STORY_API=https://api.testnet.storyscan.app
RENDER=5
SERVICE_NAME=story-testnet.service
```

Run

```
pm2 start index.js
```

Video instruction https://youtu.be/dLL5FUvFi28
