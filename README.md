### this project allows to test and analys cloud scheduling algorithms, it focus mainly on MO-LCA


to run the project make sure you have conda, and run the following:
```
git clone https://github.com/ghifarhaidar/cloud-scheduling-using-lca.git
cd cloud-scheduling-using-lca/
conda create -n my -y
conda init
conda activate my
conda install maven nodejs numpy -y
cd backend/ && npm install && cd ..
cd frontend/ && npm install && cd ..
python3 run.py --job 3
```


save your env variable in frontend and backend 

then run npm run start in both backend and frontend folders
