let objs = [];
let groups = new Set();
let fullInfo = [];
let str = ['country','fifa_code','group_id','group_letter','id'];
let strMatches = ['venue','away_team','home_team','location','datetime'];
let strMatchesRes = ['venue','away_team','goals_home_team',
    'goals_away_team','home_team','location','datetime'];


function httpGet(url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function() {
            if (this.status == 200) {
                resolve(this.response);
            } else {
                var error = new Error(this.statusText);
                error.code = this.status;
                reject(error);
            }
        };
        xhr.onerror = function() {
            reject(new Error("Network Error"));
        };
        xhr.send();
    });
}

function drawCheckBoxList() {
    let gr = document.getElementById("dropdown");
    console.log(gr);
    gr.style.display = 'block';
    let ul = document.getElementById("groups");
    if(ul.childNodes.length===1) {
        groups.forEach(next => {
            let nextLi = document.createElement('li');
            let input = document.createElement('input');
            let div = document.createElement('div');
            input.setAttribute("type", "checkbox");
            div.appendChild(input);
            div.appendChild(document.createTextNode(next));
            nextLi.appendChild(div);
            ul.appendChild(nextLi);
        });
    }
}


function groupOver() {
   if(groups.size===0){
       httpGet("https://worldcup.sfg.io/teams/").then(res => {
           objs = JSON.parse(res);
           objs.forEach(obj=>{
               groups.add(obj.group_letter);
           });
       });
   }
   drawCheckBoxList();
}

function getChecked() {
    let toTable = [];
    let index = 0;
    let listCheckBoxes = document.getElementById("groups");
    let div = listCheckBoxes.getElementsByTagName('div');
    let input = listCheckBoxes.getElementsByTagName('input');
    for(let i=0;i<div.length;i++){
        if(input[i].checked===true){
            toTable[index] = div[i].textContent;
            index++;
        }
    }
    return toTable;
}


function getAllInfoAboutToTable(arr) {
    let res = [];
    let index = 0;
    for(let j=0;j<arr.length;j++) {
        objs.forEach(next=>{
            if (next.group_letter == arr[j]) {
                res[index] = next;
                index++;
            }
        });
    }
    return res;
}

function createTable(toTable) {
    let table = document.getElementById('table');
    table.innerHTML = '';
    table.style.display = 'block';
    for(let j=0;j<toTable.length;j++) {
        let tr = document.createElement('tr');
        str.forEach(next=>{
            let td = document.createElement('td');
            td.innerText = toTable[j][next];
            tr.appendChild(td);
        });
        table.appendChild(tr);
    }
}


function createSecondTable(toTable) {
    let table = document.getElementById('secTable');
    table.innerHTML = '';
    table.style.display = 'block';
    let tr = document.createElement('tr');
         for (const k of toTable[0].keys()) {
             let td = document.createElement('td');
             td.innerText = k;
             tr.appendChild(td);
         }
     table.appendChild(tr);

         toTable.forEach(next=>{
             let tr = document.createElement('tr');
             strMatchesRes.forEach(strM=>{
                 let td = document.createElement('td');
                 td.innerText = next.get(strM);
                 tr.appendChild(td);
             });
             table.appendChild(tr);
         });
}

function drawTable() {
   let toTable = getAllInfoAboutToTable(getChecked());
   createTable(toTable);
}

function getInfoAboutMatches(objArr) {
   let res = [];
   let i=0;
   objArr.forEach(next=>{
       let currObj=new Map();
        strMatches.forEach(str=>{
            let isHA = false;

            if(str=='away_team'){
                currObj.set('away_team',next[str]['country']);
                currObj.set('goals_away_team',next[str]['goals']);
                isHA = true;
            }

            if(str=='home_team'){
                currObj.set('home_team',next[str]['country']);
                currObj.set('goals_home_team',next[str]['goals']);
                isHA = true;
            }

            if(str=='datetime'){
                let date = new Date(next['datetime']);
                currObj.set('datetime',date);
                isHA = true;
            }
            if(!isHA) {
                currObj.set(str,next[str]);
            }
        });
       res[i] = currObj;
       i++;
   });
   return res;
}



function drawSecondTable(event) {
    let index = event.target.parentElement.rowIndex;
    let checkedCountries = getAllInfoAboutToTable(getChecked());
    let fifaCode = checkedCountries[index]['fifa_code'];

    if(fullInfo.length===0){
        httpGet("https://worldcup.sfg.io/matches/country?fifa_code="+fifaCode).then(res => {
           let ob =  JSON.parse(res);
           createSecondTable(getInfoAboutMatches(ob));
        });
    }
}