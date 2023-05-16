### run from contracts directory in order to get .env file vars
forge script \
 --broadcast --rpc-url linea_goerli --optimizer-runs 20 \
 --verify --etherscan-api-key linea_goerli \
 script/ENISHI.s.sol:Deploy