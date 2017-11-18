'use strict'
//=================CHECK STATUS================
const checkStatus = (response) => {
    if (response.status === 200) {
        return Promise.resolve(response)
    } else {
        return Promise.reject(
            new Error(response.statusText)
        )
    }
}

//=========== TIME =============
const startTime = () => {
    const today = new Date()
    $("#time").html(`${today.getHours()}:${('0' + today.getMinutes()).slice(-2)}`)
    const t = setTimeout(startTime, 15000)
}

//============ WEATHER==================
const weather = () => $.get('php/weather.php', (text) => $("#weather").empty().append(text))

//============NOTES=====================
const notes = () => $.get('data/notes.txt', (text) => notesdisplay(text))
const saveNotes = (data) => $.get('php/notes.php?data=' + data, (text) => notesdisplay(text))
const notesdisplay = (text) => $("#notes").empty().append(
    `<p>
        <textarea id="notesinput"
            onchange="saveNotes($('#notesinput').val())"
        >${text}</textarea>
    </p>`
)

//============UPC==============
const getUpcData = upc => $.get('php/barcode.php?upc=' + upc,  text => {
    const {
        valid,
        number,
        itemname,
        description,
        reason
    } = JSON.parse(text.substring(0, text.length - 1))
    $("#upcdata").empty().append(`
        <div class="itemlist"  id="data"></div>`)
    if (valid === 'true') {
        $("#data").append(
            `<p> Name: </p>
            <p> <textarea>${itemname} ${description}</textarea></p>
            <p> UPC : </p>
            <p><input  value="${number}" Size="5" ></p>`
        )
    } else {
        $("#data").append(`<h1>${reason}</h1>`)
    }
    $("#upcdata").append('<br>')
})

//=============REBUILD DB===================
const rebuilddb = (lastaction) =>
    db.remove({}, {multi: true}, (err, numRemoved) =>
        $.getJSON('./php/getdata.php', json =>
            db.insert(json,()=>lastaction())))

//=================UPDATE SERVER================
const updatephp = (id, field, value) => {
    const formData = new FormData()
    formData.append('id', id)
    formData.append('field',field)
    formData.append('value',value)
    fetch('php/update.php', {
            headers: {
                'Accept': 'application/json'
            },
            method: "POST",
            body: formData
        })
        .catch(res => $("#result").empty().append("<h1>ERROR</h1>" + res))
}

//=============UPDATE NEDB=================
const update = (id, field, value) => {
    const myid = new RegExp('\\b' + id + '$')
    db.findOne({
        "id": myid
    }, (err, json) => {
        json[field] = value
        if (field === 'name') {
            json['variety'] = ""
        }
        db.update({
            "id": myid
        }, json, () => {
            db.lastaction()
            updatephp(id, field, value)
        })
    })
}

//====================SCAN AN ITEM LABEL ===========
const scanInputForm = () => $('#listheader').empty().append(`
    <p><label for="scan-input">Scan Item</label>
    <input type="text"
        name="scan-input"
        id="scan-input"
        placeholder="scan item tag"
        onchange="scanInput()"
        >
        </p>
        <button  class="btn-primary"onclick="$('#scan-input').val('')" name="add" value="insert">Clear</button>
        <button class="btn-danger" onclick="$('#listheader').html('RESULTS')" name="cancel" value="cancel">Cancel</button>`)

        //========================ScanInput======================
    const scanInput = () =>{
        let input= $("#scan-input").val()
        console.log(input);
        input = input.substring(1,input.length -1)
        console.log(input);
        while(input.substring(0,1)==='0'){
            input = input.substring(1,input.length)
            console.log(input);
        }
        search(input)

    }



//====================INSERT NEW RECORD FORM ===========
const inputform = () => $('#listheader').empty().append(`
<div align="left">
    <p  > Name <input  type="text" name="name" Size="16"></p>
    <p  > Ordercode <input  type="number" name="ordercode" Size="16" ></p>
    <p  > Book <input  type="number" name="book" Size="16"></p>
    <p  > Chk <input  type="text" name="saledate" Size="16"></p>
    <p  > Comments <input  type="text" name="comments" Size="16"></p>
    <p  > Category <input  type="text" name="catagory" Size="16"></p>
    <button  class="btn-primary"onclick="submitForm()" name="add" value="insert">Add</button>
    <button class="btn-danger" onclick="$('#listheader').html('RESULTS')" name="cancel" value="cancel">Cancel</button>
</div>
`)



//==================INSERT NEW RECORD==================
const submitForm = () => {

    const formData = {
        'name': $('input[name=name]').val(),
        'ordercode': $('input[name=ordercode]').val(),
        'book': $('input[name=book]').val(),
        'saledate': $('input[name=saledate]').val(),
        'comments': $('input[name=comments]').val(),
        'catagory': $('input[name=catagory]').val()
    }
    $.ajax({
        type: 'POST',
        url: 'php/insertrecord.php',
        data: formData,
        encode: true,
        success: (err, data) => {
            $("#listheader").html("RESULTS")
            rebuilddb(db.lastaction)

        }
    })
}

