const http=require('http');
const path=require('path');
const fs=require('fs');
const express=require('express');
const converter=require('data-unit-converter');
let tableData=[]
let fileNameAtoZ=true
let sortFileNameFirstTime=true
const app=express()
const port = process.env.PORT || 8080;
let load_dir="D:/project_5G/video_of_fell_down";

function get_file_status(load_file_dir,fileName){
    return new Promise((resolve,reject)=>{
        fs.stat(load_file_dir+"/"+fileName,(err,stats)=>{
        if(err){
            reject(err)
        }
        else{
            const byte_to_kb=converter(stats.size,'B','KB')
            const fileNameString=fileName;
            const fileSizeString=byte_to_kb.toFixed(2).toString()+'KB';
            const filebirthTimeString=stats.birthtime.toLocaleString('en-GB');
            let fileinformation={fileName:`${fileNameString}`,fileSize:`${fileSizeString}`,fileBirthTime:`${filebirthTimeString}`};
            resolve(fileinformation)
        }
    })

    
    });
}
function store_data_status_in_list(storeData,storeList){
    storeList.push(storeData);
    return storeList;
}

async function load_files_Status(__loadDir,storeList){
    const fileNames=fs.readdirSync(__loadDir);
    for(let i=0;i<fileNames.length;i++){
        const fileStatus=await get_file_status(__loadDir,fileNames[i]);
        const filesStatusList=await store_data_status_in_list(fileStatus,storeList);
    }
}
function table_body_list(_createData){
    let tbody="";
    for(let i=0;i<_createData.length;i++){
        tbody=tbody+`<tr>
        <td>
            <a href="${_createData[i].fileName}">${_createData[i].fileName}</a>
        </td>
        <td align="left">${_createData[i].fileBirthTime}</td>
        <td>${_createData[i].fileSize}</td>
        </tr>`
        
    }
    return tbody;
}
function build_html(Data){
    let header="";
    let body= "";
    let table_thread="";
    let table_body="";
    header=" <title>Document</title>"
    body=" <h1>Index of Video</h1>"
    table_thread='<table width="700" class="table table-sortable" id="fileTable">'+
    '<thead>'+
    '<tr>'+
    '<th>FileName</th>'+
    '<th>FileTime</th>'+
    '<th>size</th>'+
    '</tr>'+
    '<tr><th colspan="5"><hr></th></tr></thead>';
    table_body="<tbody>"
    table_body=table_body+table_body_list(Data);
    body=body+table_thread+table_body;
    return '<!DOCTYPE html>'
    + '<html><head>' + header + '</head><body>' + body + '</body></html>';
}
function store_html_file(store_dir,html){
    const stream=fs.createWriteStream(store_dir);
    stream.once('open',function(fd){
        stream.end(html);
    })
}
(async()=>{
    app.get('/',function(req,res){
            (async()=>{
                tableData=[]
                await load_files_Status(load_dir,tableData);
                html=await build_html(tableData);
                await store_html_file(__dirname+"/home.html",html);
                await res.sendFile(path.join(__dirname,'/home.html'));
            })()
            
        });
    for(let i=0;i<tableData.length;i++){
     app.get(`/${tableData[i].fileName}`,function(req,res){
        let filedir=load_dir+'/'+tableData[i].fileName;
        let name=tableData[i].fileName;
        res.download(filedir,name);
    }); 
    }   
    app.listen(port);
    console.log('Server started at http://localhost:' + port);
})()