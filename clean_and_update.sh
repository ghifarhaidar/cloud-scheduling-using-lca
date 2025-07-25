#!/bin/bash
git pull 
rm -rf `find -type d -name checkpoint`
python3 run.py --job 3