//==================DELETE RECORD==================
const deleteform = (id) => {
    if (confirm("Really Delete?") == true) {
        db.remove({
            "id": new RegExp('\\b' + id + '$')
        }, (err, numRemoved)=> {
            fetch('php/delete.php?id=' + id)
            db.lastaction()
        })
    }
}

//================SEARCH=====================
const search = (value) => {
    if (value) $("#txt").val(value)
    if ($("#txt").val() === '' ) {
        getooc()
        return true
    }
    const mysearchvalue = new RegExp($("#txt").val(), 'i');
    const myquery = {
        $or: [{
                "name": mysearchvalue
            },
            {
                "variety": mysearchvalue
            },
            {
                "ordercode": mysearchvalue
            },
            {
                "comments": mysearchvalue
            }
        ]
    }
    db.find(myquery).sort({
        "ooc": 1
    }).exec((err, json) => {
        if (!json[0]) {
            const myval = $("#txt").val()
            $("#txt").val(myval.substring(0, myval.length - 1))
            search()
        }
        displayItem(json)
        $('#info').empty().append('Search')
        db.lastaction = search
    })
}

// ==========================OOC REPORT==================
const getooc = () => {
    db.find({
        "ooc": /-/
    }).sort({
        "ooc": 1
    }).exec((err, json) => {
        let event = {};
        events=[];
        // console.table(json)
        for(const {
            ordercode,
            name,
            ooc
        } of json){
            event={};
            event.title = name;
            event.description = ordercode;

            event.datetime = new Date(ooc);
            events.push(event);

                    // console.table(events)
        }
        $('#calendar').eCalendar({
            weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            firstDayOfWeek: 5,
            events:events});
        displayItem(json)})
    $('#info').empty().append('OOC')
    db.lastaction = getooc
}

// ===================TODO REPORT==========================
const gettodo = () => {
    db.find({
        "saledate": "chk"
    }).sort({
        "ooc": 1
    }).exec((err, json) => {
        if (!json[0]) {
            getooc()
            return true
        }
        displayItem(json)
    })
    $('#info').empty().append('To-Do')
    db.lastaction = gettodo
}

//===================ITEM ARRAY DISPLAY TEMPLATE=====================
// input data = json object
const displayItem = data => {
    const $result = $("#result")
    // **********************   Test for data  **************************
    if (!data) {
        $result.append('<h2>No Data To Display</h2>')
        return true
    }
    $result.empty()
    // **********************   Item variables  **************************
    for(const {
        id,
        ordercode,
        name,
        variety,
        ooc,
        saledate,
        comments
    } of data) {
        const title = `${name} ${variety}`
        const todo = (saledate === 'chk') ? "default" : "chk"
        const buttontext = (saledate === 'chk') ? 'To-Do --' : 'To-Do +'
        // **********************   Item Template  **************************
        $result.append(`<div class="item"  id="${id}" ></div>`)
        $(`#${id}`).append(`
            <div class="itemHeader" >
                    <button
                            class="btn-primary"
                            data-toggle="tooltip"
                            title="Add or Remove from ToDo List"
                            id="todo${id}"
                            onclick="update(${id}, 'saledate','${todo}')"
                            >
                                ${buttontext}
                    </button>
                    <button
                            class="btn-danger"
                            data-toggle="tooltip"
                            title="Delete Item From Database"
                            onclick="deleteform(${id})"
                            >
                                DEL
                    </button>
                <span
                class="expand"
                onclick="$('#expandable-${id}').slideToggle('fast')"
                data-toggle="tooltip"
                title="${(name +" "+ variety)} :: ${ordercode} :: ${ooc}"
                >(${title.substr(0,15)}...${title.substr(-15)}) :: ${ordercode} :: ${ooc}
                </span>
            </div>
            <div id="expandable-${id}" class="expandable">

            <p>
                    <textarea
                        onchange="update(${id},'name', this.value)"
                        name="name"
                        id="name${id}"
                        data-toggle="tooltip"
                        title="Type to change edits are saved automatically"
                        >${name} ${variety}</textarea>
            </p>
            <p> Order Code : </p>
            <p>
                        <input
                                id="ordercode${id}"
                                data-toggle="tooltip"
                                title="Type to change edits are saved automatically"
                                value="${ordercode}"
                                Size="5"
                                onchange="update(${id},'ordercode',this.value)"
                                >
          </p>

          <p>
                      <input
                            id="ooc${id}"
                            type="date"
                            data-toggle="tooltip"
                            title="Type to change edits are saved automatically"
                            value="${ooc}"
                            Size="16"
                            onchange="update(${id},'ooc', this.value)"
                            >
          </p>
          <p> Comments: </p>
          <p>
                        <textarea
                            data-toggle="tooltip" title="Type to change edits are saved automatically"
                            onchange="update(${id},'comments', this.value)"
                            name="comments"
                            id="comments${id}"
                          >${comments}</textarea>
          </p>
          </div>`)
          $result.append(`<br>`)

    }
}

//====================PROGRAM INITIALIZATION=================
const db = new Nedb({
    autoload: true
})
db.lastaction = getooc
rebuilddb(db.lastaction)
var events=[];
$("#txt").keyup(() => search())
startTime()
weather()


notes()
