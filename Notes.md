# Notes

## How IPFS works?
https://www.youtube.com/watch?v=jONZtXMu03w
https://medium.com/@angellopozo/uploading-an-image-to-ipfs-e1f65f039da4
1. Upload file using IPFS `ipfs add hello.txt`. Then you will get a hash from terminal. 
2. Run `ipfs daemon` to make sure you're "on line". 
3. Get the file using the hash you get from step 1 `http://localhost:8080/ipfs/QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u`. 
   1. Everyone with the hash will be able to see the file (after downloading ipfs). 