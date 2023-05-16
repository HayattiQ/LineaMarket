### run from contracts directory in order to get .env file vars
forge script \
 --broadcast --rpc-url linea_goerli --optimizer-runs 20 \
 script/LINEA.s.sol:Deploy