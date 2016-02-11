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

    for(i=0;i<keys.length;i++){
        unordered.push({name:keys[i],val:data[keys[i]]});
    }
    data = _.sortBy(unordered,function(item){
        return -item.val;
    });

    for (i=0;i<unordered.length;i++){
        var el = "<tr><td>"+data[i].name+"</td><td>"+data[i].val+"</td></tr>";
        md.push(el);
    }

    return md;
}

MyMlhDash.prototype.getTags = function(data){
    var md = [];
    for (i=0;i<data.length;i++){
        var cur = data[i];
        cur.school_name = cur.school.name;
        var el = "<tr><td>"+cur.id+"</td><td>"+cur.email+"</td><td>"+cur.first_name+"</td><td>"+cur.last_name+"</td><td>"+cur.major+"</td><td>"+cur.shirt_size+"</td><td>"+cur.dietary_restrictions+"</td><td>"+cur.school_name+"</td></tr>";

        var major_list = cur.major.toLowerCase().replace(/\s/g,"").split(",");
        var cur_size = cur.shirt_size.replace(/\s/g,"");
        var cur_school = cur.school_name.toLowerCase().replace(/\s/g,"");

        for (j=0;j<major_list.length;j++){
            var cur_major = major_list[j];
            if (!this.majors[cur_major]){
                this.majors[cur_major] = 0;
            }
            this.majors[cur_major]++;
        }

        if (!this.sizes[cur_size]){
            this.sizes[cur_size] = 0;
        }

        if (!this.schools[cur_school]){
            this.schools[cur_school] = 0;
        }

        this.sizes[cur_size]++;
        this.schools[cur_school]++;
        md.push(el);
    }

    return md;
}

MyMlhDash.prototype.getMyMLHData = function(){
    var self = this;
    $(".progress").show();
    $(".input-field").hide();
    $.ajax({
        url:"https://my.mlh.io/api/v1/users?client_id="+this.APP_ID+"&secret="+this.SECRET,
        method:"GET",
        dataType:"json",
        success: function(body){
            self.data = body.data;
            self.data = self.sortBy(self.data,'id');

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
        }
    });
}

MyMlhDash.prototype.searchData = function(column,term){
    var matched = [];

    for(i=0;i<this.data.length;i++){
        if (column != "id" && this.data[i][column].search(new RegExp(term.toLowerCase(),"i")) == 0){
            matched.push(this.data[i]);
        }else if(column == "id" && this.data[i][column] == parseInt(term)){
            matched.push(this.data[i]);
        }
    }

    var md = this.getTags(matched);
    this.clusterize.update(md);
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

var delay = (function(){
    var timer = 0;
    return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
    };
})();