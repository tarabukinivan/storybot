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
```

Run

```
pm2 start index.js
```

```html
<iframe width="560" height="315" src="https://www.youtube.com/embed/dLL5FUvFi28?si=kYW6R-sz99cDlCDS" title="Story bot" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
```
