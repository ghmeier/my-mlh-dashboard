var MyMlhDash = function(app,secret){
    this.data = {};
    this.schools = {};
    this.sizes = {};
    this.majors = {};
    this.clusterize = null;
    this.schoolCluster = null;
    this.sizeCluster = null;
    this.majorCluster = null;

    this.APP_ID = app;
    this.SECRET = secret;
}

MyMlhDash.prototype.sortRefresh = function(key){
    this.data = this.sortBy(this.data,key);
    var md = this.getTags(this.data);

    this.clusterize.update(md);
}

MyMlhDash.prototype.sortBy = function(data,key){
    return _.sortBy(data,key);
}

MyMlhDash.prototype.getCountTags = function(data){
    var md = [];
    var keys = Object.keys(data);
    var unordered = [];

    for(var i=0;i<keys.length;i++){
        unordered.push({name:keys[i],val:data[keys[i]]});
    }
    data = _.sortBy(unordered,function(item){
        return -item.val;
    });

    for (var i=0;i<unordered.length;i++){
        var el = "<tr><td>"+data[i].name+"</td><td>"+data[i].val+"</td></tr>";
        md.push(el);
    }

    return md;
}

MyMlhDash.prototype.getTags = function(data){
    var md = [];
    console.log(data[0]);
    var keys = Object.keys(data[0]);
    for (var i=0;i<keys.length;i++) {
        if (keys[i]) {
            $("#"+keys[i]).show();
        }
    }
    for (var i=0;i<data.length;i++){
        var cur = data[i];
        if (!cur.school){
            console.log(cur, i);
        }
        cur.school_name = cur.school.name;
        var el = "";

        if (typeof cur.checked_in === "boolean"){
            var checked_in = "<td><input onclick='checkIn(\""+cur.mlh_id+"\")' type='checkbox'  id='"+cur.mlh_id+"'";
            if (cur.checked_in){
                checked_in += "checked";
            }
            checked_in += "/><label style='height:15px;margin-left:0px;padding-left:0px' for='"+cur.mlh_id+"'></label>";
            el += checked_in;
        }
        if (cur.email){
            el += "<td>"+cur.email+"</td>";
        }
        if (cur.first_name){
            el += "<td>"+cur.first_name+"</td>";
        }
        if (cur.last_name){
            el += "<td>"+cur.last_name+"</td>";
        }
        if (cur.major){
           el += "<td>"+cur.major+"</td>";
        }
        if (cur.shirt_size) {
            el += "<td>"+cur.shirt_size+"</td>";
        }
        if (cur.dietary_restrictions) {
            el += "<td>"+cur.dietary_restrictions+"</td>";
        }
        if (cur.school_name){
            el += "<td>"+cur.school_name+"</td>";
        }
        if (cur.phone_number) {
            el += "<td>"+cur.phone_number+"</td>";
        }
        if (cur.github) {
            var uname = cur.github.split("/").pop();
            el += "<td><a href='https://github.com/"+uname+"' target='_blank'>"+uname+"</a></td>";
        }else {
            el += "<td></td>";
        }

        if (cur.resume) {
            el += "<td><a href='"+cur.resume+"' target='_blank'>Resume</a></td>";
        } else {
            el += "<td></td>";
        }
        el += "</tr>";


        if (cur.major){
            var major_list = cur.major.split(",");
            for (var j=0;j<major_list.length;j++){
                var cur_major = major_list[j];
                if (!this.majors[cur_major]){
                    this.majors[cur_major] = 0;
                }
                this.majors[cur_major]++;
            }
        }

        if( cur.shirt_size){
            var cur_size = cur.shirt_size.replace(/\s/g,"");
            if (!this.sizes[cur_size]){
                this.sizes[cur_size] = 0;
            }
            this.sizes[cur_size]++;
        }

        if (cur.school_name){
            var cur_school = cur.school_name;
            if (!this.schools[cur_school]){
                this.schools[cur_school] = 0;
            }
            this.schools[cur_school]++;
        }
        md.push(el);
    }

    return md;
}

