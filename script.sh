NODE_VERSION="v14.15.1"
wget https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz 
tar xvf node-${NODE_VERSION}-linux-x64.tar.xz
chmod +x ./node-${NODE_VERSION}-linux-x64/bin/node
chmod +x ./node-${NODE_VERSION}-linux-x64/bin/npm
export PATH=./node-${NODE_VERSION}-linux-x64/bin:$PATH
./node-${NODE_VERSION}-linux-x64/bin/npm version
./node-${NODE_VERSION}-linux-x64/bin/npm install
./node-${NODE_VERSION}-linux-x64/bin/npm run build

