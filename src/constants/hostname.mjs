'use server'

import { headers } from "next/headers";

const hostname = async()=>{
const headerList = headers();
const host = (await headerList).get("host") || 'localhost:3000';
const env = process.env.NODE_ENV;
if(env==="development"){
    return `http://${host}`
}else if(host.includes('localhost')){
    return `http://${host}`;
}else if(env==='production'){
    return `https://${host}`
}

}
export default hostname;