MyMlhDash.prototype.getMyMLHData = function(token){
    var self = this;
    var url = "http://hackisu-signup.herokuapp.com/getAllUsers?token="+token;
    if (token === "sponsor") {
        url += "&checked_in=true";
    }
    $(".progress").show();
    $(".input-field").hide();
    //$.get("https://my.mlh.io/api/v1/users?client_id="+this.APP_ID+"&secret="+this.SECRET,function(body){
    $.get(url, function(body) {
        self.data = body.data;
        if (!self.data){
            Materialize.toast('No data Available, try reloading!', 2000)
            return;
        }
        self.data = self.sortBy(self.data,'checked_in').reverse();

        var md = self.getTags(self.data);
        $(".progress").hide();
        $(".input-field").show();

        self.clusterize = new Clusterize({
          rows: md,
          scrollId: 'scrollArea',
          contentId: 'contentArea'
      });

        self.schoolCluster = new Clusterize({
            rows:self.getCountTags(self.schools),
            scrollId:"schoolScroll",
            contentId:"schoolContent"
        });

        self.sizeCluster = new Clusterize({
            rows:self.getCountTags(self.sizes),
            scrollId:"shirtsScroll",
            contentId:"shirtsContent"
        });

        self.majorCluster = new Clusterize({
            rows:self.getCountTags(self.majors),
            scrollId:"majorScroll",
            contentId:"majorContent"
        });

        var rows = self.clusterize.getRowsAmount();
        $("#stats").text(rows);
        var totalSchools = self.schoolCluster.getRowsAmount();
        $("#totalschools").text(totalSchools);
        var totalMajors = self.majorCluster.getRowsAmount();
        $("#totalmajors").text(totalMajors);

        self.initRegistrantsChart();
    });
}

MyMlhDash.prototype.initRegistrantsChart = function(){
    var categories = {};
    for (i=0;i<this.data.length;i++){
        var updated_date = new Date(this.data[i].updated_at);
        var datestring = updated_date.getFullYear()+""+updated_date.getMonth()+""+updated_date.getDate();
        if (!categories[datestring]){
            categories[datestring] = {};
            categories[datestring].val = 0;
            categories[datestring].name = updated_date.getFullYear()+"-"+updated_date.getMonth()+"-"+updated_date.getDate();
        }

        categories[datestring].val++;
    }

    var names = [];
    var vals = [];

    for (i=0;i<Object.keys(categories).length;i++){
        var key = Object.keys(categories)[i];

        names.push(categories[key].name);
        vals.push(categories[key].val);
    }

    $("#chart-container").highcharts({
        chart:{
            type:"line"
        },
        title:{
            text:"Registrants over time"
        },
        xAxis:{
            categories: names
        },
        yAxis:{
            plotLines:[{
                value:0,
                width:1,
                color:'#808080'
            }]
        },
        tooltip:{
            valueSuffix:"users"
        },
        legend:{
            layout:"vertical",
            align: "right",
            verticalAlign: "middle",
            borderWidth:0
        },
        series:[{
            name:"Registrants",
            data:vals
        }]
    });
}

MyMlhDash.prototype.searchData = function(column,term){
    var matched = [];

    for(var i=0;i<this.data.length;i++){
        if (column !== "id" && this.data[i][column].search(new RegExp(term.toLowerCase(),"i")) === 0){
            matched.push(this.data[i]);
        }else if(column === "id" && this.data[i][column] === parseInt(term)){
            matched.push(this.data[i]);
        }
    }

    var md = this.getTags(matched);
    $("#stats").text(matched.length);
    this.matched = matched;
    this.clusterize.update(md);
}

MyMlhDash.prototype.downloadData = function(columns) {
    var text = "";
    var data = this.data;
    if (data.length < 0) {
        return;
    }
    if (this.matched) {
        data = matched;
    }

    text += columns.join(",") + "\n";
    for (var i=0;i<data.length; i++) {
        var obj = data[i];
        for (var j=0;j<columns.length; j++) {
            text += obj[columns[j]] + ",";
        }
        text += "\n";
    }

    var filename = new Date(Date.now()).toLocaleString();
    filename = "mymlh-"+filename;
    download(filename, text);
}

MyMlhDash.prototype.destroyData = function(){
    this.clusterize.destroy(true);
    this.majorCluster.destroy(true);
    this.schoolCluster.destroy(true);
    this.sizeCluster.destroy(true);
    this.majors = {};
    this.schools = {};
    this.sizes = {};
    this.data = {};

    $("#stats").text("");
    $("#totalschools").text("");
    $("#totalmajors").text("");
}

var download = function(name, text) {
    var pom = document.createElement('a');
    pom.setAttribute("href","data:text/csv;charset=utf-8,"+encodeURIComponent(text));
    pom.setAttribute("download",name);
    pom.setAttribute("target","_blank");

    if (document.createEvent){
        var event = document.createEvent("MouseEvents");
        event.initEvent('click',true,true);
        pom.dispatchEvent(event);
    } else {
        pom.click();
    }
};

var checkIn = function(id){
    console.log(id);
    var checked_in = $("#"+id).is(':checked');
    $.ajax({
        url: "http://localhost:5000/checkIn",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({id:id,checked_in:checked_in}),
        success: function(data) {
            console.log(data);
        }
    });
}

var delay = (function(){
    var timer = 0;
    return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
    };
})();

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
